"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Swords, Trash2 } from "lucide-react";
import { loadFromStorage, saveToStorage, STORAGE_KEYS, generateId } from "@/lib/storage";
import {
    appendSession,
    normalizeCampaign,
    type Campaign,
    type LinkedEntityField,
    type SavedCharacterSummary,
} from "@/lib/campaign";
import { addCombatantsToEncounter, type Combatant } from "@/lib/encounter";

type SavedNpcSummary = { id: string; name: string; occupation?: string };
type SavedLootSummary = { id: string; gold: number; container: string };
type SavedTavernSummary = { id: string; name: string };
type SavedBackstorySummary = { id: string; origin: { text: string } };

export function CampaignDetail({ id }: { id: string }) {
    const router = useRouter();
    const [campaigns, setCampaigns] = useState<Campaign[] | null>(null);
    const [savedCharacters, setSavedCharacters] = useState<
        SavedCharacterSummary[]
    >([]);
    const [savedNpcs, setSavedNpcs] = useState<SavedNpcSummary[]>([]);
    const [savedLoot, setSavedLoot] = useState<SavedLootSummary[]>([]);
    const [savedTaverns, setSavedTaverns] = useState<SavedTavernSummary[]>([]);
    const [savedBackstories, setSavedBackstories] = useState<
        SavedBackstorySummary[]
    >([]);
    const [sessionDate, setSessionDate] = useState(
        new Date().toISOString().slice(0, 10)
    );
    const [sessionNotes, setSessionNotes] = useState("");

    useEffect(() => {
        let cancelled = false;
        Promise.all([
            loadFromStorage<Campaign[]>(STORAGE_KEYS.campaigns, []),
            loadFromStorage<SavedCharacterSummary[]>(
                STORAGE_KEYS.savedCharacters,
                []
            ),
            loadFromStorage<SavedNpcSummary[]>(STORAGE_KEYS.savedNpcs, []),
            loadFromStorage<SavedLootSummary[]>(STORAGE_KEYS.savedLoot, []),
            loadFromStorage<SavedTavernSummary[]>(
                STORAGE_KEYS.savedTaverns,
                []
            ),
            loadFromStorage<SavedBackstorySummary[]>(
                STORAGE_KEYS.savedBackstories,
                []
            ),
        ]).then(
            ([
                storedCampaigns,
                storedCharacters,
                storedNpcs,
                storedLoot,
                storedTaverns,
                storedBackstories,
            ]) => {
                if (cancelled) return;
                setCampaigns(storedCampaigns.map(normalizeCampaign));
                setSavedCharacters(storedCharacters);
                setSavedNpcs(storedNpcs);
                setSavedLoot(storedLoot);
                setSavedTaverns(storedTaverns);
                setSavedBackstories(storedBackstories);
            }
        );
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (campaigns === null) return;
        saveToStorage(STORAGE_KEYS.campaigns, campaigns);
    }, [campaigns]);

    const campaign = campaigns?.find((c) => c.id === id) ?? null;

    const updateCampaign = (update: Partial<Campaign>) => {
        setCampaigns((prev) =>
            (prev ?? []).map((c) => (c.id === id ? { ...c, ...update } : c))
        );
    };

    const toggleLinked = (field: LinkedEntityField, entityId: string) => {
        if (!campaign) return;
        const ids = campaign[field].includes(entityId)
            ? campaign[field].filter((linkedId) => linkedId !== entityId)
            : [...campaign[field], entityId];
        updateCampaign({ [field]: ids } as Partial<Campaign>);
    };

    const logSession = () => {
        if (!campaign || !sessionNotes.trim()) return;
        const session = {
            id: generateId(),
            date: sessionDate,
            notes: sessionNotes,
        };
        setCampaigns((prev) => appendSession(prev ?? [], id, session));
        setSessionNotes("");
    };

    const deleteSession = (sessionId: string) => {
        if (!campaign) return;
        updateCampaign({
            sessions: campaign.sessions.filter((s) => s.id !== sessionId),
        });
    };

    const deleteCampaign = () => {
        setCampaigns((prev) => (prev ?? []).filter((c) => c.id !== id));
        router.push("/campaign-dashboard");
    };

    const party = campaign
        ? savedCharacters.filter((c) => campaign.characterIds.includes(c.id))
        : [];

    const startEncounterWithParty = async () => {
        if (party.length === 0) return;
        const combatants: Combatant[] = party.map((member) => ({
            id: generateId(),
            name: member.character.name || "Unnamed",
            initiative: 0,
            initiativeModifier: 0,
            hp: member.character.hitPoints,
            maxHp: member.character.hitPoints,
            ac: member.character.armorClass,
            isPlayer: true,
            savingThrows: 3,
            failedSaves: 0,
            conditions: [],
        }));
        await addCombatantsToEncounter(combatants);
        router.push("/tools/initiative-tracker");
    };

    if (campaigns === null) {
        return <p className="text-muted-foreground">Loading campaign…</p>;
    }

    if (!campaign) {
        return (
            <div className="space-y-4">
                <p className="text-muted-foreground">
                    That campaign doesn&apos;t exist (it may have been deleted).
                </p>
                <Button variant="outline" asChild>
                    <Link href="/campaign-dashboard">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Campaigns
                    </Link>
                </Button>
            </div>
        );
    }

    const renderLinkedList = <T extends { id: string }>(
        items: T[],
        field: LinkedEntityField,
        label: (item: T) => React.ReactNode,
        emptyMessage: string
    ) => {
        if (items.length === 0) {
            return (
                <p className="text-sm text-muted-foreground">
                    {emptyMessage}
                </p>
            );
        }
        return items.map((item) => (
            <label
                key={item.id}
                className="flex items-center gap-2 text-sm"
            >
                <input
                    type="checkbox"
                    checked={campaign[field].includes(item.id)}
                    onChange={() => toggleLinked(field, item.id)}
                />
                {label(item)}
            </label>
        ));
    };

    return (
        <div className="space-y-6">
            <Button variant="ghost" asChild className="-ml-4">
                <Link href="/campaign-dashboard">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Campaigns
                </Link>
            </Button>

            <Card>
                <CardHeader>
                    <CardTitle>Campaign Details</CardTitle>
                    <CardDescription>
                        Last played: {campaign.lastPlayed}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="campaign-name">Name</Label>
                        <Input
                            id="campaign-name"
                            value={campaign.name}
                            onChange={(e) =>
                                updateCampaign({ name: e.target.value })
                            }
                        />
                    </div>
                    <div>
                        <Label htmlFor="campaign-description">
                            Description
                        </Label>
                        <Textarea
                            id="campaign-description"
                            value={campaign.description}
                            onChange={(e) =>
                                updateCampaign({ description: e.target.value })
                            }
                            rows={3}
                        />
                    </div>
                    <Button
                        variant="ghost"
                        className="text-destructive"
                        onClick={deleteCampaign}
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Campaign
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Party Roster</CardTitle>
                        <CardDescription>
                            Linked characters, ready to drop into a fight.
                        </CardDescription>
                    </div>
                    {party.length > 0 && (
                        <Button onClick={startEncounterWithParty}>
                            <Swords className="h-4 w-4 mr-2" />
                            Start Encounter with Party
                        </Button>
                    )}
                </CardHeader>
                <CardContent className="space-y-3">
                    {party.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {party.map((member) => (
                                <Badge key={member.id} variant="secondary">
                                    {member.character.name || "Unnamed"} —
                                    Lvl {member.character.level}{" "}
                                    {member.character.class} (HP{" "}
                                    {member.character.hitPoints}, AC{" "}
                                    {member.character.armorClass})
                                </Badge>
                            ))}
                        </div>
                    )}
                    <div className="space-y-1">
                        {renderLinkedList(
                            savedCharacters,
                            "characterIds",
                            (saved) => (
                                <>
                                    {saved.character.name || "Unnamed"}
                                    {saved.character.class && (
                                        <span className="text-muted-foreground">
                                            Lvl {saved.character.level}{" "}
                                            {saved.character.class}
                                        </span>
                                    )}
                                </>
                            ),
                            "No saved characters yet. Save one in the Character Creator to link it here."
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Linked NPCs</CardTitle>
                    <CardDescription>
                        Recurring NPCs saved from the NPC Generator.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-1">
                    {renderLinkedList(
                        savedNpcs,
                        "npcIds",
                        (npc) => (
                            <>
                                {npc.name}
                                {npc.occupation && (
                                    <span className="text-muted-foreground">
                                        {npc.occupation}
                                    </span>
                                )}
                            </>
                        ),
                        "No saved NPCs yet. Save one in the NPC Generator to link it here."
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Linked Loot</CardTitle>
                    <CardDescription>
                        Treasure hoards saved from the Loot Generator.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-1">
                    {renderLinkedList(
                        savedLoot,
                        "lootIds",
                        (loot) => (
                            <>
                                {loot.gold} gp in a {loot.container}
                            </>
                        ),
                        "No saved loot yet. Save some in the Loot Generator to link it here."
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Linked Taverns</CardTitle>
                    <CardDescription>
                        Taverns saved from the Tavern Generator.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-1">
                    {renderLinkedList(
                        savedTaverns,
                        "tavernIds",
                        (tavern) => tavern.name,
                        "No saved taverns yet. Save one in the Tavern Generator to link it here."
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Linked Backstories</CardTitle>
                    <CardDescription>
                        Backstories saved from the Backstory Generator.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-1">
                    {renderLinkedList(
                        savedBackstories,
                        "backstoryIds",
                        (backstory) => backstory.origin.text,
                        "No saved backstories yet. Save one in the Backstory Generator to link it here."
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Session Log</CardTitle>
                    <CardDescription>
                        Logging a session updates &quot;Last played&quot; to
                        that session&apos;s date.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
                        <div>
                            <Label htmlFor="session-date">Date</Label>
                            <Input
                                id="session-date"
                                type="date"
                                value={sessionDate}
                                onChange={(e) =>
                                    setSessionDate(e.target.value)
                                }
                            />
                        </div>
                        <div className="flex-1">
                            <Label htmlFor="session-notes">
                                Session Notes
                            </Label>
                            <Textarea
                                id="session-notes"
                                placeholder="What happened this session?"
                                value={sessionNotes}
                                onChange={(e) =>
                                    setSessionNotes(e.target.value)
                                }
                                rows={2}
                            />
                        </div>
                        <Button onClick={logSession}>Log Session</Button>
                    </div>

                    {campaign.sessions.length > 0 && (
                        <div className="space-y-2">
                            {campaign.sessions.map((session) => (
                                <div
                                    key={session.id}
                                    className="flex items-start justify-between gap-4 border rounded-lg p-3"
                                >
                                    <div>
                                        <Badge variant="outline">
                                            {session.date}
                                        </Badge>
                                        <p className="text-sm mt-1 whitespace-pre-wrap">
                                            {session.notes}
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        aria-label="Delete session"
                                        onClick={() =>
                                            deleteSession(session.id)
                                        }
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
