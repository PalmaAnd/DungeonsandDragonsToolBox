"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    generateId,
    loadFromStorage,
    saveToStorage,
    STORAGE_KEYS,
} from "@/lib/storage";
import {
    normalizeCampaign,
    type Campaign,
    type SavedCharacterSummary,
} from "@/lib/campaign";

const emptyForm = { name: "", description: "" };

export function CampaignDashboard() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [savedCharacters, setSavedCharacters] = useState<
        SavedCharacterSummary[]
    >([]);
    const [createOpen, setCreateOpen] = useState(false);
    const [form, setForm] = useState(emptyForm);

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
        saveToStorage(STORAGE_KEYS.campaigns, campaigns);
    }, [campaigns]);

    const openCreateForm = () => {
        setForm(emptyForm);
        setCreateOpen(true);
    };

    const createCampaign = () => {
        if (!form.name.trim()) return;

        setCampaigns((prev) => [
            ...prev,
            {
                id: generateId(),
                name: form.name,
                description: form.description,
                lastPlayed: "Never",
                characterIds: [],
                sessions: [],
            },
        ]);

        setCreateOpen(false);
        setForm(emptyForm);
    };

    const linkedCharacterNames = (characterIds: string[]) =>
        savedCharacters
            .filter((saved) => characterIds.includes(saved.id))
            .map((saved) => saved.character.name || "Unnamed");

    return (
        <div className="space-y-6">
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogTrigger asChild>
                    <Button onClick={openCreateForm}>Create New Campaign</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Create New Campaign</DialogTitle>
                        <DialogDescription>
                            Enter the details of your new campaign here. You
                            can link characters and log sessions after
                            it&apos;s created.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Name
                            </Label>
                            <Input
                                id="name"
                                value={form.name}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        name: e.target.value,
                                    }))
                                }
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">
                                Description
                            </Label>
                            <Textarea
                                id="description"
                                value={form.description}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        description: e.target.value,
                                    }))
                                }
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={createCampaign}>
                            Create Campaign
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {campaigns.map((campaign) => (
                    <Card key={campaign.id}>
                        <CardHeader>
                            <CardTitle>{campaign.name}</CardTitle>
                            <CardDescription>
                                Last played: {campaign.lastPlayed}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                                {campaign.description}
                            </p>
                            {linkedCharacterNames(campaign.characterIds)
                                .length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                    {linkedCharacterNames(
                                        campaign.characterIds
                                    ).map((name) => (
                                        <Badge key={name} variant="secondary">
                                            {name}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" asChild className="w-full">
                                <Link href={`/campaign-dashboard/${campaign.id}`}>
                                    Manage Campaign
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
