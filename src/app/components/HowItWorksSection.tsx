import { Search, Scale, MapPin } from 'lucide-react';

const steps = [
  {
    icon: Search,
    title: 'Discover materials',
    description: 'Verified local materials, organized and searchable.',
  },
  {
    icon: Scale,
    title: 'Compare clearly',
    description: 'See pricing ranges and carbon indicators early.',
  },
  {
    icon: MapPin,
    title: 'Source locally',
    description: 'Connect directly with manufacturers and suppliers.',
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-emerald-50 to-white">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl text-center mb-16 text-gray-900">
          How it works
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="text-center bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow duration-300">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <Icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl mb-3 text-gray-900">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}