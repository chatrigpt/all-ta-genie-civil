import { Bien, Categorie } from "./types";

export function parseCSV(text: string): string[][] {
  const result: string[][] = [];
  let row: string[] = [];
  let inQuotes = false;
  let currentVal = "";

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          currentVal += '"';
          i++; // Skip second quote
        } else {
          inQuotes = false;
        }
      } else {
        currentVal += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        row.push(currentVal.trim());
        currentVal = "";
      } else if (char === '\n' || char === '\r') {
        if (char === '\r' && nextChar === '\n') {
          i++;
        }
        row.push(currentVal.trim());
        // Add row if not empty
        if (row.length > 0 && !(row.length === 1 && row[0] === "")) {
          result.push(row);
        }
        row = [];
        currentVal = "";
      } else {
        currentVal += char;
      }
    }
  }

  if (currentVal || row.length > 0) {
    row.push(currentVal.trim());
    if (row.length > 0 && !(row.length === 1 && row[0] === "")) {
      result.push(row);
    }
  }

  return result;
}

export async function fetchBiensFromSheet(): Promise<Bien[]> {
  try {
    const sheetId = "1fUiqfCMGF5R4H9T72XfSJoy1Mh0FOV770hyMK815ZA8";
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Impossible de charger les biens depuis Google Sheets");
    }
    const text = await response.text();
    const rows = parseCSV(text);

    if (rows.length < 2) return [];

    const headers = rows[0].map(h => h.toUpperCase());
    
    // Find index of headers dynamically
    const siteIdx = headers.findIndex(h => h.includes("SITE"));
    const supIdx = headers.findIndex(h => h.includes("SUPERFICIE") || h.includes("M²"));
    const docIdx = headers.findIndex(h => h.includes("DOCUMENT"));
    const prixIdx = headers.findIndex(h => h.includes("PRIX") || h.includes("VENTE"));
    const moisIdx = headers.findIndex(h => h.includes("MOIS") || h.includes("NOMBRE"));
    const mensIdx = headers.findIndex(h => h.includes("MENSUAL"));
    const catIdx = headers.findIndex(h => h.includes("CATEGORIE") || h.includes("CATÉGORIE"));

    const result: Bien[] = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row.length < 3) continue;

      const bien: Bien = {
        site: siteIdx !== -1 && row[siteIdx] ? row[siteIdx] : "",
        superficie: supIdx !== -1 && row[supIdx] ? row[supIdx] : "",
        document: docIdx !== -1 && row[docIdx] ? row[docIdx] : "",
        prix: prixIdx !== -1 && row[prixIdx] ? row[prixIdx] : "",
        nombreMois: moisIdx !== -1 && row[moisIdx] ? row[moisIdx] : "",
        mensualites: mensIdx !== -1 && row[mensIdx] ? row[mensIdx] : "",
        categorie: catIdx !== -1 && row[catIdx] ? row[catIdx] : ""
      };

      if (bien.site && bien.superficie && bien.prix) {
        result.push(bien);
      }
    }
    return result;
  } catch (error) {
    console.error("Erreur lors de la recuperation des biens:", error);
    return getBackupBiens();
  }
}

export async function fetchCategoriesFromSheet(): Promise<Categorie[]> {
  try {
    const sheetId = "1P0wrAZXYnHMq-52YXyUmCFObtqOTxjj3_j6VvtsgiZA";
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Impossible de charger les categories depuis Google Sheets");
    }
    const text = await response.text();
    const rows = parseCSV(text);

    if (rows.length < 2) return [];

    const headers = rows[0].map(h => h.toUpperCase());
    const catIdx = headers.findIndex(h => h.includes("CATEGORIE") || h.includes("CATÉGORIE"));
    const typeIdx = headers.findIndex(h => h.includes("TYPE"));
    const imgIdx = headers.findIndex(h => h.includes("IMAGE"));

    const result: Categorie[] = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row.length < 1) continue;

      const categoryName = catIdx !== -1 && row[catIdx] ? row[catIdx] : "";
      if (!categoryName) continue;

      result.push({
        nom: categoryName,
        type: typeIdx !== -1 && row[typeIdx] ? row[typeIdx] : "Immobilier",
        image: imgIdx !== -1 && row[imgIdx] ? row[imgIdx] : ""
      });
    }
    return result;
  } catch (error) {
    console.error("Erreur lors de la recuperation des categories:", error);
    return getBackupCategories();
  }
}

// Robust fallback values if the fetch encounters cors/network errors or is unconfigured
function getBackupBiens(): Bien[] {
  return [
    {
      site: "All-TA Songon",
      superficie: "500",
      document: "ACD en cours",
      prix: "15000000",
      nombreMois: "12",
      mensualites: "1250000",
      categorie: "Terrain"
    },
    {
      site: "All-TA Bingerville Citadelle",
      superficie: "400",
      document: "ACD approuve",
      prix: "28000000",
      nombreMois: "24",
      mensualites: "1166666",
      categorie: "Terrain"
    },
    {
      site: "All-TA Alépé Foret",
      superficie: "600",
      document: "Lettre d'attribution",
      prix: "6500000",
      nombreMois: "",
      mensualites: "",
      categorie: "Terrain"
    },
    {
      site: "Villa Duplex Cocody",
      superficie: "250",
      document: "CPF / Titre Foncier",
      prix: "120000000",
      nombreMois: "",
      mensualites: "",
      categorie: "Maison"
    }
  ];
}

function getBackupCategories(): Categorie[] {
  return [
    {
      nom: "Terrain",
      type: "Lotissement",
      image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&auto=format&fit=crop&q=60"
    },
    {
      nom: "Maison",
      type: "Construction",
      image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&auto=format&fit=crop&q=60"
    },
    {
      nom: "Appartement",
      type: "Location / Vente",
      image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&auto=format&fit=crop&q=60"
    }
  ];
}

export function cleanPhoneNumber(phone: string): string {
  return phone.replace(/[^0-9]/g, "");
}
