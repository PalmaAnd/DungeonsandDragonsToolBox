"use client";

import { Fragment, useState } from "react";
import { Input } from "@/components/ui/input";
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
import type { SpellSummary } from "@/lib/spells";

interface SpellListProps {
    spells: SpellSummary[];
}

export function SpellList({ spells }: SpellListProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterLevel, setFilterLevel] = useState("all");
    const [expandedRow, setExpandedRow] = useState<number | null>(null);
    const [descriptions, setDescriptions] = useState<Record<string, string>>(
        {}
    );
    const [loadingSpell, setLoadingSpell] = useState<string | null>(null);

    const filteredSpells = spells.filter(
        (spell) =>
            spell.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (filterLevel === "all" || spell.level.toString() === filterLevel)
    );

    // The description is the bulk of a spell record's size, so it's only
    // fetched once a row is expanded, then cached by name.
    const toggleExpandRow = async (index: number, name: string) => {
        if (expandedRow === index) {
            setExpandedRow(null);
            return;
        }
        setExpandedRow(index);
        if (descriptions[name] !== undefined) return;

        setLoadingSpell(name);
        try {
            const res = await fetch(`/api/spells/${encodeURIComponent(name)}`);
            if (!res.ok) throw new Error("Failed to load spell");
            const spell: { description: string } = await res.json();
            setDescriptions((prev) => ({ ...prev, [name]: spell.description }));
        } catch {
            setDescriptions((prev) => ({
                ...prev,
                [name]: "Failed to load description. Please try again.",
            }));
        } finally {
            setLoadingSpell(null);
        }
    };

    return (
        <div>
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
                        <Fragment key={spell.name}>
                            <TableRow
                                onClick={() =>
                                    toggleExpandRow(index, spell.name)
                                }
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
                                            {loadingSpell === spell.name
                                                ? "Loading..."
                                                : descriptions[spell.name]}
                                        </div>
                                        <div>
                                            <strong>Duration:</strong>{" "}
                                            {spell.duration}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </Fragment>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
