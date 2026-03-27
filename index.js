// GLOBAL VARIABLE at top of file
let unsubscribeProducts = null;

// FUNCTION to setup real-time listener
function setupRealTimeProducts() {
    if (!window.db) {
        console.warn('Firestore not available');
        return;
    }
    
    const productsRef = collection(window.db, 'products');
    
    // Remove existing listener
    if (unsubscribeProducts) unsubscribeProducts();
    
    // Set up listener
    unsubscribeProducts = onSnapshot(productsRef, (snapshot) => {
        console.log('🔄 Products updated in Firestore');
        
        const newProducts = [];
        snapshot.forEach(doc => {
            newProducts.push({ id: doc.id, ...doc.data() });
        });
        
        // Update global array
        window.allProducts = newProducts.filter(p => p.active !== false);
        
        // Update localStorage cache
        localStorage.setItem('wigProducts', JSON.stringify(window.allProducts));
        
        // Refresh UI based on current page
        if (typeof loadProductsGrid === 'function') loadProductsGrid();
        if (typeof displayProducts === 'function') displayProducts(window.allProducts);
        if (typeof loadProductsTable === 'function') loadProductsTable();
        
        // Show notification
        showUpdateNotification('Products have been updated!');
        
    }, (error) => {
        console.error('Products listener error:', error);
    });
}

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
    initCartBadge();
    setupRealTimeProducts();

    
    
    
    // Initialize filter on page load
    setTimeout(() => {
        filterHomeProducts();
    }, 500);
});



// Initialize data
function initializeData() {
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
    
    // AUTO-LOAD SAMPLE PRODUCTS IF NONE EXIST
    ensureProductsExist();
}

// Load featured products from Firebase Firestore ONLY - NO localStorage
async function loadFeaturedProducts() {
    console.log('Loading products from Firestore for home page...');
    showLoading();
    
    try {
        // Check if Firestore is available
        if (!window.db) {
            console.error('Firestore not available');
            showErrorMessage('Database connection error. Please refresh the page.');
            return [];
        }
        
        // Query products directly from Firestore
        const productsRef = collection(window.db, 'products');
        const querySnapshot = await getDocs(productsRef);
        
        allProducts = [];
        querySnapshot.forEach(doc => {
            const productData = { 
                id: doc.id, 
                ...doc.data() 
            };
            
            // Ensure all required fields exist
            productData.image = productData.imageUrl || productData.image || 'https://via.placeholder.com/400x400?text=Product';
            productData.active = productData.active !== false;
            productData.stock = productData.stock || 0;
            productData.price = productData.price || 0;
            productData.productType = productData.productType || 'wig';
            
            if (productData.active !== false) {
                allProducts.push(productData);
            }
        });
        
        console.log('✅ Loaded products directly from Firestore:', allProducts.length);
        console.log('Products:', allProducts);
        
        hideLoading();
        
        // Display products
        filterHomeProducts();
        
        return allProducts;
        
    } catch (error) {
        console.error('Firestore error:', error);
        showErrorMessage('Failed to load products. Please check your internet connection.');
        hideLoading();
        return [];
    }
}

// Show error message
function showErrorMessage(message) {
    const productsContainer = document.getElementById('featuredProducts');
    if (productsContainer) {
        productsContainer.innerHTML = `
            <div class="error-state" style="text-align: center; padding: 60px 20px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 60px; color: #dc3545; margin-bottom: 20px;"></i>
                <h3 style="margin-bottom: 10px; color: #dc3545;">Unable to Load Products</h3>
                <p style="color: #666;">${message}</p>
                <button class="btn btn-primary" onclick="location.reload()" style="margin-top: 20px; padding: 12px 24px;">
                    <i class="fas fa-sync-alt"></i> Retry
                </button>
            </div>
        `;
    }
}
// Show loading indicator
function showLoading() {
    const productsContainer = document.getElementById('featuredProducts');
    if (productsContainer) {
        productsContainer.innerHTML = `
            <div class="loading-state" style="text-align: center; padding: 60px 20px;">
                <div class="spinner" style="width: 50px; height: 50px; border: 5px solid #f3f3f3; border-top: 5px solid #667eea; border-radius: 50%; margin: 0 auto 20px; animation: spin 1s linear infinite;"></div>
                <p style="color: #666;">Loading products from store...</p>
            </div>
        `;
    }
}

// Hide loading indicator
function hideLoading() {
    // Loading will be replaced by displayProducts
}

// Get filtered products based on current filters
function getFilteredProducts() {
    let products = allProducts.filter(p => p.active !== false);
    
    // Filter by product type if not 'all'
    if (currentHomeProductType !== 'all') {
        products = products.filter(p => p.productType === currentHomeProductType);
    }
    
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

// Force reload when user returns to tab
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        console.log('Tab visible, checking for updates...');
        
        // Refresh all data
        if (typeof setupRealTimeProducts === 'function') setupRealTimeProducts();
        if (typeof setupRealTimeBraiders === 'function') setupRealTimeBraiders();
        if (typeof setupRealTimeHeroImages === 'function') setupRealTimeHeroImages();
        
        // Force UI refresh
        if (typeof loadProductsGrid === 'function') loadProductsGrid();
        if (typeof loadBraiders === 'function') loadBraiders();
        if (typeof loadHeroImages === 'function') loadHeroImages();
    }
});

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
// AUTO-LOAD SAMPLE PRODUCTS FUNCTION
function ensureProductsExist() {
    const products = localStorage.getItem('wigProducts');
    
    // If no products exist or products array is empty, load sample products
    if (!products || JSON.parse(products).length === 0) {
        console.log('No products found. Auto-loading sample products...');
        loadSampleProducts(true); // true = silent mode (no notification)
    }
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
                        <a href="#" class="btn" style="padding: 12px 24px; background: #667eea; color: white; border-radius: 8px; text-decoration: none;">
                            <i class="fas fa-home"></i> Go to Home
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
    
    // Add click handlers to product cards using event delegation
    attachProductCardEvents();
}
// Attach event handlers to product cards
function attachProductCardEvents() {
    const productsContainer = document.getElementById('featuredProducts');
    if (!productsContainer) return;
    
    // Remove any existing listeners to avoid duplicates
    const newContainer = productsContainer.cloneNode(true);
    productsContainer.parentNode.replaceChild(newContainer, productsContainer);
    
    // Use event delegation for product cards
    newContainer.addEventListener('click', function(e) {
        // Find the closest product card
        const productCard = e.target.closest('.product-card-home');
        if (!productCard) return;
        
        // Check if clicked on a button or link - don't trigger card click
        if (e.target.closest('.btn-details-home') || 
            e.target.closest('.btn-buy-home') || 
            e.target.closest('.product-link')) {
            return;
        }
        
        // Show product details
        e.preventDefault();
        e.stopPropagation();
        const productId = productCard.getAttribute('data-product-id');
        if (productId) {
            showProductQuickView(productId);
        }
    });
    
    console.log('✅ Product card event handlers attached');
}

function createProductCard(product) {
    const stockBadge = getStockBadge(product.stock);
    const isOutOfStock = product.stock <= 0;
    const typeColor = getProductTypeColor(product.productType);
    const typeIcon = getProductTypeIcon(product.productType);
    
    // Use imageUrl or fallback to image
    const imageUrl = product.imageUrl || product.image || 'https://via.placeholder.com/400x400?text=Product';
    
    return `
        <div class="product-card-home" data-product-id="${product.id}" style="cursor: pointer;">
            <div class="product-image-home">
                <img src="${imageUrl}" 
                     alt="${escapeHtml(product.name)}"
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
                <h3>${escapeHtml(product.name)}</h3>
                <div class="product-meta-home">
                    <span class="product-category-home">${escapeHtml(product.category || 'Uncategorized')}</span>
                    ${product.length && product.productType === 'wig' ? `<span class="product-length-home">${escapeHtml(product.length)}</span>` : ''}
                </div>
                <div class="product-price-home">$${(product.price || 0).toFixed(2)}</div>
                <p class="product-description-short">
                    ${product.description ? (product.description.length > 50 ? escapeHtml(product.description.substring(0, 47)) + '...' : escapeHtml(product.description)) : 'Quality product'}
                </p>
                ${product.productLink ? `
                    <a href="${escapeHtml(product.productLink)}" target="_blank" class="product-link" onclick="event.stopPropagation()">
                        <i class="fas fa-link"></i> View Original
                    </a>
                ` : ''}
                <div class="product-actions-home">
                    <button class="btn-details-home" data-details-id="${product.id}" onclick="event.stopPropagation(); showProductQuickView('${product.id}')">
                        <i class="fas fa-info-circle"></i> Details
                    </button>
                    <button class="btn-buy-home ${isOutOfStock ? 'out-of-stock' : ''}" 
                            data-buy-id="${product.id}"
                            onclick="event.stopPropagation(); buyNow('${product.id}')" 
                            ${isOutOfStock ? 'disabled' : ''}>
                        <i class="fas fa-shopping-cart"></i> Buy
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Helper function to escape HTML
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Show product quick view modal
function showProductQuickView(productId) {
    // Find product in allProducts array
    const product = allProducts.find(p => p.id == productId || p.id === String(productId));
    if (!product) {
        console.error('Product not found:', productId);
        return;
    }
    
    const isLoggedIn = localStorage.getItem('clientToken') !== null;
    const isInWishlist = isLoggedIn ? checkWishlist(productId) : false;
    const typeColor = getProductTypeColor(product.productType);
    const typeIcon = getProductTypeIcon(product.productType);
    const imageUrl = product.imageUrl || product.image || 'https://via.placeholder.com/400x400?text=Product';
    
    // Create modal
    const modalHtml = `
        <div class="modal active" id="quickViewModal">
            <div class="modal-content" style="max-width: 900px;">
                <span class="close-modal" onclick="closeQuickViewModal()">&times;</span>
                <div class="modal-body">
                    <div style="display: flex; gap: 30px; flex-wrap: wrap;">
                        <div style="flex: 1; min-width: 300px;">
                            <img src="${imageUrl}" 
                                 alt="${escapeHtml(product.name)}" 
                                 style="width: 100%; border-radius: 10px; max-height: 400px; object-fit: cover;"
                                 onerror="this.src='https://via.placeholder.com/400x400?text=Image+Not+Found'">
                        </div>
                        <div style="flex: 2; min-width: 300px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                                <h2 style="margin:0;">${escapeHtml(product.name)}</h2>
                                <span style="background: ${typeColor}; color: white; padding: 5px 12px; border-radius: 20px; font-size: 14px;">
                                    ${typeIcon} ${product.productType || 'product'}
                                </span>
                            </div>
                            <div style="display: flex; gap: 10px; margin-bottom: 15px; flex-wrap: wrap;">
                                <span class="product-category">${escapeHtml(product.category || 'Uncategorized')}</span>
                                ${product.length ? `<span class="product-length">${escapeHtml(product.length)}</span>` : ''}
                                <span style="padding: 4px 10px; border-radius: 15px; background: #e9ecef; color: #495057; font-size: 13px;">
                                    ${product.color || 'Various Colors'}
                                </span>
                            </div>
                            <div style="font-size: 28px; font-weight: bold; color: #2ecc71; margin-bottom: 20px;">
                                $${(product.price || 0).toFixed(2)}
                            </div>
                            <div style="margin-bottom: 20px;">
                                <h4>Description</h4>
                                <p style="line-height: 1.6;">${escapeHtml(product.description || 'No description available.')}</p>
                            </div>
                            <div style="margin-bottom: 20px;">
                                <h4>Details</h4>
                                <p><strong>Stock:</strong> ${product.stock > 0 ? 
                                    `<span style="color: #28a745;">${product.stock} units available</span>` : 
                                    '<span style="color: #dc3545;">Out of Stock</span>'}</p>
                                ${product.productLink ? `
                                    <p><strong>Original Product:</strong> <a href="${escapeHtml(product.productLink)}" target="_blank">View Source</a></p>
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
    
    // Remove existing modal if any
    const existingModal = document.getElementById('quickViewModal');
    if (existingModal) existingModal.remove();
    
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

// Add this function to index.js
let currentHomeProductType = 'all';

function filterClientProducts(type) {
    currentHomeProductType = type;
    
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
    
    // Filter and display products
    filterHomeProducts();
}

// Update the existing getFilteredProducts function to respect type filter
function getFilteredProducts() {
    let products = allProducts.filter(p => p.active !== false);
    
    // Filter by product type if not 'all'
    if (currentHomeProductType !== 'all') {
        products = products.filter(p => p.productType === currentHomeProductType);
    }
    
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

window.buyNow = function(productId) {
    console.log('buyNow called with productId:', productId);
    console.log('allProducts available:', allProducts.length);
    
    // Convert to string for comparison
    const productIdStr = String(productId);
    const product = allProducts.find(p => String(p.id) === productIdStr);
    console.log('Found product:', product);
    
    if (!product) {
        console.error('Product not found for ID:', productId);
        showNotification('Product not found!', 'error');
        return;
    }
    
    if (product.stock <= 0) {
        showNotification('This product is out of stock!', 'error');
        return;
    }
    
    // Check if user is logged in
    const clientToken = localStorage.getItem('clientToken');
    console.log('Client logged in:', clientToken ? 'Yes' : 'No');
    
    if (clientToken) {
        // User is logged in - add to user's cart
        console.log('Adding to logged in cart');
        addToCartLoggedIn(productId);
        showNotification(`${product.name} added to cart! <a href="client.html#cart" style="color: white; text-decoration: underline;">View Cart</a>`, 'success');
    } else {
        // Guest user - add to guest cart
        console.log('Adding to guest cart');
        const result = addToGuestCart(product);
        console.log('Add to cart result:', result);
        showNotification(`${product.name} added to cart! <span onclick="viewCart()" style="color: white; text-decoration: underline; cursor: pointer;">View Cart</span>`, 'success');
    }
};

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
            return false;
        }
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    localStorage.setItem(cartKey, JSON.stringify(cart));
    
    // Update cart badge for logged in user
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    updateCartBadge(totalItems);
    
    return true;
}

// Update cart badge based on user state
function updateCartBadgeGlobal() {
    const clientToken = localStorage.getItem('clientToken');
    let totalItems = 0;
    
    if (clientToken) {
        // Logged in user
        const clientUser = JSON.parse(localStorage.getItem('clientUser') || '{}');
        const cartKey = `cart_${clientUser.email}`;
        const cart = JSON.parse(localStorage.getItem(cartKey) || '[]');
        totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    } else {
        // Guest user
        const guestCart = JSON.parse(localStorage.getItem(GUEST_CART_KEY) || '[]');
        totalItems = guestCart.reduce((sum, item) => sum + item.quantity, 0);
    }
    
    updateCartBadge(totalItems);
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

// ===== HERO CAROUSEL FUNCTIONS =====
let currentSlide = 0;
let slideInterval;
let heroImages = [];

// Initialize carousel
function initHeroCarousel() {
    // Load images from localStorage
    heroImages = JSON.parse(localStorage.getItem('wigHeroImages') || '[]');
    
    // Filter only active images
    heroImages = heroImages.filter(img => img.status === 'active');
    
    // Sort by order
    heroImages.sort((a, b) => a.order - b.order);
    
    if (heroImages.length === 0) {
        // Use default fallback images
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

// Create carousel slides
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

// Change slide (next/previous)
function changeSlide(direction) {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.dot');
    
    if (slides.length === 0) return;
    
    // Remove active class from current slide
    slides[currentSlide].classList.remove('active');
    if (dots.length > 0) dots[currentSlide].classList.remove('active');
    
    // Calculate new slide index
    currentSlide = (currentSlide + direction + slides.length) % slides.length;
    
    // Add active class to new slide
    slides[currentSlide].classList.add('active');
    if (dots.length > 0) dots[currentSlide].classList.add('active');
    
    // Reset interval
    resetSlideInterval();
}

// Go to specific slide
function goToSlide(index) {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.dot');
    
    if (slides.length === 0 || index === currentSlide) return;
    
    // Remove active class from current slide
    slides[currentSlide].classList.remove('active');
    if (dots.length > 0) dots[currentSlide].classList.remove('active');
    
    // Set new current slide
    currentSlide = index;
    
    // Add active class to new slide
    slides[currentSlide].classList.add('active');
    if (dots.length > 0) dots[currentSlide].classList.add('active');
    
    // Reset interval
    resetSlideInterval();
}

// Start automatic slideshow
function startSlideShow() {
    slideInterval = setInterval(() => {
        changeSlide(1);
    }, 3000); // Change every 3 seconds
}

// Reset interval (call when manually changing slides)
function resetSlideInterval() {
    clearInterval(slideInterval);
    startSlideShow();
}

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
    
    // Check if user is logged in
    const clientToken = localStorage.getItem('clientToken');
    let cartItems = [];
    
    if (clientToken) {
        // Logged in user
        const clientUser = JSON.parse(localStorage.getItem('clientUser') || '{}');
        const cartKey = `cart_${clientUser.email}`;
        cartItems = JSON.parse(localStorage.getItem(cartKey) || '[]');
    } else {
        // Guest user
        cartItems = JSON.parse(localStorage.getItem(GUEST_CART_KEY) || '[]');
    }
    
    if (cartItems.length === 0) {
        cartBody.innerHTML = `
            <div class="empty-cart-message">
                <i class="fas fa-shopping-basket"></i>
                <p>Your cart is empty</p>
                <button onclick="closeCartModal()" class="btn-continue">Continue Shopping</button>
            </div>
        `;
        cartFooter.style.display = 'none';
        updateCartBadge(0);
    } else {
        let cartHtml = '';
        let total = 0;
        
        cartItems.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            cartHtml += `
                <div class="cart-item" data-index="${index}">
                    <img src="${item.image || 'https://via.placeholder.com/70x70?text=Product'}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/70x70?text=Product'">
                    <div class="cart-item-details">
                        <h4>${escapeHtml(item.name)}</h4>
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
        const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        updateCartBadge(totalItems);
    }
    
    modal.classList.add('active');
}

// Update cart quantity
window.updateCartQuantity = function(index, change) {
    const clientToken = localStorage.getItem('clientToken');
    let cartItems = [];
    let storageKey = GUEST_CART_KEY;
    
    if (clientToken) {
        const clientUser = JSON.parse(localStorage.getItem('clientUser') || '{}');
        storageKey = `cart_${clientUser.email}`;
    }
    
    cartItems = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    if (index >= 0 && index < cartItems.length) {
        cartItems[index].quantity += change;
        
        if (cartItems[index].quantity <= 0) {
            cartItems.splice(index, 1);
        }
        
        localStorage.setItem(storageKey, JSON.stringify(cartItems));
        displayCartModal();
        
        // Update badge
        const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        updateCartBadge(totalItems);
    }
};

// Remove from cart
window.removeFromCart = function(index) {
    const clientToken = localStorage.getItem('clientToken');
    let cartItems = [];
    let storageKey = GUEST_CART_KEY;
    
    if (clientToken) {
        const clientUser = JSON.parse(localStorage.getItem('clientUser') || '{}');
        storageKey = `cart_${clientUser.email}`;
    }
    
    cartItems = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    if (index >= 0 && index < cartItems.length) {
        cartItems.splice(index, 1);
        localStorage.setItem(storageKey, JSON.stringify(cartItems));
        displayCartModal();
        
        // Update badge
        const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        updateCartBadge(totalItems);
    }
};

// Proceed to checkout
window.proceedToGuestCheckout = function() {
    const clientToken = localStorage.getItem('clientToken');
    let cartItems = [];
    
    if (clientToken) {
        // Logged in user
        const clientUser = JSON.parse(localStorage.getItem('clientUser') || '{}');
        const cartKey = `cart_${clientUser.email}`;
        cartItems = JSON.parse(localStorage.getItem(cartKey) || '[]');
        
        if (cartItems.length === 0) {
            alert('Your cart is empty!');
            return;
        }
        
        // Store cart items for checkout - USE SAME KEY as guest
        sessionStorage.setItem('guestCheckoutCart', JSON.stringify(cartItems));
        sessionStorage.setItem('guestCheckout', 'true');
        sessionStorage.setItem('isLoggedInCheckout', 'true');
        
        closeCartModal();
        window.location.href = 'guest-checkout.html';
    } else {
        // Guest user
        const guestCart = JSON.parse(localStorage.getItem(GUEST_CART_KEY) || '[]');
        
        if (guestCart.length === 0) {
            alert('Your cart is empty!');
            return;
        }
        
        // Store cart items for checkout
        sessionStorage.setItem('guestCheckoutCart', JSON.stringify(guestCart));
        sessionStorage.setItem('guestCheckout', 'true');
        
        closeCartModal();
        window.location.href = 'guest-checkout.html';
    }
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



// Add to guest cart
// Add to guest cart - FIXED VERSION
function addToGuestCart(product) {
    console.log('Adding to guest cart:', product);
    
    let guestCart = JSON.parse(localStorage.getItem(GUEST_CART_KEY) || '[]');
    
    const existingItem = guestCart.find(item => item.id == product.id);
    
    if (existingItem) {
        // Check stock limit
        if (existingItem.quantity >= product.stock) {
            showNotification(`Only ${product.stock} units available!`, 'error');
            return false;
        }
        existingItem.quantity += 1;
        console.log('Updated existing item quantity:', existingItem.quantity);
    } else {
        guestCart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.imageUrl || product.image || 'https://via.placeholder.com/400x400?text=Product',
            quantity: 1,
            stock: product.stock
        });
        console.log('Added new item to cart');
    }
    
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(guestCart));
    
    // Update cart badge
    const totalItems = guestCart.reduce((sum, item) => sum + item.quantity, 0);
    updateCartBadge(totalItems);
    
    console.log('Cart updated, total items:', totalItems);
    console.log('Guest cart contents:', guestCart);
    
    return true;
}

// Initialize cart badge function - FIXED to check both guest and logged in
function initCartBadge() {
    const clientToken = localStorage.getItem('clientToken');
    let totalItems = 0;
    
    if (clientToken) {
        // Logged in user
        const clientUser = JSON.parse(localStorage.getItem('clientUser') || '{}');
        const cartKey = `cart_${clientUser.email}`;
        const cart = JSON.parse(localStorage.getItem(cartKey) || '[]');
        totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    } else {
        // Guest user
        const guestCart = JSON.parse(localStorage.getItem(GUEST_CART_KEY) || '[]');
        totalItems = guestCart.reduce((sum, item) => sum + item.quantity, 0);
    }
    
    updateCartBadge(totalItems);
    console.log('Cart badge initialized with:', totalItems, 'items');
}