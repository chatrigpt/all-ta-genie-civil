import React from 'react';
import { Facebook, PhoneCall, ExternalLink } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-black text-white border-t border-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start border-b border-gray-800 pb-10">
          
          {/* Box 1: Company Profile */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold tracking-tight text-white">
              ALL-TA <span className="text-brand-red">GENIE CIVIL</span>
            </h3>
            <p className="text-xs text-gray-400 max-w-sm leading-relaxed">
              Cabinet d'expertise en promotion immobilière, vente de terrains et travaux publics en Côte d'Ivoire. Agent Immobilier Agréé.
            </p>
          </div>

          {/* Box 2: Social Links with Direct Labels Requested */}
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-widest text-brand-red font-bold">
              Nos Reseaux Sociaux Officiels
            </p>
            <div className="space-y-3 text-xs text-gray-300">
              <div className="flex items-center gap-2">
                <Facebook className="h-4 w-4 shrink-0 text-[#1877F2]" />
                <a
                  href="https://www.facebook.com/profile.php?id=61574179665940"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-brand-red font-mono transition-colors"
                >
                  FACEBOOK : alltageniecivilofficiel
                </a>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 shrink-0 fill-current text-gray-400" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <a
                  href="https://www.x.com/CoproprieteC"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-brand-red font-mono transition-colors"
                >
                  X : CoproprieteC
                </a>
              </div>
            </div>
          </div>

          {/* Box 3: Contact & Support */}
          <div className="space-y-4">
            <p className="text-xs text-brand-red font-bold uppercase tracking-wider">
              Service Client Direct
            </p>
            <div className="space-y-3 font-sans text-xs">
              <div className="space-y-1">
                <span className="text-gray-500 block uppercase font-mono">INFOLINE :</span>
                <a 
                  href="tel:+2250707070752" 
                  className="text-sm font-bold text-white hover:text-brand-red transition-colors inline-flex items-center gap-1.5"
                >
                  <PhoneCall className="h-3.5 w-3.5" /> +225 07 07 07 07 52
                </a>
              </div>
              <div className="space-y-1">
                <span className="text-gray-500 block uppercase font-mono">WHATSAPP :</span>
                <a 
                  href="https://wa.me/2250556945196"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-bold text-white hover:text-brand-red transition-colors inline-flex items-center gap-1.5"
                >
                  +225 05 56 94 51 96
                </a>
              </div>
            </div>
          </div>
          
        </div>

        {/* Bottom copyright segment */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 font-mono gap-4">
          <div>
            &copy; {currentYear} ALL-TA GENIE CIVIL. Tous droits reserves.
          </div>
          <div className="flex items-center gap-2">
            <span>Développement :</span>
            <a 
              href="https://digitaladn.online/webdesign" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-brand-red transition-all flex items-center gap-1 font-bold text-gray-400"
            >
              Digital ADN <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
