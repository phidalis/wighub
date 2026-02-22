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
    <div class="product-card" onclick="showProductDetail(${product.id})" style="cursor: pointer; border: none; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <div class="product-image">
            <img src="${product.image || 'https://via.placeholder.com/400x400?text=Wig+Image'}" 
                 alt="${product.name}"
                 style="height: 250px; width: 100%; object-fit: cover;">
            <button class="wishlist-btn" onclick="toggleWishlist(${product.id}); event.stopPropagation()" title="${isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}">
                <i class="fas fa-heart${isInWishlist ? '' : '-o'}"></i>
            </button>
            <span class="stock-badge ${stockClass}" style="background: ${stockBg}; color: ${stockColor};">${stockText}</span>
        </div>
        <div class="product-info" style="padding: 15px;">
            <h3 style="font-size: 16px; margin-bottom: 8px; font-weight: 600;">${product.name}</h3>
            <div class="product-meta" style="margin-bottom: 8px;">
                <span class="product-category" style="font-size: 11px; padding: 3px 8px;">${product.category}</span>
                <span class="product-length" style="font-size: 11px; padding: 3px 8px;">${product.length}</span>
            </div>
            <div class="product-price" style="margin-bottom: 10px;">
                <span class="price" style="font-size: 18px; font-weight: 700;">$${product.price.toFixed(2)}</span>
            </div>
            <p style="font-size: 13px; color: #666; margin-bottom: 12px; line-height: 1.3; height: 34px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
                ${product.description ? (product.description.length > 50 ? product.description.substring(0, 47) + '...' : product.description) : 'Premium quality wig'}
            </p>
            ${product.stock > 0 ? 
                `<button class="btn-add-cart" onclick="addToCart(${product.id}); event.stopPropagation()" style="width: 100%; padding: 10px; font-size: 14px; border: none; border-radius: 6px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-weight: 600;">
                    <i class="fas fa-cart-plus"></i> Add to Cart
                </button>` :
                `<button class="btn-add-cart" disabled style="width: 100%; padding: 10px; font-size: 14px; border: none; border-radius: 6px; background: #ccc; color: #666; cursor: not-allowed;">
                    Out of Stock
                </button>`
            }
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
            <div class="cart-item" onclick="showProductDetail(${item.id})" style="cursor: pointer;">
                <div class="cart-item-image">
                    <img src="${item.image || 'https://via.placeholder.com/100x100?text=Wig'}" 
                         alt="${item.name}">
                </div>
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p class="item-category">${item.category} • ${item.length}</p>
                    <p class="item-price">$${item.price.toFixed(2)} each</p>
                </div>
                <div class="cart-item-quantity" onclick="event.stopPropagation()">
                    <button class="qty-btn" onclick="updateCartQuantity(${item.id}, -1)" title="Decrease quantity">-</button>
                    <span class="qty-value">${item.quantity}</span>
                    <button class="qty-btn" onclick="updateCartQuantity(${item.id}, 1)" title="Increase quantity">+</button>
                </div>
                <div class="cart-item-total">$${itemTotal.toFixed(2)}</div>
                <button class="btn-remove" onclick="removeFromCart(${item.id}); event.stopPropagation()" title="Remove from cart">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    });
    
    // Use store configuration
    const config = getStoreConfig();
    const tax = subtotal * (config.taxRate / 100);
    const shipping = subtotal >= config.freeShippingThreshold ? 0 : config.shippingFee;
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
                <span>Tax (${config.taxRate}%):</span>
                <span>$${tax.toFixed(2)}</span>
            </div>
            <div class="summary-row">
                <span>Shipping:</span>
                <span>${shipping === 0 ? '<span style="color: #28a745; font-weight: 600;">FREE</span>' : `$${shipping.toFixed(2)}`}</span>
                ${subtotal < config.freeShippingThreshold ? 
                    `<small style="display: block; color: #666; margin-top: 5px;">Spend $${(config.freeShippingThreshold - subtotal).toFixed(2)} more for free shipping!</small>` : 
                    ''}
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
// ===== PAYMENT METHOD SIMULATION =====
function showPaymentMethods(order) {
    const modalBody = document.getElementById('modalBody');
    const modal = document.getElementById('productModal');
    
    modalBody.innerHTML = `
        <div style="padding: 20px;">
            <h2 style="text-align:center; margin-bottom:20px;">💳 Select Payment Method</h2>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <p><strong>Order Total:</strong> $${order.total.toFixed(2)}</p>
                <p><strong>Items:</strong> ${order.items.length}</p>
            </div>
            
            <div style="display: grid; gap: 15px; margin-bottom: 30px;">
                <div class="payment-option" onclick="selectPaymentMethod('card', ${order.total})" style="padding: 20px; border: 2px solid #e0e0e0; border-radius: 10px; cursor: pointer; transition: all 0.3s;">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <i class="fas fa-credit-card" style="font-size: 30px; color: #3498db;"></i>
                        <div>
                            <h3 style="margin:0;">Credit/Debit Card</h3>
                            <p style="color:#666; margin:5px 0 0;">Pay securely with Visa, Mastercard, Amex</p>
                        </div>
                    </div>
                </div>
                
                <div class="payment-option" onclick="selectPaymentMethod('mpesa', ${order.total})" style="padding: 20px; border: 2px solid #e0e0e0; border-radius: 10px; cursor: pointer;">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <i class="fas fa-mobile-alt" style="font-size: 30px; color: #27ae60;"></i>
                        <div>
                            <h3 style="margin:0;">M-Pesa</h3>
                            <p style="color:#666; margin:5px 0 0;">Pay with mobile money</p>
                        </div>
                    </div>
                </div>
                
                <div class="payment-option" onclick="selectPaymentMethod('paypal', ${order.total})" style="padding: 20px; border: 2px solid #e0e0e0; border-radius: 10px; cursor: pointer;">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <i class="fab fa-paypal" style="font-size: 30px; color: #003087;"></i>
                        <div>
                            <h3 style="margin:0;">PayPal</h3>
                            <p style="color:#666; margin:5px 0 0;">Fast and secure online payments</p>
                        </div>
                    </div>
                </div>
                
                <div class="payment-option" onclick="selectPaymentMethod('bank', ${order.total})" style="padding: 20px; border: 2px solid #e0e0e0; border-radius: 10px; cursor: pointer;">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <i class="fas fa-university" style="font-size: 30px; color: #f39c12;"></i>
                        <div>
                            <h3 style="margin:0;">Bank Transfer</h3>
                            <p style="color:#666; margin:5px 0 0;">Direct bank deposit</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <button class="btn btn-secondary" onclick="closeModal()" style="width:100%;">Cancel</button>
        </div>
    `;
    
    modal.classList.add('active');
    
    // Add hover effects
    document.querySelectorAll('.payment-option').forEach(opt => {
        opt.addEventListener('mouseover', function() {
            this.style.borderColor = '#3498db';
            this.style.backgroundColor = '#f0f7ff';
        });
        opt.addEventListener('mouseout', function() {
            this.style.borderColor = '#e0e0e0';
            this.style.backgroundColor = 'white';
        });
    });
}

function selectPaymentMethod(method, amount) {
    closeModal();
    
    // Show payment processing
    const processingModal = document.createElement('div');
    processingModal.className = 'modal active';
    processingModal.id = 'processingModal';
    processingModal.innerHTML = `
        <div class="modal-content" style="max-width: 400px; text-align: center;">
            <div class="modal-body" style="padding: 40px;">
                <i class="fas fa-spinner fa-spin" style="font-size: 50px; color: #3498db; margin-bottom: 20px;"></i>
                <h3>Processing Payment...</h3>
                <p style="color:#666;">Please wait while we process your payment</p>
                <p style="font-size: 12px; color:#999; margin-top: 20px;">Amount: $${amount.toFixed(2)} via ${method.toUpperCase()}</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(processingModal);
    
    // Simulate payment processing
    setTimeout(() => {
        processingModal.remove();
        
        if (Math.random() > 0.1) { // 90% success rate
            showPaymentSuccess(method, amount);
        } else {
            showPaymentError();
        }
    }, 2000);
}

function showPaymentSuccess(method, amount) {
    const successModal = document.createElement('div');
    successModal.className = 'modal active';
    successModal.id = 'successModal';
    successModal.innerHTML = `
        <div class="modal-content" style="max-width: 400px; text-align: center;">
            <div class="modal-body" style="padding: 40px;">
                <i class="fas fa-check-circle" style="font-size: 60px; color: #28a745; margin-bottom: 20px;"></i>
                <h3 style="color: #28a745;">Payment Successful!</h3>
                <p style="margin: 10px 0;">Amount: $${amount.toFixed(2)}</p>
                <p style="color: #666;">Payment method: ${method.toUpperCase()}</p>
                <p style="color: #666; margin-bottom: 20px;">Transaction ID: ${generateTransactionId()}</p>
                <button class="btn btn-primary" onclick="completeOrderAfterPayment()" style="width:100%;">Continue</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(successModal);
}

function showPaymentError() {
    const errorModal = document.createElement('div');
    errorModal.className = 'modal active';
    errorModal.id = 'errorModal';
    errorModal.innerHTML = `
        <div class="modal-content" style="max-width: 400px; text-align: center;">
            <div class="modal-body" style="padding: 40px;">
                <i class="fas fa-times-circle" style="font-size: 60px; color: #dc3545; margin-bottom: 20px;"></i>
                <h3 style="color: #dc3545;">Payment Failed</h3>
                <p style="color: #666; margin-bottom: 20px;">Please try again or use a different payment method.</p>
                <button class="btn btn-primary" onclick="location.reload()" style="width:100%;">Try Again</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(errorModal);
}

function generateTransactionId() {
    return 'TXN' + Date.now().toString(36).toUpperCase();
}

function completeOrderAfterPayment() {
    closeModal('successModal');
    // Your existing order completion code here
    checkout(); // This will now use the payment method selected
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
            <div class="wishlist-item" onclick="showProductDetail(${product.id})" style="cursor: pointer;">
                <div class="wishlist-image">
                    <img src="${product.image || 'https://via.placeholder.com/80x80?text=Wig'}" 
                         alt="${product.name}">
                </div>
                <div class="wishlist-info">
                    <h4>${product.name}</h4>
                    <p>${product.category} • ${product.length}</p>
                    <p class="price">$${product.price.toFixed(2)}</p>
                </div>
                <button class="btn-remove-wishlist" onclick="removeFromWishlist(${product.id}); event.stopPropagation()" title="Remove from wishlist">
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
    
    // Create new ticket with sequential ID
    const newTicket = {
        id: generateTicketId(),
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

// ===== STORE CONFIG GETTER =====
function getStoreConfig() {
    const config = JSON.parse(localStorage.getItem('wigStoreConfig') || '{}');
    return {
        taxRate: config.taxRate || 8,
        shippingFee: config.shippingFee || 9.99,
        freeShippingThreshold: config.freeShippingThreshold || 100
    };
}

// ===== ORDER ID GENERATOR =====
function generateOrderId() {
    let allOrders = [];
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('orders_')) {
            const ordersJSON = localStorage.getItem(key);
            if (ordersJSON) {
                try {
                    const userOrders = JSON.parse(ordersJSON);
                    allOrders = allOrders.concat(userOrders);
                } catch (e) {
                    console.error('Error parsing orders:', e);
                }
            }
        }
    }
    
    let maxId = 0;
    allOrders.forEach(order => {
        if (order.id && order.id.startsWith('ORD')) {
            const num = parseInt(order.id.replace('ORD', ''));
            if (!isNaN(num) && num > maxId) {
                maxId = num;
            }
        }
    });
    
    const nextId = maxId + 1;
    return 'ORD' + nextId.toString().padStart(4, '0');
}

// ===== TICKET ID GENERATOR =====
function generateTicketId() {
    const clientUser = JSON.parse(localStorage.getItem('clientUser') || '{}');
    const ticketsKey = `tickets_${clientUser.email}`;
    const ticketsJSON = localStorage.getItem(ticketsKey);
    let tickets = [];
    
    if (ticketsJSON) {
        try {
            tickets = JSON.parse(ticketsJSON);
        } catch (e) {
            tickets = [];
        }
    }
    
    let maxId = 0;
    tickets.forEach(ticket => {
        if (ticket.id && ticket.id.startsWith('TKT')) {
            const num = parseInt(ticket.id.replace('TKT', ''));
            if (!isNaN(num) && num > maxId) {
                maxId = num;
            }
        }
    });
    
    const nextId = maxId + 1;
    return 'TKT' + nextId.toString().padStart(4, '0');
}

function showChangePasswordModal() {
    document.getElementById('changePasswordModal').classList.add('active');
}

function closeChangePasswordModal() {
    document.getElementById('changePasswordModal').classList.remove('active');
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmNewPassword').value = '';
    document.getElementById('passwordMatchStatus').textContent = '';
    document.getElementById('newStrengthText').textContent = '';
}

function updatePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmNewPassword').value;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
        alert('Please fill in all fields');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        alert('New passwords do not match');
        return;
    }
    
    if (newPassword.length < 6) {
        alert('New password must be at least 6 characters');
        return;
    }
    
    // Get client data
    const clientUser = JSON.parse(localStorage.getItem('clientUser') || '{}');
    const clients = JSON.parse(localStorage.getItem('wigClients') || '[]');
    const clientIndex = clients.findIndex(c => c.email === clientUser.email);
    
    if (clientIndex === -1) {
        alert('Client not found');
        return;
    }
    
    // Verify current password
    if (clients[clientIndex].password !== currentPassword) {
        alert('Current password is incorrect');
        return;
    }
    
    // Update password
    clients[clientIndex].password = newPassword;
    clients[clientIndex].passwordChangedAt = new Date().toISOString();
    
    // Save to localStorage
    localStorage.setItem('wigClients', JSON.stringify(clients));
    
    // Log password change activity
    logPasswordChange(clientUser.email);
    
    alert('Password updated successfully!');
    closeChangePasswordModal();
}

function logPasswordChange(email) {
    const logs = JSON.parse(localStorage.getItem('passwordChangeLogs') || '[]');
    logs.push({
        email: email,
        changedAt: new Date().toISOString(),
        changedBy: 'client',
        ip: '127.0.0.1' // In real app, get from server
    });
    localStorage.setItem('passwordChangeLogs', JSON.stringify(logs));
}

// Update the order status display in client dashboard
function loadOrdersList() {
    // ... existing code ...
    
    // Update status display to show tracking
    let statusClass = '';
    let statusText = '';
    let statusIcon = '';
    
    switch(order.status) {
        case 'processing':
            statusClass = 'status-processing';
            statusText = 'Processing';
            statusIcon = 'fas fa-cog';
            break;
        case 'verification':
            statusClass = 'status-verification';
            statusText = 'Verification';
            statusIcon = 'fas fa-check-circle';
            break;
        case 'packaging':
            statusClass = 'status-packaging';
            statusText = 'Packaging';
            statusIcon = 'fas fa-box';
            break;
        case 'out_for_delivery':
            statusClass = 'status-delivery';
            statusText = 'Out for Delivery';
            statusIcon = 'fas fa-shipping-fast';
            break;
        case 'completed':
            statusClass = 'status-completed';
            statusText = 'Completed';
            statusIcon = 'fas fa-check-circle';
            break;
        case 'cancelled':
            statusClass = 'status-cancelled';
            statusText = 'Cancelled';
            statusIcon = 'fas fa-times-circle';
            break;
        default:
            statusClass = 'status-processing';
            statusText = 'Processing';
            statusIcon = 'fas fa-cog';
    }
    
    // Add tracking button
    html += `
        <div class="order-tracking">
            <span class="order-status ${statusClass}">
                <i class="${statusIcon}"></i> ${statusText}
            </span>
            <button class="btn-track" onclick="viewOrderTracking('${order.id}')">
                <i class="fas fa-map-marker-alt"></i> Track Order
            </button>
        </div>
    `;
    
    // ... rest of the code ...
}

function viewOrderTracking(orderId) {
    // Get order details and show tracking modal
    const order = orders.find(o => o.id === orderId);
    
    if (!order) return;
    
    // Create tracking modal
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <div class="tracking-modal">
            <h3>Order Tracking: ${orderId}</h3>
            
            <div class="tracking-timeline">
                <div class="tracking-step ${order.status === 'processing' || order.status === 'verification' || order.status === 'packaging' || order.status === 'out_for_delivery' || order.status === 'completed' ? 'completed' : ''}">
                    <div class="step-icon">
                        <i class="fas fa-shopping-cart"></i>
                    </div>
                    <div class="step-content">
                        <h4>Order Placed</h4>
                        <p>${new Date(order.date).toLocaleString()}</p>
                    </div>
                </div>
                
                <div class="tracking-step ${order.status === 'verification' || order.status === 'packaging' || order.status === 'out_for_delivery' || order.status === 'completed' ? 'completed' : ''}">
                    <div class="step-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="step-content">
                        <h4>Verification</h4>
                        <p>Order verification in progress</p>
                    </div>
                </div>
                
                <div class="tracking-step ${order.status === 'packaging' || order.status === 'out_for_delivery' || order.status === 'completed' ? 'completed' : ''}">
                    <div class="step-icon">
                        <i class="fas fa-box"></i>
                    </div>
                    <div class="step-content">
                        <h4>Packaging</h4>
                        <p>Your order is being prepared</p>
                    </div>
                </div>
                
                <div class="tracking-step ${order.status === 'out_for_delivery' || order.status === 'completed' ? 'completed' : ''}">
                    <div class="step-icon">
                        <i class="fas fa-shipping-fast"></i>
                    </div>
                    <div class="step-content">
                        <h4>Out for Delivery</h4>
                        <p>Your order is on its way</p>
                    </div>
                </div>
                
                <div class="tracking-step ${order.status === 'completed' ? 'completed' : ''}">
                    <div class="step-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="step-content">
                        <h4>Delivered</h4>
                        <p>Order delivered successfully</p>
                    </div>
                </div>
            </div>
            
            <div class="tracking-details">
                <h4>Current Status: <span class="status-${order.status}">${order.status}</span></h4>
                ${order.statusHistory ? `
                    <div class="status-history">
                        <h5>Status History:</h5>
                        <ul>
                            ${order.statusHistory.map(history => `
                                <li>
                                    <strong>${history.status}</strong> - 
                                    ${new Date(history.changedAt).toLocaleString()}
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>
            
            <div class="tracking-actions">
                <button class="btn btn-primary" onclick="contactSupportAboutOrder('${orderId}')">
                    <i class="fas fa-headset"></i> Contact Support
                </button>
            </div>
        </div>
    `;
    
    document.getElementById('productModal').classList.add('active');
}
 
// ===== ORDER TRACKING FUNCTIONS =====

// Load orders list with tracking
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
        const orderDate = new Date(order.date || order.createdAt);
        const formattedDate = orderDate.toLocaleDateString();
        const formattedTime = orderDate.toLocaleTimeString();
        
        // Get status
        const currentStatus = order.status || 'processing';
        let statusClass = 'status-processing';
        let statusText = 'Processing';
        let statusIcon = 'fas fa-cog';
        
        switch(currentStatus) {
            case 'processing':
                statusClass = 'status-processing';
                statusText = 'Processing';
                statusIcon = 'fas fa-cog';
                break;
            case 'verification':
                statusClass = 'status-verification';
                statusText = 'Verification';
                statusIcon = 'fas fa-check-circle';
                break;
            case 'packaging':
                statusClass = 'status-packaging';
                statusText = 'Packaging';
                statusIcon = 'fas fa-box';
                break;
            case 'out_for_delivery':
                statusClass = 'status-out_for_delivery';
                statusText = 'Out for Delivery';
                statusIcon = 'fas fa-shipping-fast';
                break;
            case 'completed':
                statusClass = 'status-completed';
                statusText = 'Completed';
                statusIcon = 'fas fa-check-circle';
                break;
            case 'cancelled':
                statusClass = 'status-cancelled';
                statusText = 'Cancelled';
                statusIcon = 'fas fa-times-circle';
                break;
        }
        
        // Calculate order total
        const orderTotal = order.total || order.items?.reduce((sum, item) => 
            sum + (item.price * item.quantity), 0) || 0;
        
        // Get store config for tax/shipping
        const config = getStoreConfig();
        const tax = order.tax || (orderTotal * (config.taxRate / 100));
        const shipping = order.shipping || (orderTotal >= config.freeShippingThreshold ? 0 : config.shippingFee);
        const total = orderTotal + tax + shipping;
        
        html += `
            <div class="order-card">
                <div class="order-header">
                    <div>
                        <span class="order-id">Order #${order.id}</span>
                        <span class="order-date">${formattedDate} ${formattedTime}</span>
                    </div>
                    <span class="order-status ${statusClass}">
                        <i class="${statusIcon}"></i> ${statusText}
                    </span>
                </div>
                
                <div class="order-items">
                    ${order.items?.map(item => `
                        <div class="order-item">
                            <span>${item.name} x${item.quantity}</span>
                            <span>$${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    `).join('') || ''}
                </div>
                
                <div class="order-total">
                    Total: $${total.toFixed(2)}
                </div>
                
                <div class="order-tracking">
                    <span class="order-status ${statusClass}">
                        <i class="${statusIcon}"></i> ${statusText}
                    </span>
                    <button class="btn-track" onclick="viewOrderTracking('${order.id}')">
                        <i class="fas fa-map-marker-alt"></i> Track Order
                    </button>
                </div>
            </div>
        `;
    });
    
    ordersContainer.innerHTML = html;
}

// View order tracking details
function viewOrderTracking(orderId) {
    const order = orders.find(o => o.id === orderId);
    
    if (!order) {
        alert('Order not found!');
        return;
    }
    
    const currentStatus = order.status || 'processing';
    const orderDate = new Date(order.date || order.createdAt);
    const formattedDate = orderDate.toLocaleDateString();
    const formattedTime = orderDate.toLocaleTimeString();
    
    // Create tracking modal content
    const modalBody = document.getElementById('orderTrackingModalBody');
    modalBody.innerHTML = `
        <div class="tracking-modal">
            <h3>Order Tracking: ${orderId}</h3>
            
            <div class="order-info">
                <p><strong>Order Date:</strong> ${formattedDate} ${formattedTime}</p>
                <p><strong>Current Status:</strong> <span class="status-${currentStatus}">${currentStatus}</span></p>
                <p><strong>Total Amount:</strong> $${(order.total || 0).toFixed(2)}</p>
            </div>
            
            <div class="tracking-timeline">
                <div class="tracking-step ${['processing', 'verification', 'packaging', 'out_for_delivery', 'completed'].includes(currentStatus) ? 'completed' : ''}">
                    <div class="step-icon">
                        <i class="fas fa-shopping-cart"></i>
                    </div>
                    <div class="step-content">
                        <h4>Order Placed</h4>
                        <p>${formattedDate}</p>
                    </div>
                </div>
                
                <div class="tracking-step ${['verification', 'packaging', 'out_for_delivery', 'completed'].includes(currentStatus) ? 'completed' : ''}">
                    <div class="step-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="step-content">
                        <h4>Verification</h4>
                        <p>Order verification in progress</p>
                    </div>
                </div>
                
                <div class="tracking-step ${['packaging', 'out_for_delivery', 'completed'].includes(currentStatus) ? 'completed' : ''}">
                    <div class="step-icon">
                        <i class="fas fa-box"></i>
                    </div>
                    <div class="step-content">
                        <h4>Packaging</h4>
                        <p>Your order is being prepared</p>
                    </div>
                </div>
                
                <div class="tracking-step ${['out_for_delivery', 'completed'].includes(currentStatus) ? 'completed' : ''}">
                    <div class="step-icon">
                        <i class="fas fa-shipping-fast"></i>
                    </div>
                    <div class="step-content">
                        <h4>Out for Delivery</h4>
                        <p>Your order is on its way</p>
                    </div>
                </div>
                
                <div class="tracking-step ${['completed'].includes(currentStatus) ? 'completed' : ''}">
                    <div class="step-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="step-content">
                        <h4>Delivered</h4>
                        <p>Order delivered successfully</p>
                    </div>
                </div>
            </div>
            
            <div class="tracking-details">
                <h4>Current Status: <span class="status-${currentStatus}">${currentStatus}</span></h4>
                ${order.statusHistory ? `
                    <div class="status-history">
                        <h5>Status History:</h5>
                        <ul>
                            ${order.statusHistory.map(history => `
                                <li>
                                    <strong>${history.status}</strong>
                                    <span>${new Date(history.changedAt).toLocaleString()}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                ` : '<p>No status history available.</p>'}
            </div>
            
            <div class="tracking-actions">
                <button class="btn btn-primary" onclick="contactSupportAboutOrder('${orderId}')">
                    <i class="fas fa-headset"></i> Contact Support
                </button>
            </div>
        </div>
    `;
    
    document.getElementById('orderTrackingModal').classList.add('active');
}

// Close order tracking modal
function closeOrderTrackingModal() {
    document.getElementById('orderTrackingModal').classList.remove('active');
}

// Contact support about order
function contactSupportAboutOrder(orderId) {
    // Close tracking modal
    closeOrderTrackingModal();
    
    // Switch to support section and pre-fill the form
    showSection('support');
    showSupportTab('newTicket');
    
    // Pre-fill the order ID in support form
    setTimeout(() => {
        const orderIdField = document.getElementById('ticketOrderId');
        if (orderIdField) {
            orderIdField.value = orderId;
        }
        
        // Set category to "order"
        const categorySelect = document.getElementById('ticketCategory');
        if (categorySelect) {
            categorySelect.value = 'order';
        }
        
        // Pre-fill subject
        const subjectField = document.getElementById('ticketSubject');
        if (subjectField) {
            subjectField.value = `Inquiry about Order #${orderId}`;
        }
        
        // Pre-fill message
        const messageField = document.getElementById('ticketMessage');
        if (messageField) {
            messageField.value = `I have a question about my order #${orderId}. Please provide an update on its status.`;
        }
    }, 100);
}

// Filter orders by status
function filterOrders() {
    const statusFilter = document.getElementById('orderStatusFilter').value;
    
    if (!statusFilter) {
        loadOrdersList();
        return;
    }
    
    const filteredOrders = orders.filter(order => 
        (order.status || 'processing') === statusFilter
    );
    
    const ordersContainer = document.getElementById('ordersContainer');
    
    if (filteredOrders.length === 0) {
        ordersContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-box"></i>
                <h3>No Orders Found</h3>
                <p>No orders match the selected status.</p>
                <button class="btn btn-primary" onclick="document.getElementById('orderStatusFilter').value=''; filterOrders()">
                    Clear Filter
                </button>
            </div>
        `;
        return;
    }
    
    // Re-use loadOrdersList logic but with filtered orders
    let html = '';
    filteredOrders.forEach(order => {
        const orderDate = new Date(order.date || order.createdAt);
        const formattedDate = orderDate.toLocaleDateString();
        const formattedTime = orderDate.toLocaleTimeString();
        
        const currentStatus = order.status || 'processing';
        let statusClass = 'status-processing';
        let statusText = 'Processing';
        let statusIcon = 'fas fa-cog';
        
        switch(currentStatus) {
            case 'processing':
                statusClass = 'status-processing';
                statusText = 'Processing';
                statusIcon = 'fas fa-cog';
                break;
            case 'verification':
                statusClass = 'status-verification';
                statusText = 'Verification';
                statusIcon = 'fas fa-check-circle';
                break;
            case 'packaging':
                statusClass = 'status-packaging';
                statusText = 'Packaging';
                statusIcon = 'fas fa-box';
                break;
            case 'out_for_delivery':
                statusClass = 'status-out_for_delivery';
                statusText = 'Out for Delivery';
                statusIcon = 'fas fa-shipping-fast';
                break;
            case 'completed':
                statusClass = 'status-completed';
                statusText = 'Completed';
                statusIcon = 'fas fa-check-circle';
                break;
            case 'cancelled':
                statusClass = 'status-cancelled';
                statusText = 'Cancelled';
                statusIcon = 'fas fa-times-circle';
                break;
        }
        
        const orderTotal = order.total || order.items?.reduce((sum, item) => 
            sum + (item.price * item.quantity), 0) || 0;
        
        const config = getStoreConfig();
        const tax = order.tax || (orderTotal * (config.taxRate / 100));
        const shipping = order.shipping || (orderTotal >= config.freeShippingThreshold ? 0 : config.shippingFee);
        const total = orderTotal + tax + shipping;
        
        html += `
            <div class="order-card">
                <div class="order-header">
                    <div>
                        <span class="order-id">Order #${order.id}</span>
                        <span class="order-date">${formattedDate} ${formattedTime}</span>
                    </div>
                    <span class="order-status ${statusClass}">
                        <i class="${statusIcon}"></i> ${statusText}
                    </span>
                </div>
                
                <div class="order-items">
                    ${order.items?.map(item => `
                        <div class="order-item">
                            <span>${item.name} x${item.quantity}</span>
                            <span>$${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    `).join('') || ''}
                </div>
                
                <div class="order-total">
                    Total: $${total.toFixed(2)}
                </div>
                
                <div class="order-tracking">
                    <span class="order-status ${statusClass}">
                        <i class="${statusIcon}"></i> ${statusText}
                    </span>
                    <button class="btn-track" onclick="viewOrderTracking('${order.id}')">
                        <i class="fas fa-map-marker-alt"></i> Track Order
                    </button>
                </div>
            </div>
        `;
    });
    
    ordersContainer.innerHTML = html;
}

// Update the showSection function to call loadOrdersList when orders section is shown
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
            loadOrdersList(); // Changed to loadOrdersList
            break;
        case 'wishlist':
            loadWishlistItems();
            break;
    }
}

// Add these variables at the top of client.js with other global variables
let currentClientProductType = 'all';

// Add this function to filter products in client dashboard
function filterClientProducts(type) {
    currentClientProductType = type;
    
    // Update active tab styling
    document.querySelectorAll('.type-tab').forEach(tab => {
        tab.style.background = 'white';
        tab.style.color = tab.textContent.includes('Wigs') ? '#8A2BE2' : 
                          tab.textContent.includes('Skincare') ? '#20B2AA' :
                          tab.textContent.includes('Haircare') ? '#FF69B4' :
                          tab.textContent.includes('Fragrances') ? '#FFA500' :
                          tab.textContent.includes('Makeup') ? '#DC143C' : '#8A2BE2';
        tab.style.border = tab.textContent.includes('All') ? '2px solid #8A2BE2' : '2px solid currentColor';
    });
    
    // Highlight active tab
    const activeTab = event.target;
    activeTab.style.background = activeTab.textContent.includes('Wigs') ? '#8A2BE2' :
                                 activeTab.textContent.includes('Skincare') ? '#20B2AA' :
                                 activeTab.textContent.includes('Haircare') ? '#FF69B4' :
                                 activeTab.textContent.includes('Fragrances') ? '#FFA500' :
                                 activeTab.textContent.includes('Makeup') ? '#DC143C' : '#8A2BE2';
    activeTab.style.color = 'white';
    
    loadProductsGrid();
}

// Update the loadProductsGrid function in client.js to show type badges
// Find the function and replace the product card HTML with this:

function loadProductsGrid() {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;
    
    // Filter by current type
    let productsToShow = filteredProducts;
    if (currentClientProductType !== 'all') {
        productsToShow = filteredProducts.filter(p => p.productType === currentClientProductType);
    }
    
    if (productsToShow.length === 0) {
        productsGrid.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                <i class="fas fa-box-open" style="font-size: 60px; color: #dee2e6; margin-bottom: 20px;"></i>
                <h3 style="margin-bottom: 10px; color: #333;">No Products in this Category</h3>
                <p style="margin-bottom: 20px; color: #666;">Check other categories for products.</p>
                <button class="btn btn-primary" onclick="filterClientProducts('all')">
                    View All Products
                </button>
            </div>
        `;
        return;
    }
    
    let html = '';
    productsToShow.forEach(product => {
        const isInWishlist = wishlist.some(item => item.id === product.id);
        const stockClass = product.stock < 5 ? 'low-stock' : '';
        const stockText = product.stock < 5 ? `Low Stock (${product.stock})` : 'In Stock';
        const stockColor = product.stock < 5 ? '#721c24' : '#155724';
        const stockBg = product.stock < 5 ? '#f8d7da' : '#d4edda';
        const typeColor = getClientProductTypeColor(product.productType);
        const typeIcon = getClientProductTypeIcon(product.productType);
        
        html += `
    <div class="product-card" onclick="showProductDetail(${product.id})" style="cursor: pointer; border: none; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <div class="product-image">
            <img src="${product.image || 'https://via.placeholder.com/400x400?text=Product'}" 
                 alt="${product.name}"
                 style="height: 250px; width: 100%; object-fit: cover;">
            <!-- Product Type Badge -->
            <span style="position: absolute; top: 10px; left: 10px; background: ${typeColor}; color: white; padding: 4px 8px; border-radius: 15px; font-size: 11px; font-weight: 600; z-index: 5;">
                ${typeIcon} ${product.productType || 'wig'}
            </span>
            <button class="wishlist-btn" onclick="toggleWishlist(${product.id}); event.stopPropagation()" title="${isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}">
                <i class="fas fa-heart${isInWishlist ? '' : '-o'}"></i>
            </button>
            <span class="stock-badge ${stockClass}" style="background: ${stockBg}; color: ${stockColor};">
                ${stockText}
            </span>
        </div>
        <div class="product-info" style="padding: 15px;">
            <h3 style="font-size: 16px; margin-bottom: 8px; font-weight: 600;">${product.name}</h3>
            <div class="product-meta" style="margin-bottom: 8px;">
                <span class="product-category" style="font-size: 11px; padding: 3px 8px;">${product.category}</span>
                ${product.length && product.productType === 'wig' ? `<span class="product-length" style="font-size: 11px; padding: 3px 8px;">${product.length}</span>` : ''}
            </div>
            <div class="product-price" style="margin-bottom: 10px;">
                <span class="price" style="font-size: 18px; font-weight: 700;">$${product.price.toFixed(2)}</span>
            </div>
            <p style="font-size: 13px; color: #666; margin-bottom: 12px; line-height: 1.3; height: 34px; overflow: hidden;">
                ${product.description ? (product.description.length > 50 ? product.description.substring(0, 47) + '...' : product.description) : 'Quality product'}
            </p>
            ${product.productLink ? `
                <a href="${product.productLink}" target="_blank" style="font-size: 11px; color: #3498db; text-decoration: none; margin-bottom: 8px; display: inline-block;" onclick="event.stopPropagation()">
                    <i class="fas fa-link"></i> View Original
                </a>
            ` : ''}
            ${product.stock > 0 ? 
                `<button class="btn-add-cart" onclick="addToCart(${product.id}); event.stopPropagation()" style="width: 100%; padding: 10px; font-size: 14px;">
                    <i class="fas fa-cart-plus"></i> Add to Cart
                </button>` :
                `<button class="btn-add-cart" disabled style="width: 100%; padding: 10px; font-size: 14px; background: #ccc;">
                    Out of Stock
                </button>`
            }
        </div>
    </div>
`;
    });
    
    productsGrid.innerHTML = html;
}

// Helper functions for client
function getClientProductTypeColor(type) {
    const colors = {
        'wig': '#8A2BE2',
        'skincare': '#20B2AA',
        'haircare': '#FF69B4',
        'fragrance': '#FFA500',
        'makeup': '#DC143C'
    };
    return colors[type] || '#6c757d';
}

function getClientProductTypeIcon(type) {
    const icons = {
        'wig': '💇',
        'skincare': '🧴',
        'haircare': '💆',
        'fragrance': '🌸',
        'makeup': '💄'
    };
    return icons[type] || '📦';
}

// Update the filterProducts function to work with type filter
// Find filterProducts and replace with:

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
}
// ===== COMPLETE CLIENT DASHBOARD FIXES =====

// ===== 1. PRODUCT CARDS MATCH HOME PAGE =====
// Update the product card styling to match home page
function updateProductCardStyle() {
    const style = document.createElement('style');
    style.id = 'clientProductStyles';
    style.textContent = `
        .product-card {
            background: white;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            border: none !important;
            display: flex;
            flex-direction: column;
            height: 100%;
            cursor: pointer;
        }
        
        .product-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
        }
        
        .product-image {
            position: relative;
            width: 100%;
            padding-bottom: 75%;
            overflow: hidden;
            background: #f5f5f5;
        }
        
        .product-image img {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s ease;
        }
        
        .product-card:hover .product-image img {
            transform: scale(1.05);
        }
        
        .product-type-badge-client {
            position: absolute;
            top: 10px;
            left: 10px;
            padding: 4px 8px;
            border-radius: 15px;
            font-size: 11px;
            font-weight: 600;
            color: white;
            z-index: 5;
        }
        
        .product-info {
            padding: 10px 10px;
            background: white;
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 3px;
        }
        
        .product-info h3 {
            font-size: 16px;
            font-weight: 600;
            margin: 0 0 1px 0;
            color: #343a40;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        
        .product-meta {
            display: flex;
            gap: 6px;
            margin-bottom: 2px;
            flex-wrap: wrap;
        }
        
        .product-category, .product-length {
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: 500;
        }
        
        .product-category {
            background: #e3f2fd;
            color: #1976d2;
        }
        
        .product-length {
            background: #f3e5f5;
            color: #7b1fa2;
        }
        
        .product-price {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 2px 0 1px 0;
        }
        
        .price {
            font-size: 17px;
            font-weight: 700;
            color: #2ecc71;
        }
        
        .product-description {
            font-size: 11px;
            color: #666;
            margin: 2px 0 4px 0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            border-bottom: 1px dotted #ccc;
            padding-bottom: 4px;
        }
        
        .btn-add-cart {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 8px 4px;
            border-radius: 5px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
            transition: all 0.3s ease;
            width: 100%;
            margin-top: 2px;
        }
        
        .btn-add-cart:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }
        
        .btn-add-cart:disabled {
            background: #ccc;
            cursor: not-allowed;
            opacity: 0.6;
        }
        
        .stock-badge {
            position: absolute;
            bottom: 8px;
            left: 8px;
            padding: 2px 6px;
            border-radius: 12px;
            font-size: 9px;
            font-weight: 600;
            color: white;
            z-index: 5;
        }
        
        .wishlist-btn {
            position: absolute;
            top: 8px;
            right: 8px;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: white;
            border: none;
            color: #e74c3c;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            z-index: 5;
        }
    `;
    document.head.appendChild(style);
}

// Call this on page load
updateProductCardStyle();

// ===== 2. CONTINUE SHOPPING BUTTON =====
function addContinueShoppingButton() {
    const cartContainer = document.getElementById('cartContainer');
    if (!cartContainer) return;
    
    // Check if button already exists
    if (document.getElementById('continueShoppingBtn')) return;
    
    const continueBtn = document.createElement('button');
    continueBtn.id = 'continueShoppingBtn';
    continueBtn.className = 'btn btn-secondary';
    continueBtn.innerHTML = '<i class="fas fa-arrow-left"></i> Continue Shopping';
    continueBtn.style.marginTop = '20px';
    continueBtn.style.width = '100%';
    continueBtn.onclick = () => showSection('products');
    
    cartContainer.appendChild(continueBtn);
}

// ===== 3. ORDER CANCELLATION WITH TIME WINDOW =====
function requestOrderCancellation(orderId) {
    if (!confirm('Are you sure you want to request cancellation for this order? This request will be reviewed by our team.')) {
        return;
    }
    
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    // Check if order is eligible for cancellation (within 1 hour)
    const orderTime = new Date(order.date).getTime();
    const now = new Date().getTime();
    const hoursPassed = (now - orderTime) / (1000 * 60 * 60);
    
    let warning = '';
    if (hoursPassed > 1) {
        warning = 'This order was placed more than 1 hour ago. Cancellation is not guaranteed.\n\n';
        if (!confirm(warning + 'Would you still like to request?')) {
            return;
        }
    }
    
    // Update order status to cancellation requested
    order.status = 'cancellation_requested';
    order.cancellationRequested = {
        requestedAt: new Date().toISOString(),
        reason: 'Customer requested cancellation'
    };
    
    saveOrders();
    
    // Notify admin
    const notifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
    notifications.push({
        id: 'NOTIF_' + Date.now(),
        type: 'cancellation_request',
        orderId: orderId,
        customerEmail: order.customer.email,
        customerName: order.customer.username,
        requestedAt: new Date().toISOString(),
        read: false
    });
    localStorage.setItem('adminNotifications', JSON.stringify(notifications));
    
    showNotification('✅ Cancellation request submitted. You will be notified once processed.', 'success');
    loadOrdersList();
}

// ===== 4. ORDER HISTORY FILTERING =====
function filterOrdersByDate(range) {
    const filteredOrders = orders.filter(order => {
        const orderDate = new Date(order.date);
        const now = new Date();
        
        switch(range) {
            case 'today':
                return orderDate.toDateString() === now.toDateString();
            case 'week':
                const weekAgo = new Date(now.setDate(now.getDate() - 7));
                return orderDate >= weekAgo;
            case 'month':
                const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
                return orderDate >= monthAgo;
            case 'year':
                const yearAgo = new Date(now.setFullYear(now.getFullYear() - 1));
                return orderDate >= yearAgo;
            default:
                return true;
        }
    });
    
    displayFilteredOrders(filteredOrders);
}

function displayFilteredOrders(filteredOrders) {
    const ordersContainer = document.getElementById('ordersContainer');
    
    if (filteredOrders.length === 0) {
        ordersContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-box"></i>
                <h3>No Orders Found</h3>
                <p>No orders match the selected filter.</p>
                <button class="btn btn-primary" onclick="loadOrdersList()">
                    Show All Orders
                </button>
            </div>
        `;
        return;
    }
    
    displayOrdersList(filteredOrders);
}

// Add date filter to orders section
function addOrderFilters() {
    const sectionHeader = document.querySelector('#ordersSection .section-header');
    if (!sectionHeader) return;
    
    // Remove existing filter controls to avoid duplicates
    const existingFilters = document.getElementById('orderFiltersContainer');
    if (existingFilters) existingFilters.remove();
    
    const filterHtml = `
        <div id="orderFiltersContainer" style="display: flex; gap: 10px; align-items: center; margin-top: 10px; width: 100%;">
            <select id="orderDateFilter" onchange="filterOrdersByDate(this.value)" style="padding: 8px 12px; border: 2px solid #e2e8f0; border-radius: 6px; flex: 1;">
                <option value="">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="year">Last Year</option>
            </select>
            <select id="orderStatusFilter" onchange="filterOrders()" style="padding: 8px 12px; border: 2px solid #e2e8f0; border-radius: 6px; flex: 1;">
                <option value="">All Status</option>
                <option value="processing">Processing</option>
                <option value="verification">Verification</option>
                <option value="packaging">Packaging</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="cancellation_requested">Cancellation Requested</option>
            </select>
        </div>
    `;
    
    sectionHeader.insertAdjacentHTML('beforeend', filterHtml);
}

// ===== 5. FIX PROFILE MEMBER SINCE =====
function updateUserProfile() {
    const clientUser = JSON.parse(localStorage.getItem('clientUser') || '{}');
    if (clientUser.username) {
        document.getElementById('clientName').textContent = clientUser.username;
        document.getElementById('profileName').textContent = clientUser.username;
        document.getElementById('profileEmail').textContent = clientUser.email;
        
        // Get actual registration date from client data
        const clients = JSON.parse(localStorage.getItem('wigClients') || '[]');
        const clientData = clients.find(c => c.email === clientUser.email);
        
        if (clientData && clientData.createdAt) {
            const joinDate = new Date(clientData.createdAt);
            document.getElementById('memberSince').textContent = joinDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } else if (clientUser.createdAt) {
            const joinDate = new Date(clientUser.createdAt);
            document.getElementById('memberSince').textContent = joinDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } else {
            document.getElementById('memberSince').textContent = 'New Member';
        }
        
        console.log('👤 User profile updated:', clientUser.username);
    }
}

// ===== 6. WISHLIST STOCK CHECK =====
function loadWishlistItems() {
    const wishlistGrid = document.getElementById('wishlistGrid');
    if (!wishlistGrid) return;
    
    // Refresh product data to check current stock
    const allProducts = JSON.parse(localStorage.getItem('wigProducts') || '[]');
    
    // Update wishlist items with current stock
    wishlist = wishlist.map(wishlistItem => {
        const currentProduct = allProducts.find(p => p.id === wishlistItem.id);
        if (currentProduct) {
            return {
                ...wishlistItem,
                stock: currentProduct.stock,
                active: currentProduct.active,
                price: currentProduct.price // Update price in case it changed
            };
        }
        return wishlistItem;
    }).filter(item => item.active !== false); // Filter out inactive products
    
    saveWishlist();
    
    if (wishlist.length === 0) {
        wishlistGrid.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <i class="fas fa-heart"></i>
                <h3>Your Wishlist is Empty</h3>
                <p>Add products you love to your wishlist!</p>
                <button class="btn btn-primary" onclick="showSection('products')">
                    <i class="fas fa-wig"></i> Browse Products
                </button>
            </div>
        `;
        return;
    }
    
    let html = '';
    wishlist.forEach(product => {
        const stockStatus = product.stock > 0 ? 
            `<span style="color: #28a745; font-size: 12px;"><i class="fas fa-check-circle"></i> In Stock (${product.stock})</span>` : 
            `<span style="color: #dc3545; font-size: 12px;"><i class="fas fa-times-circle"></i> Out of Stock</span>`;
        
        html += `
            <div class="wishlist-item" onclick="showProductDetail(${product.id})" style="cursor: pointer;">
                <div class="wishlist-image">
                    <img src="${product.image || 'https://via.placeholder.com/80x80?text=Product'}" 
                         alt="${product.name}">
                </div>
                <div class="wishlist-info">
                    <h4>${product.name}</h4>
                    <p>${product.category} • ${product.length || ''}</p>
                    <p class="price">$${product.price.toFixed(2)}</p>
                    <p>${stockStatus}</p>
                </div>
                <button class="btn-remove-wishlist" onclick="removeFromWishlist(${product.id}); event.stopPropagation()" title="Remove from wishlist">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    });
    
    wishlistGrid.innerHTML = html;
}

// ===== 7. ORDER CONFIRMATION PAGE =====
function showOrderConfirmation(order) {
    const modalBody = document.getElementById('modalBody');
    const modal = document.getElementById('productModal');
    
    const itemsHtml = order.items.map(item => `
        <tr>
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>$${item.price.toFixed(2)}</td>
            <td>$${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
    `).join('');
    
    modalBody.innerHTML = `
        <div style="text-align: center; padding: 20px;">
            <i class="fas fa-check-circle" style="font-size: 80px; color: #28a745; margin-bottom: 20px;"></i>
            <h2 style="margin-bottom: 10px;">Order Confirmed!</h2>
            <p style="color: #666; margin-bottom: 30px;">Thank you for your purchase. Your order has been received.</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px; text-align: left;">
                <h3 style="margin-bottom: 15px;">Order Details</h3>
                <p><strong>Order Number:</strong> #${order.id}</p>
                <p><strong>Order Date:</strong> ${new Date(order.date).toLocaleString()}</p>
                <p><strong>Order Status:</strong> <span class="status-badge status-processing">Processing</span></p>
                
                <h4 style="margin: 20px 0 10px;">Items Ordered</h4>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="border-bottom: 2px solid #dee2e6;">
                            <th style="padding: 10px; text-align: left;">Item</th>
                            <th style="padding: 10px; text-align: left;">Qty</th>
                            <th style="padding: 10px; text-align: left;">Price</th>
                            <th style="padding: 10px; text-align: left;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>
                
                <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #dee2e6;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span>Subtotal:</span>
                        <span>$${order.subtotal.toFixed(2)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span>Tax:</span>
                        <span>$${order.tax.toFixed(2)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span>Shipping:</span>
                        <span>${order.shipping === 0 ? 'FREE' : '$' + order.shipping.toFixed(2)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 20px; font-weight: bold; margin-top: 10px;">
                        <span>Total:</span>
                        <span style="color: #28a745;">$${order.total.toFixed(2)}</span>
                    </div>
                </div>
            </div>
            
            <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: left;">
                <h4 style="margin-bottom: 10px;"><i class="fas fa-info-circle"></i> Estimated Delivery</h4>
                <p>Your order is being processed. Estimated delivery:</p>
                <ul style="margin-top: 10px; padding-left: 20px;">
                    <li>Processing: 1-2 business days</li>
                    <li>Shipping: 3-5 business days</li>
                    <li><strong>Expected delivery:</strong> ${calculateDeliveryDate()}</li>
                </ul>
            </div>
            
            <div style="display: flex; gap: 15px; justify-content: center;">
                <button class="btn btn-primary" onclick="closeModal(); showSection('orders')">
                    <i class="fas fa-box"></i> View My Orders
                </button>
                <button class="btn btn-secondary" onclick="closeModal(); showSection('products')">
                    <i class="fas fa-shopping-cart"></i> Continue Shopping
                </button>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
}

function calculateDeliveryDate() {
    const today = new Date();
    const deliveryDate = new Date(today);
    deliveryDate.setDate(today.getDate() + 7); // 7 days from now
    
    return deliveryDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Update checkout function to show confirmation
function checkout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    // Check stock availability
    const allProducts = JSON.parse(localStorage.getItem('wigProducts') || '[]');
    for (const item of cart) {
        const product = allProducts.find(p => p.id === item.id);
        if (!product || product.stock < item.quantity) {
            alert(`Sorry, ${item.name} is no longer available in the requested quantity.`);
            return;
        }
    }
    
    // Confirm purchase
    const config = getStoreConfig();
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * (config.taxRate / 100);
    const shipping = subtotal >= config.freeShippingThreshold ? 0 : config.shippingFee;
    const total = subtotal + tax + shipping;
    
    if (!confirm(`Confirm purchase for $${total.toFixed(2)}?`)) {
        return;
    }
    
    // Create order
    const order = {
        id: generateOrderId(),
        date: new Date().toISOString(),
        items: [...cart],
        subtotal: subtotal,
        tax: tax,
        shipping: shipping,
        total: total,
        status: 'processing',
        customer: JSON.parse(localStorage.getItem('clientUser'))
    };
    
    // Update product stock
    for (const item of cart) {
        const productIndex = allProducts.findIndex(p => p.id === item.id);
        if (productIndex !== -1) {
            allProducts[productIndex].stock -= item.quantity;
        }
    }
    
    localStorage.setItem('wigProducts', JSON.stringify(allProducts));
    
    // Add to orders
    orders.unshift(order);
    saveOrders();
    
    // Clear cart
    cart = [];
    saveCart();
    
    // Show confirmation page
    showOrderConfirmation(order);
}

// ===== 8. LOAD ORDERS LIST WITH CANCELLATION =====
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
        const orderDate = new Date(order.date || order.createdAt);
        const formattedDate = orderDate.toLocaleDateString();
        const formattedTime = orderDate.toLocaleTimeString();
        
        const currentStatus = order.status || 'processing';
        let statusClass = 'status-processing';
        let statusText = 'Processing';
        let statusIcon = 'fas fa-cog';
        
        switch(currentStatus) {
            case 'processing':
                statusClass = 'status-processing';
                statusText = 'Processing';
                statusIcon = 'fas fa-cog';
                break;
            case 'verification':
                statusClass = 'status-verification';
                statusText = 'Verification';
                statusIcon = 'fas fa-check-circle';
                break;
            case 'packaging':
                statusClass = 'status-packaging';
                statusText = 'Packaging';
                statusIcon = 'fas fa-box';
                break;
            case 'out_for_delivery':
                statusClass = 'status-out_for_delivery';
                statusText = 'Out for Delivery';
                statusIcon = 'fas fa-shipping-fast';
                break;
            case 'completed':
                statusClass = 'status-completed';
                statusText = 'Completed';
                statusIcon = 'fas fa-check-circle';
                break;
            case 'cancelled':
                statusClass = 'status-cancelled';
                statusText = 'Cancelled';
                statusIcon = 'fas fa-times-circle';
                break;
            case 'cancellation_requested':
                statusClass = 'status-cancellation_requested';
                statusText = 'Cancellation Requested';
                statusIcon = 'fas fa-clock';
                break;
        }
        
        const orderTotal = order.total || order.items?.reduce((sum, item) => 
            sum + (item.price * item.quantity), 0) || 0;
        
        html += `
            <div class="order-card" style="position: relative;">
                <div class="order-header">
                    <div>
                        <span class="order-id">Order #${order.id}</span>
                        <span class="order-date">${formattedDate} ${formattedTime}</span>
                    </div>
                    <span class="order-status ${statusClass}">
                        <i class="${statusIcon}"></i> ${statusText}
                    </span>
                </div>
                
                <div class="order-items">
                    ${order.items?.map(item => `
                        <div class="order-item">
                            <span>${item.name} x${item.quantity}</span>
                            <span>$${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    `).join('') || ''}
                </div>
                
                <div class="order-total">
                    Total: $${orderTotal.toFixed(2)}
                </div>
                
                <div style="display: flex; gap: 10px; margin-top: 15px; justify-content: space-between; align-items: center;">
                    <div class="order-tracking">
                        <span class="order-status ${statusClass}">
                            <i class="${statusIcon}"></i> ${statusText}
                        </span>
                        <button class="btn-track" onclick="viewOrderTracking('${order.id}')">
                            <i class="fas fa-map-marker-alt"></i> Track
                        </button>
                    </div>
                    
                    ${currentStatus === 'processing' || currentStatus === 'verification' ? `
                        <button class="btn btn-danger btn-sm" onclick="requestOrderCancellation('${order.id}')">
                            <i class="fas fa-times"></i> Request Cancellation
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    });
    
    ordersContainer.innerHTML = html;
    addOrderFilters();
}

// ===== 9. UPDATE SHOW SECTION TO INCLUDE FILTERS =====
// Replace your existing showSection function with this
function showSection(sectionId) {
    console.log('Switching to section:', sectionId);
    
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    const buttons = document.querySelectorAll('.sidebar-btn');
    buttons.forEach(button => {
        button.classList.remove('active');
    });
    
    const selectedSection = document.getElementById(sectionId + 'Section');
    if (selectedSection) {
        selectedSection.classList.add('active');
    }
    
    const activeButton = document.querySelector(`.sidebar-btn[onclick*="${sectionId}"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
    
    switch(sectionId) {
        case 'products':
            loadProductsGrid();
            break;
        case 'cart':
            loadCartItems();
            addContinueShoppingButton();
            break;
        case 'orders':
            loadOrdersList();
            break;
        case 'wishlist':
            loadWishlistItems();
            break;
    }
}

// ===== 10. UPDATE LOAD CART ITEMS =====
// Replace your existing loadCartItems function with this
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
            <div class="cart-item" onclick="showProductDetail(${item.id})" style="cursor: pointer;">
                <div class="cart-item-image">
                    <img src="${item.image || 'https://via.placeholder.com/100x100?text=Wig'}" 
                         alt="${item.name}">
                </div>
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p class="item-category">${item.category} • ${item.length || ''}</p>
                    <p class="item-price">$${item.price.toFixed(2)} each</p>
                    ${item.stock < 5 ? `<p style="color: #dc3545; font-size: 12px;">Only ${item.stock} left!</p>` : ''}
                </div>
                <div class="cart-item-quantity" onclick="event.stopPropagation()">
                    <button class="qty-btn" onclick="updateCartQuantity(${item.id}, -1)" title="Decrease quantity">-</button>
                    <span class="qty-value">${item.quantity}</span>
                    <button class="qty-btn" onclick="updateCartQuantity(${item.id}, 1)" title="Increase quantity">+</button>
                </div>
                <div class="cart-item-total">$${itemTotal.toFixed(2)}</div>
                <button class="btn-remove" onclick="removeFromCart(${item.id}); event.stopPropagation()" title="Remove from cart">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    });
    
    const config = getStoreConfig();
    const tax = subtotal * (config.taxRate / 100);
    const shipping = subtotal >= config.freeShippingThreshold ? 0 : config.shippingFee;
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
                <span>Tax (${config.taxRate}%):</span>
                <span>$${tax.toFixed(2)}</span>
            </div>
            <div class="summary-row">
                <span>Shipping:</span>
                <span>${shipping === 0 ? '<span style="color: #28a745; font-weight: 600;">FREE</span>' : `$${shipping.toFixed(2)}`}</span>
                ${subtotal < config.freeShippingThreshold ? 
                    `<small style="display: block; color: #666; margin-top: 5px;">Spend $${(config.freeShippingThreshold - subtotal).toFixed(2)} more for free shipping!</small>` : 
                    ''}
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
    
    addContinueShoppingButton();
}

// Initialize everything
document.addEventListener('DOMContentLoaded', function() {
    updateProductCardStyle();
    updateUserProfile(); // Fix member since
});
// ===== PER-ITEM ORDER TRACKING =====
function updateOrderItemStatus(orderId, productId, newStatus) {
    const clients = JSON.parse(localStorage.getItem('wigClients') || '[]');
    
    clients.forEach(client => {
        const ordersKey = `orders_${client.email}`;
        const orders = JSON.parse(localStorage.getItem(ordersKey) || '[]');
        const orderIndex = orders.findIndex(o => o.id === orderId);
        
        if (orderIndex !== -1) {
            const order = orders[orderIndex];
            if (order.items) {
                const itemIndex = order.items.findIndex(item => item.id == productId);
                if (itemIndex !== -1) {
                    // Initialize item status if not exists
                    if (!order.items[itemIndex].itemStatus) {
                        order.items[itemIndex].itemStatus = [];
                    }
                    
                    // Add status update
                    order.items[itemIndex].itemStatus.push({
                        status: newStatus,
                        changedAt: new Date().toISOString(),
                        changedBy: document.getElementById('adminName')?.textContent || 'Admin'
                    });
                    
                    order.items[itemIndex].currentItemStatus = newStatus;
                    
                    localStorage.setItem(ordersKey, JSON.stringify(orders));
                    
                    showAdminNotification(`✅ Item status updated to ${newStatus}`, 'success');
                    return true;
                }
            }
        }
    });
    
    return false;
}

function viewItemTracking(orderId, productId) {
    const order = allOrders.find(o => o.id === orderId);
    if (!order) return;
    
    const item = order.items?.find(i => i.id == productId);
    if (!item) return;
    
    const modalBody = document.getElementById('adminTicketModalBody');
    const modal = document.getElementById('adminTicketModal');
    
    const statusHistory = item.itemStatus || [];
    const currentStatus = item.currentItemStatus || order.status || 'processing';
    
    let historyHtml = '';
    if (statusHistory.length > 0) {
        historyHtml = statusHistory.map(s => `
            <div style="padding: 10px; border-left: 3px solid #3498db; margin-bottom: 10px; background: #f8f9fa;">
                <strong>${s.status}</strong><br>
                <small>${new Date(s.changedAt).toLocaleString()} by ${s.changedBy}</small>
            </div>
        `).join('');
    } else {
        historyHtml = '<p style="color: #666;">No item-specific tracking history</p>';
    }
    
    modalBody.innerHTML = `
        <div style="padding: 20px;">
            <h3>Item Tracking: ${item.name}</h3>
            <p><strong>Order:</strong> #${orderId}</p>
            <p><strong>Quantity:</strong> ${item.quantity}</p>
            <p><strong>Current Status:</strong> 
                <span class="status-badge status-${currentStatus}">${currentStatus}</span>
            </p>
            
            <h4 style="margin-top: 20px;">Update Item Status</h4>
            <select id="itemStatusSelect" style="width:100%; padding:10px; margin-bottom:10px;">
                <option value="processing">Processing</option>
                <option value="verification">Verification</option>
                <option value="packaging">Packaging</option>
                <option value="shipped">Shipped</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="returned">Returned</option>
            </select>
            
            <button class="btn btn-primary" onclick="updateOrderItemStatus('${orderId}', ${productId}, document.getElementById('itemStatusSelect').value); closeModal();" style="width:100%; margin-bottom:20px;">
                Update Item Status
            </button>
            
            <h4>Status History</h4>
            <div style="max-height: 300px; overflow-y: auto;">
                ${historyHtml}
            </div>
            
            <button class="btn btn-secondary" onclick="closeModal()" style="width:100%; margin-top:20px;">Close</button>
        </div>
    `;
    
    modal.classList.add('active');
}

// ===== SPECIFIC ERROR MESSAGES =====
const ErrorMessages = {
    // Authentication errors
    'auth/invalid-credentials': 'The username or password you entered is incorrect. Please try again.',
    'auth/account-locked': 'Your account has been temporarily locked due to multiple failed attempts. Please try again in 15 minutes.',
    'auth/session-expired': 'Your session has expired. Please log in again.',
    'auth/unauthorized': 'You do not have permission to access this page.',
    
    // Form validation errors
    'form/required-field': '{field} is required.',
    'form/invalid-email': 'Please enter a valid email address (e.g., name@example.com).',
    'form/invalid-phone': 'Please enter a valid phone number (e.g., 0768832415).',
    'form/password-too-weak': 'Password must be at least 8 characters with uppercase, lowercase, number, and special character.',
    'form/passwords-dont-match': 'The passwords you entered do not match.',
    'form/username-taken': 'This username is already taken. Please choose another one.',
    'form/email-taken': 'This email is already registered. Please use a different email or login.',
    
    // Product errors
    'product/out-of-stock': 'Sorry, "{product}" is out of stock.',
    'product/insufficient-stock': 'Only {stock} units of "{product}" are available.',
    'product/not-found': 'Product not found. It may have been removed.',
    
    // Cart errors
    'cart/empty': 'Your cart is empty. Add some items before checkout.',
    'cart/item-not-found': 'Item not found in cart.',
    'cart/max-quantity': 'Maximum quantity reached for this item.',
    
    // Order errors
    'order/not-found': 'Order not found. Please check the order ID.',
    'order/cancellation-expired': 'Orders can only be cancelled within 1 hour of placement.',
    'order/already-cancelled': 'This order has already been cancelled.',
    'order/refund-processing': 'A refund is already being processed for this order.',
    
    // Payment errors
    'payment/insufficient-funds': 'Insufficient funds for this payment.',
    'payment/card-declined': 'Your card was declined. Please try another payment method.',
    'payment/invalid-card': 'Invalid card number. Please check and try again.',
    'payment/expired-card': 'Your card has expired. Please use another card.',
    'payment/mpesa-failed': 'M-Pesa transaction failed. Please try again.',
    
    // Network errors
    'network/offline': 'No internet connection. Please check your network and try again.',
    'network/timeout': 'Request timed out. Please try again.',
    'network/server-error': 'Server error. Please try again later.',
    
    // Data errors
    'data/save-failed': 'Failed to save data. Please try again.',
    'data/load-failed': 'Failed to load data. Please refresh the page.',
    'data/export-failed': 'Failed to export data. Please try again.',
    
    // Permission errors
    'permission/denied': 'You do not have permission to perform this action.',
    'permission/admin-only': 'This action is restricted to administrators only.'
};

function showSpecificError(errorCode, replacements = {}) {
    let message = ErrorMessages[errorCode] || 'An unexpected error occurred. Please try again.';
    
    // Replace placeholders
    Object.keys(replacements).forEach(key => {
        message = message.replace(`{${key}}`, replacements[key]);
    });
    
    showNotification(message, 'error');
}

function showFormError(field, errorCode) {
    const fieldElement = document.getElementById(field);
    if (fieldElement) {
        fieldElement.classList.add('error');
        
        // Remove existing error message
        const existingError = document.getElementById(`${field}-error`);
        if (existingError) existingError.remove();
        
        // Add error message
        const errorDiv = document.createElement('div');
        errorDiv.id = `${field}-error`;
        errorDiv.className = 'error-message';
        errorDiv.style.color = '#dc3545';
        errorDiv.style.fontSize = '12px';
        errorDiv.style.marginTop = '5px';
        errorDiv.textContent = ErrorMessages[errorCode].replace('{field}', field);
        
        fieldElement.parentNode.appendChild(errorDiv);
        
        // Remove error on input
        fieldElement.addEventListener('input', function() {
            this.classList.remove('error');
            const error = document.getElementById(`${field}-error`);
            if (error) error.remove();
        }, { once: true });
    }
}

function validateFormField(field, value, rules) {
    if (rules.required && !value) {
        showFormError(field, 'form/required-field');
        return false;
    }
    
    if (rules.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        showFormError(field, 'form/invalid-email');
        return false;
    }
    
    if (rules.phone && !/^[0-9+\-\s]{10,15}$/.test(value)) {
        showFormError(field, 'form/invalid-phone');
        return false;
    }
    
    if (rules.password) {
        if (value.length < 8) {
            showFormError(field, 'form/password-too-weak');
            return false;
        }
        if (!/[A-Z]/.test(value) || !/[a-z]/.test(value) || !/[0-9]/.test(value) || !/[^A-Za-z0-9]/.test(value)) {
            showFormError(field, 'form/password-too-weak');
            return false;
        }
    }
    
    return true;
}

// ===== KEYBOARD NAVIGATION =====
function initKeyboardNavigation() {
    document.addEventListener('keydown', function(e) {
        // ESC key - close any open modal
        if (e.key === 'Escape') {
            closeAllModals();
        }
        
        // Ctrl/Cmd + K - focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            focusSearch();
        }
        
        // Alt + numbers for navigation
        if (e.altKey && !isNaN(parseInt(e.key))) {
            e.preventDefault();
            const index = parseInt(e.key) - 1;
            navigateByIndex(index);
        }
        
        // / - focus search (like in many apps)
        if (e.key === '/' && !e.ctrlKey && !e.metaKey && !isInputFocused()) {
            e.preventDefault();
            focusSearch();
        }
        
        // ? - show keyboard shortcuts
        if (e.key === '?' && !e.shiftKey) {
            e.preventDefault();
            showKeyboardShortcuts();
        }
    });
}

function isInputFocused() {
    const activeElement = document.activeElement;
    return activeElement.tagName === 'INPUT' || 
           activeElement.tagName === 'TEXTAREA' || 
           activeElement.tagName === 'SELECT';
}

function closeAllModals() {
    document.querySelectorAll('.modal.active, .admin-modal.active, .camera-preview').forEach(modal => {
        modal.classList.remove('active');
        if (modal.id === 'cameraModal' && window.currentStream) {
            window.currentStream.getTracks().forEach(track => track.stop());
        }
    });
}

function focusSearch() {
    const searchInput = document.getElementById('adminSearchInput') || 
                       document.getElementById('customerSearchInput') ||
                       document.getElementById('homeSearchInput') ||
                       document.getElementById('searchInput');
    
    if (searchInput) {
        searchInput.focus();
        searchInput.select();
    }
}

function navigateByIndex(index) {
    const buttons = document.querySelectorAll('.admin-btn, .sidebar-btn');
    if (buttons[index]) {
        buttons[index].click();
    }
}

function showKeyboardShortcuts() {
    const shortcuts = `
        <div class="modal active" id="shortcutsModal">
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header" style="padding: 20px; border-bottom: 1px solid #e0e0e0;">
                    <h3 style="margin:0;">⌨️ Keyboard Shortcuts</h3>
                </div>
                <div class="modal-body" style="padding: 20px;">
                    <table style="width:100%; border-collapse: collapse;">
                        <tr><td><kbd>ESC</kbd></td><td>Close any open modal</td></tr>
                        <tr><td><kbd>/</kbd></td><td>Focus search box</td></tr>
                        <tr><td><kbd>Ctrl+K</kbd></td><td>Focus search (Cmd+K on Mac)</td></tr>
                        <tr><td><kbd>Alt+1</kbd> to <kbd>Alt+9</kbd></td><td>Navigate to menu items</td></tr>
                        <tr><td><kbd>?</kbd></td><td>Show this help</td></tr>
                        <tr><td><kbd>Ctrl+S</kbd></td><td>Save current form (when applicable)</td></tr>
                        <tr><td><kbd>Ctrl+F</kbd></td><td>Find in page</td></tr>
                    </table>
                    <p style="margin-top:20px; font-size:12px; color:#666; text-align:center;">
                        Press <kbd>ESC</kbd> to close this window
                    </p>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', shortcuts);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initKeyboardNavigation();
});
// ===== MULTI-TAB SYNC =====
function initMultiTabSync() {
    // Listen for storage events (when localStorage changes in another tab)
    window.addEventListener('storage', function(e) {
        console.log('Storage changed in another tab:', e.key);
        
        // Handle different data types
        if (e.key === 'wigProducts') {
            loadProducts();
            if (document.getElementById('productsGrid')) {
                loadProductsGrid();
            }
            if (document.getElementById('adminProductsTable')) {
                loadProductsTable();
            }
        }
        
        if (e.key && e.key.startsWith('cart_')) {
            loadCart();
            if (document.getElementById('cartContainer')) {
                loadCartItems();
            }
            updateCartCount();
        }
        
        if (e.key && e.key.startsWith('wishlist_')) {
            loadWishlist();
            if (document.getElementById('wishlistGrid')) {
                loadWishlistItems();
            }
            updateWishlistCount();
        }
        
        if (e.key && e.key.startsWith('orders_')) {
            loadOrders();
            if (document.getElementById('ordersContainer')) {
                loadOrdersList();
            }
        }
        
        if (e.key === 'clientToken' || e.key === 'adminToken') {
            // Session changed in another tab
            if (!localStorage.getItem(e.key)) {
                // User logged out in another tab
                if (confirm('Your session has been terminated in another tab. Would you like to log in again?')) {
                    if (e.key === 'adminToken') {
                        window.location.href = 'admin-login.html';
                    } else {
                        window.location.href = 'client-login.html';
                    }
                }
            }
        }
    });
    
    // Broadcast changes to other tabs
    window.broadcastChange = function(key, value) {
        // This will trigger storage event in other tabs
        localStorage.setItem(key, value);
        // Remove immediately to avoid infinite loop
        setTimeout(() => {
            localStorage.removeItem(key + '_temp');
        }, 100);
    };
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initMultiTabSync();
});
// ===== CROSS-DEVICE CART SYNC =====
function syncCartWithAccount() {
    const clientUser = JSON.parse(localStorage.getItem('clientUser') || '{}');
    if (!clientUser.email) return;
    
    // Check if there's a saved cart for this account
    const accountCartKey = `cart_${clientUser.email}`;
    const accountCart = JSON.parse(localStorage.getItem(accountCartKey) || '[]');
    
    // Check if there's a guest cart
    const guestCartKey = 'cart_guest';
    const guestCart = JSON.parse(localStorage.getItem(guestCartKey) || '[]');
    
    if (guestCart.length > 0) {
        // Merge guest cart with account cart
        const mergedCart = [...accountCart];
        
        guestCart.forEach(guestItem => {
            const existingItem = mergedCart.find(item => item.id === guestItem.id);
            if (existingItem) {
                existingItem.quantity += guestItem.quantity;
            } else {
                mergedCart.push(guestItem);
            }
        });
        
        // Save merged cart to account
        localStorage.setItem(accountCartKey, JSON.stringify(mergedCart));
        
        // Clear guest cart
        localStorage.removeItem(guestCartKey);
        
        // Update current cart
        cart = mergedCart;
        saveCart();
        
        showNotification('🔄 Guest cart merged with your account!', 'info');
    }
}

// Modify login function to sync cart
function login(email, password) {
    // ... existing login code ...
    
    // After successful login
    syncCartWithAccount();
    
    // ... rest of login code ...
}
// ===== PASSWORD ENCRYPTION =====
// Simple encryption (for demo purposes - use proper encryption in production)
function hashPassword(password) {
    // This is a simple hash - in production, use bcrypt or similar
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return 'hash_' + Math.abs(hash).toString(36) + '_' + btoa(password).substring(0, 10);
}

function verifyPassword(inputPassword, storedHash) {
    return hashPassword(inputPassword) === storedHash;
}

// Update user creation to store hashed passwords
function createUser(username, email, password) {
    const clients = JSON.parse(localStorage.getItem('wigClients') || '[]');
    
    const newUser = {
        id: clients.length + 1,
        username: username,
        email: email,
        passwordHash: hashPassword(password), // Store hash, not plain text
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        status: 'active'
    };
    
    clients.push(newUser);
    localStorage.setItem('wigClients', JSON.stringify(clients));
    
    return newUser;
}

// Update login to use hash verification
function authenticateUser(email, password) {
    const clients = JSON.parse(localStorage.getItem('wigClients') || '[]');
    const user = clients.find(c => c.email === email);
    
    if (user && verifyPassword(password, user.passwordHash || hashPassword(user.password))) {
        // Migrate from plain text to hash if needed
        if (user.password && !user.passwordHash) {
            user.passwordHash = hashPassword(user.password);
            delete user.password;
            localStorage.setItem('wigClients', JSON.stringify(clients));
        }
        return user;
    }
    
    return null;
}
// ===== CSRF PROTECTION =====
function generateCSRFToken() {
    const token = 'csrf_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    sessionStorage.setItem('csrfToken', token);
    return token;
}

function validateCSRFToken(token) {
    const storedToken = sessionStorage.getItem('csrfToken');
    return token === storedToken;
}

function addCSRFToForms() {
    const token = generateCSRFToken();
    document.querySelectorAll('form').forEach(form => {
        // Check if CSRF input already exists
        if (!form.querySelector('input[name="_csrf"]')) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = '_csrf';
            input.value = token;
            form.appendChild(input);
        }
    });
}

function validateFormCSRF(form) {
    const tokenInput = form.querySelector('input[name="_csrf"]');
    if (!tokenInput || !validateCSRFToken(tokenInput.value)) {
        showNotification('Security token validation failed. Please refresh the page.', 'error');
        return false;
    }
    return true;
}

// Add to form submissions
document.addEventListener('submit', function(e) {
    if (!validateFormCSRF(e.target)) {
        e.preventDefault();
    }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    addCSRFToForms();
});
// ===== SERVER-SIDE VALIDATION SIMULATION =====
function validateServerSide(data, rules) {
    const errors = [];
    
    for (const [field, rule] of Object.entries(rules)) {
        const value = data[field];
        
        if (rule.required && !value) {
            errors.push(`${field} is required`);
            continue;
        }
        
        if (value) {
            if (rule.minLength && value.length < rule.minLength) {
                errors.push(`${field} must be at least ${rule.minLength} characters`);
            }
            
            if (rule.maxLength && value.length > rule.maxLength) {
                errors.push(`${field} cannot exceed ${rule.maxLength} characters`);
            }
            
            if (rule.pattern && !rule.pattern.test(value)) {
                errors.push(`${field} format is invalid`);
            }
            
            if (rule.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                errors.push(`${field} must be a valid email address`);
            }
            
            if (rule.type === 'number' && isNaN(parseFloat(value))) {
                errors.push(`${field} must be a number`);
            }
            
            if (rule.min !== undefined && parseFloat(value) < rule.min) {
                errors.push(`${field} must be at least ${rule.min}`);
            }
            
            if (rule.max !== undefined && parseFloat(value) > rule.max) {
                errors.push(`${field} cannot exceed ${rule.max}`);
            }
            
            if (rule.custom && typeof rule.custom === 'function') {
                const customError = rule.custom(value, data);
                if (customError) {
                    errors.push(customError);
                }
            }
        }
    }
    
    return {
        valid: errors.length === 0,
        errors: errors
    };
}

// Validation rules for different forms
const ValidationRules = {
    product: {
        name: { required: true, minLength: 3, maxLength: 100 },
        price: { required: true, type: 'number', min: 0.01, max: 999999.99 },
        stock: { required: true, type: 'number', min: 0, max: 999999 },
        category: { required: true },
        description: { required: true, minLength: 10, maxLength: 2000 },
        image: { required: true, pattern: /^(http|https):\/\/[^ "]+$/ }
    },
    
    client: {
        username: { required: true, minLength: 3, maxLength: 20, pattern: /^[a-zA-Z0-9_]+$/ },
        email: { required: true, type: 'email' },
        password: { required: true, minLength: 6 }
    },
    
    order: {
        items: { required: true, custom: (value) => value.length === 0 ? 'Cart cannot be empty' : null },
        paymentMethod: { required: true }
    },
    
    support: {
        subject: { required: true, minLength: 5, maxLength: 200 },
        message: { required: true, minLength: 20, maxLength: 5000 },
        category: { required: true }
    }
};

// Example usage in form submission
function validateAndSubmit(formId, data, ruleset) {
    const validation = validateServerSide(data, ValidationRules[ruleset]);
    
    if (!validation.valid) {
        validation.errors.forEach(error => {
            showNotification(error, 'error');
        });
        return false;
    }
    
    // If validation passes, proceed with submission
    return true;
}