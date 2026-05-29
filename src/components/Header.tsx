import React, { useState } from 'react';

interface HeaderProps {
  onOpenAdmin: () => void;
  isLoggedIn: boolean;
  onLogout: () => void;
}

export default function Header({ onOpenAdmin, isLoggedIn, onLogout }: HeaderProps) {
  const [clickCount, setClickCount] = useState(0);

  const handleSecretClick = () => {
    const nextCount = clickCount + 1;
    if (nextCount >= 5) {
      setClickCount(0);
      onOpenAdmin();
    } else {
      setClickCount(nextCount);
    }
  };

  return (
    <header className="border-b bg-white border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left Side: Logo and Company Initials */}
        <div className="flex items-center gap-4 flex-col sm:flex-row text-center sm:text-left">
          <div 
            onClick={handleSecretClick}
            className="cursor-pointer active:scale-95 transition-transform duration-100 relative group"
          >
            <img 
              src="https://monadia-bucket.sfo3.cdn.digitaloceanspaces.com/all-ta-logo.jpeg" 
              alt="Logo ALL-TA" 
              className="h-16 w-16 rounded-lg object-cover shadow-md border-2 border-brand-red transition-colors duration-200"
              referrerPolicy="no-referrer"
            />
            <div className="absolute -bottom-1 -right-1 bg-brand-red text-white text-[9px] font-mono px-1 rounded border border-white">
              PRO
            </div>
          </div>
          <div>
            <h1 
              onClick={handleSecretClick} 
              className="text-2xl font-extrabold tracking-tight text-brand-black cursor-pointer select-none"
            >
              ALL-TA <span className="text-brand-red">GENIE CIVIL</span>
            </h1>
            <p className="text-xs font-mono text-gray-500">
              Agence Immobiliere Agreee - Facilitateur de commandes
            </p>
          </div>
        </div>

        {/* Center/Right side: Certified Badge and Admin Action info */}
        <div className="flex items-center gap-3 flex-wrap justify-center">
          {/* Approved Agent Badge - Just show the logo stamps perfectly clean */}
          <div 
            onClick={handleSecretClick}
            className="cursor-pointer transition-all duration-300 active:scale-95 flex items-center"
          >
            <img 
              src="https://monadia-bucket.sfo3.cdn.digitaloceanspaces.com/all-ta-agent-immobilier-agree.jpeg" 
              alt="Agent Agree All-Ta" 
              className="h-12 w-auto object-contain rounded-lg border border-gray-100 shadow-sm"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* If Logged In: Quick Admin logout */}
          {isLoggedIn && (
            <button
              onClick={onLogout}
              className="px-3 py-1.5 text-xs font-mono rounded-lg bg-red-950 text-red-100 border border-red-800 hover:bg-red-900 transition-colors duration-150"
              id="admin-logout-btn"
            >
              Deconnexion Admin
            </button>
          )}

          {/* Completely hidden click target for admin panel as small spacing element */}
          <div 
            onClick={onOpenAdmin}
            className="h-2 w-2 rounded-full bg-transparent"
          />
        </div>
      </div>
    </header>
  );
}
