import toast from 'react-hot-toast';
import { Order } from '../types';

/**
 * MessagingService handles sending notifications to customers via SMS or other channels.
 * In a production app, this would call a backend API (like Firebase Cloud Functions)
 */
export const MessagingService = {
  /**
   * Sends a confirmation message for a new order.
   */
  async sendOrderConfirmation(order: Order): Promise<boolean> {
    return this.sendNotification(order, 'received');
  },

  /**
   * Sends a status update message (e.g. "Order is ready").
   */
  async sendStatusUpdate(order: Order): Promise<boolean> {
    // Only send notification if it's completed or preparing, or anything other than pending
    if (order.status === 'pending') return false; 
    return this.sendNotification(order, order.status);
  },

  /**
   * Internal method to send notifications.
   */
  async sendNotification(order: Order, type: string): Promise<boolean> {
    if (!order.phoneNumber) {
      console.log('No phone number provided for this order, skipping notification.');
      return false;
    }

    const message = this.generateOrderMessage(order, type);
    
    try {
      console.log(`[MessagingService] Sending type:${type} to ${order.phoneNumber}: "${message}"`);
      const response = await this.simulateSmsApiCall(order.phoneNumber, message);
      
      if (response.success) {
        // Only show toast feedback for non-received types to avoid double toasts during initial placement
        if (type !== 'received') {
          toast.success(type === 'completed' ? 'Customer notified: Ready!' : 'Order status updated!');
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('MessagingService Error:', error);
      return false;
    }
  },

  /**
   * Generates a friendly message based on the status.
   */
  generateOrderMessage(order: Order, type: string): string {
    const restaurantName = "Delicious Bites POS";
    const orderId = order.id.slice(0, 5).toUpperCase();
    const customer = order.customerName || 'Customer';
    
    switch (type) {
      case 'completed':
        return `Hi ${customer}! Your order #${orderId} at ${restaurantName} is READY! Please come and enjoy your meal.`;
      case 'preparing':
        return `Hi ${customer}! Your order #${orderId} is being prepared by our chef. We'll let you know once it's ready.`;
      case 'cancelled':
        return `Hi ${customer}, we're sorry but your order #${orderId} at ${restaurantName} has been cancelled. Please contact us for more info.`;
      default:
        return `Hi ${customer}! Your order #${orderId} at ${restaurantName} has been received. Total: $${order.total.toFixed(2)}. Thank you!`;
    }
  },

  /**
   * Simulates an API call to a messaging provider.
   */
  async simulateSmsApiCall(_phoneNumber: string, _message: string): Promise<{ success: boolean }> {
    await new Promise(resolve => setTimeout(resolve, 800));
    return { success: true };
  }
};
