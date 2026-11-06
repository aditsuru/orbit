import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/app/providers";
import { cn } from "@/lib/client/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Orbit",
	description:
		"A collaborative tool to find the best time for everyone to meet.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			className={cn(
				"h-full",
				"antialiased",
				"font-sans",
				"dark",
				geistSans.variable,
				geistMono.variable,
				inter.variable
			)}
			suppressHydrationWarning
		>
			<body className="relative">
				<div className="isolate">
					<Providers>{children}</Providers>
				</div>
			</body>
		</html>
	);
}
