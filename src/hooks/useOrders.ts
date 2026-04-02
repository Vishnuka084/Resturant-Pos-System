import { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Order, OrderStatus } from '../types';
import { playNotificationSound } from '../lib/sound';
import toast from 'react-hot-toast';

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedOrders: Order[] = [];
      snapshot.forEach((doc) => {
        fetchedOrders.push({ id: doc.id, ...doc.data() } as Order);
      });
      
      if (!isInitialLoad.current) {
        const hasNew = snapshot.docChanges().some(change => change.type === 'added');
        if (hasNew) playNotificationSound();
      }
      isInitialLoad.current = false;

      setOrders(fetchedOrders);
      setLoading(false);
    }, (err) => {
      console.error(err);
      toast.error('Failed to load orders.');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const placeOrder = async (order: Omit<Order, 'id'>) => {
    try {
      await addDoc(collection(db, 'orders'), order);
      toast.success('Order placed successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to place order.');
      throw error;
    }
  };

  const updateOrderStatus = async (id: string, status: OrderStatus) => {
    try {
      await updateDoc(doc(db, 'orders', id), { status });
      toast.success(`Order marked as ${status}`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to update order status.');
    }
  };

  return { orders, loading, placeOrder, updateOrderStatus };
};
