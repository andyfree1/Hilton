import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import type { Sale } from '../types/sales';

export function useSalesData() {
  const sales = useLiveQuery(() => db.sales.toArray()) || [];

  const addSale = async (sale: Omit<Sale, 'id'>) => {
    await db.sales.add(sale as Sale);
  };

  const updateSale = async (id: string, sale: Partial<Sale>) => {
    await db.sales.update(id, sale);
  };

  const deleteSale = async (id: string) => {
    await db.sales.delete(id);
  };

  return {
    sales,
    addSale,
    updateSale,
    deleteSale
  };
}