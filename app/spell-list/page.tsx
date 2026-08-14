import { SpellList } from "@/components/spell-list";
import { getSpellSummaries } from "@/lib/spells";

export default function SpellListPage() {
    const spells = getSpellSummaries();
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Spell List</h1>
            <SpellList spells={spells} />
        </div>
    );
}
