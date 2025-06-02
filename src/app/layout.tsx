import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { AnimatePresence } from 'motion/react';
import { EB_Garamond, Noto_Sans } from 'next/font/google';
import type { ReactNode } from 'react';

const fontSerif = EB_Garamond({
	display: 'swap',
	variable: '--font-serif',
	subsets: ['latin'],
});

const fontSans = Noto_Sans({
	display: 'swap',
	variable: '--font-sans',
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
			<body
				className={cn(
					fontSerif.variable,
					fontSans.variable,
					'bg-background text-foreground font-sans',
				)}
			>
				<AnimatePresence>{children}</AnimatePresence>
			</body>
		</html>
	);
}
