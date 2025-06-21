'use client';
import type { Ref } from 'react';
import { CommandInput, CommandShortcut } from '@/components/ui/command';

interface SearchBoxProps {
	query: string;
	onQueryChange: (query: string) => void;
	ref?: Ref<HTMLInputElement>;
}

export default function SearchBox({
	query,
	onQueryChange,
	ref,
}: SearchBoxProps) {
	return (
		<div className="relative bg-background">
			<CommandInput
				value={query}
				onValueChange={onQueryChange}
				placeholder="Search articles..."
				ref={ref}
				className="peer"
			/>
			<CommandShortcut className="sm:hidden lg:block group-focus-within: absolute top-0 right-0 h-full px-4 content-center transition-opacity opacity-50 peer-focus-within:opacity-0">
				⌘K
			</CommandShortcut>
		</div>
	);
}
