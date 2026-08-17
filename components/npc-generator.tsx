"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import npcData from "@/data/npc-generator.json";
import {
    User,
    Scroll,
    Sparkles,
    Heart,
    RefreshCw,
    MessageCircle,
    Save,
    Trash2,
} from "lucide-react";
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from "@/lib/storage";

type NPC = {
    name: string;
    race: {
        name: string;
        description: string;
        traits: string[];
    };
    class: {
        name: string;
        description: string;
        skills: string[];
    };
    alignment: {
        name: string;
        description: string;
    };
    trait: string;
    quirk: string;
    occupation: string;
    goal: string;
    appearance: string;
    personality: string;
};

function getRandomItem<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

function generateAppearance(race: string): string {
    const heights = ["short", "average height", "tall", "very tall"];
    const builds = ["slender", "athletic", "stocky", "muscular", "plump"];
    const hairColors = ["black", "brown", "blonde", "red", "gray", "white"];
    const hairStyles = ["long", "short", "curly", "straight", "wavy", "bald"];
    const eyeColors = ["brown", "blue", "green", "gray", "amber", "hazel"];
    const skinTones = ["fair", "tan", "olive", "brown", "dark"];
    const distinguishingFeatures = [
        "a scar on their face",
        "a tattoo",
        "an unusual eye color",
        "a birthmark",
        "missing teeth",
        "callused hands",
        "jewelry",
        "unusual clothing",
        "a distinctive voice",
    ];

    return `A ${getRandomItem(heights)}, ${getRandomItem(
        builds
    )} ${race} with ${getRandomItem(hairStyles)} ${getRandomItem(
        hairColors
    )} hair, ${getRandomItem(eyeColors)} eyes, and ${getRandomItem(
        skinTones
    )} skin. They have ${getRandomItem(distinguishingFeatures)}.`;
}

function generatePersonality(trait: string, quirk: string): string {
    const speechPatterns = [
        "speaks quickly",
        "speaks slowly and deliberately",
        "has a distinctive accent",
        "uses complex vocabulary",
        "speaks simply and directly",
        "often interrupts others",
        "rarely speaks unless necessary",
    ];

    return `${trait} in nature and ${getRandomItem(speechPatterns)}. ${quirk}.`;
}

type SavedNPC = NPC & { id: number };

export function NPCGenerator() {
    const [npc, setNPC] = useState<NPC | null>(null);
    const [savedNpcs, setSavedNpcs] = useState<SavedNPC[]>([]);

    useEffect(() => {
        setSavedNpcs(loadFromStorage(STORAGE_KEYS.savedNpcs, []));
    }, []);

    const saveNpc = () => {
        if (!npc) return;
        const updated = [...savedNpcs, { ...npc, id: Date.now() }];
        setSavedNpcs(updated);
        saveToStorage(STORAGE_KEYS.savedNpcs, updated);
    };

    const deleteNpc = (id: number) => {
        const updated = savedNpcs.filter((saved) => saved.id !== id);
        setSavedNpcs(updated);
        saveToStorage(STORAGE_KEYS.savedNpcs, updated);
    };

    const generateNPC = () => {
        const race = getRandomItem(npcData.races);
        const charClass = getRandomItem(npcData.classes);
        const alignment = getRandomItem(npcData.alignments);
        const trait = getRandomItem(npcData.traits);
        const quirk = getRandomItem(npcData.quirks);
        const occupation = getRandomItem(npcData.occupations);
        const goal = getRandomItem(npcData.goals);

        // Generate name
        const namePrefix = getRandomItem(npcData.namePrefixes);
        const nameSuffix = getRandomItem(npcData.nameSuffixes);
        const name = namePrefix + nameSuffix;

        // Generate appearance and personality
        const appearance = generateAppearance(race.name);
        const personality = generatePersonality(trait, quirk);

        setNPC({
            name,
            race,
            class: charClass,
            alignment,
            trait,
            quirk,
            occupation,
            goal,
            appearance,
            personality,
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
                <Button onClick={generateNPC} className="flex items-center">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Generate NPC
                </Button>
                {npc && (
                    <Button
                        onClick={saveNpc}
                        variant="outline"
                        className="flex items-center"
                    >
                        <Save className="mr-2 h-4 w-4" />
                        Save NPC
                    </Button>
                )}
            </div>

            {npc && (
                <Card className="print:shadow-none">
                    <CardHeader>
                        <CardTitle className="text-2xl">{npc.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-medium flex items-center gap-2 text-lg">
                                    <User className="h-5 w-5" />
                                    Basic Information
                                </h3>
                                <Separator className="my-2" />
                                <div className="space-y-2">
                                    <div>
                                        <span className="font-semibold">
                                            Race:
                                        </span>{" "}
                                        {npc.race.name}
                                    </div>
                                    <div>
                                        <span className="font-semibold">
                                            Class:
                                        </span>{" "}
                                        {npc.class.name}
                                    </div>
                                    <div>
                                        <span className="font-semibold">
                                            Alignment:
                                        </span>{" "}
                                        {npc.alignment.name}
                                    </div>
                                    <div>
                                        <span className="font-semibold">
                                            Occupation:
                                        </span>{" "}
                                        {npc.occupation}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-medium flex items-center gap-2 text-lg">
                                    <Scroll className="h-5 w-5" />
                                    Description
                                </h3>
                                <Separator className="my-2" />
                                <div className="space-y-2">
                                    <div>
                                        <span className="font-semibold">
                                            Appearance:
                                        </span>{" "}
                                        {npc.appearance}
                                    </div>
                                    <div>
                                        <span className="font-semibold">
                                            Personality:
                                        </span>{" "}
                                        {npc.personality}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-medium flex items-center gap-2 text-lg">
                                    <Sparkles className="h-5 w-5" />
                                    Abilities
                                </h3>
                                <Separator className="my-2" />
                                <div>
                                    <span className="font-semibold">
                                        Skills:
                                    </span>
                                    <ul className="list-disc list-inside">
                                        {npc.class.skills.map(
                                            (skill, index) => (
                                                <li key={index}>{skill}</li>
                                            )
                                        )}
                                    </ul>
                                </div>
                                <div>
                                    <span className="font-semibold">
                                        Racial Traits:
                                    </span>
                                    <ul className="list-disc list-inside">
                                        {npc.race.traits.map((trait, index) => (
                                            <li key={index}>{trait}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-medium flex items-center gap-2 text-lg">
                                    <Heart className="h-5 w-5" />
                                    Character
                                </h3>
                                <Separator className="my-2" />
                                <div className="space-y-2">
                                    <div>
                                        <span className="font-semibold">
                                            Trait:
                                        </span>{" "}
                                        {npc.trait}
                                    </div>
                                    <div>
                                        <span className="font-semibold">
                                            Quirk:
                                        </span>{" "}
                                        {npc.quirk}
                                    </div>
                                    <div>
                                        <span className="font-semibold">
                                            Goal:
                                        </span>{" "}
                                        {npc.goal}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-medium flex items-center gap-2 text-lg">
                                <MessageCircle className="h-5 w-5" />
                                Roleplaying Notes
                            </h3>
                            <Separator className="my-2" />
                            <div className="space-y-2">
                                <div>
                                    <span className="font-semibold">Race:</span>{" "}
                                    {npc.race.description}
                                </div>
                                <div>
                                    <span className="font-semibold">
                                        Class:
                                    </span>{" "}
                                    {npc.class.description}
                                </div>
                                <div>
                                    <span className="font-semibold">
                                        Alignment:
                                    </span>{" "}
                                    {npc.alignment.description}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {savedNpcs.length > 0 && (
                <div className="space-y-2">
                    <h2 className="text-xl font-bold">Saved NPCs</h2>
                    {savedNpcs.map((saved) => (
                        <Card key={saved.id}>
                            <CardHeader className="flex flex-row items-center justify-between py-3">
                                <button
                                    className="text-left"
                                    onClick={() => setNPC(saved)}
                                >
                                    <CardTitle className="text-base">
                                        {saved.name}
                                    </CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                        {saved.race.name} {saved.class.name} —{" "}
                                        {saved.occupation}
                                    </p>
                                </button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    aria-label="Delete saved NPC"
                                    onClick={() => deleteNpc(saved.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
