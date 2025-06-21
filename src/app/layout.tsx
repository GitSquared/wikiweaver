import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata } from 'next';
import './globals.css';
import { AnimatePresence } from 'motion/react';
import { EB_Garamond, Noto_Sans } from 'next/font/google';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import Footer from './components/Footer';

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
			<AnimatePresence>
				<body
					className={cn(
						fontSerif.variable,
						fontSans.variable,
						'bg-background text-foreground font-sans',
					)}
				>
					{children}
					<Footer />
				</body>
			</AnimatePresence>
		</html>
	);
}
