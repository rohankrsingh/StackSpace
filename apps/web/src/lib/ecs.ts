/**
 * AWS ECS Fargate client — called directly from Next.js API routes.
 *
 * Fargate tasks run in PUBLIC subnets with assignPublicIp = ENABLED.
 * The browser connects directly to http://<publicIP>:3000 — no ALB needed.
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

// ── Config from environment ────────────────────────────────────────────────────

const AWS_REGION = process.env.AWS_REGION || "ap-south-1";
const ECS_CLUSTER = process.env.ECS_CLUSTER || "stackspace-cluster";

function getSubnets(): string[] {
    return (process.env.ECS_SUBNETS || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
}

function getSecurityGroup(): string {
    return process.env.ECS_SECURITY_GROUP || "";
}

// Stack ID → ECS Task Definition family name (must exist in AWS)
const STACK_TASK_MAP: Record<string, string> = {
    "python-basic": "stackspace-python-task",
    "dsa-practice": "stackspace-python-task",
    "node-basic": "stackspace-node-task",
    "nodejs-basic": "stackspace-node-task",
    "react-vite": "stackspace-node-task",
    "html-css-js": "stackspace-node-task",
    "next-js": "stackspace-nextjs-task",
    "nextjs-starter": "stackspace-nextjs-task",
    "nextjs-basic": "stackspace-nextjs-task",
    "java-basic": "stackspace-java-task",
    "cpp-basic": "stackspace-cpp-task",
};

function resolveTaskDefinition(stackId: string): string {
    const taskDef = STACK_TASK_MAP[stackId];
    if (!taskDef) {
        console.warn(`[ECS] Unknown stackId "${stackId}", defaulting to node task`);
        return "stackspace-node-task";
    }
    return taskDef;
}

// Lazy singleton ECS client (re-used across warm Lambda invocations)
let _ecs: ECSClient | null = null;
function getEcsClient(): ECSClient {
    if (!_ecs) {
        _ecs = new ECSClient({ region: AWS_REGION });
    }
    return _ecs;
}

let _ec2: EC2Client | null = null;
function getEc2Client(): EC2Client {
    if (!_ec2) {
        _ec2 = new EC2Client({ region: AWS_REGION });
    }
    return _ec2;
}

// ── Public helpers ─────────────────────────────────────────────────────────────

export interface EcsTaskResult {
    taskArn: string;
    publicIp: string;
    ideUrl: string;
}

/**
 * Launch a Fargate task for a room and wait until it's RUNNING.
 * Returns the task ARN and public IP for direct browser access.
 */
export async function ecsRunTask(
    roomId: string,
    stackId: string
): Promise<EcsTaskResult> {
    const ecs = getEcsClient();
    const baseTaskDefinitionName = resolveTaskDefinition(stackId);
    const subnets = getSubnets();
    const securityGroup = getSecurityGroup();
    const efsFileSystemId = process.env.EFS_FILE_SYSTEM_ID || "";

    if (subnets.length === 0) {
        throw new Error("ECS_SUBNETS env var is not set");
    }

    console.log(`[ECS] Starting task for room=${roomId} baseDef=${baseTaskDefinitionName}`);

    let activeTaskDefinition = baseTaskDefinitionName;
    const roomTaskFamily = `stackspace-room-${roomId}`;

    // Isolate Storage if EFS is configured
    if (efsFileSystemId) {
        try {
            // First check if an isolated task definition already exists for this room
            const { taskDefinition: existingDef } = await ecs.send(
                new DescribeTaskDefinitionCommand({ taskDefinition: roomTaskFamily })
            );

            if (existingDef && existingDef.taskDefinitionArn) {
                activeTaskDefinition = existingDef.taskDefinitionArn;
                console.log(`[ECS] Reusing isolated Task Definition: ${activeTaskDefinition}`);
            }
        } catch (e) {
            // Not found (or error), proceed to create it
            console.log(`[ECS] Creating EFS Access Point for true filesystem isolation...`);
            const accessPointId = await getOrCreateRoomAccessPoint(roomId, efsFileSystemId);

            console.log(`[ECS] Copying Task Definition to inject Access Point...`);
            const { taskDefinition: baseDef } = await ecs.send(
                new DescribeTaskDefinitionCommand({ taskDefinition: baseTaskDefinitionName })
            );

            if (!baseDef) throw new Error("Base task definition not found");

            // Inject the access point into the EFS volume definition
            const newVolumes = (baseDef.volumes || []).map((v) => {
                if (v.efsVolumeConfiguration) {
                    return {
                        ...v,
                        efsVolumeConfiguration: {
                            ...v.efsVolumeConfiguration,
                            transitEncryption: "ENABLED" as const, // Required for Access Points
                            authorizationConfig: {
                                accessPointId: accessPointId,
                                iam: "DISABLED" as const, // Allow access without custom IAM roles
                            },
                        },
                    };
                }
                return v;
            });

            const { taskDefinition: newDef } = await ecs.send(
                new RegisterTaskDefinitionCommand({
                    family: roomTaskFamily,
                    containerDefinitions: baseDef.containerDefinitions,
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
            console.log(`[ECS] Created isolated Task Definition: ${activeTaskDefinition}`);
        }
    }

    const result = await ecs.send(
        new RunTaskCommand({
            cluster: ECS_CLUSTER,
            taskDefinition: activeTaskDefinition,
            launchType: "FARGATE",
            platformVersion: "1.4.0", // Required for EFS support in Fargate
            count: 1,
            networkConfiguration: {
                awsvpcConfiguration: {
                    subnets,
                    securityGroups: securityGroup ? [securityGroup] : [],
                    assignPublicIp: "ENABLED", // Required for direct browser access
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

    // Wait for RUNNING state and extract public IP
    const publicIp = await waitForTaskRunning(task.taskArn);
    const ideUrl = `http://${publicIp}:3000`;

    console.log(`[ECS] Task running: ${task.taskArn} → ${ideUrl}`);
    return { taskArn: task.taskArn, publicIp, ideUrl };
}

/**
 * Stop a running Fargate task (workspace on EFS is preserved).
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
        // Already stopped tasks throw an exception; swallow gracefully
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
            new DescribeTasksCommand({
                cluster: ECS_CLUSTER,
                tasks: [taskArn],
            })
        );

        const task = result.tasks?.[0];
        if (!task || task.lastStatus === "STOPPED") {
            return { running: false, publicIp: null, ideUrl: null };
        }

        const running = task.lastStatus === "RUNNING";
        const publicIp = running ? await extractPublicIp(task) : null;
        return {
            running,
            publicIp,
            ideUrl: publicIp ? `http://${publicIp}:3000` : null,
        };
    } catch (e) {
        console.error(`[ECS] DescribeTasks error for ${taskArn}:`, e);
        return { running: false, publicIp: null, ideUrl: null };
    }
}

// ── Internal helpers ──────────────────────────────────────────────────────────

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
            const reason = task?.stoppedReason || "unknown";
            throw new Error(`ECS task stopped before RUNNING: ${reason}`);
        }

        console.log(`[ECS] Waiting for ${taskArn} (status=${status})...`);
        await sleep(intervalMs);
    }

    throw new Error(`ECS task ${taskArn} did not reach RUNNING within ${timeoutMs}ms`);
}

async function extractPublicIp(task: Task): Promise<string | null> {
    let networkInterfaceId: string | null = null;
    for (const attachment of task.attachments ?? []) {
        if (attachment.type === "ElasticNetworkInterface") {
            for (const detail of attachment.details ?? []) {
                if (detail.name === "publicIPv4Address" && detail.value) {
                    return detail.value;
                }
                if (detail.name === "networkInterfaceId" && detail.value) {
                    networkInterfaceId = detail.value;
                }
            }
        }
    }

    // If ECS hasn't populated the public IP directly, query EC2 using the ENI ID
    if (networkInterfaceId) {
        try {
            const ec2 = getEc2Client();
            const result = await ec2.send(
                new DescribeNetworkInterfacesCommand({
                    NetworkInterfaceIds: [networkInterfaceId],
                })
            );
            const eni = result.NetworkInterfaces?.[0];
            const publicIp = eni?.Association?.PublicIp;
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
