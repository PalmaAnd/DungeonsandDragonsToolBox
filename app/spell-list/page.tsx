"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Sparkles } from "lucide-react";

import spells from "@/data/spells.json";
import React from "react";
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from "@/lib/storage";
import type { SavedCharacter } from "@/components/character-creator";

// The character sheet only tracks these four spell buckets -- levels 4-9
// have nowhere to go, so "Add to Character" is only offered for 0-3.
type SpellField = "cantrips" | "level1" | "level2" | "level3";

function spellFieldForLevel(level: number): SpellField | null {
    switch (level) {
        case 0:
            return "cantrips";
        case 1:
            return "level1";
        case 2:
            return "level2";
        case 3:
            return "level3";
        default:
            return null;
    }
}

export default function SpellList() {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterLevel, setFilterLevel] = useState("all");
    const [expandedRow, setExpandedRow] = useState<number | null>(null);
    const [savedCharacters, setSavedCharacters] = useState<SavedCharacter[]>(
        []
    );
    const [targetCharacterId, setTargetCharacterId] = useState("");
    const [addedFeedback, setAddedFeedback] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        loadFromStorage<SavedCharacter[]>(
            STORAGE_KEYS.savedCharacters,
            []
        ).then((stored) => {
            if (cancelled) return;
            setSavedCharacters(stored);
            if (stored.length > 0) setTargetCharacterId(stored[0].id);
        });
        return () => {
            cancelled = true;
        };
    }, []);

    const filteredSpells = spells.filter(
        (spell) =>
            spell.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (filterLevel === "all" || spell.level.toString() === filterLevel)
    );

    const toggleExpandRow = (index: number) => {
        setExpandedRow(expandedRow === index ? null : index);
    };

    const addSpellToCharacter = async (spellName: string, level: number) => {
        const field = spellFieldForLevel(level);
        if (!field || !targetCharacterId) return;

        const updated = savedCharacters.map((saved) => {
            if (saved.id !== targetCharacterId) return saved;
            if (saved.character.spells[field].includes(spellName)) {
                return saved;
            }
            return {
                ...saved,
                character: {
                    ...saved.character,
                    spells: {
                        ...saved.character.spells,
                        [field]: [...saved.character.spells[field], spellName],
                    },
                },
            };
        });

        setSavedCharacters(updated);
        await saveToStorage(STORAGE_KEYS.savedCharacters, updated);

        const targetName = updated.find(
            (saved) => saved.id === targetCharacterId
        )?.character.name;
        setAddedFeedback(`Added "${spellName}" to ${targetName || "character"}.`);
        setTimeout(() => setAddedFeedback(null), 3000);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Spell List</h1>
            {addedFeedback && (
                <p className="text-sm text-muted-foreground mb-4">
                    {addedFeedback}
                </p>
            )}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <Input
                    placeholder="Search spells..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                />
                <Select value={filterLevel} onValueChange={setFilterLevel}>
                    <SelectTrigger className="max-w-[180px]">
                        <SelectValue placeholder="Filter by level" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => (
                            <SelectItem key={level} value={level.toString()}>
                                {level}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Level</TableHead>
                        <TableHead>School</TableHead>
                        <TableHead>Casting Time</TableHead>
                        <TableHead>Range</TableHead>
                        <TableHead>Components</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredSpells.map((spell, index) => (
                        <React.Fragment key={index}>
                            <TableRow
                                onClick={() => toggleExpandRow(index)}
                                className="cursor-pointer"
                            >
                                <TableCell className="font-medium">
                                    {spell.name}
                                </TableCell>
                                <TableCell>{spell.level}</TableCell>
                                <TableCell>{spell.school}</TableCell>
                                <TableCell>{spell.castingTime}</TableCell>
                                <TableCell>{spell.range}</TableCell>
                                <TableCell>{spell.components}</TableCell>
                            </TableRow>
                            {expandedRow === index && (
                                <TableRow>
                                    <TableCell colSpan={6} className="p-4">
                                        <div>
                                            <strong>Description:</strong>{" "}
                                            {spell.description}
                                        </div>
                                        <div>
                                            <strong>Duration:</strong>{" "}
                                            {spell.duration}
                                        </div>
                                        {savedCharacters.length > 0 &&
                                            spellFieldForLevel(
                                                spell.level
                                            ) && (
                                                <div
                                                    className="flex flex-wrap items-center gap-2 mt-3"
                                                    onClick={(e) =>
                                                        e.stopPropagation()
                                                    }
                                                >
                                                    <Select
                                                        value={
                                                            targetCharacterId
                                                        }
                                                        onValueChange={
                                                            setTargetCharacterId
                                                        }
                                                    >
                                                        <SelectTrigger className="w-[220px]">
                                                            <SelectValue placeholder="Choose a character" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {savedCharacters.map(
                                                                (saved) => (
                                                                    <SelectItem
                                                                        key={
                                                                            saved.id
                                                                        }
                                                                        value={
                                                                            saved.id
                                                                        }
                                                                    >
                                                                        {saved
                                                                            .character
                                                                            .name ||
                                                                            "Unnamed"}
                                                                    </SelectItem>
                                                                )
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            addSpellToCharacter(
                                                                spell.name,
                                                                spell.level
                                                            )
                                                        }
                                                    >
                                                        <Sparkles className="h-4 w-4 mr-2" />
                                                        Add to Character
                                                    </Button>
                                                </div>
                                            )}
                                    </TableCell>
                                </TableRow>
                            )}
                        </React.Fragment>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
