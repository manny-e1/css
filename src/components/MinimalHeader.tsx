import Image from "next/image";

export function MinimalHeader() {
	return (
		<header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
			<div className="max-w-7xl mx-auto px-6 py-4">
				<div className="flex items-center justify-between">
					{/* Logo */}
					<div className="flex items-center gap-3">
						<Image
							src="/logo.png"
							alt="Carbon Smart Spaces Logo"
							width={80}
							height={80}
							className="rounded-lg"
						/>
						<div>
							<div className="text-sm text-gray-900">Carbon Smart Spaces</div>
							<div className="text-xs text-emerald-700">by KINE MODU</div>
						</div>
					</div>

					{/* Simple nav - optional, can be removed */}
					<div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
						<a
							href="#supplier-signup"
							className="hover:text-emerald-600 transition-colors"
						>
							For suppliers
						</a>
						<a
							href="#partnerships"
							className="hover:text-emerald-600 transition-colors"
						>
							Partnerships
						</a>
					</div>
				</div>
			</div>
		</header>
	);
}
