"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Beer,
    Users,
    Utensils,
    Music,
    Volume2,
    User,
    MapPin,
    Star,
    ChevronDown,
    ChevronUp,
    Trash2,
} from "lucide-react";
import { generateTavernName, generateNpcName } from "@/lib/generator";
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from "@/lib/storage";

const atmospheres = [
    "Cozy",
    "Rowdy",
    "Mysterious",
    "Elegant",
    "Seedy",
    "Rustic",
    "Luxurious",
    "Haunted",
    "Festive",
    "Quiet",
];
const tavernTypes = ["Inn", "Pub", "Tavern", "Alehouse", "Brewery"];

const specialties = [
    "Hearty stew",
    "Exotic ales",
    "Spiced wine",
    "Roasted meats",
    "Freshly baked pies",
    "Seafood platter",
    "Vegetarian feast",
    "Dragon pepper wings",
    "Dwarven ale",
    "Elven bread",
    "Mystery meat",
    "Goblin grog",
    "Phoenix feather soup",
    "Giant's brew",
];

const entertainments = [
    "Live bard performances",
    "Dice games",
    "Arm wrestling contests",
    "Storytelling nights",
    "Magic shows",
    "Dancing",
    "Trivia contests",
    "Karaoke nights",
    "Poetry readings",
    "Puppet shows",
    "Juggling acts",
    "Fire breathing",
    "Sword swallowing",
    "Acrobatics",
];

const locations = [
    "Near the city gate",
    "In the heart of the market",
    "By the river",
    "On the outskirts of town",
    "Next to the blacksmith",
    "Near the docks",
    "In the forest",
    "On a hilltop",
    "In a hidden alley",
    "Beside the castle",
];

const reputations = [
    "Well-known for its hospitality",
    "Feared for its rowdy patrons",
    "Famous for its delicious food",
    "Renowned for its entertainment",
    "Infamous for its shady dealings",
    "Celebrated for its cleanliness",
    "Notorious for its brawls",
    "Loved for its friendly staff",
    "Hated for its high prices",
    "Admired for its unique decor",
];

function getRandomItem<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

type Tavern = {
    name: string;
    type: string;
    atmosphere: string;
    specialty: string;
    entertainment: string;
    patronCount: number;
    owner: string;
    location: string;
    reputation: string;
};

export default function TavernGenerator() {
    const [tavern, setTavern] = useState<Tavern | null>(null);
    const [savedTaverns, setSavedTaverns] = useState<Tavern[]>([]);
    const [expandedTaverns, setExpandedTaverns] = useState<Set<number>>(
        new Set()
    );

    useEffect(() => {
        setSavedTaverns(loadFromStorage(STORAGE_KEYS.savedTaverns, []));
    }, []);

    const generateTavern = () => {
        setTavern({
            name: generateTavernName(),
            type: getRandomItem(tavernTypes),
            atmosphere: getRandomItem(atmospheres),
            specialty: getRandomItem(specialties),
            entertainment: getRandomItem(entertainments),
            patronCount: Math.floor(Math.random() * 50) + 10,
            owner: generateNpcName(),
            location: getRandomItem(locations),
            reputation: getRandomItem(reputations),
        });
    };

    const saveTavern = () => {
        if (tavern) {
            const updatedTaverns = [...savedTaverns, tavern];
            setSavedTaverns(updatedTaverns);
            saveToStorage(STORAGE_KEYS.savedTaverns, updatedTaverns);
        }
    };

    const deleteTavern = (index: number) => {
        const updatedTaverns = savedTaverns.filter((_, i) => i !== index);
        setSavedTaverns(updatedTaverns);
        saveToStorage(STORAGE_KEYS.savedTaverns, updatedTaverns);
    };

    const toggleExpand = (index: number) => {
        setExpandedTaverns((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Tavern Generator</h1>

            <Button onClick={generateTavern} className="w-full mb-6">
                Generate Tavern
            </Button>

            {tavern && (
                <Card>
                    <CardHeader>
                        <CardTitle>{tavern.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <User className="h-5 w-5" />
                            <span>Owner: {tavern.owner}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <MapPin className="h-5 w-5" />
                            <span>{tavern.location}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Beer className="h-5 w-5" />
                            <span>{tavern.type}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Volume2 className="h-5 w-5" />
                            <span>{tavern.atmosphere} atmosphere</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Utensils className="h-5 w-5" />
                            <span>Specialty: {tavern.specialty}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Music className="h-5 w-5" />
                            <span>Entertainment: {tavern.entertainment}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Users className="h-5 w-5" />
                            <span>Current patrons: {tavern.patronCount}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Star className="h-5 w-5" />
                            <span>Reputation: {tavern.reputation}</span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {tavern && (
                <Button onClick={saveTavern} className="w-full mt-4">
                    Save Tavern
                </Button>
            )}

            {savedTaverns.length > 0 && (
                <div className="mt-8">
                    <h2 className="text-2xl font-bold mb-4">Saved Taverns</h2>
                    {savedTaverns.map((savedTavern, index) => (
                        <Card key={index} className="mb-4">
                            <CardHeader
                                className="cursor-pointer flex justify-between items-center"
                                onClick={() => toggleExpand(index)}
                            >
                                <CardTitle>{savedTavern.name}</CardTitle>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        aria-label="Delete tavern"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteTavern(index);
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                    {expandedTaverns.has(index) ? (
                                        <ChevronUp className="h-5 w-5" />
                                    ) : (
                                        <ChevronDown className="h-5 w-5" />
                                    )}
                                </div>
                            </CardHeader>
                            {expandedTaverns.has(index) && (
                                <CardContent className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <User className="h-5 w-5" />
                                        <span>Owner: {savedTavern.owner}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <MapPin className="h-5 w-5" />
                                        <span>{savedTavern.location}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Beer className="h-5 w-5" />
                                        <span>{savedTavern.type}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Volume2 className="h-5 w-5" />
                                        <span>
                                            {savedTavern.atmosphere} atmosphere
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Utensils className="h-5 w-5" />
                                        <span>
                                            Specialty: {savedTavern.specialty}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Music className="h-5 w-5" />
                                        <span>
                                            Entertainment:{" "}
                                            {savedTavern.entertainment}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Users className="h-5 w-5" />
                                        <span>
                                            Current patrons:{" "}
                                            {savedTavern.patronCount}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Star className="h-5 w-5" />
                                        <span>
                                            Reputation: {savedTavern.reputation}
                                        </span>
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
