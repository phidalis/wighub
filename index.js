// index.js - COMPLETE VERSION WITH ALL FIXES
let allProducts = [];
let filteredProducts = [];
let currentProductTypeFilter = 'all';

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('WigHub Home Page Initializing...');
    initializeData();
    loadFeaturedProducts();
    setupEventListeners();
    setupScrollToTop();
    initHeroCarousel();
    setupLoadingStates();
    
    // Initialize filter on page load
    setTimeout(() => {
        filterHomeProducts();
    }, 500);
});

// Initialize data
function initializeData() {
    // Initialize products if not exist
    if (!localStorage.getItem('wigProducts')) {
        console.log('No products found, will show empty state');
        localStorage.setItem('wigProducts', JSON.stringify([]));
    }
    
    // Initialize clients if not exist
    if (!localStorage.getItem('wigClients')) {
        localStorage.setItem('wigClients', JSON.stringify([]));
    }
    
    // Initialize admins if not exist
    if (!localStorage.getItem('wigAdmins')) {
        const defaultAdmins = [{
            id: 1,
            name: 'System Administrator',
            email: 'admin@wighub.com',
            password: 'Phid@3630',
            role: 'super_admin',
            createdAt: new Date().toISOString(),
            isDefault: true
        }];
        localStorage.setItem('wigAdmins', JSON.stringify(defaultAdmins));
    }
}

// Load featured products with loading state
function loadFeaturedProducts() {
    console.log('Loading products for home page...');
    showLoading();
    
    try {
        const productsJSON = localStorage.getItem('wigProducts');
        if (productsJSON) {
            allProducts = JSON.parse(productsJSON);
            console.log('✅ Loaded products from localStorage:', allProducts.length);
        } else {
            allProducts = [];
            console.log('⚠️ No products found in localStorage');
        }
    } catch (e) {
        console.error('❌ Error loading products:', e);
        allProducts = [];
    }
    
    setTimeout(() => {
        hideLoading();
        displayProducts(getFilteredProducts());
    }, 500); // Simulate loading
}

// Show loading state
function showLoading() {
    const productsContainer = document.getElementById('featuredProducts');
    if (productsContainer) {
        productsContainer.innerHTML = `
            <div class="loading-state" style="text-align: center; padding: 60px 20px;">
                <div class="spinner" style="width: 50px; height: 50px; border: 5px solid #f3f3f3; border-top: 5px solid #667eea; border-radius: 50%; margin: 0 auto 20px; animation: spin 1s linear infinite;"></div>
                <p style="color: #666;">Loading products...</p>
            </div>
        `;
    }
}

function hideLoading() {
    // Loading will be replaced by displayProducts
}

// Display products on home page organized by category
function displayProducts(products) {
    const productsContainer = document.getElementById('featuredProducts');
    if (!productsContainer) return;
    
    // Filter only active products
    const activeProducts = products.filter(p => p.active !== false);
    
    if (activeProducts.length === 0) {
        const isAdmin = localStorage.getItem('adminToken');
        productsContainer.innerHTML = `
            <div class="empty-state-home">
                <i class="fas fa-box-open"></i>
                <h3>No Products Available</h3>
                <p>Products will appear here once added by our team.</p>
                ${isAdmin ? `
                    <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap; margin-top: 20px;">
                        <a href="admin-login.html" class="btn" style="padding: 12px 24px; background: #667eea; color: white; border-radius: 8px; text-decoration: none;">
                            <i class="fas fa-user-shield"></i> Go to Admin
                        </a>
                        <button class="btn" onclick="loadSampleProducts()" style="padding: 12px 24px; background: #28a745; color: white; border-radius: 8px; border: none; cursor: pointer;">
                            <i class="fas fa-database"></i> Load Sample Products
                        </button>
                    </div>
                ` : `
                    <p style="margin-top: 20px; color: #888;">
                        <i class="fas fa-info-circle"></i> Please check back later or 
                        <a href="client-login.html?tab=signup" style="color: #667eea;">sign up</a> to be notified when products arrive.
                    </p>
                `}
            </div>
        `;
        return;
    }
    
    // Define product types in order
    const productTypes = [
        { type: 'wig', name: '💇 Wigs & Hair Extensions', color: '#8A2BE2' },
        { type: 'skincare', name: '🧴 Skincare Products', color: '#20B2AA' },
        { type: 'haircare', name: '💆 Haircare Products', color: '#FF69B4' },
        { type: 'fragrance', name: '🌸 Fragrances & Perfumes', color: '#FFA500' },
        { type: 'makeup', name: '💄 Makeup Products', color: '#DC143C' }
    ];
    
    let allHtml = '';
    
    // Loop through each product type
    productTypes.forEach(typeInfo => {
        const typeProducts = activeProducts.filter(p => p.productType === typeInfo.type);
        if (typeProducts.length === 0) return;
        
        allHtml += `
            <div style="margin: 40px 0 20px 0;">
                <h3 style="font-size: 24px; color: ${typeInfo.color}; border-bottom: 3px solid ${typeInfo.color}; padding-bottom: 10px; display: inline-block;">
                    ${typeInfo.name}
                </h3>
                <p style="color: #666; margin-top: 5px;">${typeProducts.length} product(s) available</p>
            </div>
            <div class="products-grid" style="margin-bottom: 40px;">
        `;
        
        typeProducts.forEach(product => {
            allHtml += createProductCard(product);
        });
        
        allHtml += `</div>`;
    });
    
    // Add "Other Products" section
    const otherProducts = activeProducts.filter(p => !p.productType || !productTypes.some(t => t.type === p.productType));
    if (otherProducts.length > 0) {
        allHtml += `
            <div style="margin: 40px 0 20px 0;">
                <h3 style="font-size: 24px; color: #6c757d; border-bottom: 3px solid #6c757d; padding-bottom: 10px; display: inline-block;">
                    📦 Other Products
                </h3>
                <p style="color: #666; margin-top: 5px;">${otherProducts.length} product(s) available</p>
            </div>
            <div class="products-grid" style="margin-bottom: 40px;">
        `;
        
        otherProducts.forEach(product => {
            allHtml += createProductCard(product);
        });
        
        allHtml += `</div>`;
    }
    
    productsContainer.innerHTML = allHtml;
    
    // Add click handlers to product cards
    document.querySelectorAll('.product-card-home').forEach(card => {
        card.addEventListener('click', function(e) {
            if (!e.target.closest('button') && !e.target.closest('a')) {
                const productId = this.getAttribute('data-product-id');
                showProductQuickView(productId);
            }
        });
        card.style.cursor = 'pointer';
    });
}

// Create product card HTML
function createProductCard(product) {
    const stockBadge = getStockBadge(product.stock);
    const isOutOfStock = product.stock <= 0;
    const typeColor = getProductTypeColor(product.productType);
    const typeIcon = getProductTypeIcon(product.productType);
    
    return `
        <div class="product-card-home" data-product-id="${product.id}">
            <div class="product-image-home">
                <img src="${product.image || 'https://via.placeholder.com/400x400?text=Product'}" 
                     alt="${product.name}"
                     loading="lazy"
                     onerror="this.src='https://via.placeholder.com/400x400?text=Image+Not+Found'">
                <span class="product-type-badge" style="background: ${typeColor}">
                    ${typeIcon} ${product.productType || 'product'}
                </span>
                <span class="stock-badge-home ${stockBadge.class}">
                    ${stockBadge.text}
                </span>
            </div>
            <div class="product-info-home">
                <h3>${product.name}</h3>
                <div class="product-meta-home">
                    <span class="product-category-home">${product.category || 'Uncategorized'}</span>
                    ${product.length && product.productType === 'wig' ? `<span class="product-length-home">${product.length}</span>` : ''}
                </div>
                <div class="product-price-home">$${product.price.toFixed(2)}</div>
                <p class="product-description-short">
                    ${product.description ? (product.description.length > 50 ? product.description.substring(0, 47) + '...' : product.description) : 'Quality product'}
                </p>
                ${product.productLink ? `
                    <a href="${product.productLink}" target="_blank" class="product-link" onclick="event.stopPropagation()">
                        <i class="fas fa-link"></i> View Original
                    </a>
                ` : ''}
                <div class="product-actions-home">
                    <button class="btn-details-home" onclick="event.stopPropagation(); showProductQuickView(${product.id})">
                        <i class="fas fa-info-circle"></i> Details
                    </button>
                    <button class="btn-buy-home ${isOutOfStock ? 'out-of-stock' : ''}" 
                            onclick="event.stopPropagation(); buyNow(${product.id})" 
                            ${isOutOfStock ? 'disabled' : ''}>
                        <i class="fas fa-shopping-cart"></i> Buy
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Show product quick view modal
function showProductQuickView(productId) {
    const product = allProducts.find(p => p.id == productId);
    if (!product) return;
    
    const isLoggedIn = localStorage.getItem('clientToken') !== null;
    const isInWishlist = isLoggedIn ? checkWishlist(productId) : false;
    const typeColor = getProductTypeColor(product.productType);
    const typeIcon = getProductTypeIcon(product.productType);
    
    // Create modal
    const modalHtml = `
        <div class="modal active" id="quickViewModal">
            <div class="modal-content" style="max-width: 900px;">
                <span class="close-modal" onclick="closeQuickViewModal()">&times;</span>
                <div class="modal-body">
                    <div style="display: flex; gap: 30px; flex-wrap: wrap;">
                        <div style="flex: 1; min-width: 300px;">
                            <img src="${product.image || 'https://via.placeholder.com/400x400?text=Product'}" 
                                 alt="${product.name}" 
                                 style="width: 100%; border-radius: 10px; max-height: 400px; object-fit: cover;"
                                 onerror="this.src='https://via.placeholder.com/400x400?text=Image+Not+Found'">
                        </div>
                        <div style="flex: 2; min-width: 300px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                                <h2 style="margin:0;">${product.name}</h2>
                                <span style="background: ${typeColor}; color: white; padding: 5px 12px; border-radius: 20px; font-size: 14px;">
                                    ${typeIcon} ${product.productType || 'product'}
                                </span>
                            </div>
                            <div style="display: flex; gap: 10px; margin-bottom: 15px; flex-wrap: wrap;">
                                <span class="product-category">${product.category}</span>
                                ${product.length ? `<span class="product-length">${product.length}</span>` : ''}
                                <span style="padding: 4px 10px; border-radius: 15px; background: #e9ecef; color: #495057; font-size: 13px;">
                                    ${product.color || 'Various Colors'}
                                </span>
                            </div>
                            <div style="font-size: 28px; font-weight: bold; color: #2ecc71; margin-bottom: 20px;">
                                $${product.price.toFixed(2)}
                            </div>
                            <div style="margin-bottom: 20px;">
                                <h4>Description</h4>
                                <p style="line-height: 1.6;">${product.description || 'No description available.'}</p>
                            </div>
                            <div style="margin-bottom: 20px;">
                                <h4>Details</h4>
                                <p><strong>Stock:</strong> ${product.stock > 0 ? 
                                    `<span style="color: #28a745;">${product.stock} units available</span>` : 
                                    '<span style="color: #dc3545;">Out of Stock</span>'}</p>
                                ${product.productLink ? `
                                    <p><strong>Original Product:</strong> <a href="${product.productLink}" target="_blank">View Source</a></p>
                                ` : ''}
                            </div>
                            <div style="display: flex; gap: 15px; margin-top: 30px; flex-wrap: wrap;">
                                ${product.stock > 0 ? 
                                    `<button class="btn btn-primary" onclick="buyNow(${product.id}); closeQuickViewModal()" style="padding: 12px 24px;">
                                        <i class="fas fa-shopping-cart"></i> Buy Now
                                    </button>` :
                                    `<button class="btn" disabled style="background: #ccc; padding: 12px 24px;">
                                        <i class="fas fa-times"></i> Out of Stock
                                    </button>
                                `}
                                ${isLoggedIn ? `
                                    <button class="btn" onclick="toggleWishlistFromHome(${product.id}); closeQuickViewModal()" 
                                            style="padding: 12px 24px; background: ${isInWishlist ? '#dc3545' : '#6c757d'}; color: white;">
                                        <i class="fas fa-heart"></i> ${isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                                    </button>
                                ` : `
                                    <a href="client-login.html?tab=signup&product=${product.id}" class="btn" 
                                       style="padding: 12px 24px; background: #6c757d; color: white; text-decoration: none;">
                                        <i class="fas fa-heart"></i> Sign Up to Save
                                    </a>
                                `}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Add ESC key to close
    document.addEventListener('keydown', function escHandler(e) {
        if (e.key === 'Escape') {
            closeQuickViewModal();
            document.removeEventListener('keydown', escHandler);
        }
    });
}

// Close quick view modal
function closeQuickViewModal() {
    const modal = document.getElementById('quickViewModal');
    if (modal) modal.remove();
}

// Check if product is in wishlist
function checkWishlist(productId) {
    try {
        const clientUser = JSON.parse(localStorage.getItem('clientUser') || '{}');
        const wishlistKey = `wishlist_${clientUser.email || 'guest'}`;
        const wishlist = JSON.parse(localStorage.getItem(wishlistKey) || '[]');
        return wishlist.some(item => item.id == productId);
    } catch (e) {
        return false;
    }
}

// Toggle wishlist from home page
function toggleWishlistFromHome(productId) {
    const clientToken = localStorage.getItem('clientToken');
    if (!clientToken) {
        if (confirm('You need to sign up to use wishlist. Would you like to sign up now?')) {
            sessionStorage.setItem('selectedProductId', productId);
            window.location.href = 'client-login.html?tab=signup&product=' + productId;
        }
        return;
    }
    
    const product = allProducts.find(p => p.id == productId);
    if (!product) return;
    
    const clientUser = JSON.parse(localStorage.getItem('clientUser') || '{}');
    const wishlistKey = `wishlist_${clientUser.email}`;
    let wishlist = JSON.parse(localStorage.getItem(wishlistKey) || '[]');
    
    const existingIndex = wishlist.findIndex(item => item.id == productId);
    
    if (existingIndex !== -1) {
        wishlist.splice(existingIndex, 1);
        showNotification(`${product.name} removed from wishlist`, 'info');
    } else {
        wishlist.push({
            ...product,
            addedAt: new Date().toISOString()
        });
        showNotification(`${product.name} added to wishlist! <a href="client.html#wishlist" style="color: white; text-decoration: underline;">View Wishlist</a>`, 'success');
    }
    
    localStorage.setItem(wishlistKey, JSON.stringify(wishlist));
}

// Get filtered products based on current filters
function getFilteredProducts() {
    let products = allProducts.filter(p => p.active !== false);
    
    // Filter by search term
    const searchTerm = document.getElementById('homeSearchInput')?.value.toLowerCase() || '';
    if (searchTerm) {
        products = products.filter(p => 
            (p.name && p.name.toLowerCase().includes(searchTerm)) ||
            (p.description && p.description.toLowerCase().includes(searchTerm)) ||
            (p.category && p.category.toLowerCase().includes(searchTerm))
        );
    }
    
    // Filter by category
    const category = document.getElementById('homeCategoryFilter')?.value || '';
    if (category) {
        products = products.filter(p => p.category === category);
    }
    
    return products;
}

// Filter products on home page
function filterHomeProducts() {
    displayProducts(getFilteredProducts());
}

// Helper functions
function getProductTypeColor(type) {
    const colors = {
        'wig': '#8A2BE2',
        'skincare': '#20B2AA',
        'haircare': '#FF69B4',
        'fragrance': '#FFA500',
        'makeup': '#DC143C'
    };
    return colors[type] || '#6c757d';
}

function getProductTypeIcon(type) {
    const icons = {
        'wig': '💇',
        'skincare': '🧴',
        'haircare': '💆',
        'fragrance': '🌸',
        'makeup': '💄'
    };
    return icons[type] || '📦';
}

function getStockBadge(stock) {
    if (stock <= 0) {
        return { class: 'out-of-stock-badge', text: 'Out of Stock' };
    } else if (stock < 5) {
        return { class: 'low-stock', text: `Low Stock (${stock})` };
    } else {
        return { class: 'in-stock', text: 'In Stock' };
    }
}

// Setup event listeners
function setupEventListeners() {
    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        if (anchor.getAttribute('href') !== '#') {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            });
        }
    });
    
    // Search input event
    const searchInput = document.getElementById('homeSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            filterHomeProducts();
        });
    }
    
    // Category filter event
    const categoryFilter = document.getElementById('homeCategoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            filterHomeProducts();
        });
    }
    
    // Initialize category filter value
    if (categoryFilter) {
        categoryFilter.onchange = filterHomeProducts;
    }
}

// Setup loading states
function setupLoadingStates() {
    // Add spinner animation if not exists
    if (!document.getElementById('spinnerStyles')) {
        const style = document.createElement('style');
        style.id = 'spinnerStyles';
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
}

// Setup scroll to top functionality
function setupScrollToTop() {
    const scrollTopBtn = document.getElementById('scrollTop');
    if (scrollTopBtn) {
        scrollTopBtn.onclick = scrollToTop;
    }
    
    window.addEventListener('scroll', function() {
        const scrollTopBtn = document.getElementById('scrollTop');
        if (scrollTopBtn) {
            if (window.pageYOffset > 300) {
                scrollTopBtn.classList.add('visible');
            } else {
                scrollTopBtn.classList.remove('visible');
            }
        }
    });
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Buy now function with guest checkout option
function buyNow(productId) {
    const product = allProducts.find(p => p.id == productId);
    if (!product) return;
    
    if (product.stock <= 0) {
        showNotification('This product is out of stock!', 'error');
        return;
    }
    
    // Check if user is logged in
    const clientToken = localStorage.getItem('clientToken');
    
    if (clientToken) {
        // User is logged in - add to cart and go to cart
        addToCartLoggedIn(productId);
        showNotification(`${product.name} added to cart! <a href="client.html#cart" style="color: white; text-decoration: underline;">View Cart</a>`, 'success');
    } else {
        // Show checkout options
        const checkoutOptions = document.createElement('div');
        checkoutOptions.className = 'modal active';
        checkoutOptions.id = 'checkoutOptionsModal';
        checkoutOptions.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <span class="close-modal" onclick="closeCheckoutOptions()">&times;</span>
                <div class="modal-body" style="text-align: center;">
                    <i class="fas fa-shopping-cart" style="font-size: 60px; color: #667eea; margin-bottom: 20px;"></i>
                    <h2 style="margin-bottom: 20px;">Complete Your Purchase</h2>
                    <p style="margin-bottom: 30px; color: #666;">Choose how you'd like to proceed:</p>
                    
                    <div style="display: flex; flex-direction: column; gap: 15px;">
                        <button class="btn btn-primary" onclick="proceedToCheckout('guest', ${productId})" style="padding: 15px;">
                            <i class="fas fa-user"></i> Continue as Guest
                        </button>
                        <button class="btn btn-secondary" onclick="proceedToCheckout('signup', ${productId})" style="padding: 15px;">
                            <i class="fas fa-user-plus"></i> Sign Up (Save Cart & Track Order)
                        </button>
                        <button class="btn" onclick="proceedToCheckout('login', ${productId})" style="padding: 15px; background: #6c757d; color: white;">
                            <i class="fas fa-sign-in-alt"></i> Login (Existing Account)
                        </button>
                    </div>
                    
                    <p style="margin-top: 20px; font-size: 12px; color: #999;">
                        <i class="fas fa-info-circle"></i> Guest checkout won't allow order tracking or wishlist
                    </p>
                </div>
            </div>
        `;
        
        document.body.appendChild(checkoutOptions);
    }
}

function closeCheckoutOptions() {
    const modal = document.getElementById('checkoutOptionsModal');
    if (modal) modal.remove();
}

function proceedToCheckout(type, productId) {
    closeCheckoutOptions();
    
    switch(type) {
        case 'guest':
            sessionStorage.setItem('guestCheckout', 'true');
            sessionStorage.setItem('guestProductId', productId);
            window.location.href = 'guest-checkout.html';
            break;
        case 'signup':
            sessionStorage.setItem('selectedProductId', productId);
            window.location.href = 'client-login.html?tab=signup&product=' + productId;
            break;
        case 'login':
            sessionStorage.setItem('selectedProductId', productId);
            window.location.href = 'client-login.html?tab=login&product=' + productId;
            break;
    }
}

// Add to cart for logged in users
function addToCartLoggedIn(productId) {
    const product = allProducts.find(p => p.id == productId);
    if (!product) return;
    
    const clientUser = JSON.parse(localStorage.getItem('clientUser') || '{}');
    const cartKey = `cart_${clientUser.email}`;
    let cart = JSON.parse(localStorage.getItem(cartKey) || '[]');
    
    const existingItem = cart.find(item => item.id == productId);
    
    if (existingItem) {
        if (existingItem.quantity >= product.stock) {
            showNotification(`Only ${product.stock} units available!`, 'error');
            return;
        }
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    localStorage.setItem(cartKey, JSON.stringify(cart));
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    const bgColor = type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8';
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 10px;
        max-width: 400px;
        animation: slideIn 0.3s ease;
    `;
    
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100px)';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Load sample products
function loadSampleProducts() {
    const sampleProducts = [
        {
            id: Date.now(),
            name: "Brazilian Straight Wig",
            category: "Brazilian",
            price: 89.99,
            stock: 15,
            description: "Premium Brazilian straight hair wig with natural look and feel. 100% human hair, can be styled with heat.",
            length: "22-24 inches",
            color: "Natural Black",
            image: "https://images.unsplash.com/photo-1522338242990-8c5a7f015b8d?w=400&h=400&fit=crop",
            active: true,
            productType: "wig",
            createdAt: new Date().toISOString()
        },
        {
            id: Date.now() + 1,
            name: "Peruvian Curly Wig",
            category: "Peruvian",
            price: 109.99,
            stock: 8,
            description: "Luxurious Peruvian curly wig with voluminous curls. Lightweight and comfortable.",
            length: "20-22 inches",
            color: "Dark Brown",
            image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=400&fit=crop",
            active: true,
            productType: "wig",
            createdAt: new Date().toISOString()
        },
        {
            id: Date.now() + 2,
            name: "Hydrating Face Serum",
            category: "Skincare",
            price: 34.99,
            stock: 25,
            description: "Deep hydrating serum with hyaluronic acid and vitamin C for radiant skin.",
            image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop",
            active: true,
            productType: "skincare",
            createdAt: new Date().toISOString()
        },
        {
            id: Date.now() + 3,
            name: "Rose Perfume",
            category: "Fragrance",
            price: 59.99,
            stock: 10,
            description: "Elegant rose fragrance with long-lasting scent.",
            image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=400&h=400&fit=crop",
            active: true,
            productType: "fragrance",
            createdAt: new Date().toISOString()
        }
    ];

    localStorage.setItem('wigProducts', JSON.stringify(sampleProducts));
    console.log('✅ Sample products loaded:', sampleProducts.length);
    
    setTimeout(loadFeaturedProducts, 100);
    showNotification('Sample products loaded successfully!', 'success');
}

// ===== HERO CAROUSEL FUNCTIONS =====
let currentSlide = 0;
let slideInterval;
let heroImages = [];

// Initialize carousel
function initHeroCarousel() {
    heroImages = JSON.parse(localStorage.getItem('wigHeroImages') || '[]');
    heroImages = heroImages.filter(img => img.status === 'active');
    heroImages.sort((a, b) => a.order - b.order);
    
    if (heroImages.length === 0) {
        heroImages = [
            {
                image: 'https://images.unsplash.com/photo-1522338242990-8c5a7f015b8d?w=1920&h=800&fit=crop',
                title: 'Find Your Perfect Wig',
                subtitle: 'Premium quality wigs at affordable prices'
            },
            {
                image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1920&h=800&fit=crop',
                title: 'Luxurious Curly Wigs',
                subtitle: 'Peruvian, Brazilian, and Malaysian collections'
            },
            {
                image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1920&h=800&fit=crop',
                title: 'Natural Looking Wigs',
                subtitle: 'Handmade with premium human hair'
            }
        ];
    }
    
    createCarouselSlides();
    startSlideShow();
}

function createCarouselSlides() {
    const slidesContainer = document.getElementById('heroSlides');
    const dotsContainer = document.getElementById('carouselDots');
    
    if (!slidesContainer) return;
    
    let slidesHtml = '';
    let dotsHtml = '';
    
    heroImages.forEach((img, index) => {
        slidesHtml += `
            <div class="carousel-slide ${index === 0 ? 'active' : ''}" style="background-image: url('${img.image}')">
                <div class="slide-content">
                    <h1>${img.title || 'Find Your Perfect Wig'}</h1>
                    <p>${img.subtitle || 'Premium quality wigs at affordable prices'}</p>
                    <a href="client-login.html?tab=signup" class="cta-button">Start Shopping</a>
                </div>
            </div>
        `;
        
        dotsHtml += `<span class="dot ${index === 0 ? 'active' : ''}" onclick="goToSlide(${index})"></span>`;
    });
    
    slidesContainer.innerHTML = slidesHtml;
    if (dotsContainer) {
        dotsContainer.innerHTML = dotsHtml;
    }
}

function changeSlide(direction) {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.dot');
    
    if (slides.length === 0) return;
    
    slides[currentSlide].classList.remove('active');
    if (dots.length > 0) dots[currentSlide].classList.remove('active');
    
    currentSlide = (currentSlide + direction + slides.length) % slides.length;
    
    slides[currentSlide].classList.add('active');
    if (dots.length > 0) dots[currentSlide].classList.add('active');
    
    resetSlideInterval();
}

function goToSlide(index) {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.dot');
    
    if (slides.length === 0 || index === currentSlide) return;
    
    slides[currentSlide].classList.remove('active');
    if (dots.length > 0) dots[currentSlide].classList.remove('active');
    
    currentSlide = index;
    
    slides[currentSlide].classList.add('active');
    if (dots.length > 0) dots[currentSlide].classList.add('active');
    
    resetSlideInterval();
}

function startSlideShow() {
    // Clear any existing interval
    if (slideInterval) clearInterval(slideInterval);
    
    slideInterval = setInterval(() => {
        changeSlide(1);
    }, 7000); // 7 seconds
}

function resetSlideInterval() {
    clearInterval(slideInterval);
    startSlideShow();
}

// Make functions globally available
window.changeSlide = changeSlide;
window.goToSlide = goToSlide;
window.showProductQuickView = showProductQuickView;
window.closeQuickViewModal = closeQuickViewModal;
window.buyNow = buyNow;
window.loadSampleProducts = loadSampleProducts;
window.filterHomeProducts = filterHomeProducts;
window.scrollToTop = scrollToTop;
// ===== CART FUNCTIONS FOR GUEST CHECKOUT =====

// Guest cart key
const GUEST_CART_KEY = 'guestCart';

// View cart function
window.viewCart = function() {
    displayCartModal();
};

// Close cart modal
window.closeCartModal = function() {
    const modal = document.getElementById('cartModal');
    if (modal) {
        modal.classList.remove('active');
    }
};

// Display cart modal with items
function displayCartModal() {
    const modal = document.getElementById('cartModal');
    const cartBody = document.getElementById('cartModalBody');
    const cartFooter = document.getElementById('cartModalFooter');
    const cartBadge = document.getElementById('cartBadge');
    
    // Get guest cart
    let guestCart = JSON.parse(localStorage.getItem(GUEST_CART_KEY) || '[]');
    
    if (guestCart.length === 0) {
        cartBody.innerHTML = `
            <div class="empty-cart-message">
                <i class="fas fa-shopping-basket"></i>
                <p>Your cart is empty</p>
                <button onclick="closeCartModal()" class="btn-continue">Continue Shopping</button>
            </div>
        `;
        cartFooter.style.display = 'none';
        if (cartBadge) cartBadge.style.display = 'none';
    } else {
        let cartHtml = '';
        let total = 0;
        
        guestCart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            cartHtml += `
                <div class="cart-item" data-index="${index}">
                    <img src="${item.image || 'https://via.placeholder.com/70x70?text=Product'}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/70x70?text=Product'">
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                        <div class="cart-item-quantity">
                            <button class="quantity-btn" onclick="updateCartQuantity(${index}, -1)">-</button>
                            <span class="quantity-value">${item.quantity}</span>
                            <button class="quantity-btn" onclick="updateCartQuantity(${index}, 1)">+</button>
                        </div>
                    </div>
                    <span class="remove-item" onclick="removeFromCart(${index})">
                        <i class="fas fa-trash"></i>
                    </span>
                </div>
            `;
        });
        
        cartBody.innerHTML = cartHtml;
        document.getElementById('cartTotal').textContent = `$${total.toFixed(2)}`;
        cartFooter.style.display = 'block';
        
        // Update badge
        updateCartBadge(guestCart.reduce((sum, item) => sum + item.quantity, 0));
    }
    
    modal.classList.add('active');
}

// Update cart quantity
window.updateCartQuantity = function(index, change) {
    let guestCart = JSON.parse(localStorage.getItem(GUEST_CART_KEY) || '[]');
    
    if (index >= 0 && index < guestCart.length) {
        guestCart[index].quantity += change;
        
        if (guestCart[index].quantity <= 0) {
            guestCart.splice(index, 1);
        }
        
        localStorage.setItem(GUEST_CART_KEY, JSON.stringify(guestCart));
        displayCartModal();
        updateCartBadge(guestCart.reduce((sum, item) => sum + item.quantity, 0));
    }
};

// Remove from cart
window.removeFromCart = function(index) {
    let guestCart = JSON.parse(localStorage.getItem(GUEST_CART_KEY) || '[]');
    
    if (index >= 0 && index < guestCart.length) {
        guestCart.splice(index, 1);
        localStorage.setItem(GUEST_CART_KEY, JSON.stringify(guestCart));
        displayCartModal();
        updateCartBadge(guestCart.reduce((sum, item) => sum + item.quantity, 0));
    }
};

// Proceed to guest checkout
window.proceedToGuestCheckout = function() {
    const guestCart = JSON.parse(localStorage.getItem(GUEST_CART_KEY) || '[]');
    
    if (guestCart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    // Store cart items for checkout
    sessionStorage.setItem('guestCheckoutCart', JSON.stringify(guestCart));
    sessionStorage.setItem('guestCheckout', 'true');
    
    // Close modal and redirect
    closeCartModal();
    window.location.href = 'guest-checkout.html';
};

// Update cart badge
function updateCartBadge(count) {
    const badge = document.getElementById('cartBadge');
    if (badge) {
        if (count > 0) {
            badge.textContent = count;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }
}

// Modified buy now function for guest
window.buyNow = function(productId) {
    const product = allProducts.find(p => p.id == productId);
    if (!product) return;
    
    if (product.stock <= 0) {
        showNotification('This product is out of stock!', 'error');
        return;
    }
    
    // Check if user is logged in
    const clientToken = localStorage.getItem('clientToken');
    
    if (clientToken) {
        // User is logged in - add to user's cart
        addToCartLoggedIn(productId);
        showNotification(`${product.name} added to cart!`, 'success');
    } else {
        // Guest user - add to guest cart
        addToGuestCart(product);
        showNotification(`${product.name} added to cart! <span onclick="viewCart()" style="color: white; text-decoration: underline; cursor: pointer;">View Cart</span>`, 'success');
    }
};

// Add to guest cart
function addToGuestCart(product) {
    let guestCart = JSON.parse(localStorage.getItem(GUEST_CART_KEY) || '[]');
    
    const existingItem = guestCart.find(item => item.id == product.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        guestCart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }
    
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(guestCart));
    
    // Update cart badge
    const totalItems = guestCart.reduce((sum, item) => sum + item.quantity, 0);
    updateCartBadge(totalItems);
}

// Initialize cart badge on page load
document.addEventListener('DOMContentLoaded', function() {
    // ... existing code ...
    
    // Initialize cart badge
    const guestCart = JSON.parse(localStorage.getItem(GUEST_CART_KEY) || '[]');
    const totalItems = guestCart.reduce((sum, item) => sum + item.quantity, 0);
    updateCartBadge(totalItems);
});