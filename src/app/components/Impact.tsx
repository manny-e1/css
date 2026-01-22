import { Leaf, Users, Zap } from 'lucide-react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';

const impacts = [
  {
    icon: Leaf,
    title: 'Lower-carbon buildings',
    description: 'Material carbon data becomes visible early, when decisions matter most.',
  },
  {
    icon: Users,
    title: 'Stronger local supply chains',
    description: 'Local manufacturers gain visibility and access to professional buyers.',
  },
  {
    icon: Zap,
    title: 'Faster, clearer sourcing',
    description: 'Better information reduces delays, waste, and reliance on imports.',
  },
];

export function Impact() {
  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Background accent image */}
      <div className="absolute right-0 top-0 w-1/3 h-full opacity-5 hidden lg:block">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1630404991412-9504d094e8ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmVlbiUyMGJ1aWxkaW5nJTIwc3VzdGFpbmFibGV8ZW58MXx8fHwxNzY4ODI3MTIyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Green building"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <h2 className="text-3xl md:text-4xl text-center mb-4 text-gray-900">
          Impact
        </h2>
        <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
          Building a more sustainable and transparent construction industry in East Africa
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {impacts.map((impact, index) => {
            const Icon = impact.icon;
            return (
              <div key={index} className="group">
                <div className="mb-4 inline-flex p-3 bg-emerald-50 rounded-xl group-hover:bg-emerald-100 transition-colors duration-300">
                  <Icon className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-xl mb-3 text-gray-900">
                  {impact.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {impact.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}