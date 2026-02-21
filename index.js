// Main JavaScript for WigHub Home Page

// Global variables
let allProducts = [];
let filteredProducts = [];
let currentProductTypeFilter = 'all';

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('WigHub Home Page Initializing...');
    loadFeaturedProducts();
    setupEventListeners();
    setupScrollToTop();
    initHeroCarousel();
    
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
    
    displayProducts(getFilteredProducts());
}

// Display products on home page organized by category
function displayProducts(products) {
    const productsContainer = document.getElementById('featuredProducts');
    if (!productsContainer) return;
    
    // Filter only active products
    const activeProducts = products.filter(p => p.active !== false);
    
    if (activeProducts.length === 0) {
        productsContainer.innerHTML = `
            <div style="text-align: center; padding: 60px 20px;">
                <i class="fas fa-box-open" style="font-size: 60px; color: #dee2e6; margin-bottom: 20px;"></i>
                <h3 style="margin-bottom: 10px; color: #333;">No Products Available</h3>
                <p style="margin-bottom: 20px; color: #666;">Products will appear here once added by admin.</p>
                <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                    <a href="admin-login.html" class="btn" style="padding: 12px 24px; background: #667eea; color: white; border-radius: 8px; text-decoration: none;">
                        <i class="fas fa-user-shield"></i> Go to Admin
                    </a>
                    <button class="btn" onclick="loadSampleProducts();" style="padding: 12px 24px; background: #28a745; color: white; border-radius: 8px; border: none; cursor: pointer;">
                        <i class="fas fa-database"></i> Load Sample Products
                    </button>
                </div>
            </div>
        `;
        return;
    }
    
    // Define product types in the order you want them to appear
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
        // Filter products for this type
        const typeProducts = activeProducts.filter(p => p.productType === typeInfo.type);
        
        if (typeProducts.length === 0) return; // Skip if no products in this category
        
        // Add section header
        allHtml += `
            <div style="margin: 40px 0 20px 0;">
                <h3 style="font-size: 24px; color: ${typeInfo.color}; border-bottom: 3px solid ${typeInfo.color}; padding-bottom: 10px; display: inline-block;">
                    ${typeInfo.name}
                </h3>
                <p style="color: #666; margin-top: 5px;">${typeProducts.length} product(s) available</p>
            </div>
        `;
        
        // Start products grid for this type
        allHtml += `<div class="products-grid" style="margin-bottom: 40px;">`;
        
        // Add products for this type
        typeProducts.forEach(product => {
            const stockBadge = getStockBadge(product.stock);
            const isOutOfStock = product.stock <= 0;
            
            allHtml += ` 
                <div class="product-card-home" title="Click to view ${product.name} details">
                    <div class="product-image-home">
                        <img src="${product.image || 'https://via.placeholder.com/400x400?text=Product'}" 
                             alt="${product.name}"
                             loading="lazy">
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
                            <a href="${product.productLink}" target="_blank" style="font-size: 11px; color: #3498db; text-decoration: none; margin-bottom: 5px; display: inline-block;">
                                <i class="fas fa-link"></i> View Original
                            </a>
                        ` : ''}
                        <div class="product-actions-home">
                            <button class="btn-details-home" onclick="event.stopPropagation(); viewProductDetails(${product.id})">
                                <i class="fas fa-info-circle"></i> Details
                            </button>
                            <button class="btn-buy-home ${isOutOfStock ? 'out-of-stock' : ''}" onclick="event.stopPropagation(); buyNow(${product.id})" ${isOutOfStock ? 'disabled' : ''}>
                                <i class="fas fa-shopping-cart"></i> Buy
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        // Close products grid
        allHtml += `</div>`;
    });
    
    // Add "Other Products" section for products without a type or with undefined type
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
            const stockBadge = getStockBadge(product.stock);
            const isOutOfStock = product.stock <= 0;
            
            allHtml += ` 
                <div class="product-card-home">
                    <div class="product-image-home">
                        <img src="${product.image || 'https://via.placeholder.com/400x400?text=Product'}" 
                             alt="${product.name}"
                             loading="lazy">
                        <span class="stock-badge-home ${stockBadge.class}">
                            ${stockBadge.text}
                        </span>
                    </div>
                    <div class="product-info-home">
                        <h3>${product.name}</h3>
                        <div class="product-meta-home">
                            <span class="product-category-home">${product.category || 'Uncategorized'}</span>
                        </div>
                        <div class="product-price-home">$${product.price.toFixed(2)}</div>
                        <p class="product-description-short">
                            ${product.description ? (product.description.length > 50 ? product.description.substring(0, 47) + '...' : product.description) : 'Quality product'}
                        </p>
                        <div class="product-actions-home">
                            <button class="btn-details-home" onclick="event.stopPropagation(); viewProductDetails(${product.id})">
                                <i class="fas fa-info-circle"></i> Details
                            </button>
                            <button class="btn-buy-home ${isOutOfStock ? 'out-of-stock' : ''}" onclick="event.stopPropagation(); buyNow(${product.id})" ${isOutOfStock ? 'disabled' : ''}>
                                <i class="fas fa-shopping-cart"></i> Buy
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        allHtml += `</div>`;
    }
    
    productsContainer.innerHTML = allHtml;
}

// Get filtered products based on current filters
function getFilteredProducts() {
    let products = allProducts.filter(p => p.active !== false);
    
    // Filter by product type
    if (currentProductTypeFilter !== 'all') {
        products = products.filter(p => p.productType === currentProductTypeFilter);
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

// Filter products by type
function filterByProductType(type) {
    console.log('Filtering by type:', type);
    currentProductTypeFilter = type;
    
    // Update active tab styling
    document.querySelectorAll('.category-tab').forEach(tab => {
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
    
    // Re-display products with filter
    displayProducts(getFilteredProducts());
}

// Helper functions for colors and icons
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

// Filter products on home page
function filterHomeProducts() {
    displayProducts(getFilteredProducts());
}

// View product details - opens modal (for logged-in users) or redirects to login
function viewProductDetails(productId) {
    console.log('Viewing product details:', productId);
    
    // Check if user is logged in
    const clientToken = localStorage.getItem('clientToken');
    const clientUser = localStorage.getItem('clientUser');
    
    if (clientToken && clientUser) {
        // User is logged in - go directly to client dashboard with product
        sessionStorage.setItem('selectedProductId', productId);
        sessionStorage.setItem('redirectAfterLogin', 'product');
        window.location.href = '#';
    } else {
        // User not logged in - redirect to signup with product
        sessionStorage.setItem('selectedProductId', productId);
        sessionStorage.setItem('redirectAfterLogin', 'product');
        window.location.href = 'client-login.html?tab=signup&product=' + productId;
    }
}

// Buy now - always redirect to signup/login
function buyNow(productId) {
    console.log('Buying product:', productId);
    
    // Store product ID for after login
    sessionStorage.setItem('selectedProductId', productId);
    sessionStorage.setItem('redirectAfterLogin', 'product');
    
    // Redirect to signup page (encourage account creation)
    window.location.href = 'client-login.html?tab=signup&product=' + productId;
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
            productType: "wig",
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
            productType: "wig",
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
            productType: "wig",
            createdAt: new Date().toISOString()
        },
        {
            id: Date.now() + 3,
            name: "Hydrating Face Serum",
            category: "Skincare",
            price: 34.99,
            stock: 25,
            description: "Deep hydrating serum with hyaluronic acid and vitamin C.",
            image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop",
            active: true,
            productType: "skincare",
            createdAt: new Date().toISOString()
        },
        {
            id: Date.now() + 4,
            name: "Moisturizing Shampoo",
            category: "Haircare",
            price: 24.99,
            stock: 30,
            description: "Sulfate-free moisturizing shampoo for all hair types.",
            image: "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=400&h=400&fit=crop",
            active: true,
            productType: "haircare",
            createdAt: new Date().toISOString()
        },
        {
            id: Date.now() + 5,
            name: "Rose Perfume",
            category: "Fragrance",
            price: 59.99,
            stock: 10,
            description: "Elegant rose fragrance with long-lasting scent.",
            image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=400&h=400&fit=crop",
            active: true,
            productType: "fragrance",
            createdAt: new Date().toISOString()
        },
        {
            id: Date.now() + 6,
            name: "Matte Lipstick Set",
            category: "Makeup",
            price: 29.99,
            stock: 20,
            description: "Set of 5 long-lasting matte lipsticks.",
            image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=400&fit=crop",
            active: true,
            productType: "makeup",
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
    }, 2000); // Change every 2 seconds
}

// Reset interval (call when manually changing slides)
function resetSlideInterval() {
    clearInterval(slideInterval);
    startSlideShow();

}
