import { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Order, OrderStatus } from '../types';
import { playNotificationSound } from '../lib/sound';
import toast from 'react-hot-toast';

import { MessagingService } from '../services/messagingService';

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
      // Sanitize the order object to remove any undefined fields that Firestore might reject
      const sanitizedOrder = JSON.parse(JSON.stringify(order, (key, value) => 
        value === undefined ? null : value
      ));

      const docRef = await addDoc(collection(db, 'orders'), sanitizedOrder);
      
      // Send message asynchronously so it won't block the user's workflow
      // Note: we're passing the full order including the ID we just got
      const finalOrder = { id: docRef.id, ...sanitizedOrder } as Order;
      MessagingService.sendOrderConfirmation(finalOrder).catch(err => {
        // Silently log or handle the error, but don't disrupt the placement
        console.warn('Silent messaging error:', err);
      });

      toast.success('Order placed successfully!');
      return docRef.id;
    } catch (error) {
      console.error('Firestore Place Order Error:', error);
      toast.error('Failed to place order. Check your internet or Firebase rules.');
      throw error;
    }
  };

  const updateOrderStatus = async (id: string, status: OrderStatus) => {
    try {
      await updateDoc(doc(db, 'orders', id), { status });
      
      // Notify customer of the status change if applicable
      const foundOrder = orders.find(o => o.id === id);
      if (foundOrder) {
        MessagingService.sendStatusUpdate({ ...foundOrder, status }).catch(err => {
          console.warn('Status notification error:', err);
        });
      }

      toast.success(`Order marked as ${status}`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to update order status.');
    }
  };

  return { orders, loading, placeOrder, updateOrderStatus };
};
