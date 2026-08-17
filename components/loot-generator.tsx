"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Coins,
    Package,
    Gem,
    Palette,
    RefreshCw,
    Sparkles,
    Save,
    Trash2,
} from "lucide-react";
import lootData from "@/data/loot-generator.json";
import {
    generateId,
    loadFromStorage,
    saveToStorage,
    STORAGE_KEYS,
} from "@/lib/storage";
import { AddToCampaignButton } from "@/components/add-to-campaign-button";

type LootItem = {
    name: string;
    description: string;
    value: string;
    type:
        | "common"
        | "uncommon"
        | "rare"
        | "veryRare"
        | "legendary"
        | "gem"
        | "artObject";
};

type Loot = {
    gold: number;
    container: string;
    items: LootItem[];
};

function getRandomItem<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

function getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomGold(min: number, max: number): number {
    return getRandomInt(min, max);
}

type LootSettings = {
    tier: string;
    includeGems: boolean;
    includeArtObjects: boolean;
    includeMagicItems: boolean;
};

type SavedLoot = Loot & { id: string };

const defaultSettings: LootSettings = {
    tier: "low",
    includeGems: true,
    includeArtObjects: true,
    includeMagicItems: true,
};

export function LootGenerator() {
    const [loot, setLoot] = useState<Loot | null>(null);
    const [tier, setTier] = useState<string>(defaultSettings.tier);
    const [isLoading, setIsLoading] = useState(false);
    const [includeGems, setIncludeGems] = useState(defaultSettings.includeGems);
    const [includeArtObjects, setIncludeArtObjects] = useState(
        defaultSettings.includeArtObjects
    );
    const [includeMagicItems, setIncludeMagicItems] = useState(
        defaultSettings.includeMagicItems
    );
    const [savedLoot, setSavedLoot] = useState<SavedLoot[]>([]);

    useEffect(() => {
        let cancelled = false;
        Promise.all([
            loadFromStorage<LootSettings>(
                STORAGE_KEYS.lootSettings,
                defaultSettings
            ),
            loadFromStorage<SavedLoot[]>(STORAGE_KEYS.savedLoot, []),
        ]).then(([settings, savedLootResult]) => {
            if (cancelled) return;
            setTier(settings.tier);
            setIncludeGems(settings.includeGems);
            setIncludeArtObjects(settings.includeArtObjects);
            setIncludeMagicItems(settings.includeMagicItems);
            setSavedLoot(savedLootResult);
        });
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.lootSettings, {
            tier,
            includeGems,
            includeArtObjects,
            includeMagicItems,
        });
    }, [tier, includeGems, includeArtObjects, includeMagicItems]);

    const saveLoot = () => {
        if (!loot) return;
        const updated = [...savedLoot, { ...loot, id: generateId() }];
        setSavedLoot(updated);
        saveToStorage(STORAGE_KEYS.savedLoot, updated);
    };

    const deleteLoot = (id: string) => {
        const updated = savedLoot.filter((saved) => saved.id !== id);
        setSavedLoot(updated);
        saveToStorage(STORAGE_KEYS.savedLoot, updated);
    };

    const generateLoot = () => {
        setIsLoading(true);

        setTimeout(() => {
            const selectedTier =
                lootData.tiers.find((t) => t.name === tier) ||
                lootData.tiers[0];
            const gold = getRandomGold(
                selectedTier.goldRange[0],
                selectedTier.goldRange[1]
            );
            const container = getRandomItem(lootData.containers);
            const items: LootItem[] = [];

            // Add common items
            const commonItemCount = getRandomInt(1, 3);
            for (let i = 0; i < commonItemCount; i++) {
                const item = getRandomItem(lootData.items.common);
                items.push({
                    ...item,
                    type: "common",
                });
            }

            // Add gems based on chance
            if (includeGems && Math.random() < selectedTier.gemChance) {
                const gemCount = getRandomInt(1, 2);
                for (let i = 0; i < gemCount; i++) {
                    const gem = getRandomItem(lootData.gems);
                    items.push({
                        ...gem,
                        type: "gem",
                    });
                }
            }

            // Add art objects based on chance
            if (
                includeArtObjects &&
                Math.random() < selectedTier.artObjectChance
            ) {
                const artObject = getRandomItem(lootData.artObjects);
                items.push({
                    ...artObject,
                    type: "artObject",
                });
            }

            // Add magic items based on tier and chance
            if (
                includeMagicItems &&
                Math.random() < selectedTier.magicItemChance
            ) {
                let magicItem;

                switch (tier) {
                    case "low":
                        if (Math.random() < 0.8) {
                            magicItem = getRandomItem(lootData.items.common);
                            items.push({
                                ...magicItem,
                                type: "common",
                            });
                        } else {
                            magicItem = getRandomItem(lootData.items.uncommon);
                            items.push({
                                ...magicItem,
                                type: "uncommon",
                            });
                        }
                        break;

                    case "medium":
                        if (Math.random() < 0.6) {
                            magicItem = getRandomItem(lootData.items.uncommon);
                            items.push({
                                ...magicItem,
                                type: "uncommon",
                            });
                        } else {
                            magicItem = getRandomItem(lootData.items.rare);
                            items.push({
                                ...magicItem,
                                type: "rare",
                            });
                        }
                        break;

                    case "high":
                        if (Math.random() < 0.5) {
                            magicItem = getRandomItem(lootData.items.rare);
                            items.push({
                                ...magicItem,
                                type: "rare",
                            });
                        } else {
                            magicItem = getRandomItem(lootData.items.veryRare);
                            items.push({
                                ...magicItem,
                                type: "veryRare",
                            });
                        }
                        break;

                    case "legendary":
                        if (Math.random() < 0.7) {
                            magicItem = getRandomItem(lootData.items.veryRare);
                            items.push({
                                ...magicItem,
                                type: "veryRare",
                            });
                        } else {
                            magicItem = getRandomItem(lootData.items.legendary);
                            items.push({
                                ...magicItem,
                                type: "legendary",
                            });
                        }
                        break;
                }
            }

            setLoot({
                gold,
                container,
                items,
            });

            setIsLoading(false);
        }, 500); // Simulate loading for better UX
    };

    const getTotalValue = () => {
        if (!loot) return "0 gp";

        let total = loot.gold;

        loot.items.forEach((item) => {
            const valueMatch = item.value.match(/(\d+,?\d*)/g);
            if (valueMatch) {
                const valueStr = valueMatch[0].replace(/,/g, "");
                const value = Number.parseInt(valueStr);

                if (item.value.includes("cp")) {
                    total += value / 100;
                } else if (item.value.includes("sp")) {
                    total += value / 10;
                } else {
                    total += value;
                }
            }
        });

        return `${Math.round(total)} gp`;
    };

    const getItemRarityColor = (type: string) => {
        switch (type) {
            case "common":
                return "bg-gray-100 text-gray-800";
            case "uncommon":
                return "bg-green-100 text-green-800";
            case "rare":
                return "bg-blue-100 text-blue-800";
            case "veryRare":
                return "bg-purple-100 text-purple-800";
            case "legendary":
                return "bg-amber-100 text-amber-800";
            case "gem":
                return "bg-pink-100 text-pink-800";
            case "artObject":
                return "bg-indigo-100 text-indigo-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getItemTypeLabel = (type: string) => {
        switch (type) {
            case "common":
                return "Common";
            case "uncommon":
                return "Uncommon";
            case "rare":
                return "Rare";
            case "veryRare":
                return "Very Rare";
            case "legendary":
                return "Legendary";
            case "gem":
                return "Gem";
            case "artObject":
                return "Art Object";
            default:
                return type;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                <div className="grid gap-2 flex-1">
                    <h1 className="text-3xl font-bold">Loot Generator</h1>
                    <p className="text-muted-foreground">
                        Generate treasure hoards for your adventures.
                    </p>
                </div>
                <div className="flex gap-2">
                    {loot && (
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={saveLoot}
                            >
                                <Save className="h-4 w-4 mr-2" />
                                Save Loot
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setLoot(null)}
                            >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Reset
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Generate Loot</CardTitle>
                    <CardDescription>
                        Customize your loot generation based on challenge
                        rating.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="text-sm font-medium mb-1 block">
                                Treasure Tier
                            </label>
                            <Select value={tier} onValueChange={setTier}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select tier" />
                                </SelectTrigger>
                                <SelectContent>
                                    {lootData.tiers.map((t) => (
                                        <SelectItem key={t.name} value={t.name}>
                                            {t.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">
                                Include
                            </label>
                            <div className="flex gap-2">
                                <Button
                                    variant={
                                        includeGems ? "default" : "outline"
                                    }
                                    size="sm"
                                    onClick={() => setIncludeGems(!includeGems)}
                                    className="flex-1"
                                >
                                    <Gem className="h-4 w-4 mr-2" />
                                    Gems
                                </Button>
                                <Button
                                    variant={
                                        includeArtObjects
                                            ? "default"
                                            : "outline"
                                    }
                                    size="sm"
                                    onClick={() =>
                                        setIncludeArtObjects(!includeArtObjects)
                                    }
                                    className="flex-1"
                                >
                                    <Palette className="h-4 w-4 mr-2" />
                                    Art
                                </Button>
                                <Button
                                    variant={
                                        includeMagicItems
                                            ? "default"
                                            : "outline"
                                    }
                                    size="sm"
                                    onClick={() =>
                                        setIncludeMagicItems(!includeMagicItems)
                                    }
                                    className="flex-1"
                                >
                                    <Sparkles className="h-4 w-4 mr-2" />
                                    Magic
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button
                        onClick={generateLoot}
                        className="w-full"
                        disabled={isLoading}
                    >
                        {isLoading ? "Generating..." : "Generate Loot"}
                    </Button>
                </CardFooter>
            </Card>

            {loot && (
                <Card className="overflow-hidden">
                    <CardHeader className="bg-primary/5">
                        <div className="flex justify-between items-center">
                            <CardTitle>Treasure Hoard</CardTitle>
                            <Badge variant="outline" className="ml-2">
                                Total: {getTotalValue()}
                            </Badge>
                        </div>
                        <CardDescription>
                            Found in a {loot.container}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Tabs defaultValue="all">
                            <TabsList className="w-full rounded-none border-b">
                                <TabsTrigger value="all" className="flex-1">
                                    All Items
                                </TabsTrigger>
                                <TabsTrigger
                                    value="valuables"
                                    className="flex-1"
                                >
                                    Valuables
                                </TabsTrigger>
                                <TabsTrigger value="magic" className="flex-1">
                                    Magic Items
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="all" className="p-6 space-y-4">
                                <div className="flex items-center gap-2">
                                    <Coins className="h-5 w-5 text-yellow-500" />
                                    <h3 className="font-semibold">Gold</h3>
                                </div>
                                <p className="text-2xl font-bold text-yellow-600">
                                    {loot.gold} gp
                                </p>

                                <Separator />

                                <div className="flex items-center gap-2">
                                    <Package className="h-5 w-5 text-primary" />
                                    <h3 className="font-semibold">Items</h3>
                                </div>

                                <ScrollArea className="h-[300px] pr-4">
                                    <div className="space-y-4">
                                        {loot.items.map((item, index) => (
                                            <Card
                                                key={index}
                                                className="overflow-hidden"
                                            >
                                                <CardHeader className="p-4 pb-2">
                                                    <div className="flex justify-between items-start">
                                                        <CardTitle className="text-base">
                                                            {item.name}
                                                        </CardTitle>
                                                        <Badge
                                                            className={getItemRarityColor(
                                                                item.type
                                                            )}
                                                        >
                                                            {getItemTypeLabel(
                                                                item.type
                                                            )}
                                                        </Badge>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="p-4 pt-0 space-y-2">
                                                    <p className="text-sm text-muted-foreground">
                                                        {item.description}
                                                    </p>
                                                    <div className="flex items-center text-sm">
                                                        <Coins className="h-3.5 w-3.5 mr-1 text-yellow-500" />
                                                        <span>
                                                            {item.value}
                                                        </span>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </TabsContent>

                            <TabsContent
                                value="valuables"
                                className="p-6 space-y-4"
                            >
                                <div className="flex items-center gap-2">
                                    <Coins className="h-5 w-5 text-yellow-500" />
                                    <h3 className="font-semibold">Gold</h3>
                                </div>
                                <p className="text-2xl font-bold text-yellow-600">
                                    {loot.gold} gp
                                </p>

                                <Separator />

                                <div className="flex items-center gap-2">
                                    <Gem className="h-5 w-5 text-pink-500" />
                                    <h3 className="font-semibold">
                                        Gems & Art Objects
                                    </h3>
                                </div>

                                <div className="space-y-4">
                                    {loot.items
                                        .filter(
                                            (item) =>
                                                item.type === "gem" ||
                                                item.type === "artObject"
                                        )
                                        .map((item, index) => (
                                            <Card
                                                key={index}
                                                className="overflow-hidden"
                                            >
                                                <CardHeader className="p-4 pb-2">
                                                    <div className="flex justify-between items-start">
                                                        <CardTitle className="text-base">
                                                            {item.name}
                                                        </CardTitle>
                                                        <Badge
                                                            className={getItemRarityColor(
                                                                item.type
                                                            )}
                                                        >
                                                            {getItemTypeLabel(
                                                                item.type
                                                            )}
                                                        </Badge>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="p-4 pt-0 space-y-2">
                                                    <p className="text-sm text-muted-foreground">
                                                        {item.description}
                                                    </p>
                                                    <div className="flex items-center text-sm">
                                                        <Coins className="h-3.5 w-3.5 mr-1 text-yellow-500" />
                                                        <span>
                                                            {item.value}
                                                        </span>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}

                                    {loot.items.filter(
                                        (item) =>
                                            item.type === "gem" ||
                                            item.type === "artObject"
                                    ).length === 0 && (
                                        <p className="text-center text-muted-foreground py-4">
                                            No gems or art objects found.
                                        </p>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent
                                value="magic"
                                className="p-6 space-y-4"
                            >
                                <div className="flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-purple-500" />
                                    <h3 className="font-semibold">
                                        Magic Items
                                    </h3>
                                </div>

                                <div className="space-y-4">
                                    {loot.items
                                        .filter((item) =>
                                            [
                                                "uncommon",
                                                "rare",
                                                "veryRare",
                                                "legendary",
                                            ].includes(item.type)
                                        )
                                        .map((item, index) => (
                                            <Card
                                                key={index}
                                                className="overflow-hidden"
                                            >
                                                <CardHeader className="p-4 pb-2">
                                                    <div className="flex justify-between items-start">
                                                        <CardTitle className="text-base">
                                                            {item.name}
                                                        </CardTitle>
                                                        <Badge
                                                            className={getItemRarityColor(
                                                                item.type
                                                            )}
                                                        >
                                                            {getItemTypeLabel(
                                                                item.type
                                                            )}
                                                        </Badge>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="p-4 pt-0 space-y-2">
                                                    <p className="text-sm text-muted-foreground">
                                                        {item.description}
                                                    </p>
                                                    <div className="flex items-center text-sm">
                                                        <Coins className="h-3.5 w-3.5 mr-1 text-yellow-500" />
                                                        <span>
                                                            {item.value}
                                                        </span>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}

                                    {loot.items.filter((item) =>
                                        [
                                            "uncommon",
                                            "rare",
                                            "veryRare",
                                            "legendary",
                                        ].includes(item.type)
                                    ).length === 0 && (
                                        <p className="text-center text-muted-foreground py-4">
                                            No magic items found.
                                        </p>
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            )}

            {savedLoot.length > 0 && (
                <div className="space-y-2">
                    <h2 className="text-xl font-bold">Saved Loot</h2>
                    {savedLoot.map((saved) => (
                        <Card key={saved.id}>
                            <CardHeader className="flex flex-row items-center justify-between py-3">
                                <button
                                    className="text-left"
                                    onClick={() => setLoot(saved)}
                                >
                                    <CardTitle className="text-base">
                                        {saved.gold} gp in a {saved.container}
                                    </CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                        {saved.items.length} item
                                        {saved.items.length === 1 ? "" : "s"}
                                    </p>
                                </button>
                                <div className="flex items-center">
                                    <AddToCampaignButton
                                        field="lootIds"
                                        entityId={saved.id}
                                    />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        aria-label="Delete saved loot"
                                        onClick={() => deleteLoot(saved.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
