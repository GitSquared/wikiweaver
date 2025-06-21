// Note: Next.js doesn't support hydrating client components in loading.tsx well,
// so this spinner is purposely designed to be purely CSS-based and server-rendered.
// NOT: 'use client';

import { CircleLoader } from 'react-spinners';
import { cn } from '@/lib/utils';
import styles from './Spinner.module.css';

export default function Spinner() {
	return (
		<div
			className={cn(
				'flex flex-col items-center justify-center gap-4',
				styles.fadeIn,
			)}
		>
			<div className={styles.spinner}>
				<CircleLoader size={70} />
			</div>
			{/* Content is set in CSS to make it dynamic without needing client-side JS */}
			<p className={cn('text-sm text-center', styles.loadingText)} />
		</div>
	);
}
