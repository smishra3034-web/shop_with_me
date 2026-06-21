# PinkPetal Gifts Boutique

A premium, modern baby pink and white themed full-stack gift-shopping website. Curated for birthdays, anniversaries, Valentine's Day, housewarming, and more.

## Features

- **Beautiful Aesthetic**: Clean baby pink and white layout with glassmorphism header, card drop-shadows, and smooth micro-animations.
- **Search & Filters**: Real-time search and filter by occasion (Birthday, Anniversary, Valentine's, Housewarming, Thank You) and gift type (Flowers, Jewelry, Chocolates, Home Decor, Personalized).
- **Responsive Layout**: Optimised for mobile, tablet, and desktop views.
- **Interactive Shopping Bag**: Slide-out drawer with quantity controls, subtotal calculation, and persistence using `localStorage`.
- **Checkout Flow**: Complete interactive checkout form.
- **Dual-Mode System**:
  - **Full-Stack Mode**: Saves orders and reads product details dynamically via a Node.js Express backend API.
  - **Client-Side Fallback Mode**: Automatically falls back to client-side data structures and browser storage (`localStorage`) if the Express backend is not running. Allows testing by simply double-clicking `index.html`.
- **Order History**: A viewer showing all submitted orders (retrieved from the server or local storage).

## Project Structure

```
pinkpetal-gifts/
├── server.js               # Node.js + Express backend
├── package.json            # npm metadata and dependencies
├── orders.json             # Saved orders (automatically created)
└── public/                 # Static frontend
    ├── index.html          # Main HTML structure
    ├── styles.css          # Styled CSS sheets
    ├── app.js              # Application logic
    └── assets/             # Generated product images
```

## How to Run

### Option 1: Standalone (Client-Side Only)
Simply open the `public/index.html` file in any modern web browser. The app will automatically run in fallback mode, storing products and orders in the browser.

### Option 2: Full-Stack Mode (Node.js & Express)
To run with a live backend API (saving orders to `orders.json`):

1. Make sure you have **Node.js** installed on your system.
2. Open your terminal in the `pinkpetal-gifts` folder.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the server:
   ```bash
   npm start
   ```
5. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```
