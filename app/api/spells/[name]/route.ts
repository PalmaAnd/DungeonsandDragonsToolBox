import { NextRequest, NextResponse } from "next/server";
import { getSpellByName } from "@/lib/spells";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ name: string }> }
) {
    const { name } = await params;
    const spell = getSpellByName(decodeURIComponent(name));

    if (!spell) {
        return NextResponse.json(
            { error: "Spell not found" },
            { status: 404 }
        );
    }

    return NextResponse.json(spell);
}
