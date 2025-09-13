import { create } from "zustand";

export type SelectedKeyState = {
  selectedKeyIndex: number | null;
  setSelectedKeyIndex: (index: number | null) => void;
  reset: () => void;
};

const initialState: Pick<SelectedKeyState, "selectedKeyIndex"> = {
  selectedKeyIndex: null,
};

export const useSelectedKeyStore = create<SelectedKeyState>((set) => ({
  ...initialState,
  setSelectedKeyIndex: (index) => set({ selectedKeyIndex: index }),
  reset: () => set({ ...initialState }),
}));
