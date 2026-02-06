"use client";

import { useState } from "react";

export function SupplierSignup() {
	const [formData, setFormData] = useState({
		companyName: "",
		contactPerson: "",
		email: "",
		phone: "",
		materialType: "",
		location: "",
		city: "",
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		console.log("Supplier signup:", formData);
		// Handle form submission
		alert("Thank you for applying! We'll contact you before launch.");
		setFormData({
			companyName: "",
			contactPerson: "",
			email: "",
			phone: "",
			materialType: "",
			location: "",
			city: "",
		});
	};

	return (
		<section
			id="supplier-signup"
			className="py-20 bg-gradient-to-br from-emerald-50 to-gray-50 scroll-mt-20"
		>
			<div className="max-w-2xl mx-auto px-6">
				<div className="text-center mb-12">
					<h2 className="text-3xl md:text-4xl mb-4 text-gray-900">
						Are you a material supplier or manufacturer?
					</h2>
					<p className="text-gray-600">We're onboarding local suppliers.</p>
				</div>

				<form
					onSubmit={handleSubmit}
					className="space-y-6 bg-white p-8 rounded-2xl shadow-lg"
				>
					<div>
						<label
							htmlFor="company-name"
							className="block text-sm mb-2 text-gray-700"
						>
							Company name *
						</label>
						<input
							id="company-name"
							type="text"
							required
							value={formData.companyName}
							onChange={(e) =>
								setFormData({ ...formData, companyName: e.target.value })
							}
							className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
						/>
					</div>

					<div>
						<label
							htmlFor="contact-person"
							className="block text-sm mb-2 text-gray-700"
						>
							Contact person *
						</label>
						<input
							id="contact-person"
							type="text"
							required
							value={formData.contactPerson}
							onChange={(e) =>
								setFormData({ ...formData, contactPerson: e.target.value })
							}
							className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
						/>
					</div>

					<div>
						<label
							htmlFor="supplier-email"
							className="block text-sm mb-2 text-gray-700"
						>
							Email *
						</label>
						<input
							id="supplier-email"
							type="email"
							required
							value={formData.email}
							onChange={(e) =>
								setFormData({ ...formData, email: e.target.value })
							}
							className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
						/>
					</div>

					<div>
						<label
							htmlFor="supplier-phone"
							className="block text-sm mb-2 text-gray-700"
						>
							Phone (optional)
						</label>
						<input
							id="supplier-phone"
							type="tel"
							value={formData.phone}
							onChange={(e) =>
								setFormData({ ...formData, phone: e.target.value })
							}
							className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
						/>
					</div>

					<div>
						<label
							htmlFor="material-type"
							className="block text-sm mb-2 text-gray-700"
						>
							Material type *
						</label>
						<select
							id="material-type"
							required
							value={formData.materialType}
							onChange={(e) =>
								setFormData({ ...formData, materialType: e.target.value })
							}
							className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
						>
							<option value="">Select material type</option>
							<option value="timber">Timber</option>
							<option value="cement">Cement</option>
							<option value="tiles">Tiles</option>
							<option value="finishes">Finishes</option>
							<option value="steel">Steel & Metal</option>
							<option value="glass">Glass</option>
							<option value="stone">Stone</option>
							<option value="insulation">Insulation</option>
							<option value="roofing">Roofing</option>
							<option value="other">Other</option>
						</select>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<label
								htmlFor="country"
								className="block text-sm mb-2 text-gray-700"
							>
								Country *
							</label>
							<select
								id="country"
								required
								value={formData.location}
								onChange={(e) =>
									setFormData({ ...formData, location: e.target.value })
								}
								className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
							>
								<option value="">Select country</option>
								<option value="rwanda">Rwanda</option>
								<option value="kenya">Kenya</option>
								<option value="uganda">Uganda</option>
								<option value="tanzania">Tanzania</option>
								<option value="ethiopia">Ethiopia</option>
								<option value="other">Other</option>
							</select>
						</div>

						<div>
							<label
								htmlFor="city"
								className="block text-sm mb-2 text-gray-700"
							>
								City *
							</label>
							<input
								id="city"
								type="text"
								required
								value={formData.city}
								onChange={(e) =>
									setFormData({ ...formData, city: e.target.value })
								}
								className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
							/>
						</div>
					</div>

					<button
						type="submit"
						className="w-full px-8 py-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-300 shadow-lg"
					>
						Apply to list materials
					</button>

					<p className="text-sm text-gray-500 text-center">
						No fees during pilot. We'll contact you before launch.
					</p>
				</form>
			</div>
		</section>
	);
}
