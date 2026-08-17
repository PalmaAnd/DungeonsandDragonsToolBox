// Shared storage layer: namespaced keys + a swappable, async adapter behind
// typed load/save + full-data export/import. localStorage is the only
// adapter implemented today, but every call site consumes the async API so
// a future real-backend adapter can be swapped in via setStorageAdapter()
// without touching any of them.

export const STORAGE_KEYS = {
    diceRolls: "dnd-toolbox:dice-rolls",
    savedTaverns: "savedTaverns", // legacy key, kept as-is so existing saved taverns aren't orphaned
    savedNpcs: "dnd-toolbox:saved-npcs",
    savedBackstories: "dnd-toolbox:saved-backstories",
    savedLoot: "dnd-toolbox:saved-loot",
    lootSettings: "dnd-toolbox:loot-settings",
    shopState: "dnd-toolbox:shop-state",
    weatherState: "dnd-toolbox:weather-state",
    initiativeEncounter: "dnd-toolbox:initiative-encounter",
    savedCharacters: "dnd-toolbox:saved-characters",
    campaigns: "dnd-toolbox:campaigns",
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

const KNOWN_KEYS: string[] = Object.values(STORAGE_KEYS);

// Collision-resistant id for anything a user saves (campaigns, characters,
// saved generator results, combatants, ...). Falls back for non-secure
// contexts where crypto.randomUUID isn't available.
export function generateId(): string {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export interface StorageAdapter {
    load<T>(key: string, fallback: T): Promise<T>;
    save<T>(key: string, value: T): Promise<void>;
    remove(key: string): Promise<void>;
}

export const localStorageAdapter: StorageAdapter = {
    async load<T>(key: string, fallback: T): Promise<T> {
        if (typeof window === "undefined") return fallback;

        const raw = window.localStorage.getItem(key);
        if (raw === null) return fallback;

        try {
            return JSON.parse(raw) as T;
        } catch {
            return fallback;
        }
    },

    async save<T>(key: string, value: T): Promise<void> {
        if (typeof window === "undefined") return;
        window.localStorage.setItem(key, JSON.stringify(value));
    },

    async remove(key: string): Promise<void> {
        if (typeof window === "undefined") return;
        window.localStorage.removeItem(key);
    },
};

let activeAdapter: StorageAdapter = localStorageAdapter;

// Swap the backing store app-wide (e.g. to a real API-backed adapter) in one
// place, at startup, with no changes required in any tool component.
export function setStorageAdapter(adapter: StorageAdapter): void {
    activeAdapter = adapter;
}

export function loadFromStorage<T>(key: string, fallback: T): Promise<T> {
    return activeAdapter.load(key, fallback);
}

export function saveToStorage<T>(key: string, value: T): Promise<void> {
    return activeAdapter.save(key, value);
}

export function removeFromStorage(key: string): Promise<void> {
    return activeAdapter.remove(key);
}

export type ExportPayload = {
    version: 1;
    exportedAt: string;
    data: Record<string, unknown>;
};

const MISSING = Symbol("missing");

export async function exportAllData(): Promise<ExportPayload> {
    const data: Record<string, unknown> = {};

    for (const key of KNOWN_KEYS) {
        const value = await activeAdapter.load(key, MISSING);
        if (value !== MISSING) {
            data[key] = value;
        }
    }

    return {
        version: 1,
        exportedAt: new Date().toISOString(),
        data,
    };
}

export async function downloadExportedData(filename?: string): Promise<void> {
    if (typeof window === "undefined") return;

    const payload = await exportAllData();
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const date = payload.exportedAt.slice(0, 10);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename ?? `dnd-toolbox-export-${date}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export type ImportResult = { ok: true } | { ok: false; error: string };

export async function importAllData(payload: unknown): Promise<ImportResult> {
    if (
        typeof payload !== "object" ||
        payload === null ||
        !("data" in payload) ||
        typeof (payload as { data: unknown }).data !== "object" ||
        (payload as { data: unknown }).data === null
    ) {
        return {
            ok: false,
            error: "That file doesn't look like a D&D Toolbox export.",
        };
    }

    const data = (payload as { data: Record<string, unknown> }).data;
    let importedCount = 0;

    for (const [key, value] of Object.entries(data)) {
        if (!KNOWN_KEYS.includes(key)) continue;
        await activeAdapter.save(key, value);
        importedCount += 1;
    }

    if (importedCount === 0) {
        return {
            ok: false,
            error: "No recognized data found in that file.",
        };
    }

    return { ok: true };
}
