import React, { useState, useMemo } from 'react';
import { Search, MapPin, BadgePercent, Shield, ArrowRight, Edit3, ShoppingBag, X } from 'lucide-react';
import { Bien, Categorie } from '../types';

interface CatalogProps {
  biens: Bien[];
  categories: Categorie[];
  isLoading: boolean;
  onRefresh: () => void;
}

export default function Catalog({ biens, categories, isLoading, onRefresh }: CatalogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tous');
  const [priceMax, setPriceMax] = useState<number>(0);
  
  // States for order modal
  const [selectedBien, setSelectedBien] = useState<Bien | null>(null);
  const [clientNotes, setClientNotes] = useState('');

  // Extract unique categories from actual properties to supplement the dynamic list
  const activeCategories = useMemo(() => {
    const list = new Set<string>();
    biens.forEach(b => {
      if (b.categorie) list.add(b.categorie);
    });
    return Array.from(list);
  }, [biens]);

  // Filter biens
  const filteredBiens = useMemo(() => {
    return biens.filter(bien => {
      const matchSearch = bien.site.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          bien.document.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchCategory = selectedCategory === 'Tous' || 
                            bien.categorie.toLowerCase().trim() === selectedCategory.toLowerCase().trim();

      const numericPrice = parseFloat(bien.prix.replace(/[^0-9]/g, "")) || 0;
      const matchPrice = priceMax === 0 || numericPrice <= priceMax;

      return matchSearch && matchCategory && matchPrice;
    });
  }, [biens, searchTerm, selectedCategory, priceMax]);

  // Max price finder
  const maxAvailablePrice = useMemo(() => {
    let max = 0;
    biens.forEach(b => {
      const priceVal = parseFloat(b.prix.replace(/[^0-9]/g, "")) || 0;
      if (priceVal > max) max = priceVal;
    });
    return max;
  }, [biens]);

  // Format currency helper
  const formatFCFA = (valStr: string) => {
    const clean = valStr.replace(/[^0-9]/g, "");
    if (!clean) return valStr;
    const num = parseInt(clean, 10);
    return new Intl.NumberFormat('fr-FR').format(num) + " FCFA";
  };

  // Helper to resolve category illustration from fetched categories list
  const getCategoryImage = (categoryName: string) => {
    const found = categories.find(c => c.nom.toLowerCase().trim() === categoryName.toLowerCase().trim());
    if (found && found.image) return found.image;
    
    // Aesthetic real estate category default images
    if (categoryName.toLowerCase().includes("terrain")) {
      return "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&auto=format&fit=crop&q=80";
    }
    if (categoryName.toLowerCase().includes("maison") || categoryName.toLowerCase().includes("villa")) {
      return "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&auto=format&fit=crop&q=80";
    }
    if (categoryName.toLowerCase().includes("appartement")) {
      return "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&auto=format&fit=crop&q=80";
    }
    return "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&auto=format&fit=crop&q=80";
  };

  // Handlers for Order Submission and WhatsApp compilation
  const handleOpenOrder = (bien: Bien) => {
    setSelectedBien(bien);
    setClientNotes('');
  };

  const handleSendWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBien) return;

    const targetPhone = "2250505038445"; // +225 05 05 03 84 45 relative cleaned string
    
    // Construct the text payload beautifully formatting the order summary without emojis
    let messageText = "ALL-TA GENIE CIVIL - CATALOGUE DIGITAL INTERACTIF\n";
    messageText += "----------------------------------------------\n";
    messageText += "NOUVELLE DEMANDE DE COMMANDE IMMOBILIERE VIA CODE QR\n\n";
    messageText += "Je suis vivement interesse par le bien immobilier suivant vu sur votre catalogue en ligne et je souhaite l'acquerir.\n\n";
    messageText += "PRODUIT SELECTIONNE :\n";
    messageText += "Site: " + selectedBien.site + "\n";
    messageText += "Superficie: " + selectedBien.superficie + " M2\n";
    messageText += "Document attribue: " + selectedBien.document + "\n";
    messageText += "Prix de vente: " + formatFCFA(selectedBien.prix) + "\n";
    
    if (selectedBien.nombreMois && selectedBien.mensualites) {
      messageText += "Nombre de mois: " + selectedBien.nombreMois + " mois\n";
      messageText += "Mensualites: " + formatFCFA(selectedBien.mensualites) + "/mois\n";
    }
    
    if (clientNotes) {
      messageText += "\nNotes complementaires / Questions:\n" + clientNotes + "\n";
    }
    messageText += "\n----------------------------------------------\n";
    messageText += "Demande emise le: " + new Date().toLocaleDateString("fr-FR");
    
    const whatsappUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(messageText)}`;
    window.open(whatsappUrl, '_blank');
    setSelectedBien(null);
  };

  return (
    <div className="space-y-8" id="catalog-main-area">
      {/* Search and Filters Section */}
      <div className="bg-white dark:bg-brand-darkgray rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par site, document..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 dark:bg-brand-black text-gray-800 dark:text-white pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-brand-red font-sans text-sm transition-all"
              id="catalog-search-input"
            />
          </div>

          {/* Dynamic Categories Selector Dropdown if desired or show categories row below */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-gray-50 dark:bg-brand-black text-gray-800 dark:text-white px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-brand-red font-sans text-sm transition-all cursor-pointer"
              id="category-filter-select"
            >
              <option value="Tous">Toutes les categories</option>
              {activeCategories.map((cat, i) => (
                <option key={i} value={cat}>{cat}</option>
              ))}
              {categories.map((cat, i) => (
                <option key={`sheet-${i}`} value={cat.nom}>{cat.nom}</option>
              ))}
            </select>
          </div>

          {/* Price Range Selector for rich interface capabilities */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono text-gray-400 px-1">
              <span>Budget maximum:</span>
              <span>{priceMax === 0 ? "Illimite" : formatFCFA(priceMax.toString())}</span>
            </div>
            <input
              type="range"
              min="0"
              max={maxAvailablePrice || 150000000}
              step="1000000"
              value={priceMax}
              onChange={(e) => setPriceMax(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-gray-200 dark:bg-brand-black rounded-lg appearance-none cursor-pointer accent-brand-red"
              id="price-range-slider"
            />
          </div>

        </div>
      </div>

      {/* Visual Dynamic Category Banner */}
      <div className="space-y-3">
        <p className="text-xs font-mono uppercase tracking-widest text-brand-red font-semibold">
          Categories Principales
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button
            onClick={() => setSelectedCategory('Tous')}
            className={`cursor-pointer overflow-hidden rounded-xl border text-left transition-all p-3 relative h-20 ${
              selectedCategory === 'Tous'
                ? 'border-brand-red bg-red-950/20 text-white shadow-sm'
                : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-brand-darkgray hover:border-gray-300 dark:hover:border-gray-700'
            }`}
            id="category-tab-all"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
            <img 
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=100&auto=format&fit=crop&q=80" 
              alt="Tout"
              className="absolute inset-0 object-cover w-full h-full z-0 opacity-40"
              referrerPolicy="no-referrer"
            />
            <div className="relative z-20 h-full flex flex-col justify-end">
              <span className="text-xs font-mono text-gray-300 truncate">Secteurs</span>
              <span className="text-sm font-bold text-white truncate">Tous les biens</span>
            </div>
          </button>

          {categories.map((cat, i) => (
            <button
              key={i}
              onClick={() => setSelectedCategory(cat.nom)}
              className={`cursor-pointer overflow-hidden rounded-xl border text-left transition-all p-3 relative h-20 ${
                selectedCategory.toLowerCase().trim() === cat.nom.toLowerCase().trim()
                  ? 'border-brand-red bg-red-950/20 text-white shadow-sm'
                  : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-brand-darkgray hover:border-brand-red/30'
              }`}
              id={`category-tab-${i}`}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
              <img 
                src={cat.image || getCategoryImage(cat.nom)} 
                alt={cat.nom}
                className="absolute inset-0 object-cover w-full h-full z-0 opacity-40 hover:scale-110 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="relative z-20 h-full flex flex-col justify-end">
                <span className="text-[10px] font-mono text-red-400 truncate uppercase">{cat.type || "Immobilier"}</span>
                <span className="text-sm font-bold text-white truncate">{cat.nom}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Grid */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-brand-black dark:text-white">
              Catalogue Immobilier
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {filteredBiens.length} biens trouves correspondant a vos filtres
            </p>
          </div>
          <button 
            onClick={onRefresh}
            className="text-xs font-mono border border-gray-200 dark:border-gray-800 hover:border-brand-red rounded-lg px-3 py-1.5 transition-colors cursor-pointer bg-white dark:bg-brand-darkgray text-gray-600 dark:text-gray-300"
          >
            Actualiser
          </button>
        </div>

        {isLoading ? (
          <div className="py-20 text-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-red mx-auto" />
            <p className="text-sm text-gray-500 font-mono">Chargement des biens de ALL-TA en cours...</p>
          </div>
        ) : filteredBiens.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl bg-white dark:bg-brand-darkgray">
            <ShoppingBag className="h-10 w-10 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-500 font-mono">Aucun bien ne correspond aux criteres de recherche.</p>
            <button
              onClick={() => { setSearchTerm(''); setSelectedCategory('Tous'); setPriceMax(0); }}
              className="mt-4 px-4 py-2 text-xs font-mono border border-brand-red text-brand-red rounded-xl hover:bg-brand-red hover:text-white transition-colors"
            >
              Reinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBiens.map((bien, index) => {
              const hasFacilite = bien.nombreMois && bien.mensualites;
              
              return (
                <div 
                  key={index}
                  className="bg-white dark:bg-brand-darkgray rounded-2xl border-t-4 border-t-brand-red border border-gray-100 dark:border-gray-800/80 shadow-sm hover:shadow-xl hover:border-brand-red/40 transition-all duration-300 overflow-hidden flex flex-col justify-between p-6 space-y-6"
                  id={`property-card-${index}`}
                >
                  {/* Card Header without Images - pure elite tech structure */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
                      <span className="text-[10px] font-mono font-bold text-brand-red tracking-wider uppercase bg-brand-red/5 px-2.5 py-1 rounded-md">
                        {bien.categorie || "Terrain"}
                      </span>
                      <div className="text-xs font-mono text-gray-500 dark:text-gray-400 font-semibold bg-gray-50 dark:bg-brand-black px-2.5 py-0.5 rounded border border-gray-100 dark:border-gray-800">
                        Réf: ALL-TA-{index + 101}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-xl font-extrabold text-brand-black dark:text-white group-hover:text-brand-red transition-colors capitalize leading-snug">
                        {bien.site}
                      </h3>
                    </div>
                  </div>

                  {/* Specifications Grid Sheet - Pure engineering look */}
                  <div className="bg-gray-50 dark:bg-brand-black/40 rounded-xl p-4 border border-gray-100 dark:border-gray-800/60 text-xs space-y-3 font-sans">
                    
                    {/* Superficie Detail */}
                    <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-gray-800/40">
                      <span className="text-gray-500 font-mono">Superficie :</span>
                      <span className="font-extrabold text-brand-black dark:text-gray-200 font-mono">
                        {bien.superficie} m²
                      </span>
                    </div>

                    {/* Legal Document Status */}
                    <div className="flex justify-between items-start pb-2 border-b border-gray-100 dark:border-gray-800/40 gap-4">
                      <span className="text-gray-500 font-mono">Statut juridique :</span>
                      <span className="font-semibold text-right text-brand-black dark:text-gray-300">
                        {bien.document}
                      </span>
                    </div>

                    {/* Pay facilitates overview indicator within specs */}
                    {hasFacilite ? (
                      <div className="flex justify-between items-center text-brand-red">
                        <span className="font-mono text-[10px] font-bold uppercase tracking-wider">Achat à crédit possible :</span>
                        <span className="font-bold text-[10px] font-mono uppercase bg-brand-red/10 px-1.5 py-0.5 rounded">
                          {bien.nombreMois} mois
                        </span>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center text-gray-400">
                        <span className="font-mono text-[10px] uppercase">Financement :</span>
                        <span className="font-mono text-[10px]">Paiement Cash</span>
                      </div>
                    )}
                  </div>

                  {/* Credit facilites box breakdown (Only if available) */}
                  {hasFacilite && (
                    <div className="bg-red-500/5 dark:bg-red-500/10 border border-brand-red/10 rounded-xl p-3 space-y-1.5">
                      <div className="text-[10px] font-mono text-brand-red font-bold uppercase">
                        Conditions de crédit :
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-300 flex justify-between">
                        <span>Échéances : <strong className="text-brand-black dark:text-white font-mono">{bien.nombreMois} mois</strong></span>
                        <span>Mensualité : <strong className="text-brand-red font-mono">{formatFCFA(bien.mensualites)}</strong></span>
                      </div>
                    </div>
                  )}

                  {/* Price and Transaction Launcher row */}
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-mono text-gray-400 block uppercase tracking-wider">Prix de vente</span>
                      <span className="text-lg font-black text-brand-red font-mono">
                        {formatFCFA(bien.prix)}
                      </span>
                    </div>

                    <button
                      onClick={() => handleOpenOrder(bien)}
                      className="depth-btn-red text-xs px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 cursor-pointer transition-all"
                      id={`order-trigger-${index}`}
                    >
                      Commander <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* WhatsApp Checkout Wizard Modal */}
      {selectedBien && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 overflow-y-auto p-4 flex justify-center items-start sm:items-center">
          <div className="my-auto bg-white border border-gray-200 rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl relative space-y-6">
            
            <button
              onClick={() => setSelectedBien(null)}
              className="absolute top-4 right-4 p-2 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all cursor-pointer"
              id="close-order-modal"
              title="Fermer"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header Title */}
            <div className="space-y-1 pr-8 text-left">
              <h3 className="text-xl font-extrabold text-brand-black flex items-center gap-2">
                Bilan de la Commande
              </h3>
              <p className="text-xs text-brand-red font-mono uppercase tracking-wider font-bold">
                Verification avant redirection sur WhatsApp
              </p>
            </div>

            {/* Cart overview summary */}
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200/80 space-y-3.5 font-sans text-left">
              <div className="flex justify-between items-center border-b border-gray-200 pb-2.5">
                <span className="text-gray-500 text-xs font-medium">Produit selectionne:</span>
                <span className="font-extrabold text-sm text-brand-black text-right">{selectedBien.site}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-200 pb-2.5">
                <span className="text-gray-500 text-xs font-medium">Superficie terrain:</span>
                <span className="font-mono text-xs font-extrabold text-gray-800">{selectedBien.superficie} M²</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-200 pb-2.5">
                <span className="text-gray-500 text-xs font-medium">Document fourni:</span>
                <span className="font-mono text-xs font-semibold text-gray-700 text-right">{selectedBien.document}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-200 pb-2.5">
                <span className="text-gray-500 text-xs font-medium">Prix net:</span>
                <span className="font-mono text-sm font-black text-brand-red">{formatFCFA(selectedBien.prix)}</span>
              </div>
              {selectedBien.nombreMois && selectedBien.mensualites && (
                <div className="flex justify-between items-center bg-red-500/5 p-3 rounded-xl border border-brand-red/20 text-xs">
                  <span className="text-brand-red font-mono font-bold uppercase tracking-wider">Facilite d'acquisition:</span>
                  <span className="font-mono font-bold text-gray-800">
                    {selectedBien.nombreMois} mois x {formatFCFA(selectedBien.mensualites)}
                  </span>
                </div>
              )}
            </div>

            {/* Client input form for final message payload */}
            <form onSubmit={handleSendWhatsApp} className="space-y-4 text-left">
              <div className="space-y-3">
                <p className="text-xs font-mono text-gray-400 uppercase tracking-widest font-bold border-b border-gray-100 pb-1.5">
                  Notes ou Questions (Facultatif)
                </p>

                {/* Extra Comments */}
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-500 block font-mono">Vos notes complémentaires ou questions</label>
                  <div className="relative">
                    <Edit3 className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                    <textarea
                      placeholder="Ex: Je souhaite organiser une visite, ou obtenir d'autres renseignements..."
                      value={clientNotes}
                      onChange={(e) => setClientNotes(e.target.value)}
                      rows={3}
                      className="w-full bg-gray-50 text-gray-900 placeholder-gray-400 pl-10 pr-4 py-3 rounded-xl text-xs border border-gray-200 focus:outline-none focus:border-brand-red focus:bg-white transition-all font-sans"
                    />
                  </div>
                </div>
              </div>

              {/* Raised deep-relief submit checkout button */}
              <button
                type="submit"
                className="w-full depth-btn-red py-3.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 cursor-pointer mt-4 transition-all"
                id="submit-whatsapp-redirect"
              >
                Envoyer le bilan de commande sur WhatsApp
              </button>
            </form>

            {/* Note text on security */}
            <p className="text-[10px] text-center text-gray-400 font-mono leading-normal">
              La commande sera expediee à +225 05 05 03 84 45 via un canal securise pour finaliser la transaction de facon officielle.
            </p>

          </div>
        </div>
      )}

    </div>
  );
}
