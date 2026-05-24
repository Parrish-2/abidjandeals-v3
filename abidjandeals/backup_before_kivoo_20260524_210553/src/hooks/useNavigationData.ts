// hooks/useNavigationData.ts
// Projet : Abidjan Deals
// Rôle : Récupère catégories + sous-catégories + villes + communes pour le Mega Menu

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";

// ─────────────────────────────────────────────
// CLIENT SUPABASE
// Remplace par ton import centralisé si tu en as un (ex: @/lib/supabase)
// ─────────────────────────────────────────────
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ─────────────────────────────────────────────
// INTERFACES TYPESCRIPT
// ─────────────────────────────────────────────

export interface SubCategory {
  id: string;           // uuid
  name: string;
  category_id: string;  // référence vers categories.id (text)
}

export interface Category {
  id: string;           // ex: "cat_tech", "cat_immo"
  label_fr: string;
  slug: string;
  icon: string;
  sub_categories: SubCategory[];
}

export interface Commune {
  id: string;           // uuid
  name: string;
  parent_id: string;    // uuid de la ville parente
}

export interface City {
  id: string;           // uuid
  name: string;
  parent_id: null;
  communes: Commune[];
}

// Structure finale consommée par le Mega Menu
export interface NavigationData {
  categories: Category[];
  cities: City[];
}

// ─────────────────────────────────────────────
// FETCHERS
// ─────────────────────────────────────────────

/**
 * Récupère toutes les catégories avec leurs sous-catégories via un join Supabase.
 * Supabase gère le join automatiquement grâce à la FK category_id → categories.id
 */
async function fetchCategoriesWithSubs(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select(`
      id,
      label_fr,
      slug,
      icon,
      sub_categories (
        id,
        name,
        category_id
      )
    `)
    .order("label_fr", { ascending: true });

  if (error) {
    throw new Error(`Erreur fetchCategoriesWithSubs : ${error.message}`);
  }

  // Supabase retourne sub_categories comme tableau directement grâce au join
  return (data ?? []) as Category[];
}

/**
 * Récupère toutes les villes (parent_id IS NULL) et toutes les communes,
 * puis les structure en arbre City[] → Commune[].
 * Deux requêtes légères plutôt qu'un self-join non supporté nativement.
 */
async function fetchCitiesWithCommunes(): Promise<City[]> {
  // 1. Villes : parent_id est NULL
  const { data: citiesData, error: citiesError } = await supabase
    .from("locations")
    .select("id, name, parent_id")
    .is("parent_id", null)
    .order("name", { ascending: true });

  if (citiesError) {
    throw new Error(`Erreur fetchCities : ${citiesError.message}`);
  }

  // 2. Communes : parent_id est NOT NULL
  const { data: communesData, error: communesError } = await supabase
    .from("locations")
    .select("id, name, parent_id")
    .not("parent_id", "is", null)
    .order("name", { ascending: true });

  if (communesError) {
    throw new Error(`Erreur fetchCommunes : ${communesError.message}`);
  }

  const communes = (communesData ?? []) as Commune[];

  // 3. Associer chaque commune à sa ville parente
  const cities: City[] = (citiesData ?? []).map((city) => ({
    id: city.id,
    name: city.name,
    parent_id: null,
    communes: communes.filter((c) => c.parent_id === city.id),
  }));

  return cities;
}

// ─────────────────────────────────────────────
// HOOKS TANSTACK QUERY
// ─────────────────────────────────────────────

/**
 * Hook : catégories + sous-catégories
 * Stale time 10 min car les catégories changent rarement.
 */
export function useCategoriesWithSubs() {
  return useQuery<Category[], Error>({
    queryKey: ["categories", "with-subs"],
    queryFn: fetchCategoriesWithSubs,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook : villes + communes
 * Stale time 15 min car la structure géographique est très stable.
 */
export function useCitiesWithCommunes() {
  return useQuery<City[], Error>({
    queryKey: ["locations", "cities-with-communes"],
    queryFn: fetchCitiesWithCommunes,
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
}

/**
 * Hook combiné : retourne tout en une fois pour alimenter le Mega Menu.
 * Les deux requêtes s'exécutent en parallèle.
 */
export function useNavigationData() {
  const {
    data: categories = [],
    isLoading: loadingCategories,
    error: errorCategories,
  } = useCategoriesWithSubs();

  const {
    data: cities = [],
    isLoading: loadingCities,
    error: errorCities,
  } = useCitiesWithCommunes();

  return {
    // Données
    categories,   // Category[]  → pour les colonnes du Mega Menu
    cities,        // City[]      → pour le filtre géographique

    // États
    isLoading: loadingCategories || loadingCities,
    error: errorCategories ?? errorCities ?? null,

    // Commodités
    isEmpty: categories.length === 0 && cities.length === 0,
  };
}
