import { CharacterCreator } from "@/components/character-creator";
import characterData from "@/data/character.json";
import enhancedCharacterData from "@/data/enhanced-character.json";

export default function CharacterCreatorPage() {
    return (
        <div className="container mx-auto py-6">
            <CharacterCreator
                characterData={characterData}
                enhancedData={enhancedCharacterData}
            />
        </div>
    );
}
