import { Client, Account, ID, Databases } from "appwrite";

export const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://fra.cloud.appwrite.io/v1")
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "project_id");

export const account = new Account(client);
export const databases = new Databases(client);

export async function createAccount(email: string, password: string, name: string) {
  try {
    const user = await account.create(ID.unique(), email, password, name);
    console.log(`✓ Account created`);
    return user;
  } catch (error) {
    console.error(`✗ Failed to create account: ${error}`);
    throw error;
  }
}

export async function login(email: string, password: string) {
  try {
    const session = await account.createEmailPasswordSession(email, password);
    console.log(`✓ Logged in successfully`);
    return session;
  } catch (error) {
    console.error(`✗ Login failed: ${error}`);
    throw error;
  }
}

export async function logout() {
  try {
    await account.deleteSession("current");
    console.log(`✓ Logged out successfully`);
  } catch (error) {
    console.error(`✗ Logout failed: ${error}`);
    throw error;
  }
}

export async function getCurrentUser() {
  try {
    const response = await fetch("/api/auth/me", { credentials: "include" });
    if (!response.ok) return null;
    const user = await response.json();
    return user as { id: string; name: string; email: string };
  } catch (error) {
    return null;
  }
}
