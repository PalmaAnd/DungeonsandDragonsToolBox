"use client";

import type { Dispatch, SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { alignments, type CharacterState, type EnhancedCharacterData } from "./types";

export type BasicsTabProps = {
    character: CharacterState;
    setCharacter: Dispatch<SetStateAction<CharacterState>>;
    enhancedData: EnhancedCharacterData;
    handleSelectChange: (name: string, value: string) => void;
    levelUp: () => void;
};

export function BasicsTab({
    character,
    setCharacter,
    enhancedData,
    handleSelectChange,
    levelUp,
}: BasicsTabProps) {
    const selectedClassInfo = enhancedData.classes[character.class];
    const selectedRaceInfo = enhancedData.races[character.race];

    return (
        <TabsContent value="basics" className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="name">Character Name</Label>
                        <Input
                            id="name"
                            name="name"
                            value={character.name}
                            onChange={(e) =>
                                setCharacter({
                                    ...character,
                                    name: e.target.value,
                                })
                            }
                            placeholder="Enter character name"
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="level">Level</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="level"
                                name="level"
                                type="number"
                                min="1"
                                max="20"
                                value={character.level}
                                onChange={(e) =>
                                    setCharacter({
                                        ...character,
                                        level: parseInt(e.target.value) || 1,
                                    })
                                }
                            />
                            <Button
                                onClick={levelUp}
                                disabled={character.level >= 20}
                            >
                                Level Up
                            </Button>
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="class">Class</Label>
                        <Select
                            name="class"
                            value={character.class}
                            onValueChange={(value) =>
                                handleSelectChange("class", value)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a class" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.keys(enhancedData.classes).map(
                                    (className) => (
                                        <SelectItem
                                            key={className}
                                            value={className}
                                        >
                                            {className}
                                        </SelectItem>
                                    )
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {character.class &&
                        selectedClassInfo &&
                        selectedClassInfo.subclasses.length > 0 && (
                            <div>
                                <Label htmlFor="subclass">Subclass</Label>
                                <Select
                                    name="subclass"
                                    value={character.subclass}
                                    onValueChange={(value) =>
                                        handleSelectChange("subclass", value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a subclass" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {selectedClassInfo.subclasses.map(
                                            (subclass) => (
                                                <SelectItem
                                                    key={subclass.name}
                                                    value={subclass.name}
                                                >
                                                    {subclass.name}
                                                </SelectItem>
                                            )
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                    <div>
                        <Label htmlFor="race">Race</Label>
                        <Select
                            name="race"
                            value={character.race}
                            onValueChange={(value) =>
                                handleSelectChange("race", value)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a race" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.keys(enhancedData.races).map(
                                    (raceName) => (
                                        <SelectItem
                                            key={raceName}
                                            value={raceName}
                                        >
                                            {raceName}
                                        </SelectItem>
                                    )
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {character.race && selectedRaceInfo?.subraces && (
                        <div>
                            <Label htmlFor="subrace">Subrace</Label>
                            <Select
                                name="subrace"
                                value={character.subrace}
                                onValueChange={(value) =>
                                    handleSelectChange("subrace", value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a subrace" />
                                </SelectTrigger>
                                <SelectContent>
                                    {selectedRaceInfo.subraces.map(
                                        (subrace) => (
                                            <SelectItem
                                                key={subrace.name}
                                                value={subrace.name}
                                            >
                                                {subrace.name}
                                            </SelectItem>
                                        )
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div>
                        <Label htmlFor="background">Background</Label>
                        <Select
                            name="background"
                            value={character.background}
                            onValueChange={(value) =>
                                handleSelectChange("background", value)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a background" />
                            </SelectTrigger>
                            <SelectContent>
                                {enhancedData.backgrounds.map((bg) => (
                                    <SelectItem key={bg.name} value={bg.name}>
                                        {bg.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="alignment">Alignment</Label>
                        <Select
                            name="alignment"
                            value={character.alignment}
                            onValueChange={(value) =>
                                handleSelectChange("alignment", value)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select an alignment" />
                            </SelectTrigger>
                            <SelectContent>
                                {alignments.map((alignment) => (
                                    <SelectItem
                                        key={alignment}
                                        value={alignment}
                                    >
                                        {alignment}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Character Stats Summary */}
            <Card>
                <CardHeader>
                    <CardTitle>Character Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">
                                Hit Points
                            </p>
                            <p className="text-2xl font-bold">
                                {character.hitPoints}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">
                                Armor Class
                            </p>
                            <p className="text-2xl font-bold">
                                {character.armorClass}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">
                                Speed
                            </p>
                            <p className="text-2xl font-bold">
                                {character.speed} ft
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">
                                Proficiency Bonus
                            </p>
                            <p className="text-2xl font-bold">
                                +{character.proficiencyBonus}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Class/Race Info */}
            {(character.class || character.race) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {character.class && (
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    {character.class} Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <p>
                                    <strong>Hit Die:</strong>{" "}
                                    {selectedClassInfo?.hitDie}
                                </p>
                                <p>
                                    <strong>Primary Abilities:</strong>{" "}
                                    {selectedClassInfo?.primaryAbilities.join(
                                        ", "
                                    )}
                                </p>
                                <p>
                                    <strong>Saving Throws:</strong>{" "}
                                    {selectedClassInfo?.savingThrows.join(
                                        ", "
                                    )}
                                </p>
                                {character.subclass && (
                                    <div>
                                        <p>
                                            <strong>Subclass:</strong>{" "}
                                            {character.subclass}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {
                                                selectedClassInfo?.subclasses.find(
                                                    (sc) =>
                                                        sc.name ===
                                                        character.subclass
                                                )?.description
                                            }
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {character.race && (
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    {character.race} Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <p>
                                    <strong>Size:</strong>{" "}
                                    {selectedRaceInfo?.size}
                                </p>
                                <p>
                                    <strong>Speed:</strong>{" "}
                                    {selectedRaceInfo?.speed} feet
                                </p>
                                <p>
                                    <strong>Languages:</strong>{" "}
                                    {selectedRaceInfo?.languages.join(", ")}
                                </p>
                                <div>
                                    <p>
                                        <strong>Traits:</strong>
                                    </p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {selectedRaceInfo?.traits.map(
                                            (trait) => (
                                                <Badge
                                                    key={trait}
                                                    variant="outline"
                                                >
                                                    {trait}
                                                </Badge>
                                            )
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}
        </TabsContent>
    );
}
