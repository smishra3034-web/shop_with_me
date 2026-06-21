const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname,)));

// Mock Products Database
const products = [
  {
    id: 1,
    name: "Pink Rose Bouquet",
    price: 29.99,
    category: "Flowers",
    occasions: ["Valentine's Day", "Anniversary"],
    image: "pink_roses.png",
    rating: 4.8,
    description: "A gorgeous arrangement of hand-picked fresh pink roses, wrapped in premium paper and tied with a satin ribbon."
  },
  {
    id: 2,
    name: "Silver Heart Pendant",
    price: 49.99,
    category: "Jewelry",
    occasions: ["Anniversary", "Birthday"],
    image: "necklace.png",
    rating: 4.9,
    description: "A sterling silver necklace featuring a delicate double-heart pendant encrusted with shimmering cubic zirconia."
  },
  {
    id: 3,
    name: "Gourmet Pink Chocolate Box",
    price: 19.99,
    category: "Chocolates",
    occasions: ["Birthday", "Thank You"],
    image: "chocolates.png",
    rating: 4.7,
    description: "An assortment of premium strawberry truffles and milk chocolates, beautifully boxed in a rose-patterned gift case."
  },
  {
    id: 4,
    name: "Scented Rose Candle",
    price: 14.99,
    category: "Home Decor",
    occasions: ["Housewarming", "Thank You"],
    image: "candle.png",
    rating: 4.6,
    description: "A hand-poured soy candle infusing any space with the gentle, calming aroma of blooming roses and vanilla."
  },
  {
    id: 5,
    name: "Personalized Pink Mug",
    price: 24.99,
    category: "Personalized",
    occasions: ["Birthday", "Anniversary"],
    image: "custom_mug.png",
    rating: 4.5,
    description: "A high-quality ceramic mug in a pastel pink finish, customized with elegant cursive text for your special someone."
  },
  {
    id: 6,
    name: "Rose Gold Minimalist Watch",
    price: 79.99,
    category: "Jewelry",
    occasions: ["Anniversary", "Birthday"],
    image: "watch.png",
    rating: 4.9,
    description: "A sleek, minimalist wristwatch with a rose gold mesh strap, white marble dial, and quartz movement."
  }
];

// In-Memory/JSON File Orders Database
const ORDERS_FILE = path.join(__dirname, 'orders.json');

const getOrders = () => {
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      const data = fs.readFileSync(ORDERS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error reading orders file, using empty array:", error);
  }
  return [];
};

const saveOrder = (order) => {
  const orders = getOrders();
  orders.push(order);
  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf8');
  } catch (error) {
    console.error("Error writing orders file:", error);
  }
  return orders;
};

// API Endpoints
app.get('/api/products', (req, res) => {
  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
});

app.get('/api/orders', (req, res) => {
  res.json(getOrders());
});

app.post('/api/orders', (req, res) => {
  const { items, customer, total } = req.body;
  if (!items || !customer || !total) {
    return res.status(400).json({ message: "Invalid order data" });
  }

  const newOrder = {
    id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
    date: new Date().toISOString(),
    items,
    customer,
    total
  };

  saveOrder(newOrder);
  res.status(201).json(newOrder);
});

// Fallback to serving frontend SPA on other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname,'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
