/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    CharacterSheetPDFGenerator,
    printCharacterSheet,
    type CharacterSheetData,
} from "@/lib/pdf-generator";
import {
    calculateRacialBonuses,
    calculateHitPointsForLevel,
    calculateArmorClass,
    getDefaultSpells,
} from "@/lib/character-calculations";
import {
    generateId,
    loadFromStorage,
    saveToStorage,
    STORAGE_KEYS,
} from "@/lib/storage";

// Add the missing CharacterData type
type CharacterData = {
    classes: string[];
    races: string[];
    alignments: string[];
    traits: string[];
};

type ClassInfo = {
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

type RaceInfo = {
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

type Background = {
    name: string;
    description: string;
    skillProficiencies: string[];
    toolProficiencies?: string[];
    languages?: string[];
    equipment: string[];
    feature: string;
};

type Equipment = {
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
        cantrips: Array<{
            name: string;
            school: string;
            classes: string[];
            castingTime: string;
            range: string;
            components: string;
            duration: string;
            description: string;
        }>;
        level1: Array<{
            name: string;
            school: string;
            classes: string[];
            castingTime: string;
            range: string;
            components: string;
            duration: string;
            description: string;
        }>;
        level2: Array<{
            name: string;
            school: string;
            classes: string[];
            castingTime: string;
            range: string;
            components: string;
            duration: string;
            description: string;
        }>;
        level3: Array<{
            name: string;
            school: string;
            classes: string[];
            castingTime: string;
            range: string;
            components: string;
            duration: string;
            description: string;
        }>;
        racialSpells: Record<string, any>;
        classSpells: Record<string, any>;
    };
    levelProgression: Record<
        string,
        {
            proficiencyBonus: number;
            features: string[];
        }
    >;
};

type Ability =
    | "strength"
    | "dexterity"
    | "constitution"
    | "intelligence"
    | "wisdom"
    | "charisma";

const abilities: Ability[] = [
    "strength",
    "dexterity",
    "constitution",
    "intelligence",
    "wisdom",
    "charisma",
];

const alignments = [
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

type CharacterDraft = {
    name: string;
    level: number;
    class: string;
    subclass: string;
    race: string;
    subrace: string;
    background: string;
    alignment: string;
    abilities: Record<Ability, number>;
    hitPoints: number;
    armorClass: number;
    speed: number;
    proficiencyBonus: number;
    skills: string[];
    proficiencies: {
        armor: string[];
        weapons: string[];
        tools: string[];
        languages: string[];
    };
    equipment: string[];
    weapons: string[];
    armor: string;
    selectedPack: string;
    spells: {
        cantrips: string[];
        level1: string[];
        level2: string[];
        level3: string[];
    };
    personality: string;
    ideals: string;
    bonds: string;
    flaws: string;
    backstory: string;
    features: string[];
    traits: string[];
};

const initialCharacterDraft: CharacterDraft = {
    // Basic Info
    name: "",
    level: 1,
    class: "",
    subclass: "",
    race: "",
    subrace: "",
    background: "",
    alignment: "",

    // Abilities
    abilities: {
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10,
    },

    // Character Details
    hitPoints: 0,
    armorClass: 10,
    speed: 30,
    proficiencyBonus: 2,

    // Skills & Proficiencies
    skills: [],
    proficiencies: {
        armor: [],
        weapons: [],
        tools: [],
        languages: [],
    },

    // Equipment
    equipment: [],
    weapons: [],
    armor: "",
    selectedPack: "",

    // Spells (for spellcasters)
    spells: {
        cantrips: [],
        level1: [],
        level2: [],
        level3: [],
    },

    // Character Story
    personality: "",
    ideals: "",
    bonds: "",
    flaws: "",
    backstory: "",

    // Features & Traits
    features: [],
    traits: [],
};

type SavedCharacter = { id: string; character: CharacterDraft };

export function CharacterCreator({
    enhancedData,
}: {
    characterData?: CharacterData;
    enhancedData: EnhancedCharacterData;
}) {
    const [character, setCharacter] = useState<CharacterDraft>(
        initialCharacterDraft
    );

    const [showExportDialog, setShowExportDialog] = useState(false);
    const [currentTab, setCurrentTab] = useState("basics");
    const [savedCharacters, setSavedCharacters] = useState<SavedCharacter[]>(
        []
    );
    const [activeSavedId, setActiveSavedId] = useState<string | null>(null);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrating from localStorage on mount, not derivable during render (no SSR value to read)
        setSavedCharacters(loadFromStorage(STORAGE_KEYS.savedCharacters, []));
    }, []);

    const saveCharacter = () => {
        if (!character.name.trim()) {
            alert("Give your character a name before saving.");
            return;
        }

        let updated: SavedCharacter[];
        if (activeSavedId !== null) {
            updated = savedCharacters.map((saved) =>
                saved.id === activeSavedId ? { ...saved, character } : saved
            );
        } else {
            const newId = generateId();
            updated = [...savedCharacters, { id: newId, character }];
            setActiveSavedId(newId);
        }

        setSavedCharacters(updated);
        saveToStorage(STORAGE_KEYS.savedCharacters, updated);
    };

    const loadCharacter = (saved: SavedCharacter) => {
        setCharacter(saved.character);
        setActiveSavedId(saved.id);
    };

    const deleteCharacter = (id: string) => {
        const updated = savedCharacters.filter((saved) => saved.id !== id);
        setSavedCharacters(updated);
        saveToStorage(STORAGE_KEYS.savedCharacters, updated);
        if (activeSavedId === id) setActiveSavedId(null);
    };

    const startNewCharacter = () => {
        setCharacter(initialCharacterDraft);
        setActiveSavedId(null);
    };

    // Calculate derived stats
    const getAbilityModifier = (score: number) => Math.floor((score - 10) / 2);

    const calculateHitPoints = () => {
        if (!character.class) return 0;
        const conModifier = getAbilityModifier(
            character.abilities.constitution
        );
        return calculateHitPointsForLevel(
            character.level,
            character.class,
            conModifier,
            enhancedData
        );
    };

    const calculateArmorClassValue = () => {
        const dexModifier = getAbilityModifier(character.abilities.dexterity);
        return calculateArmorClass(
            dexModifier,
            character.armor,
            false,
            enhancedData
        );
    };

    const applyRacialBonuses = () => {
        if (!character.race) return;

        const modifiedAbilities = calculateRacialBonuses(
            character.race,
            character.subrace,
            enhancedData,
            character.abilities
        );

        setCharacter((prev) => ({
            ...prev,
            abilities: {
                strength: modifiedAbilities.strength || prev.abilities.strength,
                dexterity:
                    modifiedAbilities.dexterity || prev.abilities.dexterity,
                constitution:
                    modifiedAbilities.constitution ||
                    prev.abilities.constitution,
                intelligence:
                    modifiedAbilities.intelligence ||
                    prev.abilities.intelligence,
                wisdom: modifiedAbilities.wisdom || prev.abilities.wisdom,
                charisma: modifiedAbilities.charisma || prev.abilities.charisma,
            },
        }));
    };

    const applyDefaultSpells = () => {
        if (!character.class) return;

        const defaultSpells = getDefaultSpells(
            character.level,
            character.class,
            character.race,
            character.subrace,
            enhancedData
        );

        setCharacter((prev) => ({
            ...prev,
            spells: {
                cantrips: [
                    ...new Set([
                        ...prev.spells.cantrips,
                        ...defaultSpells.cantrips,
                    ]),
                ],
                level1: [
                    ...new Set([
                        ...prev.spells.level1,
                        ...defaultSpells.level1,
                    ]),
                ],
                level2: [
                    ...new Set([
                        ...prev.spells.level2,
                        ...defaultSpells.level2,
                    ]),
                ],
                level3: [
                    ...new Set([
                        ...prev.spells.level3,
                        ...defaultSpells.level3,
                    ]),
                ],
            },
        }));
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- hitPoints/armorClass are derived from several character fields and merged back into the single character state object; not a simple prop->state mirror
        setCharacter((prev) => ({
            ...prev,
            hitPoints: calculateHitPoints(),
            armorClass: calculateArmorClassValue(),
        }));
    }, [
        character.class,
        character.level,
        character.abilities.constitution,
        character.abilities.dexterity,
        character.armor,
    ]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setCharacter({ ...character, [e.target.name]: e.target.value });
    };

    const handleSelectChange = (name: string, value: string) => {
        setCharacter({ ...character, [name]: value });
    };

    const handleAbilityChange = (ability: Ability, value: string) => {
        const numValue = parseInt(value) || 0;
        setCharacter({
            ...character,
            abilities: {
                ...character.abilities,
                [ability]: Math.max(3, Math.min(20, numValue)),
            },
        });
    };

    const rollAbilities = () => {
        const rollStat = () => {
            const rolls = Array.from(
                { length: 4 },
                () => Math.floor(Math.random() * 6) + 1
            );
            rolls.sort((a, b) => b - a);
            return rolls.slice(0, 3).reduce((sum, roll) => sum + roll, 0);
        };

        const newAbilities = {
            strength: rollStat(),
            dexterity: rollStat(),
            constitution: rollStat(),
            intelligence: rollStat(),
            wisdom: rollStat(),
            charisma: rollStat(),
        };

        setCharacter({ ...character, abilities: newAbilities });
    };

    const standardArray = () => {
        setCharacter({
            ...character,
            abilities: {
                strength: 15,
                dexterity: 14,
                constitution: 13,
                intelligence: 12,
                wisdom: 10,
                charisma: 8,
            },
        });
    };

    const exportToJson = () => {
        const dataStr = JSON.stringify(character, null, 2);
        const dataUri =
            "data:application/json;charset=utf-8," +
            encodeURIComponent(dataStr);
        const exportFileDefaultName = (character.name || "character") + ".json";

        const linkElement = document.createElement("a");
        linkElement.setAttribute("href", dataUri);
        linkElement.setAttribute("download", exportFileDefaultName);
        linkElement.click();
    };

    const exportToPDF = async () => {
        setShowExportDialog(true);
    };

    const generatePDF = () => {
        const characterSheetData: CharacterSheetData = {
            name: character.name,
            level: character.level,
            class: character.class,
            subclass: character.subclass,
            race: character.race,
            subrace: character.subrace,
            background: character.background,
            alignment: character.alignment,
            abilities: character.abilities,
            hitPoints: character.hitPoints,
            armorClass: character.armorClass,
            speed: character.speed,
            proficiencyBonus: character.proficiencyBonus,
            skills: character.skills,
            equipment: character.equipment,
            selectedPack: character.selectedPack,
            spells: character.spells,
            personality: character.personality,
            ideals: character.ideals,
            bonds: character.bonds,
            flaws: character.flaws,
            backstory: character.backstory,
        };

        CharacterSheetPDFGenerator.downloadPDF(characterSheetData);
        setShowExportDialog(false);
    };

    const printCharacter = () => {
        const characterSheetData: CharacterSheetData = {
            name: character.name,
            level: character.level,
            class: character.class,
            subclass: character.subclass,
            race: character.race,
            subrace: character.subrace,
            background: character.background,
            alignment: character.alignment,
            abilities: character.abilities,
            hitPoints: character.hitPoints,
            armorClass: character.armorClass,
            speed: character.speed,
            proficiencyBonus: character.proficiencyBonus,
            skills: character.skills,
            equipment: character.equipment,
            selectedPack: character.selectedPack,
            spells: character.spells,
            personality: character.personality,
            ideals: character.ideals,
            bonds: character.bonds,
            flaws: character.flaws,
            backstory: character.backstory,
        };

        printCharacterSheet(characterSheetData);
        setShowExportDialog(false);
    };

    const importFromJson = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = event.target?.result as string;
                const importedCharacter = JSON.parse(json);
                setCharacter(importedCharacter);
            } catch (error) {
                alert("Error importing character: Invalid JSON file" + error);
            }
        };
        reader.readAsText(file);
    };

    const levelUp = () => {
        if (character.level < 20) {
            const newLevel = character.level + 1;
            const levelData =
                enhancedData.levelProgression[newLevel.toString()];

            setCharacter((prev) => ({
                ...prev,
                level: newLevel,
                proficiencyBonus:
                    levelData?.proficiencyBonus || prev.proficiencyBonus,
            }));
        }
    };

    const getSelectedClassInfo = () => enhancedData.classes[character.class];
    const getSelectedRaceInfo = () => enhancedData.races[character.race];
    const getSelectedBackground = () =>
        enhancedData.backgrounds.find((bg) => bg.name === character.background);

    return (
        <div className="max-w-6xl mx-auto p-4 space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold">
                    Enhanced Character Creator
                </h1>
                <p className="text-muted-foreground">
                    Create your D&D 5e character with all the details
                </p>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>My Characters</CardTitle>
                    {activeSavedId !== null && (
                        <Button variant="outline" size="sm" onClick={startNewCharacter}>
                            Start New Character
                        </Button>
                    )}
                </CardHeader>
                <CardContent>
                    {savedCharacters.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            No saved characters yet. Fill in a name below and
                            click &quot;Save Character&quot; to keep this one
                            in your browser.
                        </p>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {savedCharacters.map((saved) => (
                                <div
                                    key={saved.id}
                                    className={`flex items-center gap-2 rounded-md border px-3 py-1.5 ${
                                        saved.id === activeSavedId
                                            ? "border-primary bg-primary/5"
                                            : ""
                                    }`}
                                >
                                    <button
                                        className="text-sm text-left"
                                        onClick={() => loadCharacter(saved)}
                                    >
                                        {saved.character.name || "Unnamed"}
                                        {saved.character.class && (
                                            <span className="text-muted-foreground">
                                                {" "}
                                                — Lvl {saved.character.level}{" "}
                                                {saved.character.class}
                                            </span>
                                        )}
                                    </button>
                                    <button
                                        className="text-muted-foreground hover:text-destructive text-sm"
                                        aria-label="Delete saved character"
                                        onClick={() =>
                                            deleteCharacter(saved.id)
                                        }
                                    >
                                        &times;
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Tabs
                value={currentTab}
                onValueChange={setCurrentTab}
                className="w-full"
            >
                <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="basics">Basics</TabsTrigger>
                    <TabsTrigger value="abilities">Abilities</TabsTrigger>
                    <TabsTrigger value="skills">Skills</TabsTrigger>
                    <TabsTrigger value="equipment">Equipment</TabsTrigger>
                    <TabsTrigger value="spells">Spells</TabsTrigger>
                    <TabsTrigger value="story">Story</TabsTrigger>
                </TabsList>

                <TabsContent value="basics" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="name">Character Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={character.name}
                                    onChange={handleInputChange}
                                    placeholder="Enter character name"
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="level">Level</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="level"
                                        name="level"
                                        type="number"
                                        min="1"
                                        max="20"
                                        value={character.level}
                                        onChange={(e) =>
                                            setCharacter({
                                                ...character,
                                                level:
                                                    parseInt(e.target.value) ||
                                                    1,
                                            })
                                        }
                                    />
                                    <Button
                                        onClick={levelUp}
                                        disabled={character.level >= 20}
                                    >
                                        Level Up
                                    </Button>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="class">Class</Label>
                                <Select
                                    name="class"
                                    value={character.class}
                                    onValueChange={(value) =>
                                        handleSelectChange("class", value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a class" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.keys(enhancedData.classes).map(
                                            (className) => (
                                                <SelectItem
                                                    key={className}
                                                    value={className}
                                                >
                                                    {className}
                                                </SelectItem>
                                            )
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            {character.class &&
                                getSelectedClassInfo()?.subclasses.length >
                                    0 && (
                                    <div>
                                        <Label htmlFor="subclass">
                                            Subclass
                                        </Label>
                                        <Select
                                            name="subclass"
                                            value={character.subclass}
                                            onValueChange={(value) =>
                                                handleSelectChange(
                                                    "subclass",
                                                    value
                                                )
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a subclass" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {getSelectedClassInfo()?.subclasses.map(
                                                    (subclass) => (
                                                        <SelectItem
                                                            key={subclass.name}
                                                            value={
                                                                subclass.name
                                                            }
                                                        >
                                                            {subclass.name}
                                                        </SelectItem>
                                                    )
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                            <div>
                                <Label htmlFor="race">Race</Label>
                                <Select
                                    name="race"
                                    value={character.race}
                                    onValueChange={(value) =>
                                        handleSelectChange("race", value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a race" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.keys(enhancedData.races).map(
                                            (raceName) => (
                                                <SelectItem
                                                    key={raceName}
                                                    value={raceName}
                                                >
                                                    {raceName}
                                                </SelectItem>
                                            )
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            {character.race &&
                                getSelectedRaceInfo()?.subraces && (
                                    <div>
                                        <Label htmlFor="subrace">Subrace</Label>
                                        <Select
                                            name="subrace"
                                            value={character.subrace}
                                            onValueChange={(value) =>
                                                handleSelectChange(
                                                    "subrace",
                                                    value
                                                )
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a subrace" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {getSelectedRaceInfo()?.subraces?.map(
                                                    (subrace) => (
                                                        <SelectItem
                                                            key={subrace.name}
                                                            value={subrace.name}
                                                        >
                                                            {subrace.name}
                                                        </SelectItem>
                                                    )
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                            <div>
                                <Label htmlFor="background">Background</Label>
                                <Select
                                    name="background"
                                    value={character.background}
                                    onValueChange={(value) =>
                                        handleSelectChange("background", value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a background" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {enhancedData.backgrounds.map((bg) => (
                                            <SelectItem
                                                key={bg.name}
                                                value={bg.name}
                                            >
                                                {bg.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="alignment">Alignment</Label>
                                <Select
                                    name="alignment"
                                    value={character.alignment}
                                    onValueChange={(value) =>
                                        handleSelectChange("alignment", value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select an alignment" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {alignments.map((alignment) => (
                                            <SelectItem
                                                key={alignment}
                                                value={alignment}
                                            >
                                                {alignment}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Character Stats Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Character Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground">
                                        Hit Points
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {character.hitPoints}
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground">
                                        Armor Class
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {character.armorClass}
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground">
                                        Speed
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {character.speed} ft
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground">
                                        Proficiency Bonus
                                    </p>
                                    <p className="text-2xl font-bold">
                                        +{character.proficiencyBonus}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Class/Race Info */}
                    {(character.class || character.race) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {character.class && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>
                                            {character.class} Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <p>
                                            <strong>Hit Die:</strong>{" "}
                                            {getSelectedClassInfo()?.hitDie}
                                        </p>
                                        <p>
                                            <strong>Primary Abilities:</strong>{" "}
                                            {getSelectedClassInfo()?.primaryAbilities.join(
                                                ", "
                                            )}
                                        </p>
                                        <p>
                                            <strong>Saving Throws:</strong>{" "}
                                            {getSelectedClassInfo()?.savingThrows.join(
                                                ", "
                                            )}
                                        </p>
                                        {character.subclass && (
                                            <div>
                                                <p>
                                                    <strong>Subclass:</strong>{" "}
                                                    {character.subclass}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {
                                                        getSelectedClassInfo()?.subclasses.find(
                                                            (sc) =>
                                                                sc.name ===
                                                                character.subclass
                                                        )?.description
                                                    }
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {character.race && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>
                                            {character.race} Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <p>
                                            <strong>Size:</strong>{" "}
                                            {getSelectedRaceInfo()?.size}
                                        </p>
                                        <p>
                                            <strong>Speed:</strong>{" "}
                                            {getSelectedRaceInfo()?.speed} feet
                                        </p>
                                        <p>
                                            <strong>Languages:</strong>{" "}
                                            {getSelectedRaceInfo()?.languages.join(
                                                ", "
                                            )}
                                        </p>
                                        <div>
                                            <p>
                                                <strong>Traits:</strong>
                                            </p>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {getSelectedRaceInfo()?.traits.map(
                                                    (trait) => (
                                                        <Badge
                                                            key={trait}
                                                            variant="outline"
                                                        >
                                                            {trait}
                                                        </Badge>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="abilities" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Ability Scores</CardTitle>
                            <div className="flex gap-2">
                                <Button
                                    onClick={rollAbilities}
                                    variant="outline"
                                >
                                    Roll 4d6, Drop Lowest
                                </Button>
                                <Button
                                    onClick={standardArray}
                                    variant="outline"
                                >
                                    Use Standard Array
                                </Button>
                                {character.race && (
                                    <Button
                                        onClick={applyRacialBonuses}
                                        variant="outline"
                                    >
                                        Apply Racial Bonuses
                                    </Button>
                                )}
                                {[
                                    "Wizard",
                                    "Sorcerer",
                                    "Warlock",
                                    "Bard",
                                    "Cleric",
                                    "Druid",
                                ].includes(character.class) && (
                                    <Button
                                        onClick={applyDefaultSpells}
                                        variant="outline"
                                    >
                                        Add Default Spells
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {abilities.map((ability) => (
                                    <div key={ability} className="space-y-2">
                                        <Label
                                            htmlFor={ability}
                                            className="text-sm font-medium"
                                        >
                                            {ability.charAt(0).toUpperCase() +
                                                ability.slice(1)}
                                        </Label>
                                        <Input
                                            id={ability}
                                            name={ability}
                                            type="number"
                                            min="3"
                                            max="20"
                                            value={character.abilities[ability]}
                                            onChange={(e) =>
                                                handleAbilityChange(
                                                    ability,
                                                    e.target.value
                                                )
                                            }
                                            className="text-center"
                                        />
                                        <div className="text-center">
                                            <span className="text-sm text-muted-foreground">
                                                Modifier:{" "}
                                                {getAbilityModifier(
                                                    character.abilities[ability]
                                                ) >= 0
                                                    ? "+"
                                                    : ""}
                                                {getAbilityModifier(
                                                    character.abilities[ability]
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Saving Throws */}
                    {character.class && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Saving Throws</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {abilities.map((ability) => {
                                        const modifier = getAbilityModifier(
                                            character.abilities[ability]
                                        );
                                        const isProficient =
                                            getSelectedClassInfo()?.savingThrows.includes(
                                                ability
                                            );
                                        const totalBonus =
                                            modifier +
                                            (isProficient
                                                ? character.proficiencyBonus
                                                : 0);

                                        return (
                                            <div
                                                key={ability}
                                                className="flex justify-between items-center p-2 border rounded"
                                            >
                                                <span className="capitalize">
                                                    {ability}
                                                </span>
                                                <span
                                                    className={
                                                        isProficient
                                                            ? "font-bold"
                                                            : ""
                                                    }
                                                >
                                                    {totalBonus >= 0 ? "+" : ""}
                                                    {totalBonus}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="skills" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Skills & Proficiencies</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Skills would be implemented here */}
                            {character.class && (
                                <div>
                                    <h4 className="font-semibold mb-2">
                                        Available Skills for {character.class}
                                    </h4>
                                    <div className="text-sm text-muted-foreground">
                                        Choose from:{" "}
                                        {getSelectedClassInfo()?.skillOptions.join(
                                            ", "
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Proficiencies */}
                            {character.class && (
                                <div className="space-y-2">
                                    <h4 className="font-semibold">
                                        Class Proficiencies
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <strong>Armor:</strong>{" "}
                                            {getSelectedClassInfo()?.proficiencies.armor.join(
                                                ", "
                                            ) || "None"}
                                        </div>
                                        <div>
                                            <strong>Weapons:</strong>{" "}
                                            {getSelectedClassInfo()?.proficiencies.weapons.join(
                                                ", "
                                            ) || "None"}
                                        </div>
                                        <div>
                                            <strong>Tools:</strong>{" "}
                                            {getSelectedClassInfo()?.proficiencies.tools.join(
                                                ", "
                                            ) || "None"}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Background Proficiencies */}
                            {character.background && (
                                <div className="space-y-2">
                                    <h4 className="font-semibold">
                                        Background Proficiencies
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <strong>Skills:</strong>{" "}
                                            {getSelectedBackground()?.skillProficiencies.join(
                                                ", "
                                            )}
                                        </div>
                                        {getSelectedBackground()
                                            ?.toolProficiencies && (
                                            <div>
                                                <strong>Tools:</strong>{" "}
                                                {getSelectedBackground()?.toolProficiencies?.join(
                                                    ", "
                                                )}
                                            </div>
                                        )}
                                        {getSelectedBackground()?.languages && (
                                            <div>
                                                <strong>Languages:</strong>{" "}
                                                {getSelectedBackground()?.languages?.join(
                                                    ", "
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="equipment" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Equipment & Gear</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Starting Equipment */}
                            {character.class && (
                                <div>
                                    <h4 className="font-semibold mb-2">
                                        Starting Equipment for {character.class}
                                    </h4>
                                    <ul className="text-sm space-y-1">
                                        {getSelectedClassInfo()?.startingEquipment.map(
                                            (item, index) => (
                                                <li
                                                    key={index}
                                                    className="flex items-center gap-2"
                                                >
                                                    <span>•</span>
                                                    <span>{item}</span>
                                                </li>
                                            )
                                        )}
                                    </ul>
                                </div>
                            )}

                            {/* Background Equipment */}
                            {character.background && (
                                <div>
                                    <h4 className="font-semibold mb-2">
                                        Background Equipment
                                    </h4>
                                    <ul className="text-sm space-y-1">
                                        {getSelectedBackground()?.equipment.map(
                                            (item, index) => (
                                                <li
                                                    key={index}
                                                    className="flex items-center gap-2"
                                                >
                                                    <span>•</span>
                                                    <span>{item}</span>
                                                </li>
                                            )
                                        )}
                                    </ul>
                                </div>
                            )}

                            {/* Equipment Packs */}
                            <div>
                                <h4 className="font-semibold mb-2">
                                    Select Equipment Pack
                                </h4>
                                <Select
                                    name="selectedPack"
                                    value={character.selectedPack}
                                    onValueChange={(value) =>
                                        handleSelectChange(
                                            "selectedPack",
                                            value
                                        )
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose an equipment pack" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {enhancedData.equipment.packs.map(
                                            (pack) => (
                                                <SelectItem
                                                    key={pack.name}
                                                    value={pack.name}
                                                >
                                                    {pack.name} ({pack.cost})
                                                </SelectItem>
                                            )
                                        )}
                                    </SelectContent>
                                </Select>

                                {character.selectedPack && (
                                    <div className="mt-4 p-4 border rounded-lg">
                                        <h5 className="font-medium mb-2">
                                            {character.selectedPack} Contents:
                                        </h5>
                                        <ul className="text-sm space-y-1">
                                            {enhancedData.equipment.packs
                                                .find(
                                                    (pack) =>
                                                        pack.name ===
                                                        character.selectedPack
                                                )
                                                ?.contents?.map(
                                                    (item, index) => (
                                                        <li
                                                            key={index}
                                                            className="flex items-center gap-2"
                                                        >
                                                            <span>•</span>
                                                            <span>{item}</span>
                                                        </li>
                                                    )
                                                ) || []}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {/* Equipment Pack Overview */}
                            <div>
                                <h4 className="font-semibold mb-2">
                                    All Available Equipment Packs
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {enhancedData.equipment.packs.map(
                                        (pack) => (
                                            <Card
                                                key={pack.name}
                                                className={`p-3 cursor-pointer border-2 ${
                                                    character.selectedPack ===
                                                    pack.name
                                                        ? "border-primary bg-primary/5"
                                                        : "border-muted hover:border-muted-foreground/50"
                                                }`}
                                                onClick={() =>
                                                    handleSelectChange(
                                                        "selectedPack",
                                                        pack.name
                                                    )
                                                }
                                            >
                                                <h5 className="font-medium">
                                                    {pack.name}
                                                </h5>
                                                <p className="text-sm text-muted-foreground mb-2">
                                                    Cost: {pack.cost}
                                                </p>
                                                <div className="text-xs space-y-1">
                                                    {pack.contents
                                                        ?.slice(0, 3)
                                                        .map((item, index) => (
                                                            <div key={index}>
                                                                • {item}
                                                            </div>
                                                        ))}
                                                    {pack.contents &&
                                                        pack.contents.length >
                                                            3 && (
                                                            <div className="text-muted-foreground">
                                                                ... and{" "}
                                                                {pack.contents
                                                                    .length -
                                                                    3}{" "}
                                                                more items
                                                            </div>
                                                        )}
                                                </div>
                                            </Card>
                                        )
                                    )}
                                </div>
                            </div>

                            {/* Custom Equipment */}
                            <div>
                                <h4 className="font-semibold mb-2">
                                    Additional Equipment
                                </h4>
                                <Textarea
                                    placeholder="Add custom equipment, weapons, armor, etc..."
                                    value={character.equipment.join("\n")}
                                    onChange={(e) =>
                                        setCharacter({
                                            ...character,
                                            equipment: e.target.value
                                                .split("\n")
                                                .filter((item) => item.trim()),
                                        })
                                    }
                                    rows={4}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="spells" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Spells & Magic</CardTitle>
                            {[
                                "Wizard",
                                "Sorcerer",
                                "Warlock",
                                "Bard",
                                "Cleric",
                                "Druid",
                            ].includes(character.class) && (
                                <Button
                                    onClick={applyDefaultSpells}
                                    variant="outline"
                                    size="sm"
                                >
                                    Add Recommended Spells
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent>
                            {[
                                "Wizard",
                                "Sorcerer",
                                "Warlock",
                                "Bard",
                                "Cleric",
                                "Druid",
                                "Paladin",
                                "Ranger",
                            ].includes(character.class) ? (
                                <div className="space-y-6">
                                    {/* Racial Spells Info */}
                                    {(character.race === "High Elf" ||
                                        character.race === "Drow" ||
                                        character.race === "Tiefling") && (
                                        <div className="p-4 border rounded-lg bg-muted/50">
                                            <h4 className="font-semibold mb-2">
                                                Racial Spells
                                            </h4>
                                            <p className="text-sm text-muted-foreground mb-2">
                                                Your race grants you access to
                                                certain spells:
                                            </p>
                                            {character.race === "High Elf" && (
                                                <p className="text-sm">
                                                    • Choose 1 Wizard cantrip
                                                </p>
                                            )}
                                            {character.race === "Drow" && (
                                                <div className="text-sm">
                                                    <p>
                                                        • Dancing Lights
                                                        (cantrip)
                                                    </p>
                                                    <p>
                                                        • Faerie Fire (1st
                                                        level, once per long
                                                        rest at 1st level)
                                                    </p>
                                                    <p>
                                                        • Darkness (2nd level,
                                                        once per long rest at
                                                        3rd level)
                                                    </p>
                                                </div>
                                            )}
                                            {character.race === "Tiefling" && (
                                                <div className="text-sm">
                                                    <p>
                                                        • Thaumaturgy (cantrip)
                                                    </p>
                                                    <p>
                                                        • Hellish Rebuke (1st
                                                        level, once per long
                                                        rest at 1st level)
                                                    </p>
                                                    <p>
                                                        • Darkness (2nd level,
                                                        once per long rest at
                                                        3rd level)
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Cantrips */}
                                    <div>
                                        <h4 className="font-semibold mb-2">
                                            Cantrips Known
                                        </h4>
                                        <Textarea
                                            placeholder="List your cantrips..."
                                            value={character.spells.cantrips.join(
                                                "\n"
                                            )}
                                            onChange={(e) =>
                                                setCharacter({
                                                    ...character,
                                                    spells: {
                                                        ...character.spells,
                                                        cantrips: e.target.value
                                                            .split("\n")
                                                            .filter((spell) =>
                                                                spell.trim()
                                                            ),
                                                    },
                                                })
                                            }
                                            rows={4}
                                        />

                                        {/* Available Cantrips */}
                                        <div className="mt-2">
                                            <details className="text-sm">
                                                <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                                                    Available {character.class}{" "}
                                                    Cantrips
                                                </summary>
                                                <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-1 max-h-40 overflow-y-auto">
                                                    {enhancedData.spells.cantrips
                                                        .filter((spell: any) =>
                                                            spell.classes.includes(
                                                                character.class
                                                            )
                                                        )
                                                        .map((spell: any) => (
                                                            <Badge
                                                                key={spell.name}
                                                                variant="outline"
                                                                className="text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground"
                                                                onClick={() => {
                                                                    if (
                                                                        !character.spells.cantrips.includes(
                                                                            spell.name
                                                                        )
                                                                    ) {
                                                                        setCharacter(
                                                                            (
                                                                                prev
                                                                            ) => ({
                                                                                ...prev,
                                                                                spells: {
                                                                                    ...prev.spells,
                                                                                    cantrips:
                                                                                        [
                                                                                            ...prev
                                                                                                .spells
                                                                                                .cantrips,
                                                                                            spell.name,
                                                                                        ],
                                                                                },
                                                                            })
                                                                        );
                                                                    }
                                                                }}
                                                            >
                                                                {spell.name}
                                                            </Badge>
                                                        ))}
                                                </div>
                                            </details>
                                        </div>
                                    </div>

                                    {/* 1st Level Spells */}
                                    <div>
                                        <h4 className="font-semibold mb-2">
                                            1st Level Spells
                                        </h4>
                                        <Textarea
                                            placeholder="List your 1st level spells..."
                                            value={character.spells.level1.join(
                                                "\n"
                                            )}
                                            onChange={(e) =>
                                                setCharacter({
                                                    ...character,
                                                    spells: {
                                                        ...character.spells,
                                                        level1: e.target.value
                                                            .split("\n")
                                                            .filter((spell) =>
                                                                spell.trim()
                                                            ),
                                                    },
                                                })
                                            }
                                            rows={4}
                                        />

                                        {/* Available 1st Level Spells */}
                                        <div className="mt-2">
                                            <details className="text-sm">
                                                <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                                                    Available {character.class}{" "}
                                                    1st Level Spells
                                                </summary>
                                                <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-1 max-h-40 overflow-y-auto">
                                                    {enhancedData.spells.level1
                                                        .filter((spell: any) =>
                                                            spell.classes.includes(
                                                                character.class
                                                            )
                                                        )
                                                        .map((spell: any) => (
                                                            <Badge
                                                                key={spell.name}
                                                                variant="outline"
                                                                className="text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground"
                                                                onClick={() => {
                                                                    if (
                                                                        !character.spells.level1.includes(
                                                                            spell.name
                                                                        )
                                                                    ) {
                                                                        setCharacter(
                                                                            (
                                                                                prev
                                                                            ) => ({
                                                                                ...prev,
                                                                                spells: {
                                                                                    ...prev.spells,
                                                                                    level1: [
                                                                                        ...prev
                                                                                            .spells
                                                                                            .level1,
                                                                                        spell.name,
                                                                                    ],
                                                                                },
                                                                            })
                                                                        );
                                                                    }
                                                                }}
                                                            >
                                                                {spell.name}
                                                            </Badge>
                                                        ))}
                                                </div>
                                            </details>
                                        </div>
                                    </div>

                                    {/* 2nd Level Spells */}
                                    {character.level >= 3 && (
                                        <div>
                                            <h4 className="font-semibold mb-2">
                                                2nd Level Spells
                                            </h4>
                                            <Textarea
                                                placeholder="List your 2nd level spells..."
                                                value={character.spells.level2.join(
                                                    "\n"
                                                )}
                                                onChange={(e) =>
                                                    setCharacter({
                                                        ...character,
                                                        spells: {
                                                            ...character.spells,
                                                            level2: e.target.value
                                                                .split("\n")
                                                                .filter(
                                                                    (spell) =>
                                                                        spell.trim()
                                                                ),
                                                        },
                                                    })
                                                }
                                                rows={3}
                                            />

                                            {/* Available 2nd Level Spells */}
                                            <div className="mt-2">
                                                <details className="text-sm">
                                                    <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                                                        Available{" "}
                                                        {character.class} 2nd
                                                        Level Spells
                                                    </summary>
                                                    <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-1 max-h-40 overflow-y-auto">
                                                        {enhancedData.spells.level2
                                                            .filter(
                                                                (spell: any) =>
                                                                    spell.classes.includes(
                                                                        character.class
                                                                    )
                                                            )
                                                            .map(
                                                                (
                                                                    spell: any
                                                                ) => (
                                                                    <Badge
                                                                        key={
                                                                            spell.name
                                                                        }
                                                                        variant="outline"
                                                                        className="text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground"
                                                                        onClick={() => {
                                                                            if (
                                                                                !character.spells.level2.includes(
                                                                                    spell.name
                                                                                )
                                                                            ) {
                                                                                setCharacter(
                                                                                    (
                                                                                        prev
                                                                                    ) => ({
                                                                                        ...prev,
                                                                                        spells: {
                                                                                            ...prev.spells,
                                                                                            level2: [
                                                                                                ...prev
                                                                                                    .spells
                                                                                                    .level2,
                                                                                                spell.name,
                                                                                            ],
                                                                                        },
                                                                                    })
                                                                                );
                                                                            }
                                                                        }}
                                                                    >
                                                                        {
                                                                            spell.name
                                                                        }
                                                                    </Badge>
                                                                )
                                                            )}
                                                    </div>
                                                </details>
                                            </div>
                                        </div>
                                    )}

                                    {/* 3rd Level Spells */}
                                    {character.level >= 5 && (
                                        <div>
                                            <h4 className="font-semibold mb-2">
                                                3rd Level Spells
                                            </h4>
                                            <Textarea
                                                placeholder="List your 3rd level spells..."
                                                value={character.spells.level3.join(
                                                    "\n"
                                                )}
                                                onChange={(e) =>
                                                    setCharacter({
                                                        ...character,
                                                        spells: {
                                                            ...character.spells,
                                                            level3: e.target.value
                                                                .split("\n")
                                                                .filter(
                                                                    (spell) =>
                                                                        spell.trim()
                                                                ),
                                                        },
                                                    })
                                                }
                                                rows={3}
                                            />

                                            {/* Available 3rd Level Spells */}
                                            <div className="mt-2">
                                                <details className="text-sm">
                                                    <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                                                        Available{" "}
                                                        {character.class} 3rd
                                                        Level Spells
                                                    </summary>
                                                    <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-1 max-h-40 overflow-y-auto">
                                                        {enhancedData.spells.level3
                                                            .filter(
                                                                (spell: any) =>
                                                                    spell.classes.includes(
                                                                        character.class
                                                                    )
                                                            )
                                                            .map(
                                                                (
                                                                    spell: any
                                                                ) => (
                                                                    <Badge
                                                                        key={
                                                                            spell.name
                                                                        }
                                                                        variant="outline"
                                                                        className="text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground"
                                                                        onClick={() => {
                                                                            if (
                                                                                !character.spells.level3.includes(
                                                                                    spell.name
                                                                                )
                                                                            ) {
                                                                                setCharacter(
                                                                                    (
                                                                                        prev
                                                                                    ) => ({
                                                                                        ...prev,
                                                                                        spells: {
                                                                                            ...prev.spells,
                                                                                            level3: [
                                                                                                ...prev
                                                                                                    .spells
                                                                                                    .level3,
                                                                                                spell.name,
                                                                                            ],
                                                                                        },
                                                                                    })
                                                                                );
                                                                            }
                                                                        }}
                                                                    >
                                                                        {
                                                                            spell.name
                                                                        }
                                                                    </Badge>
                                                                )
                                                            )}
                                                    </div>
                                                </details>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center text-muted-foreground">
                                    This class does not typically use spells.
                                    Select a spellcasting class to manage
                                    spells.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="story" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Character Story & Personality</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {character.background && (
                                <div>
                                    <h4 className="font-semibold mb-2">
                                        Background: {character.background}
                                    </h4>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        {getSelectedBackground()?.description}
                                    </p>
                                    <p className="text-sm">
                                        <strong>Feature:</strong>{" "}
                                        {getSelectedBackground()?.feature}
                                    </p>
                                </div>
                            )}

                            <div>
                                <Label htmlFor="personality">
                                    Personality Traits
                                </Label>
                                <Textarea
                                    id="personality"
                                    name="personality"
                                    placeholder="Describe your character's personality traits..."
                                    value={character.personality}
                                    onChange={handleInputChange}
                                    rows={3}
                                />
                            </div>

                            <div>
                                <Label htmlFor="ideals">Ideals</Label>
                                <Textarea
                                    id="ideals"
                                    name="ideals"
                                    placeholder="What drives your character? What principles do they believe in?"
                                    value={character.ideals}
                                    onChange={handleInputChange}
                                    rows={3}
                                />
                            </div>

                            <div>
                                <Label htmlFor="bonds">Bonds</Label>
                                <Textarea
                                    id="bonds"
                                    name="bonds"
                                    placeholder="What connects your character to the world? Important people, places, or things?"
                                    value={character.bonds}
                                    onChange={handleInputChange}
                                    rows={3}
                                />
                            </div>

                            <div>
                                <Label htmlFor="flaws">Flaws</Label>
                                <Textarea
                                    id="flaws"
                                    name="flaws"
                                    placeholder="What weaknesses or vices might cause trouble for your character?"
                                    value={character.flaws}
                                    onChange={handleInputChange}
                                    rows={3}
                                />
                            </div>

                            <div>
                                <Label htmlFor="backstory">Backstory</Label>
                                <Textarea
                                    id="backstory"
                                    name="backstory"
                                    placeholder="Tell your character's story. Where did they come from? What shaped them?"
                                    value={character.backstory}
                                    onChange={handleInputChange}
                                    rows={6}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 justify-center">
                <Button onClick={saveCharacter}>
                    {activeSavedId !== null
                        ? "Update Saved Character"
                        : "Save Character"}
                </Button>
                <Button onClick={exportToJson} variant="outline">
                    Export to JSON
                </Button>
                <Button onClick={exportToPDF}>
                    Export Character Sheet (PDF)
                </Button>
                <label className="cursor-pointer">
                    <Button variant="outline" asChild>
                        <span>Import from JSON</span>
                    </Button>
                    <Input
                        type="file"
                        accept=".json"
                        onChange={importFromJson}
                        className="hidden"
                    />
                </label>
            </div>

            {/* Export Dialog */}
            <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Character Sheet Preview</DialogTitle>
                        <DialogDescription>
                            This is a preview of your character sheet. In a full
                            implementation, this would generate a PDF.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 text-sm">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <strong>Name:</strong> {character.name}
                            </div>
                            <div>
                                <strong>Level:</strong> {character.level}
                            </div>
                            <div>
                                <strong>Class:</strong> {character.class}{" "}
                                {character.subclass &&
                                    `(${character.subclass})`}
                            </div>
                            <div>
                                <strong>Race:</strong> {character.race}{" "}
                                {character.subrace && `(${character.subrace})`}
                            </div>
                            <div>
                                <strong>Background:</strong>{" "}
                                {character.background}
                            </div>
                            <div>
                                <strong>Alignment:</strong>{" "}
                                {character.alignment}
                            </div>
                        </div>

                        <Separator />

                        <div>
                            <h4 className="font-semibold mb-2">
                                Ability Scores
                            </h4>
                            <div className="grid grid-cols-3 gap-2">
                                {abilities.map((ability) => (
                                    <div
                                        key={ability}
                                        className="text-center border rounded p-2"
                                    >
                                        <div className="font-medium capitalize">
                                            {ability}
                                        </div>
                                        <div className="text-lg">
                                            {character.abilities[ability]}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {getAbilityModifier(
                                                character.abilities[ability]
                                            ) >= 0
                                                ? "+"
                                                : ""}
                                            {getAbilityModifier(
                                                character.abilities[ability]
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <strong>Hit Points:</strong>{" "}
                                {character.hitPoints}
                            </div>
                            <div>
                                <strong>Armor Class:</strong>{" "}
                                {character.armorClass}
                            </div>
                            <div>
                                <strong>Speed:</strong> {character.speed} ft
                            </div>
                            <div>
                                <strong>Proficiency Bonus:</strong> +
                                {character.proficiencyBonus}
                            </div>
                        </div>

                        {character.personality && (
                            <>
                                <Separator />
                                <div>
                                    <h4 className="font-semibold mb-2">
                                        Character Details
                                    </h4>
                                    {character.personality && (
                                        <p>
                                            <strong>Personality:</strong>{" "}
                                            {character.personality}
                                        </p>
                                    )}
                                    {character.ideals && (
                                        <p>
                                            <strong>Ideals:</strong>{" "}
                                            {character.ideals}
                                        </p>
                                    )}
                                    {character.bonds && (
                                        <p>
                                            <strong>Bonds:</strong>{" "}
                                            {character.bonds}
                                        </p>
                                    )}
                                    {character.flaws && (
                                        <p>
                                            <strong>Flaws:</strong>{" "}
                                            {character.flaws}
                                        </p>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    <DialogFooter>
                        <Button onClick={() => setShowExportDialog(false)}>
                            Close
                        </Button>
                        <Button onClick={printCharacter} variant="outline">
                            Print Character Sheet
                        </Button>
                        <Button onClick={generatePDF}>Download PDF</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
