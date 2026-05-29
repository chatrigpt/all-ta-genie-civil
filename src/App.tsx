import React, { useState, useEffect } from 'react';
import { fetchBiensFromSheet, fetchCategoriesFromSheet } from './utils';
import { Bien, Categorie, Theme } from './types';
import Header from './components/Header';
import Catalog from './components/Catalog';
import AdminPanel from './components/AdminPanel';
import Footer from './components/Footer';
import { LayoutGrid, HardHat, FileCheck, ChevronRight, Facebook, Twitter, MessageCircle, Globe, FileText, X } from 'lucide-react';

export default function App() {
  const [view, setView] = useState<'landing' | 'catalog' | 'admin'>('landing');
  const [biens, setBiens] = useState<Bien[]>([]);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [showConditionsModal, setShowConditionsModal] = useState(false);

  // Administrative login state check from localStorage
  useEffect(() => {
    // Check if user is logged in
    const isLogged = localStorage.getItem('all_ta_logged') === 'true';
    if (isLogged) {
      setIsAdminLoggedIn(true);
    }
  }, []);

  // Force system light class to DOM root always
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('dark');
  }, []);

  // Load and merge properties from sheet
  const loadDatabaseData = async () => {
    setLoadingData(true);
    try {
      const [fetchedBiens, fetchedCats] = await Promise.all([
        fetchBiensFromSheet(),
        fetchCategoriesFromSheet()
      ]);
      setBiens(fetchedBiens);
      setCategories(fetchedCats);
    } catch (err) {
      console.error("Erreur de chargement des donnees de la feuille", err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadDatabaseData();
  }, []);

  // Local state update when administrator inserts items
  const handleAddBienLocal = (newBien: Bien) => {
    setBiens(prev => [newBien, ...prev]);
  };

  const handleAddCategorieLocal = (newCat: Categorie) => {
    setCategories(prev => [newCat, ...prev]);
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    localStorage.setItem('all_ta_logged', 'true');
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    localStorage.setItem('all_ta_logged', 'false');
    setView('landing');
  };

  return (
    <div className="min-h-screen font-sans flex flex-col justify-between bg-gray-50 text-gray-900 grid-bg-light">
      
      {/* Universal branding header row */}
      <Header 
        onOpenAdmin={() => setView('admin')}
        isLoggedIn={isAdminLoggedIn}
        onLogout={handleAdminLogout}
      />

      {/* Main Container Area */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {view === 'landing' && (
          <div className="space-y-12 animate-fade-in" id="landing-screen-root">
            
            {/* Split hero showcase panel */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-4">
              
              {/* Left text introduction content block */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                
                <div className="space-y-3">
                  <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-none text-brand-black dark:text-white">
                    VOTRE PROJET <br className="hidden sm:block" /> 
                    IMMOBILIER <span className="text-brand-red">CLE EN MAIN</span>
                  </h1>
                  <p className="text-base text-gray-600 dark:text-gray-400 font-sans max-w-2xl mx-auto lg:mx-0">
                    ALL-TA Genie Civil facilite l'acquisition securisée de biens immobiliers à travers toute la Cote d'Ivoire. Consultez notre catalogue et passez votre commande en un clic.
                  </p>
                </div>

                {/* Main dynamic CTA Stack with social and website integration */}
                <div className="pt-2 flex flex-col gap-4 max-w-md mx-auto lg:mx-0">
                  <button
                    onClick={() => setView('catalog')}
                    className="depth-btn-red text-sm sm:text-base font-extrabold px-6 py-4 rounded-xl flex items-center gap-3 cursor-pointer w-full justify-center group"
                    id="cta-open-catalog-btn"
                  >
                    Consulter le Catalogue Digital <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </button>

                  {/* Redirection links directly below directory requested */}
                  <div className="grid grid-cols-3 gap-2 w-full">
                    <a
                      href="https://www.facebook.com/profile.php?id=61574179665940"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="depth-btn-white text-[10px] font-bold py-2.5 px-1.5 rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer transition-all border border-gray-100"
                      title="Facebook"
                    >
                      <Facebook className="h-4 w-4 text-[#1877F2]" />
                      <span>Facebook</span>
                    </a>
                    
                    <a
                      href="https://www.x.com/CoproprieteC"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="depth-btn-white text-[10px] font-bold py-2.5 px-1.5 rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer transition-all border border-gray-100"
                      title="X (Twitter)"
                    >
                      <Twitter className="h-4 w-4 text-gray-800 dark:text-gray-200" />
                      <span>Twitter / X</span>
                    </a>

                    <a
                      href="https://wa.me/2250556945196"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="depth-btn-white text-[10px] font-bold py-2.5 px-1.5 rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer transition-all border border-gray-100"
                      title="WhatsApp"
                    >
                      <MessageCircle className="h-4 w-4 text-[#25D366]" />
                      <span>WhatsApp</span>
                    </a>
                  </div>

                  {/* SITE INTERNET button */}
                  <a
                    href="https://www.alltageniecivil.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="depth-btn-black text-xs font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer w-full text-center"
                    id="site-internet-btn"
                  >
                    <Globe className="h-4 w-4" /> SITE INTERNET
                  </a>

                  {/* CONDITIONS ET DOCUMENTS DE SOUSCRIPTION button */}
                  <button
                    onClick={() => setShowConditionsModal(true)}
                    className="depth-btn-white bg-slate-50 border border-slate-300 hover:bg-slate-100 text-xs font-extrabold py-3 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer w-full text-brand-red uppercase tracking-wide text-center"
                    id="conditions-souscription-btn"
                  >
                    <FileText className="h-4 w-4 text-brand-red shrink-0" /> Conditions &amp; Documents
                  </button>
                </div>

              </div>

              {/* Right graphical showcase elements block */}
              <div className="lg:col-span-5 relative mt-6 lg:mt-0">
                
                {/* Visual card mimicking elite real estate assurance */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xl space-y-5 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-red/10 rounded-full blur-2xl group-hover:bg-brand-red/20 transition-all duration-500" />
                  
                  {/* Visual logo presentation */}
                  <div className="flex justify-between items-center gap-4">
                    <img 
                      src="https://monadia-bucket.sfo3.cdn.digitaloceanspaces.com/all-ta-logo.jpeg" 
                      alt="Cadre ALL-TA" 
                      className="h-16 w-16 rounded-xl object-cover border border-gray-255 shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                    <img 
                      src="https://monadia-bucket.sfo3.cdn.digitaloceanspaces.com/all-ta-agent-immobilier-agree.jpeg" 
                      alt="Sceau agree" 
                      className="h-14 w-14 rounded-full object-cover border border-gray-200"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="space-y-3 pt-2">
                    <h4 className="text-md font-bold text-brand-black">Garanties de l'agence :</h4>
                    <ul className="space-y-2 font-sans text-xs text-gray-500">
                      <li className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-brand-red shrink-0" />
                        Achat direct promoteur agreé sans intermediaires frauduleux.
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-brand-red shrink-0" />
                        Documents certifiés (ACD, CPF, Approbation de lotissement).
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-brand-red shrink-0" />
                        Facilités de paiement mensuelles sur-mesure de 12 à 24 mois.
                      </li>
                    </ul>
                  </div>

                  {/* Grid tracking counters */}
                  <div className="grid grid-cols-2 gap-3 pt-3">
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center font-mono">
                      <div className="text-lg font-bold text-brand-red">100%</div>
                      <div className="text-[10px] text-gray-500 uppercase">Securise</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center font-mono">
                      <div className="text-lg font-bold text-brand-black">225</div>
                      <div className="text-[10px] text-gray-500 uppercase">Cote d'Ivoire</div>
                    </div>
                  </div>

                </div>
              </div>

            </div>

            {/* Highlights section detailing agency services */}
            <div className="space-y-6 pt-6">
              <div className="text-center space-y-2">
                <p className="text-xs font-mono uppercase tracking-widest text-brand-red font-bold">Pourquoi commander via ALL-TA ?</p>
                <h3 className="text-2xl font-extrabold text-brand-black">Vos garanties d'investissement</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Card 1: Vente de terrains */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:border-brand-red/30 transition-all">
                  <LayoutGrid className="h-8 w-8 text-brand-red mb-3" />
                  <h4 className="text-base font-bold text-brand-black mb-1.5">Terrains Certifies</h4>
                  <p className="text-xs text-gray-500 leading-relaxed font-sans">
                    Des lots homogenes prêts a batir, situes dans des zones en pleine expansion avec documents de fin de projet ACD valides.
                  </p>
                </div>

                {/* Card 2: Commande directe / Assistance administrative */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:border-brand-red/30 transition-all">
                  <FileCheck className="h-8 w-8 text-brand-red mb-3" />
                  <h4 className="text-base font-bold text-brand-black mb-1.5">Assistance administrative</h4>
                  <p className="text-xs text-gray-500 leading-relaxed font-sans">
                    ALL-TA prend en charge toutes vos demarches administratives jusq'a l'obtention finale de vos titres de propriete sans complications.
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* View Switch: Catalog items row */}
        {view === 'catalog' && (
          <div className="space-y-6 animate-fade-in">
            {/* Breadcrumb heading to return */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setView('landing')}
                className="depth-btn-white px-4 py-2 font-mono text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                id="catalog-back-to-home"
              >
                Retour a l'accueil
              </button>
            </div>

            <Catalog 
              biens={biens} 
              categories={categories} 
              isLoading={loadingData} 
              onRefresh={loadDatabaseData}
            />
          </div>
        )}

        {/* View Switch: Admin edit workspace */}
        {view === 'admin' && (
          <div className="animate-fade-in">
            <AdminPanel 
              categories={categories}
              onAddBienLocal={handleAddBienLocal}
              onAddCategorieLocal={handleAddCategorieLocal}
              onClose={() => setView('landing')}
              isLoggedIn={isAdminLoggedIn}
              onLoginSuccess={handleAdminLoginSuccess}
            />
          </div>
        )}
      </main>

      {/* Universal professional network footer */}
      <Footer />

      {/* Conditions et Documents de Souscription Modal overlay */}
      {showConditionsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-black/80 backdrop-blur-md animate-fade-in">
          <div 
            className="w-full max-w-lg bg-white dark:bg-brand-darkgray rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl p-6 sm:p-8 space-y-6 overflow-y-auto max-h-[90vh]"
            id="conditions-modal-container"
          >
            {/* Modal Header */}
            <div className="flex justify-between items-start gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-black text-brand-black dark:text-white uppercase tracking-tight leading-snug">
                  Conditions et Documents de Souscription
                </h3>
                <span className="text-[10px] font-mono text-brand-red uppercase tracking-wide font-bold">
                  ALL-TA Genie Civil
                </span>
              </div>
              <button
                onClick={() => setShowConditionsModal(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-brand-black/60 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer"
                title="Fermer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-6 text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-sans leading-relaxed">
              
              {/* Documents Block */}
              <div className="space-y-3">
                <span className="block font-bold text-xs uppercase tracking-widest text-brand-red font-mono">
                  Dossier de Souscription
                </span>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-red mt-2 shrink-0" />
                    <span>La mensualité d’un mois</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-red mt-2 shrink-0" />
                    <span>La copie de la pièce d'identité en cours de validité</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-red mt-2 shrink-0" />
                    <span>La copie du justificatif de domicile (facture ou certificat de residence)</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-red mt-2 shrink-0" />
                    <span>La copie de la piece d'un ayant droit</span>
                  </li>
                </ul>
              </div>

              {/* Modes de Paiement Block */}
              <div className="space-y-3 border-t border-gray-100 dark:border-gray-800 pt-5">
                <span className="block font-bold text-xs uppercase tracking-widest text-brand-red font-mono">
                  MODES DE PAIEMENT
                </span>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-red mt-2 shrink-0" />
                    <span>Virement bancaire</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-red mt-2 shrink-0" />
                    <span>Application WAVE (Compte ALL-TA GÉNIE CIVIL)</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-red mt-2 shrink-0" />
                    <span>Espèces</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-red mt-2 shrink-0" />
                    <span>Prelevement à la solde</span>
                  </li>
                </ul>
              </div>

              {/* Wave Link Block */}
              <div className="bg-brand-red/5 border border-brand-red/20 rounded-2xl p-4 space-y-3 text-center">
                <span className="block text-xs font-mono font-bold uppercase text-brand-red">
                  Faire un paiement en ligne wave
                </span>
                <a
                  href="https://pay.wave.com/m/M_D42_mSy81qiu/c/ci/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="depth-btn-red text-xs py-2.5 px-4 rounded-xl font-bold inline-flex items-center gap-2 justify-center w-full cursor-pointer"
                >
                  Faire un paiement wave
                </a>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
              <button
                onClick={() => setShowConditionsModal(false)}
                className="depth-btn-black text-xs py-2.5 px-6 rounded-xl font-bold cursor-pointer"
              >
                Fermer
              </button>
            </div>

          </div>
        </div>
      )}
      
    </div>
  );
}
