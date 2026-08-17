"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link2, Check } from "lucide-react";
import {
    addLinkedEntity,
    getActiveCampaign,
    updateCampaigns,
    type Campaign,
    type LinkedEntityField,
} from "@/lib/campaign";

// Renders nothing when there's no active campaign -- linking only makes
// sense once one is set (via the navbar's campaign selector).
export function AddToCampaignButton({
    field,
    entityId,
}: {
    field: LinkedEntityField;
    entityId: string;
}) {
    const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(
        null
    );

    useEffect(() => {
        let cancelled = false;
        getActiveCampaign().then((campaign) => {
            if (!cancelled) setActiveCampaign(campaign);
        });
        return () => {
            cancelled = true;
        };
    }, []);

    if (!activeCampaign) return null;

    const linked = activeCampaign[field].includes(entityId);

    const handleClick = async () => {
        if (linked) return;
        const updated = await updateCampaigns((campaigns) =>
            addLinkedEntity(campaigns, activeCampaign.id, field, entityId)
        );
        const refreshed = updated.find((c) => c.id === activeCampaign.id);
        if (refreshed) setActiveCampaign(refreshed);
    };

    const label = linked
        ? `Linked to ${activeCampaign.name}`
        : `Add to ${activeCampaign.name}`;

    return (
        <Button
            variant="ghost"
            size="icon"
            aria-label={label}
            title={label}
            disabled={linked}
            onClick={handleClick}
        >
            {linked ? (
                <Check className="h-4 w-4" />
            ) : (
                <Link2 className="h-4 w-4" />
            )}
        </Button>
    );
}
