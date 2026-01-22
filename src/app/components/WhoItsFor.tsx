"use client";

import { Pencil, HardHat, Package } from "lucide-react";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";

const audiences = [
	{
		icon: Pencil,
		title: "Architects & Designers",
		description: "Early material insight for better decisions.",
		targetId: "supplier-signup",
	},
	{
		icon: HardHat,
		title: "Contractors & Procurement Teams",
		description: "Clear sourcing. Fewer delays.",
		targetId: "supplier-signup",
	},
	{
		icon: Package,
		title: "Manufacturers & Suppliers",
		description: "Digital visibility for your products.",
		targetId: "supplier-signup",
	},
];

export function WhoItsFor() {
	const scrollToSection = (id: string) => {
		const element = document.getElementById(id);
		if (element) {
			element.scrollIntoView({ behavior: "smooth", block: "start" });
		}
	};

	return (
		<section className="py-20 bg-gradient-to-br from-gray-50 to-emerald-50 relative overflow-hidden">
			{/* Background image */}
			<div className="absolute left-0 bottom-0 w-1/2 h-2/3 opacity-5 hidden lg:block">
				<ImageWithFallback
					src="https://images.unsplash.com/photo-1736512646004-a1a1461b8511?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhcmNoaXRlY3R1cmUlMjBtYXRlcmlhbHN8ZW58MXx8fHwxNzY4OTI0OTAzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
					alt="Architecture materials"
					className="w-full h-full object-cover"
				/>
			</div>

			<div className="max-w-6xl mx-auto px-6 relative z-10">
				<h2 className="text-3xl md:text-4xl text-center mb-4 text-gray-900">
					Who it's for
				</h2>
				<p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
					Select your role to get started
				</p>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{audiences.map((audience, index) => {
						const Icon = audience.icon;
						return (
							<button
								key={index}
								onClick={() => scrollToSection(audience.targetId)}
								className="group p-8 bg-white border-2 border-gray-200 rounded-xl hover:border-emerald-500 hover:shadow-xl transition-all duration-300 text-left"
							>
								<div className="w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 transition-colors duration-300">
									<Icon className="w-7 h-7 text-emerald-600 group-hover:text-white transition-colors duration-300" />
								</div>
								<h3 className="text-xl mb-3 text-gray-900">{audience.title}</h3>
								<p className="text-gray-600">{audience.description}</p>
							</button>
						);
					})}
				</div>
			</div>
		</section>
	);
}
