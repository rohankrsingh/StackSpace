import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";

const execAsync = promisify(exec);

const WORKSPACES_DIR = path.join(process.cwd(), "..", "..", "workspaces");
const PORT_RANGE_START = 4000;
const PORT_RANGE_END = 6000;
const OPENVSCODE_IMAGE = "gitpod/openvscode-server:latest";

// Track allocated ports to avoid conflicts
const allocatedPorts = new Set<number>();

export async function getNextAvailablePort(): Promise<number> {
  // Get list of ports currently in use by docker containers
  let usedPorts = new Set<number>();
  
  try {
    const { stdout } = await execAsync(
      `docker ps --format '{{.Ports}}' | grep -oP '\\d+(?=->3000)' || true`
    );
    stdout
      .trim()
      .split("\n")
      .filter(Boolean)
      .forEach((port) => {
        const p = parseInt(port);
        if (!isNaN(p)) usedPorts.add(p);
      });
  } catch {
    // If docker command fails, continue with empty set
  }

  // Find first available port
  for (let port = PORT_RANGE_START; port <= PORT_RANGE_END; port++) {
    if (!usedPorts.has(port)) {
      return port;
    }
  }
  throw new Error("No available ports in range 4000-6000");
}

export async function createWorkspaceDirectory(roomId: string): Promise<string> {
  const workspacePath = path.join(WORKSPACES_DIR, roomId);

  if (!fs.existsSync(WORKSPACES_DIR)) {
    fs.mkdirSync(WORKSPACES_DIR, { recursive: true });
  }

  if (!fs.existsSync(workspacePath)) {
    fs.mkdirSync(workspacePath, { recursive: true });

    // Create starter file
    const mainPyPath = path.join(workspacePath, "main.py");
    fs.writeFileSync(
      mainPyPath,
      `# Welcome to CollabCode!\n# Start coding here...\n\nprint("Hello from CollabCode!")\n`
    );

    // Create .vscode settings
    const vscodeDirPath = path.join(workspacePath, ".vscode");
    if (!fs.existsSync(vscodeDirPath)) {
      fs.mkdirSync(vscodeDirPath, { recursive: true });
    }

    const settingsPath = path.join(vscodeDirPath, "settings.json");
    fs.writeFileSync(
      settingsPath,
      JSON.stringify(
        {
          "files.autoSave": "afterDelay",
          "files.autoSaveDelay": 500,
        },
        null,
        2
      )
    );
  }

  return workspacePath;
}

export async function startContainer(
  roomId: string,
  port: number,
  workspacePath: string
): Promise<{ containerName: string }> {
  const containerName = `ovscode-${roomId}`;
  const absolutePath = path.resolve(workspacePath);

  const cmd = `docker run -d \
    --name ${containerName} \
    -p ${port}:3000 \
    -v ${absolutePath}:/home/workspace \
    -e OPENVSCODE_USER_DATA_DIR=/home/workspace/.openvscode-data \
    ${OPENVSCODE_IMAGE} \
    --host 0.0.0.0 --port 3000`;

  try {
    const { stdout } = await execAsync(cmd);
    return { containerName };
  } catch (error) {
    throw new Error(`Failed to start container: ${error}`);
  }
}

export async function stopContainer(roomId: string): Promise<void> {
  const containerName = `ovscode-${roomId}`;

  try {
    await execAsync(`docker stop ${containerName} 2>/dev/null || true`);
  } catch (error) {
    console.error(`Failed to stop container: ${error}`);
  }
}

export async function removeContainer(roomId: string): Promise<void> {
  const containerName = `ovscode-${roomId}`;

  try {
    await stopContainer(roomId);
    await execAsync(`docker rm ${containerName} 2>/dev/null || true`);
  } catch (error) {
    console.error(`Failed to remove container: ${error}`);
  }
}

export async function isContainerRunning(roomId: string): Promise<boolean> {
  const containerName = `ovscode-${roomId}`;

  try {
    const { stdout } = await execAsync(
      `docker ps --filter name=${containerName} --filter status=running -q`
    );
    return stdout.trim().length > 0;
  } catch {
    return false;
  }
}

export function getWorkspacePath(roomId: string): string {
  return path.join(WORKSPACES_DIR, roomId);
}

export function getIdeUrl(port: number): string {
  const host = process.env.IDE_HOST || "localhost";
  return `http://${host}:${port}`;
}
