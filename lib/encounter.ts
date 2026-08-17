// Shared between app/tools/initiative-tracker/page.tsx and anything that
// hands combatants to it from elsewhere (Monster Compendium, campaign hub's
// "Start Encounter with Party").

import { loadFromStorage, saveToStorage, STORAGE_KEYS } from "@/lib/storage";

export type Combatant = {
    id: string;
    name: string;
    initiative: number;
    initiativeModifier: number;
    hp: number;
    maxHp: number;
    ac: number;
    isPlayer: boolean;
    savingThrows: number;
    failedSaves: number;
    conditions: string[];
};

export type EncounterState = {
    combatants: Combatant[];
    currentTurn: number;
    isCombatActive: boolean;
    maxTurnTime: number;
};

const DEFAULT_MAX_TURN_TIME = 120;

// Appends combatants to whatever encounter is currently saved (or starts a
// fresh one), without disturbing turn order, active-combat state, or the
// turn timer of an encounter already in progress.
export async function addCombatantsToEncounter(
    newCombatants: Combatant[]
): Promise<void> {
    const current = await loadFromStorage<EncounterState | null>(
        STORAGE_KEYS.initiativeEncounter,
        null
    );

    const next: EncounterState = current
        ? { ...current, combatants: [...current.combatants, ...newCombatants] }
        : {
              combatants: newCombatants,
              currentTurn: 0,
              isCombatActive: false,
              maxTurnTime: DEFAULT_MAX_TURN_TIME,
          };

    await saveToStorage(STORAGE_KEYS.initiativeEncounter, next);
}
