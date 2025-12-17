import { create } from "zustand";

type TallyState = {
  addItems: {
    uuid: string;
    bankShort: string;
    startDate: number;
    endDate: number;
    cashRate: string;
    extraRate: string;
    totalRate: string;
    amount: string;
    ext: string;
  };
  setAddItem: (item: {
    uuid: string;
    bankShort: string;
    startDate: number;
    endDate: number;
    cashRate: string;
    extraRate: string;
    totalRate: string;
    amount: string;
    ext: string;
  }) => void;
  clearAddItem: () => void;
};

export const useTallyStore = create<TallyState>((set) => ({
  addItems: {
    uuid: "",
    bankShort: "",
    startDate: 0,
    endDate: 0,
    cashRate: "",
    extraRate: "",
    totalRate: "",
    amount: "",
    ext: "",
  },
  setAddItem: (item) => set({ addItems: item }),
  clearAddItem: () =>
    set({
      addItems: {
        uuid: "",
        bankShort: "",
        startDate: 0,
        endDate: 0,
        cashRate: "",
        extraRate: "",
        totalRate: "",
        amount: "",
        ext: "",
      },
    }),
}));
