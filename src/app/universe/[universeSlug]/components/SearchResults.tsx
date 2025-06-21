'use client';

import { useEffect, useState, useTransition } from 'react';
import { CommandEmpty, CommandItem } from '@/components/ui/command';
import { Skeleton } from '@/components/ui/skeleton';
import { type SearchArticlesResult, searchArticles } from '@/lib/search';

interface SearchResultsProps {
	universeId: string;
	query: string;
	onSelect: (result: SearchArticlesResult) => void;
}

export default function SearchResults({
	universeId,
	query,
	onSelect,
}: SearchResultsProps) {
	const [searchResults, setSearchResults] = useState<SearchArticlesResult[]>(
		[],
	);
	const [isPending, startTransition] = useTransition();

	useEffect(() => {
		if (query.trim().length < 3) {
			setSearchResults([]);
			return;
		}

		startTransition(async () => {
			const results = await searchArticles(universeId, query.trim());
			setSearchResults(results);
		});
	}, [universeId, query]);

	if (query.trim().length < 3) {
		return null;
	}

	if (isPending) {
		return (
			<div className="flex flex-col gap-2 p-2">
				{new Array(3).fill(null).map((_, index) => (
					<Skeleton
						// biome-ignore lint/suspicious/noArrayIndexKey: idc
						key={`loader-${index}`}
						className="w-full h-9"
					/>
				))}
			</div>
		);
	}

	if (!searchResults.length) {
		return <CommandEmpty>No results</CommandEmpty>;
	}

	return (
		<div className="flex flex-col gap-2 p-2">
			{searchResults.map((result) => (
				<CommandItem
					key={result.article.id}
					value={result.article.id}
					onSelect={() => onSelect(result)}
					onClick={() => onSelect(result)}
					className="flex flex-col gap-1 cursor-pointer items-start"
				>
					<span className="font-serif text-base font-medium">
						{result.article.title}
					</span>
					{result.paragraphs.slice(0, 3).map((paragraph) => (
						<blockquote
							key={paragraph.id}
							className="border-l-2 border-foreground/20 pl-2"
						>
							<p className="text-sm line-clamp-2 italic text-muted-foreground">
								{paragraph.text}
							</p>
						</blockquote>
					))}
				</CommandItem>
			))}
		</div>
	);
}
