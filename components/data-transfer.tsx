"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Database, Download, Upload, ChevronDown } from "lucide-react";
import { downloadExportedData, importAllData } from "@/lib/storage";

export function DataTransfer() {
    const [feedback, setFeedback] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const showFeedback = (message: string) => {
        setFeedback(message);
        setTimeout(() => setFeedback(null), 4000);
    };

    const handleExport = () => {
        downloadExportedData();
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const parsed = JSON.parse(event.target?.result as string);
                const result = await importAllData(parsed);
                if (result.ok) {
                    showFeedback("Data imported. Reloading…");
                    window.location.reload();
                } else {
                    showFeedback(result.error);
                }
            } catch {
                showFeedback("That file isn't valid JSON.");
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="relative flex items-center">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" aria-label="Data">
                        <Database className="h-4 w-4 mr-1" />
                        Data
                        <ChevronDown className="ml-1 h-3 w-3" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleExport}>
                        <Download className="h-4 w-4 mr-2" />
                        Export Data
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleImportClick}>
                        <Upload className="h-4 w-4 mr-2" />
                        Import Data
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={handleFileChange}
            />
            {feedback && (
                <div className="absolute top-full right-0 mt-2 w-64 rounded-md border bg-popover p-2 text-xs text-popover-foreground shadow-md z-50">
                    {feedback}
                </div>
            )}
        </div>
    );
}
