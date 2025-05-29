'use client';
import { ChevronRightIcon } from '@heroicons/react/24/solid';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

const formSchema = z.object({
	universePrompt: z
		.string()
		.min(10, {
			message: "That's a bit short!",
		})
		.or(z.literal('')),
});

const defaultPrompt = 'A land where trees are used for data storage...';

interface UniversePromptProps {
	onSubmit: (prompt: string) => void | Promise<void>;
	onSubmitEmpty: () => void | Promise<void>;
}

export default function UniversePrompt({
	onSubmit,
	onSubmitEmpty,
}: UniversePromptProps) {
	const [loading, setLoading] = useState(false);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			universePrompt: '',
		},
	});

	async function handleSubmit(data: z.infer<typeof formSchema>) {
		try {
			setLoading(true);
			const prompt = data.universePrompt.trim();
			if (!prompt.length) {
				onSubmitEmpty();
			}

			await onSubmit(prompt);
		} finally {
			setLoading(false);
		}
	}

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(handleSubmit)}
				className="flex flex-row items-center justify-center gap-2 max-w-full flex-wrap"
			>
				<FormField
					control={form.control}
					name="universePrompt"
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<Input
									className="min-w-[400px]"
									type="search"
									placeholder={defaultPrompt}
									disabled={loading}
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button variant="primary" type="submit" disabled={loading}>
					Explore
					<ChevronRightIcon className="size-[20px]" />
				</Button>
			</form>
		</Form>
	);
}
