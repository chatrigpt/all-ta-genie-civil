import React, { useState, useEffect } from 'react';
import { Lock, FileSpreadsheet, Eye, EyeOff, Plus, CheckCircle, AlertTriangle, Key, ArrowLeft, Image as ImageIcon, Trash2, Edit, FileText } from 'lucide-react';
import { Bien, Categorie } from '../types';

interface AdminPanelProps {
  categories: Categorie[];
  biens: Bien[];
  onAddBienLocal: (bien: Bien) => void;
  onUpdateBienLocal: (oldBien: Bien, updatedBien: Bien) => void;
  onDeleteBienLocal: (bien: Bien) => void;
  onAddCategorieLocal: (cat: Categorie) => void;
  onClose: () => void;
  isLoggedIn: boolean;
  onLoginSuccess: () => void;
}

export default function AdminPanel({ categories, biens, onAddBienLocal, onUpdateBienLocal, onDeleteBienLocal, onAddCategorieLocal, onClose, isLoggedIn, onLoginSuccess }: AdminPanelProps) {
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

  // Add/Edit Bien form states
  const [site, setSite] = useState('');
  const [superficie, setSuperficie] = useState('');
  const [document, setDocument] = useState('');
  const [prix, setPrix] = useState('');
  const [nombreMois, setNombreMois] = useState('');
  const [mensualites, setMensualites] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [bienSubmitting, setBienSubmitting] = useState(false);
  const [bienFeedback, setBienFeedback] = useState({ type: '', msg: '' });

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [originalBien, setOriginalBien] = useState<Bien | null>(null);

  // Deletion trackers
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  const [confirmDeleteIndex, setConfirmDeleteIndex] = useState<number | null>(null);

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

  const formatFCFA = (valStr: string) => {
    if (!valStr) return "-";
    const clean = valStr.toString().replace(/\s/g, '').replace(/FCFA/g, '');
    const num = parseInt(clean, 10);
    if (isNaN(num)) return valStr;
    return new Intl.NumberFormat('fr-FR').format(num) + ' FCFA';
  };

  const handleStartEdit = (bien: Bien) => {
    setIsEditing(true);
    setOriginalBien(bien);
    setSite(bien.site);
    setSuperficie(bien.superficie);
    setDocument(bien.document);
    setPrix(bien.prix);
    setSelectedCat(bien.categorie);
    setNombreMois(bien.nombreMois || '');
    setMensualites(bien.mensualites || '');
    
    // Scroll smoothly to form view
    const formElement = document.getElementById('bien-form-container');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setOriginalBien(null);
    setSite('');
    setSuperficie('');
    setDocument('');
    setPrix('');
    setSelectedCat('');
    setNombreMois('');
    setMensualites('');
    setBienFeedback({ type: '', msg: '' });
  };

  const handleDeleteBien = async (bien: Bien, idx: number) => {
    setDeletingIndex(idx);
    setBienFeedback({ type: '', msg: '' });

    const payload = {
      SITES: bien.site,
      "SUPERFICIE EN M²": parseFloat(bien.superficie) || bien.superficie,
      "DOCUMENT EN FIN DE PROJET": bien.document,
      "PRIX DE VENTE": parseFloat(bien.prix) || bien.prix,
      "NOMBRE DE MOIS": bien.nombreMois ? parseInt(bien.nombreMois, 10) : "",
      "MENSUALITES": bien.mensualites ? parseFloat(bien.mensualites) : "",
      "CATEGORIE": bien.categorie
    };

    try {
      const deleteUrl = "https://digitaladn225.app.n8n.cloud/webhook/all-ta-delete";
      const response = await fetch(deleteUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Statut: ${response.status}`);
      }

      onDeleteBienLocal(bien);
      setConfirmDeleteIndex(null);
      setBienFeedback({ type: 'success', msg: 'Le bien immobilier a été supprimé avec succès du catalogue' });
    } catch (error) {
      console.error(error);
      setBienFeedback({
        type: 'error',
        msg: "Erreur lors de la suppression du bien immobilier. Veuillez réessayer."
      });
    } finally {
      setDeletingIndex(null);
    }
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

    const payload: any = {
      SITES: site,
      "SUPERFICIE EN M²": parseFloat(superficie) || superficie,
      "DOCUMENT EN FIN DE PROJET": document,
      "PRIX DE VENTE": parseFloat(prix) || prix,
      "NOMBRE DE MOIS": nombreMois ? parseInt(nombreMois, 10) : "",
      "MENSUALITES": mensualites ? parseFloat(mensualites) : "",
      "CATEGORIE": selectedCat
    };

    if (isEditing && originalBien) {
      payload["ORIGINAL_SITES"] = originalBien.site;
      payload["ORIGINAL_SUPERFICIE EN M²"] = parseFloat(originalBien.superficie) || originalBien.superficie;
      payload["ORIGINAL_DOCUMENT EN FIN DE PROJET"] = originalBien.document;
      payload["ORIGINAL_PRIX DE VENTE"] = parseFloat(originalBien.prix) || originalBien.prix;
      payload["ORIGINAL_CATEGORIE"] = originalBien.categorie;
      payload["ORIGINAL_NOMBRE DE MOIS"] = originalBien.nombreMois ? parseInt(originalBien.nombreMois, 10) : "";
      payload["ORIGINAL_MENSUALITES"] = originalBien.mensualites ? parseFloat(originalBien.mensualites) : "";
    }

    try {
      const targetUrl = isEditing 
        ? "https://digitaladn225.app.n8n.cloud/webhook/all-ta-update"
        : "https://digitaladn225.app.n8n.cloud/webhook/all-ta-catalogue";

      const response = await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Statut: ${response.status}`);
      }

      const updatedBien: Bien = {
        site,
        superficie,
        document,
        prix,
        nombreMois,
        mensualites,
        categorie: selectedCat
      };

      if (isEditing && originalBien) {
        onUpdateBienLocal(originalBien, updatedBien);
        setBienFeedback({ type: 'success', msg: 'Le bien immobilier a été modifié avec succès dans le catalogue' });
        handleCancelEdit();
      } else {
        // Add to local state dynamically for live feedback in current session
        onAddBienLocal(updatedBien);

        // Clear property fields
        setSite('');
        setSuperficie('');
        setDocument('');
        setPrix('');
        setNombreMois('');
        setMensualites('');
        setSelectedCat('');
        setBienFeedback({ type: 'success', msg: 'Le bien immobilier a été ajouté avec succès au catalogue' });
      }

    } catch (error) {
      console.error(error);
      setBienFeedback({ 
        type: 'error', 
        msg: isEditing
          ? "Erreur lors de la modification du bien immobilier. Veuillez réessayer."
          : "Erreur lors de l'enregistrement du bien immobilier. Veuillez réessayer." 
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
        
        {/* Form 1: Ajouter/Modifier un Bien (Property Form) */}
        <div className="lg:col-span-2 space-y-4" id="bien-form-container">
          <div className={`bg-white dark:bg-brand-darkgray rounded-2xl border p-6 space-y-4 shadow-sm transition-all duration-300 ${
            isEditing ? 'border-amber-500 shadow-md ring-1 ring-amber-500/20' : 'border-gray-100 dark:border-gray-800'
          }`}>
            {isEditing ? (
              <h3 className="text-base font-bold text-amber-600 dark:text-amber-500 border-b border-gray-100 dark:border-gray-800 pb-2 flex items-center gap-2">
                <FileText className="h-5 w-5 text-amber-500 animate-pulse" /> Modifier un Bien Immobilier : {originalBien?.site}
              </h3>
            ) : (
              <h3 className="text-base font-bold text-brand-black dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2 flex items-center gap-2">
                <Plus className="h-5 w-5 text-brand-red animate-pulse" /> Ajouter un Bien Immobilier au Catalogue
              </h3>
            )}

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

              <div className="md:col-span-2 pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={bienSubmitting}
                  className={`flex-grow py-2.5 rounded-xl font-bold font-sans text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-colors ${
                    isEditing 
                      ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-md' 
                      : 'depth-btn-red text-white'
                  }`}
                  id="submit-bien-webhook"
                >
                  {bienSubmitting 
                    ? (isEditing ? "Modification en cours..." : "Ajout en cours...") 
                    : (isEditing ? "Sauvegarder les modifications" : "Ajouter le bien immobilier au catalogue")
                  }
                </button>
                {isEditing && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold text-sm transition-all cursor-pointer font-sans"
                  >
                    Annuler
                  </button>
                )}
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

      {/* Liste de gestion des biens du catalogue */}
      <div className="bg-white dark:bg-brand-darkgray rounded-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-brand-black dark:text-white flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-brand-red" /> Catalogue des Biens Actuels ({biens?.length || 0} biens)
            </h3>
            <p className="text-xs text-slate-500 dark:text-gray-400 font-sans">
              Visualisez, modifiez ou supprimez les biens immobiliers de votre catalogue. Les changements seront instantanément synchronisés via webhook.
            </p>
          </div>
        </div>

        {(!biens || biens.length === 0) ? (
          <div className="text-center py-10 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50/50">
            <p className="text-sm text-gray-400 font-sans">Aucun bien enregistré dans le catalogue.</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-gray-100 dark:border-gray-800 rounded-xl">
            {/* Desktop Table View */}
            <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800 text-left text-xs font-sans hidden md:table">
              <thead className="bg-gray-50 dark:bg-brand-black text-[10px] font-mono text-gray-450 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 font-semibold">Site</th>
                  <th className="px-4 py-3 font-semibold">Catégorie</th>
                  <th className="px-4 py-3 font-semibold">Superficie</th>
                  <th className="px-4 py-3 font-semibold">Document</th>
                  <th className="px-4 py-3 font-semibold">Prix de vente</th>
                  <th className="px-4 py-3 font-semibold text-center">Mensualités</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-brand-darkgray">
                {biens.map((bien, idx) => {
                  const hasCredit = bien.nombreMois && bien.mensualites;
                  return (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-gray-900 dark:text-white">{bien.site}</td>
                      <td className="px-4 py-3.5">
                        <span className="bg-gray-100 dark:bg-zinc-805 text-gray-750 dark:text-gray-300 text-[10px] px-2.5 py-1 rounded-full font-semibold uppercase font-mono">
                          {bien.categorie}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-gray-500 dark:text-gray-400">{bien.superficie} M²</td>
                      <td className="px-4 py-3.5 text-gray-500 dark:text-gray-400 font-mono font-medium">{bien.document}</td>
                      <td className="px-4 py-3.5 font-extrabold text-brand-red font-mono">{formatFCFA(bien.prix)}</td>
                      <td className="px-4 py-3.5 text-center text-gray-500 font-mono">
                        {hasCredit ? (
                          <span className="text-green-650 dark:text-green-400 font-extrabold text-[11px] bg-green-500/10 dark:bg-green-500/5 px-2.5 py-1 rounded-lg">
                            {bien.nombreMois} mois x {formatFCFA(bien.mensualites)}
                          </span>
                        ) : (
                          <span className="text-gray-300 dark:text-gray-700">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        {confirmDeleteIndex === idx ? (
                          <div className="flex items-center justify-end gap-1.5 animate-fade-in">
                            <span className="text-[10px] text-brand-red font-bold font-mono">Confirmer ?</span>
                            <button
                              onClick={() => handleDeleteBien(bien, idx)}
                              disabled={deletingIndex !== null}
                              className="bg-brand-red text-white font-bold text-[10px] px-2.5 py-1 rounded hover:bg-red-700 disabled:opacity-50 cursor-pointer"
                            >
                              Oui
                            </button>
                            <button
                              onClick={() => setConfirmDeleteIndex(null)}
                              className="bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 font-bold text-[10px] px-2.5 py-1 rounded hover:bg-gray-200 cursor-pointer"
                            >
                              Non
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-3">
                            <button
                              onClick={() => handleStartEdit(bien)}
                              className="text-amber-600 hover:text-amber-800 hover:underline cursor-pointer flex items-center gap-0.5 font-bold"
                            >
                              <Edit className="h-3 w-3 inline" /> Modifier
                            </button>
                            <span className="text-gray-200 dark:text-gray-700">|</span>
                            <button
                              onClick={() => setConfirmDeleteIndex(idx)}
                              className="text-brand-red hover:text-red-700 hover:underline cursor-pointer flex items-center gap-0.5 font-bold"
                            >
                              <Trash2 className="h-3 w-3 inline" /> Supprimer
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Mobile Cards View */}
            <div className="grid grid-cols-1 divide-y divide-gray-100 dark:divide-gray-800 md:hidden bg-white dark:bg-brand-darkgray text-gray-900 dark:text-white">
              {biens.map((bien, idx) => {
                const hasCredit = bien.nombreMois && bien.mensualites;
                return (
                  <div key={idx} className="p-4 space-y-3 hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-extrabold text-sm leading-tight">{bien.site}</h4>
                        <span className="inline-block mt-1 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 text-[9px] px-2 py-0.5 rounded-full font-semibold uppercase font-mono">
                          {bien.categorie}
                        </span>
                      </div>
                      <div className="text-right font-mono">
                        <div className="text-xs font-extrabold text-brand-red">{formatFCFA(bien.prix)}</div>
                        <div className="text-[10px] text-gray-500 dark:text-gray-400">{bien.superficie} M²</div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 text-[11px] text-gray-500 dark:text-gray-400 font-mono">
                      <div>Document: <span className="font-medium text-gray-800 dark:text-gray-200">{bien.document}</span></div>
                      {hasCredit && (
                        <div className="text-green-650 dark:text-green-450 font-semibold">
                          Facilité: {bien.nombreMois} mois x {formatFCFA(bien.mensualites)}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-gray-50 dark:border-gray-800 flex justify-end gap-2 text-xs">
                      {confirmDeleteIndex === idx ? (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-brand-red font-bold font-mono">Confirmer ?</span>
                          <button
                            onClick={() => handleDeleteBien(bien, idx)}
                            disabled={deletingIndex !== null}
                            className="bg-brand-red text-white font-extrabold text-[10px] px-3 py-1 rounded-lg hover:bg-red-700 disabled:opacity-50 cursor-pointer"
                          >
                            Supprimer
                          </button>
                          <button
                            onClick={() => setConfirmDeleteIndex(null)}
                            className="bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 font-extrabold text-[10px] px-3 py-1 rounded-lg hover:bg-gray-200 cursor-pointer"
                          >
                            Annuler
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleStartEdit(bien)}
                            className="text-amber-600 hover:text-amber-800 font-semibold bg-amber-50 dark:bg-amber-950/20 rounded-lg px-2.5 py-1 cursor-pointer flex items-center gap-1"
                          >
                            <Edit className="h-3 w-3" /> Modifier
                          </button>
                          <button
                            onClick={() => setConfirmDeleteIndex(idx)}
                            className="text-brand-red hover:text-red-700 font-semibold bg-red-50 dark:bg-red-950/20 rounded-lg px-2.5 py-1 cursor-pointer flex items-center gap-1"
                          >
                            <Trash2 className="h-3 w-3" /> Supprimer
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
