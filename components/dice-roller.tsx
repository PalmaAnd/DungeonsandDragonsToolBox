"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from "@/lib/storage";

const MAX_STORED_ROLLS = 50;

type DieType = "d4" | "d6" | "d8" | "d10" | "d12" | "d20" | "d100";

type RollResult = {
    id: string;
    formula: string;
    timestamp: Date;
    total: number;
    details: {
        dice: Array<{
            type: string;
            rolls: number[];
            total: number;
        }>;
        modifier?: number;
        advantage?: boolean;
        disadvantage?: boolean;
        d100Details?: {
            tens: number;
            ones: number;
        };
    };
};

const diceTypes: DieType[] = ["d4", "d6", "d8", "d10", "d12", "d20", "d100"];

type StoredRollResult = Omit<RollResult, "timestamp"> & { timestamp: string };

export function DiceRoller() {
    const [rolls, setRolls] = useState<RollResult[]>([]);
    const [customRoll, setCustomRoll] = useState("");

    useEffect(() => {
        const stored = loadFromStorage<StoredRollResult[]>(
            STORAGE_KEYS.diceRolls,
            []
        );
        setRolls(
            stored.map((roll) => ({
                ...roll,
                timestamp: new Date(roll.timestamp),
            }))
        );
    }, []);

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.diceRolls, rolls.slice(0, MAX_STORED_ROLLS));
    }, [rolls]);

    const rollDie = (sides: number): number => {
        return Math.floor(Math.random() * sides) + 1;
    };

    const rollD100 = (): { result: number; tens: number; ones: number } => {
        const tens = rollDie(10); // 1-10, where 10 = 0
        const ones = rollDie(10); // 1-10, where 10 = 0

        const tensValue = tens === 10 ? 0 : tens;
        const onesValue = ones === 10 ? 0 : ones;

        const result = tensValue * 10 + onesValue;
        return {
            result: result === 0 ? 100 : result,
            tens: tensValue,
            ones: onesValue,
        };
    };

    const generateId = (): string => {
        return Date.now().toString() + Math.random().toString(36).substr(2, 9);
    };

    const handleRoll = (die: DieType) => {
        const sides = parseInt(die.substring(1));
        const rollId = generateId();

        if (die === "d100") {
            const d100Result = rollD100();
            const newRoll: RollResult = {
                id: rollId,
                formula: die,
                timestamp: new Date(),
                total: d100Result.result,
                details: {
                    dice: [
                        {
                            type: die,
                            rolls: [d100Result.result],
                            total: d100Result.result,
                        },
                    ],
                    d100Details: {
                        tens: d100Result.tens,
                        ones: d100Result.ones,
                    },
                },
            };
            setRolls((prev) => [newRoll, ...prev].slice(0, MAX_STORED_ROLLS));
        } else {
            const result = rollDie(sides);
            const newRoll: RollResult = {
                id: rollId,
                formula: die,
                timestamp: new Date(),
                total: result,
                details: {
                    dice: [
                        {
                            type: die,
                            rolls: [result],
                            total: result,
                        },
                    ],
                },
            };
            setRolls((prev) => [newRoll, ...prev].slice(0, MAX_STORED_ROLLS));
        }
    };

    const handleAdvantageRoll = (die: DieType) => {
        const sides = parseInt(die.substring(1));
        const rollId = generateId();

        const roll1 = rollDie(sides);
        const roll2 = rollDie(sides);
        const result = Math.max(roll1, roll2);

        const newRoll: RollResult = {
            id: rollId,
            formula: `${die} (Advantage)`,
            timestamp: new Date(),
            total: result,
            details: {
                dice: [
                    {
                        type: die,
                        rolls: [roll1, roll2],
                        total: result,
                    },
                ],
                advantage: true,
            },
        };
        setRolls((prev) => [newRoll, ...prev].slice(0, MAX_STORED_ROLLS));
    };

    const handleDisadvantageRoll = (die: DieType) => {
        const sides = parseInt(die.substring(1));
        const rollId = generateId();

        const roll1 = rollDie(sides);
        const roll2 = rollDie(sides);
        const result = Math.min(roll1, roll2);

        const newRoll: RollResult = {
            id: rollId,
            formula: `${die} (Disadvantage)`,
            timestamp: new Date(),
            total: result,
            details: {
                dice: [
                    {
                        type: die,
                        rolls: [roll1, roll2],
                        total: result,
                    },
                ],
                disadvantage: true,
            },
        };
        setRolls((prev) => [newRoll, ...prev].slice(0, MAX_STORED_ROLLS));
    };

    const parseCustomRoll = (formula: string): RollResult | null => {
        // Remove spaces and convert to lowercase
        const cleanFormula = formula.replace(/\s/g, "").toLowerCase();

        // Parse different patterns
        // Pattern: XdY+Z, XdY-Z, XdY
        const dicePattern = /(\d*)d(\d+)([+-]\d+)?/g;
        const matches = [...cleanFormula.matchAll(dicePattern)];

        if (matches.length === 0) return null;

        const rollId = generateId();
        let totalSum = 0;
        const allDice: Array<{ type: string; rolls: number[]; total: number }> =
            [];
        let modifier = 0;

        // Parse modifier from the end of the formula
        const modifierMatch = cleanFormula.match(/([+-]\d+)$/);
        if (modifierMatch) {
            modifier = parseInt(modifierMatch[1]);
        }

        matches.forEach((match) => {
            const numDice = parseInt(match[1]) || 1;
            const sides = parseInt(match[2]);

            if (sides === 100) {
                // Special handling for d100
                const d100Results = Array.from({ length: numDice }, () =>
                    rollD100()
                );
                const rolls = d100Results.map((r) => r.result);
                const total = rolls.reduce((sum, roll) => sum + roll, 0);

                allDice.push({
                    type: `${numDice}d100`,
                    rolls,
                    total,
                });
                totalSum += total;
            } else {
                // Regular dice
                const rolls = Array.from({ length: numDice }, () =>
                    rollDie(sides)
                );
                const total = rolls.reduce((sum, roll) => sum + roll, 0);

                allDice.push({
                    type: `${numDice}d${sides}`,
                    rolls,
                    total,
                });
                totalSum += total;
            }
        });

        totalSum += modifier;

        return {
            id: rollId,
            formula: cleanFormula,
            timestamp: new Date(),
            total: totalSum,
            details: {
                dice: allDice,
                modifier: modifier !== 0 ? modifier : undefined,
            },
        };
    };

    const handleCustomRoll = () => {
        if (!customRoll.trim()) return;

        const result = parseCustomRoll(customRoll);
        if (result) {
            setRolls((prev) => [result, ...prev].slice(0, MAX_STORED_ROLLS));
            setCustomRoll("");
        }
    };

    const clearHistory = () => {
        setRolls([]);
    };

    const formatTime = (date: Date): string => {
        return date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
    };

    return (
        <div className="space-y-6">
            {/* Quick Dice Rolls */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Dice Rolls</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                        {diceTypes.map((die) => (
                            <div key={die} className="space-y-1">
                                <Button
                                    onClick={() => handleRoll(die)}
                                    className="w-full"
                                    variant="outline"
                                >
                                    {die}
                                </Button>
                                {die === "d20" && (
                                    <div className="flex gap-1">
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            onClick={() =>
                                                handleAdvantageRoll(die)
                                            }
                                            className="flex-1 text-xs"
                                        >
                                            ADV
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            onClick={() =>
                                                handleDisadvantageRoll(die)
                                            }
                                            className="flex-1 text-xs"
                                        >
                                            DIS
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Custom Roll Input */}
            <Card>
                <CardHeader>
                    <CardTitle>Custom Roll</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-end gap-2">
                        <div className="grow">
                            <Label htmlFor="custom-roll">Formula</Label>
                            <Input
                                id="custom-roll"
                                value={customRoll}
                                onChange={(e) => setCustomRoll(e.target.value)}
                                placeholder="e.g., 2d6+3, 4d8, 1d20+5"
                                onKeyPress={(e) =>
                                    e.key === "Enter" && handleCustomRoll()
                                }
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Supports: XdY, XdY+Z, XdY-Z, multiple dice types
                            </p>
                        </div>
                        <Button onClick={handleCustomRoll}>Roll</Button>
                    </div>
                </CardContent>
            </Card>

            {/* Roll History */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Roll History</CardTitle>
                    {rolls.length > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={clearHistory}
                        >
                            Clear History
                        </Button>
                    )}
                </CardHeader>
                <CardContent>
                    {rolls.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">
                            No rolls yet. Start rolling some dice!
                        </p>
                    ) : (
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {rolls.map((roll) => (
                                <div
                                    key={roll.id}
                                    className="border rounded-lg p-3 space-y-2"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline">
                                                {roll.formula}
                                            </Badge>
                                            <span className="text-sm text-muted-foreground">
                                                {formatTime(roll.timestamp)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {roll.details.advantage && (
                                                <Badge
                                                    variant="secondary"
                                                    className="text-green-600"
                                                >
                                                    Advantage
                                                </Badge>
                                            )}
                                            {roll.details.disadvantage && (
                                                <Badge
                                                    variant="secondary"
                                                    className="text-red-600"
                                                >
                                                    Disadvantage
                                                </Badge>
                                            )}
                                            <span className="text-2xl font-bold">
                                                {roll.total}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Detailed Results */}
                                    <div className="space-y-2">
                                        {roll.details.dice.map(
                                            (diceGroup, diceIndex) => (
                                                <div
                                                    key={diceIndex}
                                                    className="text-sm"
                                                >
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="font-medium">
                                                            {diceGroup.type}:
                                                        </span>
                                                        {diceGroup.rolls
                                                            .length > 1 ? (
                                                            <>
                                                                <div className="flex gap-1">
                                                                    {diceGroup.rolls.map(
                                                                        (
                                                                            rollValue,
                                                                            rollIndex
                                                                        ) => (
                                                                            <Badge
                                                                                key={
                                                                                    rollIndex
                                                                                }
                                                                                variant="outline"
                                                                                className={`
                                                                            ${
                                                                                roll
                                                                                    .details
                                                                                    .advantage &&
                                                                                rollValue ===
                                                                                    Math.max(
                                                                                        ...diceGroup.rolls
                                                                                    )
                                                                                    ? "bg-green-500"
                                                                                    : ""
                                                                            }
                                                                            ${
                                                                                roll
                                                                                    .details
                                                                                    .disadvantage &&
                                                                                rollValue ===
                                                                                    Math.min(
                                                                                        ...diceGroup.rolls
                                                                                    )
                                                                                    ? "bg-red-600"
                                                                                    : ""
                                                                            }
                                                                            ${
                                                                                roll
                                                                                    .details
                                                                                    .advantage &&
                                                                                rollValue !==
                                                                                    Math.max(
                                                                                        ...diceGroup.rolls
                                                                                    )
                                                                                    ? "opacity-50 line-through"
                                                                                    : ""
                                                                            }
                                                                            ${
                                                                                roll
                                                                                    .details
                                                                                    .disadvantage &&
                                                                                rollValue !==
                                                                                    Math.min(
                                                                                        ...diceGroup.rolls
                                                                                    )
                                                                                    ? "opacity-50 line-through"
                                                                                    : ""
                                                                            }
                                                                        `}
                                                                            >
                                                                                {
                                                                                    rollValue
                                                                                }
                                                                            </Badge>
                                                                        )
                                                                    )}
                                                                </div>
                                                                {!roll.details
                                                                    .advantage &&
                                                                    !roll
                                                                        .details
                                                                        .disadvantage && (
                                                                        <>
                                                                            <span>
                                                                                =
                                                                            </span>
                                                                            <Badge variant="secondary">
                                                                                {
                                                                                    diceGroup.total
                                                                                }
                                                                            </Badge>
                                                                        </>
                                                                    )}
                                                            </>
                                                        ) : (
                                                            <Badge variant="secondary">
                                                                {
                                                                    diceGroup
                                                                        .rolls[0]
                                                                }
                                                            </Badge>
                                                        )}
                                                    </div>

                                                    {/* D100 Special Display */}
                                                    {roll.details.d100Details &&
                                                        diceGroup.type.includes(
                                                            "d100"
                                                        ) && (
                                                            <div className="ml-4 text-xs text-muted-foreground">
                                                                Tens die:{" "}
                                                                {roll.details
                                                                    .d100Details
                                                                    .tens === 0
                                                                    ? "00"
                                                                    : roll
                                                                          .details
                                                                          .d100Details
                                                                          .tens *
                                                                      10}
                                                                , Ones die:{" "}
                                                                {
                                                                    roll.details
                                                                        .d100Details
                                                                        .ones
                                                                }
                                                            </div>
                                                        )}
                                                </div>
                                            )
                                        )}

                                        {/* Modifier Display */}
                                        {roll.details.modifier && (
                                            <div className="text-sm">
                                                <span className="font-medium">
                                                    Modifier:
                                                </span>
                                                <Badge
                                                    variant="outline"
                                                    className="ml-2"
                                                >
                                                    {roll.details.modifier > 0
                                                        ? "+"
                                                        : ""}
                                                    {roll.details.modifier}
                                                </Badge>
                                            </div>
                                        )}

                                        {/* Final Total for Complex Rolls */}
                                        {(roll.details.dice.length > 1 ||
                                            roll.details.modifier) && (
                                            <div className="text-sm border-t pt-2">
                                                <span className="font-medium">
                                                    Total:{" "}
                                                </span>
                                                <Badge variant="default">
                                                    {roll.total}
                                                </Badge>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
