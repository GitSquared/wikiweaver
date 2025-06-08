'use client';
import { Command, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useDeferredValue, useState } from 'react';
import SearchBox from './SearchBox';
import SearchResults from './SearchResults';

export default function HeaderSearch({
	universeId,
	universeSlug,
}: {
	universeId: string;
	universeSlug: string;
}) {
	const [query, setQuery] = useState('');
	const deferredQuery = useDeferredValue(query);

	const [isFocused, setIsFocused] = useState(false);

	const router = useRouter();

	return (
		<div className="w-full max-w-sm h-9 relative overflow-visible z-50">
			<Command
				title="Search articles"
				shouldFilter={false}
				className={cn(
					'transition-all h-max max-h-screen border-1',
					isFocused
						? 'bg-popover shadow-sm border-border'
						: 'bg-background border-transparent',
				)}
			>
				<SearchBox
					query={query}
					onQueryChange={setQuery}
					onFocus={() => setIsFocused(true)}
					onBlur={() => setIsFocused(false)}
				/>

				<CommandList className={isFocused ? 'block' : 'hidden'}>
					<SearchResults
						universeId={universeId}
						query={deferredQuery}
						onSelect={(searchResult) => {
							router.push(
								`/universe/${universeSlug}/wiki/${searchResult.article.slug}`,
							);
							setQuery('');
							(
								document.activeElement as HTMLInputElement | undefined
							)?.blur?.();
						}}
					/>
				</CommandList>
			</Command>
		</div>
	);
}
