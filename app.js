// API Configuration & Dual-Mode Fallback
const BASE_URL = window.location.origin.startsWith('file') ? 'http://localhost:3000' : window.location.origin;
let isBackendOnline = false;

// Mock database for client-side fallback
const fallbackProducts = [
  {
    id: 1,
    name: "Pink Rose Bouquet",
    price: 29.99,
    category: "Flowers",
    occasions: ["Valentine's Day", "Anniversary"],
    image: "assets/pink_roses.png",
    rating: 4.8,
    description: "A gorgeous arrangement of hand-picked fresh pink roses, wrapped in premium paper and tied with a satin ribbon."
  },
  {
    id: 2,
    name: "Silver Heart Pendant",
    price: 49.99,
    category: "Jewelry",
    occasions: ["Anniversary", "Birthday"],
    image: "assets/necklace.png",
    rating: 4.9,
    description: "A sterling silver necklace featuring a delicate double-heart pendant encrusted with shimmering cubic zirconia."
  },
  {
    id: 3,
    name: "Gourmet Pink Chocolate Box",
    price: 19.99,
    category: "Chocolates",
    occasions: ["Birthday", "Thank You"],
    image: "assets/chocolates.png",
    rating: 4.7,
    description: "An assortment of premium strawberry truffles and milk chocolates, beautifully boxed in a rose-patterned gift case."
  },
  {
    id: 4,
    name: "Scented Rose Candle",
    price: 14.99,
    category: "Home Decor",
    occasions: ["Housewarming", "Thank You"],
    image: "assets/candle.png",
    rating: 4.6,
    description: "A hand-poured soy candle infusing any space with the gentle, calming aroma of blooming roses and vanilla."
  },
  {
    id: 5,
    name: "Personalized Pink Mug",
    price: 24.99,
    category: "Personalized",
    occasions: ["Birthday", "Anniversary"],
    image: "assets/custom_mug.png",
    rating: 4.5,
    description: "A high-quality ceramic mug in a pastel pink finish, customized with elegant cursive text for your special someone."
  },
  {
    id: 6,
    name: "Rose Gold Minimalist Watch",
    price: 79.99,
    category: "Jewelry",
    occasions: ["Anniversary", "Birthday"],
    image: "assets/watch.png",
    rating: 4.9,
    description: "A sleek, minimalist wristwatch with a rose gold mesh strap, white marble dial, and quartz movement."
  }
];

// App State
let productsList = [];
let cart = JSON.parse(localStorage.getItem('pinkpetal_cart')) || [];
let activeCategory = 'all';
let activeOccasion = 'all';
let searchQuery = '';

// DOM Elements
const productsGrid = document.getElementById('productsGrid');
const searchInput = document.getElementById('searchInput');
const cartBtn = document.getElementById('cartBtn');
const cartCount = document.getElementById('cartCount');
const cartDrawer = document.getElementById('cartDrawer');
const closeCartBtn = document.getElementById('closeCartBtn');
const cartContent = document.getElementById('cartContent');
const cartSubtotal = document.getElementById('cartSubtotal');
const checkoutBtn = document.getElementById('checkoutBtn');

const checkoutModal = document.getElementById('checkoutModal');
const closeCheckoutBtn = document.getElementById('closeCheckoutBtn');
const checkoutForm = document.getElementById('checkoutForm');
const checkoutSummaryItems = document.getElementById('checkoutSummaryItems');
const checkoutTotalAmount = document.getElementById('checkoutTotalAmount');

const successModal = document.getElementById('successModal');
const successCloseBtn = document.getElementById('successCloseBtn');
const successOrderId = document.getElementById('successOrderId');

const productModal = document.getElementById('productModal');
const closeProductModalBtn = document.getElementById('closeProductModalBtn');
const productDetailContent = document.getElementById('productDetailContent');

const ordersBtn = document.getElementById('ordersBtn');
const ordersModal = document.getElementById('ordersModal');
const closeOrdersBtn = document.getElementById('closeOrdersBtn');
const ordersListContent = document.getElementById('ordersListContent');

// Active filter Tags elements
const activeFilters = document.getElementById('activeFilters');
const filterOccasionTag = document.getElementById('filterOccasionTag');
const occasionValue = document.getElementById('occasionValue');
const clearOccasionFilter = document.getElementById('clearOccasionFilter');
const filterSearchTag = document.getElementById('filterSearchTag');
const searchValue = document.getElementById('searchValue');
const clearSearchFilter = document.getElementById('clearSearchFilter');

/* ==========================================================================
   INITIALIZATION & API CALLS
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

async function initApp() {
  await fetchProducts();
  setupEventListeners();
  updateCartUI();
}

async function fetchProducts() {
  try {
    const res = await fetch(`${BASE_URL}/api/products`);
    if (res.ok) {
      productsList = await res.json();
      isBackendOnline = true;
      console.log('Loaded products from Express backend.');
    } else {
      throw new Error('Server returned error status');
    }
  } catch (error) {
    console.warn('Backend server offline or unreachable. Falling back to local catalog.');
    productsList = fallbackProducts;
    isBackendOnline = false;
  }
  renderProducts();
}

/* ==========================================================================
   PRODUCT RENDERING & FILTERING
   ========================================================================== */
function renderProducts() {
  productsGrid.innerHTML = '';
  
  // Filter products by category, occasion, and search term
  const filtered = productsList.filter(product => {
    const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
    const matchesOccasion = activeOccasion === 'all' || product.occasions.includes(activeOccasion);
    const matchesSearch = searchQuery === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());
      
    return matchesCategory && matchesOccasion && matchesSearch;
  });

  // Toggle active filter tags UI
  updateFilterTagsUI();

  if (filtered.length === 0) {
    productsGrid.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-gift"></i>
        <h3>No matching gifts found</h3>
        <p>Try clearing your filters or search keywords to see all products.</p>
      </div>
    `;
    return;
  }

  filtered.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-badge">${product.category}</div>
      <div class="product-image-container">
        <img src="${product.image}" alt="${product.name}">
        <button class="product-quick-view" data-id="${product.id}">Quick View</button>
      </div>
      <div class="product-info">
        <div class="product-meta">
          <span class="product-rating">
            <i class="fa-solid fa-star"></i> ${product.rating.toFixed(1)}
          </span>
          <span>${product.occasions[0]}</span>
        </div>
        <h3>${product.name}</h3>
        <p class="product-desc">${product.description}</p>
        <div class="product-price-row">
          <span class="product-price">$${product.price.toFixed(2)}</span>
          <button class="add-to-cart-btn" data-id="${product.id}" title="Add to Bag">
            <i class="fa-solid fa-plus"></i>
          </button>
        </div>
      </div>
    `;
    productsGrid.appendChild(card);
  });
}

function updateFilterTagsUI() {
  let showFiltersBar = false;

  if (activeOccasion !== 'all') {
    occasionValue.textContent = activeOccasion;
    filterOccasionTag.style.display = 'flex';
    showFiltersBar = true;
  } else {
    filterOccasionTag.style.display = 'none';
  }

  if (searchQuery !== '') {
    searchValue.textContent = `"${searchQuery}"`;
    filterSearchTag.style.display = 'flex';
    showFiltersBar = true;
  } else {
    filterSearchTag.style.display = 'none';
  }

  activeFilters.style.display = showFiltersBar ? 'flex' : 'none';
}

/* ==========================================================================
   EVENT LISTENERS
   ========================================================================== */
function setupEventListeners() {
  // Real-time Search
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderProducts();
  });

  // Occasion card filter
  document.querySelectorAll('.occasion-card').forEach(card => {
    card.addEventListener('click', () => {
      // Remove selected class from all cards
      document.querySelectorAll('.occasion-card').forEach(c => c.classList.remove('selected'));
      
      const occasion = card.getAttribute('data-occasion');
      activeOccasion = occasion;
      
      if (occasion !== 'all') {
        card.classList.add('selected');
      }
      
      renderProducts();
      
      // Smooth scroll to product grid
      document.getElementById('products-section').scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Category Tab filter
  document.querySelectorAll('.tab-btn').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeCategory = tab.getAttribute('data-category');
      renderProducts();
    });
  });

  // Clear Tags Filter
  clearOccasionFilter.addEventListener('click', () => {
    activeOccasion = 'all';
    document.querySelectorAll('.occasion-card').forEach(c => c.classList.remove('selected'));
    renderProducts();
  });

  clearSearchFilter.addEventListener('click', () => {
    searchQuery = '';
    searchInput.value = '';
    renderProducts();
  });

  // Cart Drawer open/close
  cartBtn.addEventListener('click', () => cartDrawer.classList.add('open'));
  closeCartBtn.addEventListener('click', () => cartDrawer.classList.remove('open'));
  
  // Close drawer when clicking outside it
  cartDrawer.addEventListener('click', (e) => {
    if (e.target === cartDrawer) cartDrawer.classList.remove('open');
  });

  // Product actions delegation (Add to Cart / Quick View)
  productsGrid.addEventListener('click', (e) => {
    const addToCartButton = e.target.closest('.add-to-cart-btn');
    const quickViewButton = e.target.closest('.product-quick-view');
    
    if (addToCartButton) {
      const id = parseInt(addToCartButton.getAttribute('data-id'));
      addToCart(id);
    } else if (quickViewButton) {
      const id = parseInt(quickViewButton.getAttribute('data-id'));
      openProductDetails(id);
    }
  });

  // Logo home navigation
  document.getElementById('navLogo').addEventListener('click', (e) => {
    e.preventDefault();
    searchQuery = '';
    searchInput.value = '';
    activeOccasion = 'all';
    activeCategory = 'all';
    document.querySelectorAll('.occasion-card').forEach(c => c.classList.remove('selected'));
    document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
    document.querySelector('.tab-btn[data-category="all"]').classList.add('active');
    renderProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Checkout modal trigger
  checkoutBtn.addEventListener('click', () => {
    cartDrawer.classList.remove('open');
    openCheckout();
  });
  
  closeCheckoutBtn.addEventListener('click', () => checkoutModal.classList.remove('open'));
  checkoutModal.addEventListener('click', (e) => {
    if (e.target === checkoutModal) checkoutModal.classList.remove('open');
  });

  // Checkout submit form
  checkoutForm.addEventListener('submit', handleCheckoutSubmit);

  // Success Modal close
  successCloseBtn.addEventListener('click', () => successModal.classList.remove('open'));
  
  // Product details modal close
  closeProductModalBtn.addEventListener('click', () => productModal.classList.remove('open'));
  productModal.addEventListener('click', (e) => {
    if (e.target === productModal) productModal.classList.remove('open');
  });

  // Orders history modal trigger
  ordersBtn.addEventListener('click', openOrdersHistory);
  closeOrdersBtn.addEventListener('click', () => ordersModal.classList.remove('open'));
  ordersModal.addEventListener('click', (e) => {
    if (e.target === ordersModal) ordersModal.classList.remove('open');
  });
}

/* ==========================================================================
   CART OPERATIONS
   ========================================================================== */
function addToCart(productId) {
  const product = productsList.find(p => p.id === productId);
  if (!product) return;

  const existingItem = cart.find(item => item.product.id === productId);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ product, quantity: 1 });
  }

  saveCart();
  updateCartUI();
  
  // Visual feedback: bounce cart button
  cartBtn.classList.add('bounce');
  setTimeout(() => cartBtn.classList.remove('bounce'), 300);
}

function updateCartQty(productId, delta) {
  const item = cart.find(item => item.product.id === productId);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    cart = cart.filter(item => item.product.id !== productId);
  }

  saveCart();
  updateCartUI();
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.product.id !== productId);
  saveCart();
  updateCartUI();
}

function saveCart() {
  localStorage.setItem('pinkpetal_cart', JSON.stringify(cart));
}

function updateCartUI() {
  // Update cart count badge
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = totalItems;
  
  if (cart.length === 0) {
    cartContent.innerHTML = `
      <div class="cart-empty">
        <i class="fa-solid fa-shopping-bag"></i>
        <p>Your shopping bag is empty.</p>
      </div>
    `;
    cartSubtotal.textContent = '$0.00';
    checkoutBtn.disabled = true;
    return;
  }

  cartContent.innerHTML = '';
  let subtotal = 0;

  cart.forEach(item => {
    const itemTotal = item.product.price * item.quantity;
    subtotal += itemTotal;

    const cartItemEl = document.createElement('div');
    cartItemEl.className = 'cart-item';
    cartItemEl.innerHTML = `
      <div class="cart-item-img">
        <img src="${item.product.image}" alt="${item.product.name}">
      </div>
      <div class="cart-item-details">
        <h4>${item.product.name}</h4>
        <div class="cart-item-price">$${item.product.price.toFixed(2)}</div>
        <div class="cart-item-actions">
          <button class="qty-btn" onclick="updateCartQty(${item.product.id}, -1)"><i class="fa-solid fa-minus"></i></button>
          <span class="cart-qty">${item.quantity}</span>
          <button class="qty-btn" onclick="updateCartQty(${item.product.id}, 1)"><i class="fa-solid fa-plus"></i></button>
        </div>
      </div>
      <button class="remove-item-btn" onclick="removeFromCart(${item.product.id})" title="Remove Item">
        <i class="fa-solid fa-trash-can"></i>
      </button>
    `;
    cartContent.appendChild(cartItemEl);
  });

  cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
  checkoutBtn.disabled = false;
}

// Attach qty updates to window scope for inline onclicks
window.updateCartQty = updateCartQty;
window.removeFromCart = removeFromCart;

/* ==========================================================================
   CHECKOUT & ORDERS
   ========================================================================== */
function openCheckout() {
  checkoutSummaryItems.innerHTML = '';
  let total = 0;

  cart.forEach(item => {
    const itemTotal = item.product.price * item.quantity;
    total += itemTotal;

    const row = document.createElement('div');
    row.className = 'checkout-summary-item';
    row.innerHTML = `
      <span>${item.product.name} x ${item.quantity}</span>
      <span>$${itemTotal.toFixed(2)}</span>
    `;
    checkoutSummaryItems.appendChild(row);
  });

  checkoutTotalAmount.textContent = `$${total.toFixed(2)}`;
  checkoutModal.classList.add('open');
}

async function handleCheckoutSubmit(e) {
  e.preventDefault();

  const customer = {
    name: document.getElementById('custName').value,
    email: document.getElementById('custEmail').value,
    address: `${document.getElementById('custAddress').value}, ${document.getElementById('custCity').value} ${document.getElementById('custZip').value}`
  };

  const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const orderData = {
    items: cart.map(item => ({
      productId: item.product.id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity
    })),
    customer,
    total: parseFloat(total.toFixed(2))
  };

  let placedOrder = null;

  try {
    const res = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });

    if (res.ok) {
      placedOrder = await res.json();
      console.log('Order submitted successfully to Express server.');
    } else {
      throw new Error('Failed to post order to server');
    }
  } catch (error) {
    console.warn('Express server unavailable or failed. Saving order in client-side localStorage.');
    // Simulated order saving locally
    placedOrder = {
      id: 'lc-' + Math.random().toString(36).substr(2, 6),
      date: new Date().toISOString(),
      ...orderData
    };
    
    // Save to local storage orders history
    const localOrders = JSON.parse(localStorage.getItem('pinkpetal_orders')) || [];
    localOrders.push(placedOrder);
    localStorage.setItem('pinkpetal_orders', JSON.stringify(localOrders));
  }

  // Clear cart
  cart = [];
  saveCart();
  updateCartUI();

  // Close checkout modal, show success modal
  checkoutModal.classList.remove('open');
  checkoutForm.reset();
  
  successOrderId.textContent = `#${placedOrder.id.toUpperCase()}`;
  successModal.classList.add('open');
}

async function openOrdersHistory() {
  ordersListContent.innerHTML = `
    <div class="loading-state">
      <i class="fa-solid fa-spinner fa-spin loading-spinner"></i>
      <p>Fetching orders...</p>
    </div>
  `;
  ordersModal.classList.add('open');

  let orders = [];

  try {
    const res = await fetch(`${BASE_URL}/api/orders`);
    if (res.ok) {
      orders = await res.json();
      console.log('Fetched orders from Express backend.');
    } else {
      throw new Error('Server returned error status');
    }
  } catch (error) {
    console.warn('Express server offline. Reading local storage orders.');
    orders = JSON.parse(localStorage.getItem('pinkpetal_orders')) || [];
  }

  renderOrdersHistory(orders);
}

function renderOrdersHistory(orders) {
  ordersListContent.innerHTML = '';

  if (orders.length === 0) {
    ordersListContent.innerHTML = `
      <div class="no-orders-msg">
        <i class="fa-solid fa-receipt"></i>
        <p>No orders placed yet.</p>
      </div>
    `;
    return;
  }

  // Show newest first
  const sortedOrders = [...orders].reverse();

  sortedOrders.forEach(order => {
    const orderCard = document.createElement('div');
    orderCard.className = 'order-history-card';
    
    const formattedDate = new Date(order.date).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const itemsHTML = order.items.map(item => `
      <div class="order-history-item">
        <span>${item.name} x ${item.quantity}</span>
        <span>$${(item.price * item.quantity).toFixed(2)}</span>
      </div>
    `).join('');

    orderCard.innerHTML = `
      <div class="order-history-header">
        <span class="order-id-label">Order #${order.id.toUpperCase()}</span>
        <span class="order-date-label">${formattedDate}</span>
      </div>
      <div class="order-history-body">
        <div class="order-history-items">
          ${itemsHTML}
        </div>
        <div class="order-history-footer">
          <div class="order-customer-info">
            <strong>Deliver to:</strong> ${order.customer.name}<br>
            <strong>Address:</strong> ${order.customer.address}
          </div>
          <div class="order-total-price">$${order.total.toFixed(2)}</div>
        </div>
      </div>
    `;
    ordersListContent.appendChild(orderCard);
  });
}

/* ==========================================================================
   PRODUCT DETAILS
   ========================================================================== */
function openProductDetails(productId) {
  const product = productsList.find(p => p.id === productId);
  if (!product) return;

  productDetailContent.innerHTML = `
    <div class="product-detail-img">
      <img src="${product.image}" alt="${product.name}">
    </div>
    <div class="product-detail-info">
      <div class="detail-tag-row">
        <span class="detail-tag">${product.category}</span>
        <span class="detail-tag">${product.occasions[0]}</span>
      </div>
      <h2>${product.name}</h2>
      <div class="detail-rating-row">
        <span class="detail-rating">
          <i class="fa-solid fa-star"></i> ${product.rating.toFixed(1)} / 5.0 Rating
        </span>
      </div>
      <p class="detail-desc">${product.description}</p>
      <div class="detail-price-buy">
        <span class="detail-price">$${product.price.toFixed(2)}</span>
        <button class="detail-add-btn" onclick="addFromDetail(${product.id})">
          <i class="fa-solid fa-shopping-bag"></i> Add to Bag
        </button>
      </div>
    </div>
  `;
  productModal.classList.add('open');
}

function addFromDetail(productId) {
  addToCart(productId);
  productModal.classList.remove('open');
}
window.addFromDetail = addFromDetail;
