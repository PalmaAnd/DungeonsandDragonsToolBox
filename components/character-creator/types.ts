// Shared types (and closely related constants) for the character creator.

export type CharacterData = {
    classes: string[];
    races: string[];
    alignments: string[];
    traits: string[];
};

export type ClassInfo = {
    hitDie: string;
    primaryAbilities: string[];
    savingThrows: string[];
    skillOptions: string[];
    proficiencies: {
        armor: string[];
        weapons: string[];
        tools: string[];
    };
    subclasses: Array<{
        name: string;
        description: string;
    }>;
    startingEquipment: string[];
};

export type RaceInfo = {
    abilityScoreIncrease: Record<string, number>;
    size: string;
    speed: number;
    languages: string[];
    traits: string[];
    subraces?: Array<{
        name: string;
        abilityScoreIncrease: Partial<Record<string, number>>;
        traits: string[];
    }>;
    variants?: Array<{
        name: string;
        description: string;
    }>;
};

export type Background = {
    name: string;
    description: string;
    skillProficiencies: string[];
    toolProficiencies?: string[];
    languages?: string[];
    equipment: string[];
    feature: string;
};

export type Equipment = {
    name: string;
    cost?: string;
    damage?: string;
    weight?: string;
    properties?: string[];
    type?: string;
    armorClass?: string;
    requirements?: string;
    contents?: string[];
};

export type Spell = {
    name: string;
    school: string;
    classes: string[];
    castingTime: string;
    range: string;
    components: string;
    duration: string;
    description: string;
};

// A race's (or subrace's) innate spells, e.g. data/enhanced-character.json's
// "racialSpells": some entries list the cantrip count granted (High Elf),
// others list the actual cantrip names (Drow, Tiefling).
export type RacialSpellEntry = {
    cantrips?: number | string[];
    level1?: string[];
    level2?: string[];
    available?: string[];
};

export type ClassSpellLevelInfo = {
    cantrips?: number;
    // Usually the number of spells known/prepared, but some classes (e.g.
    // Cleric, Druid) record this as "All" in the source data instead.
    spells?: number | string;
    available?: string[];
};

// Keyed by character level, e.g. "level1".
export type ClassSpellEntry = Record<string, ClassSpellLevelInfo>;

export type EnhancedCharacterData = {
    classes: Record<string, ClassInfo>;
    races: Record<string, RaceInfo>;
    backgrounds: Background[];
    equipment: {
        weapons: {
            simple: Equipment[];
            martial: Equipment[];
        };
        armor: Equipment[];
        packs: Equipment[];
    };
    spells: {
        cantrips: Spell[];
        level1: Spell[];
        level2: Spell[];
        level3: Spell[];
        racialSpells: Record<string, RacialSpellEntry>;
        classSpells: Record<string, ClassSpellEntry>;
    };
    levelProgression: Record<
        string,
        {
            proficiencyBonus: number;
            features: string[];
        }
    >;
};

export type Ability =
    | "strength"
    | "dexterity"
    | "constitution"
    | "intelligence"
    | "wisdom"
    | "charisma";

export const abilities: Ability[] = [
    "strength",
    "dexterity",
    "constitution",
    "intelligence",
    "wisdom",
    "charisma",
];

export const alignments = [
    "Lawful Good",
    "Neutral Good",
    "Chaotic Good",
    "Lawful Neutral",
    "True Neutral",
    "Chaotic Neutral",
    "Lawful Evil",
    "Neutral Evil",
    "Chaotic Evil",
];

// The shape of the `character` state that CharacterCreator owns and every
// tab component reads/updates via props.
export type CharacterState = {
    // Basic Info
    name: string;
    level: number;
    class: string;
    subclass: string;
    race: string;
    subrace: string;
    background: string;
    alignment: string;

    // Abilities
    abilities: Record<Ability, number>;

    // Character Details
    hitPoints: number;
    armorClass: number;
    speed: number;
    proficiencyBonus: number;

    // Skills & Proficiencies
    skills: string[];
    proficiencies: {
        armor: string[];
        weapons: string[];
        tools: string[];
        languages: string[];
    };

    // Equipment
    equipment: string[];
    weapons: string[];
    armor: string;
    selectedPack: string;

    // Spells (for spellcasters)
    spells: {
        cantrips: string[];
        level1: string[];
        level2: string[];
        level3: string[];
    };

    // Character Story
    personality: string;
    ideals: string;
    bonds: string;
    flaws: string;
    backstory: string;

    // Features & Traits
    features: string[];
    traits: string[];
};
