import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata } from 'next';
import './globals.css';
import { AnimatePresence } from 'motion/react';
import { EB_Garamond } from 'next/font/google';
import type { ReactNode } from 'react';

export const fontWiki = EB_Garamond({
	variable: '--font-wiki',
	subsets: ['latin'],
});

export const metadata: Metadata = {
	metadataBase: new URL('https://wikiweaver.gaby.dev'),
	title: {
		default: 'WikiWeaver',
		template: '%s | WikiWeaver',
	},
	description: "What if you had access to another universe's Wikipedia?",
	authors: [
		{
			name: 'Gabriel Saillard',
			url: 'https://gaby.dev',
		},
	],
};

export default function RootLayout({
	children,
}: Readonly<{
	children: ReactNode;
}>) {
	return (
		<html lang="en">
			<Analytics />
			<SpeedInsights />
			<body className="bg-background text-foreground font-sans">
				<AnimatePresence>{children}</AnimatePresence>
			</body>
		</html>
	);
}
