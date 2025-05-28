import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata } from 'next';
import './globals.css';
import { EB_Garamond } from 'next/font/google';

export const fontWiki = EB_Garamond({
	variable: '--font-wiki',
	subsets: ['latin'],
});

export const metadata: Metadata = {
	title: 'WikiWeaver',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<Analytics />
			<SpeedInsights />
			<body>{children}</body>
		</html>
	);
}
