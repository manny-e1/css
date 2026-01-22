import { Linkedin, Mail, MapPin, Phone } from 'lucide-react';

export function MinimalFooter() {
  return (
    <footer className="bg-slate-900 text-gray-300 py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Left - Branding */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white rounded" />
              </div>
              <div>
                <div className="text-white">Carbon Smart Spaces</div>
                <div className="text-xs text-emerald-400">by KINE MODU</div>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Digital material intelligence and sourcing platform for sustainable construction in East Africa.
            </p>
          </div>

          {/* Center - Contact */}
          <div>
            <h3 className="text-white mb-4">Contact Us</h3>
            <div className="space-y-3 text-sm">
              <a 
                href="mailto:kinemodu@gmail.com" 
                className="flex items-center gap-2 text-gray-400 hover:text-emerald-400 transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span>kinemodu@gmail.com</span>
              </a>
              <div className="flex items-center gap-2 text-gray-400">
                <Phone className="w-4 h-4" />
                <span>+250 795 453 045</span>
              </div>
              <div className="flex items-start gap-2 text-gray-400">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                <span>KG 704 st 12, Kacyiru, Kigali, Rwanda<br />East Africa</span>
              </div>
            </div>
          </div>

          {/* Right - Links */}
          <div>
            <h3 className="text-white mb-4">Connect</h3>
            <div className="flex flex-col gap-4">
              <a 
                href="https://www.linkedin.com/company/kine-modu/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-400 hover:text-emerald-400 transition-colors"
              >
                <Linkedin className="w-5 h-5" />
                <span>Follow us on LinkedIn</span>
              </a>
              <div className="flex gap-4 mt-2">
                <a href="#" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">
                  Terms of Service
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-gray-800 text-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} KINE MODU. All rights reserved. Carbon Smart Spaces is a product of KINE MODU.
          </p>
        </div>
      </div>
    </footer>
  );
}
