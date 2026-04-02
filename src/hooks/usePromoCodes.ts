import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { PromoCode } from '../types';
import toast from 'react-hot-toast';

export const usePromoCodes = () => {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'promos'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedPromos: PromoCode[] = [];
      snapshot.forEach((doc) => {
        fetchedPromos.push({ id: doc.id, ...doc.data() } as PromoCode);
      });
      setPromoCodes(fetchedPromos);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addPromoCode = async (promo: Omit<PromoCode, 'id'>) => {
    try {
      await addDoc(collection(db, 'promos'), promo);
      toast.success('Promo code created!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to create promo code.');
    }
  };

  const updatePromoCode = async (id: string, updates: Partial<PromoCode>) => {
    try {
      await updateDoc(doc(db, 'promos', id), updates);
      toast.success('Promo code updated!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update promo code.');
    }
  };

  const deletePromoCode = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'promos', id));
      toast.success('Promo code deleted!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete promo code.');
    }
  };

  return { promoCodes, loading, addPromoCode, updatePromoCode, deletePromoCode };
};
