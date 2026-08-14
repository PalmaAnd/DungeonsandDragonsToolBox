import spellsData from "@/data/spells.json";

export interface SpellRecord {
    name: string;
    classes: string;
    level: number;
    school: string;
    ritual: boolean;
    castingTime: string;
    range: string;
    components: string;
    material: string;
    duration: string;
    description: string;
}

export type SpellSummary = Omit<SpellRecord, "description" | "material">;

// `description` alone accounts for ~85% of a spell record's size (see
// data/spells.json), so the list view only needs these summary fields;
// the description is fetched on demand when a row is expanded.
export function getSpellSummaries(): SpellSummary[] {
    return (spellsData as SpellRecord[]).map((spell) => ({
        name: spell.name,
        classes: spell.classes,
        level: spell.level,
        school: spell.school,
        ritual: spell.ritual,
        castingTime: spell.castingTime,
        range: spell.range,
        components: spell.components,
        duration: spell.duration,
    }));
}

export function getSpellByName(name: string): SpellRecord | null {
    const spell = (spellsData as SpellRecord[]).find(
        (s) => s.name.toLowerCase() === name.toLowerCase()
    );
    return spell ?? null;
}
