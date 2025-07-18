'use client';
import { ChevronRightIcon } from '@heroicons/react/24/solid';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
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

const formSchema = z.object({
	universePrompt: z
		.string()
		.min(10, {
			message: "That's a bit short!",
		})
		.max(300, {
			message: 'That is too long, please shorten it.',
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
				await onSubmitEmpty();
				return;
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
				className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-2 w-full"
			>
				<FormField
					control={form.control}
					name="universePrompt"
					render={({ field }) => (
						<FormItem className="flex flex-col w-full">
							<FormControl>
								<Input
									className="w-full lg:w-sm text-sm"
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
				<Button
					variant="primary"
					type="submit"
					disabled={loading}
					className="w-full lg:w-auto"
				>
					Explore
					<ChevronRightIcon className="size-[20px]" />
				</Button>
			</form>
		</Form>
	);
}
