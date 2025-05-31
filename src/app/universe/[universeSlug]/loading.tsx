import Spinner from '@/components/Spinner';

export default function LoadingPage() {
	return (
		<div className="flex w-full h-full grow items-center justify-center">
			<Spinner />
		</div>
	);
}
