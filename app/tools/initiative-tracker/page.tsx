/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    PlusCircle,
    Trash2,
    Swords,
    Shield,
    Heart,
    User,
    Skull,
    CheckCircle,
    XCircle,
    Clock,
    Play,
    Pause,
    RotateCcw,
    AlertTriangle,
    Brain,
    Zap,
    Flame,
    Snowflake,
    Eye,
    EyeOff,
    Target,
    Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from "@/lib/storage";

type Condition = {
    name: string;
    description: string;
    icon: React.ReactNode;
    color: string;
};

type Combatant = {
    id: number;
    name: string;
    initiative: number;
    initiativeModifier: number;
    hp: number;
    maxHp: number;
    ac: number;
    isPlayer: boolean;
    savingThrows: number;
    failedSaves: number;
    conditions: string[];
};

type EncounterState = {
    combatants: Combatant[];
    currentTurn: number;
    isCombatActive: boolean;
    maxTurnTime: number;
};

const CONDITIONS: Record<string, Condition> = {
    blinded: {
        name: "Blinded",
        description: "Can't see, attacks have disadvantage",
        icon: <EyeOff className="h-3 w-3" />,
        color: "bg-gray-500",
    },
    charmed: {
        name: "Charmed",
        description: "Can't attack the charmer",
        icon: <Heart className="h-3 w-3" />,
        color: "bg-pink-500",
    },
    deafened: {
        name: "Deafened",
        description: "Can't hear, auto-fail sound-based checks",
        icon: <Brain className="h-3 w-3" />,
        color: "bg-purple-500",
    },
    frightened: {
        name: "Frightened",
        description: "Disadvantage on ability checks and attacks",
        icon: <AlertTriangle className="h-3 w-3" />,
        color: "bg-yellow-500",
    },
    grappled: {
        name: "Grappled",
        description: "Speed becomes 0",
        icon: <Target className="h-3 w-3" />,
        color: "bg-orange-500",
    },
    incapacitated: {
        name: "Incapacitated",
        description: "Can't take actions or reactions",
        icon: <Skull className="h-3 w-3" />,
        color: "bg-red-500",
    },
    invisible: {
        name: "Invisible",
        description: "Can't be seen, attacks have advantage",
        icon: <Eye className="h-3 w-3" />,
        color: "bg-blue-500",
    },
    paralyzed: {
        name: "Paralyzed",
        description: "Incapacitated, auto-fail Str and Dex saves",
        icon: <Zap className="h-3 w-3" />,
        color: "bg-indigo-500",
    },
    petrified: {
        name: "Petrified",
        description: "Transformed into stone, incapacitated",
        icon: <Snowflake className="h-3 w-3" />,
        color: "bg-gray-600",
    },
    poisoned: {
        name: "Poisoned",
        description: "Disadvantage on attacks and ability checks",
        icon: <Flame className="h-3 w-3" />,
        color: "bg-green-500",
    },
    prone: {
        name: "Prone",
        description: "Lying flat, disadvantage on attacks",
        icon: <RotateCcw className="h-3 w-3" />,
        color: "bg-brown-500",
    },
    restrained: {
        name: "Restrained",
        description: "Speed 0, disadvantage on attacks and Dex saves",
        icon: <Target className="h-3 w-3" />,
        color: "bg-red-600",
    },
    stunned: {
        name: "Stunned",
        description: "Incapacitated, auto-fail Str and Dex saves",
        icon: <Sparkles className="h-3 w-3" />,
        color: "bg-yellow-600",
    },
    unconscious: {
        name: "Unconscious",
        description: "Incapacitated, prone, auto-fail Str and Dex saves",
        icon: <Skull className="h-3 w-3" />,
        color: "bg-black",
    },
};

export default function InitiativeTracker() {
    const [combatants, setCombatants] = useState<Combatant[]>([]);
    const [newCombatant, setNewCombatant] = useState({
        name: "",
        initiative: "",
        initiativeModifier: "",
        hp: "",
        ac: "",
        isPlayer: false,
        savingThrows: 3,
    });
    const [currentTurn, setCurrentTurn] = useState(0);
    const [isCombatActive, setIsCombatActive] = useState(false);
    const [hpChange, setHpChange] = useState<{ [key: number]: number }>({});
    const [turnTimer, setTurnTimer] = useState(0);
    const [maxTurnTime, setMaxTurnTime] = useState(120); // 2 minutes default
    const [timerActive, setTimerActive] = useState(false);
    const [, setSelectedConditions] = useState<{
        [key: number]: string[];
    }>({});
    const [showConditionDialog, setShowConditionDialog] = useState<
        number | null
    >(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Restore a saved encounter on initial load (never auto-resume a running timer)
    useEffect(() => {
        const saved = loadFromStorage<EncounterState | null>(
            STORAGE_KEYS.initiativeEncounter,
            null
        );
        if (saved) {
            setCombatants(saved.combatants);
            setCurrentTurn(saved.currentTurn);
            setIsCombatActive(saved.isCombatActive);
            setMaxTurnTime(saved.maxTurnTime);
        }
    }, []);

    // Persist the encounter as it changes
    useEffect(() => {
        saveToStorage(STORAGE_KEYS.initiativeEncounter, {
            combatants,
            currentTurn,
            isCombatActive,
            maxTurnTime,
        });
    }, [combatants, currentTurn, isCombatActive, maxTurnTime]);

    const clearSavedEncounter = () => {
        setCombatants([]);
        setCurrentTurn(0);
        setIsCombatActive(false);
        setTimerActive(false);
    };

    // Timer effect
    useEffect(() => {
        if (timerActive && isCombatActive) {
            timerRef.current = setInterval(() => {
                setTurnTimer((prev) => {
                    if (prev >= maxTurnTime) {
                        // Auto-advance turn when timer expires
                        nextTurn();
                        return 0;
                    }
                    return prev + 1;
                });
            }, 1000);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [timerActive, isCombatActive, maxTurnTime]);

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const getTimerColor = (): string => {
        const percentage = (turnTimer / maxTurnTime) * 100;
        if (percentage >= 90) return "text-red-500";
        if (percentage >= 75) return "text-yellow-500";
        return "text-green-500";
    };

    const loadExampleFight = () => {
        const exampleCombatants: Combatant[] = [
            // Player Characters
            {
                id: 1001,
                name: "Lyra the Rogue",
                initiative: 18,
                initiativeModifier: 4,
                hp: 45,
                maxHp: 58,
                ac: 15,
                isPlayer: true,
                savingThrows: 3,
                failedSaves: 0,
                conditions: ["poisoned"],
            },
            {
                id: 1002,
                name: "Thorin Ironshield",
                initiative: 14,
                initiativeModifier: 1,
                hp: 72,
                maxHp: 72,
                ac: 18,
                isPlayer: true,
                savingThrows: 3,
                failedSaves: 0,
                conditions: [],
            },
            {
                id: 1003,
                name: "Mystic Elara",
                initiative: 12,
                initiativeModifier: 2,
                hp: 28,
                maxHp: 42,
                ac: 12,
                isPlayer: true,
                savingThrows: 3,
                failedSaves: 0,
                conditions: ["charmed"],
            },
            // NPCs/Monsters
            {
                id: 2001,
                name: "Orc Chieftain",
                initiative: 16,
                initiativeModifier: 1,
                hp: 65,
                maxHp: 65,
                ac: 16,
                isPlayer: false,
                savingThrows: 3,
                failedSaves: 0,
                conditions: [],
            },
            {
                id: 2002,
                name: "Orc Warrior #1",
                initiative: 11,
                initiativeModifier: 0,
                hp: 15,
                maxHp: 30,
                ac: 14,
                isPlayer: false,
                savingThrows: 3,
                failedSaves: 0,
                conditions: ["frightened"],
            },
            {
                id: 2003,
                name: "Orc Warrior #2",
                initiative: 9,
                initiativeModifier: 0,
                hp: 30,
                maxHp: 30,
                ac: 14,
                isPlayer: false,
                savingThrows: 3,
                failedSaves: 0,
                conditions: [],
            },
            {
                id: 2004,
                name: "Dire Wolf",
                initiative: 15,
                initiativeModifier: 2,
                hp: 37,
                maxHp: 37,
                ac: 14,
                isPlayer: false,
                savingThrows: 3,
                failedSaves: 0,
                conditions: ["grappled"],
            },
        ];

        setCombatants(
            exampleCombatants.sort((a, b) => b.initiative - a.initiative)
        );

        // Set up conditions
        const conditionsMap: { [key: number]: string[] } = {};
        exampleCombatants.forEach((combatant) => {
            if (combatant.conditions.length > 0) {
                conditionsMap[combatant.id] = combatant.conditions;
            }
        });
        setSelectedConditions(conditionsMap);
    };

    const addCombatant = (e: React.FormEvent) => {
        e.preventDefault();
        if (newCombatant.name && newCombatant.initiative) {
            const combatant: Combatant = {
                id: Date.now(),
                name: newCombatant.name,
                initiative: Number(newCombatant.initiative),
                initiativeModifier:
                    Number(newCombatant.initiativeModifier) || 0,
                hp: Number(newCombatant.hp) || 0,
                maxHp: Number(newCombatant.hp) || 0,
                ac: Number(newCombatant.ac) || 0,
                isPlayer: newCombatant.isPlayer,
                savingThrows: newCombatant.savingThrows,
                failedSaves: 0,
                conditions: [],
            };
            setCombatants((prev) =>
                [...prev, combatant].sort((a, b) => b.initiative - a.initiative)
            );
            setNewCombatant({
                name: "",
                initiative: "",
                initiativeModifier: "",
                hp: "",
                ac: "",
                isPlayer: false,
                savingThrows: 3,
            });
        }
    };

    const removeCombatant = (id: number) => {
        setCombatants((prev) => prev.filter((c) => c.id !== id));
        // Clean up conditions
        setSelectedConditions((prev) => {
            const newConditions = { ...prev };
            delete newConditions[id];
            return newConditions;
        });
    };

    const startCombat = () => {
        if (combatants.length > 0) {
            setIsCombatActive(true);
            setCurrentTurn(0);
            setTurnTimer(0);
            setTimerActive(true);
        }
    };

    const nextTurn = () => {
        let nextTurnIndex = (currentTurn + 1) % combatants.length;
        while (combatants[nextTurnIndex] && combatants[nextTurnIndex].hp <= 0) {
            nextTurnIndex = (nextTurnIndex + 1) % combatants.length;
            if (nextTurnIndex === currentTurn) break; // Prevent infinite loop
        }
        setCurrentTurn(nextTurnIndex);
        setTurnTimer(0); // Reset timer for new turn
    };

    const toggleTimer = () => {
        setTimerActive(!timerActive);
    };

    const resetTimer = () => {
        setTurnTimer(0);
    };

    const rollInitiative = (combatantId: number) => {
        setCombatants((prev) =>
            prev
                .map((c) => {
                    if (c.id === combatantId) {
                        const d20Roll = Math.floor(Math.random() * 20) + 1;
                        const newInitiative = d20Roll + c.initiativeModifier;
                        return { ...c, initiative: newInitiative };
                    }
                    return c;
                })
                .sort((a, b) => b.initiative - a.initiative)
        );
    };

    const addCondition = (combatantId: number, condition: string) => {
        setSelectedConditions((prev) => {
            const current = prev[combatantId] || [];
            if (!current.includes(condition)) {
                return {
                    ...prev,
                    [combatantId]: [...current, condition],
                };
            }
            return prev;
        });

        setCombatants((prev) =>
            prev.map((c) => {
                if (c.id === combatantId) {
                    const currentConditions = c.conditions || [];
                    if (!currentConditions.includes(condition)) {
                        return {
                            ...c,
                            conditions: [...currentConditions, condition],
                        };
                    }
                }
                return c;
            })
        );
    };

    const removeCondition = (combatantId: number, condition: string) => {
        setSelectedConditions((prev) => {
            const current = prev[combatantId] || [];
            return {
                ...prev,
                [combatantId]: current.filter((c) => c !== condition),
            };
        });

        setCombatants((prev) =>
            prev.map((c) => {
                if (c.id === combatantId) {
                    return {
                        ...c,
                        conditions: (c.conditions || []).filter(
                            (cond) => cond !== condition
                        ),
                    };
                }
                return c;
            })
        );
    };

    const updateHP = (id: number, change: number) => {
        setCombatants((prev) =>
            prev.map((c) => {
                if (c.id === id) {
                    const newHp = c.hp + change;
                    if (newHp <= 0 && c.hp > 0) {
                        // Combatant has hit 0HP, roll a d20 for saving throw
                        const d20Roll = Math.floor(Math.random() * 20) + 1;
                        if (d20Roll >= 10) {
                            // Success, combatant stays alive
                            return { ...c, hp: 1 };
                        } else {
                            // Fail, combatant dies
                            return { ...c, hp: 0 };
                        }
                    }
                    return { ...c, hp: newHp };
                }
                return c;
            })
        );
    };

    const handleSaveThrow = (id: number, success: boolean) => {
        setCombatants((prev) =>
            prev.map((c) => {
                if (c.id === id) {
                    if (success) {
                        return { ...c, hp: 1, failedSaves: 0 };
                    } else {
                        const newFailedSaves = c.failedSaves + 1;
                        if (newFailedSaves >= 3) {
                            return { ...c, hp: 0, failedSaves: newFailedSaves };
                        }
                        return { ...c, failedSaves: newFailedSaves };
                    }
                }
                return c;
            })
        );
    };

    const handleHpChange = (id: number, value: number) => {
        setHpChange((prev) => ({ ...prev, [id]: value }));
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">Initiative Tracker</h1>
                <div className="flex gap-2">
                    {combatants.length > 0 && (
                        <Button onClick={clearSavedEncounter} variant="outline">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Clear Saved Encounter
                        </Button>
                    )}
                    <Button onClick={loadExampleFight} variant="outline">
                        <Sparkles className="mr-2 h-4 w-4" />
                        Show Example Fight
                    </Button>
                </div>
            </div>

            {/* Combat Timer Controls */}
            {isCombatActive && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Turn Timer
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Label htmlFor="max-time">
                                    Max Turn Time (seconds):
                                </Label>
                                <Input
                                    id="max-time"
                                    type="number"
                                    value={maxTurnTime}
                                    onChange={(e) =>
                                        setMaxTurnTime(Number(e.target.value))
                                    }
                                    className="w-20"
                                />
                            </div>
                            <div
                                className={`text-2xl font-mono ${getTimerColor()}`}
                            >
                                {formatTime(turnTimer)} /{" "}
                                {formatTime(maxTurnTime)}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={toggleTimer}
                            >
                                {timerActive ? (
                                    <Pause className="h-4 w-4" />
                                ) : (
                                    <Play className="h-4 w-4" />
                                )}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={resetTimer}
                            >
                                <RotateCcw className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div
                                className={`h-2 rounded-full transition-all duration-1000 ${
                                    turnTimer >= maxTurnTime * 0.9
                                        ? "bg-red-500"
                                        : turnTimer >= maxTurnTime * 0.75
                                        ? "bg-yellow-500"
                                        : "bg-green-500"
                                }`}
                                style={{
                                    width: `${Math.min(
                                        (turnTimer / maxTurnTime) * 100,
                                        100
                                    )}%`,
                                }}
                            />
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Add Combatant</CardTitle>
                </CardHeader>
                <CardContent>
                    <form
                        onSubmit={addCombatant}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                    >
                        <div>
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={newCombatant.name}
                                onChange={(e) =>
                                    setNewCombatant((prev) => ({
                                        ...prev,
                                        name: e.target.value,
                                    }))
                                }
                                placeholder="Combatant name"
                            />
                        </div>
                        <div>
                            <Label htmlFor="initiative">Initiative</Label>
                            <div className="flex gap-1">
                                <Input
                                    id="initiative"
                                    type="number"
                                    value={newCombatant.initiative}
                                    onChange={(e) =>
                                        setNewCombatant((prev) => ({
                                            ...prev,
                                            initiative: e.target.value,
                                        }))
                                    }
                                    placeholder="Roll"
                                    className="flex-1"
                                />
                                <Input
                                    type="number"
                                    value={newCombatant.initiativeModifier}
                                    onChange={(e) =>
                                        setNewCombatant((prev) => ({
                                            ...prev,
                                            initiativeModifier: e.target.value,
                                        }))
                                    }
                                    placeholder="+Mod"
                                    className="w-16"
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="hp">HP</Label>
                            <Input
                                id="hp"
                                type="number"
                                value={newCombatant.hp}
                                onChange={(e) =>
                                    setNewCombatant((prev) => ({
                                        ...prev,
                                        hp: e.target.value,
                                    }))
                                }
                                placeholder="Hit Points"
                            />
                        </div>
                        <div>
                            <Label htmlFor="ac">AC</Label>
                            <Input
                                id="ac"
                                type="number"
                                value={newCombatant.ac}
                                onChange={(e) =>
                                    setNewCombatant((prev) => ({
                                        ...prev,
                                        ac: e.target.value,
                                    }))
                                }
                                placeholder="Armor Class"
                            />
                        </div>
                        <div>
                            <Label htmlFor="savingThrows">Saving Throws</Label>
                            <Input
                                id="savingThrows"
                                type="number"
                                value={newCombatant.savingThrows}
                                onChange={(e) =>
                                    setNewCombatant((prev) => ({
                                        ...prev,
                                        savingThrows: Number(e.target.value),
                                    }))
                                }
                                placeholder="Saving Throws (default 3)"
                            />
                        </div>
                        <div className="flex items-center space-x-2 pt-8">
                            <input
                                type="checkbox"
                                id="isPlayer"
                                checked={newCombatant.isPlayer}
                                onChange={(e) =>
                                    setNewCombatant((prev) => ({
                                        ...prev,
                                        isPlayer: e.target.checked,
                                    }))
                                }
                                className="h-4 w-4"
                            />
                            <Label htmlFor="isPlayer">Player Character</Label>
                        </div>
                        <div className="pt-6">
                            <Button type="submit" className="w-full">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <div className="flex gap-4 mb-6">
                <Button
                    onClick={startCombat}
                    disabled={isCombatActive || combatants.length === 0}
                >
                    <Swords className="mr-2 h-4 w-4" />
                    Start Combat
                </Button>
                <Button onClick={nextTurn} disabled={!isCombatActive}>
                    Next Turn
                </Button>
                <Button
                    onClick={() => {
                        setIsCombatActive(false);
                        setTimerActive(false);
                        setTurnTimer(0);
                    }}
                    disabled={!isCombatActive}
                    variant="outline"
                >
                    End Combat
                </Button>
            </div>

            <div className="grid gap-4">
                {combatants.map((combatant, index) => (
                    <Card
                        key={combatant.id}
                        className={`${
                            index === currentTurn && isCombatActive
                                ? "border-primary border-2 shadow-lg"
                                : ""
                        } ${
                            combatant.hp <= 0 &&
                            combatant.failedSaves >= combatant.savingThrows
                                ? "border-red-500"
                                : ""
                        }`}
                    >
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold">
                                            {combatant.initiative}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                rollInitiative(combatant.id)
                                            }
                                            className="h-6 text-xs"
                                        >
                                            Reroll
                                        </Button>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold flex items-center gap-2">
                                            {combatant.isPlayer ? (
                                                <User className="h-4 w-4" />
                                            ) : (
                                                <Skull className="h-4 w-4" />
                                            )}
                                            {combatant.name}
                                            {combatant.failedSaves > 0 && (
                                                <span className="flex items-center text-red-500">
                                                    <XCircle className="ml-2 h-4 w-4" />
                                                    {combatant.failedSaves}
                                                </span>
                                            )}
                                        </h3>
                                        <div className="flex gap-4 text-sm text-muted-foreground">
                                            {combatant.hp > 0 && (
                                                <>
                                                    <span className="flex items-center">
                                                        <Heart className="mr-1 h-4 w-4" />
                                                        {combatant.hp}/
                                                        {combatant.maxHp}
                                                    </span>
                                                    <span className="flex items-center">
                                                        <Shield className="mr-1 h-4 w-4" />
                                                        {combatant.ac}
                                                    </span>
                                                    <span className="flex items-center">
                                                        <Target className="mr-1 h-4 w-4" />
                                                        Init Mod: +
                                                        {
                                                            combatant.initiativeModifier
                                                        }
                                                    </span>
                                                </>
                                            )}
                                        </div>

                                        {/* Conditions Display */}
                                        {combatant.conditions &&
                                            combatant.conditions.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {combatant.conditions.map(
                                                        (condition) => (
                                                            <Badge
                                                                key={condition}
                                                                variant="secondary"
                                                                className={`${CONDITIONS[condition]?.color} text-white text-xs cursor-pointer hover:opacity-80`}
                                                                onClick={() =>
                                                                    removeCondition(
                                                                        combatant.id,
                                                                        condition
                                                                    )
                                                                }
                                                                title={`${CONDITIONS[condition]?.description} (Click to remove)`}
                                                            >
                                                                {
                                                                    CONDITIONS[
                                                                        condition
                                                                    ]?.icon
                                                                }
                                                                <span className="ml-1">
                                                                    {
                                                                        CONDITIONS[
                                                                            condition
                                                                        ]?.name
                                                                    }
                                                                </span>
                                                            </Badge>
                                                        )
                                                    )}
                                                </div>
                                            )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {/* Conditions Button */}
                                    <Dialog
                                        open={
                                            showConditionDialog === combatant.id
                                        }
                                        onOpenChange={(open) =>
                                            setShowConditionDialog(
                                                open ? combatant.id : null
                                            )
                                        }
                                    >
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm">
                                                <AlertTriangle className="h-4 w-4" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-2xl">
                                            <DialogHeader>
                                                <DialogTitle>
                                                    Manage Conditions -{" "}
                                                    {combatant.name}
                                                </DialogTitle>
                                            </DialogHeader>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-96 overflow-y-auto">
                                                {Object.entries(CONDITIONS).map(
                                                    ([key, condition]) => (
                                                        <Button
                                                            key={key}
                                                            variant={
                                                                combatant.conditions?.includes(
                                                                    key
                                                                )
                                                                    ? "default"
                                                                    : "outline"
                                                            }
                                                            size="sm"
                                                            onClick={() => {
                                                                if (
                                                                    combatant.conditions?.includes(
                                                                        key
                                                                    )
                                                                ) {
                                                                    removeCondition(
                                                                        combatant.id,
                                                                        key
                                                                    );
                                                                } else {
                                                                    addCondition(
                                                                        combatant.id,
                                                                        key
                                                                    );
                                                                }
                                                            }}
                                                            className="justify-start text-left"
                                                            title={
                                                                condition.description
                                                            }
                                                        >
                                                            {condition.icon}
                                                            <span className="ml-2">
                                                                {condition.name}
                                                            </span>
                                                        </Button>
                                                    )
                                                )}
                                            </div>
                                        </DialogContent>
                                    </Dialog>

                                    {/* HP Management */}
                                    {combatant.hp > 0 ? (
                                        <>
                                            <Input
                                                type="number"
                                                value={
                                                    hpChange[combatant.id] || 1
                                                }
                                                onChange={(e) =>
                                                    handleHpChange(
                                                        combatant.id,
                                                        Number(e.target.value)
                                                    )
                                                }
                                                className="w-16"
                                            />
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    updateHP(
                                                        combatant.id,
                                                        -(
                                                            hpChange[
                                                                combatant.id
                                                            ] || 1
                                                        )
                                                    )
                                                }
                                            >
                                                -
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    updateHP(
                                                        combatant.id,
                                                        hpChange[
                                                            combatant.id
                                                        ] || 1
                                                    )
                                                }
                                            >
                                                +
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    handleSaveThrow(
                                                        combatant.id,
                                                        true
                                                    )
                                                }
                                            >
                                                <CheckCircle className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    handleSaveThrow(
                                                        combatant.id,
                                                        false
                                                    )
                                                }
                                            >
                                                <XCircle className="h-4 w-4" />
                                            </Button>
                                        </>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                            removeCombatant(combatant.id)
                                        }
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
