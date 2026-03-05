import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
    try {
        const { session } = await request.json();
        const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "project_id";
        const cookieName = `a_session_${projectId.toLowerCase()}`;

        const cookieStore = await cookies();

        cookieStore.set(cookieName, session, {
            path: "/",
            httpOnly: true,
            sameSite: "lax",
            secure: true,
            maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE() {
    try {
        const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "project_id";
        const cookieName = `a_session_${projectId.toLowerCase()}`;
        const cookieStore = await cookies();

        cookieStore.delete(cookieName);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
