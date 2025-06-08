'use client';
import { CommandInput, CommandShortcut } from '@/components/ui/command';
import { useEffect, useRef } from 'react';

interface SearchBoxProps {
	query: string;
	onQueryChange: (query: string) => void;
	onFocus?: () => void;
	onBlur?: () => void;
}

export default function SearchBox({
	query,
	onQueryChange,
	onFocus,
	onBlur,
}: SearchBoxProps) {
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
				input.blur();
			}
		}

		window.addEventListener('keydown', handleKeyDown);

		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, []);

	return (
		<div className="relative bg-background">
			<CommandInput
				value={query}
				onValueChange={onQueryChange}
				placeholder="Search articles..."
				ref={searchInputRef}
				onFocus={onFocus}
				onBlur={onBlur}
				className="peer"
			/>
			<CommandShortcut className="sm:block group-focus-within: absolute top-0 right-0 h-full px-4 content-center transition-opacity opacity-50 peer-focus-within:opacity-0">
				⌘K
			</CommandShortcut>
		</div>
	);
}
