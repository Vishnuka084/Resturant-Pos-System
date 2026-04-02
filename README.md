# Restaurant POS System

A modern, full-featured Restaurant Point of Sale system built with React, Vite, Tailwind CSS, and Firebase.

## Features

- **QR Menu (Customer)**: Customers can browse the menu, manage their cart, and place orders directly from their table.
- **POS System (Cashier)**: Cashiers can quickly create orders, handle walk-ins, calculate totals, and view a unified menu.
- **Kitchen Display**: Real-time kitchen view showing pending and preparing orders. Kitchen staff can update the status of each order.
- **Admin Dashboard**: Secure admin area to manage menu items (add/edit/delete/toggle availability) and view order history and total revenue.
- **Real-Time Data**: Seamless data synchronization powered by Firebase Firestore (`onSnapshot`).
- **Authentication**: Role-based access control handled via Firebase Authentication.

## Tech Stack

- **React 19**
- **Vite**
- **Tailwind CSS v4**
- **Firebase** (Auth & Firestore)
- **React Router v6**
- **Lucide React** (Icons)
- **React Hot Toast** (Notifications)

## Folder Structure

```
src/
├── components/
│   ├── layout/         # Navbar, RootLayout
│   └── menu/           # MenuGrid
├── context/            # AuthContext, CartContext
├── hooks/              # useMenuItems, useOrders
├── lib/                # firebase.ts, utils.ts
├── pages/
│   ├── admin/          # AdminDashboard
│   ├── customer/       # QRMenu
│   ├── kitchen/        # KitchenDisplay
│   ├── pos/            # POSPage
│   ├── Home.tsx
│   └── Login.tsx
├── types/              # TS interfaces (User, MenuItem, Order, etc.)
├── App.tsx
├── index.css
└── main.tsx
```

## Setup & Run Instructions

### 1. Install Dependencies
(If you haven't already):
```bash
npm install
```

### 2. Firebase Configuration
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Create a new project and add a Web Application.
3. Enable **Firestore Database** (start in Test Mode initially if you wish).
4. Enable **Authentication** (Email/Password sign-in method).
5. In Firestore, create two collections: `menuItems` and `orders`. You can also manually create a `users` collection.
6. Create an `.env` file in the root directory and add your Firebase config keys:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Run Locally
```bash
npm run dev
```

### 4. Admin Setup
If you do not have an existing user, register a user directly in the Firebase Console under the "Authentication" tab.
To assign roles, create a document in your Firestore `users` collection with the matching `uid` of the registered user.
Document ID: `<auth_uid>`
Fields:
- `email`: string
- `name`: string
- `role`: "admin" | "cashier" | "kitchen"

By default, any successfully authenticated user is treated as an `"admin"` conceptually in the UI for fallback testing purposes if no corresponding user doc is found.

Enjoy managing your restaurant seamlessly!
