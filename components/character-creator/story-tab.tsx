"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CharacterState, EnhancedCharacterData } from "./types";

export type StoryTabProps = {
    character: CharacterState;
    enhancedData: EnhancedCharacterData;
    handleInputChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => void;
};

export function StoryTab({
    character,
    enhancedData,
    handleInputChange,
}: StoryTabProps) {
    const selectedBackground = enhancedData.backgrounds.find(
        (bg) => bg.name === character.background
    );

    return (
        <TabsContent value="story" className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Character Story & Personality</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {character.background && (
                        <div>
                            <h4 className="font-semibold mb-2">
                                Background: {character.background}
                            </h4>
                            <p className="text-sm text-muted-foreground mb-2">
                                {selectedBackground?.description}
                            </p>
                            <p className="text-sm">
                                <strong>Feature:</strong>{" "}
                                {selectedBackground?.feature}
                            </p>
                        </div>
                    )}

                    <div>
                        <Label htmlFor="personality">
                            Personality Traits
                        </Label>
                        <Textarea
                            id="personality"
                            name="personality"
                            placeholder="Describe your character's personality traits..."
                            value={character.personality}
                            onChange={handleInputChange}
                            rows={3}
                        />
                    </div>

                    <div>
                        <Label htmlFor="ideals">Ideals</Label>
                        <Textarea
                            id="ideals"
                            name="ideals"
                            placeholder="What drives your character? What principles do they believe in?"
                            value={character.ideals}
                            onChange={handleInputChange}
                            rows={3}
                        />
                    </div>

                    <div>
                        <Label htmlFor="bonds">Bonds</Label>
                        <Textarea
                            id="bonds"
                            name="bonds"
                            placeholder="What connects your character to the world? Important people, places, or things?"
                            value={character.bonds}
                            onChange={handleInputChange}
                            rows={3}
                        />
                    </div>

                    <div>
                        <Label htmlFor="flaws">Flaws</Label>
                        <Textarea
                            id="flaws"
                            name="flaws"
                            placeholder="What weaknesses or vices might cause trouble for your character?"
                            value={character.flaws}
                            onChange={handleInputChange}
                            rows={3}
                        />
                    </div>

                    <div>
                        <Label htmlFor="backstory">Backstory</Label>
                        <Textarea
                            id="backstory"
                            name="backstory"
                            placeholder="Tell your character's story. Where did they come from? What shaped them?"
                            value={character.backstory}
                            onChange={handleInputChange}
                            rows={6}
                        />
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
    );
}
