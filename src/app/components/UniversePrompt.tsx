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
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			universePrompt: '',
		},
	});

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit((d) => {
					const prompt = d.universePrompt.trim();
					if (!prompt.length) {
						onSubmitEmpty();
					}

					onSubmit(prompt);
				})}
				className="flex flex-row gap-2"
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
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button variant="primary" type="submit">
					Explore
					<ChevronRightIcon className="size-[20px]" />
				</Button>
			</form>
		</Form>
	);
}
