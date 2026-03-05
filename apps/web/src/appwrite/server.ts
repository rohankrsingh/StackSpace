import { Client, Databases, ID } from "node-appwrite";

// Server-side Appwrite client (uses API key)
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "")
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "")
  .setKey(process.env.APPWRITE_API_KEY || "");

export const databases = new Databases(client);

export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DB_ID || process.env.APPWRITE_DATABASE_ID || "";

export { ID };
