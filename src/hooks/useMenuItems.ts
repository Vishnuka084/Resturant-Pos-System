import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { MenuItem } from '../types';
import toast from 'react-hot-toast';

export const useMenuItems = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'menuItems'), orderBy('category'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: MenuItem[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as MenuItem);
      });
      setMenuItems(items);
      setLoading(false);
    }, (err) => {
      console.error(err);
      toast.error('Failed to load menu items. Verify Firebase config.');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addMenuItem = async (item: Omit<MenuItem, 'id'>) => {
    try {
      await addDoc(collection(db, 'menuItems'), item);
      toast.success('Menu item added successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to add menu item.');
    }
  };

  const updateMenuItem = async (id: string, data: Partial<MenuItem>) => {
    try {
      await updateDoc(doc(db, 'menuItems', id), data);
      toast.success('Menu item updated!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update menu item.');
    }
  };

  const deleteMenuItem = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'menuItems', id));
      toast.success('Menu item deleted!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete menu item.');
    }
  };

  return { menuItems, loading, addMenuItem, updateMenuItem, deleteMenuItem };
};
