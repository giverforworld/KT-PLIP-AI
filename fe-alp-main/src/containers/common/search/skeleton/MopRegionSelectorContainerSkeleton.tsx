export function MopRegionSelectorContainerSkeleton() {
	return (
		<div className="flex w-full gap-4">
			<div className="w-1/2">
				<div className="flex h-[40px] items-center justify-between">
					<div className="skeleton flex h-6 w-14 items-center justify-between"></div>
				</div>
				<div className="skeleton h-12 w-[340px]"></div>
			</div>
			<div className="skeleton mt-[40px] flex h-[48px] w-[48px]"></div>
			<div className="w-1/2">
				<div className="flex h-[40px] items-center justify-between">
					<div className="skeleton flex h-6 w-[121px] items-center justify-between"></div>
				</div>
				<div className="skeleton h-12 w-[340px]"></div>
			</div>
		</div>
	);
}
