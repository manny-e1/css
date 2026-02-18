import Link from "next/link";
import { Building2, CheckCircle } from "lucide-react";

const benefits = [
  "Reach verified construction professionals",
  "Showcase your materials with carbon data",
  "Receive direct inquiries from buyers",
  "Build your brand in the sustainable construction market",
];

export function SupplierSignup() {
  return (
    <section
      id="supplier-signup"
      className="py-20 bg-gradient-to-br from-emerald-50 to-gray-50 scroll-mt-20"
    >
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl mb-4 text-gray-900">
            Are you a material supplier or manufacturer?
          </h2>
          <p className="text-gray-600 text-lg">
            Join our platform and connect with construction professionals across
            East Africa
          </p>
        </div>

        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-lg">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl flex items-center justify-center mb-6">
                <Building2 className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Why join Carbon Smart Spaces?
              </h3>
              <ul className="space-y-4">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-8 rounded-xl">
                <p className="text-gray-700 mb-6 text-lg">
                  Ready to showcase your materials to professionals who care
                  about sustainability?
                </p>
                <Link
                  href="/supplier/register"
                  className="inline-block px-8 py-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all duration-300 shadow-lg font-semibold text-lg"
                >
                  Register as a Supplier
                </Link>
                <p className="text-sm text-gray-600 mt-4">
                  Free to join • Start listing materials today
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
