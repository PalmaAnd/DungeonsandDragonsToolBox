# D&D Toolbox

A Next.js toolbox for Dungeons & Dragons players and Dungeon Masters — character creation, campaign management, and a full suite of world-building generators, all running in your browser with no account required.

[![CI](https://github.com/PalmaAnd/DungeonsandDragonsToolBox/actions/workflows/ci.yml/badge.svg)](https://github.com/PalmaAnd/DungeonsandDragonsToolBox/actions/workflows/ci.yml)
[![License](https://img.shields.io/github/license/PalmaAnd/DungeonsandDragonsToolBox)](LICENSE)
[![Open issues](https://img.shields.io/github/issues/PalmaAnd/DungeonsandDragonsToolBox)](https://github.com/PalmaAnd/DungeonsandDragonsToolBox/issues)
[![Last commit](https://img.shields.io/github/last-commit/PalmaAnd/DungeonsandDragonsToolBox)](https://github.com/PalmaAnd/DungeonsandDragonsToolBox/commits/main)
![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-149eca?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](.github/CONTRIBUTING.md)

## Contents

-   [Features](#features)
-   [Data & Privacy](#data--privacy)
-   [Tech Stack](#tech-stack)
-   [Getting Started](#getting-started)
-   [Contributing](#contributing)
-   [License](#license)
-   [Code of Conduct](#code-of-conduct)

## Features

### Character Tools

-   **Character Creator** — build a full 5e character sheet (abilities, skills, equipment, spells, backstory) and save multiple characters in your browser.
-   **Spell List** — searchable spell reference.

### Campaign Tools

-   **Campaign Dashboard** — create and manage campaigns, and link the characters you've saved in the Character Creator to them.
-   **Initiative Tracker** — run combat: initiative order, HP, conditions, saving throws, and a turn timer. Encounters persist across page reloads.

### World-Building Generators

-   **NPC Generator**, **Backstory Generator**, **Tavern Generator**, **Loot Generator**, **Magic Item Shop**, **Weather Generator**, **Dice Roller** — generate and save the results you want to keep.

### Reference

-   **Monster Compendium** and **Special Materials** — searchable compendiums.

## Data & Privacy

Everything you create — characters, campaigns, saved NPCs, roll history, and more — is stored locally in your browser via `localStorage`. Nothing is sent to a server. Use the **Data** menu (top right) to export everything to a JSON file for backup, or import a previously exported file to restore it — handy when switching browsers or devices.

## Tech Stack

-   [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
-   [React 19](https://react.dev/)
-   [TypeScript 5](https://www.typescriptlang.org/)
-   [Tailwind CSS 4](https://tailwindcss.com/) with [Radix UI](https://www.radix-ui.com/) primitives

## Getting Started

### Prerequisites

-   **Node.js** (version 20 or later)
-   **npm** or **yarn**

### Installation

1. **Clone the repository:**

    ```bash
    git clone https://github.com/PalmaAnd/DungeonsandDragonsToolBox.git
    cd DungeonsandDragonsToolBox
    ```

2. **Install dependencies:**

    ```bash
    npm install
    ```

3. **Run the development server:**

    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) in your browser.

## Contributing

Contributions are welcome! To get started:

1. **Fork** the repository.
2. **Create a branch** for your feature or fix:
    ```bash
    git checkout -b feature/your-feature-name
    ```
3. **Make your changes**, following the project's existing conventions.
4. **Commit** with a clear, descriptive message.
5. **Push** your branch and **open a pull request** describing your changes.

See [CONTRIBUTING.md](.github/CONTRIBUTING.md) for full guidelines.

## License

Licensed under the MIT License — see [LICENSE](LICENSE) for details.

## Code of Conduct

This project follows a [Code of Conduct](.github/CODE_OF_CONDUCT.md). By participating, you agree to abide by its terms.
