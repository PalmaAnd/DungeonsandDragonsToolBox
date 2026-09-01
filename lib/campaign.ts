// Shared between components/campaign-dashboard.tsx, components/campaign-detail.tsx,
// and the "Add to Campaign" actions on the NPC/loot/tavern generators and the
// Initiative Tracker's session log.

import { loadFromStorage, saveToStorage, STORAGE_KEYS } from "@/lib/storage";

export type Session = {
    id: string;
    date: string; // YYYY-MM-DD
    notes: string;
};

export type Campaign = {
    id: string;
    name: string;
    description: string;
    lastPlayed: string;
    characterIds: string[];
    npcIds: string[];
    lootIds: string[];
    tavernIds: string[];
    backstoryIds: string[];
    shopIds: string[];
    sessions: Session[];
};

export type LinkedEntityField =
    | "characterIds"
    | "npcIds"
    | "lootIds"
    | "tavernIds"
    | "backstoryIds"
    | "shopIds";

export type SavedCharacterSummary = {
    id: string;
    character: {
        name: string;
        class: string;
        level: number;
        hitPoints: number;
        armorClass: number;
    };
};

// Defensively fills in fields added after a campaign may have already been
// saved (e.g. sessions, npcIds), so older stored/exported data doesn't crash
// on load.
export function normalizeCampaign(
    raw: Partial<Campaign> & { id: string; name: string }
): Campaign {
    return {
        id: raw.id,
        name: raw.name,
        description: raw.description ?? "",
        lastPlayed: raw.lastPlayed ?? "Never",
        characterIds: raw.characterIds ?? [],
        npcIds: raw.npcIds ?? [],
        lootIds: raw.lootIds ?? [],
        tavernIds: raw.tavernIds ?? [],
        backstoryIds: raw.backstoryIds ?? [],
        shopIds: raw.shopIds ?? [],
        sessions: raw.sessions ?? [],
    };
}

export async function getActiveCampaign(): Promise<Campaign | null> {
    const activeId = await loadFromStorage<string | null>(
        STORAGE_KEYS.activeCampaignId,
        null
    );
    if (!activeId) return null;

    const campaigns = await loadFromStorage<Campaign[]>(
        STORAGE_KEYS.campaigns,
        []
    );
    const match = campaigns.map(normalizeCampaign).find((c) => c.id === activeId);
    return match ?? null;
}

export function addLinkedEntity(
    campaigns: Campaign[],
    campaignId: string,
    field: LinkedEntityField,
    entityId: string
): Campaign[] {
    return campaigns.map((campaign) => {
        if (campaign.id !== campaignId) return campaign;
        if (campaign[field].includes(entityId)) return campaign;
        return { ...campaign, [field]: [...campaign[field], entityId] };
    });
}

export function appendSession(
    campaigns: Campaign[],
    campaignId: string,
    session: Session
): Campaign[] {
    return campaigns.map((campaign) =>
        campaign.id === campaignId
            ? {
                  ...campaign,
                  sessions: [session, ...campaign.sessions],
                  lastPlayed: session.date,
              }
            : campaign
    );
}

// Loads campaigns, applies an update, and saves them back -- the common
// shape of every "Add to Campaign" / "Log Session" action performed from
// outside the campaign detail page itself.
export async function updateCampaigns(
    updater: (campaigns: Campaign[]) => Campaign[]
): Promise<Campaign[]> {
    const campaigns = await loadFromStorage<Campaign[]>(
        STORAGE_KEYS.campaigns,
        []
    );
    const updated = updater(campaigns.map(normalizeCampaign));
    await saveToStorage(STORAGE_KEYS.campaigns, updated);
    return updated;
}
