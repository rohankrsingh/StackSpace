import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const DOCKER_USERNAME = process.env.DOCKER_USERNAME || "rohankrsingh";

const STACK_IMAGES: Record<string, string> = {
  "nodejs-basic": `${DOCKER_USERNAME}/collabcode-openvscode-node:20`,
  "node-basic": `${DOCKER_USERNAME}/collabcode-openvscode-node:20`,
  "react-vite": `${DOCKER_USERNAME}/collabcode-openvscode-node:20`,
  "html-css-js": `${DOCKER_USERNAME}/collabcode-openvscode-node:20`,
  "python-basic": `${DOCKER_USERNAME}/collabcode-openvscode-python:3.12`,
  "dsa-practice": `${DOCKER_USERNAME}/collabcode-openvscode-python:3.12`,
  "next-js": `${DOCKER_USERNAME}/collabcode-openvscode-nextjs:20`,
  "nextjs-starter": `${DOCKER_USERNAME}/collabcode-openvscode-nextjs:20`,
  "java-basic": `${DOCKER_USERNAME}/collabcode-openvscode-java:21`,
  "cpp-basic": `${DOCKER_USERNAME}/collabcode-openvscode-cpp:bookworm`,
};

const DEFAULT_IMAGE = `${DOCKER_USERNAME}/collabcode-openvscode-node:20`;
const PORT_RANGE_START = 4000;
const PORT_RANGE_END = 6000;

export function getImageForStack(stackId: string): string {
  return STACK_IMAGES[stackId] || DEFAULT_IMAGE;
}

export async function getRandomPort(): Promise<number> {
  return Math.floor(Math.random() * (PORT_RANGE_END - PORT_RANGE_START + 1)) + PORT_RANGE_START;
}

export async function startOpenVSCode(
  roomId: string,
  absWorkspacePath: string,
  port: number,
  stackId?: string
): Promise<{ containerName: string; running: boolean }> {
  const containerName = `ovscode-${roomId}`;
  const dockerImage = stackId ? getImageForStack(stackId) : DEFAULT_IMAGE;

  const cmd = `docker run -d \
    --name ${containerName} \
    -p ${port}:3000 \
    -p ${port + 1}-${port + 5}:5173-5177 \
    -p ${port + 6}-${port + 10}:3001-3005 \
    -p ${port + 11}-${port + 15}:8080-8084 \
    -v ${absWorkspacePath}:/home/workspace \
    -e OPENVSCODE_USER_DATA_DIR=/home/workspace/.openvscode-data \
    ${dockerImage} \
    --host 0.0.0.0 --port 3000 --without-connection-token`;

  try {
    await execAsync(cmd);
    console.log(`✓ Container started: ${containerName} on port ${port}`);
    return { containerName, running: true };
  } catch (error) {
    console.error(`✗ Failed to start container: ${error}`);
    throw new Error(`Docker start failed: ${error}`);
  }
}

export async function stopContainer(containerName: string): Promise<void> {
  try {
    await execAsync(`docker stop ${containerName}`);
    console.log(`✓ Container stopped: ${containerName}`);
  } catch (error) {
    console.warn(`⚠ Container stop warning: ${error}`);
  }
}

export async function restartContainer(containerName: string): Promise<void> {
  try {
    await execAsync(`docker start ${containerName}`);
    console.log(`✓ Container restarted: ${containerName}`);
  } catch (error) {
    console.error(`✗ Failed to restart container: ${error}`);
    throw new Error(`Docker restart failed: ${error}`);
  }
}

export async function isContainerRunning(containerName: string): Promise<boolean> {
  try {
    const { stdout } = await execAsync(
      `docker ps --filter "name=${containerName}" --filter "status=running" -q`
    );
    return stdout.trim().length > 0;
  } catch {
    return false;
  }
}

export async function getContainerPort(containerName: string): Promise<number | null> {
  try {
    const { stdout } = await execAsync(
      `docker port ${containerName} 3000 | grep -oP '\\d+(?=:3000)' || echo ""`
    );
    const port = parseInt(stdout.trim());
    return isNaN(port) ? null : port;
  } catch {
    return null;
  }
}

export async function removeContainer(containerName: string): Promise<void> {
  try {
    await stopContainer(containerName);
    await execAsync(`docker rm ${containerName}`);
    console.log(`✓ Container removed: ${containerName}`);
  } catch (error) {
    console.warn(`⚠ Container removal warning: ${error}`);
  }
}
