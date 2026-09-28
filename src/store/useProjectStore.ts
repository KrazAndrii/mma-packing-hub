"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { EngravingFormat, Language, PortSpec, ProductSpec } from "@/lib/types";
import type { Rule } from "@/lib/rules/types";
import { PROFILES, getProfile } from "@/lib/profiles";
import { blankSpec, newId } from "@/lib/defaults";

function initialSpec(): ProductSpec {
  const profile = PROFILES[0];
  if (profile.samples.length) return structuredClone(profile.samples[0]);
  return blankSpec(profile);
}

interface ProjectState {
  profileId: string;
  spec: ProductSpec;
  format: EngravingFormat;
  rules: Rule[];
  aiApiKey: string;
  aiModel: string;
  setProfile: (id: string) => void;
  loadSample: () => void;
  newProduct: () => void;
  updateSpec: (patch: Partial<ProductSpec>) => void;
  updateInput: (patch: Partial<ProductSpec["input"]>) => void;
  addPort: () => void;
  updatePort: (id: string, patch: Partial<PortSpec>) => void;
  removePort: (id: string) => void;
  setFormat: (f: EngravingFormat) => void;
  setRules: (rules: Rule[]) => void;
  updateRule: (id: string, patch: Partial<Rule>) => void;
  resetRules: () => void;
  setAiKey: (k: string) => void;
  setAiModel: (m: string) => void;
  setLanguages: (l: Language[]) => void;
  setBullets: (lang: Language, bullets: string[]) => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      profileId: PROFILES[0].id,
      spec: initialSpec(),
      format: "full",
      rules: structuredClone(PROFILES[0].rules),
      aiApiKey: "",
      aiModel: "gemini-2.0-flash",

      setProfile: (id) => {
        const profile = getProfile(id);
        set((state) => ({
          profileId: id,
          rules: structuredClone(profile.rules),
          spec: {
            ...state.spec,
            brand: profile.name,
            importer: {
              name: profile.importer.name,
              address: profile.importer.address,
              phone: profile.importer.phone,
              country: profile.importer.country,
            },
          },
        }));
      },

      loadSample: () => {
        const profile = getProfile(get().profileId);
        if (profile.samples.length) set({ spec: structuredClone(profile.samples[0]) });
      },

      newProduct: () => {
        const profile = getProfile(get().profileId);
        set({ spec: blankSpec(profile) });
      },

      updateSpec: (patch) => set((state) => ({ spec: { ...state.spec, ...patch } })),

      updateInput: (patch) =>
        set((state) => ({ spec: { ...state.spec, input: { ...state.spec.input, ...patch } } })),

      addPort: () =>
        set((state) => ({
          spec: {
            ...state.spec,
            ports: [
              ...state.spec.ports,
              {
                id: newId("port"),
                type: "USB-C",
                protocols: [],
                direction: "output",
                outputs: [{ volts: "5", amps: "3" }],
                maxW: 0,
              },
            ],
          },
        })),

      updatePort: (id, patch) =>
        set((state) => ({
          spec: {
            ...state.spec,
            ports: state.spec.ports.map((p) => (p.id === id ? { ...p, ...patch } : p)),
          },
        })),

      removePort: (id) =>
        set((state) => ({ spec: { ...state.spec, ports: state.spec.ports.filter((p) => p.id !== id) } })),

      setFormat: (format) => set({ format }),
      setRules: (rules) => set({ rules }),
      updateRule: (id, patch) =>
        set((state) => ({
          rules: state.rules.map((r) => (r.id === id ? ({ ...r, ...patch } as Rule) : r)),
        })),
      resetRules: () => set({ rules: structuredClone(getProfile(get().profileId).rules) }),
      setAiKey: (aiApiKey) => set({ aiApiKey }),
      setAiModel: (aiModel) => set({ aiModel }),
      setLanguages: (languages) => set((state) => ({ spec: { ...state.spec, languages } })),

      setBullets: (lang, bullets) =>
        set((state) => ({
          spec: {
            ...state.spec,
            marketingBullets: { ...state.spec.marketingBullets, [lang]: bullets },
          },
        })),
    }),
    {
      name: "mma-packing-hub",
      partialize: (state) => ({
        profileId: state.profileId,
        spec: state.spec,
        format: state.format,
        rules: state.rules,
        aiApiKey: state.aiApiKey,
        aiModel: state.aiModel,
      }),
    },
  ),
);
