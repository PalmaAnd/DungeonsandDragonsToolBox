"use client";

import type { Dispatch, SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import type { CharacterState, EnhancedCharacterData, Spell } from "./types";

const spellcastingClasses = [
    "Wizard",
    "Sorcerer",
    "Warlock",
    "Bard",
    "Cleric",
    "Druid",
];

const allSpellUsingClasses = [
    "Wizard",
    "Sorcerer",
    "Warlock",
    "Bard",
    "Cleric",
    "Druid",
    "Paladin",
    "Ranger",
];

export type SpellsTabProps = {
    character: CharacterState;
    setCharacter: Dispatch<SetStateAction<CharacterState>>;
    enhancedData: EnhancedCharacterData;
    applyDefaultSpells: () => void;
};

export function SpellsTab({
    character,
    setCharacter,
    enhancedData,
    applyDefaultSpells,
}: SpellsTabProps) {
    const addSpell = (
        level: "cantrips" | "level1" | "level2" | "level3",
        spellName: string
    ) => {
        if (!character.spells[level].includes(spellName)) {
            setCharacter((prev) => ({
                ...prev,
                spells: {
                    ...prev.spells,
                    [level]: [...prev.spells[level], spellName],
                },
            }));
        }
    };

    const isSpellcaster = allSpellUsingClasses.includes(character.class);

    return (
        <TabsContent value="spells" className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Spells & Magic</CardTitle>
                    {spellcastingClasses.includes(character.class) && (
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
                    {isSpellcaster ? (
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
                                        Your race grants you access to certain
                                        spells:
                                    </p>
                                    {character.race === "High Elf" && (
                                        <p className="text-sm">
                                            • Choose 1 Wizard cantrip
                                        </p>
                                    )}
                                    {character.race === "Drow" && (
                                        <div className="text-sm">
                                            <p>• Dancing Lights (cantrip)</p>
                                            <p>
                                                • Faerie Fire (1st level, once
                                                per long rest at 1st level)
                                            </p>
                                            <p>
                                                • Darkness (2nd level, once
                                                per long rest at 3rd level)
                                            </p>
                                        </div>
                                    )}
                                    {character.race === "Tiefling" && (
                                        <div className="text-sm">
                                            <p>• Thaumaturgy (cantrip)</p>
                                            <p>
                                                • Hellish Rebuke (1st level,
                                                once per long rest at 1st
                                                level)
                                            </p>
                                            <p>
                                                • Darkness (2nd level, once
                                                per long rest at 3rd level)
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
                                                .filter((spell: Spell) =>
                                                    spell.classes.includes(
                                                        character.class
                                                    )
                                                )
                                                .map((spell: Spell) => (
                                                    <Badge
                                                        key={spell.name}
                                                        variant="outline"
                                                        className="text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground"
                                                        onClick={() =>
                                                            addSpell(
                                                                "cantrips",
                                                                spell.name
                                                            )
                                                        }
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
                                    value={character.spells.level1.join("\n")}
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
                                            Available {character.class} 1st
                                            Level Spells
                                        </summary>
                                        <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-1 max-h-40 overflow-y-auto">
                                            {enhancedData.spells.level1
                                                .filter((spell: Spell) =>
                                                    spell.classes.includes(
                                                        character.class
                                                    )
                                                )
                                                .map((spell: Spell) => (
                                                    <Badge
                                                        key={spell.name}
                                                        variant="outline"
                                                        className="text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground"
                                                        onClick={() =>
                                                            addSpell(
                                                                "level1",
                                                                spell.name
                                                            )
                                                        }
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
                                                        .filter((spell) =>
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
                                                Available {character.class}{" "}
                                                2nd Level Spells
                                            </summary>
                                            <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-1 max-h-40 overflow-y-auto">
                                                {enhancedData.spells.level2
                                                    .filter((spell: Spell) =>
                                                        spell.classes.includes(
                                                            character.class
                                                        )
                                                    )
                                                    .map((spell: Spell) => (
                                                        <Badge
                                                            key={spell.name}
                                                            variant="outline"
                                                            className="text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground"
                                                            onClick={() =>
                                                                addSpell(
                                                                    "level2",
                                                                    spell.name
                                                                )
                                                            }
                                                        >
                                                            {spell.name}
                                                        </Badge>
                                                    ))}
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
                                                        .filter((spell) =>
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
                                                Available {character.class}{" "}
                                                3rd Level Spells
                                            </summary>
                                            <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-1 max-h-40 overflow-y-auto">
                                                {enhancedData.spells.level3
                                                    .filter((spell: Spell) =>
                                                        spell.classes.includes(
                                                            character.class
                                                        )
                                                    )
                                                    .map((spell: Spell) => (
                                                        <Badge
                                                            key={spell.name}
                                                            variant="outline"
                                                            className="text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground"
                                                            onClick={() =>
                                                                addSpell(
                                                                    "level3",
                                                                    spell.name
                                                                )
                                                            }
                                                        >
                                                            {spell.name}
                                                        </Badge>
                                                    ))}
                                            </div>
                                        </details>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center text-muted-foreground">
                            This class does not typically use spells. Select
                            a spellcasting class to manage spells.
                        </div>
                    )}
                </CardContent>
            </Card>
        </TabsContent>
    );
}
