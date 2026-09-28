"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  AppSettings,
  CategoryMeta,
  EngravingFormat,
  Language,
  PortLineStyle,
  Product,
  ProductSpec,
  ProductVariant,
} from "@/lib/types";
import type { Rule } from "@/lib/rules/types";
import { PROFILES, getProfile } from "@/lib/profiles";
import { DEFAULT_CATEGORIES, getCategory } from "@/lib/categories";
import { activeVariant, newId, newProduct, newVariant } from "@/lib/defaults";

function seedProducts(): Product[] {
  const profile = PROFILES[0];
  const sample = profile.samples[0];
  if (!sample) return [];
  const now = Date.now();
  const variant = newVariant(sample.color, sample.ean13);
  return [
    {
      id: newId("prod"),
      name: sample.model,
      brandId: profile.id,
      category: sample.category,
      rawSpec: "",
      spec: structuredClone(sample),
      variants: [variant],
      activeVariantId: variant.id,
      stickerData: {},
      stickerText: "",
      utpBadges: [],
      createdAt: now,
      updatedAt: now,
    },
  ];
}

const defaultSettings: AppSettings = {
  importer: { ...PROFILES[0].importer },
  manufacturer: { name: "", address: "", country: "Китай" },
  aiApiKey: "",
  aiModel: "gemini-2.0-flash",
  languages: ["EN", "UA", "RO", "BG", "ES", "PL"],
  portLineStyle: "prefix",
  engravingFormat: "full",
};

interface AppState {
  products: Product[];
  activeId: string | null;
  brandId: string;
  settings: AppSettings;
  rules: Rule[];
  categories: CategoryMeta[];

  setBrandId: (id: string) => void;
  setActive: (id: string) => void;
  addProduct: () => void;
  duplicateProduct: (id: string) => void;
  deleteProduct: (id: string) => void;
  clearAll: () => void;
  updateProduct: (id: string, patch: Partial<Product>) => void;
  updateSpec: (id: string, patch: Partial<ProductSpec>) => void;
  applyParse: (id: string, patch: Partial<ProductSpec>, categoryId?: string) => void;
  updateVariant: (id: string, variantId: string, patch: Partial<ProductVariant>) => void;
  addVariant: (id: string) => void;
  removeVariant: (id: string, variantId: string) => void;
  setActiveVariant: (id: string, variantId: string) => void;
  setStickerText: (id: string, text: string) => void;
  setStickerData: (id: string, key: string, value: string) => void;
  setUtp: (id: string, badges: string[]) => void;

  updateSettings: (patch: Partial<AppSettings>) => void;
  setRules: (rules: Rule[]) => void;
  updateRule: (id: string, patch: Partial<Rule>) => void;
  resetRules: () => void;
  addCategory: (meta: CategoryMeta) => void;
  updateCategory: (id: string, patch: Partial<CategoryMeta>) => void;
}

function touch(product: Product): Product {
  return { ...product, updatedAt: Date.now() };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      products: seedProducts(),
      activeId: null,
      brandId: PROFILES[0].id,
      settings: defaultSettings,
      rules: structuredClone(PROFILES[0].rules),
      categories: structuredClone(DEFAULT_CATEGORIES),

      setBrandId: (brandId) => set({ brandId }),
      setActive: (activeId) => set({ activeId }),

      addProduct: () => {
        const profile = getProfile(get().brandId);
        const category = getCategory(get().categories, "azu");
        const product = newProduct(profile, category, get().settings);
        product.activeVariantId = product.variants[0].id;
        set((state) => ({ products: [...state.products, product], activeId: product.id }));
      },

      duplicateProduct: (id) => {
        const source = get().products.find((p) => p.id === id);
        if (!source) return;
        const copy: Product = {
          ...structuredClone(source),
          id: newId("prod"),
          name: source.name ? `${source.name} copy` : "",
          variants: source.variants.map((v) => ({ ...v, id: newId("var") })),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        copy.activeVariantId = copy.variants[0]?.id ?? "";
        set((state) => ({ products: [...state.products, copy], activeId: copy.id }));
      },

      deleteProduct: (id) =>
        set((state) => {
          const products = state.products.filter((p) => p.id !== id);
          const activeId = state.activeId === id ? (products[0]?.id ?? null) : state.activeId;
          return { products, activeId };
        }),

      clearAll: () => set({ products: [], activeId: null }),

      updateProduct: (id, patch) =>
        set((state) => ({
          products: state.products.map((p) => (p.id === id ? touch({ ...p, ...patch }) : p)),
        })),

      updateSpec: (id, patch) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? touch({ ...p, spec: { ...p.spec, ...patch } }) : p,
          ),
        })),

      applyParse: (id, patch, categoryId) =>
        set((state) => ({
          products: state.products.map((p) => {
            if (p.id !== id) return p;
            const spec = { ...p.spec, ...patch };
            if (patch.certifications) spec.certifications = patch.certifications;
            return touch({
              ...p,
              category: categoryId ?? p.category,
              spec,
            });
          }),
        })),

      updateVariant: (id, variantId, patch) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id
              ? touch({ ...p, variants: p.variants.map((v) => (v.id === variantId ? { ...v, ...patch } : v)) })
              : p,
          ),
        })),

      addVariant: (id) =>
        set((state) => ({
          products: state.products.map((p) => {
            if (p.id !== id) return p;
            const variant = newVariant();
            return touch({ ...p, variants: [...p.variants, variant], activeVariantId: variant.id });
          }),
        })),

      removeVariant: (id, variantId) =>
        set((state) => ({
          products: state.products.map((p) => {
            if (p.id !== id || p.variants.length <= 1) return p;
            const variants = p.variants.filter((v) => v.id !== variantId);
            return touch({
              ...p,
              variants,
              activeVariantId: p.activeVariantId === variantId ? variants[0].id : p.activeVariantId,
            });
          }),
        })),

      setActiveVariant: (id, variantId) =>
        set((state) => ({
          products: state.products.map((p) => (p.id === id ? { ...p, activeVariantId: variantId } : p)),
        })),

      setStickerText: (id, stickyText) =>
        set((state) => ({
          products: state.products.map((p) => (p.id === id ? touch({ ...p, stickerText: stickyText }) : p)),
        })),

      setStickerData: (id, key, value) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? touch({ ...p, stickerData: { ...p.stickerData, [key]: value } }) : p,
          ),
        })),

      setUtp: (id, utpBadges) =>
        set((state) => ({
          products: state.products.map((p) => (p.id === id ? touch({ ...p, utpBadges }) : p)),
        })),

      updateSettings: (patch) => set((state) => ({ settings: { ...state.settings, ...patch } })),
      setRules: (rules) => set({ rules }),
      updateRule: (id, patch) =>
        set((state) => ({ rules: state.rules.map((r) => (r.id === id ? ({ ...r, ...patch } as Rule) : r)) })),
      resetRules: () => set({ rules: structuredClone(getProfile(get().brandId).rules) }),

      addCategory: (meta) =>
        set((state) => ({ categories: [...state.categories, meta] })),
      updateCategory: (id, patch) =>
        set((state) => ({
          categories: state.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),
    }),
    {
      name: "mma-packing-hub-v3",
      partialize: (state) => ({
        products: state.products,
        activeId: state.activeId,
        brandId: state.brandId,
        settings: state.settings,
        rules: state.rules,
        categories: state.categories,
      }),
    },
  ),
);

export { activeVariant };
export type { EngravingFormat, Language, PortLineStyle };
