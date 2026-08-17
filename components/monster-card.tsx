"use client";

import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

interface Monster {
    name: string;
    meta: string;
    Challenge: string;
    size: string;
    alignment: string;
    img_url: string;
    type: string;
    cr: string;
}

interface MonsterCardProps {
    monster: Monster;
    onClick: () => void;
}

export function MonsterCard({ monster, onClick }: MonsterCardProps) {
    return (
        <Card className="overflow-hidden h-full flex flex-col">
            <div className="relative h-48 w-full">
                <Image
                    src={monster.img_url || "/placeholder.svg"}
                    alt={monster.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
            </div>
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{monster.name}</CardTitle>
                    <Badge variant="outline">
                        CR {monster.cr || monster.Challenge}
                    </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{monster.meta}</p>
            </CardHeader>
            <CardContent className="pb-2 flex-grow">
                <div className="flex flex-wrap gap-2 mb-2">
                    <Badge variant="secondary">{monster.type}</Badge>
                    <Badge variant="secondary">{monster.size}</Badge>
                    <Badge variant="secondary">{monster.alignment}</Badge>
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={onClick} className="w-full">
                    View Details
                </Button>
            </CardFooter>
        </Card>
    );
}
