"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import type { CharacterState, EnhancedCharacterData } from "./types";

export type SkillsTabProps = {
    character: CharacterState;
    enhancedData: EnhancedCharacterData;
};

export function SkillsTab({ character, enhancedData }: SkillsTabProps) {
    const selectedClassInfo = enhancedData.classes[character.class];
    const selectedBackground = enhancedData.backgrounds.find(
        (bg) => bg.name === character.background
    );

    return (
        <TabsContent value="skills" className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Skills & Proficiencies</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Skills would be implemented here */}
                    {character.class && (
                        <div>
                            <h4 className="font-semibold mb-2">
                                Available Skills for {character.class}
                            </h4>
                            <div className="text-sm text-muted-foreground">
                                Choose from:{" "}
                                {selectedClassInfo?.skillOptions.join(", ")}
                            </div>
                        </div>
                    )}

                    {/* Proficiencies */}
                    {character.class && (
                        <div className="space-y-2">
                            <h4 className="font-semibold">
                                Class Proficiencies
                            </h4>
                            <div className="space-y-2 text-sm">
                                <div>
                                    <strong>Armor:</strong>{" "}
                                    {selectedClassInfo?.proficiencies.armor.join(
                                        ", "
                                    ) || "None"}
                                </div>
                                <div>
                                    <strong>Weapons:</strong>{" "}
                                    {selectedClassInfo?.proficiencies.weapons.join(
                                        ", "
                                    ) || "None"}
                                </div>
                                <div>
                                    <strong>Tools:</strong>{" "}
                                    {selectedClassInfo?.proficiencies.tools.join(
                                        ", "
                                    ) || "None"}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Background Proficiencies */}
                    {character.background && (
                        <div className="space-y-2">
                            <h4 className="font-semibold">
                                Background Proficiencies
                            </h4>
                            <div className="space-y-2 text-sm">
                                <div>
                                    <strong>Skills:</strong>{" "}
                                    {selectedBackground?.skillProficiencies.join(
                                        ", "
                                    )}
                                </div>
                                {selectedBackground?.toolProficiencies && (
                                    <div>
                                        <strong>Tools:</strong>{" "}
                                        {selectedBackground.toolProficiencies.join(
                                            ", "
                                        )}
                                    </div>
                                )}
                                {selectedBackground?.languages && (
                                    <div>
                                        <strong>Languages:</strong>{" "}
                                        {selectedBackground.languages.join(
                                            ", "
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </TabsContent>
    );
}
