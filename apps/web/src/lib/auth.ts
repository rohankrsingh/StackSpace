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
    console.log(`✓ Browser login successful`);

    // Sync the session to a cookie on our domain
    await fetch("/api/auth/session", {
      method: "POST",
      body: JSON.stringify({ session: session.secret }),
      headers: { "Content-Type": "application/json" }
    });

    return session;
  } catch (error: any) {
    if (error.code === 401 && error.message.includes("Creation of a session is prohibited")) {
      console.log(`✓ Active browser session detected`);
      const existing = await account.getSession("current");

      // Update the server cookie with the existing session
      await fetch("/api/auth/session", {
        method: "POST",
        body: JSON.stringify({ session: existing.secret }),
        headers: { "Content-Type": "application/json" }
      });

      return existing;
    }
    console.error(`✗ Login failed: ${error.message}`);
    throw error;
  }
}

export async function logout() {
  try {
    await account.deleteSession("current");
    // Clear the server cookie
    await fetch("/api/auth/session", { method: "DELETE" });
    console.log(`✓ Logged out successfully`);
  } catch (error) {
    console.error(`✗ Logout failed: ${error}`);
    // Still try to clear the server cookie
    await fetch("/api/auth/session", { method: "DELETE" });
    throw error;
  }
}

export async function getCurrentUser() {
  try {
    // 1. Try to get user from the server proxy
    const response = await fetch("/api/auth/me");

    if (response.ok) {
      return await response.json() as { id: string; name: string; email: string };
    }

    // 2. If 401, check if the browser has an active session
    try {
      const browserSession = await account.getSession("current");
      if (browserSession) {
        console.log(`✓ Browser session found but no server session. Syncing...`);
        // Sync browser session back to the server
        await fetch("/api/auth/session", {
          method: "POST",
          body: JSON.stringify({ session: browserSession.secret }),
          headers: { "Content-Type": "application/json" }
        });
        // Try getting the user profile from the account client directly
        const user = await account.get();
        return { id: user.$id, name: user.name, email: user.email };
      }
    } catch (browserError) {
      // No browser session either
    }
    return null;
  } catch (error) {
    return null;
  }
}
