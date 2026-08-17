"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    abilities,
    type Ability,
    type CharacterData,
    type CharacterState,
    type EnhancedCharacterData,
} from "./types";
import { BasicsTab } from "./basics-tab";
import { AbilitiesTab } from "./abilities-tab";
import { SkillsTab } from "./skills-tab";
import { EquipmentTab } from "./equipment-tab";
import { SpellsTab } from "./spells-tab";
import { StoryTab } from "./story-tab";

export type {
    CharacterData,
    ClassInfo,
    RaceInfo,
    Background,
    Equipment,
    EnhancedCharacterData,
    Ability,
    CharacterState,
} from "./types";

export function CharacterCreator({
    enhancedData,
}: {
    characterData?: CharacterData;
    enhancedData: EnhancedCharacterData;
}) {
    const [character, setCharacter] = useState<CharacterState>({
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
    });

    const [showExportDialog, setShowExportDialog] = useState(false);
    const [currentTab, setCurrentTab] = useState("basics");

    // Calculate derived stats
    const getAbilityModifier = (score: number) => Math.floor((score - 10) / 2);

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

    // hitPoints/armorClass are stored as fields on `character` (read and
    // edited elsewhere, e.g. PDF export), so they're kept in sync here
    // rather than computed via useMemo.
    useEffect(() => {
        // Ability modifiers are computed inline (rather than via
        // getAbilityModifier) so this effect's dependency array only needs
        // the raw scores it actually reads.
        const conModifier = Math.floor(
            (character.abilities.constitution - 10) / 2
        );
        const dexModifier = Math.floor(
            (character.abilities.dexterity - 10) / 2
        );

        const newHitPoints = character.class
            ? calculateHitPointsForLevel(
                  character.level,
                  character.class,
                  conModifier,
                  enhancedData
              )
            : 0;
        const newArmorClass = calculateArmorClass(
            dexModifier,
            character.armor,
            false,
            enhancedData
        );

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCharacter((prev) => ({
            ...prev,
            hitPoints: newHitPoints,
            armorClass: newArmorClass,
        }));
    }, [
        character.class,
        character.level,
        character.abilities.constitution,
        character.abilities.dexterity,
        character.armor,
        enhancedData,
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

    const buildCharacterSheetData = (): CharacterSheetData => ({
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
    });

    const generatePDF = () => {
        CharacterSheetPDFGenerator.downloadPDF(buildCharacterSheetData());
        setShowExportDialog(false);
    };

    const printCharacter = () => {
        printCharacterSheet(buildCharacterSheetData());
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

                <BasicsTab
                    character={character}
                    setCharacter={setCharacter}
                    enhancedData={enhancedData}
                    handleSelectChange={handleSelectChange}
                    levelUp={levelUp}
                />

                <AbilitiesTab
                    character={character}
                    enhancedData={enhancedData}
                    getAbilityModifier={getAbilityModifier}
                    handleAbilityChange={handleAbilityChange}
                    rollAbilities={rollAbilities}
                    standardArray={standardArray}
                    applyRacialBonuses={applyRacialBonuses}
                    applyDefaultSpells={applyDefaultSpells}
                />

                <SkillsTab character={character} enhancedData={enhancedData} />

                <EquipmentTab
                    character={character}
                    setCharacter={setCharacter}
                    enhancedData={enhancedData}
                    handleSelectChange={handleSelectChange}
                />

                <SpellsTab
                    character={character}
                    setCharacter={setCharacter}
                    enhancedData={enhancedData}
                    applyDefaultSpells={applyDefaultSpells}
                />

                <StoryTab
                    character={character}
                    enhancedData={enhancedData}
                    handleInputChange={handleInputChange}
                />
            </Tabs>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 justify-center">
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
