// PDF Generation utility for character sheets
// Uses jsPDF for actual PDF generation

import jsPDF from "jspdf";

export interface CharacterSheetData {
    name: string;
    level: number;
    class: string;
    subclass?: string;
    race: string;
    subrace?: string;
    background: string;
    alignment: string;
    abilities: Record<string, number>;
    hitPoints: number;
    armorClass: number;
    speed: number;
    proficiencyBonus: number;
    skills: string[];
    equipment: string[];
    selectedPack?: string;
    spells?: {
        cantrips: string[];
        level1: string[];
        level2: string[];
        level3: string[];
    };
    personality?: string;
    ideals?: string;
    bonds?: string;
    flaws?: string;
    backstory?: string;
}

export class CharacterSheetPDFGenerator {
    static async generatePDF(character: CharacterSheetData): Promise<Blob> {
        // Use jsPDF for PDF generation
        const doc = new jsPDF({
            orientation: "portrait",
            unit: "pt",
            format: "a4",
        });

        // --- Simple D&D sheet layout ---
        // NOTE: For a full-featured sheet, use a jsPDF plugin or template.
        // This is a basic example.

        // Helper to escape text (prevent injection)
        const safe = (str: string) =>
            String(str).replace(
                /[<>&]/g,
                (c) =>
                    ({
                        "<": "&lt;",
                        ">": "&gt;",
                        "&": "&amp;",
                    }[c] || c)
            );

        let y = 40;
        doc.setFont("times", "bold");
        doc.setFontSize(22);
        doc.text(safe(character.name || "Character Name"), 40, y);

        doc.setFontSize(12);
        doc.setFont("times", "normal");
        y += 24;
        doc.text(`Level: ${safe(String(character.level))}`, 40, y);
        doc.text(
            `Class: ${safe(character.class)}${
                character.subclass ? ` (${safe(character.subclass)})` : ""
            }`,
            180,
            y
        );
        doc.text(
            `Race: ${safe(character.race)}${
                character.subrace ? ` (${safe(character.subrace)})` : ""
            }`,
            350,
            y
        );
        y += 18;
        doc.text(`Background: ${safe(character.background)}`, 40, y);
        doc.text(`Alignment: ${safe(character.alignment)}`, 250, y);

        // Abilities
        y += 30;
        doc.setFont("times", "bold");
        doc.text("Ability Scores", 40, y);
        doc.setFont("times", "normal");
        y += 16;
        let x = 40;
        Object.entries(character.abilities).forEach(([ability, score]) => {
            doc.text(
                `${safe(ability)}: ${score} (${
                    score >= 10 ? "+" : ""
                }${Math.floor((score - 10) / 2)})`,
                x,
                y
            );
            x += 100;
        });

        // Core stats
        y += 30;
        doc.setFont("times", "bold");
        doc.text("Core Stats", 40, y);
        doc.setFont("times", "normal");
        y += 16;
        doc.text(`HP: ${character.hitPoints}`, 40, y);
        doc.text(`AC: ${character.armorClass}`, 120, y);
        doc.text(`Speed: ${character.speed} ft`, 200, y);
        doc.text(`Proficiency: +${character.proficiencyBonus}`, 320, y);

        // Skills
        y += 30;
        doc.setFont("times", "bold");
        doc.text("Skills", 40, y);
        doc.setFont("times", "normal");
        y += 16;
        character.skills.forEach((skill, i) => {
            doc.text(`- ${safe(skill)}`, 60, y + i * 14);
        });
        y += character.skills.length * 14;

        // Equipment
        if (character.equipment.length > 0) {
            y += 20;
            doc.setFont("times", "bold");
            doc.text("Equipment", 40, y);
            doc.setFont("times", "normal");
            y += 16;
            if (character.selectedPack) {
                doc.text(
                    `Selected Pack: ${safe(character.selectedPack)}`,
                    60,
                    y
                );
                y += 14;
            }
            character.equipment.forEach((item, i) => {
                doc.text(`- ${safe(item)}`, 60, y + i * 14);
            });
            y += character.equipment.length * 14;
        }

        // Spells
        if (
            character.spells &&
            (character.spells.cantrips.length > 0 ||
                character.spells.level1.length > 0 ||
                character.spells.level2.length > 0 ||
                character.spells.level3.length > 0)
        ) {
            y += 20;
            doc.setFont("times", "bold");
            doc.text("Spells & Magic", 40, y);
            doc.setFont("times", "normal");
            y += 16;
            if (character.spells.cantrips.length > 0) {
                doc.text("Cantrips:", 60, y);
                y += 14;
                character.spells.cantrips.forEach((spell, i) => {
                    doc.text(`- ${safe(spell)}`, 80, y + i * 14);
                });
                y += character.spells.cantrips.length * 14;
            }
            if (character.spells.level1.length > 0) {
                doc.text("1st Level:", 60, y);
                y += 14;
                character.spells.level1.forEach((spell, i) => {
                    doc.text(`- ${safe(spell)}`, 80, y + i * 14);
                });
                y += character.spells.level1.length * 14;
            }
            if (character.spells.level2.length > 0) {
                doc.text("2nd Level:", 60, y);
                y += 14;
                character.spells.level2.forEach((spell, i) => {
                    doc.text(`- ${safe(spell)}`, 80, y + i * 14);
                });
                y += character.spells.level2.length * 14;
            }
            if (character.spells.level3.length > 0) {
                doc.text("3rd Level:", 60, y);
                y += 14;
                character.spells.level3.forEach((spell, i) => {
                    doc.text(`- ${safe(spell)}`, 80, y + i * 14);
                });
                y += character.spells.level3.length * 14;
            }
        }

        // Story
        if (
            character.personality ||
            character.ideals ||
            character.bonds ||
            character.flaws ||
            character.backstory
        ) {
            y += 20;
            doc.setFont("times", "bold");
            doc.text("Character Story", 40, y);
            doc.setFont("times", "normal");
            y += 16;
            if (character.personality) {
                doc.text(`Personality: ${safe(character.personality)}`, 60, y);
                y += 14;
            }
            if (character.ideals) {
                doc.text(`Ideals: ${safe(character.ideals)}`, 60, y);
                y += 14;
            }
            if (character.bonds) {
                doc.text(`Bonds: ${safe(character.bonds)}`, 60, y);
                y += 14;
            }
            if (character.flaws) {
                doc.text(`Flaws: ${safe(character.flaws)}`, 60, y);
                y += 14;
            }
            if (character.backstory) {
                doc.text(`Backstory: ${safe(character.backstory)}`, 60, y);
                y += 14;
            }
        }

        // Footer
        y += 30;
        doc.setFontSize(10);
        doc.setFont("times", "italic");
        doc.text("Generated by D&D ToolBox Character Creator", 40, y);

        // Output as Blob
        const pdfBlob = doc.output("blob");
        return pdfBlob as unknown as Promise<Blob>;
    }

    static downloadPDF(character: CharacterSheetData, filename?: string): void {
        this.generatePDF(character).then((blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download =
                filename || `${character.name || "character"}-sheet.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        });
    }

    // If you want to keep the HTML print version, ensure all user data is escaped/sanitized!
    private static generateHTMLCharacterSheet(
        character: CharacterSheetData
    ): string {
        const getAbilityModifier = (score: number) =>
            Math.floor((score - 10) / 2);

        // Simple HTML escaping to prevent XSS when inserting user-controlled data
        const escapeHtml = (value: unknown): string =>
            String(value)
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#39;");

        // Helper for skills (for demo, just list them)
        const skillsList = character.skills
            .map((skill) => `<li>${escapeHtml(skill)}</li>`)
            .join("");

        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(character.name)} - D&D Character Sheet</title>
    <style>
        @import url('https://fonts.googleapis.com/css?family=Roboto+Slab:700|Roboto:400,700&display=swap');
        body {
            font-family: 'Roboto', 'Times New Roman', serif;
            background: #f8f6f2;
            color: #222;
            margin: 0;
            padding: 0;
        }
        .sheet-container {
            max-width: 900px;
            margin: 30px auto;
            background: #fff;
            border: 2px solid #222;
            border-radius: 10px;
            box-shadow: 0 4px 24px rgba(0,0,0,0.08);
            padding: 32px 36px 36px 36px;
        }
        .sheet-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            border-bottom: 3px double #222;
            padding-bottom: 10px;
            margin-bottom: 18px;
        }
        .sheet-title {
            font-family: 'Roboto Slab', serif;
            font-size: 2.2em;
            font-weight: 700;
            letter-spacing: 2px;
            text-transform: uppercase;
        }
        .sheet-meta {
            text-align: right;
            font-size: 1.1em;
        }
        .sheet-meta span {
            display: block;
        }
        .main-grid {
            display: grid;
            grid-template-columns: 220px 1fr 220px;
            gap: 18px;
        }
        /* Left column: Abilities */
        .abilities-block {
            border: 2px solid #222;
            border-radius: 8px;
            padding: 10px 8px;
            background: #f3efe7;
            margin-bottom: 18px;
        }
        .abilities-title {
            font-family: 'Roboto Slab', serif;
            font-size: 1.1em;
            font-weight: 700;
            text-align: center;
            margin-bottom: 8px;
            letter-spacing: 1px;
        }
        .abilities-list {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        .ability-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border: 1px solid #bbb;
            border-radius: 5px;
            background: #fff;
            padding: 6px 8px;
        }
        .ability-name {
            font-weight: 700;
            font-size: 1.05em;
            width: 60px;
        }
        .ability-score {
            font-size: 1.2em;
            font-weight: 700;
            width: 32px;
            text-align: center;
        }
        .ability-mod {
            font-size: 1.1em;
            font-weight: 400;
            width: 32px;
            text-align: center;
        }
        /* Center column: Core info and skills */
        .core-block {
            border: 2px solid #222;
            border-radius: 8px;
            background: #f3efe7;
            padding: 12px 16px 16px 16px;
            margin-bottom: 18px;
        }
        .core-title {
            font-family: 'Roboto Slab', serif;
            font-size: 1.1em;
            font-weight: 700;
            margin-bottom: 8px;
            letter-spacing: 1px;
        }
        .core-info {
            display: flex;
            flex-wrap: wrap;
            gap: 18px 24px;
            margin-bottom: 10px;
        }
        .core-info-item {
            min-width: 120px;
            font-size: 1em;
        }
        .skills-block {
            border: 2px solid #222;
            border-radius: 8px;
            background: #fff;
            padding: 10px 12px;
            margin-bottom: 18px;
        }
        .skills-title {
            font-family: 'Roboto Slab', serif;
            font-size: 1.05em;
            font-weight: 700;
            margin-bottom: 6px;
        }
        .skills-list {
            columns: 2;
            font-size: 0.98em;
            margin: 0;
            padding-left: 18px;
        }
        /* Right column: Combat and equipment */
        .combat-block {
            border: 2px solid #222;
            border-radius: 8px;
            background: #f3efe7;
            padding: 10px 8px;
            margin-bottom: 18px;
        }
        .combat-title {
            font-family: 'Roboto Slab', serif;
            font-size: 1.1em;
            font-weight: 700;
            text-align: center;
            margin-bottom: 8px;
        }
        .combat-stats {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        .combat-stat-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border: 1px solid #bbb;
            border-radius: 5px;
            background: #fff;
            padding: 6px 8px;
        }
        .combat-label {
            font-weight: 700;
            font-size: 1em;
        }
        .combat-value {
            font-size: 1.1em;
            font-weight: 700;
        }
        .equipment-block {
            border: 2px solid #222;
            border-radius: 8px;
            background: #fff;
            padding: 10px 12px;
            margin-bottom: 18px;
        }
        .equipment-title {
            font-family: 'Roboto Slab', serif;
            font-size: 1.05em;
            font-weight: 700;
            margin-bottom: 6px;
        }
        .equipment-list {
            columns: 2;
            font-size: 0.98em;
            margin: 0;
            padding-left: 18px;
        }
        /* Spells */
        .spells-block {
            border: 2px solid #222;
            border-radius: 8px;
            background: #fff;
            padding: 10px 12px;
            margin-bottom: 18px;
        }
        .spells-title {
            font-family: 'Roboto Slab', serif;
            font-size: 1.05em;
            font-weight: 700;
            margin-bottom: 6px;
        }
        .spells-list {
            font-size: 0.98em;
            margin: 0 0 8px 0;
            padding-left: 18px;
        }
        /* Story section */
        .story-block {
            border: 2px solid #222;
            border-radius: 8px;
            background: #f3efe7;
            padding: 14px 18px;
            margin-top: 18px;
        }
        .story-title {
            font-family: 'Roboto Slab', serif;
            font-size: 1.1em;
            font-weight: 700;
            margin-bottom: 8px;
        }
        .story-item {
            margin-bottom: 8px;
        }
        /* Footer */
        .sheet-footer {
            text-align: center;
            font-size: 0.95em;
            color: #888;
            margin-top: 24px;
        }
        @media print {
            body { background: #fff; }
            .sheet-container { box-shadow: none; margin: 0; }
        }
    </style>
</head>
<body>
    <div class="sheet-container">
        <div class="sheet-header">
            <div class="sheet-title">${character.name || "Character Name"}</div>
            <div class="sheet-meta">
                <span><strong>Level:</strong> ${character.level}</span>
                <span><strong>Class:</strong> ${character.class}${
            character.subclass ? ` (${character.subclass})` : ""
        }</span>
                <span><strong>Race:</strong> ${character.race}${
            character.subrace ? ` (${character.subrace})` : ""
        }</span>
                <span><strong>Background:</strong> ${
                    character.background
                }</span>
                <span><strong>Alignment:</strong> ${character.alignment}</span>
            </div>
        </div>
        <div class="main-grid">
            <!-- Left: Abilities -->
            <div>
                <div class="abilities-block">
                    <div class="abilities-title">Ability Scores</div>
                    <div class="abilities-list">
                        ${Object.entries(character.abilities)
                            .map(
                                ([ability, score]) => `
                            <div class="ability-row">
                                <div class="ability-name">${ability}</div>
                                <div class="ability-score">${score}</div>
                                <div class="ability-mod">${
                                    getAbilityModifier(score) >= 0 ? "+" : ""
                                }${getAbilityModifier(score)}</div>
                            </div>
                        `
                            )
                            .join("")}
                    </div>
                </div>
            </div>
            <!-- Center: Core info and skills -->
            <div>
                <div class="core-block">
                    <div class="core-title">Core Stats</div>
                    <div class="core-info">
                        <div class="core-info-item"><strong>HP:</strong> ${
                            character.hitPoints
                        }</div>
                        <div class="core-info-item"><strong>AC:</strong> ${
                            character.armorClass
                        }</div>
                        <div class="core-info-item"><strong>Speed:</strong> ${
                            character.speed
                        } ft</div>
                        <div class="core-info-item"><strong>Proficiency:</strong> +${
                            character.proficiencyBonus
                        }</div>
                    </div>
                </div>
                <div class="skills-block">
                    <div class="skills-title">Skills</div>
                    <ul class="skills-list">
                        ${skillsList}
                    </ul>
                </div>
                ${
                    character.spells &&
                    (character.spells.cantrips.length > 0 ||
                        character.spells.level1.length > 0 ||
                        character.spells.level2.length > 0 ||
                        character.spells.level3.length > 0)
                        ? `
                <div class="spells-block">
                    <div class="spells-title">Spells & Magic</div>
                    ${
                        character.spells.cantrips.length > 0
                            ? `
                        <div><strong>Cantrips:</strong></div>
                        <ul class="spells-list">${character.spells.cantrips
                            .map((spell) => `<li>${spell}</li>`)
                            .join("")}</ul>
                    `
                            : ""
                    }
                    ${
                        character.spells.level1.length > 0
                            ? `
                        <div><strong>1st Level:</strong></div>
                        <ul class="spells-list">${character.spells.level1
                            .map((spell) => `<li>${spell}</li>`)
                            .join("")}</ul>
                    `
                            : ""
                    }
                    ${
                        character.spells.level2.length > 0
                            ? `
                        <div><strong>2nd Level:</strong></div>
                        <ul class="spells-list">${character.spells.level2
                            .map((spell) => `<li>${spell}</li>`)
                            .join("")}</ul>
                    `
                            : ""
                    }
                    ${
                        character.spells.level3.length > 0
                            ? `
                        <div><strong>3rd Level:</strong></div>
                        <ul class="spells-list">${character.spells.level3
                            .map((spell) => `<li>${spell}</li>`)
                            .join("")}</ul>
                    `
                            : ""
                    }
                </div>
                `
                        : ""
                }
            </div>
            <!-- Right: Combat and equipment -->
            <div>
                <div class="combat-block">
                    <div class="combat-title">Combat Stats</div>
                    <div class="combat-stats">
                        <div class="combat-stat-row">
                            <div class="combat-label">Hit Points</div>
                            <div class="combat-value">${
                                character.hitPoints
                            }</div>
                        </div>
                        <div class="combat-stat-row">
                            <div class="combat-label">Armor Class</div>
                            <div class="combat-value">${
                                character.armorClass
                            }</div>
                        </div>
                        <div class="combat-stat-row">
                            <div class="combat-label">Speed</div>
                            <div class="combat-value">${
                                character.speed
                            } ft</div>
                        </div>
                        <div class="combat-stat-row">
                            <div class="combat-label">Proficiency</div>
                            <div class="combat-value">+${
                                character.proficiencyBonus
                            }</div>
                        </div>
                    </div>
                </div>
                ${
                    character.equipment.length > 0
                        ? `
                <div class="equipment-block">
                    <div class="equipment-title">Equipment${
                        character.selectedPack
                            ? ` (Pack: ${character.selectedPack})`
                            : ""
                    }</div>
                    <ul class="equipment-list">
                        ${character.equipment
                            .map((item) => `<li>${item}</li>`)
                            .join("")}
                    </ul>
                </div>
                `
                        : ""
                }
            </div>
        </div>
        ${
            character.personality ||
            character.ideals ||
            character.bonds ||
            character.flaws ||
            character.backstory
                ? `
        <div class="story-block">
            <div class="story-title">Character Story</div>
            ${
                character.personality
                    ? `<div class="story-item"><strong>Personality:</strong> ${escapeHtml(
                          character.personality
                      )}</div>`
                    : ""
            }
            ${
                character.ideals
                    ? `<div class="story-item"><strong>Ideals:</strong> ${escapeHtml(
                          character.ideals
                      )}</div>`
                    : ""
            }
            ${
                character.bonds
                    ? `<div class="story-item"><strong>Bonds:</strong> ${escapeHtml(
                          character.bonds
                      )}</div>`
                    : ""
            }
            ${
                character.flaws
                    ? `<div class="story-item"><strong>Flaws:</strong> ${escapeHtml(
                          character.flaws
                      )}</div>`
                    : ""
            }
            ${
                character.backstory
                    ? `<div class="story-item"><strong>Backstory:</strong> ${escapeHtml(
                          character.backstory
                      )}</div>`
                    : ""
            }
        </div>
        `
                : ""
        }
        <div class="sheet-footer">
            Generated by D&D ToolBox Character Creator
        </div>
    </div>
</body>
</html>
`;
    }
}

// Alternative approach using browser's print functionality
export const printCharacterSheet = (character: CharacterSheetData) => {
    const htmlContent =
        CharacterSheetPDFGenerator["generateHTMLCharacterSheet"](character);
    const printWindow = window.open("", "_blank");

    if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    }
};
