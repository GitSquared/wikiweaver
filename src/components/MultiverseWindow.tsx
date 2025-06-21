'use client';

import { motion, useAnimate } from 'motion/react';
import { forwardRef, useImperativeHandle } from 'react';
import { Tranquiluxe } from 'uvcanvas';
import { cn } from '@/lib/utils';

interface MultiverseWindowProps {
	size: string; // tailwind size- class, e.g 'size-[250px]' or 'size-[100px]'
}

export interface MultiverseWindowRef {
	blowUp: () => Promise<void>;
}

function MultiverseWindow(
	{ size }: MultiverseWindowProps,
	ref: React.ForwardedRef<MultiverseWindowRef>,
) {
	const baseContainerClass = cn(
		size,
		'aspect-square max-w-[90vw] rounded-full origin-center',
	);
	const baseShaderClass =
		'overflow-clip hue-rotate-[282deg] contrast-125 dark:brightness-[80%]';

	const [scope, animate] = useAnimate();

	useImperativeHandle(ref, () => ({
		blowUp: async () =>
			animate(
				scope.current,
				{
					scale: 12,
				},
				{
					duration: 0.5,
					ease: [0.94, 0, 0.83, 0.67],
				},
			),
	}));

	return (
		<motion.div
			ref={scope}
			className={cn(baseContainerClass, 'relative')}
			initial={{ opacity: 0, scale: 1 }}
			whileInView={{
				opacity: 1,
			}}
		>
			<div
				className={cn(
					baseContainerClass,
					baseShaderClass,
					'absolute blur-xl opacity-50',
				)}
			>
				<Tranquiluxe />
			</div>
			<div
				className={cn(baseContainerClass, baseShaderClass, 'absolute scale-90')}
			>
				<Tranquiluxe />
			</div>
		</motion.div>
	);
}

export default forwardRef(MultiverseWindow);
