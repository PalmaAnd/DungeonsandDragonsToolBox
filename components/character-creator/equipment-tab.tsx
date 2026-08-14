"use client";

import type { Dispatch, SetStateAction } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { CharacterState, EnhancedCharacterData } from "./types";

export type EquipmentTabProps = {
    character: CharacterState;
    setCharacter: Dispatch<SetStateAction<CharacterState>>;
    enhancedData: EnhancedCharacterData;
    handleSelectChange: (name: string, value: string) => void;
};

export function EquipmentTab({
    character,
    setCharacter,
    enhancedData,
    handleSelectChange,
}: EquipmentTabProps) {
    const selectedClassInfo = enhancedData.classes[character.class];
    const selectedBackground = enhancedData.backgrounds.find(
        (bg) => bg.name === character.background
    );

    return (
        <TabsContent value="equipment" className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Equipment & Gear</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Starting Equipment */}
                    {character.class && (
                        <div>
                            <h4 className="font-semibold mb-2">
                                Starting Equipment for {character.class}
                            </h4>
                            <ul className="text-sm space-y-1">
                                {selectedClassInfo?.startingEquipment.map(
                                    (item, index) => (
                                        <li
                                            key={index}
                                            className="flex items-center gap-2"
                                        >
                                            <span>•</span>
                                            <span>{item}</span>
                                        </li>
                                    )
                                )}
                            </ul>
                        </div>
                    )}

                    {/* Background Equipment */}
                    {character.background && (
                        <div>
                            <h4 className="font-semibold mb-2">
                                Background Equipment
                            </h4>
                            <ul className="text-sm space-y-1">
                                {selectedBackground?.equipment.map(
                                    (item, index) => (
                                        <li
                                            key={index}
                                            className="flex items-center gap-2"
                                        >
                                            <span>•</span>
                                            <span>{item}</span>
                                        </li>
                                    )
                                )}
                            </ul>
                        </div>
                    )}

                    {/* Equipment Packs */}
                    <div>
                        <h4 className="font-semibold mb-2">
                            Select Equipment Pack
                        </h4>
                        <Select
                            name="selectedPack"
                            value={character.selectedPack}
                            onValueChange={(value) =>
                                handleSelectChange("selectedPack", value)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Choose an equipment pack" />
                            </SelectTrigger>
                            <SelectContent>
                                {enhancedData.equipment.packs.map((pack) => (
                                    <SelectItem
                                        key={pack.name}
                                        value={pack.name}
                                    >
                                        {pack.name} ({pack.cost})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {character.selectedPack && (
                            <div className="mt-4 p-4 border rounded-lg">
                                <h5 className="font-medium mb-2">
                                    {character.selectedPack} Contents:
                                </h5>
                                <ul className="text-sm space-y-1">
                                    {enhancedData.equipment.packs
                                        .find(
                                            (pack) =>
                                                pack.name ===
                                                character.selectedPack
                                        )
                                        ?.contents?.map((item, index) => (
                                            <li
                                                key={index}
                                                className="flex items-center gap-2"
                                            >
                                                <span>•</span>
                                                <span>{item}</span>
                                            </li>
                                        )) || []}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Equipment Pack Overview */}
                    <div>
                        <h4 className="font-semibold mb-2">
                            All Available Equipment Packs
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {enhancedData.equipment.packs.map((pack) => (
                                <Card
                                    key={pack.name}
                                    className={`p-3 cursor-pointer border-2 ${
                                        character.selectedPack === pack.name
                                            ? "border-primary bg-primary/5"
                                            : "border-muted hover:border-muted-foreground/50"
                                    }`}
                                    onClick={() =>
                                        handleSelectChange(
                                            "selectedPack",
                                            pack.name
                                        )
                                    }
                                >
                                    <h5 className="font-medium">
                                        {pack.name}
                                    </h5>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        Cost: {pack.cost}
                                    </p>
                                    <div className="text-xs space-y-1">
                                        {pack.contents
                                            ?.slice(0, 3)
                                            .map((item, index) => (
                                                <div key={index}>
                                                    • {item}
                                                </div>
                                            ))}
                                        {pack.contents &&
                                            pack.contents.length > 3 && (
                                                <div className="text-muted-foreground">
                                                    ... and{" "}
                                                    {pack.contents.length - 3}{" "}
                                                    more items
                                                </div>
                                            )}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Custom Equipment */}
                    <div>
                        <h4 className="font-semibold mb-2">
                            Additional Equipment
                        </h4>
                        <Textarea
                            placeholder="Add custom equipment, weapons, armor, etc..."
                            value={character.equipment.join("\n")}
                            onChange={(e) =>
                                setCharacter({
                                    ...character,
                                    equipment: e.target.value
                                        .split("\n")
                                        .filter((item) => item.trim()),
                                })
                            }
                            rows={4}
                        />
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
    );
}
