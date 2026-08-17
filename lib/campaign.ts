// Shared between components/campaign-dashboard.tsx and components/campaign-detail.tsx.

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
    sessions: Session[];
};

export type SavedCharacterSummary = {
    id: string;
    character: { name: string; class: string; level: number };
};

// Defensively fills in fields added after a campaign may have already been
// saved (e.g. sessions), so older stored/exported data doesn't crash on load.
export function normalizeCampaign(
    raw: Partial<Campaign> & { id: string; name: string }
): Campaign {
    return {
        id: raw.id,
        name: raw.name,
        description: raw.description ?? "",
        lastPlayed: raw.lastPlayed ?? "Never",
        characterIds: raw.characterIds ?? [],
        sessions: raw.sessions ?? [],
    };
}
