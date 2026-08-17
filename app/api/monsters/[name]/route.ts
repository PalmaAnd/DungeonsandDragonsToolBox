import { NextRequest, NextResponse } from "next/server";
import { getMonsterByName } from "@/lib/monsters";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ name: string }> }
) {
    const { name } = await params;
    const monster = getMonsterByName(decodeURIComponent(name));

    if (!monster) {
        return NextResponse.json(
            { error: "Monster not found" },
            { status: 404 }
        );
    }

    return NextResponse.json(monster);
}
