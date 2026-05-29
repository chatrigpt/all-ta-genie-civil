import React, { useState, useEffect } from 'react';
import { Lock, FileSpreadsheet, Eye, EyeOff, Plus, CheckCircle, AlertTriangle, Key, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { Bien, Categorie } from '../types';

interface AdminPanelProps {
  categories: Categorie[];
  onAddBienLocal: (bien: Bien) => void;
  onAddCategorieLocal: (cat: Categorie) => void;
  onClose: () => void;
  isLoggedIn: boolean;
  onLoginSuccess: () => void;
}

export default function AdminPanel({ categories, onAddBienLocal, onAddCategorieLocal, onClose, isLoggedIn, onLoginSuccess }: AdminPanelProps) {
  // Authentication states
  const [password, setPassword] = useState('');
  const [storedPassword, setStoredPassword] = useState('ALLTA2026');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  // Password alteration states
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmNewPass, setConfirmNewPass] = useState('');
  const [changeStatus, setChangeStatus] = useState({ success: false, message: '' });

  // Add Bien form states
  const [site, setSite] = useState('');
  const [superficie, setSuperficie] = useState('');
  const [document, setDocument] = useState('');
  const [prix, setPrix] = useState('');
  const [nombreMois, setNombreMois] = useState('');
  const [mensualites, setMensualites] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [bienSubmitting, setBienSubmitting] = useState(false);
  const [bienFeedback, setBienFeedback] = useState({ type: '', msg: '' });

  // Add Categorie form states
  const [catName, setCatName] = useState('');
  const [catType, setCatType] = useState('');
  const [catImageBase64, setCatImageBase64] = useState('');
  const [catImageName, setCatImageName] = useState('');
  const [catSubmitting, setCatSubmitting] = useState(false);
  const [catFeedback, setCatFeedback] = useState({ type: '', msg: '' });

  // Load password configuration from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('all_ta_admin_pass');
    if (saved) {
      setStoredPassword(saved);
    }
  }, []);

  // Submit passwords
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === storedPassword) {
      setAuthError('');
      onLoginSuccess();
    } else {
      setAuthError('Mot de passe administrateur incorrect');
    }
  };

  // Change password handler
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPass !== storedPassword) {
      setChangeStatus({ success: false, message: 'Ancien mot de passe errone' });
      return;
    }
    if (newPass.length < 4) {
      setChangeStatus({ success: false, message: 'Le mot de passe doit faire au moins 4 caracteres' });
      return;
    }
    if (newPass !== confirmNewPass) {
      setChangeStatus({ success: false, message: 'Les nouveaux mots de passe ne correspondent pas' });
      return;
    }

    localStorage.setItem('all_ta_admin_pass', newPass);
    setStoredPassword(newPass);
    setCurrentPass('');
    setNewPass('');
    setConfirmNewPass('');
    setChangeStatus({ success: true, message: 'Mot de passe mis a jour avec succes' });
  };

  // Enregistrement des propriétés dans la base de données
  const handleAddBien = async (e: React.FormEvent) => {
    e.preventDefault();
    setBienFeedback({ type: '', msg: '' });

    // Validate mandatory fields
    if (!site || !superficie || !document || !prix || !selectedCat) {
      setBienFeedback({ type: 'error', msg: 'Veuillez remplir tous les champs obligatoires, y compris la catégorie' });
      return;
    }

    setBienSubmitting(true);

    const payload = {
      SITES: site,
      "SUPERFICIE EN M²": parseFloat(superficie) || superficie,
      "DOCUMENT EN FIN DE PROJET": document,
      "PRIX DE VENTE": parseFloat(prix) || prix,
      "NOMBRE DE MOIS": nombreMois ? parseInt(nombreMois, 10) : "",
      "MENSUALITES": mensualites ? parseFloat(mensualites) : "",
      "CATEGORIE": selectedCat
    };

    try {
      const targetUrl = "https://digitaladn225.app.n8n.cloud/webhook/all-ta-catalogue";
      const response = await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Statut: ${response.status}`);
      }

      // Add to local state dynamically for live feedback in current session
      onAddBienLocal({
        site,
        superficie,
        document,
        prix,
        nombreMois,
        mensualites,
        categorie: selectedCat
      });

      // Clear property fields
      setSite('');
      setSuperficie('');
      setDocument('');
      setPrix('');
      setNombreMois('');
      setMensualites('');
      setSelectedCat('');
      setBienFeedback({ type: 'success', msg: 'Le bien immobilier a été ajouté avec succès au catalogue' });

    } catch (error) {
      console.error(error);
      setBienFeedback({ 
        type: 'error', 
        msg: "Erreur lors de l'enregistrement du bien immobilier. Veuillez réessayer." 
      });
    } finally {
      setBienSubmitting(false);
    }
  };

  // Image base64 processor
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCatImageName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      const resultStr = reader.result as string;
      // Get only raw base64 string or keep complete dataURI. Complete dataURI with mime is generally best.
      setCatImageBase64(resultStr);
    };
    reader.readAsDataURL(file);
  };

  // Webhook categories transmitter
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setCatFeedback({ type: '', msg: '' });

    if (!catName || !catType || !catImageBase64) {
      setCatFeedback({ type: 'error', msg: "Veuillez remplir le libellé de la catégorie, son type et fournir son illustration" });
      return;
    }

    setCatSubmitting(true);

    const categoryPayload = {
      CATEGORIE: catName,
      TYPE: catType,
      IMAGE: catImageBase64 // Transmisson Base64 dataURL
    };

    try {
      const categoryUrl = "https://digitaladn225.app.n8n.cloud/webhook/all-ta-categorie";
      const response = await fetch(categoryUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryPayload)
      });

      if (!response.ok) {
        throw new Error(`Statut: ${response.status}`);
      }

      // Add to local state
      onAddCategorieLocal({
        nom: catName,
        type: catType,
        image: catImageBase64
      });

      setCatName('');
      setCatType('');
      setCatImageBase64('');
      setCatImageName('');
      setCatFeedback({ type: 'success', msg: 'La nouvelle catégorie a été ajoutée avec succès au catalogue' });

    } catch (error) {
      console.error(error);
      setCatFeedback({ 
        type: 'error', 
        msg: "Erreur lors de l'ajout de la catégorie. Veuillez réessayer." 
      });
    } finally {
      setCatSubmitting(false);
    }
  };

  // Login view
  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto bg-white dark:bg-brand-darkgray rounded-2xl border border-gray-100 dark:border-gray-800 p-8 shadow-xl relative" id="admin-login-view">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-xs font-mono text-gray-400 hover:text-brand-red transition-all flex items-center gap-1"
        >
          <ArrowLeft className="h-3 w-3" /> Retour
        </button>

        <div className="text-center space-y-3 mb-8">
          <div className="h-12 w-12 rounded-xl bg-brand-red/10 border border-brand-red/20 mx-auto flex items-center justify-center">
            <Lock className="h-6 w-6 text-brand-red" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-brand-black dark:text-white">Administration ALL-TA</h2>
            <p className="text-xs text-gray-500 font-mono">
              Entrez le mot de passe pour modifier le catalogue
            </p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs text-gray-400 font-mono block">Mot de passe de securite</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Introduisez votre code..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 dark:bg-brand-black text-gray-900 dark:text-white px-4 py-2.5 pl-4 pr-10 rounded-xl border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-brand-red font-mono text-sm"
                required
                id="admin-password-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {authError && (
            <div className="p-3 bg-red-950/20 border border-red-800/40 rounded-xl text-xs text-brand-red flex items-center gap-2 font-mono">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full depth-btn-red py-2.5 rounded-xl font-bold text-sm cursor-pointer"
            id="admin-login-submit-btn"
          >
            S'authentifier
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800">
          <p className="text-[10px] text-center text-gray-500 font-mono">
            Par defaut: ALLTA2026. Vous pourrez modifier le mot de passe une fois connecte.
          </p>
        </div>
      </div>
    );
  }

  // Connected admin view
  return (
    <div className="space-y-8" id="admin-dashboard-view">
      
      {/* Header section admin */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-brand-black dark:text-white flex items-center gap-2">
            Espace de Gestion ALL-TA
          </h2>
          <p className="text-xs text-gray-500 font-mono">
            Paramétrage de la base des biens immobiliers
          </p>
        </div>
        <button
          onClick={onClose}
          className="depth-btn-black px-4 py-2 font-mono text-xs font-bold rounded-xl flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Retour catalogue
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form 1: Ajouter un Bien (Property Form) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-brand-darkgray rounded-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-4 shadow-sm">
            <h3 className="text-base font-bold text-brand-black dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2 flex items-center gap-2">
              <Plus className="h-5 w-5 text-brand-red animate-pulse" /> Ajouter un Bien Immobilier au Catalogue
            </h3>

            {bienFeedback.msg && (
              <div className={`p-4 rounded-xl text-xs flex items-start gap-2.5 font-sans ${
                bienFeedback.type === 'success' 
                  ? 'bg-green-500/10 border border-green-500/20 text-green-400' 
                  : 'bg-red-500/10 border border-red-500/20 text-red-400'
              }`}>
                {bienFeedback.type === 'success' ? <CheckCircle className="h-4 w-4 shrink-0" /> : <AlertTriangle className="h-4 w-4 shrink-0" />}
                <span>{bienFeedback.msg}</span>
              </div>
            )}

            <form onSubmit={handleAddBien} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* SITES - Required */}
              <div className="space-y-1">
                <label className="text-xs text-gray-400 font-mono">SITES (Obligatoire)</label>
                <input
                  type="text"
                  placeholder="Ex: Songon Agboville extension"
                  value={site}
                  onChange={(e) => setSite(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-brand-black text-gray-900 dark:text-white px-3 py-2 rounded-xl text-sm border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-brand-red"
                  required
                />
              </div>

              {/* SUPERFICIE EN M² - Required */}
              <div className="space-y-1">
                <label className="text-xs text-gray-400 font-mono">SUPERFICIE EN M² (Obligatoire)</label>
                <input
                  type="text"
                  placeholder="Ex: 500"
                  value={superficie}
                  onChange={(e) => setSuperficie(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-brand-black text-gray-900 dark:text-white px-3 py-2 rounded-xl text-sm border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-brand-red font-mono"
                  required
                />
              </div>

              {/* DOCUMENT EN FIN DE PROJET - Required */}
              <div className="space-y-1">
                <label className="text-xs text-gray-400 font-mono">DOCUMENT ATTRIBUE (Obligatoire)</label>
                <input
                  type="text"
                  placeholder="Ex: ACD / Titre Foncier / Approbation"
                  value={document}
                  onChange={(e) => setDocument(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-brand-black text-gray-900 dark:text-white px-3 py-2 rounded-xl text-sm border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-brand-red"
                  required
                />
              </div>

              {/* PRIX DE VENTE - Required */}
              <div className="space-y-1">
                <label className="text-xs text-gray-400 font-mono">PRIX DE VENTE (Obligatoire, en FCFA)</label>
                <input
                  type="text"
                  placeholder="Ex: 15000000"
                  value={prix}
                  onChange={(e) => setPrix(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-brand-black text-gray-900 dark:text-white px-3 py-2 rounded-xl text-sm border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-brand-red font-mono"
                  required
                />
              </div>

              {/* CATEGORIE - Selection obligatoire */}
              <div className="space-y-1">
                <label className="text-xs text-gray-400 font-mono">CATEGORIE (Obligatoire)</label>
                <select
                  value={selectedCat}
                  onChange={(e) => setSelectedCat(e.target.value)}
                  className="w-full bg-gray-50 text-gray-950 px-3 py-2.5 rounded-xl text-sm border border-gray-200 focus:outline-none focus:border-brand-red cursor-pointer font-sans"
                  required
                >
                  <option value="" disabled>-- Choisir la catégorie dans la fiche --</option>
                  {categories && categories.map((cat, idx) => (
                    <option key={idx} value={cat.nom} className="text-gray-900">
                      {cat.nom}
                    </option>
                  ))}
                  {(!categories || categories.length === 0) && (
                    <>
                      <option value="Terrain">Terrain</option>
                      <option value="Maison">Maison</option>
                    </>
                  )}
                </select>
              </div>

              {/* NOMBRE DE MOIS - Optional */}
              <div className="space-y-1">
                <label className="text-xs text-gray-400 font-mono font-sans inline-flex items-center gap-1">
                  NOMBRE DE MOIS (Optionnel) <span className="text-[10px] text-gray-500 font-mono">(Credit)</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: 12"
                  value={nombreMois}
                  onChange={(e) => setNombreMois(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-brand-black text-gray-900 dark:text-white px-3 py-2 rounded-xl text-sm border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-brand-red font-mono"
                />
              </div>

              {/* MENSUALITES - Optional */}
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs text-gray-400 font-mono font-sans inline-flex items-center gap-1">
                  MENSUALITES (Optionnel, en FCFA) <span className="text-[10px] text-gray-500 font-mono">(Credit)</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: 1250000"
                  value={mensualites}
                  onChange={(e) => setMensualites(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-brand-black text-gray-900 dark:text-white px-3 py-2 rounded-xl text-sm border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-brand-red font-mono"
                />
              </div>

              <div className="md:col-span-2 pt-2">
                <button
                  type="submit"
                  disabled={bienSubmitting}
                  className="w-full depth-btn-red py-2.5 rounded-xl font-bold font-sans text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  id="submit-bien-webhook"
                >
                  {bienSubmitting ? "Ajout du bien en cours..." : "Ajouter le bien immobilier au catalogue"}
                </button>
              </div>

            </form>
          </div>
        </div>

        {/* Form 2: Ajouter une Categorie (Categories Form) & Change Password */}
        <div className="space-y-6">
          
          {/* Categorisation panel with image Base64 converter */}
          <div className="bg-white dark:bg-brand-darkgray rounded-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-4 shadow-sm">
            <h3 className="text-base font-bold text-brand-black dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2 flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-brand-red" /> Ajouter une Categorie (Base64)
            </h3>

            {catFeedback.msg && (
              <div className={`p-4 rounded-xl text-xs flex items-start gap-2.5 ${
                catFeedback.type === 'success' 
                  ? 'bg-green-500/10 border border-green-500/20 text-green-400' 
                  : 'bg-red-500/10 border border-red-500/20 text-red-400'
              }`}>
                {catFeedback.type === 'success' ? <CheckCircle className="h-4 w-4 shrink-0" /> : <AlertTriangle className="h-4 w-4 shrink-0" />}
                <span className="text-xs">{catFeedback.msg}</span>
              </div>
            )}

            <form onSubmit={handleAddCategory} className="space-y-3">
              {/* CATEGORIE Name */}
              <div className="space-y-1">
                <label className="text-xs text-gray-400 font-mono">LIBELLE DE LA CATEGORIE</label>
                <input
                  type="text"
                  placeholder="Ex: Terrain"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-brand-black text-gray-900 dark:text-white px-3 py-2 rounded-xl text-sm border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-brand-red"
                  required
                />
              </div>

              {/* TYPE Name */}
              <div className="space-y-1">
                <label className="text-xs text-gray-400 font-mono">TYPE</label>
                <input
                  type="text"
                  placeholder="Ex: Commercial / Reside / Lot"
                  value={catType}
                  onChange={(e) => setCatType(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-brand-black text-gray-900 dark:text-white px-3 py-2 rounded-xl text-sm border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-brand-red"
                  required
                />
              </div>

              {/* File Image input auto-converts to Base64 */}
              <div className="space-y-1">
                <label className="text-xs text-gray-400 font-mono block">ILLUSTRATION IMAGE (Base64)</label>
                <div className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl p-3 text-center hover:border-brand-red transition-all cursor-pointer relative bg-gray-50 dark:bg-brand-black">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    required={!catImageBase64}
                  />
                  <ImageIcon className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                  <p className="text-[10px] text-gray-500 font-mono">
                    {catImageName ? `${catImageName.substring(0, 20)}...` : "Choisir un fichier image (.png, .jpg)"}
                  </p>
                </div>
                {catImageBase64 && (
                  <div className="mt-2 text-right">
                    <span className="text-[9px] font-mono text-green-400 uppercase bg-green-950/20 border border-green-800/20 px-1.5 py-0.5 rounded">
                      Image chargee en Base64
                    </span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={catSubmitting}
                className="w-full depth-btn-black py-2 rounded-xl font-bold text-xs cursor-pointer text-center disabled:opacity-50"
                id="submit-category-webhook"
              >
                {catSubmitting ? "Transmission en cours..." : "Ajoûter la categorie"}
              </button>
            </form>
          </div>

          {/* Change password panel */}
          <div className="bg-white dark:bg-brand-darkgray rounded-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-brand-black dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2 flex items-center gap-2">
              <Key className="h-4 w-4 text-brand-red" /> Securite: Modifier le Mot de passe
            </h3>

            {changeStatus.message && (
              <div className={`p-4 rounded-xl text-xs flex items-center gap-2 ${
                changeStatus.success 
                  ? 'bg-green-500/10 border border-green-500/20 text-green-400' 
                  : 'bg-red-500/10 border border-red-500/20 text-red-400'
              }`}>
                <span>{changeStatus.message}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-2">
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 font-mono">CODE ACTUEL</label>
                <input
                  type="password"
                  placeholder="Code actuel..."
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-brand-black text-white px-3 py-1.5 rounded-xl text-xs border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-brand-red"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 font-mono">NOUVEAU CODE</label>
                <input
                  type="password"
                  placeholder="Nouveau code..."
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-brand-black text-white px-3 py-1.5 rounded-xl text-xs border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-brand-red"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 font-mono">CONFIRMER LE NOUVEAU CODE</label>
                <input
                  type="password"
                  placeholder="Confirmer nouveau code..."
                  value={confirmNewPass}
                  onChange={(e) => setConfirmNewPass(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-brand-black text-white px-3 py-1.5 rounded-xl text-xs border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-brand-red"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 lg:mt-3 border border-brand-red hover:bg-brand-red hover:text-white dark:text-white font-mono rounded-lg px-2.5 py-1 text-xs cursor-pointer transition-colors"
                id="update-pwd-btn"
              >
                Actualiser mon code
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
}
