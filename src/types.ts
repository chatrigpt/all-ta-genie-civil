export interface Bien {
  site: string;
  superficie: string;
  document: string;
  prix: string;
  nombreMois: string;
  mensualites: string;
  categorie: string;
}

export interface Categorie {
  nom: string;
  type: string;
  image: string;
}

export type Theme = 'light' | 'dark';
