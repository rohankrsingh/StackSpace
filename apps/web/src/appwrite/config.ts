import { Client, Databases, Account, Query } from "appwrite";

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://fra.cloud.appwrite.io/v1")
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "project_id");

const account = new Account(client);
const databases = new Databases(client);

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DB_ID || "database_id";
const ROOMS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_ROOMS_COLLECTION_ID || "rooms";

export { client, account, databases, DATABASE_ID, ROOMS_COLLECTION_ID, Query };
