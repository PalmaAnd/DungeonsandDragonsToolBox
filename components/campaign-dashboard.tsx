"use client";

import { useEffect, useState } from "react";
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
import { Trash2 } from "lucide-react";
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from "@/lib/storage";

type Campaign = {
    id: number;
    name: string;
    description: string;
    lastPlayed: string;
    characterIds: number[];
};

type SavedCharacterSummary = {
    id: number;
    character: { name: string; class: string; level: number };
};

type CampaignForm = {
    id: number | null;
    name: string;
    description: string;
    characterIds: number[];
};

const emptyForm: CampaignForm = {
    id: null,
    name: "",
    description: "",
    characterIds: [],
};

export function CampaignDashboard() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [savedCharacters, setSavedCharacters] = useState<
        SavedCharacterSummary[]
    >([]);
    const [formOpen, setFormOpen] = useState(false);
    const [form, setForm] = useState<CampaignForm>(emptyForm);

    useEffect(() => {
        setCampaigns(loadFromStorage(STORAGE_KEYS.campaigns, []));
        setSavedCharacters(
            loadFromStorage(STORAGE_KEYS.savedCharacters, [])
        );
    }, []);

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.campaigns, campaigns);
    }, [campaigns]);

    const openCreateForm = () => {
        setForm(emptyForm);
        setFormOpen(true);
    };

    const openEditForm = (campaign: Campaign) => {
        setForm({
            id: campaign.id,
            name: campaign.name,
            description: campaign.description,
            characterIds: campaign.characterIds,
        });
        setFormOpen(true);
    };

    const toggleCharacter = (characterId: number) => {
        setForm((prev) => ({
            ...prev,
            characterIds: prev.characterIds.includes(characterId)
                ? prev.characterIds.filter((id) => id !== characterId)
                : [...prev.characterIds, characterId],
        }));
    };

    const saveCampaign = () => {
        if (!form.name.trim()) return;

        if (form.id === null) {
            setCampaigns((prev) => [
                ...prev,
                {
                    id: Date.now(),
                    name: form.name,
                    description: form.description,
                    lastPlayed: "Never",
                    characterIds: form.characterIds,
                },
            ]);
        } else {
            setCampaigns((prev) =>
                prev.map((campaign) =>
                    campaign.id === form.id
                        ? {
                              ...campaign,
                              name: form.name,
                              description: form.description,
                              characterIds: form.characterIds,
                          }
                        : campaign
                )
            );
        }

        setFormOpen(false);
        setForm(emptyForm);
    };

    const deleteCampaign = (id: number) => {
        setCampaigns((prev) => prev.filter((campaign) => campaign.id !== id));
        setFormOpen(false);
        setForm(emptyForm);
    };

    const startSession = (id: number) => {
        setCampaigns((prev) =>
            prev.map((campaign) =>
                campaign.id === id
                    ? { ...campaign, lastPlayed: new Date().toLocaleDateString() }
                    : campaign
            )
        );
    };

    const linkedCharacterNames = (characterIds: number[]) =>
        savedCharacters
            .filter((saved) => characterIds.includes(saved.id))
            .map((saved) => saved.character.name || "Unnamed");

    return (
        <div className="space-y-6">
            <Dialog open={formOpen} onOpenChange={setFormOpen}>
                <DialogTrigger asChild>
                    <Button onClick={openCreateForm}>Create New Campaign</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>
                            {form.id === null
                                ? "Create New Campaign"
                                : "Manage Campaign"}
                        </DialogTitle>
                        <DialogDescription>
                            {form.id === null
                                ? "Enter the details of your new campaign here."
                                : "Update your campaign details and linked characters."}
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
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label className="text-right pt-1">
                                Characters
                            </Label>
                            <div className="col-span-3 space-y-1">
                                {savedCharacters.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">
                                        No saved characters yet. Save one in
                                        the Character Creator to link it here.
                                    </p>
                                ) : (
                                    savedCharacters.map((saved) => (
                                        <label
                                            key={saved.id}
                                            className="flex items-center gap-2 text-sm"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={form.characterIds.includes(
                                                    saved.id
                                                )}
                                                onChange={() =>
                                                    toggleCharacter(saved.id)
                                                }
                                            />
                                            {saved.character.name ||
                                                "Unnamed"}
                                            {saved.character.class && (
                                                <span className="text-muted-foreground">
                                                    Lvl {saved.character.level}{" "}
                                                    {saved.character.class}
                                                </span>
                                            )}
                                        </label>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="flex items-center sm:justify-between">
                        {form.id !== null && (
                            <Button
                                variant="ghost"
                                className="text-destructive"
                                onClick={() => deleteCampaign(form.id!)}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Campaign
                            </Button>
                        )}
                        <Button onClick={saveCampaign}>
                            {form.id === null
                                ? "Create Campaign"
                                : "Save Changes"}
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
                        <CardFooter className="flex justify-between">
                            <Button
                                variant="outline"
                                onClick={() => openEditForm(campaign)}
                            >
                                Manage Campaign
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={() => startSession(campaign.id)}
                            >
                                Start Session
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
