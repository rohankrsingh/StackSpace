/**
 * AWS ECS Fargate client — called directly from Next.js API routes.
 *
 * Architecture:
 * - Each room gets a room-specific Task Definition that clones the base task def
 *   but injects a per-room EFS Access Point for filesystem isolation.
 * - The container definition is NEVER modified — prebuilt images have the correct
 *   ENTRYPOINT, extensions, and settings already baked in.
 * - The browser connects directly to https://ip-x-x-x-x.stackspace.live (Cloudflare wildcard)
 */

import {
    ECSClient,
    RunTaskCommand,
    StopTaskCommand,
    DescribeTasksCommand,
    DescribeTaskDefinitionCommand,
    RegisterTaskDefinitionCommand,
    Task,
} from "@aws-sdk/client-ecs";
import { EC2Client, DescribeNetworkInterfacesCommand } from "@aws-sdk/client-ec2";
import { getOrCreateRoomAccessPoint } from "./efs";
import { STACKS, StackTemplate } from "@/templates/stacks";

// ── Config ─────────────────────────────────────────────────────────────────────

const AWS_REGION = process.env.AWS_REGION || "ap-south-1";
const ECS_CLUSTER = process.env.ECS_CLUSTER || "stackspace-cluster";

function getSubnets(): string[] {
    return (process.env.ECS_SUBNETS || "").split(",").map((s) => s.trim()).filter(Boolean);
}
function getSecurityGroup(): string {
    return process.env.ECS_SECURITY_GROUP || "";
}

// Stack ID → base ECS Task Definition family
const STACK_TASK_MAP: Record<string, string> = {
    "python-basic":    "stackspace-python-task",
    "dsa-practice":    "stackspace-python-task",
    "node-basic":      "stackspace-node-task",
    "nodejs-basic":    "stackspace-node-task",
    "react-vite":      "stackspace-node-task",
    "html-css-js":     "stackspace-node-task",
    "next-js":         "stackspace-nextjs-task",
    "nextjs-starter":  "stackspace-nextjs-task",
    "nextjs-basic":    "stackspace-nextjs-task",
    "java-basic":      "stackspace-java-task",
    "cpp-basic":       "stackspace-cpp-task",
};

function resolveTaskDefinition(stackId: string): string {
    return STACK_TASK_MAP[stackId] ?? "stackspace-node-task";
}

// Lazy singleton clients
let _ecs: ECSClient | null = null;
function getEcsClient(): ECSClient {
    if (!_ecs) _ecs = new ECSClient({ region: AWS_REGION });
    return _ecs;
}
let _ec2: EC2Client | null = null;
function getEc2Client(): EC2Client {
    if (!_ec2) _ec2 = new EC2Client({ region: AWS_REGION });
    return _ec2;
}

// ── Public API ─────────────────────────────────────────────────────────────────

export interface EcsTaskResult {
    taskArn: string;
    publicIp: string;
    ideUrl: string;
}

/**
 * Launch a Fargate task for a room. Returns the task ARN and public IP.
 *
 * Flow:
 * 1. Create (or reuse) a room-specific task definition that injects the per-room
 *    EFS access point — container definition is left untouched.
 * 2. Run the task.
 * 3. Wait for RUNNING + public IP.
 * 4. Probe the container directly on its port until the IDE is ready.
 */
export async function ecsRunTask(
    roomId: string,
    stackId: string,
    roomName: string = "workspace"
): Promise<EcsTaskResult> {
    const ecs = getEcsClient();
    const baseTaskDefinitionName = resolveTaskDefinition(stackId);
    const subnets = getSubnets();
    const securityGroup = getSecurityGroup();
    const efsFileSystemId = process.env.EFS_FILE_SYSTEM_ID || "";

    if (subnets.length === 0) throw new Error("ECS_SUBNETS env var is not set");

    console.log(`[ECS] Starting task for room=${roomId} base=${baseTaskDefinitionName}`);

    let activeTaskDefinition = baseTaskDefinitionName;
    const roomTaskFamily = `stackspace-room-${roomId}`;

    // ── Step 1: Create or reuse a room-specific task definition ────────────────
    if (efsFileSystemId) {
        try {
            const { taskDefinition: existingDef } = await ecs.send(
                new DescribeTaskDefinitionCommand({ taskDefinition: roomTaskFamily })
            );
            if (existingDef?.taskDefinitionArn) {
                activeTaskDefinition = existingDef.taskDefinitionArn;
                console.log(`[ECS] Reusing isolated task def: ${activeTaskDefinition}`);
            }
        } catch {
            // Task definition not found — create one
            console.log(`[ECS] Creating EFS Access Point for room ${roomId}...`);
            const accessPointId = await getOrCreateRoomAccessPoint(roomId, efsFileSystemId);

            console.log(`[ECS] Registering room-specific task definition...`);
            const { taskDefinition: baseDef } = await ecs.send(
                new DescribeTaskDefinitionCommand({ taskDefinition: baseTaskDefinitionName })
            );
            if (!baseDef) throw new Error("Base task definition not found");

            // Inject the per-room EFS access point into the volume config.
            const newVolumes = (baseDef.volumes || []).map((v) => {
                if (v.efsVolumeConfiguration) {
                    return {
                        ...v,
                        efsVolumeConfiguration: {
                            ...v.efsVolumeConfiguration,
                            transitEncryption: "ENABLED" as const,
                            authorizationConfig: {
                                accessPointId,
                                iam: "DISABLED" as const,
                            },
                        },
                    };
                }
                return v;
            });

            // ── Sidecar init container for file seeding ──────────────────────
            // Strategy: add a lightweight node:alpine sidecar that seeds template
            // files before the main openvscode container starts. ECS `dependsOn`
            // with condition "COMPLETE" makes the main container wait for it.
            // This avoids ANY entryPoint/command override on the main container
            // (we never touch it — the binary path stays safely baked into the image).
            const efsVolume = (baseDef.volumes || []).find(v => v.efsVolumeConfiguration);
            const efsVolumeName = efsVolume?.name ?? "workspace";

            // Find what path the main container mounts the workspace at
            const mainContainer = (baseDef.containerDefinitions || []).find(c => c.name === "openvscode");
            const workspacePath = mainContainer?.mountPoints?.find(
                mp => mp.sourceVolume === efsVolumeName
            )?.containerPath ?? "/home/workspace";

            // Build the seed script
            const stackTemplate = STACKS.find((s: StackTemplate) => s.id === stackId);
            const stackFiles: Record<string, string> = stackTemplate?.files
                ? JSON.parse(JSON.stringify(stackTemplate.files))
                : {};

            // Personalise package.json with the room name
            const safeProjectName = roomName
                .toLowerCase()
                .replace(/[^a-z0-9-]/g, "-")
                .replace(/^-+|-+$/g, "") || "workspace";
            if (stackFiles["package.json"]) {
                try {
                    const pkg = JSON.parse(stackFiles["package.json"]);
                    pkg.name = safeProjectName;
                    stackFiles["package.json"] = JSON.stringify(pkg, null, 2);
                } catch { /* ignore */ }
            }

            const filesJson = JSON.stringify(stackFiles);
            // Node.js one-liner - seeds files only on first boot (sentinel file)
            const seedScript = [
                `const fs=require('fs'),path=require('path');`,
                `const ws=${JSON.stringify(workspacePath)};`,
                `const sentinel=path.join(ws,'.stackspace-init');`,
                `if(fs.existsSync(sentinel)){console.log('Already seeded');process.exit(0);}`,
                `const files=${filesJson};`,
                `for(const[p,c]of Object.entries(files)){`,
                `  const fp=path.join(ws,p);`,
                `  fs.mkdirSync(path.dirname(fp),{recursive:true});`,
                `  fs.writeFileSync(fp,c);`,
                `}`,
                `fs.mkdirSync(path.join(ws,'.vscode'),{recursive:true});`,
                `fs.writeFileSync(path.join(ws,'.vscode','settings.json'),JSON.stringify({`,
                `  "files.autoSave":"afterDelay","files.autoSaveDelay":500,`,
                `  "workbench.colorTheme":"Default Dark Modern"`,
                `},null,2));`,
                `fs.writeFileSync(sentinel,'');`,
                `console.log('Workspace seeded successfully');`,
            ].join("");

            const initContainer = {
                name: "workspace-init",
                // ECR Public mirror — no auth, available in all regions, Fargate has internet
                image: "public.ecr.aws/docker/library/node:20-alpine",
                essential: false,       // don't fail the task if seeding fails
                command: ["node", "-e", seedScript],
                mountPoints: [{
                    sourceVolume: efsVolumeName,
                    containerPath: workspacePath,
                    readOnly: false,
                }],
                // Minimal resources — this exits in < 2 seconds
                cpu: 128,
                memory: 256,
                logConfiguration: mainContainer?.logConfiguration, // share the same log group
            };

            // Make the main container wait for the init container to finish
            const newContainers = (baseDef.containerDefinitions || []).map((c) => {
                if (c.name === "openvscode") {
                    return {
                        ...c,
                        dependsOn: [{
                            containerName: "workspace-init",
                            condition: "COMPLETE" as const, // wait regardless of exit code
                        }],
                    };
                }
                return c;
            });
            newContainers.push(initContainer as typeof newContainers[0]);

            const { taskDefinition: newDef } = await ecs.send(
                new RegisterTaskDefinitionCommand({
                    family: roomTaskFamily,
                    containerDefinitions: newContainers,
                    volumes: newVolumes,
                    taskRoleArn: baseDef.taskRoleArn,
                    executionRoleArn: baseDef.executionRoleArn,
                    networkMode: baseDef.networkMode,
                    requiresCompatibilities: baseDef.requiresCompatibilities,
                    cpu: baseDef.cpu,
                    memory: baseDef.memory,
                    ephemeralStorage: baseDef.ephemeralStorage,
                })
            );

            activeTaskDefinition = newDef!.taskDefinitionArn!;
            console.log(`[ECS] Created task def with init sidecar: ${activeTaskDefinition}`);
        }
    }

    // ── Step 2: Run the task ───────────────────────────────────────────────────
    const result = await ecs.send(
        new RunTaskCommand({
            cluster: ECS_CLUSTER,
            taskDefinition: activeTaskDefinition,
            launchType: "FARGATE",
            platformVersion: "1.4.0", // Required for EFS support
            count: 1,
            networkConfiguration: {
                awsvpcConfiguration: {
                    subnets,
                    securityGroups: securityGroup ? [securityGroup] : [],
                    assignPublicIp: "ENABLED",
                },
            },
            overrides: {
                containerOverrides: [
                    {
                        name: "openvscode",
                        environment: [
                            { name: "ROOM_ID", value: roomId },
                            { name: "STACK_ID", value: stackId },
                        ],
                    },
                ],
            },
            tags: [
                { key: "stackspace:roomId", value: roomId },
                { key: "stackspace:stackId", value: stackId },
                { key: "stackspace:managed", value: "true" },
            ],
        })
    );

    const failures = result.failures || [];
    if (failures.length > 0) {
        throw new Error(
            `ECS RunTask failed: ${failures.map((f: { arn?: string; reason?: string }) => `${f.arn}: ${f.reason}`).join("; ")}`
        );
    }

    const task = result.tasks?.[0];
    if (!task?.taskArn) throw new Error("ECS RunTask returned no task");

    // ── Step 3: Wait for RUNNING + public IP ──────────────────────────────────
    const publicIp = await waitForTaskRunning(task.taskArn);
    const secureIps = publicIp.replace(/\./g, "-");
    const ideUrl = `https://ip-${secureIps}.stackspace.live`;

    // ── Step 4: Health check — probe the container directly on port 8080 ─────
    // Bypass Cloudflare for the health check (CF returns 521 until server is up).
    // Containers bind to port 8080 regardless of what --port flag is in the task def.
    const directHealthUrl = `http://${publicIp}:8080`;
    console.log(`[ECS] Probing IDE readiness at ${directHealthUrl}...`);
    await waitForIdeReady(directHealthUrl);

    console.log(`[ECS] Room ready: ${task.taskArn} → ${ideUrl}`);
    return { taskArn: task.taskArn, publicIp, ideUrl };
}

/**
 * Stop a running Fargate task (EFS workspace is preserved).
 */
export async function ecsStopTask(taskArn: string): Promise<void> {
    const ecs = getEcsClient();
    try {
        await ecs.send(
            new StopTaskCommand({
                cluster: ECS_CLUSTER,
                task: taskArn,
                reason: "stackspace:orchestrator:stop",
            })
        );
        console.log(`[ECS] Stopped task: ${taskArn}`);
    } catch (e) {
        console.warn(`[ECS] Stop warning for ${taskArn}:`, e);
    }
}

/**
 * Check the current status of a task.
 */
export async function ecsGetTaskStatus(
    taskArn: string
): Promise<{ running: boolean; publicIp: string | null; ideUrl: string | null }> {
    const ecs = getEcsClient();
    try {
        const result = await ecs.send(
            new DescribeTasksCommand({ cluster: ECS_CLUSTER, tasks: [taskArn] })
        );
        const task = result.tasks?.[0];
        if (!task || task.lastStatus === "STOPPED") {
            return { running: false, publicIp: null, ideUrl: null };
        }
        const running = task.lastStatus === "RUNNING";
        const publicIp = running ? await extractPublicIp(task) : null;
        const secureIps = publicIp ? publicIp.replace(/\./g, "-") : "";
        return {
            running,
            publicIp,
            ideUrl: publicIp ? `https://ip-${secureIps}.stackspace.live` : null,
        };
    } catch (e) {
        console.error(`[ECS] DescribeTasks error for ${taskArn}:`, e);
        return { running: false, publicIp: null, ideUrl: null };
    }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Poll the IDE URL until it returns 2xx/3xx.
 *
 * Cloudflare 52x codes (521 = host down, 522 = timeout) mean the VS Code
 * server isn't ready yet — they must be retried, NOT accepted as success.
 * Times out after 120 seconds.
 */
async function waitForIdeReady(
    ideUrl: string,
    timeoutMs = 90_000,
    intervalMs = 3_000
): Promise<void> {
    const deadline = Date.now() + timeoutMs;
    let attempt = 0;
    while (Date.now() < deadline) {
        attempt++;
        try {
            const res = await fetch(ideUrl, { signal: AbortSignal.timeout(8_000) });
            if (res.status >= 200 && res.status < 400) {
                console.log(`[ECS] IDE ready after ${attempt} attempt(s) (HTTP ${res.status})`);
                return;
            }
            console.log(`[ECS] IDE returned HTTP ${res.status} (attempt ${attempt}), retrying...`);
        } catch {
            console.log(`[ECS] IDE not reachable (attempt ${attempt}), retrying in ${intervalMs}ms...`);
        }
        await sleep(intervalMs);
    }
    console.warn(`[ECS] IDE did not become reachable within ${timeoutMs}ms, proceeding`);
}

async function waitForTaskRunning(
    taskArn: string,
    timeoutMs = 120_000,
    intervalMs = 4_000
): Promise<string> {
    const ecs = getEcsClient();
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
        const result = await ecs.send(
            new DescribeTasksCommand({ cluster: ECS_CLUSTER, tasks: [taskArn] })
        );
        const task = result.tasks?.[0];
        const status = task?.lastStatus ?? "UNKNOWN";
        if (status === "RUNNING") {
            const ip = await extractPublicIp(task!);
            if (ip) return ip;
        }
        if (status === "STOPPED" || status === "DEPROVISIONING") {
            throw new Error(`ECS task stopped before RUNNING: ${task?.stoppedReason ?? "unknown"}`);
        }
        console.log(`[ECS] Waiting for task (status=${status})...`);
        await sleep(intervalMs);
    }
    throw new Error(`ECS task ${taskArn} did not reach RUNNING within ${timeoutMs}ms`);
}

async function extractPublicIp(task: Task): Promise<string | null> {
    let networkInterfaceId: string | null = null;
    for (const attachment of task.attachments ?? []) {
        if (attachment.type === "ElasticNetworkInterface") {
            for (const detail of attachment.details ?? []) {
                if (detail.name === "publicIPv4Address" && detail.value) return detail.value;
                if (detail.name === "networkInterfaceId" && detail.value) networkInterfaceId = detail.value;
            }
        }
    }
    if (networkInterfaceId) {
        try {
            const ec2 = getEc2Client();
            const result = await ec2.send(
                new DescribeNetworkInterfacesCommand({ NetworkInterfaceIds: [networkInterfaceId] })
            );
            const publicIp = result.NetworkInterfaces?.[0]?.Association?.PublicIp;
            if (publicIp) return publicIp;
        } catch (e) {
            console.warn(`[ECS] Failed to describe ENI ${networkInterfaceId}:`, e);
        }
    }
    return null;
}

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
