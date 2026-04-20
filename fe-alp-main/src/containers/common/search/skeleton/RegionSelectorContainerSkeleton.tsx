export function RegionSelectorContainerSkeleton() {
	return (
		<div className="relative">
			<div className="w-full">
				<div className="flex h-[40px] items-center justify-between">
					<div className="skeleton flex h-6 w-[70px] items-center justify-between"></div>
				</div>
				<div className="skeleton h-12 w-full"></div>
			</div>
		</div>
	);
}
