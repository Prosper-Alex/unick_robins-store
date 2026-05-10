"use client";

import { create } from "zustand";

type WishlistState = {
  ids: string[];
  toggle: (id: string) => void;
  has: (id: string) => boolean;
};

export const useWishlistStore = create<WishlistState>((set, get) => ({
  ids: [],
  toggle: (id) =>
    set((state) => ({
      ids: state.ids.includes(id)
        ? state.ids.filter((item) => item !== id)
        : [...state.ids, id],
    })),
  has: (id) => get().ids.includes(id),
}));
