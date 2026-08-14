"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import {
    abilities,
    type Ability,
    type CharacterState,
    type EnhancedCharacterData,
} from "./types";

const spellcastingClasses = [
    "Wizard",
    "Sorcerer",
    "Warlock",
    "Bard",
    "Cleric",
    "Druid",
];

export type AbilitiesTabProps = {
    character: CharacterState;
    enhancedData: EnhancedCharacterData;
    getAbilityModifier: (score: number) => number;
    handleAbilityChange: (ability: Ability, value: string) => void;
    rollAbilities: () => void;
    standardArray: () => void;
    applyRacialBonuses: () => void;
    applyDefaultSpells: () => void;
};

export function AbilitiesTab({
    character,
    enhancedData,
    getAbilityModifier,
    handleAbilityChange,
    rollAbilities,
    standardArray,
    applyRacialBonuses,
    applyDefaultSpells,
}: AbilitiesTabProps) {
    const selectedClassInfo = enhancedData.classes[character.class];

    return (
        <TabsContent value="abilities" className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Ability Scores</CardTitle>
                    <div className="flex gap-2">
                        <Button onClick={rollAbilities} variant="outline">
                            Roll 4d6, Drop Lowest
                        </Button>
                        <Button onClick={standardArray} variant="outline">
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
                        {spellcastingClasses.includes(character.class) && (
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
                                    selectedClassInfo?.savingThrows.includes(
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
                                                isProficient ? "font-bold" : ""
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
    );
}
