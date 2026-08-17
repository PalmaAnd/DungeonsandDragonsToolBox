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
import { ArrowLeft, Trash2 } from "lucide-react";
import { loadFromStorage, saveToStorage, STORAGE_KEYS, generateId } from "@/lib/storage";
import {
    normalizeCampaign,
    type Campaign,
    type SavedCharacterSummary,
} from "@/lib/campaign";

export function CampaignDetail({ id }: { id: string }) {
    const router = useRouter();
    const [campaigns, setCampaigns] = useState<Campaign[] | null>(null);
    const [savedCharacters, setSavedCharacters] = useState<
        SavedCharacterSummary[]
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
        ]).then(([storedCampaigns, storedCharacters]) => {
            if (cancelled) return;
            setCampaigns(storedCampaigns.map(normalizeCampaign));
            setSavedCharacters(storedCharacters);
        });
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

    const toggleCharacter = (characterId: string) => {
        if (!campaign) return;
        const characterIds = campaign.characterIds.includes(characterId)
            ? campaign.characterIds.filter((cid) => cid !== characterId)
            : [...campaign.characterIds, characterId];
        updateCampaign({ characterIds });
    };

    const logSession = () => {
        if (!campaign || !sessionNotes.trim()) return;
        const session = { id: generateId(), date: sessionDate, notes: sessionNotes };
        updateCampaign({
            sessions: [session, ...campaign.sessions],
            lastPlayed: sessionDate,
        });
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
                <CardHeader>
                    <CardTitle>Linked Characters</CardTitle>
                    <CardDescription>
                        Characters saved in the Character Creator that belong
                        to this campaign.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-1">
                    {savedCharacters.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            No saved characters yet. Save one in the Character
                            Creator to link it here.
                        </p>
                    ) : (
                        savedCharacters.map((saved) => (
                            <label
                                key={saved.id}
                                className="flex items-center gap-2 text-sm"
                            >
                                <input
                                    type="checkbox"
                                    checked={campaign.characterIds.includes(
                                        saved.id
                                    )}
                                    onChange={() => toggleCharacter(saved.id)}
                                />
                                {saved.character.name || "Unnamed"}
                                {saved.character.class && (
                                    <span className="text-muted-foreground">
                                        Lvl {saved.character.level}{" "}
                                        {saved.character.class}
                                    </span>
                                )}
                            </label>
                        ))
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
