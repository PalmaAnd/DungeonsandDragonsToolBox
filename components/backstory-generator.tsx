"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    origins,
    motivations,
    events,
    connections,
} from "@/data/backstory-generator.json";
import { Star, Heart, Shield, Users, Save, Trash2 } from "lucide-react";
import {
    generateId,
    loadFromStorage,
    saveToStorage,
    STORAGE_KEYS,
} from "@/lib/storage";

interface Backstory {
    origin: {
        text: string;
        hooks: string[];
    };
    motivation: {
        text: string;
        complications: string[];
    };
    event: {
        text: string;
        consequences: string[];
    };
    connection: {
        text: string;
        details: string[];
    };
}

function getRandomItem<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

type SavedBackstory = Backstory & { id: string };

export function BackstoryGenerator() {
    const [backstory, setBackstory] = useState<Backstory | null>(null);
    const [savedBackstories, setSavedBackstories] = useState<
        SavedBackstory[]
    >([]);

    useEffect(() => {
        let cancelled = false;
        loadFromStorage<SavedBackstory[]>(
            STORAGE_KEYS.savedBackstories,
            []
        ).then((stored) => {
            if (cancelled) return;
            setSavedBackstories(stored);
        });
        return () => {
            cancelled = true;
        };
    }, []);

    const saveBackstory = () => {
        if (!backstory) return;
        const updated = [...savedBackstories, { ...backstory, id: generateId() }];
        setSavedBackstories(updated);
        saveToStorage(STORAGE_KEYS.savedBackstories, updated);
    };

    const deleteBackstory = (id: string) => {
        const updated = savedBackstories.filter((saved) => saved.id !== id);
        setSavedBackstories(updated);
        saveToStorage(STORAGE_KEYS.savedBackstories, updated);
    };

    const generateBackstory = () => {
        setBackstory({
            origin: getRandomItem(origins),
            motivation: getRandomItem(motivations),
            event: getRandomItem(events),
            connection: getRandomItem(connections),
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
                <Button onClick={generateBackstory}>
                    Generate Backstory
                </Button>
                {backstory && (
                    <Button onClick={saveBackstory} variant="outline">
                        <Save className="mr-2 h-4 w-4" />
                        Save Backstory
                    </Button>
                )}
            </div>
            {backstory && (
                <Card>
                    <CardHeader>
                        <CardTitle>Your Character Backstory</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h3 className="font-semibold flex items-center gap-2">
                                <Star className="h-5 w-5" />
                                Origin:
                            </h3>
                            <p>{backstory.origin.text}</p>
                            <ul className="list-disc list-inside">
                                {backstory.origin.hooks.map((hook, index) => (
                                    <li key={index}>{hook}</li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold flex items-center gap-2">
                                <Heart className="h-5 w-5" />
                                Motivation:
                            </h3>
                            <p>{backstory.motivation.text}</p>
                            <ul className="list-disc list-inside">
                                {backstory.motivation.complications.map(
                                    (complication, index) => (
                                        <li key={index}>{complication}</li>
                                    )
                                )}
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Significant Event:
                            </h3>
                            <p>{backstory.event.text}</p>
                            <ul className="list-disc list-inside">
                                {backstory.event.consequences.map(
                                    (consequence, index) => (
                                        <li key={index}>{consequence}</li>
                                    )
                                )}
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Connection:
                            </h3>
                            <p>{backstory.connection.text}</p>
                            <ul className="list-disc list-inside">
                                {backstory.connection.details.map(
                                    (detail, index) => (
                                        <li key={index}>{detail}</li>
                                    )
                                )}
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            )}

            {savedBackstories.length > 0 && (
                <div className="space-y-2">
                    <h2 className="text-xl font-bold">Saved Backstories</h2>
                    {savedBackstories.map((saved) => (
                        <Card key={saved.id}>
                            <CardHeader className="flex flex-row items-center justify-between py-3">
                                <button
                                    className="text-left"
                                    onClick={() => setBackstory(saved)}
                                >
                                    <CardTitle className="text-base">
                                        {saved.origin.text}
                                    </CardTitle>
                                </button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    aria-label="Delete saved backstory"
                                    onClick={() => deleteBackstory(saved.id)}
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
