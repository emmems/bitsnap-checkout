import { create } from 'zustand';

interface CheckoutStore {
  isCartVisible: boolean;
  showCart: () => void;
  hideCart: () => void;
}

export const useCheckoutStore = create<CheckoutStore>((set) => ({
  isCartVisible: false,
  showCart: () => set((state) => ({ ...state, isCartVisible: true })),
  hideCart: () => set((state) => ({ ...state, isCartVisible: false })),
}))
