import path from "path";
import fs from "fs";
import { StackTemplate } from "@/templates/stacks";

/**
 * Get repository root path
 * In Next.js, process.cwd() points to apps/web
 */
export function getRepoRoot(): string {
  return path.resolve(process.cwd(), "..", "..");
}

/**
 * Get workspace base directory
 */
export function getWorkspaceBase(): string {
  return path.join(getRepoRoot(), "workspaces");
}

/**
 * Get workspace path for a room
 */
export function getWorkspacePath(roomId: string): string {
  return path.join(getWorkspaceBase(), roomId);
}

/**
 * Ensure workspace directory exists
 */
export function ensureWorkspace(roomId: string): string {
  const workspacePath = getWorkspacePath(roomId);

  if (!fs.existsSync(workspacePath)) {
    fs.mkdirSync(workspacePath, { recursive: true });
  }

  return workspacePath;
}

/**
 * Write template files for a stack
 */
export function writeTemplateFiles(roomId: string, stack: StackTemplate): void {
  const workspacePath = getWorkspacePath(roomId);

  // Create all files from template
  for (const [filePath, content] of Object.entries(stack.files)) {
    const fullPath = path.join(workspacePath, filePath);

    // Create directory if needed
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write file
    fs.writeFileSync(fullPath, content);
  }

  console.log(`✓ Template files created for ${stack.name}`);
}

/**
 * Write starter file based on language
 */
export function writeStarterFiles(roomId: string, language: string): void {
  const workspacePath = getWorkspacePath(roomId);

  let filename: string;
  let content: string;

  switch (language.toLowerCase()) {
    case "python":
      filename = "main.py";
      content = `# Welcome to CollabCode!\n# Start coding here...\n\nprint("Hello from CollabCode!")\n`;
      break;
    case "javascript":
    case "js":
      filename = "main.js";
      content = `// Welcome to CollabCode!\n// Start coding here...\n\nconsole.log("Hello from CollabCode!");\n`;
      break;
    case "java":
      filename = "Main.java";
      content = `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from CollabCode!");\n    }\n}\n`;
      break;
    default:
      filename = "README.md";
      content = `# Welcome to CollabCode!\n\nStart coding in your preferred language.\n`;
  }

  const filePath = path.join(workspacePath, filename);
  fs.writeFileSync(filePath, content);
}

/**
 * Write VS Code settings for auto-save
 */
export function writeVSCodeSettings(roomId: string): void {
  const workspacePath = getWorkspacePath(roomId);
  const vscodePath = path.join(workspacePath, ".vscode");

  if (!fs.existsSync(vscodePath)) {
    fs.mkdirSync(vscodePath, { recursive: true });
  }

  const settingsPath = path.join(vscodePath, "settings.json");
  const settings = {
    "files.autoSave": "afterDelay",
    "files.autoSaveDelay": 500,
    "workbench.colorTheme": "Default Dark Modern"
  };

  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
}

/**
 * Delete workspace directory (for rollback on error)
 */
export function deleteWorkspace(roomId: string): void {
  const workspacePath = getWorkspacePath(roomId);

  if (fs.existsSync(workspacePath)) {
    fs.rmSync(workspacePath, { recursive: true, force: true });
  }
}
