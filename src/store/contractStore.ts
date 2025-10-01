import { create } from 'zustand';
import { Contract } from '@/lib/dataClient';

interface ContractState {
  contracts: Contract[];
  setContracts: (contracts: Contract[]) => void;
  addContract: (contract: Contract) => void;
  updateContract: (id: string, data: Partial<Contract>) => void;
  reset: () => void;
}

export const useContractStore = create<ContractState>((set) => ({
  contracts: [],
  setContracts: (contracts) => set({ contracts }),
  addContract: (contract) => set((state) => ({ contracts: [...state.contracts, contract] })),
  updateContract: (id, data) =>
    set((state) => ({
      contracts: state.contracts.map((c) => (c.id === id ? { ...c, ...data } : c)),
    })),
  reset: () => set({ contracts: [] }),
}));
