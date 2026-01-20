// Client Dashboard JavaScript
let allProducts = [];
let filteredProducts = [];
let cart = [];
let wishlist = [];
let orders = [];

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Client Dashboard Initializing...');
    
    // Check if client is logged in
    if (!checkClientLogin()) {
        return;
    }
    
    // Load initial data
    loadProducts();
    loadCart();
    loadWishlist();
    loadOrders();
    updateUserProfile();
    
    // Setup event listeners
    setupEventListeners();
    
    // Show products section by default
    showSection('products');
    
    console.log('Client Dashboard Ready');
});

// Check client login
function checkClientLogin() {
    const clientToken = localStorage.getItem('clientToken');
    const clientUser = localStorage.getItem('clientUser');
    
    if (!clientToken || !clientUser) {
        window.location.href = 'client-login.html';
        return false;
    }
    
    // Display client name
    document.getElementById('clientName').textContent = JSON.parse(clientUser).username;
    document.getElementById('profileName').textContent = JSON.parse(clientUser).username;
    document.getElementById('profileEmail').textContent = JSON.parse(clientUser).email;
    document.getElementById('memberSince').textContent = new Date().toLocaleDateString();
    
    return true;
}

// Setup event listeners
function setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            filterProducts();
        });
    }
    
    // Category filter
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            filterProducts();
        });
    }
}

// SECTION NAVIGATION
function showSection(sectionId) {
    console.log('Switching to section:', sectionId);
    
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all buttons
    const buttons = document.querySelectorAll('.sidebar-btn');
    buttons.forEach(button => {
        button.classList.remove('active');
    });
    
    // Show the selected section
    const selectedSection = document.getElementById(sectionId + 'Section');
    if (selectedSection) {
        selectedSection.classList.add('active');
    }
    
    // Activate the corresponding button
    const activeButton = document.querySelector(`.sidebar-btn[onclick*="${sectionId}"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
    
    // Load section data
    switch(sectionId) {
        case 'products':
            loadProductsGrid();
            break;
        case 'cart':
            loadCartItems();
            break;
        case 'orders':
            loadOrdersList();
            break;
        case 'wishlist':
            loadWishlistItems();
            break;
    }
}

// Load products from localStorage
function loadProducts() {
    console.log('Loading products for client...');
    
    // First try localStorage
    let productsJSON = localStorage.getItem('wigProducts');
    
    if (productsJSON) {
        try {
            allProducts = JSON.parse(productsJSON);
            console.log('✅ Loaded products from localStorage:', allProducts.length);
        } catch (e) {
            console.error('❌ Error parsing products:', e);
            allProducts = [];
        }
    } else {
        console.log('⚠️ No products found in localStorage. Creating sample products...');
        
        // Create sample products
        const sampleProducts = [
            {
                id: 1,
                name: "Brazilian Straight Wig",
                category: "Brazilian",
                price: 89.99,
                stock: 15,
                description: "Premium Brazilian straight hair wig with natural look and feel.",
                length: "22-24 inches",
                color: "Natural Black",
                image: "https://images.unsplash.com/photo-1522338242990-8c5a7f015b8d?w=400&h=400&fit=crop",
                active: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                name: "Peruvian Curly Wig",
                category: "Peruvian",
                price: 109.99,
                stock: 8,
                description: "Luxurious Peruvian curly wig with voluminous curls.",
                length: "20-22 inches",
                color: "Dark Brown",
                image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=400&fit=crop",
                active: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 3,
                name: "Malaysian Body Wave",
                category: "Malaysian",
                price: 99.99,
                stock: 12,
                description: "Silky Malaysian body wave wig with beautiful texture.",
                length: "24-26 inches",
                color: "Honey Blonde",
                image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop",
                active: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 4,
                name: "Synthetic Short Bob",
                category: "Synthetic",
                price: 49.99,
                stock: 25,
                description: "Easy-care synthetic short bob wig for daily wear.",
                length: "12-14 inches",
                color: "Jet Black",
                image: "https://images.unsplash.com/photo-1599351431440-56e8b8f07e4c?w=400&h=400&fit=crop",
                active: true,
                createdAt: new Date().toISOString()
            }
        ];
        
        localStorage.setItem('wigProducts', JSON.stringify(sampleProducts));
        allProducts = sampleProducts;
        console.log('✅ Sample products created:', allProducts.length);
    }
    
    // Filter only active products
    allProducts = allProducts.filter(product => product.active !== false);
    filteredProducts = [...allProducts];
    
    console.log('✅ Active products available:', filteredProducts.length);
    return allProducts;
}

// Load cart from localStorage
function loadCart() {
    const clientUser = JSON.parse(localStorage.getItem('clientUser') || '{}');
    const cartKey = `cart_${clientUser.email || 'guest'}`;
    const cartJSON = localStorage.getItem(cartKey);
    
    if (cartJSON) {
        try {
            cart = JSON.parse(cartJSON);
            console.log('✅ Loaded cart items:', cart.length);
        } catch (e) {
            console.error('❌ Error parsing cart:', e);
            cart = [];
        }
    } else {
        cart = [];
        console.log('🛒 No cart items found');
    }
    
    updateCartCount();
    return cart;
}

// Load wishlist from localStorage
function loadWishlist() {
    const clientUser = JSON.parse(localStorage.getItem('clientUser') || '{}');
    const wishlistKey = `wishlist_${clientUser.email || 'guest'}`;
    const wishlistJSON = localStorage.getItem(wishlistKey);
    
    if (wishlistJSON) {
        try {
            wishlist = JSON.parse(wishlistJSON);
            console.log('✅ Loaded wishlist items:', wishlist.length);
        } catch (e) {
            console.error('❌ Error parsing wishlist:', e);
            wishlist = [];
        }
    } else {
        wishlist = [];
        console.log('💖 No wishlist items found');
    }
    
    updateWishlistCount();
    return wishlist;
}

// Load orders from localStorage
function loadOrders() {
    const clientUser = JSON.parse(localStorage.getItem('clientUser') || '{}');
    const ordersKey = `orders_${clientUser.email || 'guest'}`;
    const ordersJSON = localStorage.getItem(ordersKey);
    
    if (ordersJSON) {
        try {
            orders = JSON.parse(ordersJSON);
            console.log('✅ Loaded orders:', orders.length);
        } catch (e) {
            console.error('❌ Error parsing orders:', e);
            orders = [];
        }
    } else {
        orders = [];
        console.log('📦 No orders found');
    }
    
    updateOrdersCount();
    return orders;
}

// Save cart to localStorage
function saveCart() {
    const clientUser = JSON.parse(localStorage.getItem('clientUser') || '{}');
    const cartKey = `cart_${clientUser.email || 'guest'}`;
    localStorage.setItem(cartKey, JSON.stringify(cart));
    updateCartCount();
    console.log('💾 Cart saved with', cart.length, 'items');
}

// Save wishlist to localStorage
function saveWishlist() {
    const clientUser = JSON.parse(localStorage.getItem('clientUser') || '{}');
    const wishlistKey = `wishlist_${clientUser.email || 'guest'}`;
    localStorage.setItem(wishlistKey, JSON.stringify(wishlist));
    updateWishlistCount();
    console.log('💾 Wishlist saved with', wishlist.length, 'items');
}

// Save orders to localStorage
function saveOrders() {
    const clientUser = JSON.parse(localStorage.getItem('clientUser') || '{}');
    const ordersKey = `orders_${clientUser.email || 'guest'}`;
    localStorage.setItem(ordersKey, JSON.stringify(orders));
    updateOrdersCount();
    console.log('💾 Orders saved with', orders.length, 'orders');
}

// Update cart count in UI
function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        console.log('🛒 Cart count updated:', totalItems);
    }
}

// Update wishlist count in UI
function updateWishlistCount() {
    const wishlistCount = document.getElementById('wishlistCount');
    if (wishlistCount) {
        wishlistCount.textContent = wishlist.length;
        console.log('💖 Wishlist count updated:', wishlist.length);
    }
}

// Update orders count in UI
function updateOrdersCount() {
    const totalOrders = document.getElementById('totalOrders');
    if (totalOrders) {
        totalOrders.textContent = orders.length;
        console.log('📦 Orders count updated:', orders.length);
    }
}

// Update user profile
function updateUserProfile() {
    const clientUser = JSON.parse(localStorage.getItem('clientUser') || '{}');
    if (clientUser.username) {
        document.getElementById('clientName').textContent = clientUser.username;
        document.getElementById('profileName').textContent = clientUser.username;
        document.getElementById('profileEmail').textContent = clientUser.email;
        
        // Calculate actual member since date
        if (clientUser.createdAt) {
            document.getElementById('memberSince').textContent = new Date(clientUser.createdAt).toLocaleDateString();
        }
        
        console.log('👤 User profile updated:', clientUser.username);
    }
}

// Load products grid
function loadProductsGrid() {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;
    
    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                <i class="fas fa-wig" style="font-size: 60px; color: #dee2e6; margin-bottom: 20px;"></i>
                <h3 style="margin-bottom: 10px; color: #333;">No Products Available</h3>
                <p style="margin-bottom: 20px; color: #666;">Check back later for new wig arrivals!</p>
                <p style="color: #888; font-size: 14px;">
                    <i class="fas fa-info-circle"></i> Products are managed by admin. Please check the homepage for available products.
                </p>
            </div>
        `;
        return;
    }
    
    let html = '';
    filteredProducts.forEach(product => {
        const isInWishlist = wishlist.some(item => item.id === product.id);
        const stockClass = product.stock < 5 ? 'low-stock' : '';
        const stockText = product.stock < 5 ? `Low Stock (${product.stock})` : 'In Stock';
        const stockColor = product.stock < 5 ? '#721c24' : '#155724';
        const stockBg = product.stock < 5 ? '#f8d7da' : '#d4edda';
        
        html += `
            <div class="product-card">
                <div class="product-image">
                    <img src="${product.image || 'https://via.placeholder.com/400x400?text=Wig+Image'}" 
                         alt="${product.name}"
                         onclick="showProductDetail(${product.id})"
                         style="cursor: pointer;">
                    <button class="wishlist-btn" onclick="toggleWishlist(${product.id})" title="${isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}">
                        <i class="fas fa-heart${isInWishlist ? '' : '-o'}"></i>
                    </button>
                    <span class="stock-badge ${stockClass}" style="background: ${stockBg}; color: ${stockColor};">${stockText}</span>
                </div>
                <div class="product-info">
                    <h3 onclick="showProductDetail(${product.id})" style="cursor: pointer;">${product.name}</h3>
                    <div class="product-meta">
                        <span class="product-category">${product.category}</span>
                        <span class="product-length">${product.length}</span>
                    </div>
                    <div class="product-rating">
                        ${'<i class="fas fa-star"></i>'.repeat(5)}
                        <span class="rating-count">(${Math.floor(Math.random() * 100) + 1})</span>
                    </div>
                    <div class="product-price">
                        <span class="price">$${product.price.toFixed(2)}</span>
                        ${product.stock > 0 ? 
                            `<button class="btn-add-cart" onclick="addToCart(${product.id})" title="Add to Cart">
                                <i class="fas fa-cart-plus"></i> Add to Cart
                            </button>` :
                            `<span class="out-of-stock">Out of Stock</span>`
                        }
                    </div>
                    <div class="product-stock">
                        <i class="fas fa-box"></i>
                        <span>${product.stock} units available</span>
                    </div>
                </div>
            </div>
        `;
    });
    
    productsGrid.innerHTML = html;
    console.log('🛍️ Products grid loaded with', filteredProducts.length, 'products');
}

// Filter products based on search and category
function filterProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;
    
    filteredProducts = allProducts.filter(product => {
        const matchesSearch = !searchTerm || 
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm);
        
        const matchesCategory = !category || product.category === category;
        
        return matchesSearch && matchesCategory;
    });
    
    loadProductsGrid();
    console.log('🔍 Filtered products:', filteredProducts.length, 'matches');
}

// Add product to cart
function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) {
        alert('Product not found!');
        return;
    }
    
    if (product.stock <= 0) {
        alert('This product is out of stock!');
        return;
    }
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        if (existingItem.quantity >= product.stock) {
            alert(`Only ${product.stock} units available!`);
            return;
        }
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1,
            cartAddedAt: new Date().toISOString()
        });
    }
    
    saveCart();
    loadCartItems();
    showSection('cart');
    
    // Show success notification
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 10px;
    `;
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span><strong>${product.name}</strong> added to cart!</span>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100px)';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Remove item from cart
function removeFromCart(productId) {
    const product = cart.find(item => item.id === productId);
    if (product && confirm(`Remove ${product.name} from cart?`)) {
        cart = cart.filter(item => item.id !== productId);
        saveCart();
        loadCartItems();
    }
}

// Update cart item quantity
function updateCartQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;
    
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    
    const newQuantity = item.quantity + change;
    
    if (newQuantity < 1) {
        removeFromCart(productId);
        return;
    }
    
    if (newQuantity > product.stock) {
        alert(`Only ${product.stock} units available!`);
        return;
    }
    
    item.quantity = newQuantity;
    saveCart();
    loadCartItems();
}

// Load cart items
function loadCartItems() {
    const cartContainer = document.getElementById('cartContainer');
    if (!cartContainer) return;
    
    if (cart.length === 0) {
        cartContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-shopping-cart"></i>
                <h3>Your Cart is Empty</h3>
                <p>Add some wigs to get started!</p>
                <button class="btn btn-primary" onclick="showSection('products')">
                    <i class="fas fa-wig"></i> Browse Products
                </button>
            </div>
        `;
        return;
    }
    
    let subtotal = 0;
    let itemsHtml = '';
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        itemsHtml += `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="${item.image || 'https://via.placeholder.com/100x100?text=Wig'}" 
                         alt="${item.name}"
                         onclick="showProductDetail(${item.id})"
                         style="cursor: pointer;">
                </div>
                <div class="cart-item-details">
                    <h4 onclick="showProductDetail(${item.id})" style="cursor: pointer;">${item.name}</h4>
                    <p class="item-category">${item.category} • ${item.length}</p>
                    <p class="item-price">$${item.price.toFixed(2)} each</p>
                </div>
                <div class="cart-item-quantity">
                    <button class="qty-btn" onclick="updateCartQuantity(${item.id}, -1)" title="Decrease quantity">-</button>
                    <span class="qty-value">${item.quantity}</span>
                    <button class="qty-btn" onclick="updateCartQuantity(${item.id}, 1)" title="Increase quantity">+</button>
                </div>
                <div class="cart-item-total">$${itemTotal.toFixed(2)}</div>
                <button class="btn-remove" onclick="removeFromCart(${item.id})" title="Remove from cart">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    });
    
    const tax = subtotal * 0.08; // 8% tax
    const shipping = subtotal > 100 ? 0 : 9.99;
    const total = subtotal + tax + shipping;
    
    cartContainer.innerHTML = `
        <div class="cart-items">
            ${itemsHtml}
        </div>
        <div class="cart-summary">
            <div class="summary-row">
                <span>Subtotal:</span>
                <span>$${subtotal.toFixed(2)}</span>
            </div>
            <div class="summary-row">
                <span>Tax (8%):</span>
                <span>$${tax.toFixed(2)}</span>
            </div>
            <div class="summary-row">
                <span>Shipping:</span>
                <span>${shipping === 0 ? '<span style="color: #28a745; font-weight: 600;">FREE</span>' : `$${shipping.toFixed(2)}`}</span>
                ${subtotal < 100 ? `<small style="display: block; color: #666; margin-top: 5px;">Spend $${(100 - subtotal).toFixed(2)} more for free shipping!</small>` : ''}
            </div>
            <div class="summary-row total">
                <span>Total:</span>
                <span style="color: #2ecc71; font-size: 1.2em;">$${total.toFixed(2)}</span>
            </div>
            <button class="btn btn-primary btn-checkout" onclick="checkout()">
                <i class="fas fa-credit-card"></i> Proceed to Checkout
            </button>
        </div>
    `;
}

// Checkout function
function checkout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    // Check stock availability
    for (const item of cart) {
        const product = allProducts.find(p => p.id === item.id);
        if (!product || product.stock < item.quantity) {
            alert(`Sorry, ${item.name} is no longer available in the requested quantity.`);
            return;
        }
    }
    
    if (!confirm(`Confirm purchase for $${cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}?`)) {
        return;
    }
    
    // Create order
    const order = {
        id: 'ORD' + Date.now(),
        date: new Date().toISOString(),
        items: [...cart],
        subtotal: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        tax: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 0.08,
        shipping: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) > 100 ? 0 : 9.99,
        total: 0,
        status: 'processing',
        customer: JSON.parse(localStorage.getItem('clientUser'))
    };
    
    order.total = order.subtotal + order.tax + order.shipping;
    
    // Update product stock in main products array
    for (const item of cart) {
        const productIndex = allProducts.findIndex(p => p.id === item.id);
        if (productIndex !== -1) {
            allProducts[productIndex].stock -= item.quantity;
        }
    }
    
    // Save updated products to localStorage
    localStorage.setItem('wigProducts', JSON.stringify(allProducts));
    
    // Add to orders
    orders.unshift(order);
    saveOrders();
    
    // Clear cart
    cart = [];
    saveCart();
    
    // Update products list
    loadProducts();
    
    // Show success message
    alert(`✅ Order #${order.id} placed successfully!\n\nTotal: $${order.total.toFixed(2)}\nStatus: Processing\n\nYou will receive an email confirmation shortly.`);
    
    // Show orders section
    showSection('orders');
}

// Toggle wishlist item
function toggleWishlist(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    
    const existingIndex = wishlist.findIndex(item => item.id === productId);
    
    if (existingIndex !== -1) {
        wishlist.splice(existingIndex, 1);
        showNotification(`${product.name} removed from wishlist`, 'info');
    } else {
        wishlist.push({
            ...product,
            addedAt: new Date().toISOString()
        });
        showNotification(`${product.name} added to wishlist`, 'success');
    }
    
    saveWishlist();
    loadProductsGrid();
    loadWishlistItems();
}

// Load wishlist items
function loadWishlistItems() {
    const wishlistGrid = document.getElementById('wishlistGrid');
    if (!wishlistGrid) return;
    
    if (wishlist.length === 0) {
        wishlistGrid.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                <i class="fas fa-heart" style="font-size: 60px; color: #dee2e6; margin-bottom: 20px;"></i>
                <h3 style="margin-bottom: 10px; color: #333;">Your Wishlist is Empty</h3>
                <p style="margin-bottom: 20px; color: #666;">Add products you love to your wishlist!</p>
                <button class="btn btn-primary" onclick="showSection('products')">
                    <i class="fas fa-wig"></i> Browse Products
                </button>
            </div>
        `;
        return;
    }
    
    let html = '';
    wishlist.forEach(product => {
        html += `
            <div class="wishlist-item">
                <div class="wishlist-image">
                    <img src="${product.image || 'https://via.placeholder.com/80x80?text=Wig'}" 
                         alt="${product.name}"
                         onclick="showProductDetail(${product.id})"
                         style="cursor: pointer;">
                </div>
                <div class="wishlist-info">
                    <h4 onclick="showProductDetail(${product.id})" style="cursor: pointer;">${product.name}</h4>
                    <p>${product.category} • ${product.length}</p>
                    <p class="price">$${product.price.toFixed(2)}</p>
                </div>
                <button class="btn-remove-wishlist" onclick="removeFromWishlist(${product.id})" title="Remove from wishlist">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    });
    
    wishlistGrid.innerHTML = html;
}

// Remove from wishlist
function removeFromWishlist(productId) {
    const product = wishlist.find(item => item.id === productId);
    if (product && confirm(`Remove ${product.name} from wishlist?`)) {
        wishlist = wishlist.filter(item => item.id !== productId);
        saveWishlist();
        loadWishlistItems();
        loadProductsGrid();
    }
}

// Load orders list
function loadOrdersList() {
    const ordersContainer = document.getElementById('ordersContainer');
    if (!ordersContainer) return;
    
    if (orders.length === 0) {
        ordersContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-box"></i>
                <h3>No Orders Yet</h3>
                <p>Your orders will appear here after you make a purchase.</p>
                <button class="btn btn-primary" onclick="showSection('products')">
                    <i class="fas fa-wig"></i> Start Shopping
                </button>
            </div>
        `;
        return;
    }
    
    let html = '';
    orders.forEach(order => {
        let statusClass = 'status-pending';
        let statusText = 'Pending';
        if (order.status === 'delivered') {
            statusClass = 'status-delivered';
            statusText = 'Delivered';
        } else if (order.status === 'processing') {
            statusClass = 'status-processing';
            statusText = 'Processing';
        } else if (order.status === 'shipped') {
            statusClass = 'status-processing';
            statusText = 'Shipped';
        }
        
        html += `
            <div class="order-card">
                <div class="order-header">
                    <div>
                        <span class="order-id">Order #${order.id}</span>
                        <span class="order-date">${new Date(order.date).toLocaleDateString()}</span>
                    </div>
                    <span class="order-status ${statusClass}">${statusText}</span>
                </div>
                <div class="order-items">
                    ${order.items.map(item => `
                        <div class="order-item">
                            <span>${item.name} x${item.quantity}</span>
                            <span>$${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="order-total">
                    Total: $${order.total.toFixed(2)}
                </div>
            </div>
        `;
    });
    
    ordersContainer.innerHTML = html;
}

// Show product detail modal
function showProductDetail(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    
    const isInWishlist = wishlist.some(item => item.id === productId);
    const modalBody = document.getElementById('modalBody');
    const modal = document.getElementById('productModal');
    
    modalBody.innerHTML = `
        <div style="display: flex; gap: 30px; flex-wrap: wrap;">
            <div style="flex: 1; min-width: 300px;">
                <img src="${product.image || 'https://via.placeholder.com/400x400?text=Wig+Image'}" 
                     alt="${product.name}" 
                     style="width: 100%; border-radius: 10px; max-height: 400px; object-fit: cover;">
            </div>
            <div style="flex: 2; min-width: 300px;">
                <h2 style="margin-bottom: 15px; color: #333;">${product.name}</h2>
                <div style="display: flex; gap: 10px; margin-bottom: 15px; flex-wrap: wrap;">
                    <span class="product-category">${product.category}</span>
                    <span class="product-length">${product.length}</span>
                    <span style="padding: 4px 10px; border-radius: 15px; background: #e9ecef; color: #495057; font-size: 13px;">
                        ${product.color || 'Natural Color'}
                    </span>
                </div>
                <div style="font-size: 28px; font-weight: bold; color: #2ecc71; margin-bottom: 20px;">
                    $${product.price.toFixed(2)}
                </div>
                <div style="margin-bottom: 20px;">
                    <h4>Description</h4>
                    <p>${product.description}</p>
                </div>
                <div style="margin-bottom: 20px;">
                    <h4>Details</h4>
                    <p><strong>Stock:</strong> ${product.stock} units available</p>
                    <p><strong>Status:</strong> ${product.stock > 0 ? '<span style="color: #28a745;">In Stock</span>' : '<span style="color: #dc3545;">Out of Stock</span>'}</p>
                </div>
                <div style="display: flex; gap: 15px; margin-top: 30px; flex-wrap: wrap;">
                    ${product.stock > 0 ? 
                        `<button class="btn btn-primary" onclick="addToCart(${product.id}); closeModal()" style="padding: 12px 24px;">
                            <i class="fas fa-cart-plus"></i> Add to Cart
                        </button>` :
                        `<button class="btn" disabled style="background: #ccc; padding: 12px 24px;">
                            <i class="fas fa-times"></i> Out of Stock
                        </button>`
                    }
                    <button class="btn" onclick="toggleWishlist(${product.id}); closeModal()" style="padding: 12px 24px; background: ${isInWishlist ? '#dc3545' : '#6c757d'}; color: white;">
                        <i class="fas fa-heart"></i> ${isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                    </button>
                </div>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
}

// Notification helper
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    const bgColor = type === 'success' ? '#28a745' : type === 'info' ? '#17a2b8' : '#ffc107';
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 10px;
        max-width: 400px;
        animation: slideIn 0.3s ease;
    `;
    
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'info' ? 'info-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100px)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Close modal
function closeModal() {
    document.getElementById('productModal').classList.remove('active');
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('clientToken');
        localStorage.removeItem('clientUser');
        window.location.href = 'index.html';
    }
}

// ===== SUPPORT SYSTEM FUNCTIONS =====

// Support navigation
function showSupportTab(tabId) {
    // Hide all tabs
    document.querySelectorAll('.support-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all nav buttons
    document.querySelectorAll('.support-nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabId + 'Tab').classList.add('active');
    
    // Activate corresponding nav button
    document.querySelector(`.support-nav-btn[onclick*="${tabId}"]`).classList.add('active');
    
    // Load data if needed
    if (tabId === 'ticketHistory') {
        loadTickets();
    }
}

// Load client tickets
function loadTickets() {
    const clientUser = JSON.parse(localStorage.getItem('clientUser') || '{}');
    const ticketsKey = `tickets_${clientUser.email || 'guest'}`;
    const ticketsJSON = localStorage.getItem(ticketsKey);
    
    let tickets = [];
    if (ticketsJSON) {
        try {
            tickets = JSON.parse(ticketsJSON);
        } catch (e) {
            console.error('Error parsing tickets:', e);
            tickets = [];
        }
    }
    
    displayTickets(tickets);
    return tickets;
}

// Display tickets in history tab
function displayTickets(tickets) {
    const ticketsList = document.getElementById('ticketsList');
    if (!ticketsList) return;
    
    if (tickets.length === 0) {
        ticketsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-ticket-alt"></i>
                <h3>No Support Tickets</h3>
                <p>You haven't submitted any support tickets yet.</p>
            </div>
        `;
        return;
    }
    
    // Sort by date (newest first)
    tickets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    let html = '<div class="tickets-container">';
    
    tickets.forEach(ticket => {
        const statusClass = getStatusClass(ticket.status);
        const priorityClass = getPriorityClass(ticket.priority);
        const createdAt = new Date(ticket.createdAt).toLocaleDateString();
        const updatedAt = ticket.updatedAt ? new Date(ticket.updatedAt).toLocaleDateString() : createdAt;
        
        html += `
            <div class="ticket-item" onclick="viewTicket('${ticket.id}')">
                <div class="ticket-header">
                    <div class="ticket-title">
                        <h4>${ticket.subject}</h4>
                        <span class="ticket-category">${ticket.category}</span>
                    </div>
                    <div class="ticket-meta">
                        <span class="status-badge ${statusClass}">${ticket.status}</span>
                        <span class="priority-badge ${priorityClass}">${ticket.priority}</span>
                    </div>
                </div>
                <div class="ticket-body">
                    <p class="ticket-preview">${ticket.message.substring(0, 150)}...</p>
                    <div class="ticket-info">
                        <span><i class="far fa-calendar"></i> Created: ${createdAt}</span>
                        <span><i class="fas fa-sync-alt"></i> Updated: ${updatedAt}</span>
                        ${ticket.orderId ? `<span><i class="fas fa-box"></i> Order: ${ticket.orderId}</span>` : ''}
                        ${ticket.assignedTo ? `<span><i class="fas fa-user-headset"></i> Assigned to: ${ticket.assignedTo}</span>` : ''}
                    </div>
                </div>
                ${ticket.replies && ticket.replies.length > 0 ? 
                    `<div class="ticket-replies-count">
                        <i class="fas fa-comments"></i> ${ticket.replies.length} ${ticket.replies.length === 1 ? 'reply' : 'replies'}
                    </div>` : ''
                }
            </div>
        `;
    });
    
    html += '</div>';
    ticketsList.innerHTML = html;
}

// Filter tickets
function filterTickets() {
    const statusFilter = document.getElementById('ticketStatusFilter').value;
    const searchTerm = document.getElementById('ticketSearch').value.toLowerCase();
    
    const clientUser = JSON.parse(localStorage.getItem('clientUser') || '{}');
    const ticketsKey = `tickets_${clientUser.email || 'guest'}`;
    const ticketsJSON = localStorage.getItem(ticketsKey);
    
    let tickets = [];
    if (ticketsJSON) {
        try {
            tickets = JSON.parse(ticketsJSON);
        } catch (e) {
            tickets = [];
        }
    }
    
    // Apply filters
    let filteredTickets = tickets.filter(ticket => {
        const matchesStatus = !statusFilter || ticket.status === statusFilter;
        const matchesSearch = !searchTerm || 
            ticket.subject.toLowerCase().includes(searchTerm) ||
            ticket.message.toLowerCase().includes(searchTerm) ||
            (ticket.orderId && ticket.orderId.toLowerCase().includes(searchTerm));
        
        return matchesStatus && matchesSearch;
    });
    
    displayTickets(filteredTickets);
}

// Submit new ticket
function submitTicket() {
    const subject = document.getElementById('ticketSubject').value.trim();
    const orderId = document.getElementById('ticketOrderId').value.trim();
    const category = document.getElementById('ticketCategory').value;
    const message = document.getElementById('ticketMessage').value.trim();
    const priority = document.getElementById('ticketPriority').value;
    
    // Validation
    if (!subject || !category || !message) {
        alert('Please fill in all required fields (Subject, Category, Message)');
        return;
    }
    
    if (message.length < 20) {
        alert('Please provide a more detailed description (at least 20 characters)');
        return;
    }
    
    const clientUser = JSON.parse(localStorage.getItem('clientUser') || '{}');
    const ticketsKey = `tickets_${clientUser.email}`;
    
    // Get existing tickets
    const ticketsJSON = localStorage.getItem(ticketsKey);
    let tickets = [];
    if (ticketsJSON) {
        try {
            tickets = JSON.parse(ticketsJSON);
        } catch (e) {
            tickets = [];
        }
    }
    
    // Create new ticket
    const newTicket = {
        id: 'TKT' + Date.now() + Math.random().toString(36).substr(2, 9),
        subject,
        orderId: orderId || null,
        category,
        message,
        priority,
        status: 'open',
        customer: {
            email: clientUser.email,
            username: clientUser.username,
            id: clientUser.id
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        replies: []
    };
    
    // Add to tickets
    tickets.unshift(newTicket);
    localStorage.setItem(ticketsKey, JSON.stringify(tickets));
    
    // Also save to admin tickets (for admin access)
    saveTicketToAdmin(newTicket);
    
    // Clear form
    clearTicketForm();
    
    // Show success message
    showNotification(`✅ Support ticket submitted successfully! (Ticket ID: ${newTicket.id})`, 'success');
    
    // Switch to history tab and reload
    showSupportTab('ticketHistory');
}

// Save ticket to admin storage
function saveTicketToAdmin(ticket) {
    const adminTicketsKey = 'wigSupportTickets';
    const adminTicketsJSON = localStorage.getItem(adminTicketsKey);
    let adminTickets = [];
    
    if (adminTicketsJSON) {
        try {
            adminTickets = JSON.parse(adminTicketsJSON);
        } catch (e) {
            adminTickets = [];
        }
    }
    
    // Add admin-specific fields
    const adminTicket = {
        ...ticket,
        adminStatus: 'unassigned',
        assignedTo: null,
        adminNotes: [],
        lastViewedByAdmin: null
    };
    
    adminTickets.unshift(adminTicket);
    localStorage.setItem(adminTicketsKey, JSON.stringify(adminTickets));
}

// Clear ticket form
function clearTicketForm() {
    document.getElementById('ticketSubject').value = '';
    document.getElementById('ticketOrderId').value = '';
    document.getElementById('ticketCategory').value = '';
    document.getElementById('ticketMessage').value = '';
    document.getElementById('ticketPriority').value = 'medium';
}

// View ticket details
function viewTicket(ticketId) {
    const clientUser = JSON.parse(localStorage.getItem('clientUser') || '{}');
    const ticketsKey = `tickets_${clientUser.email}`;
    const ticketsJSON = localStorage.getItem(ticketsKey);
    
    if (!ticketsJSON) return;
    
    const tickets = JSON.parse(ticketsJSON);
    const ticket = tickets.find(t => t.id === ticketId);
    
    if (!ticket) return;
    
    const modalBody = document.getElementById('ticketModalBody');
    const modal = document.getElementById('ticketModal');
    
    const statusClass = getStatusClass(ticket.status);
    const priorityClass = getPriorityClass(ticket.priority);
    const createdAt = new Date(ticket.createdAt).toLocaleString();
    const updatedAt = new Date(ticket.updatedAt).toLocaleString();
    
    // Build replies HTML
    let repliesHtml = '';
    if (ticket.replies && ticket.replies.length > 0) {
        repliesHtml = `
            <div class="ticket-replies">
                <h4>Conversation</h4>
                ${ticket.replies.map(reply => `
                    <div class="reply ${reply.from === 'admin' ? 'admin-reply' : 'customer-reply'}">
                        <div class="reply-header">
                            <strong>${reply.from === 'admin' ? 'Support Team' : 'You'}</strong>
                            <span class="reply-time">${new Date(reply.timestamp).toLocaleString()}</span>
                        </div>
                        <div class="reply-message">
                            ${reply.message}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    modalBody.innerHTML = `
        <div class="ticket-detail">
            <div class="ticket-detail-header">
                <h2>${ticket.subject}</h2>
                <div class="ticket-meta">
                    <span class="status-badge ${statusClass}">${ticket.status}</span>
                    <span class="priority-badge ${priorityClass}">${ticket.priority}</span>
                    <span class="ticket-id">${ticket.id}</span>
                </div>
            </div>
            
            <div class="ticket-info-grid">
                <div class="info-item">
                    <label>Category:</label>
                    <span>${ticket.category}</span>
                </div>
                <div class="info-item">
                    <label>Created:</label>
                    <span>${createdAt}</span>
                </div>
                ${ticket.orderId ? `
                    <div class="info-item">
                        <label>Order ID:</label>
                        <span>${ticket.orderId}</span>
                    </div>
                ` : ''}
                <div class="info-item">
                    <label>Last Updated:</label>
                    <span>${updatedAt}</span>
                </div>
            </div>
            
            <div class="ticket-message">
                <h4>Original Message</h4>
                <div class="message-content">
                    ${ticket.message}
                </div>
            </div>
            
            ${repliesHtml}
            
            ${ticket.status !== 'closed' && ticket.status !== 'resolved' ? `
                <div class="add-reply">
                    <h4>Add Reply</h4>
                    <textarea id="replyMessage" rows="4" placeholder="Type your reply here..."></textarea>
                    <div class="reply-actions">
                        <button class="btn btn-secondary" onclick="closeTicketModal()">Close</button>
                        <button class="btn btn-primary" onclick="addReply('${ticket.id}')">
                            <i class="fas fa-paper-plane"></i> Send Reply
                        </button>
                    </div>
                </div>
            ` : `
                <div class="ticket-closed">
                    <i class="fas fa-lock"></i>
                    <p>This ticket has been closed. Please create a new ticket if you need further assistance.</p>
                </div>
            `}
        </div>
    `;
    
    modal.classList.add('active');
}

// Add reply to ticket
function addReply(ticketId) {
    const replyMessage = document.getElementById('replyMessage').value.trim();
    
    if (!replyMessage) {
        alert('Please enter a message');
        return;
    }
    
    const clientUser = JSON.parse(localStorage.getItem('clientUser') || '{}');
    const ticketsKey = `tickets_${clientUser.email}`;
    const ticketsJSON = localStorage.getItem(ticketsKey);
    
    if (!ticketsJSON) return;
    
    const tickets = JSON.parse(ticketsJSON);
    const ticketIndex = tickets.findIndex(t => t.id === ticketId);
    
    if (ticketIndex === -1) return;
    
    const newReply = {
        message: replyMessage,
        from: 'customer',
        timestamp: new Date().toISOString()
    };
    
    tickets[ticketIndex].replies.push(newReply);
    tickets[ticketIndex].updatedAt = new Date().toISOString();
    tickets[ticketIndex].status = 'pending'; // Change status to pending when customer replies
    
    // Save updated ticket
    localStorage.setItem(ticketsKey, JSON.stringify(tickets));
    
    // Also update admin version
    updateAdminTicket(tickets[ticketIndex]);
    
    // Show success and reload view
    showNotification('✅ Reply sent successfully!', 'success');
    viewTicket(ticketId);
}

// Update ticket in admin storage
function updateAdminTicket(updatedTicket) {
    const adminTicketsKey = 'wigSupportTickets';
    const adminTicketsJSON = localStorage.getItem(adminTicketsKey);
    
    if (!adminTicketsJSON) return;
    
    const adminTickets = JSON.parse(adminTicketsJSON);
    const adminTicketIndex = adminTickets.findIndex(t => t.id === updatedTicket.id);
    
    if (adminTicketIndex !== -1) {
        adminTickets[adminTicketIndex] = {
            ...adminTickets[adminTicketIndex],
            ...updatedTicket,
            adminStatus: 'pending_review',
            lastViewedByAdmin: null
        };
        
        localStorage.setItem(adminTicketsKey, JSON.stringify(adminTickets));
    }
}

// Close ticket modal
function closeTicketModal() {
    document.getElementById('ticketModal').classList.remove('active');
}

// Helper functions for status and priority classes
function getStatusClass(status) {
    const statusClasses = {
        'open': 'status-open',
        'pending': 'status-pending',
        'answered': 'status-answered',
        'resolved': 'status-resolved',
        'closed': 'status-closed'
    };
    return statusClasses[status] || 'status-open';
}

function getPriorityClass(priority) {
    const priorityClasses = {
        'low': 'priority-low',
        'medium': 'priority-medium',
        'high': 'priority-high',
        'urgent': 'priority-urgent'
    };
    return priorityClasses[priority] || 'priority-medium';
}
