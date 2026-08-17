import monstersData from "@/data/monsters.json";

export interface MonsterRecord {
    name: string;
    meta: string;
    "Armor Class": string;
    "Hit Points": string;
    Speed: string;
    STR: string;
    STR_mod: string;
    DEX: string;
    DEX_mod: string;
    CON: string;
    CON_mod: string;
    INT: string;
    INT_mod: string;
    WIS: string;
    WIS_mod: string;
    CHA: string;
    CHA_mod: string;
    "Saving Throws"?: string;
    Skills?: string;
    "Damage Immunities"?: string;
    "Condition Immunities"?: string;
    Senses: string;
    Languages: string;
    Challenge: string;
    Traits: string;
    Actions: string;
    "Legendary Actions"?: string;
    img_url: string;
}

// type/size/alignment aren't in the source data; they're parsed out of
// `meta` (e.g. "Large aberration, lawful evil"), and cr is parsed out of
// Challenge (e.g. "CR 10 (5,900 XP)" -> "10").
export interface MonsterDerivedFields {
    type: string;
    size: string;
    alignment: string;
    cr: string;
}

export type MonsterSummary = Pick<
    MonsterRecord,
    "name" | "meta" | "Challenge" | "img_url"
> &
    MonsterDerivedFields;

export type MonsterDetail = MonsterRecord & MonsterDerivedFields;

function deriveMonsterFields(monster: MonsterRecord): MonsterDerivedFields {
    const [rawSize, rawType, rawAlignment] = monster.meta.split(" ");
    const type = rawType.replace(",", "");
    return {
        size: rawSize,
        type: type.charAt(0).toUpperCase() + type.slice(1),
        alignment: rawAlignment,
        cr: monster.Challenge.replace("CR ", "").split(" (")[0],
    };
}

// Traits/Actions/Legendary Actions make up ~75% of a monster record's size
// (see data/monsters.json), so the list view only needs these summary
// fields; full detail is fetched on demand via getMonsterByName.
export function getMonsterSummaries(): MonsterSummary[] {
    return (monstersData as MonsterRecord[]).map((monster) => ({
        name: monster.name,
        meta: monster.meta,
        Challenge: monster.Challenge,
        img_url: monster.img_url,
        ...deriveMonsterFields(monster),
    }));
}

export function getMonsterByName(name: string): MonsterDetail | null {
    const monster = (monstersData as MonsterRecord[]).find(
        (m) => m.name.toLowerCase() === name.toLowerCase()
    );
    if (!monster) return null;
    return { ...monster, ...deriveMonsterFields(monster) };
}
