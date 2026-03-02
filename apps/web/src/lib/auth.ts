import { Client, Account, ID, Databases } from "appwrite";

export const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "")
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "");

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
    const user = await account.get();
    // Transform Appwrite user to match our Redux state format
    return {
      id: user.$id,
      name: user.name,
      email: user.email,
    };
  } catch (error) {
    return null;
  }
}
