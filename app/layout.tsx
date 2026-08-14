import type React from "react";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Navbar } from "@/components/navbar";
import { ThemeProvider } from "@/components/theme-provider";
import { SkipToContent } from "@/components/skip-to-content";
import "./globals.css";

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
            {...props}
        >
            <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.09 3.29 9.4 7.86 10.93.57.1.78-.25.78-.55 0-.27-.01-1.16-.02-2.11-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.72.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.75 2.69 1.25 3.35.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18.63 1.59.23 2.77.11 3.06.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14 0 1.55-.01 2.79-.01 3.17 0 .3.2.66.79.55A10.51 10.51 0 0 0 23.5 12c0-6.27-5.23-11.5-11.5-11.5Z" />
        </svg>
    );
}

const geist = Geist({
    subsets: ["latin"],
    variable: "--font-sans",
});

export const metadata: Metadata = {
    title: "D&D Toolbox",
    description: "Your ultimate companion for Dungeons and Dragons adventures",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${geist.variable} font-sans antialiased min-h-screen bg-background text-foreground`}
            >
                <ThemeProvider defaultTheme="system">
                    <SkipToContent />
                    <div className="relative flex min-h-screen flex-col">
                        <Navbar />
                        <main id="main-content" className="flex-1">
                            <div className="container">{children}</div>
                        </main>
                        <footer className="py-6 border-t">
                            <div className="container px-4 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-2">
                                <p className="text-center md:text-left text-sm">
                                    © {new Date().getFullYear()} D&D Toolbox -
                                    Palma Andre All rights reserved.
                                </p>
                                <a
                                    href="https://github.com/PalmaAnd/Dungeons-and-Dragons-ToolBox"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 hover:text-primary"
                                >
                                    <GithubIcon className="h-5 w-5" />
                                    <span>GitHub Repository</span>
                                </a>
                                <p className="text-center md:text-right text-sm text-muted-foreground">
                                    Made with <span aria-label="love">❤️</span>{" "}
                                    for D&D enthusiasts
                                </p>
                            </div>
                        </footer>
                    </div>
                </ThemeProvider>
            </body>
        </html>
    );
}
