/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Store, User, Package, Coins, RefreshCw } from "lucide-react";
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from "@/lib/storage";

// Define types
type ShopStatus = "poor" | "modest" | "prosperous" | "wealthy" | "luxurious";
type ItemRarity = "Common" | "Uncommon" | "Rare" | "Very Rare" | "Legendary";

interface Item {
    name: string;
    type: string;
    description: string;
    basePrice: number;
    rarity?: string;
    adjustedPrice?: number;
}

interface ShopDetails {
    name: string;
    shopkeeperName: string;
    shopkeeperRace: string;
    shopkeeperTrait: string;
    shopkeeperQuirk: string;
    atmosphere: string;
    specialty: string;
    status: ShopStatus;
    priceModifier: number;
}

interface ShopGeneratorProps {
    itemsData: {
        magicalItems: Item[];
        normalItems: Item[];
        shopNames: string[];
        shopkeeperRaces: string[];
        shopkeeperTraits: string[];
        shopkeeperQuirks: string[];
        shopAtmospheres: string[];
        shopSpecialties: string[];
    };
}

// Helper functions
const getRandomItem = <T,>(array: T[]): T => {
    return array[Math.floor(Math.random() * array.length)];
};

const generateShopkeeperName = (): string => {
    const firstNames = [
        "Aldric",
        "Elara",
        "Thorne",
        "Lyra",
        "Gareth",
        "Seraphina",
        "Dorian",
        "Isolde",
        "Cedric",
        "Rowena",
        "Finnian",
        "Thalia",
        "Orion",
        "Elowen",
        "Alaric",
        "Octavia",
    ];
    const lastNames = [
        "Blackwood",
        "Silverstone",
        "Thornfield",
        "Nightshade",
        "Brightwater",
        "Ironheart",
        "Stormwind",
        "Moonshadow",
        "Flameheart",
        "Frostweaver",
        "Starfall",
        "Wildborne",
    ];
    return `${getRandomItem(firstNames)} ${getRandomItem(lastNames)}`;
};

const getStatusPriceModifier = (status: ShopStatus): number => {
    switch (status) {
        case "poor":
            return 0.8;
        case "modest":
            return 1.0;
        case "prosperous":
            return 1.2;
        case "wealthy":
            return 1.5;
        case "luxurious":
            return 2.0;
        default:
            return 1.0;
    }
};

const getRarityChances = (status: ShopStatus) => {
    switch (status) {
        case "poor":
            return {
                common: 0.8,
                uncommon: 0.2,
                rare: 0.0,
                veryRare: 0.0,
                legendary: 0.0,
            };
        case "modest":
            return {
                common: 0.6,
                uncommon: 0.35,
                rare: 0.05,
                veryRare: 0.0,
                legendary: 0.0,
            };
        case "prosperous":
            return {
                common: 0.4,
                uncommon: 0.4,
                rare: 0.15,
                veryRare: 0.05,
                legendary: 0.0,
            };
        case "wealthy":
            return {
                common: 0.2,
                uncommon: 0.4,
                rare: 0.3,
                veryRare: 0.09,
                legendary: 0.01,
            };
        case "luxurious":
            return {
                common: 0.1,
                uncommon: 0.3,
                rare: 0.4,
                veryRare: 0.15,
                legendary: 0.05,
            };
        default:
            return {
                common: 0.6,
                uncommon: 0.3,
                rare: 0.1,
                veryRare: 0.0,
                legendary: 0.0,
            };
    }
};

const filterItemsByRarity = (
    items: Item[],
    rarityChances: { [key: string]: number }
): Item[] => {
    return items.filter((item) => {
        if (!item.rarity) return Math.random() < rarityChances.common;

        const rarity = item.rarity.toLowerCase();
        if (rarity.includes("common"))
            return Math.random() < rarityChances.common;
        if (rarity.includes("uncommon"))
            return Math.random() < rarityChances.uncommon;
        if (rarity.includes("rare") && !rarity.includes("very"))
            return Math.random() < rarityChances.rare;
        if (rarity.includes("very rare"))
            return Math.random() < rarityChances.veryRare;
        if (rarity.includes("legendary"))
            return Math.random() < rarityChances.legendary;

        return Math.random() < rarityChances.common;
    });
};

const adjustItemPrice = (item: Item, priceModifier: number): number => {
    // Add some randomness to the price
    const randomFactor = 0.9 + Math.random() * 0.2; // Between 0.9 and 1.1
    return Math.round(item.basePrice * priceModifier * randomFactor);
};

type ShopState = {
    shopDetails: ShopDetails;
    inventory: Item[];
    shopStatus: ShopStatus;
    cart: Item[];
};

export function ShopGenerator({ itemsData }: ShopGeneratorProps) {
    const [shopDetails, setShopDetails] = useState<ShopDetails | null>(null);
    const [inventory, setInventory] = useState<Item[]>([]);
    const [shopStatus, setShopStatus] = useState<ShopStatus>("modest");
    const [activeTab, setActiveTab] = useState("shop");
    const [cart, setCart] = useState<Item[]>([]);

    const generateShop = () => {
        // Generate shop details
        const name = getRandomItem(itemsData.shopNames);
        const shopkeeperName = generateShopkeeperName();
        const shopkeeperRace = getRandomItem(itemsData.shopkeeperRaces);
        const shopkeeperTrait = getRandomItem(itemsData.shopkeeperTraits);
        const shopkeeperQuirk = getRandomItem(itemsData.shopkeeperQuirks);
        const atmosphere = getRandomItem(itemsData.shopAtmospheres);
        const specialty = getRandomItem(itemsData.shopSpecialties);
        const priceModifier = getStatusPriceModifier(shopStatus);

        setShopDetails({
            name,
            shopkeeperName,
            shopkeeperRace,
            shopkeeperTrait,
            shopkeeperQuirk,
            atmosphere,
            specialty,
            status: shopStatus,
            priceModifier,
        });

        // Generate inventory
        generateInventory(shopStatus, priceModifier);

        // Reset cart
        setCart([]);
    };

    const generateInventory = (status: ShopStatus, priceModifier: number) => {
        const rarityChances = getRarityChances(status);

        // Filter items based on rarity chances
        const availableMagicalItems = filterItemsByRarity(
            itemsData.magicalItems,
            rarityChances
        );
        const availableNormalItems = itemsData.normalItems;

        // Determine number of items based on shop status
        let magicalItemCount = 0;
        let normalItemCount = 0;

        switch (status) {
            case "poor":
                magicalItemCount = Math.floor(Math.random() * 2); // 0-1
                normalItemCount = 5 + Math.floor(Math.random() * 6); // 5-10
                break;
            case "modest":
                magicalItemCount = 1 + Math.floor(Math.random() * 3); // 1-3
                normalItemCount = 8 + Math.floor(Math.random() * 8); // 8-15
                break;
            case "prosperous":
                magicalItemCount = 3 + Math.floor(Math.random() * 4); // 3-6
                normalItemCount = 10 + Math.floor(Math.random() * 11); // 10-20
                break;
            case "wealthy":
                magicalItemCount = 5 + Math.floor(Math.random() * 6); // 5-10
                normalItemCount = 15 + Math.floor(Math.random() * 11); // 15-25
                break;
            case "luxurious":
                magicalItemCount = 8 + Math.floor(Math.random() * 8); // 8-15
                normalItemCount = 20 + Math.floor(Math.random() * 11); // 20-30
                break;
        }

        // Select random items
        const selectedMagicalItems: Item[] = [];
        const selectedNormalItems: Item[] = [];

        // Helper function to select random items without duplicates
        const selectRandomItems = (items: Item[], count: number): Item[] => {
            const selected: Item[] = [];
            const available = [...items];

            for (let i = 0; i < count && available.length > 0; i++) {
                const randomIndex = Math.floor(
                    Math.random() * available.length
                );
                const item = available.splice(randomIndex, 1)[0];

                // Adjust price based on shop status
                const adjustedItem = {
                    ...item,
                    adjustedPrice: adjustItemPrice(item, priceModifier),
                };

                selected.push(adjustedItem);
            }

            return selected;
        };

        if (availableMagicalItems.length > 0) {
            selectedMagicalItems.push(
                ...selectRandomItems(availableMagicalItems, magicalItemCount)
            );
        }

        if (availableNormalItems.length > 0) {
            selectedNormalItems.push(
                ...selectRandomItems(availableNormalItems, normalItemCount)
            );
        }

        // Combine and sort inventory
        const newInventory = [...selectedMagicalItems, ...selectedNormalItems];
        newInventory.sort((a, b) => {
            // Sort by type first
            if (a.type !== b.type) return a.type.localeCompare(b.type);

            // Then by rarity (if applicable)
            const rarityOrder = {
                Common: 1,
                Uncommon: 2,
                Rare: 3,
                "Very Rare": 4,
                Legendary: 5,
            };
            const aRarity = a.rarity
                ? rarityOrder[a.rarity as ItemRarity] || 0
                : 0;
            const bRarity = b.rarity
                ? rarityOrder[b.rarity as ItemRarity] || 0
                : 0;

            if (aRarity !== bRarity) return bRarity - aRarity;

            // Finally by name
            return a.name.localeCompare(b.name);
        });

        setInventory(newInventory);
    };

    const addToCart = (item: Item) => {
        setCart([...cart, item]);
    };

    const removeFromCart = (index: number) => {
        const newCart = [...cart];
        newCart.splice(index, 1);
        setCart(newCart);
    };

    const totalPrice = cart.reduce(
        (sum, item) => sum + (item.adjustedPrice || item.basePrice),
        0
    );

    const regenerateInventory = () => {
        if (shopDetails) {
            generateInventory(shopDetails.status, shopDetails.priceModifier);
        }
    };

    // Restore a saved shop on initial load, otherwise generate a fresh one
    useEffect(() => {
        const saved = loadFromStorage<ShopState | null>(
            STORAGE_KEYS.shopState,
            null
        );
        if (saved) {
            setShopDetails(saved.shopDetails);
            setInventory(saved.inventory);
            setShopStatus(saved.shopStatus);
            setCart(saved.cart);
        } else if (itemsData) {
            generateShop();
        }
    }, [itemsData]);

    // Persist the shop, inventory, status and cart as they change
    useEffect(() => {
        if (!shopDetails) return;
        saveToStorage(STORAGE_KEYS.shopState, {
            shopDetails,
            inventory,
            shopStatus,
            cart,
        });
    }, [shopDetails, inventory, shopStatus, cart]);

    const getStatusLabel = (status: ShopStatus) => {
        switch (status) {
            case "poor":
                return "Poor (struggling business, limited stock)";
            case "modest":
                return "Modest (small local shop)";
            case "prosperous":
                return "Prosperous (successful business)";
            case "wealthy":
                return "Wealthy (high-end establishment)";
            case "luxurious":
                return "Luxurious (exclusive, rare items)";
        }
    };

    const getRarityColor = (rarity?: string) => {
        if (!rarity)
            return "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300";

        if (rarity.includes("Common"))
            return "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
        if (rarity.includes("Uncommon"))
            return "bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-300";
        if (rarity.includes("Rare"))
            return "bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
        if (rarity.includes("Very Rare"))
            return "bg-purple-200 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
        if (rarity.includes("Legendary"))
            return "bg-orange-200 text-orange-800 dark:bg-orange-900 dark:text-orange-300";

        return "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
                <div className="w-full md:w-auto">
                    <Label htmlFor="shop-status">Shop Status</Label>
                    <Select
                        value={shopStatus}
                        onValueChange={(value) =>
                            setShopStatus(value as ShopStatus)
                        }
                    >
                        <SelectTrigger
                            id="shop-status"
                            className="w-full md:w-[250px]"
                        >
                            <SelectValue placeholder="Select shop status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="poor">
                                {getStatusLabel("poor")}
                            </SelectItem>
                            <SelectItem value="modest">
                                {getStatusLabel("modest")}
                            </SelectItem>
                            <SelectItem value="prosperous">
                                {getStatusLabel("prosperous")}
                            </SelectItem>
                            <SelectItem value="wealthy">
                                {getStatusLabel("wealthy")}
                            </SelectItem>
                            <SelectItem value="luxurious">
                                {getStatusLabel("luxurious")}
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button onClick={generateShop} className="w-full md:w-auto">
                    <Store className="mr-2 h-4 w-4" />
                    Generate Shop
                </Button>
            </div>

            {shopDetails && (
                <Tabs
                    defaultValue="shop"
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full"
                >
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="shop">Shop Details</TabsTrigger>
                        <TabsTrigger value="inventory">
                            Inventory ({inventory.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="shop" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Store className="mr-2 h-5 w-5" />
                                    {shopDetails.name}
                                </CardTitle>
                                <CardDescription>
                                    {getStatusLabel(shopDetails.status)}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h3 className="font-semibold flex items-center">
                                        <User className="mr-2 h-4 w-4" />
                                        Shopkeeper
                                    </h3>
                                    <p className="mt-1">
                                        {shopDetails.shopkeeperName}, a{" "}
                                        {shopDetails.shopkeeperTrait.toLowerCase()}{" "}
                                        {shopDetails.shopkeeperRace}
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Quirk: {shopDetails.shopkeeperQuirk}
                                    </p>
                                </div>

                                <Separator />

                                <div>
                                    <h3 className="font-semibold">
                                        Atmosphere
                                    </h3>
                                    <p className="mt-1">
                                        {shopDetails.atmosphere}
                                    </p>
                                </div>

                                <Separator />

                                <div>
                                    <h3 className="font-semibold flex items-center">
                                        <Package className="mr-2 h-4 w-4" />
                                        Specialty
                                    </h3>
                                    <p className="mt-1">
                                        {shopDetails.specialty}
                                    </p>
                                </div>

                                <Separator />

                                <div>
                                    <h3 className="font-semibold flex items-center">
                                        <Coins className="mr-2 h-4 w-4" />
                                        Pricing
                                    </h3>
                                    <p className="mt-1">
                                        {shopDetails.priceModifier < 1
                                            ? "Items are sold at a discount."
                                            : shopDetails.priceModifier > 1.3
                                            ? "Items are sold at premium prices."
                                            : "Items are sold at fair market prices."}
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Price modifier:{" "}
                                        {(
                                            shopDetails.priceModifier * 100
                                        ).toFixed(0)}
                                        %
                                    </p>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => setActiveTab("inventory")}
                                    className="w-full"
                                >
                                    View Inventory
                                </Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>

                    <TabsContent value="inventory" className="space-y-4">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <h2 className="text-xl font-bold">
                                Available Items
                            </h2>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={regenerateInventory}
                            >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Refresh Inventory
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div className="space-y-4">
                                {inventory.map((item, index) => (
                                    <Card key={index}>
                                        <CardHeader className="pb-2">
                                            <div className="flex justify-between items-start">
                                                <CardTitle className="text-lg">
                                                    {item.name}
                                                </CardTitle>
                                                {item.rarity && (
                                                    <Badge
                                                        className={getRarityColor(
                                                            item.rarity
                                                        )}
                                                    >
                                                        {item.rarity}
                                                    </Badge>
                                                )}
                                            </div>
                                            <CardDescription>
                                                {item.type}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="pb-2">
                                            <p className="text-sm">
                                                {item.description}
                                            </p>
                                            <p className="mt-2 font-semibold">
                                                Price:{" "}
                                                {item.adjustedPrice ||
                                                    item.basePrice}{" "}
                                                gp
                                            </p>
                                        </CardContent>
                                        <CardFooter>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => addToCart(item)}
                                                className="w-full"
                                            >
                                                Add to Cart
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>

                            <div>
                                <Card className="sticky top-4">
                                    <CardHeader>
                                        <CardTitle>Shopping Cart</CardTitle>
                                        <CardDescription>
                                            {cart.length} item
                                            {cart.length !== 1 ? "s" : ""}{" "}
                                            selected
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="max-h-[60vh] overflow-y-auto">
                                        {cart.length === 0 ? (
                                            <p className="text-center text-muted-foreground py-4">
                                                Your cart is empty
                                            </p>
                                        ) : (
                                            <div className="space-y-2">
                                                {cart.map((item, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex justify-between items-center p-2 border rounded-md"
                                                    >
                                                        <div>
                                                            <p className="font-medium">
                                                                {item.name}
                                                            </p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {item.adjustedPrice ||
                                                                    item.basePrice}{" "}
                                                                gp
                                                            </p>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                removeFromCart(
                                                                    index
                                                                )
                                                            }
                                                            aria-label="Remove from cart"
                                                        >
                                                            &times;
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                    <CardFooter className="flex flex-col gap-4">
                                        <div className="w-full flex justify-between items-center font-bold">
                                            <span>Total:</span>
                                            <span>{totalPrice} gp</span>
                                        </div>
                                        <Button
                                            className="w-full"
                                            disabled={cart.length === 0}
                                        >
                                            Purchase Items
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            )}
        </div>
    );
}
