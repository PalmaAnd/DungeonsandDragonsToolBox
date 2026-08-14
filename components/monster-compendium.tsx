"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { MonsterCard } from "@/components/monster-card";
import { MonsterDetails } from "@/components/monster-details";
import { Search } from "lucide-react";

interface Monster {
    name: string;
    meta: string;
    "Armor Class": string;
    "Hit Points": string;
    Speed: string;
    STR: string;
    STR_mod: string;
    DEX: string;
    DEX_mod: string;
    CON: string;
    CON_mod: string;
    INT: string;
    INT_mod: string;
    WIS: string;
    WIS_mod: string;
    CHA: string;
    CHA_mod: string;
    "Saving Throws"?: string;
    Skills?: string;
    "Damage Immunities"?: string;
    "Condition Immunities"?: string;
    Senses: string;
    Languages: string;
    Challenge: string;
    Traits: string;
    Actions: string;
    "Legendary Actions"?: string;
    img_url: string;
    type: string;
    size: string;
    alignment: string;
    cr: string;
}

interface MonsterCompendiumProps {
    monsters: Monster[];
}

// Challenge ratings can be a fraction like "1/8"; parse those without eval().
function parseChallengeRating(cr: string): number {
    if (cr.includes("/")) {
        const [numerator, denominator] = cr.split("/");
        return parseFloat(numerator) / parseFloat(denominator);
    }
    return parseFloat(cr);
}

export function MonsterCompendium({ monsters }: MonsterCompendiumProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [crFilter, setCrFilter] = useState("all");
    const [sizeFilter, setSizeFilter] = useState("all");
    const [alignmentFilter, setAlignmentFilter] = useState("all");
    const [selectedMonster, setSelectedMonster] = useState<Monster | null>(
        null
    );

    // Process monster data to ensure consistent CR/type/size/alignment fields.
    // Derives everything from `meta` once here (instead of mutating shared
    // monster objects during render) so every consumer sees the same values.
    const processedMonsters = useMemo(() => {
        return monsters.map((monster) => {
            const [rawSize, rawType, rawAlignment] = monster.meta.split(" ");
            const type = rawType.replace(",", "");
            return {
                ...monster,
                cr:
                    monster.cr ||
                    (monster.Challenge
                        ? monster.Challenge.replace("CR ", "").split(" (")[0]
                        : monster.cr),
                size: rawSize,
                type: type.charAt(0).toUpperCase() + type.slice(1),
                alignment: rawAlignment,
            };
        });
    }, [monsters]);

    const monsterTypes = useMemo(
        () =>
            Array.from(
                new Set(processedMonsters.map((monster) => monster.type))
            ).sort(),
        [processedMonsters]
    );
    const monsterSizes = useMemo(
        () =>
            Array.from(
                new Set(processedMonsters.map((monster) => monster.size))
            ).sort(),
        [processedMonsters]
    );
    const monsterAlignments = useMemo(
        () =>
            Array.from(
                new Set(
                    processedMonsters.map((monster) => monster.alignment)
                )
            ).sort(),
        [processedMonsters]
    );

    // Get unique challenge ratings for filter
    const challengeRatings = useMemo(() => {
        const ratings = new Set(processedMonsters.map((monster) => monster.cr));
        return Array.from(ratings).sort(
            (a, b) => parseChallengeRating(a) - parseChallengeRating(b)
        );
    }, [processedMonsters]);

    // Filter monsters based on search term and filters
    const filteredMonsters = useMemo(() => {
        return processedMonsters.filter((monster) => {
            const matchesSearch = monster.name
                .toLowerCase()
                .includes(searchTerm.toLowerCase());
            const matchesType =
                typeFilter === "all" || monster.type === typeFilter;
            const matchesCR = crFilter === "all" || monster.cr === crFilter;
            const matchesSize =
                sizeFilter === "all" || monster.size === sizeFilter;
            const matchesAlignment =
                alignmentFilter === "all" ||
                monster.alignment === alignmentFilter;

            return (
                matchesSearch &&
                matchesType &&
                matchesCR &&
                matchesSize &&
                matchesAlignment
            );
        });
    }, [
        processedMonsters,
        searchTerm,
        typeFilter,
        crFilter,
        sizeFilter,
        alignmentFilter,
    ]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <Label htmlFor="search" className="sr-only">
                        Search Monsters
                    </Label>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="search"
                            placeholder="Search monsters..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                    <div>
                        <Label htmlFor="type-filter" className="sr-only">
                            Filter by type
                        </Label>
                        <Select
                            value={typeFilter}
                            onValueChange={setTypeFilter}
                        >
                            <SelectTrigger
                                id="type-filter"
                                className="w-[180px]"
                            >
                                <SelectValue placeholder="Filter by type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                {monsterTypes.map((type) => (
                                    <SelectItem key={type} value={type}>
                                        {type}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="cr-filter" className="sr-only">
                            Filter by CR
                        </Label>
                        <Select value={crFilter} onValueChange={setCrFilter}>
                            <SelectTrigger id="cr-filter" className="w-[180px]">
                                <SelectValue placeholder="Filter by CR" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All CRs</SelectItem>
                                {challengeRatings.map((cr) => (
                                    <SelectItem key={cr} value={cr}>
                                        CR {cr}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="size-filter" className="sr-only">
                            Filter by Size
                        </Label>
                        <Select
                            value={sizeFilter}
                            onValueChange={setSizeFilter}
                        >
                            <SelectTrigger
                                id="size-filter"
                                className="w-[180px]"
                            >
                                <SelectValue placeholder="Filter by size" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Sizes</SelectItem>
                                {monsterSizes.map((size) => (
                                    <SelectItem key={size} value={size}>
                                        {size}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="alignment-filter" className="sr-only">
                            Filter by Alignment
                        </Label>
                        <Select
                            value={alignmentFilter}
                            onValueChange={setAlignmentFilter}
                        >
                            <SelectTrigger
                                id="alignment-filter"
                                className="w-[180px]"
                            >
                                <SelectValue placeholder="Filter by alignment" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    All Alignments
                                </SelectItem>
                                {monsterAlignments.map((alignment) => (
                                    <SelectItem
                                        key={alignment}
                                        value={alignment}
                                    >
                                        {alignment}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {selectedMonster ? (
                <div className="space-y-4">
                    <Button
                        variant="outline"
                        onClick={() => setSelectedMonster(null)}
                        className="mb-4"
                    >
                        Back to List
                    </Button>
                    <MonsterDetails monster={selectedMonster} />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMonsters.length > 0 ? (
                        filteredMonsters.map((monster) => (
                            <MonsterCard
                                key={monster.name}
                                monster={monster}
                                onClick={() => setSelectedMonster(monster)}
                            />
                        ))
                    ) : (
                        <Card className="col-span-full">
                            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                                <Search className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium">
                                    No monsters found
                                </h3>
                                <p className="text-muted-foreground">
                                    Try adjusting your search or filters to find
                                    what you re looking for.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
}
