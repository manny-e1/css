import { MinimalHeader } from '@/components/MinimalHeader';
import { HeroSection } from '@/components/HeroSection';
import { WhatItIs } from '@/components/WhatItIs';
import { HowItWorksSection } from '@/components/HowItWorksSection';
import { Impact } from '@/components/Impact';
import { WhoItsFor } from '@/components/WhoItsFor';
import { SupplierSignup } from '@/components/SupplierSignup';
import { Partnerships } from '@/components/Partnerships';
import { StatusStrip } from '@/components/StatusStrip';
import { MinimalFooter } from '@/components/MinimalFooter';

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

