import { Client, Account } from "node-appwrite";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export async function createSessionClient(request?: NextRequest) {
    const client = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "")
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "");

    // 1. Check for JWT in headers (Preferred for Cross-Domain/Cloud)
    const jwt = request?.headers.get("x-appwrite-jwt");

    if (jwt) {
        client.setJWT(jwt);
        return {
            get account() { return new Account(client); },
            isAuthenticated: true
        };
    }

    // 2. Fallback: Try to get session from cookies
    const cookieStore = await cookies();
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "";
    const sessionCookieName = `a_session_${projectId.toLowerCase()}`;

    const allCookies = cookieStore.getAll();
    let sessionCookie = cookieStore.get(sessionCookieName);

    // Fallback: Find any cookie starting with a_session_ and containing the project ID (case insensitive)
    if (!sessionCookie) {
        sessionCookie = allCookies.find(c =>
            c.name.startsWith('a_session_') &&
            c.name.toLowerCase().includes(projectId.toLowerCase())
        );
    }

    // Fallback 2: Find ANY a_session_ cookie (risky if multiple projects, but fine for local dev)
    if (!sessionCookie) {
        sessionCookie = allCookies.find(c => c.name.startsWith('a_session_'));
    }

    if (sessionCookie) {
        client.setSession(sessionCookie.value);
    } else {
        return { account: new Account(client), isAuthenticated: false };
    }

    return {
        get account() {
            return new Account(client);
        },
        isAuthenticated: true
    };
}
