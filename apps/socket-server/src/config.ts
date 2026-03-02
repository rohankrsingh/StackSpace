import path from "path";

export const PORT = process.env.PORT || 3001;
export const WORKSPACES_DIR = path.join(__dirname, "..", "..", "..", "workspaces");
export const CORS_ORIGINS = ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"];
