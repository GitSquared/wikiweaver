'use client';

import { cn } from '@/lib/utils';
import { motion, useAnimate } from 'motion/react';
import { forwardRef, useImperativeHandle } from 'react';
import { Tranquiluxe } from 'uvcanvas';

export interface MultiverseWindowRef {
	blowUp: () => Promise<void>;
}

const baseWindowClass =
	'rounded-full overflow-clip hue-rotate-[282deg] contrast-125 dark:brightness-[80%]';

function MultiverseWindow(
	_: unknown,
	ref: React.ForwardedRef<MultiverseWindowRef>,
) {
	const [scope, animate] = useAnimate();

	useImperativeHandle(ref, () => ({
		blowUp: async () =>
			animate(
				scope.current,
				{
					scale: 7,
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
			className="relative w-[250px] h-[250px]"
			initial={{ opacity: 0, scale: 1 }}
			whileInView={{
				opacity: 1,
			}}
		>
			<div
				className={cn(
					'absolute top-[-10px] left-[-10px] w-[270px] h-[270px]',
					baseWindowClass,
					'blur-xl opacity-50',
				)}
			>
				<Tranquiluxe />
			</div>
			<div className={cn('absolute w-[250px] h-[250px]', baseWindowClass)}>
				<Tranquiluxe />
			</div>
		</motion.div>
	);
}

export default forwardRef(MultiverseWindow);
