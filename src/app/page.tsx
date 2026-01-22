import { MinimalHeader } from '@/app/components/MinimalHeader';
import { HeroSection } from '@/app/components/HeroSection';
import { WhatItIs } from '@/app/components/WhatItIs';
import { HowItWorksSection } from '@/app/components/HowItWorksSection';
import { Impact } from '@/app/components/Impact';
import { WhoItsFor } from '@/app/components/WhoItsFor';
import { SupplierSignup } from '@/app/components/SupplierSignup';
import { Partnerships } from '@/app/components/Partnerships';
import { StatusStrip } from '@/app/components/StatusStrip';
import { MinimalFooter } from '@/app/components/MinimalFooter';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <MinimalHeader />
      <main>
        <HeroSection />
        <WhatItIs />
        <HowItWorksSection />
        <Impact />
        <WhoItsFor />
        <SupplierSignup />
        <Partnerships />
        <StatusStrip />
      </main>
      <MinimalFooter />
    </div>
  );
}

