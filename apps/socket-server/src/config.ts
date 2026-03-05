import path from "path";

export const PORT = process.env.PORT || 3001;
// In production, EFS will be mounted at /workspaces
export const WORKSPACES_DIR = process.env.WORKSPACES_DIR || path.join(__dirname, "..", "..", "..", "workspaces");
export const CORS_ORIGINS = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(",")
    : ["http://localhost:3000", "http://localhost:3001", "https://stackspace-next.vercel.app"];
