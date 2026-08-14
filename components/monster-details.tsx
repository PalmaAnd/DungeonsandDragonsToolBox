import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import DOMPurify from "dompurify";

interface Monster {
    name: string;
    meta: string;
    "Armor Class": string;
    "Hit Points": string;
    Speed: string;
    STR: string;
    STR_mod: string;
    DEX: string;
    DEX_mod: string;
    CON: string;
    CON_mod: string;
    INT: string;
    INT_mod: string;
    WIS: string;
    WIS_mod: string;
    CHA: string;
    CHA_mod: string;
    "Saving Throws"?: string;
    Skills?: string;
    "Damage Immunities"?: string;
    "Condition Immunities"?: string;
    Senses: string;
    Languages: string;
    Challenge: string;
    Traits: string;
    Actions: string;
    "Legendary Actions"?: string;
    img_url: string;
    type: string;
    size: string;
    alignment: string;
    cr: string;
}

interface MonsterDetailsProps {
    monster: Monster;
}

export function MonsterDetails({ monster }: MonsterDetailsProps) {
    // Use cr if available, otherwise fallback to Challenge
    const challengeRating = monster.cr || monster.Challenge;
    return (
        <Card className="overflow-hidden">
            <div className="relative h-64 w-full">
                <Image
                    src={monster.img_url || "/placeholder.svg"}
                    alt={monster.name}
                    fill
                    className="object-cover"
                    sizes="100vw"
                />
            </div>
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start flex-wrap gap-2">
                    <CardTitle className="text-2xl">{monster.name}</CardTitle>
                    <Badge variant="outline">CR {challengeRating}</Badge>
                </div>
                <p className="text-muted-foreground">{monster.meta}</p>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[60vh]">
                    <div className="space-y-6">
                        {/* Monster Type Information */}
                        <div className="flex flex-wrap gap-2 mb-2">
                            <Badge variant="secondary">{monster.type}</Badge>
                            <Badge variant="secondary">{monster.size}</Badge>
                            <Badge variant="secondary">
                                {monster.alignment}
                            </Badge>
                        </div>

                        <Separator />

                        {/* Basic Stats */}
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <h3 className="font-semibold">Armor Class</h3>
                                <p>{monster["Armor Class"]}</p>
                            </div>
                            <div>
                                <h3 className="font-semibold">Hit Points</h3>
                                <p>{monster["Hit Points"]}</p>
                            </div>
                            <div>
                                <h3 className="font-semibold">Speed</h3>
                                <p>{monster.Speed}</p>
                            </div>
                        </div>

                        <Separator />

                        {/* Ability Scores */}
                        <div>
                            <h3 className="font-semibold mb-2">
                                Ability Scores
                            </h3>
                            <div className="grid grid-cols-6 gap-2 text-center">
                                <div>
                                    <div className="font-semibold">STR</div>
                                    <div>{monster.STR}</div>
                                    <div className="text-sm text-muted-foreground">
                                        {monster.STR_mod}
                                    </div>
                                </div>
                                <div>
                                    <div className="font-semibold">DEX</div>
                                    <div>{monster.DEX}</div>
                                    <div className="text-sm text-muted-foreground">
                                        {monster.DEX_mod}
                                    </div>
                                </div>
                                <div>
                                    <div className="font-semibold">CON</div>
                                    <div>{monster.CON}</div>
                                    <div className="text-sm text-muted-foreground">
                                        {monster.CON_mod}
                                    </div>
                                </div>
                                <div>
                                    <div className="font-semibold">INT</div>
                                    <div>{monster.INT}</div>
                                    <div className="text-sm text-muted-foreground">
                                        {monster.INT_mod}
                                    </div>
                                </div>
                                <div>
                                    <div className="font-semibold">WIS</div>
                                    <div>{monster.WIS}</div>
                                    <div className="text-sm text-muted-foreground">
                                        {monster.WIS_mod}
                                    </div>
                                </div>
                                <div>
                                    <div className="font-semibold">CHA</div>
                                    <div>{monster.CHA}</div>
                                    <div className="text-sm text-muted-foreground">
                                        {monster.CHA_mod}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Additional Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {monster["Saving Throws"] && (
                                <div>
                                    <h3 className="font-semibold">
                                        Saving Throws
                                    </h3>
                                    <p>{monster["Saving Throws"]}</p>
                                </div>
                            )}
                            {monster.Skills && (
                                <div>
                                    <h3 className="font-semibold">Skills</h3>
                                    <p>{monster.Skills}</p>
                                </div>
                            )}
                            {monster["Damage Immunities"] && (
                                <div>
                                    <h3 className="font-semibold">
                                        Damage Immunities
                                    </h3>
                                    <p>{monster["Damage Immunities"]}</p>
                                </div>
                            )}
                            {monster["Condition Immunities"] && (
                                <div>
                                    <h3 className="font-semibold">
                                        Condition Immunities
                                    </h3>
                                    <p>{monster["Condition Immunities"]}</p>
                                </div>
                            )}
                            <div>
                                <h3 className="font-semibold">Senses</h3>
                                <p>{monster.Senses}</p>
                            </div>
                            <div>
                                <h3 className="font-semibold">Languages</h3>
                                <p>{monster.Languages}</p>
                            </div>
                        </div>

                        <Separator />

                        {/* Traits */}
                        <div>
                            <h3 className="font-semibold text-lg mb-2">
                                Traits
                            </h3>
                            <div
                                dangerouslySetInnerHTML={{
                                    __html: DOMPurify.sanitize(
                                        monster.Traits
                                    ),
                                }}
                            />
                        </div>

                        <Separator />

                        {/* Actions */}
                        <div>
                            <h3 className="font-semibold text-lg mb-2">
                                Actions
                            </h3>
                            <div
                                dangerouslySetInnerHTML={{
                                    __html: DOMPurify.sanitize(
                                        monster.Actions
                                    ),
                                }}
                            />
                        </div>

                        {/* Legendary Actions */}
                        {monster["Legendary Actions"] && (
                            <>
                                <Separator />
                                <div>
                                    <h3 className="font-semibold text-lg mb-2">
                                        Legendary Actions
                                    </h3>
                                    <div
                                        dangerouslySetInnerHTML={{
                                            __html: DOMPurify.sanitize(
                                                monster[
                                                    "Legendary Actions"
                                                ] as string
                                            ),
                                        }}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
