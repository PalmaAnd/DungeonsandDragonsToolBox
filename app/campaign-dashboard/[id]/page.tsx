"use client";

import { useParams } from "next/navigation";
import { CampaignDetail } from "@/components/campaign-detail";

export default function CampaignDetailPage() {
    const params = useParams<{ id: string }>();

    return (
        <div className="min-h-screen p-4">
            <main className="container mx-auto max-w-3xl">
                <CampaignDetail id={params.id} />
            </main>
        </div>
    );
}
