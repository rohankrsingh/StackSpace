import { NextRequest, NextResponse } from "next/server";
import { createSessionClient } from "@/lib/server-auth";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { account, isAuthenticated } = await createSessionClient(request);

        if (!isAuthenticated) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await account.get();
        return NextResponse.json({
            id: user.$id,
            name: user.name,
            email: user.email,
        });
    } catch (error: any) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}
