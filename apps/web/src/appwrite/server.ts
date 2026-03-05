import { Client, Databases, ID } from "node-appwrite";

// Server-side Appwrite client (uses API key)
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || process.env.APPWRITE_ENDPOINT || "https://fra.cloud.appwrite.io/v1")
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || process.env.APPWRITE_PROJECT_ID || "project_id")
  .setKey(process.env.APPWRITE_API_KEY || "");

export const databases = new Databases(client);

export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DB_ID || process.env.APPWRITE_DATABASE_ID || "database_id";

export { ID };
