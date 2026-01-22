// Main JavaScript for WigHub Home Page

// Global variables
let allProducts = [];
let filteredProducts = [];

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('WigHub Home Page Initializing...');
    loadFeaturedProducts();
    setupEventListeners();
    setupScrollToTop();
    
    // Auto-refresh products every 5 seconds (optional)
    setInterval(loadFeaturedProducts, 5000);
});

// Load featured products
function loadFeaturedProducts() {
    console.log('Loading products for home page...');
    
    // Try to load products from localStorage
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
    
    // Filter only active products
    const activeProducts = allProducts.filter(product => product.active !== false);
    filteredProducts = [...activeProducts];
    
    displayProducts(activeProducts);
}

// Display products on home page
function displayProducts(products) {
    const productsGrid = document.getElementById('featuredProducts');
    if (!productsGrid) return;
    
    if (products.length === 0) {
        // Show message and button to go to admin
        
    
    let html = '';
    products.forEach(product => {
        const stockBadge = getStockBadge(product.stock);
        const isOutOfStock = product.stock <= 0;
        
        html += `
            <div class="product-card-home" onclick="redirectToClientAuth(${product.id})" title="Click to buy ${product.name}">
                <div class="product-image-home">
                    <img src="${product.image || 'https://via.placeholder.com/400x400?text=Wig+Image'}" 
                         alt="${product.name}"
                         loading="lazy">
                    <span class="stock-badge-home ${stockBadge.class}">${stockBadge.text}</span>
                </div>
                <div class="product-info-home">
                    <h3>${product.name}</h3>
                    <div class="product-meta-home">
                        <span class="product-category-home">${product.category}</span>
                        <span class="product-length-home">${product.length || 'N/A'}</span>
                    </div>
                    <div class="product-price-home">$${product.price.toFixed(2)}</div>
                    <p style="font-size: 14px; color: #666; margin-bottom: 15px; line-height: 1.4; height: 40px; overflow: hidden;">
                        ${product.description || 'Premium quality wig'}
                    </p>
                    <button class="product-action-home ${isOutOfStock ? 'out-of-stock' : ''}" onclick="event.stopPropagation(); redirectToClientAuth(${product.id})">
                        <i class="fas fa-shopping-cart"></i>
                        ${isOutOfStock ? 'Out of Stock' : 'Buy Now'}
                    </button>
                </div>
            </div>
        `;
    });
    
    productsGrid.innerHTML = html;
    
    // Add search and filter info
    if (products.length > 0) {
        const searchBox = document.getElementById('homeSearchInput');
        const categoryFilter = document.getElementById('homeCategoryFilter');
        const searchTerm = searchBox ? searchBox.value.toLowerCase() : '';
        const category = categoryFilter ? categoryFilter.value : '';
        
        let infoText = `Showing ${products.length} product${products.length !== 1 ? 's' : ''}`;
        if (searchTerm || category) {
            infoText += ' (filtered)';
        }
        
        const infoDiv = document.createElement('div');
        infoDiv.style.gridColumn = '1/-1';
        infoDiv.style.textAlign = 'center';
        infoDiv.style.marginTop = '20px';
        infoDiv.style.color = '#666';
        infoDiv.style.fontSize = '14px';
        infoDiv.innerHTML = `
            <p><i class="fas fa-info-circle"></i> ${infoText} • Click any product to buy</p>
        `;
        productsGrid.appendChild(infoDiv);
    }
}

// Get stock badge based on quantity
function getStockBadge(stock) {
    if (stock <= 0) {
        return { class: 'out-of-stock-badge', text: 'Out of Stock' };
    } else if (stock < 5) {
        return { class: 'low-stock', text: `Low Stock (${stock})` };
    } else {
        return { class: 'in-stock', text: 'In Stock' };
    }
}

// Filter products on home page
function filterHomeProducts() {
    const searchTerm = document.getElementById('homeSearchInput').value.toLowerCase();
    const category = document.getElementById('homeCategoryFilter').value;
    
    if (!allProducts || allProducts.length === 0) return;
    
    // Filter based on search and category
    const filteredProducts = allProducts.filter(product => {
        if (product.active === false) return false;
        
        const matchesSearch = !searchTerm || 
            (product.name && product.name.toLowerCase().includes(searchTerm)) ||
            (product.description && product.description.toLowerCase().includes(searchTerm)) ||
            (product.category && product.category.toLowerCase().includes(searchTerm));
        
        const matchesCategory = !category || product.category === category;
        
        return matchesSearch && matchesCategory;
    });
    
    displayProducts(filteredProducts);
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
    
    // Show/hide scroll to top button
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
    
    // Initialize data
    initializeHomePageData();
}

// Initialize data for homepage
function initializeHomePageData() {
    // Initialize products if not exists
    if (!localStorage.getItem('wigProducts')) {
        console.log('No products found, will show empty state');
    }
    
    // Initialize clients if not exists
    if (!localStorage.getItem('wigClients')) {
        localStorage.setItem('wigClients', JSON.stringify([]));
    }
    
    // Initialize admins if not exists
    if (!localStorage.getItem('wigAdmins')) {
        const defaultAdmins = [{
            id: 1,
            name: 'System Administrator',
            email: 'admin@wighub.com',
            password: 'admin123',
            role: 'super_admin',
            createdAt: new Date().toISOString(),
            isDefault: true
        }];
        localStorage.setItem('wigAdmins', JSON.stringify(defaultAdmins));
    }
}

// Setup scroll to top functionality
function setupScrollToTop() {
    const scrollTopBtn = document.getElementById('scrollTop');
    if (scrollTopBtn) {
        scrollTopBtn.onclick = scrollToTop;
    }
}

// Scroll to top function
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Redirect to client login/signup with product ID
function redirectToClientAuth(productId) {
    console.log('Redirecting to client auth for product:', productId);
    
    // Store the product ID to show it after login
    sessionStorage.setItem('selectedProductId', productId);
    sessionStorage.setItem('redirectAfterLogin', 'product');
    
    // Redirect to client login page
    window.location.href = 'client-login.html?tab=signup&product=' + productId;
}

// Load sample products for first-time users
function loadSampleProducts() {
    const sampleProducts = [
        {
            id: Date.now(),
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
            id: Date.now() + 1,
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
            id: Date.now() + 2,
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
            id: Date.now() + 3,
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
        },
        {
            id: Date.now() + 4,
            name: "Indian Remy Hair Wig",
            category: "Indian",
            price: 119.99,
            stock: 6,
            description: "Premium Indian Remy hair with natural shine.",
            length: "26-28 inches",
            color: "Dark Brown",
            image: "https://images.unsplash.com/photo-1581404917879-53e1840bb1d0?w=400&h=400&fit=crop",
            active: true,
            createdAt: new Date().toISOString()
        },
        {
            id: Date.now() + 5,
            name: "Brazilian Curly Wig",
            category: "Brazilian",
            price: 95.99,
            stock: 10,
            description: "Beautiful Brazilian curly wig with defined curls.",
            length: "20-22 inches",
            color: "Natural Black",
            image: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=400&h=400&fit=crop",
            active: true,
            createdAt: new Date().toISOString()
        }
    ];

    localStorage.setItem('wigProducts', JSON.stringify(sampleProducts));
    console.log('✅ Sample products loaded:', sampleProducts.length);
    
    // Reload products after loading samples
    setTimeout(loadFeaturedProducts, 100);
    
    // Show success message
    showNotification('Sample products loaded successfully!', 'success');
}

// Show notification
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

// Check if user is logged in
function checkUserLogin() {
    return localStorage.getItem('clientToken') !== null;
}

// Logout function
function logout() {
    localStorage.removeItem('clientToken');
    localStorage.removeItem('clientUser');
    window.location.href = 'index.html';
}

// Admin login check
function checkAdminLogin() {
    return localStorage.getItem('adminToken') !== null;
}

// Admin logout
function adminLogout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    window.location.href = 'index.html';

}

