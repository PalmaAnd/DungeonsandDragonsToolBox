"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Users, ChevronDown, Check } from "lucide-react";
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from "@/lib/storage";
import { normalizeCampaign, type Campaign } from "@/lib/campaign";

export function ActiveCampaignSelector() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        Promise.all([
            loadFromStorage<Campaign[]>(STORAGE_KEYS.campaigns, []),
            loadFromStorage<string | null>(STORAGE_KEYS.activeCampaignId, null),
        ]).then(([storedCampaigns, storedActiveId]) => {
            if (cancelled) return;
            setCampaigns(storedCampaigns.map(normalizeCampaign));
            setActiveId(storedActiveId);
        });
        return () => {
            cancelled = true;
        };
    }, []);

    const selectCampaign = (id: string | null) => {
        setActiveId(id);
        saveToStorage(STORAGE_KEYS.activeCampaignId, id);
    };

    if (campaigns.length === 0) return null;

    const activeCampaign = campaigns.find((c) => c.id === activeId);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" aria-label="Active campaign">
                    <Users className="h-4 w-4 mr-1" />
                    {activeCampaign ? activeCampaign.name : "No active campaign"}
                    <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => selectCampaign(null)}>
                    {!activeId && <Check className="h-4 w-4 mr-2" />}
                    No active campaign
                </DropdownMenuItem>
                {campaigns.map((campaign) => (
                    <DropdownMenuItem
                        key={campaign.id}
                        onClick={() => selectCampaign(campaign.id)}
                    >
                        {activeId === campaign.id && (
                            <Check className="h-4 w-4 mr-2" />
                        )}
                        {campaign.name}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
