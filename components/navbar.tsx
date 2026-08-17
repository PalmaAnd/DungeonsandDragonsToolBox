"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileNav } from "@/components/mobile-nav";

export function Navbar() {
    return (
        <header className="sticky top-0 z-30 w-full border-b bg-background">
            <nav className="container flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <MobileNav />
                    <Link
                        href="/"
                        className="flex items-center text-xl font-bold"
                    >
                        <span>D&D Toolbox</span>
                    </Link>
                </div>

                <div className="hidden md:flex md:items-center md:space-x-4">
                    <Button variant="ghost" asChild>
                        <Link href="/character-creator">Character Creator</Link>
                    </Button>
                    <Button variant="ghost" asChild>
                        <Link href="/spell-list">Spell List</Link>
                    </Button>
                    <Button variant="ghost" asChild>
                        <Link href="/monster-compendium">
                            Monster Compendium
                        </Link>
                    </Button>
                    <Button variant="ghost" asChild>
                        <Link href="/campaign-dashboard">Campaigns</Link>
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost">
                                Tools <ChevronDown className="ml-1 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <Link href="/tools">All Tools</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/tools/backstory-generator">
                                    Backstory Generator
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/tools/dice-roller">
                                    Dice Roller
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/tools/initiative-tracker">
                                    Initiative Tracker
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/tools/loot-generator">
                                    Loot Generator
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/tools/magic-item-shop">
                                    Magic Item Shop
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/tools/npc-generator">
                                    NPC Generator
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/tools/special-materials">
                                    Special Materials
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/tools/tavern-generator">
                                    Tavern Generator
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/tools/weather-generator">
                                    Weather Generator
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="flex items-center">
                    <ThemeToggle />
                </div>
            </nav>
        </header>
    );
}
