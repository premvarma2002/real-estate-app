import { create } from "zustand";

interface SavedStore {
  savedIds: number[];
  toggleSave: (id: number) => void;
  isSaved: (id: number) => boolean;
  clearAll: () => void;
}

export const useSavedStore = create<SavedStore>((set, get) => ({
  savedIds: [],

  toggleSave: (id: number) =>
    set((state) => ({
      savedIds: state.savedIds.includes(id)
        ? state.savedIds.filter((sid) => sid !== id)
        : [...state.savedIds, id],
    })),

  isSaved: (id: number) => get().savedIds.includes(id),

  clearAll: () => set({ savedIds: [] }),
}));
