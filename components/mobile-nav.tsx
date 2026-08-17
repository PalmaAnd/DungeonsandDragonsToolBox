"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetClose,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { DataTransfer } from "@/components/data-transfer";

export function MobileNav() {
    const [open, setOpen] = React.useState(false);
    const pathname = usePathname();

    // Close mobile nav when route changes
    React.useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- closing the sheet is a reaction to navigation (an external event), not a value derivable during render
        setOpen(false);
    }, [pathname]);

    const mainRoutes = [
        { href: "/", label: "Home" },
        { href: "/character-creator", label: "Character Creator" },
        { href: "/spell-list", label: "Spell List" },
        { href: "/monster-compendium", label: "Monster Compendium" },
        { href: "/campaign-dashboard", label: "Campaigns" },
    ];

    const toolRoutes = [
        { href: "/tools", label: "All Tools" },
        { href: "/tools/backstory-generator", label: "Backstory Generator" },
        { href: "/tools/dice-roller", label: "Dice Roller" },
        { href: "/tools/initiative-tracker", label: "Initiative Tracker" },
        { href: "/tools/loot-generator", label: "Loot Generator" },
        { href: "/tools/magic-item-shop", label: "Magic Item Shop" },
        { href: "/tools/npc-generator", label: "NPC Generator" },
        { href: "/tools/special-materials", label: "Special Materials" },
        { href: "/tools/tavern-generator", label: "Tavern Generator" },
        { href: "/tools/weather-generator", label: "Weather Generator" },
    ];

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
                    aria-label="Open mobile menu"
                >
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0 sm:max-w-xs">
                <SheetClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </SheetClose>
                <nav className="flex flex-col gap-4 pt-10">
                    <div className="space-y-1">
                        <div className="pb-2 pl-4 font-semibold tracking-tight">
                            Main
                        </div>
                        {mainRoutes.map((route) => (
                            <Link
                                key={route.href}
                                href={route.href}
                                className={cn(
                                    "flex items-center px-4 py-2 text-sm font-medium transition-colors hover:bg-accent",
                                    pathname === route.href
                                        ? "font-bold text-primary"
                                        : "text-foreground"
                                )}
                            >
                                {route.label}
                            </Link>
                        ))}
                    </div>
                    <div className="space-y-1">
                        <div className="pb-2 pl-4 font-semibold tracking-tight">
                            Tools
                        </div>
                        {toolRoutes.map((route) => (
                            <Link
                                key={route.href}
                                href={route.href}
                                className={cn(
                                    "flex items-center px-4 py-2 text-sm font-medium transition-colors hover:bg-accent",
                                    pathname === route.href
                                        ? "font-bold text-primary"
                                        : "text-foreground"
                                )}
                            >
                                {route.label}
                            </Link>
                        ))}
                    </div>
                    <div className="space-y-1 px-4">
                        <div className="pb-2 font-semibold tracking-tight">
                            Data
                        </div>
                        <DataTransfer />
                    </div>
                </nav>
            </SheetContent>
        </Sheet>
    );
}
