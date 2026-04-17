import path from "path";

export const PORT = process.env.PORT || 3001;
export const WORKSPACES_DIR = process.env.WORKSPACES_DIR || path.join(__dirname, "..", "..", "..", "workspaces");

// Permissive CORS origins to ensure cloud deployments work across different subdomains (Vercel + AWS)
export const CORS_ORIGINS = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(",")
    : [
        "http://localhost:3000", 
        "http://localhost:3001", 
        "https://stackspace-next.vercel.app",
        "https://stackspace.live",
        "https://www.stackspace.live"
      ];
