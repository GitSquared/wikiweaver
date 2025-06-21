'use client';
import { useRouter } from 'next/navigation';
import { useDeferredValue, useEffect, useRef, useState } from 'react';
import { Command, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
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

	const searchInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		function handleKeyDown(event: KeyboardEvent) {
			const input = searchInputRef.current;
			if (!input) return;

			if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
				event.preventDefault();
				if (window.scrollY <= 5) {
					input.focus();
					return;
				}

				window.scrollTo({
					top: 0,
					behavior: 'smooth',
				});
				setTimeout(() => {
					input.focus();
				}, 200);
			}
			if (event.key === 'Escape' && document.activeElement === input) {
				event.preventDefault();
				setQuery('');
				input.blur();
				setIsFocused(false);
			}
		}

		window.addEventListener('keydown', handleKeyDown);

		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, []);

	return (
		<>
			<div
				className={cn(
					'fixed inset-0 bg-background/30 z-40',
					isFocused ? 'block cursor-pointer' : 'hidden',
				)}
				onClick={() => setIsFocused(false)}
			/>
			<div
				className="w-full max-w-sm h-9 relative overflow-visible z-50"
				onFocus={() => setIsFocused(true)}
			>
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
						ref={searchInputRef}
						query={query}
						onQueryChange={setQuery}
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
								searchInputRef.current?.blur();
								setIsFocused(false);
							}}
						/>
					</CommandList>
				</Command>
			</div>
		</>
	);
}
