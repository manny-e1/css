"use client";

import { useState } from "react";

export function Partnerships() {
	const [formData, setFormData] = useState({
		organization: "",
		contactName: "",
		email: "",
		partnershipType: "",
		message: "",
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		console.log("Partnership inquiry:", formData);
		// Handle form submission
		alert("Thank you for your interest! We'll be in touch soon.");
		setFormData({
			organization: "",
			contactName: "",
			email: "",
			partnershipType: "",
			message: "",
		});
	};

	return (
		<section id="partnerships" className="py-20 bg-white scroll-mt-20">
			<div className="max-w-2xl mx-auto px-6">
				<div className="text-center mb-12">
					<h2 className="text-3xl md:text-4xl mb-4 text-gray-900">
						Interested in partnering with us?
					</h2>
					<p className="text-gray-600">
						We collaborate with industry bodies, green building programs, and
						institutions shaping sustainable construction.
					</p>
				</div>

				<form
					onSubmit={handleSubmit}
					className="space-y-6 bg-gray-50 p-8 rounded-2xl border border-gray-200"
				>
					<div>
						<label
							htmlFor="org-name"
							className="block text-sm mb-2 text-gray-700"
						>
							Organization name *
						</label>
						<input
							id="org-name"
							type="text"
							required
							value={formData.organization}
							onChange={(e) =>
								setFormData({ ...formData, organization: e.target.value })
							}
							className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent bg-white"
						/>
					</div>

					<div>
						<label
							htmlFor="contact-name"
							className="block text-sm mb-2 text-gray-700"
						>
							Contact name *
						</label>
						<input
							id="contact-name"
							type="text"
							required
							value={formData.contactName}
							onChange={(e) =>
								setFormData({ ...formData, contactName: e.target.value })
							}
							className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent bg-white"
						/>
					</div>

					<div>
						<label
							htmlFor="partner-email"
							className="block text-sm mb-2 text-gray-700"
						>
							Email *
						</label>
						<input
							id="partner-email"
							type="email"
							required
							value={formData.email}
							onChange={(e) =>
								setFormData({ ...formData, email: e.target.value })
							}
							className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent bg-white"
						/>
					</div>

					<div>
						<label
							htmlFor="partnership-type"
							className="block text-sm mb-2 text-gray-700"
						>
							Type of partnership *
						</label>
						<select
							id="partnership-type"
							required
							value={formData.partnershipType}
							onChange={(e) =>
								setFormData({ ...formData, partnershipType: e.target.value })
							}
							className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent bg-white"
						>
							<option value="">Select partnership type</option>
							<option value="certification">Certification</option>
							<option value="research">Research</option>
							<option value="pilot">Pilot program</option>
							<option value="policy">Policy / Advocacy</option>
							<option value="funding">Funding</option>
							<option value="other">Other</option>
						</select>
					</div>

					<div>
						<label
							htmlFor="message"
							className="block text-sm mb-2 text-gray-700"
						>
							Short message (optional)
						</label>
						<textarea
							id="message"
							rows={4}
							value={formData.message}
							onChange={(e) =>
								setFormData({ ...formData, message: e.target.value })
							}
							className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent resize-none bg-white"
							placeholder="Tell us about your organization and partnership interest..."
						/>
					</div>

					<button
						type="submit"
						className="w-full px-8 py-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-300 shadow-lg"
					>
						Start a conversation
					</button>
				</form>
			</div>
		</section>
	);
}
