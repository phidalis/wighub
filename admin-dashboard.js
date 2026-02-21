// Admin Dashboard JavaScript - COMPLETE VERSION WITH SUPPORT SYSTEM
let allProducts = [];
let filteredProducts = [];
let allClients = [];
let allOrders = [];
let uploadedImages = []; // Store uploaded images

// Camera variables
let currentCamera = 'user'; // 'user' for front, 'environment' for rear
let currentStream = null;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin Dashboard Initializing...');
    
    // Check if admin is logged in
    if (!checkAdminLogin()) {
        return;
    }
    
    // Initialize all data
    initializeData();
    
    // Sync client data to ensure consistency
    syncAllClientsData();
    
    // Load all data
    loadProducts();
    loadClients();
    loadOrders();
    
    // Setup event listeners
    setupEventListeners();
    
    // Show dashboard section
    showAdminSection('dashboard');
    
    console.log('Admin Dashboard Ready');
});

// Check admin login
function checkAdminLogin() {
    const adminToken = localStorage.getItem('adminToken');
    const adminUser = localStorage.getItem('adminUser');
    
    if (!adminToken || !adminUser) {
        window.location.href = 'admin-login.html';
        return false;
    }
    
    // Display admin name
    document.getElementById('adminName').textContent = adminUser.split('@')[0];
    return true;
}

// Data Initialization
function initializeData() {
    console.log('Initializing data...');
    
    // Initialize products if not exist
    if (!localStorage.getItem('wigProducts')) {
        console.log('Creating sample products...');
        loadSampleProducts();
    }
    
    // Initialize clients if not exist
    if (!localStorage.getItem('wigClients')) {
        console.log('Creating clients storage...');
        localStorage.setItem('wigClients', JSON.stringify([]));
    }
    
    // Initialize admins if not exist
    if (!localStorage.getItem('wigAdmins')) {
        console.log('Creating default admin...');
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
    
    // Initialize support tickets if not exist
    if (!localStorage.getItem('wigSupportTickets')) {
        console.log('Creating support tickets storage...');
        localStorage.setItem('wigSupportTickets', JSON.stringify([]));
    }
    
    // Initialize store configuration if not exist
    if (!localStorage.getItem('wigStoreConfig')) {
        console.log('Creating store configuration...');
        const storeConfig = {
            taxRate: 8,
            shippingFee: 9.99,
            freeShippingThreshold: 100,
            createdAt: new Date().toISOString()
        };
        localStorage.setItem('wigStoreConfig', JSON.stringify(storeConfig));
    }
    
    // Initialize password reset requests if not exist
    if (!localStorage.getItem('passwordResetRequests')) {
        console.log('Creating password reset requests storage...');
        localStorage.setItem('passwordResetRequests', JSON.stringify([]));
    }
    
    // Initialize orders storage for clients
    const clients = JSON.parse(localStorage.getItem('wigClients') || '[]');
    clients.forEach(client => {
        const ordersKey = `orders_${client.email}`;
        if (!localStorage.getItem(ordersKey)) {
            localStorage.setItem(ordersKey, JSON.stringify([]));
        }
    });
    
    console.log('Data initialization complete');
}

// Setup event listeners
function setupEventListeners() {
    // Image preview
    const imageInput = document.getElementById('productImage');
    if (imageInput) {
        imageInput.addEventListener('input', function() {
            updateImagePreview(this.value);
        });
    }
    
    // Product ID check
    const productIdInput = document.getElementById('productId');
    if (productIdInput) {
        productIdInput.addEventListener('blur', function() {
            checkProductId();
        });
    }
    
    // Initialize image upload if we're on add product page
    if (document.getElementById('dragDropArea')) {
        initImageUpload();
    }
}

// NAVIGATION FUNCTION - This handles tab switching
function showAdminSection(sectionId) {
    console.log('Switching to section:', sectionId);
    
    // Hide all sections
    const sections = document.querySelectorAll('.admin-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all buttons
    const buttons = document.querySelectorAll('.admin-btn');
    buttons.forEach(button => {
        button.classList.remove('active');
    });
    
    // Show the selected section
    const selectedSection = document.getElementById(sectionId + 'Section');
    if (selectedSection) {
        selectedSection.classList.add('active');
    }
    
    // Activate the corresponding button
    const activeButton = document.querySelector(`.admin-btn[onclick*="${sectionId}"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
    
    // Load section data
    switch(sectionId) {
        case 'dashboard':
            updateDashboardStats();
            loadRecentProducts();
            break;
        case 'products':
            loadProductsTable();
            break;
        case 'orders':
            loadOrdersTable();
            break;
        case 'customers':
            loadCustomersTable();
            break;
        case 'addProduct':
            clearProductForm();
            initImageUpload();
            break;
        case 'settings':
            loadSettings();
            break;
        case 'adminManagement':
            loadAdminList();
            break;
        case 'support':
            displayAdminTickets(loadAdminTickets());
            break;
        case 'passwordReset':
            loadResetRequests();
            break;
        case 'unblockDevices':
            loadBlockedDevices();
            break;
    }
}

// Load products from localStorage
function loadProducts() {
    const productsJSON = localStorage.getItem('wigProducts');
    
    if (productsJSON) {
        allProducts = JSON.parse(productsJSON);
        console.log('Loaded products:', allProducts.length);
    } else {
        allProducts = [];
        console.log('No products found, starting fresh');
    }
    
    filteredProducts = [...allProducts];
    return allProducts;
}

// Load clients from localStorage
function loadClients() {
    const clientsJSON = localStorage.getItem('wigClients');
    
    if (clientsJSON) {
        allClients = JSON.parse(clientsJSON);
        console.log('Loaded clients:', allClients.length);
    } else {
        allClients = [];
        console.log('No clients found, starting fresh');
    }
    
    return allClients;
}

// Load orders from localStorage
function loadOrders() {
    allOrders = [];
    
    // Get all keys from localStorage
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('orders_')) {
            const ordersJSON = localStorage.getItem(key);
            if (ordersJSON) {
                const userOrders = JSON.parse(ordersJSON);
                allOrders = allOrders.concat(userOrders);
            }
        }
    }
    
    console.log('Loaded orders:', allOrders.length);
    return allOrders;
}

// Save products to localStorage
function saveProducts() {
    localStorage.setItem('wigProducts', JSON.stringify(allProducts));
    console.log('Products saved:', allProducts.length);
    
    // Update dashboard
    updateDashboardStats();
}

// Save clients to localStorage
function saveClients() {
    localStorage.setItem('wigClients', JSON.stringify(allClients));
    console.log('Clients saved:', allClients.length);
    
    // Update dashboard
    updateDashboardStats();
}

// Update dashboard stats
function updateDashboardStats() {
    // Product count
    document.getElementById('totalProducts').textContent = allProducts.length;
    document.getElementById('dashTotalProducts').textContent = allProducts.length;
    
    // Calculate stock value
    let stockValue = 0;
    allProducts.forEach(product => {
        stockValue += product.price * product.stock;
    });
    document.getElementById('stockValue').textContent = '$' + stockValue.toFixed(2);
    
    // Orders count
    document.getElementById('totalOrders').textContent = allOrders.length;
    document.getElementById('dashTotalOrders').textContent = allOrders.length;
    
    // Calculate total sales
    let totalSales = 0;
    allOrders.forEach(order => {
        totalSales += order.total || 0;
    });
    document.getElementById('dashTotalSales').textContent = '$' + totalSales.toFixed(2);
    
    // Clients count
    document.getElementById('dashTotalUsers').textContent = allClients.length;
}

// ===== ADD PRODUCT FORM ENHANCEMENTS =====

// Check Product ID availability
function checkProductId() {
    const productId = document.getElementById('productId').value.trim();
    const statusSpan = document.getElementById('productIdStatus');
    
    if (!productId) {
        if (statusSpan) statusSpan.style.display = 'none';
        return;
    }
    
    const products = JSON.parse(localStorage.getItem('wigProducts') || '[]');
    const exists = products.some(p => p.id === productId);
    
    if (statusSpan) {
        statusSpan.style.display = 'block';
        if (exists) {
            statusSpan.innerHTML = '<i class="fas fa-exclamation-triangle" style="color: #e74c3c;"></i> ID already exists';
            statusSpan.style.color = '#e74c3c';
        } else {
            statusSpan.innerHTML = '<i class="fas fa-check-circle" style="color: #2ecc71;"></i> ID available';
            statusSpan.style.color = '#2ecc71';
        }
    }
}

// ===== UPDATED ADD PRODUCT FUNCTION =====
function addProduct() {
    // Get form values
    const productId = document.getElementById('productId')?.value.trim() || '';
    const name = document.getElementById('productName').value.trim();
    const category = document.getElementById('productCategory').value;
    const productType = document.getElementById('productType').value; // NEW: Main product type
    const price = parseFloat(document.getElementById('productPrice').value);
    const stock = parseInt(document.getElementById('productStock').value);
    const description = document.getElementById('productDescription').value.trim();
    const length = document.getElementById('productLength').value.trim();
    const color = document.getElementById('productColor').value.trim();
    const image = document.getElementById('productImage').value.trim();
    
    // Validate
    if (!name || !category || !productType || isNaN(price) || isNaN(stock) || !description) {
        alert('Please fill in all required fields (Name, Category, Product Type, Price, Stock, Description)');
        return;
    }
    
    // Check if ID already exists (only if manual ID is provided)
    if (productId) {
        const existingProducts = JSON.parse(localStorage.getItem('wigProducts') || '[]');
        if (existingProducts.some(p => p.id === productId)) {
            alert('Product ID already exists! Please choose a different ID.');
            return;
        }
    }
    
    // Check if image is a data URL (too long for localStorage)
    let finalImage = image || 'https://via.placeholder.com/400x400?text=Product+Image';
    
    // If it's a data URL and too long, compress or convert it
    if (image && image.startsWith('data:image') && image.length > 100000) {
        alert('Image is too large. Please use a smaller image or use image URL instead.');
        return;
    }
    
    // Determine product ID
    let newProductId;
    if (productId) {
        newProductId = productId; // Use manual ID
    } else {
        // Generate auto ID
        newProductId = allProducts.length > 0 ? Math.max(...allProducts.map(p => {
            // Handle both numeric and string IDs
            const id = p.id;
            return typeof id === 'number' ? id : (parseInt(id) || 0);
        })) + 1 : 1;
    }
    
    // Create new product
    const newProduct = {
        id: newProductId,
        name,
        category,
        productType, // NEW: Main product type
        price,
        stock,
        description,
        length: length || 'Not specified',
        color: color || 'Natural',
        image: finalImage,
        productLink: '', // NEW: For affiliate/product links
        active: true,
        createdAt: new Date().toISOString()
    };
    
    // Add to products
    allProducts.push(newProduct);
    saveProducts();
    
    // Clear form
    clearProductForm();
    resetProductFormButtons();
    
    // Show success and switch to products section
    showAdminNotification(`Product "${name}" added successfully! (ID: ${newProductId})`, 'success');
    showAdminSection('products');
}

// ===== UPDATED EDIT PRODUCT FUNCTION =====
function editProduct(productId) {
    const product = allProducts.find(p => p.id == productId);
    if (!product) {
        alert('Product not found!');
        return;
    }
    
    // Fill the form with existing product data
    document.getElementById('productName').value = product.name;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productType').value = product.productType || 'wig'; // NEW
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productStock').value = product.stock;
    document.getElementById('productDescription').value = product.description;
    document.getElementById('productLength').value = product.length || '';
    document.getElementById('productColor').value = product.color || '';
    document.getElementById('productImage').value = product.image || '';
    
    // Show image preview if exists
    if (product.image) {
        updateImagePreview(product.image);
    }
    
    // Change form to edit mode
    const formActions = document.querySelector('#addProductSection .form-actions');
    if (formActions) {
        formActions.innerHTML = `
            <button type="button" class="btn btn-secondary" onclick="cancelEditProduct()">
                Cancel
            </button>
            <button type="button" class="btn btn-danger" onclick="deleteProduct(${product.id})">
                Delete Product
            </button>
            <button type="button" class="btn btn-primary" onclick="updateProduct(${product.id})">
                <i class="fas fa-save"></i> Update Product
            </button>
        `;
    }
    
    // Show add product section
    showAdminSection('addProduct');
    
    // Scroll to top
    window.scrollTo(0, 0);
}

// Cancel edit and reset form
function cancelEditProduct() {
    clearProductForm();
    resetProductFormButtons();
    showAdminSection('products');
}

// Reset product form buttons to default
function resetProductFormButtons() {
    const formActions = document.querySelector('#addProductSection .form-actions');
    if (formActions) {
        formActions.innerHTML = `
            <button type="button" class="btn btn-secondary" onclick="clearProductForm()">
                Clear Form
            </button>
            <button type="button" class="btn btn-primary" onclick="addProduct()">
                <i class="fas fa-plus"></i> Add Product
            </button>
        `;
    }
}

// ===== UPDATED UPDATE PRODUCT FUNCTION =====
function updateProduct(productId) {
    const productIndex = allProducts.findIndex(p => p.id == productId);
    if (productIndex === -1) {
        alert('Product not found!');
        return;
    }
    
    // Get form values
    const name = document.getElementById('productName').value.trim();
    const category = document.getElementById('productCategory').value;
    const productType = document.getElementById('productType').value; // NEW
    const price = parseFloat(document.getElementById('productPrice').value);
    const stock = parseInt(document.getElementById('productStock').value);
    const description = document.getElementById('productDescription').value.trim();
    const length = document.getElementById('productLength').value.trim();
    const color = document.getElementById('productColor').value.trim();
    const image = document.getElementById('productImage').value.trim();
    
    // Validation
    if (!name || !category || !productType || isNaN(price) || isNaN(stock) || !description) {
        alert('Please fill in all required fields with valid data!');
        return;
    }
    
    // Update product (KEEP THE ORIGINAL ID)
    allProducts[productIndex] = {
        ...allProducts[productIndex],
        name,
        category,
        productType, // NEW
        price,
        stock,
        description,
        length: length || allProducts[productIndex].length,
        color: color || allProducts[productIndex].color,
        image: image || allProducts[productIndex].image,
        updatedAt: new Date().toISOString()
    };
    
    // Save to localStorage
    localStorage.setItem('wigProducts', JSON.stringify(allProducts));
    
    // Reset form
    clearProductForm();
    resetProductFormButtons();
    
    // Show success message
    showAdminNotification(`Product "${name}" updated successfully!`, 'success');
    
    // Refresh products table
    loadProductsTable();
    
    // Go back to products section
    showAdminSection('products');
}

// ===== UPDATED LOAD PRODUCTS TABLE FUNCTION =====
function loadProductsTable() {
    const tableBody = document.getElementById('adminProductsTable');
    if (!tableBody) return;
    
    if (filteredProducts.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" class="empty-table">
                    No products found. <button class="btn" onclick="loadSampleProducts()" style="background: #28a745; color: white; padding: 5px 10px; border: none; border-radius: 4px; cursor: pointer;">Load Sample Products</button>
                    or <a href="#" onclick="showAdminSection('addProduct')">Add your first product</a>
                </td>
            </tr>
        `;
        return;
    }
    
    let html = '';
    filteredProducts.forEach(product => {
        // Get product status
        const isActive = product.active !== false;
        const stockStatus = product.stock > 0 ? 
            `<span style="color: #28a745; font-weight: 600;">${product.stock} in stock</span>` : 
            `<span style="color: #dc3545; font-weight: 600;">Out of stock</span>`;
        
        html += `
            <tr>
                <td><strong>${product.id}</strong></td>
                <td>
                    <img src="${product.image || 'https://via.placeholder.com/80x80?text=Product'}" 
                         alt="${product.name}" 
                         style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; cursor: pointer;"
                         onclick="viewProduct(${product.id})">
                </td>
                <td>
                    <strong style="cursor: pointer;" onclick="viewProduct(${product.id})">${product.name}</strong><br>
                    <small style="color: #666;">${product.description.substring(0, 60)}...</small>
                    ${product.productLink ? `<br><small><i class="fas fa-link"></i> <a href="${product.productLink}" target="_blank" style="color: #3498db;">View Original</a></small>` : ''}
                </td>
                <td>
                    <span class="badge" style="background: ${getProductTypeColor(product.productType)}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                        ${getProductTypeIcon(product.productType)} ${product.productType || 'product'}
                    </span>
                </td>
                <td>
                    <span class="badge" style="background: #e9ecef; color: #495057; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                        ${product.category}
                    </span>
                </td>
                <td><strong>$${product.price.toFixed(2)}</strong></td>
                <td>${stockStatus}</td>
                <td>
                    <span class="status-badge ${isActive ? 'status-active' : 'status-inactive'}" 
                          style="padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;
                                 display: inline-block;">
                        ${isActive ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td>
                    <div style="display: flex; gap: 5px;">
                        <button class="action-btn edit" onclick="editProduct('${product.id}')" 
                                title="Edit Product" style="background: #3498db; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer;">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn view" onclick="viewProduct('${product.id}')"
                                title="View Details" style="background: #2ecc71; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer;">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn delete" onclick="deleteProduct('${product.id}')"
                                title="Delete Product" style="background: #e74c3c; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer;">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
}

// Helper function for product type colors
function getProductTypeColor(type) {
    const colors = {
        'wig': '#8A2BE2',
        'skincare': '#20B2AA',
        'haircare': '#FF69B4',
        'fragrance': '#FFA500',
        'makeup': '#DC143C',
        'accessories': '#6A5ACD'
    };
    return colors[type] || '#6c757d';
}

// Helper function for product type icons
function getProductTypeIcon(type) {
    const icons = {
        'wig': '💇',
        'skincare': '🧴',
        'haircare': '💆',
        'fragrance': '🌸',
        'makeup': '💄',
        'accessories': '🕶️'
    };
    return icons[type] || '📦';
}

// Clear product form
function clearProductForm() {
    document.getElementById('productName').value = '';
    document.getElementById('productCategory').value = '';
    document.getElementById('productType').value = 'wig'; // NEW - default
    document.getElementById('productPrice').value = '';
    document.getElementById('productStock').value = '';
    document.getElementById('productDescription').value = '';
    document.getElementById('productLength').value = '';
    document.getElementById('productColor').value = '';
    document.getElementById('productImage').value = '';
    // Clear product ID field if exists
    const productIdField = document.getElementById('productId');
    if (productIdField) productIdField.value = '';
    const productIdStatus = document.getElementById('productIdStatus');
    if (productIdStatus) productIdStatus.style.display = 'none';
    // Clear file input
    if (document.getElementById('imageFileInput')) {
        document.getElementById('imageFileInput').value = '';
    }
    updateImagePreview('');
}

// Delete product
function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }
    
    allProducts = allProducts.filter(p => p.id != productId);
    saveProducts();
    
    alert('Product deleted successfully!');
    showAdminSection('products');
}

// ===== UPDATED LOAD SAMPLE PRODUCTS FUNCTION =====
function loadSampleProducts() {
    const sampleProducts = [
        {
            id: "WIG001",
            name: "Brazilian Straight Wig",
            productType: "wig",
            category: "Brazilian",
            price: 89.99,
            stock: 15,
            description: "Premium Brazilian straight hair wig with natural look and feel.",
            length: "22-24 inches",
            color: "Natural Black",
            image: "https://images.unsplash.com/photo-1522338242990-e923b56a8c8d?w=400&h=400&fit=crop",
            productLink: "https://example.com/brazilian-wig",
            active: true,
            createdAt: new Date().toISOString()
        },
        {
            id: "WIG002",
            name: "Peruvian Curly Wig",
            productType: "wig",
            category: "Peruvian",
            price: 109.99,
            stock: 8,
            description: "Luxurious Peruvian curly wig with voluminous curls.",
            length: "20-22 inches",
            color: "Dark Brown",
            image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=400&fit=crop",
            productLink: "https://example.com/peruvian-wig",
            active: true,
            createdAt: new Date().toISOString()
        },
        {
            id: "SKN001",
            name: "Vitamin C Brightening Serum",
            productType: "skincare",
            category: "Serum",
            price: 34.99,
            stock: 25,
            description: "Brightening vitamin C serum for radiant skin.",
            image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop",
            productLink: "https://example.com/vitamin-c-serum",
            active: true,
            createdAt: new Date().toISOString()
        },
        {
            id: "FRG001",
            name: "Midnight Rose Perfume",
            productType: "fragrance",
            category: "Perfume",
            price: 79.99,
            stock: 12,
            description: "Elegant floral fragrance with hints of rose and vanilla.",
            image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop",
            productLink: "https://example.com/midnight-rose",
            active: true,
            createdAt: new Date().toISOString()
        },
        {
            id: "MUP001",
            name: "Matte Liquid Lipstick",
            productType: "makeup",
            category: "Lipstick",
            price: 19.99,
            stock: 40,
            description: "Long-lasting matte liquid lipstick in classic red.",
            image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=400&fit=crop",
            productLink: "https://example.com/matte-lipstick",
            active: true,
            createdAt: new Date().toISOString()
        },
        {
            id: "HCR001",
            name: "Argan Oil Hair Mask",
            productType: "haircare",
            category: "Treatment",
            price: 24.99,
            stock: 30,
            description: "Deep conditioning hair mask with argan oil for damaged hair.",
            image: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=400&h=400&fit=crop",
            productLink: "https://example.com/argan-oil-mask",
            active: true,
            createdAt: new Date().toISOString()
        }
    ];
    
    allProducts = sampleProducts;
    saveProducts();
    showAdminNotification('✅ Sample products loaded successfully!', 'success');
    showAdminSection('products');
}

// ===== ORDER TRACKING FUNCTIONS =====

// UPDATED Load orders table with tracking
function loadOrdersTable() {
    const tableBody = document.getElementById('adminOrdersTable');
    if (!tableBody) return;
    
    if (allOrders.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-table">No orders yet</td>
            </tr>
        `;
        return;
    }
    
    // Sort orders by date (newest first)
    const sortedOrders = [...allOrders].sort((a, b) => 
        new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)
    );
    
    let html = '';
    sortedOrders.forEach((order) => {
        const orderDate = new Date(order.date || order.createdAt);
        const formattedDate = orderDate.toLocaleDateString();
        const formattedTime = orderDate.toLocaleTimeString();
        
        const customerName = order.customer ? 
            order.customer.username || order.customer.email.split('@')[0] : 
            'Unknown Customer';
        
        // Get current status
        const currentStatus = order.status || 'processing';
        
        // Build items list
        let itemsList = 'N/A';
        if (order.items && order.items.length > 0) {
            itemsList = order.items.map(item => `${item.name || 'Unknown'} x${item.quantity || 1}`).join(', ');
            if (itemsList.length > 50) {
                itemsList = itemsList.substring(0, 50) + '...';
            }
        }
        
        html += `
            <tr>
                <td><strong>${order.id || generateOrderIdForAdmin()}</strong></td>
                <td>${customerName}</td>
                <td>${formattedDate} ${formattedTime}</td>
                <td title="${itemsList}">${itemsList}</td>
                <td>$${(order.total || 0).toFixed(2)}</td>
                <td>
                    <select class="status-select" data-order-id="${order.id}" onchange="updateOrderStatus('${order.id}', this.value)" style="padding: 6px 10px; border-radius: 4px; border: 1px solid #ddd; background: white; font-size: 13px; cursor: pointer; min-width: 140px;">
                        <option value="processing" ${currentStatus === 'processing' ? 'selected' : ''}>Processing</option>
                        <option value="verification" ${currentStatus === 'verification' ? 'selected' : ''}>Verification</option>
                        <option value="packaging" ${currentStatus === 'packaging' ? 'selected' : ''}>Packaging</option>
                        <option value="out_for_delivery" ${currentStatus === 'out_for_delivery' ? 'selected' : ''}>Out for Delivery</option>
                        <option value="completed" ${currentStatus === 'completed' ? 'selected' : ''}>Completed</option>
                        <option value="cancelled" ${currentStatus === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                </td>
                <td>
                    <button class="action-btn view" onclick="viewOrderDetails('${order.id}')"
                            title="View Details" style="background: #2ecc71; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; font-size: 12px;">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
}

// Update order status
function updateOrderStatus(orderId, newStatus) {
    const clients = JSON.parse(localStorage.getItem('wigClients') || '[]');
    let orderFound = false;
    
    // Search through all clients' orders
    clients.forEach(client => {
        const ordersKey = `orders_${client.email}`;
        const ordersJSON = localStorage.getItem(ordersKey);
        
        if (ordersJSON) {
            try {
                const orders = JSON.parse(ordersJSON);
                const orderIndex = orders.findIndex(o => o.id === orderId);
                
                if (orderIndex !== -1) {
                    // Update order status
                    const oldStatus = orders[orderIndex].status || 'processing';
                    orders[orderIndex].status = newStatus;
                    orders[orderIndex].statusHistory = orders[orderIndex].statusHistory || [];
                    orders[orderIndex].statusHistory.push({
                        status: newStatus,
                        changedAt: new Date().toISOString(),
                        changedBy: document.getElementById('adminName').textContent
                    });
                    
                    // Save updated orders
                    localStorage.setItem(ordersKey, JSON.stringify(orders));
                    orderFound = true;
                    
                    // Show notification
                    showAdminNotification(`Order ${orderId} status updated from ${oldStatus} to ${newStatus}`, 'success');
                    
                    // Log status change
                    logOrderStatusChange(orderId, oldStatus, newStatus, client.email);
                }
            } catch (e) {
                console.error('Error updating order status:', e);
            }
        }
    });
    
    if (!orderFound) {
        alert('Order not found!');
    }
    
    // Refresh orders table
    loadOrders();
    loadOrdersTable();
}

// Log order status change
function logOrderStatusChange(orderId, oldStatus, newStatus, customerEmail) {
    const logs = JSON.parse(localStorage.getItem('orderStatusLogs') || '[]');
    logs.push({
        orderId: orderId,
        oldStatus: oldStatus,
        newStatus: newStatus,
        customerEmail: customerEmail,
        changedAt: new Date().toISOString(),
        changedBy: document.getElementById('adminName').textContent
    });
    localStorage.setItem('orderStatusLogs', JSON.stringify(logs));
}

// View order details
function viewOrderDetails(orderId) {
    const clients = JSON.parse(localStorage.getItem('wigClients') || '[]');
    let orderDetails = null;
    let customerEmail = '';
    
    // Find the order
    for (const client of clients) {
        const ordersKey = `orders_${client.email}`;
        const ordersJSON = localStorage.getItem(ordersKey);
        
        if (ordersJSON) {
            try {
                const orders = JSON.parse(ordersJSON);
                const order = orders.find(o => o.id === orderId);
                
                if (order) {
                    orderDetails = order;
                    customerEmail = client.email;
                    break;
                }
            } catch (e) {
                console.error('Error parsing orders:', e);
            }
        }
    }
    
    if (!orderDetails) {
        alert('Order not found!');
        return;
    }
    
    // Create modal content
    const modalContent = `
        <div class="order-details-modal">
            <h3>Order Details: ${orderId}</h3>
            
            <div class="order-info-grid">
                <div class="info-item">
                    <label>Customer:</label>
                    <span>${orderDetails.customer?.username || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <label>Email:</label>
                    <span>${customerEmail}</span>
                </div>
                <div class="info-item">
                    <label>Order Date:</label>
                    <span>${new Date(orderDetails.date).toLocaleString()}</span>
                </div>
                <div class="info-item">
                    <label>Current Status:</label>
                    <span class="status-badge status-${orderDetails.status || 'processing'}">${orderDetails.status || 'Processing'}</span>
                </div>
                <div class="info-item">
                    <label>Total Amount:</label>
                    <span style="font-weight: bold; color: #2ecc71;">$${orderDetails.total?.toFixed(2) || '0.00'}</span>
                </div>
            </div>
            
            <div class="order-items-section">
                <h4>Order Items</h4>
                <table class="order-items-table">
                    <thead>
                        <tr>
                            <th>Product ID</th>
                            <th>Product Name</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${orderDetails.items?.map(item => `
                            <tr>
                                <td>${item.id || 'N/A'}</td>
                                <td>${item.name || 'Unknown Product'}</td>
                                <td>${item.quantity || 1}</td>
                                <td>$${(item.price || 0).toFixed(2)}</td>
                                <td>$${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</td>
                            </tr>
                        `).join('') || '<tr><td colspan="5">No items</td></tr>'}
                    </tbody>
                </table>
            </div>
            
            <div class="status-history-section">
                <h4>Status History</h4>
                ${orderDetails.statusHistory?.length > 0 ? `
                    <div class="status-timeline">
                        ${orderDetails.statusHistory.map(history => `
                            <div class="timeline-item">
                                <div class="timeline-marker"></div>
                                <div class="timeline-content">
                                    <div class="timeline-status">${history.status}</div>
                                    <div class="timeline-time">${new Date(history.changedAt).toLocaleString()}</div>
                                    <div class="timeline-by">By: ${history.changedBy}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p>No status history available.</p>'}
            </div>
            
            <div class="order-actions">
                <button class="btn btn-primary" onclick="printOrderDetails('${orderId}')">
                    <i class="fas fa-print"></i> Print Order
                </button>
                <button class="btn btn-secondary" onclick="sendOrderUpdate('${orderId}', '${customerEmail}')">
                    <i class="fas fa-envelope"></i> Email Customer
                </button>
            </div>
        </div>
    `;
    
    // Show in modal
    const modalBody = document.getElementById('adminTicketModalBody');
    modalBody.innerHTML = modalContent;
    document.getElementById('adminTicketModal').classList.add('active');
}

// Print order details
function printOrderDetails(orderId) {
    alert(`Printing order ${orderId}...`);
    // In a real application, this would open a print dialog
}

// Send order update email
function sendOrderUpdate(orderId, customerEmail) {
    const subject = `Order ${orderId} Update`;
    const body = `Dear Customer,\n\nYour order ${orderId} has been updated. Please check your account for details.\n\nBest regards,\nWig Hub Support`;
    
    alert(`Email would be sent to ${customerEmail}\n\nSubject: ${subject}\n\nBody:\n${body}`);
}

// ===== PASSWORD RESET FUNCTIONS =====

// Password Reset Functions
function loadResetRequests() {
    const requests = JSON.parse(localStorage.getItem('passwordResetRequests') || '[]');
    displayResetRequests(requests);
    return requests;
}

function displayResetRequests(requests) {
    const table = document.getElementById('resetRequestsTable');
    if (!table) {
        // Create table if it doesn't exist
        createPasswordResetSection();
        displayResetRequests(requests);
        return;
    }
    
    if (requests.length === 0) {
        table.innerHTML = `
            <tr><td colspan="6" class="empty-table">No password reset requests</td></tr>
        `;
        return;
    }
    
    let html = '';
    requests.forEach(request => {
        const statusClass = request.status === 'pending' ? 'status-pending' : 
                           request.status === 'processing' ? 'status-processing' : 
                           request.status === 'completed' ? 'status-completed' : 'status-cancelled';
        
        html += `
            <tr>
                <td>${request.id}</td>
                <td>${request.email}</td>
                <td>${request.username || 'N/A'}</td>
                <td>${new Date(request.requestedAt).toLocaleDateString()}</td>
                <td><span class="status-badge ${statusClass}">${request.status}</span></td>
                <td>
                    <button class="btn-action btn-view" onclick="viewResetRequest('${request.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${request.status === 'pending' ? `
                        <button class="btn-action btn-process" onclick="processResetRequest('${request.id}')">
                            <i class="fas fa-cog"></i>
                        </button>
                    ` : ''}
                </td>
            </tr>
        `;
    });
    
    table.innerHTML = html;
}

function createPasswordResetSection() {
    const contentArea = document.querySelector('.admin-content-area');
    
    const passwordResetSection = document.createElement('section');
    passwordResetSection.id = 'passwordResetSection';
    passwordResetSection.className = 'admin-section';
    passwordResetSection.innerHTML = `
        <div class="section-header">
            <h2><i class="fas fa-key"></i> Password Reset Requests</h2>
        </div>
        
        <div class="password-reset-container">
            <div class="search-filter">
                <div class="search-box">
                    <i class="fas fa-search"></i>
                    <input type="text" id="resetSearch" placeholder="Search by email..." onkeyup="filterResetRequests()">
                </div>
                <select id="resetStatusFilter" onchange="filterResetRequests()">
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>
            
            <div class="reset-requests-table">
                <table>
                    <thead>
                        <tr>
                            <th>Request ID</th>
                            <th>Client Email</th>
                            <th>Client Name</th>
                            <th>Request Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="resetRequestsTable">
                        <tr><td colspan="6" class="empty-table">Loading password reset requests...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    contentArea.appendChild(passwordResetSection);
    
    // Add password reset button to sidebar
    const sidebarMenu = document.querySelector('.admin-menu');
    const passwordResetButton = document.createElement('button');
    passwordResetButton.className = 'admin-btn';
    passwordResetButton.onclick = () => showAdminSection('passwordReset');
    passwordResetButton.innerHTML = '<i class="fas fa-key"></i> Password Reset';
    sidebarMenu.appendChild(passwordResetButton);
}

function filterResetRequests() {
    const searchTerm = document.getElementById('resetSearch')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('resetStatusFilter')?.value || '';
    
    const requests = JSON.parse(localStorage.getItem('passwordResetRequests') || '[]');
    
    const filteredRequests = requests.filter(request => {
        const matchesSearch = !searchTerm || 
            request.email.toLowerCase().includes(searchTerm) ||
            (request.username && request.username.toLowerCase().includes(searchTerm));
        
        const matchesStatus = !statusFilter || request.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });
    
    displayResetRequests(filteredRequests);
}

function viewResetRequest(requestId) {
    const requests = JSON.parse(localStorage.getItem('passwordResetRequests') || '[]');
    const request = requests.find(r => r.id === requestId);
    
    if (!request) return;
    
    const modalBody = document.getElementById('adminTicketModalBody');
    modalBody.innerHTML = `
        <div class="reset-request-detail">
            <div class="request-info">
                <div class="info-item">
                    <label>Request ID:</label>
                    <span>${request.id}</span>
                </div>
                <div class="info-item">
                    <label>Client Email:</label>
                    <span>${request.email}</span>
                </div>
                <div class="info-item">
                    <label>Client Name:</label>
                    <span>${request.username || 'Not available'}</span>
                </div>
                <div class="info-item">
                    <label>Request Date:</label>
                    <span>${new Date(request.requestedAt).toLocaleString()}</span>
                </div>
                <div class="info-item">
                    <label>Status:</label>
                    <span class="status-badge ${request.status === 'pending' ? 'status-pending' : request.status === 'processing' ? 'status-processing' : request.status === 'completed' ? 'status-completed' : 'status-cancelled'}">${request.status}</span>
                </div>
                <div class="info-item">
                    <label>IP Address:</label>
                    <span>${request.ip || 'Not recorded'}</span>
                </div>
                <div class="info-item">
                    <label>User Agent:</label>
                    <span style="font-size: 12px; color: #666;">${request.userAgent || 'Not recorded'}</span>
                </div>
            </div>
            
            <div class="reset-actions">
                <h4>Reset Instructions</h4>
                <div class="form-group">
                    <label for="resetInstructions">Instructions to send to client:</label>
                    <textarea id="resetInstructions" rows="4" placeholder="Dear ${request.username || 'Customer'},

We have received your password reset request. Here are your new credentials:

Username: ${request.username || request.email}
Password: [Generate a temporary password here]

Please login with these credentials and change your password immediately.

Best regards,
Wig Hub Support"></textarea>
                </div>
                
                <div class="action-buttons">
                    <button class="btn btn-secondary" onclick="closeResetModal()">
                        Cancel
                    </button>
                    <button class="btn btn-danger" onclick="markResetCancelled('${request.id}')">
                        Mark as Cancelled
                    </button>
                    <button class="btn btn-primary" onclick="sendResetInstructions('${request.id}')">
                        <i class="fas fa-paper-plane"></i> Send Instructions
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('adminTicketModal').classList.add('active');
}

function sendResetInstructions(requestId) {
    const requests = JSON.parse(localStorage.getItem('passwordResetRequests') || '[]');
    const requestIndex = requests.findIndex(r => r.id === requestId);
    
    if (requestIndex === -1) return;
    
    const instructions = document.getElementById('resetInstructions').value;
    
    // Update request status
    requests[requestIndex].status = 'processing';
    requests[requestIndex].processedAt = new Date().toISOString();
    requests[requestIndex].processedBy = document.getElementById('adminName').textContent;
    requests[requestIndex].instructionsSent = instructions;
    
    // Save updated requests
    localStorage.setItem('passwordResetRequests', JSON.stringify(requests));
    
    // Show success message
    alert(`Instructions prepared for ${requests[requestIndex].email}\n\nNote: In a real application, this would trigger an email to be sent.\n\nInstructions:\n${instructions}`);
    
    // Close modal and refresh
    closeResetModal();
    loadResetRequests();
}

function markResetCancelled(requestId) {
    if (!confirm('Mark this request as cancelled?')) return;
    
    const requests = JSON.parse(localStorage.getItem('passwordResetRequests') || '[]');
    const requestIndex = requests.findIndex(r => r.id === requestId);
    
    if (requestIndex === -1) return;
    
    requests[requestIndex].status = 'cancelled';
    requests[requestIndex].processedAt = new Date().toISOString();
    requests[requestIndex].processedBy = document.getElementById('adminName').textContent;
    
    localStorage.setItem('passwordResetRequests', JSON.stringify(requests));
    
    alert('Request marked as cancelled');
    loadResetRequests();
}

function closeResetModal() {
    document.getElementById('adminTicketModal').classList.remove('active');
}

// ===== ADMIN NOTIFICATION FUNCTION =====
function showAdminNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `admin-notification ${type}`;
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#d1ecf1'};
        color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#0c5465'};
        border: 1px solid ${type === 'success' ? '#c3e6cb' : type === 'error' ? '#f5c6cb' : '#bee5eb'};
        border-radius: 8px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease;
        font-weight: 500;
    `;
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ===== EXISTING FUNCTIONS (Keep these as they are) =====

function updateImagePreview(imageUrl) {
    const preview = document.getElementById('imagePreview');
    if (!preview) return;
    
    if (imageUrl) {
        preview.innerHTML = `
            <img src="${imageUrl}" alt="Preview" style="max-width: 200px; max-height: 200px; border-radius: 8px;">
            <p style="margin-top: 10px; color: #666;">Image Preview</p>
        `;
    } else {
        preview.innerHTML = `<p>No image selected</p>`;
    }
}

function loadStoreConfig() {
    let config = JSON.parse(localStorage.getItem('wigStoreConfig') || '{}');
    
    config = {
        taxRate: config.taxRate || 8,
        shippingFee: config.shippingFee || 9.99,
        freeShippingThreshold: config.freeShippingThreshold || 100,
        ...config
    };
    
    if (document.getElementById('taxRate')) {
        document.getElementById('taxRate').value = config.taxRate;
    }
    if (document.getElementById('shippingFee')) {
        document.getElementById('shippingFee').value = config.shippingFee;
    }
    if (document.getElementById('freeShippingThreshold')) {
        document.getElementById('freeShippingThreshold').value = config.freeShippingThreshold;
    }
    
    return config;
}

function saveStoreConfig() {
    const taxRate = parseFloat(document.getElementById('taxRate').value);
    const shippingFee = parseFloat(document.getElementById('shippingFee').value);
    const freeShippingThreshold = parseFloat(document.getElementById('freeShippingThreshold').value);
    
    const config = {
        taxRate,
        shippingFee,
        freeShippingThreshold,
        updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem('wigStoreConfig', JSON.stringify(config));
    showAdminNotification('✅ Store configuration saved successfully!', 'success');
}

function generateTicketId() {
    const ticketsKey = 'wigSupportTickets';
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

function generateOrderIdForAdmin() {
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

function optimizeDataURL(dataUrl) {
    if (dataUrl.length > 50000) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                canvas.width = img.width * 0.5;
                canvas.height = img.height * 0.5;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/jpeg', 0.4));
            };
            img.src = dataUrl;
        });
    }
    return Promise.resolve(dataUrl);
}

function loadSettings() {
    loadStoreConfig();
}

function loadRecentProducts() {
    const recentProductsContainer = document.getElementById('recentProducts');
    if (!recentProductsContainer) return;
    
    const recentProducts = [...allProducts]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
    
    if (recentProducts.length === 0) {
        recentProductsContainer.innerHTML = `
            <div style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
                <p>No products yet. Add your first product!</p>
            </div>
        `;
        return;
    }
    
    let html = '<div style="display: flex; flex-direction: column; gap: 15px;">';
    recentProducts.forEach(product => {
        html += `
            <div style="display: flex; align-items: center; gap: 15px; padding: 15px; 
                        background: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); cursor: pointer;" 
                        onclick="viewProduct(${product.id})">
                <img src="${product.image || 'https://via.placeholder.com/50x50'}" 
                     alt="${product.name}" 
                     style="width: 50px; height: 50px; border-radius: 8px; object-fit: cover;">
                <div style="flex: 1;">
                    <div style="font-weight: 600; margin-bottom: 5px;">${product.name}</div>
                    <div style="font-size: 14px; color: #666;">${product.category} • $${product.price.toFixed(2)}</div>
                </div>
                <div style="font-size: 14px; color: #666;">
                    Stock: ${product.stock}
                </div>
            </div>
        `;
    });
    html += '</div>';
    
    recentProductsContainer.innerHTML = html;
}

function exportProducts() {
    const dataStr = JSON.stringify(allProducts, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'wighub-products.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showAdminNotification('✅ Products exported successfully!', 'success');
}

function createBackup() {
    const backup = {
        products: allProducts,
        clients: allClients,
        orders: allOrders,
        storeConfig: JSON.parse(localStorage.getItem('wigStoreConfig') || '{}'),
        backupDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(backup, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `wighub-backup-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showAdminNotification('✅ Backup created successfully!', 'success');
}

function clearAllData() {
    if (!confirm('Are you sure you want to clear ALL data? This cannot be undone!')) {
        return;
    }
    
    localStorage.removeItem('wigProducts');
    localStorage.removeItem('wigClients');
    localStorage.removeItem('wigAdmins');
    localStorage.removeItem('wigSupportTickets');
    localStorage.removeItem('wigStoreConfig');
    localStorage.removeItem('passwordResetRequests');
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('orders_') || key.startsWith('cart_') || key.startsWith('wishlist_') || key.startsWith('tickets_')) {
            localStorage.removeItem(key);
        }
    }
    
    loadProducts();
    loadClients();
    loadOrders();
    
    showAdminNotification('✅ All data cleared successfully!', 'success');
    showAdminSection('dashboard');
}

function logoutAdmin() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    window.location.href = 'admin-login.html';
}

// ===== EXISTING FUNCTIONS CONTINUED =====

// Filter products
function filterProducts() {
    const searchTerm = document.getElementById('adminSearchInput').value.toLowerCase();
    const category = document.getElementById('adminCategoryFilter').value;
    
    filteredProducts = allProducts.filter(product => {
        const matchesSearch = !searchTerm || 
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm);
        
        const matchesCategory = !category || product.category === category;
        
        return matchesSearch && matchesCategory;
    });
    
    loadProductsTable();
}

// Filter customers
function filterCustomers() {
    const searchTerm = document.getElementById('customerSearchInput').value.toLowerCase();
    const tableBody = document.getElementById('adminCustomersTable');
    
    if (!tableBody || !searchTerm) {
        loadCustomersTable();
        return;
    }
    
    const filteredClients = allClients.filter(client => 
        (client.username && client.username.toLowerCase().includes(searchTerm)) ||
        (client.email && client.email.toLowerCase().includes(searchTerm))
    );
    
    if (filteredClients.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-table">
                    No customers found matching "${searchTerm}"
                </td>
            </tr>
        `;
        return;
    }
    
    let html = '';
    filteredClients.forEach((client) => {
        // Get client orders
        const ordersKey = `orders_${client.email}`;
        const clientOrders = JSON.parse(localStorage.getItem(ordersKey) || '[]');
        const orderCount = clientOrders.length;
        
        const totalSpent = clientOrders.reduce((sum, order) => sum + (order.total || 0), 0);
        
        // Format join date
        const joinDate = new Date(client.createdAt || new Date());
        const formattedDate = joinDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        html += `
            <tr>
                <td><strong>#${client.id}</strong></td>
                <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div class="customer-avatar" onclick="viewCustomerDetails('${client.email}')" 
                             style="cursor: pointer; width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                                    display: flex; align-items: center; justify-content: center; color: white;">
                            ${client.username ? client.username.charAt(0).toUpperCase() : 'C'}
                        </div>
                        <div>
                            <strong style="cursor: pointer;" onclick="viewCustomerDetails('${client.email}')">${client.username || 'Unknown'}</strong><br>
                            <small>${client.email || 'No email'}</small>
                        </div>
                    </div>
                </td>
                <td>${formattedDate}</td>
                <td>${orderCount}</td>
                <td>$${totalSpent.toFixed(2)}</td>
                <td>
                    <span class="status-badge active" style="padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; background: #d4edda; color: #155724;">
                        ${client.status || 'Active'}
                    </span>
                </td>
                <td>
                    <div style="display: flex; gap: 5px; flex-wrap: wrap;">
                        <button class="action-btn view" onclick="viewCustomerDetails('${client.email}')"
                                title="View Details" style="background: #2ecc71; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; font-size: 12px;">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn edit" onclick="editClient('${client.email}')" 
                                title="Edit Client" style="background: #3498db; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; font-size: 12px;">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="deleteClient(${client.id})"
                                title="Delete Client" style="background: #e74c3c; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; font-size: 12px;">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
}

// Load customers table - UPDATED VERSION
function loadCustomersTable() {
    const tableBody = document.getElementById('adminCustomersTable');
    if (!tableBody) {
        // Create customers section if it doesn't exist
        createCustomersSection();
        loadCustomersTable();
        return;
    }
    
    loadClients(); // Reload clients to get latest data
    
    if (allClients.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-table">
                    No customers found. Customers will appear here after they sign up.
                </td>
            </tr>
        `;
        return;
    }
    
    let html = '';
    allClients.forEach((client, index) => {
        // Get client orders
        const ordersKey = `orders_${client.email}`;
        const clientOrders = JSON.parse(localStorage.getItem(ordersKey) || '[]');
        const orderCount = clientOrders.length;
        
        const totalSpent = clientOrders.reduce((sum, order) => sum + (order.total || 0), 0);
        
        // Format join date
        const joinDate = new Date(client.createdAt || new Date());
        const formattedDate = joinDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        html += `
            <tr>
                <td><strong>#${client.id}</strong></td>
                <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div class="customer-avatar" onclick="viewCustomerDetails('${client.email}')" 
                             style="cursor: pointer; width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                                    display: flex; align-items: center; justify-content: center; color: white;">
                            ${client.username ? client.username.charAt(0).toUpperCase() : 'C'}
                        </div>
                        <div>
                            <strong style="cursor: pointer;" onclick="viewCustomerDetails('${client.email}')">${client.username || 'Unknown'}</strong><br>
                            <small>${client.email || 'No email'}</small>
                        </div>
                    </div>
                </td>
                <td>${formattedDate}</td>
                <td>${orderCount}</td>
                <td>$${totalSpent.toFixed(2)}</td>
                <td>
                    <span class="status-badge active" style="padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; background: #d4edda; color: #155724;">
                        ${client.status || 'Active'}
                    </span>
                </td>
                <td>
                    <div style="display: flex; gap: 5px; flex-wrap: wrap;">
                        <button class="action-btn view" onclick="viewCustomerDetails('${client.email}')"
                                title="View Details" style="background: #2ecc71; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; font-size: 12px;">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn edit" onclick="editClient('${client.email}')" 
                                title="Edit Client" style="background: #3498db; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; font-size: 12px;">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="deleteClient(${client.id})"
                                title="Delete Client" style="background: #e74c3c; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; font-size: 12px;">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
}

// Create customers section dynamically
function createCustomersSection() {
    const contentArea = document.querySelector('.admin-content-area');
    
    const customersSection = document.createElement('section');
    customersSection.id = 'customersSection';
    customersSection.className = 'admin-section';
    customersSection.innerHTML = `
        <div class="section-header">
            <h2><i class="fas fa-users"></i> Manage Customers</h2>
            <div class="search-filter">
                <div class="search-box">
                    <i class="fas fa-search"></i>
                    <input type="text" id="customerSearchInput" placeholder="Search customers..." onkeyup="filterCustomers()">
                </div>
            </div>
        </div>
        
        <div class="customers-table-container" style="background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
            <table class="customers-table" style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr>
                        <th style="padding: 1rem; text-align: left; background: #f8f9fa; border-bottom: 2px solid #e0e0e0;">ID</th>
                        <th style="padding: 1rem; text-align: left; background: #f8f9fa; border-bottom: 2px solid #e0e0e0;">Customer</th>
                        <th style="padding: 1rem; text-align: left; background: #f8f9fa; border-bottom: 2px solid #e0e0e0;">Joined</th>
                        <th style="padding: 1rem; text-align: left; background: #f8f9fa; border-bottom: 2px solid #e0e0e0;">Orders</th>
                        <th style="padding: 1rem; text-align: left; background: #f8f9fa; border-bottom: 2px solid #e0e0e0;">Total Spent</th>
                        <th style="padding: 1rem; text-align: left; background: #f8f9fa; border-bottom: 2px solid #e0e0e0;">Status</th>
                        <th style="padding: 1rem; text-align: left; background: #f8f9fa; border-bottom: 2px solid #e0e0e0;">Actions</th>
                    </tr>
                </thead>
                <tbody id="adminCustomersTable">
                    <tr><td colspan="7" class="empty-table" style="text-align: center; padding: 2rem; color: #666;">Loading customers...</td></tr>
                </tbody>
            </table>
        </div>
    `;
    
    contentArea.appendChild(customersSection);
    
    // Add customers button to sidebar
    const sidebarMenu = document.querySelector('.admin-menu');
    const customersButton = document.createElement('button');
    customersButton.className = 'admin-btn';
    customersButton.onclick = () => showAdminSection('customers');
    customersButton.innerHTML = '<i class="fas fa-users"></i> Customers';
    sidebarMenu.appendChild(customersButton);
}

// ===== ADMIN MANAGEMENT FUNCTIONS =====
function loadAdminList() {
    const adminList = document.getElementById('adminList');
    if (!adminList) return;
    
    const admins = JSON.parse(localStorage.getItem('wigAdmins') || '[]');
    const currentUser = localStorage.getItem('adminUser');
    
    if (admins.length === 0) {
        // Add default admin if none exists
        const defaultAdmin = {
            id: 1,
            name: 'System Administrator',
            email: 'phidaliskipyego@gmail.com',
            password: 'Phid@3630',
            role: 'super_admin',
            createdAt: new Date().toISOString(),
            isDefault: true
        };
        admins.push(defaultAdmin);
        localStorage.setItem('wigAdmins', JSON.stringify(admins));
    }
    
    let html = '<div style="overflow-x: auto;"><table style="width: 100%; border-collapse: collapse; margin-top: 20px;">';
    html += '<thead><tr style="background: #f8f9fa;"><th style="padding: 12px; text-align: left; border-bottom: 2px solid #e0e0e0;">Name</th><th style="padding: 12px; text-align: left; border-bottom: 2px solid #e0e0e0;">Email</th><th style="padding: 12px; text-align: left; border-bottom: 2px solid #e0e0e0;">Role</th><th style="padding: 12px; text-align: left; border-bottom: 2px solid #e0e0e0;">Actions</th></tr></thead><tbody>';
    
    admins.forEach(admin => {
        const roleBadge = admin.role === 'super_admin' ? 
            '<span style="background: #dc3545; color: white; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 600;">Super Admin</span>' :
            admin.role === 'admin' ?
            '<span style="background: #28a745; color: white; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 600;">Admin</span>' :
            '<span style="background: #17a2b8; color: white; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 600;">Manager</span>';
        
        const isCurrentUser = admin.email === currentUser;
        const isDefault = admin.isDefault;
        
        html += `
            <tr style="border-bottom: 1px solid #e0e0e0;">
                <td style="padding: 12px;">
                    <div style="font-weight: 600;">${admin.name}</div>
                    ${isCurrentUser ? '<div style="color: #6c757d; font-size: 12px; margin-top: 2px;">(You)</div>' : ''}
                    ${isDefault ? '<div style="color: #dc3545; font-size: 12px; margin-top: 2px;">Default Admin</div>' : ''}
                </td>
                <td style="padding: 12px;">${admin.email}</td>
                <td style="padding: 12px;">${roleBadge}</td>
                <td style="padding: 12px;">
                    ${!isDefault ? `
                        <div style="display: flex; gap: 5px;">
                            <button class="action-btn edit" onclick="editAdmin(${admin.id})" title="Edit Admin" style="background: #3498db; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer;">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn delete" onclick="deleteAdmin(${admin.id})" ${isCurrentUser ? 'disabled style="opacity: 0.5; cursor: not-allowed;" title="Cannot delete yourself"' : 'title="Delete Admin"'} style="background: #e74c3c; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer;">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    ` : '<span style="color: #6c757d; font-size: 13px;">Default admin cannot be edited</span>'}
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table></div>';
    adminList.innerHTML = html;
}

function showAddAdminForm() {
    document.getElementById('addAdminForm').style.display = 'block';
    window.scrollTo(0, document.getElementById('addAdminForm').offsetTop - 100);
}

function cancelAddAdmin() {
    document.getElementById('addAdminForm').style.display = 'none';
    document.getElementById('newAdminName').value = '';
    document.getElementById('newAdminEmail').value = '';
    document.getElementById('newAdminPassword').value = '';
}

function addNewAdmin() {
    const name = document.getElementById('newAdminName').value.trim();
    const email = document.getElementById('newAdminEmail').value.trim();
    const password = document.getElementById('newAdminPassword').value;
    const role = document.getElementById('adminRole').value;
    
    if (!name || !email || !password) {
        alert('Please fill all fields');
        return;
    }
    
    if (password.length < 6) {
        alert('Password must be at least 6 characters');
        return;
    }
    
    const admins = JSON.parse(localStorage.getItem('wigAdmins') || '[]');
    
    // Check if email already exists
    if (admins.some(admin => admin.email === email)) {
        alert('Admin with this email already exists');
        return;
    }
    
    const newAdmin = {
        id: admins.length > 0 ? Math.max(...admins.map(a => a.id)) + 1 : 1,
        name,
        email,
        password, // In production, this should be hashed
        role,
        createdAt: new Date().toISOString(),
        isDefault: false
    };
    
    admins.push(newAdmin);
    localStorage.setItem('wigAdmins', JSON.stringify(admins));
    
    alert('✅ Admin added successfully!');
    cancelAddAdmin();
    loadAdminList();
}

function updateDefaultAdmin() {
    const newEmail = document.getElementById('newDefaultEmail').value.trim();
    const newPassword = document.getElementById('newDefaultPassword').value;
    
    if (!newEmail || !newPassword) {
        alert('Please fill both fields');
        return;
    }
    
    if (newPassword.length < 6) {
        alert('Password must be at least 6 characters');
        return;
    }
    
    const admins = JSON.parse(localStorage.getItem('wigAdmins') || '[]');
    const defaultAdminIndex = admins.findIndex(admin => admin.isDefault);
    
    if (defaultAdminIndex !== -1) {
        admins[defaultAdminIndex].email = newEmail;
        admins[defaultAdminIndex].password = newPassword;
        localStorage.setItem('wigAdmins', JSON.stringify(admins));
        
        // Update admin login page credentials
        alert('✅ Default admin credentials updated successfully!\n\nNew credentials:\nEmail: ' + newEmail + '\nPassword: ' + newPassword);
        
        // Clear form
        document.getElementById('newDefaultEmail').value = '';
        document.getElementById('newDefaultPassword').value = '';
    }
}

function editAdmin(adminId) {
    const admins = JSON.parse(localStorage.getItem('wigAdmins') || '[]');
    const admin = admins.find(a => a.id === adminId);
    
    if (!admin) return;
    
    const newName = prompt('Enter new name for admin:', admin.name);
    const newEmail = prompt('Enter new email for admin:', admin.email);
    const newRole = prompt('Enter new role (super_admin/admin/manager):', admin.role);
    
    if (newName && newEmail && newRole) {
        admin.name = newName;
        admin.email = newEmail;
        admin.role = newRole;
        localStorage.setItem('wigAdmins', JSON.stringify(admins));
        alert('✅ Admin updated successfully!');
        loadAdminList();
    }
}

function deleteAdmin(adminId) {
    if (!confirm('Are you sure you want to delete this admin?')) return;
    
    const admins = JSON.parse(localStorage.getItem('wigAdmins') || '[]');
    const updatedAdmins = admins.filter(admin => admin.id !== adminId);
    
    localStorage.setItem('wigAdmins', JSON.stringify(updatedAdmins));
    alert('✅ Admin deleted successfully!');
    loadAdminList();
}

// ===== PRODUCT VIEW MODAL =====
function viewProduct(productId) {
    const product = allProducts.find(p => p.id == productId);
    if (!product) return;
    
    const modalHTML = `
        <div class="customer-modal active" id="productModal">
            <div class="customer-modal-content">
                <div class="customer-modal-header">
                    <h3><i class="fas fa-wig"></i> Product Details</h3>
                </div>
                <div class="customer-modal-body">
                    <div class="customer-profile">
                        <div class="customer-profile-avatar" style="background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);">
                            <i class="fas fa-wig" style="font-size: 1.8rem;"></i>
                        </div>
                        <div class="customer-profile-info">
                            <h3>${product.name}</h3>
                            <p>${product.category} • $${product.price.toFixed(2)}</p>
                        </div>
                    </div>
                    
                    <div style="margin: 20px 0;">
                        <img src="${product.image || 'https://via.placeholder.com/400x400?text=Product'}" 
                             alt="${product.name}" 
                             style="width: 100%; border-radius: 10px; margin-bottom: 20px;">
                    </div>
                    
                    <div class="customer-details-grid">
                        <div class="detail-row">
                            <span class="detail-label">Product ID:</span>
                            <span class="detail-value">${product.id}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Product Type:</span>
                            <span class="detail-value">
                                <span class="badge" style="background: ${getProductTypeColor(product.productType)}; color: white; padding: 4px 8px; border-radius: 4px;">
                                    ${getProductTypeIcon(product.productType)} ${product.productType || 'product'}
                                </span>
                            </span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Category:</span>
                            <span class="detail-value">${product.category}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Price:</span>
                            <span class="detail-value">$${product.price.toFixed(2)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Stock Quantity:</span>
                            <span class="detail-value">${product.stock} units</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Length:</span>
                            <span class="detail-value">${product.length || 'Not specified'}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Color:</span>
                            <span class="detail-value">${product.color || 'Not specified'}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Status:</span>
                            <span class="detail-value">
                                <span class="status-badge ${product.active !== false ? 'status-active' : 'status-inactive'}">
                                    ${product.active !== false ? 'Active' : 'Inactive'}
                                </span>
                            </span>
                        </div>
                        <div class="detail-row" style="border-bottom: none;">
                            <span class="detail-label">Description:</span>
                            <span class="detail-value">${product.description}</span>
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 1rem; margin-top: 2rem;">
                        <button class="btn btn-secondary" onclick="closeProductModal()">
                            <i class="fas fa-times"></i> Close
                        </button>
                        <button class="btn btn-primary" onclick="editProduct(${product.id}); closeProductModal()">
                            <i class="fas fa-edit"></i> Edit Product
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function closeProductModal() {
    const modal = document.getElementById('productModal');
    if (modal) {
        modal.remove();
    }
}

// ===== CUSTOMER MANAGEMENT FUNCTIONS - ADDED NEW FUNCTIONS =====
function viewCustomerDetails(customerEmail) {
    const customer = allClients.find(c => c.email === customerEmail);
    if (!customer) return;
    
    // Get customer orders
    const ordersKey = `orders_${customer.email}`;
    const customerOrders = JSON.parse(localStorage.getItem(ordersKey) || '[]');
    
    const totalOrders = customerOrders.length;
    const totalSpent = customerOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    
    // Create modal HTML with ALL client details
    const modalHTML = `
        <div class="customer-modal active" id="customerModal">
            <div class="customer-modal-content">
                <div class="customer-modal-header">
                    <h3><i class="fas fa-user"></i> Customer Details</h3>
                </div>
                <div class="customer-modal-body">
                    <div class="customer-profile">
                        <div class="customer-profile-avatar">
                            ${customer.username ? customer.username.charAt(0).toUpperCase() : 'C'}
                        </div>
                        <div class="customer-profile-info">
                            <h3>${customer.username || 'Unknown'}</h3>
                            <p>${customer.email || 'No email'}</p>
                            <span class="badge client-badge">Customer ID: #${customer.id}</span>
                        </div>
                    </div>
                    
                    <div class="customer-details-grid">
                        <div class="detail-row">
                            <span class="detail-label">Customer ID:</span>
                            <span class="detail-value">#${customer.id}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Username:</span>
                            <span class="detail-value">${customer.username || 'Not set'}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Email:</span>
                            <span class="detail-value">${customer.email || 'Not set'}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Password:</span>
                            <span class="detail-value" style="font-family: monospace;">${customer.password || 'Not set'}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Joined Date:</span>
                            <span class="detail-value">${new Date(customer.createdAt || new Date()).toLocaleDateString()}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Last Login:</span>
                            <span class="detail-value">${customer.lastLogin ? new Date(customer.lastLogin).toLocaleDateString() : 'Never'}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Account Status:</span>
                            <span class="detail-value">
                                <span class="status-badge ${customer.status || 'active'}">${customer.status || 'Active'}</span>
                            </span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Total Orders:</span>
                            <span class="detail-value">${totalOrders}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Total Spent:</span>
                            <span class="detail-value">$${totalSpent.toFixed(2)}</span>
                        </div>
                    </div>
                    
                    ${totalOrders > 0 ? `
                        <h4 style="margin-top: 2rem; margin-bottom: 1rem;">Recent Orders (${totalOrders})</h4>
                        <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; max-height: 200px; overflow-y: auto;">
                            ${customerOrders.slice(0, 5).map(order => `
                                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e0e0e0;">
                                    <span><strong>${order.id || 'Unknown Order'}</strong> - ${new Date(order.date || order.createdAt).toLocaleDateString()}</span>
                                    <span>$${(order.total || 0).toFixed(2)}</span>
                                </div>
                            `).join('')}
                            ${totalOrders > 5 ? `<div style="text-align: center; padding-top: 10px; color: #666; font-size: 12px;">+${totalOrders - 5} more orders</div>` : ''}
                        </div>
                    ` : ''}
                    
                    <div style="display: flex; gap: 1rem; margin-top: 2rem;">
                        <button class="btn btn-secondary" onclick="closeCustomerModal()">
                            <i class="fas fa-times"></i> Close
                        </button>
                        <button class="btn btn-primary" onclick="editClient('${customer.email}')">
                            <i class="fas fa-edit"></i> Edit Customer
                        </button>
                        <button class="btn btn-danger" onclick="deleteClient(${customer.id})">
                            <i class="fas fa-trash"></i> Delete Account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function closeCustomerModal() {
    const modal = document.getElementById('customerModal');
    if (modal) {
        modal.remove();
    }
}

function contactCustomer(email) {
    alert(`Contact form would open for: ${email}\n\nIn a real application, this would open an email client or contact form.`);
}

// ===== CUSTOMER DELETE FUNCTION =====
function deleteClient(clientId) {
    if (!confirm('⚠️ ARE YOU SURE YOU WANT TO DELETE THIS CUSTOMER?\n\nThis will permanently delete:\n• Customer account\n• All their orders\n• Shopping cart\n• Wishlist\n\nThis action cannot be undone!')) {
        return;
    }
    
    // Find the client
    const clientIndex = allClients.findIndex(c => c.id === clientId);
    if (clientIndex === -1) return;
    
    const client = allClients[clientIndex];
    
    // Remove client from array
    allClients.splice(clientIndex, 1);
    
    // Save updated clients list
    saveClients();
    
    // Remove client-specific data
    const emailKey = client.email;
    if (emailKey) {
        localStorage.removeItem(`cart_${emailKey}`);
        localStorage.removeItem(`wishlist_${emailKey}`);
        localStorage.removeItem(`orders_${emailKey}`);
    }
    
    // Close any open modal
    closeCustomerModal();
    
    // Reload table
    loadCustomersTable();
    
    // Show success message
    showAdminNotification('✅ Customer deleted successfully!', 'success');
}

// ===== CUSTOMER EDIT FUNCTION =====
function editClient(clientEmail) {
    const client = allClients.find(c => c.email === clientEmail);
    if (!client) return;
    
    // Close any existing modal first
    closeCustomerModal();
    
    // Create edit modal
    const editHTML = `
        <div class="customer-modal active" id="editClientModal">
            <div class="customer-modal-content" style="max-width: 500px;">
                <div class="customer-modal-header">
                    <h3><i class="fas fa-user-edit"></i> Edit Customer</h3>
                </div>
                <div class="customer-modal-body">
                    <div class="form-group">
                        <label>Username</label>
                        <input type="text" id="editClientUsername" value="${client.username || ''}" class="form-control">
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" id="editClientEmail" value="${client.email || ''}" class="form-control">
                    </div>
                    <div class="form-group">
                        <label>Password (leave blank to keep current)</label>
                        <input type="password" id="editClientPassword" placeholder="Enter new password" class="form-control">
                    </div>
                    <div class="form-group">
                        <label>Status</label>
                        <select id="editClientStatus" class="form-control">
                            <option value="active" ${(client.status || 'active') === 'active' ? 'selected' : ''}>Active</option>
                            <option value="inactive" ${(client.status || 'active') === 'inactive' ? 'selected' : ''}>Inactive</option>
                            <option value="suspended" ${(client.status || 'active') === 'suspended' ? 'selected' : ''}>Suspended</option>
                        </select>
                    </div>
                    <div style="display: flex; gap: 1rem; margin-top: 2rem;">
                        <button class="btn btn-secondary" onclick="closeModal('editClientModal')">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                        <button class="btn btn-primary" onclick="saveClientEdit(${client.id})">
                            <i class="fas fa-save"></i> Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', editHTML);
}

function saveClientEdit(clientId) {
    const clientIndex = allClients.findIndex(c => c.id === clientId);
    if (clientIndex === -1) return;
    
    const username = document.getElementById('editClientUsername').value;
    const email = document.getElementById('editClientEmail').value;
    const password = document.getElementById('editClientPassword').value;
    const status = document.getElementById('editClientStatus').value;
    
    if (!username || !email) {
        showAdminNotification('Username and email are required', 'error');
        return;
    }
    
    // Check if email is being changed and already exists
    if (email !== allClients[clientIndex].email) {
        const emailExists = allClients.some((client, index) => 
            index !== clientIndex && client.email === email
        );
        if (emailExists) {
            showAdminNotification('Email already exists. Please use a different email.', 'error');
            return;
        }
    }
    
    // Update client
    allClients[clientIndex] = {
        ...allClients[clientIndex],
        username,
        email,
        status,
        updatedAt: new Date().toISOString()
    };
    
    // Update password if provided
    if (password) {
        allClients[clientIndex].password = password;
    }
    
    saveClients();
    closeModal('editClientModal');
    loadCustomersTable();
    
    showAdminNotification('✅ Customer updated successfully!', 'success');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.remove();
    }
}

// ===== DATA SYNCHRONIZATION FUNCTION =====
function syncAllClientsData() {
    console.log('Syncing client data...');
    
    // Get all clients
    const clients = JSON.parse(localStorage.getItem('wigClients') || '[]');
    
    // Ensure each client has all required fields
    const updatedClients = clients.map((client, index) => {
        return {
            id: client.id || index + 1,
            username: client.username || 'Unknown',
            email: client.email || `client${index + 1}@example.com`,
            password: client.password || '',
            createdAt: client.createdAt || new Date().toISOString(),
            lastLogin: client.lastLogin || new Date().toISOString(),
            status: client.status || 'active',
            role: client.role || 'client',
            profile: client.profile || {
                fullName: client.username || 'Unknown',
                phone: '',
                address: ''
            },
            orders: client.orders || [],
            totalSpent: client.totalSpent || 0,
            orderCount: client.orderCount || 0
        };
    });
    
    // Save back to localStorage
    localStorage.setItem('wigClients', JSON.stringify(updatedClients));
    
    // Reload data
    loadClients();
    
    console.log('Client data synced:', updatedClients.length);
}

// ===== NOTIFICATION FUNCTION =====
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#d1ecf1'};
        color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#0c5460'};
        border: 1px solid ${type === 'success' ? '#c3e6cb' : type === 'error' ? '#f5c6cb' : '#bee5eb'};
        border-radius: 8px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease;
        font-weight: 500;
    `;
    
    // Add animation keyframes if not already present
    if (!document.getElementById('notificationStyles')) {
        const style = document.createElement('style');
        style.id = 'notificationStyles';
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ===== ENHANCED IMAGE COMPRESSION FUNCTION =====
function compressImage(file, maxWidth = 800, maxHeight = 800, quality = 0.6) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function(event) {
            const img = new Image();
            img.src = event.target.result;
            img.onload = function() {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                
                // Maintain aspect ratio
                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }
                
                // Ensure minimum dimensions
                width = Math.max(width, 100);
                height = Math.max(height, 100);
                
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, width, height);
                ctx.drawImage(img, 0, 0, width, height);
                
                // Try WebP first (better compression)
                let compressedDataUrl;
                try {
                    compressedDataUrl = canvas.toDataURL('image/webp', quality);
                    if (compressedDataUrl.length < 10000) { // If too small, use JPEG
                        compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
                    }
                } catch (e) {
                    // Fallback to JPEG if WebP not supported
                    compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
                }
                
                resolve(compressedDataUrl);
            };
            img.onerror = reject;
        };
        reader.onerror = reject;
    });
}

// ===== IMAGE UPLOAD FUNCTIONS =====

// Initialize image upload functionality
function setupImageUpload() {
    const dragDropArea = document.getElementById('dragDropArea');
    const fileInput = document.getElementById('imageFileInput');
    
    if (dragDropArea) {
        // Drag over event
        dragDropArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('dragover');
        });
        
        // Drag leave event
        dragDropArea.addEventListener('dragleave', function(e) {
            e.preventDefault();
            this.classList.remove('dragover');
        });
        
        // Drop event
        dragDropArea.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('dragover');
            
            if (e.dataTransfer.files.length) {
                const file = e.dataTransfer.files[0];
                if (file.type.startsWith('image/')) {
                    handleImageUpload(file);
                } else {
                    alert('Please drop an image file (JPG, PNG, GIF, WebP)');
                }
            }
        });
        
        // Click to browse
        dragDropArea.addEventListener('click', function() {
            browseImage();
        });
    }
    
    // Copy paste functionality for the whole page
    document.addEventListener('paste', function(e) {
        if (e.clipboardData && e.clipboardData.items) {
            const items = e.clipboardData.items;
            
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    const blob = items[i].getAsFile();
                    handleImageUpload(blob);
                    break;
                }
            }
        }
    });
}

// Browse image from files
function browseImage() {
    const fileInput = document.getElementById('imageFileInput');
    if (fileInput) {
        fileInput.click();
    }
}

// Handle file upload
function handleImageUpload(file) {
    if (!file || !file.type.startsWith('image/')) {
        alert('Please select an image file (JPG, PNG, GIF, WebP)');
        return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('File is too large. Maximum size is 5MB.');
        return;
    }
    
    // Show upload progress
    const progressDiv = document.getElementById('uploadProgress');
    const progressFill = progressDiv.querySelector('.progress-fill');
    const progressText = document.getElementById('progressPercent');
    
    progressDiv.style.display = 'block';
    progressFill.style.width = '0%';
    progressText.textContent = '0%';
    
    // Simulate upload progress
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += 10;
        progressFill.style.width = progress + '%';
        progressText.textContent = progress + '%';
        
        if (progress >= 100) {
            clearInterval(progressInterval);
            
            // Use compression for smaller Data URLs
            compressImage(file)
                .then(compressedDataUrl => {
                    return optimizeDataURL(compressedDataUrl);
                })
                .then(optimizedDataUrl => {
                    // Hide progress bar
                    setTimeout(() => {
                        progressDiv.style.display = 'none';
                    }, 500);
                    
                    // Create image object with COMPRESSED data
                    const imageData = {
                        id: Date.now(),
                        name: file.name,
                        type: 'image/jpeg',
                        size: optimizedDataUrl.length,
                        dataUrl: optimizedDataUrl,
                        uploadedAt: new Date().toISOString()
                    };
                    
                    uploadedImages.push(imageData);
                    
                    // Update preview (show the uploaded image)
                    updateImagePreview(imageData.dataUrl);

                    // Update URL input WITH THE DATA URL
                    document.getElementById('productImage').value = imageData.dataUrl;

                    // Save to localStorage for persistence
                    saveUploadedImages();

                    showAdminNotification('✅ Image uploaded successfully!', 'success');
                })
                .catch(error => {
                    console.error('Compression failed, using original:', error);
                    // Fallback to original without compression
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        // Hide progress bar
                        setTimeout(() => {
                            progressDiv.style.display = 'none';
                        }, 500);
                        
                        const imageData = {
                            id: Date.now(),
                            name: file.name,
                            type: file.type,
                            size: file.size,
                            dataUrl: e.target.result,
                            uploadedAt: new Date().toISOString()
                        };
                        
                        uploadedImages.push(imageData);
                        
                        // Update preview
                        updateImagePreview(e.target.result);

                        // Update URL input WITH THE DATA URL
                        document.getElementById('productImage').value = e.target.result;

                        // Save to localStorage for persistence
                        saveUploadedImages();

                        showAdminNotification('✅ Image uploaded successfully!', 'success');
                    };
                    reader.readAsDataURL(file);
                });
        }
    }, 100);
}

// ===== CAMERA FUNCTIONS WITH SWITCH CAPABILITY =====
function openCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Camera access is not supported in your browser');
        return;
    }
    
    // Create camera preview modal
    const cameraModal = document.createElement('div');
    cameraModal.className = 'camera-preview';
    cameraModal.id = 'cameraModal';
    
    cameraModal.innerHTML = `
        <div class="camera-header">
            <h3><i class="fas fa-camera"></i> Take Product Photo</h3>
            <button class="btn-close-camera" onclick="closeCamera()">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="camera-container">
            <video class="camera-video" id="cameraVideo" autoplay playsinline></video>
            <div class="camera-overlay">
                <div class="camera-frame">
                    <div class="frame-text">Position product within frame</div>
                </div>
            </div>
        </div>
        <div class="camera-controls">
            <button class="btn-camera-switch" onclick="switchCamera()" title="Switch Camera">
                <i class="fas fa-sync-alt"></i> Switch Camera
            </button>
            <button class="btn-capture" onclick="capturePhoto()">
                <i class="fas fa-camera"></i> Capture Photo
            </button>
            <button class="btn-cancel" onclick="closeCamera()">
                <i class="fas fa-times"></i> Cancel
            </button>
        </div>
    `;
    
    document.body.appendChild(cameraModal);
    
    // Start with front camera
    startCamera('user');
}

// Start camera with specific facing mode
function startCamera(facingMode) {
    if (currentStream) {
        // Stop the current stream
        currentStream.getTracks().forEach(track => track.stop());
    }
    
    navigator.mediaDevices.getUserMedia({ 
        video: { 
            facingMode: facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 }
        } 
    })
    .then(function(stream) {
        currentStream = stream;
        const video = document.getElementById('cameraVideo');
        video.srcObject = stream;
        
        // Apply mirror effect only for front camera
        if (facingMode === 'user') {
            video.style.transform = 'scaleX(-1)';
        } else {
            video.style.transform = 'scaleX(1)';
        }
        
        currentCamera = facingMode;
    })
    .catch(function(err) {
        console.error('Camera error:', err);
        alert('Unable to access camera. Please check permissions.');
        closeCamera();
    });
}

// Switch between front and rear camera
function switchCamera() {
    if (currentCamera === 'user') {
        // Switch to rear camera
        startCamera('environment');
        showAdminNotification('Switched to rear camera', 'info');
    } else {
        // Switch to front camera
        startCamera('user');
        showAdminNotification('Switched to front camera', 'info');
    }
}

// Capture photo from camera
function capturePhoto() {
    // Add flash effect
    const flash = document.createElement('div');
    flash.className = 'camera-flash';
    const cameraContainer = document.querySelector('.camera-container');
    if (cameraContainer) {
        cameraContainer.appendChild(flash);
        setTimeout(() => flash.remove(), 500);
    }
    
    setTimeout(() => {
        const video = document.getElementById('cameraVideo');
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        // Set canvas dimensions to video dimensions
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw video frame with correct orientation
        if (currentCamera === 'user') {
            // For front camera, flip horizontally for correct orientation
            context.translate(canvas.width, 0);
            context.scale(-1, 1);
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
        } else {
            // For rear camera, normal orientation
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
        }
        
        // Convert to compressed data URL
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        
        // Create image object
        const imageData = {
            id: Date.now(),
            name: `product-photo-${Date.now()}.jpg`,
            type: 'image/jpeg',
            size: dataUrl.length,
            dataUrl: dataUrl,
            uploadedAt: new Date().toISOString(),
            source: 'camera',
            cameraType: currentCamera === 'user' ? 'front' : 'rear'
        };
        
        // Add to uploaded images
        uploadedImages.push(imageData);
        
        // Optimize and save
        optimizeDataURL(dataUrl)
            .then(optimizedDataUrl => {
                updateImagePreview(optimizedDataUrl);
                document.getElementById('productImage').value = optimizedDataUrl;
                saveUploadedImages();
                closeCamera();
                showAdminNotification('✅ Photo captured successfully!', 'success');
            });
    }, 100); // Small delay for flash effect
}

// Close camera
function closeCamera() {
    const cameraModal = document.getElementById('cameraModal');
    if (cameraModal) {
        // Stop camera stream
        if (currentStream) {
            currentStream.getTracks().forEach(track => track.stop());
            currentStream = null;
        }
        
        cameraModal.remove();
    }
}

// Paste image from clipboard
function pasteImage() {
    // Focus on the page to enable paste
    document.body.focus();
    
    showAdminNotification('📋 Press Ctrl+V (Cmd+V on Mac) to paste an image', 'info');
}

// Save uploaded images to localStorage
function saveUploadedImages() {
    try {
        // Only save recent images (last 20) to avoid localStorage limit
        const recentImages = uploadedImages.slice(-20);
        localStorage.setItem('wigUploadedImages', JSON.stringify(recentImages));
    } catch (e) {
        console.error('Error saving images:', e);
    }
}

// Load uploaded images from localStorage
function loadUploadedImages() {
    try {
        const imagesJSON = localStorage.getItem('wigUploadedImages');
        if (imagesJSON) {
            uploadedImages = JSON.parse(imagesJSON);
            
            // Display recent images gallery if there are any
            if (uploadedImages.length > 0) {
                displayRecentImages();
            }
        }
    } catch (e) {
        console.error('Error loading images:', e);
        uploadedImages = [];
    }
}

// Display recent images gallery
function displayRecentImages() {
    const preview = document.getElementById('imagePreview');
    if (!preview || uploadedImages.length === 0) return;
    
    const galleryHTML = `
        <h4 style="margin-bottom: 10px; color: #333; text-align: left;">Recent Images</h4>
        <div class="preview-grid">
            ${uploadedImages.slice(-6).map(image => `
                <div class="preview-item" onclick="selectRecentImage('${image.dataUrl}')">
                    <img src="${image.dataUrl}" alt="${image.name}">
                    <button class="remove-btn" onclick="event.stopPropagation(); removeUploadedImage(${image.id})">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `).join('')}
        </div>
        <p style="margin-top: 10px; color: #666; font-size: 12px; text-align: left;">
            Click on an image to select it
        </p>
    `;
    
    preview.innerHTML = galleryHTML;
}

// Select recent image
function selectRecentImage(dataUrl) {
    // Select recent image
    document.getElementById('productImage').value = dataUrl;
    updateImagePreview(dataUrl);
    showAdminNotification('✅ Image selected', 'success');
}

// Remove uploaded image
function removeUploadedImage(imageId) {
    if (confirm('Remove this image?')) {
        uploadedImages = uploadedImages.filter(img => img.id !== imageId);
        saveUploadedImages();
        displayRecentImages();
        showAdminNotification('Image removed', 'info');
    }
}

// Initialize image upload when showing add product section
function initImageUpload() {
    setupImageUpload();
    loadUploadedImages();
    
    // Check if there's an existing image in the form
    const imageUrl = document.getElementById('productImage').value;
    if (imageUrl) {
        updateImagePreview(imageUrl);
    }
}

// ===== ADMIN SUPPORT SYSTEM FUNCTIONS =====

// Load admin tickets
function loadAdminTickets() {
    const ticketsKey = 'wigSupportTickets';
    const ticketsJSON = localStorage.getItem(ticketsKey);
    
    let tickets = [];
    if (ticketsJSON) {
        try {
            tickets = JSON.parse(ticketsJSON);
        } catch (e) {
            console.error('Error parsing admin tickets:', e);
            tickets = [];
        }
    } else {
        // Initialize with empty array if not exists
        localStorage.setItem(ticketsKey, JSON.stringify([]));
        tickets = [];
    }
    
    return tickets;
}

// Display admin tickets
function displayAdminTickets(tickets) {
    const tableBody = document.getElementById('adminTicketsTable');
    if (!tableBody) return;
    
    if (tickets.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" class="empty-table">
                    No support tickets found.
                </td>
            </tr>
        `;
        return;
    }
    
    // Update stats
    updateTicketStats(tickets);
    
    // Sort by date (newest first)
    tickets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    let html = '';
    
    tickets.forEach(ticket => {
        const statusClass = getAdminStatusClass(ticket.status);
        const priorityClass = getAdminPriorityClass(ticket.priority);
        const createdAt = new Date(ticket.createdAt).toLocaleDateString();
        const updatedAt = new Date(ticket.updatedAt).toLocaleDateString();
        const hasUnread = ticket.lastViewedByAdmin === null || 
                         new Date(ticket.updatedAt) > new Date(ticket.lastViewedByAdmin);
        
        html += `
            <tr class="${hasUnread ? 'unread-ticket' : ''}">
                <td>
                    <strong>${ticket.id}</strong>
                    ${hasUnread ? '<span class="unread-badge">NEW</span>' : ''}
                </td>
                <td>
                    <div class="customer-cell">
                        <div class="customer-avatar-small">
                            ${ticket.customer.username ? ticket.customer.username.charAt(0).toUpperCase() : 'C'}
                        </div>
                        <div>
                            <div class="customer-name">${ticket.customer.username || 'Unknown'}</div>
                            <div class="customer-email">${ticket.customer.email}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <strong class="ticket-subject" onclick="viewAdminTicket('${ticket.id}')">${ticket.subject}</strong>
                    ${ticket.orderId ? `<div class="ticket-order">Order: ${ticket.orderId}</div>` : ''}
                </td>
                <td>
                    <span class="category-badge">${ticket.category}</span>
                </td>
                <td>
                    <span class="priority-badge ${priorityClass}">${ticket.priority}</span>
                </td>
                <td>
                    <span class="status-badge ${statusClass}">${ticket.status}</span>
                </td>
                <td>${createdAt}</td>
                <td>${updatedAt}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn view" onclick="viewAdminTicket('${ticket.id}')" title="View Ticket">
                            <i class="fas fa-eye"></i>
                        </button>
                        ${ticket.status !== 'closed' && ticket.status !== 'resolved' ? `
                            <button class="action-btn reply" onclick="quickReply('${ticket.id}')" title="Quick Reply">
                                <i class="fas fa-reply"></i>
                            </button>
                            <button class="action-btn resolve" onclick="resolveTicket('${ticket.id}')" title="Mark as Resolved">
                                <i class="fas fa-check"></i>
                            </button>
                        ` : ''}
                        <button class="action-btn delete" onclick="deleteTicket('${ticket.id}')" title="Delete Ticket">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
}

// Update ticket statistics
function updateTicketStats(tickets) {
    const openTickets = tickets.filter(t => t.status === 'open').length;
    const pendingTickets = tickets.filter(t => t.status === 'pending').length;
    const resolvedTickets = tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;
    
    if (document.getElementById('openTickets')) {
        document.getElementById('openTickets').textContent = openTickets;
    }
    if (document.getElementById('pendingTickets')) {
        document.getElementById('pendingTickets').textContent = pendingTickets;
    }
    if (document.getElementById('resolvedTickets')) {
        document.getElementById('resolvedTickets').textContent = resolvedTickets;
    }
}

// Filter admin tickets
function filterAdminTickets() {
    const searchTerm = document.getElementById('adminTicketSearch').value.toLowerCase();
    const statusFilter = document.getElementById('adminTicketStatusFilter').value;
    const priorityFilter = document.getElementById('adminTicketPriorityFilter').value;
    const categoryFilter = document.getElementById('adminTicketCategoryFilter').value;
    
    const tickets = loadAdminTickets();
    
    const filteredTickets = tickets.filter(ticket => {
        const matchesSearch = !searchTerm || 
            ticket.subject.toLowerCase().includes(searchTerm) ||
            ticket.message.toLowerCase().includes(searchTerm) ||
            ticket.customer.email.toLowerCase().includes(searchTerm) ||
            ticket.customer.username.toLowerCase().includes(searchTerm) ||
            (ticket.orderId && ticket.orderId.toLowerCase().includes(searchTerm));
        
        const matchesStatus = !statusFilter || ticket.status === statusFilter;
        const matchesPriority = !priorityFilter || ticket.priority === priorityFilter;
        const matchesCategory = !categoryFilter || ticket.category === categoryFilter;
        
        return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
    });
    
    displayAdminTickets(filteredTickets);
}

// View admin ticket details
function viewAdminTicket(ticketId) {
    const tickets = loadAdminTickets();
    const ticket = tickets.find(t => t.id === ticketId);
    
    if (!ticket) return;
    
    // Mark as viewed
    markTicketAsViewed(ticketId);
    
    const modalBody = document.getElementById('adminTicketModalBody');
    const modal = document.getElementById('adminTicketModal');
    
    const statusClass = getAdminStatusClass(ticket.status);
    const priorityClass = getAdminPriorityClass(ticket.priority);
    const createdAt = new Date(ticket.createdAt).toLocaleString();
    const updatedAt = new Date(ticket.updatedAt).toLocaleString();
    
    // Build replies HTML
    let repliesHtml = '';
    if (ticket.replies && ticket.replies.length > 0) {
        repliesHtml = `
            <div class="conversation-history">
                <h4>Conversation History</h4>
                ${ticket.replies.map(reply => `
                    <div class="conversation-message ${reply.from === 'admin' ? 'admin-message' : 'customer-message'}">
                        <div class="message-header">
                            <strong>${reply.from === 'admin' ? 'You (Support)' : ticket.customer.username || 'Customer'}</strong>
                            <span class="message-time">${new Date(reply.timestamp).toLocaleString()}</span>
                        </div>
                        <div class="message-content">
                            ${reply.message}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    modalBody.innerHTML = `
        <div class="ticket-detail-admin">
            <div class="ticket-header-admin">
                <div class="ticket-title-section">
                    <h2>${ticket.subject}</h2>
                    <div class="ticket-meta-admin">
                        <span class="status-badge ${statusClass}">${ticket.status}</span>
                        <span class="priority-badge ${priorityClass}">${ticket.priority}</span>
                        <span class="ticket-id">${ticket.id}</span>
                    </div>
                </div>
                <div class="customer-info-admin">
                    <div class="customer-avatar-admin">
                        ${ticket.customer.username ? ticket.customer.username.charAt(0).toUpperCase() : 'C'}
                    </div>
                    <div>
                        <div class="customer-name-admin">${ticket.customer.username || 'Unknown'}</div>
                        <div class="customer-email-admin">${ticket.customer.email}</div>
                    </div>
                </div>
            </div>
            
            <div class="ticket-info-admin">
                <div class="info-grid-admin">
                    <div class="info-item-admin">
                        <label>Category:</label>
                        <span>${ticket.category}</span>
                    </div>
                    <div class="info-item-admin">
                        <label>Created:</label>
                        <span>${createdAt}</span>
                    </div>
                    ${ticket.orderId ? `
                        <div class="info-item-admin">
                            <label>Order ID:</label>
                            <span>${ticket.orderId}</span>
                        </div>
                    ` : ''}
                    <div class="info-item-admin">
                        <label>Last Updated:</label>
                        <span>${updatedAt}</span>
                    </div>
                </div>
            </div>
            
            <div class="original-message-admin">
                <h4>Original Message from Customer</h4>
                <div class="message-content-admin">
                    ${ticket.message}
                </div>
            </div>
            
            ${repliesHtml}
            
            <div class="admin-reply-section">
                <h4>Reply to Customer</h4>
                <textarea id="adminReplyMessage" rows="4" placeholder="Type your response here..."></textarea>
                <div class="reply-controls-admin">
                    <div class="status-controls">
                        <label>Update Status:</label>
                        <select id="adminTicketStatus">
                            <option value="answered" ${ticket.status === 'answered' ? 'selected' : ''}>Answered</option>
                            <option value="pending" ${ticket.status === 'pending' ? 'selected' : ''}>Pending</option>
                            <option value="resolved" ${ticket.status === 'resolved' ? 'selected' : ''}>Resolved</option>
                            <option value="closed" ${ticket.status === 'closed' ? 'selected' : ''}>Closed</option>
                        </select>
                    </div>
                    <div class="reply-actions-admin">
                        <button class="btn btn-secondary" onclick="closeAdminTicketModal()">
                            Cancel
                        </button>
                        <button class="btn btn-primary" onclick="sendAdminReply('${ticket.id}')">
                            <i class="fas fa-paper-plane"></i> Send Reply
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
}

// Mark ticket as viewed by admin
function markTicketAsViewed(ticketId) {
    const ticketsKey = 'wigSupportTickets';
    const ticketsJSON = localStorage.getItem(ticketsKey);
    
    if (!ticketsJSON) return;
    
    const tickets = JSON.parse(ticketsJSON);
    const ticketIndex = tickets.findIndex(t => t.id === ticketId);
    
    if (ticketIndex !== -1) {
        tickets[ticketIndex].lastViewedByAdmin = new Date().toISOString();
        localStorage.setItem(ticketsKey, JSON.stringify(tickets));
    }
}

// Send admin reply
function sendAdminReply(ticketId) {
    const replyMessage = document.getElementById('adminReplyMessage').value.trim();
    const newStatus = document.getElementById('adminTicketStatus').value;
    
    if (!replyMessage) {
        alert('Please enter a reply message');
        return;
    }
    
    const ticketsKey = 'wigSupportTickets';
    const ticketsJSON = localStorage.getItem(ticketsKey);
    
    if (!ticketsJSON) return;
    
    const tickets = JSON.parse(ticketsJSON);
    const ticketIndex = tickets.findIndex(t => t.id === ticketId);
    
    if (ticketIndex === -1) return;
    
    // Add admin reply
    const adminReply = {
        message: replyMessage,
        from: 'admin',
        timestamp: new Date().toISOString(),
        adminName: document.getElementById('adminName').textContent || 'Administrator'
    };
    
    tickets[ticketIndex].replies.push(adminReply);
    tickets[ticketIndex].status = newStatus;
    tickets[ticketIndex].updatedAt = new Date().toISOString();
    tickets[ticketIndex].adminStatus = 'handled';
    tickets[ticketIndex].assignedTo = document.getElementById('adminName').textContent || 'Admin';
    
    // Save updated ticket
    localStorage.setItem(ticketsKey, JSON.stringify(tickets));
    
    // Also update customer version
    updateCustomerTicket(tickets[ticketIndex]);
    
    // Show success and close modal
    alert('✅ Reply sent successfully!');
    closeAdminTicketModal();
    displayAdminTickets(tickets);
}

// Update customer ticket
function updateCustomerTicket(updatedTicket) {
    const customerEmail = updatedTicket.customer.email;
    const customerTicketsKey = `tickets_${customerEmail}`;
    const customerTicketsJSON = localStorage.getItem(customerTicketsKey);
    
    if (!customerTicketsJSON) return;
    
    const customerTickets = JSON.parse(customerTicketsJSON);
    const customerTicketIndex = customerTickets.findIndex(t => t.id === updatedTicket.id);
    
    if (customerTicketIndex !== -1) {
        customerTickets[customerTicketIndex] = {
            ...customerTickets[customerTicketIndex],
            status: updatedTicket.status,
            replies: updatedTicket.replies,
            updatedAt: updatedTicket.updatedAt,
            assignedTo: updatedTicket.assignedTo
        };
        
        localStorage.setItem(customerTicketsKey, JSON.stringify(customerTickets));
    }
}

// Quick reply function
function quickReply(ticketId) {
    const reply = prompt('Enter your quick reply:');
    if (reply && reply.trim()) {
        sendQuickAdminReply(ticketId, reply.trim());
    }
}

function sendQuickAdminReply(ticketId, message) {
    const ticketsKey = 'wigSupportTickets';
    const ticketsJSON = localStorage.getItem(ticketsKey);
    
    if (!ticketsJSON) return;
    
    const tickets = JSON.parse(ticketsJSON);
    const ticketIndex = tickets.findIndex(t => t.id === ticketId);
    
    if (ticketIndex === -1) return;
    
    const adminReply = {
        message: message,
        from: 'admin',
        timestamp: new Date().toISOString(),
        adminName: document.getElementById('adminName').textContent || 'Administrator'
    };
    
    tickets[ticketIndex].replies.push(adminReply);
    tickets[ticketIndex].status = 'answered';
    tickets[ticketIndex].updatedAt = new Date().toISOString();
    tickets[ticketIndex].adminStatus = 'handled';
    tickets[ticketIndex].assignedTo = document.getElementById('adminName').textContent || 'Admin';
    
    localStorage.setItem(ticketsKey, JSON.stringify(tickets));
    updateCustomerTicket(tickets[ticketIndex]);
    
    alert('✅ Quick reply sent!');
    displayAdminTickets(tickets);
}

// Resolve ticket
function resolveTicket(ticketId) {
    if (!confirm('Mark this ticket as resolved?')) return;
    
    const ticketsKey = 'wigSupportTickets';
    const ticketsJSON = localStorage.getItem(ticketsKey);
    
    if (!ticketsJSON) return;
    
    const tickets = JSON.parse(ticketsJSON);
    const ticketIndex = tickets.findIndex(t => t.id === ticketId);
    
    if (ticketIndex === -1) return;
    
    tickets[ticketIndex].status = 'resolved';
    tickets[ticketIndex].updatedAt = new Date().toISOString();
    tickets[ticketIndex].adminStatus = 'resolved';
    
    localStorage.setItem(ticketsKey, JSON.stringify(tickets));
    updateCustomerTicket(tickets[ticketIndex]);
    
    alert('✅ Ticket marked as resolved!');
    displayAdminTickets(tickets);
}

// Delete ticket
function deleteTicket(ticketId) {
    if (!confirm('Are you sure you want to delete this ticket? This action cannot be undone.')) {
        return;
    }
    
    const ticketsKey = 'wigSupportTickets';
    const ticketsJSON = localStorage.getItem(ticketsKey);
    
    if (!ticketsJSON) return;
    
    const tickets = JSON.parse(ticketsJSON);
    const updatedTickets = tickets.filter(t => t.id !== ticketId);
    
    localStorage.setItem(ticketsKey, JSON.stringify(updatedTickets));
    
    alert('✅ Ticket deleted successfully!');
    displayAdminTickets(updatedTickets);
}

// Close admin ticket modal
function closeAdminTicketModal() {
    document.getElementById('adminTicketModal').classList.remove('active');
}

// Export tickets
function exportTickets() {
    const tickets = loadAdminTickets();
    
    if (tickets.length === 0) {
        alert('No tickets to export');
        return;
    }
    
    const csvContent = convertToCSV(tickets);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `wighub-tickets-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    URL.revokeObjectURL(url);
    alert(`✅ ${tickets.length} tickets exported successfully!`);
}

function convertToCSV(tickets) {
    const headers = ['ID', 'Customer Name', 'Customer Email', 'Subject', 'Category', 'Priority', 'Status', 'Order ID', 'Created At', 'Last Updated', 'Replies Count'];
    
    const rows = tickets.map(ticket => [
        ticket.id,
        ticket.customer.username || 'Unknown',
        ticket.customer.email,
        `"${ticket.subject}"`,
        ticket.category,
        ticket.priority,
        ticket.status,
        ticket.orderId || 'N/A',
        new Date(ticket.createdAt).toLocaleString(),
        new Date(ticket.updatedAt).toLocaleString(),
        ticket.replies ? ticket.replies.length : 0
    ]);
    
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}

// Refresh tickets
function refreshTickets() {
    const tickets = loadAdminTickets();
    displayAdminTickets(tickets);
    showAdminNotification('✅ Tickets refreshed!', 'success');
}

// Helper functions for admin
function getAdminStatusClass(status) {
    const statusClasses = {
        'open': 'status-open',
        'pending': 'status-pending',
        'answered': 'status-answered',
        'resolved': 'status-resolved',
        'closed': 'status-closed'
    };
    return statusClasses[status] || 'status-open';
}

function getAdminPriorityClass(priority) {
    const priorityClasses = {
        'low': 'priority-low',
        'medium': 'priority-medium',
        'high': 'priority-high',
        'urgent': 'priority-urgent'
    };
    return priorityClasses[priority] || 'priority-medium';
}

// Mobile Sidebar Toggle Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Create sidebar toggle button
    const sidebarToggle = document.createElement('button');
    sidebarToggle.className = 'sidebar-toggle';
    sidebarToggle.innerHTML = '<i class="fas fa-chevron-right"></i>';
    document.body.appendChild(sidebarToggle);
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);
    
    const sidebar = document.querySelector('.admin-sidebar');
    const contentArea = document.querySelector('.admin-content-area');
    const footer = document.querySelector('.admin-footer');
    
    // Toggle sidebar function
    function toggleSidebar() {
        sidebar.classList.toggle('expanded');
        sidebarToggle.classList.toggle('expanded');
        overlay.classList.toggle('active');
        
        // Update toggle button icon
        const icon = sidebarToggle.querySelector('i');
        if (sidebar.classList.contains('expanded')) {
            icon.className = 'fas fa-chevron-left';
        } else {
            icon.className = 'fas fa-chevron-right';
        }
    }
    
    // Event listeners
    sidebarToggle.addEventListener('click', toggleSidebar);
    overlay.addEventListener('click', toggleSidebar);
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(event) {
        if (window.innerWidth <= 768 && 
            sidebar.classList.contains('expanded') &&
            !sidebar.contains(event.target) &&
            !sidebarToggle.contains(event.target)) {
            toggleSidebar();
        }
    });
    
    // Handle touch events for better mobile experience
    let touchStartX = 0;
    let touchEndX = 0;
    
    document.addEventListener('touchstart', function(event) {
        touchStartX = event.changedTouches[0].screenX;
    });
    
    document.addEventListener('touchend', function(event) {
        touchEndX = event.changedTouches[0].screenX;
        handleSwipe();
    });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const swipeDistance = touchEndX - touchStartX;
        
        // Swipe right to open sidebar
        if (swipeDistance > swipeThreshold && 
            !sidebar.classList.contains('expanded') &&
            touchStartX < 50) {
            toggleSidebar();
        }
        
        // Swipe left to close sidebar
        else if (swipeDistance < -swipeThreshold && 
                 sidebar.classList.contains('expanded')) {
            toggleSidebar();
        }
    }
    
    // Update active menu item on click
    const menuButtons = document.querySelectorAll('.admin-btn');
    menuButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            menuButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            // Auto-close sidebar on mobile after selection
            if (window.innerWidth <= 768) {
                setTimeout(toggleSidebar, 300);
            }
        });
    });
    
    // Adjust for window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            // Reset to desktop mode
            sidebar.classList.remove('expanded');
            sidebarToggle.classList.remove('expanded');
            overlay.classList.remove('active');
            sidebarToggle.querySelector('i').className = 'fas fa-chevron-right';
        }
    });
});

// ============================================
// DEVICE UNBLOCKING FUNCTIONS
// ============================================

// Load blocked devices
function loadBlockedDevices() {
    console.log('Loading blocked devices...');
    
    const blockedDevices = [];
    const now = Date.now();
    
    // Find all admin blocks
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('admin_block_')) {
            try {
                const data = JSON.parse(localStorage.getItem(key));
                if (data && data.blockedUntil) {
                    blockedDevices.push({
                        key: key,
                        deviceId: key.replace('admin_block_', ''),
                        data: data
                    });
                }
            } catch (e) {
                console.warn('Error reading block:', key);
            }
        }
    }
    
    // Update table
    updateBlockedDevicesTable(blockedDevices, now);
}

// Update the table
function updateBlockedDevicesTable(devices, now) {
    const table = document.getElementById('blockedDevicesTable');
    if (!table) return;
    
    if (devices.length === 0) {
        table.innerHTML = '<tr><td colspan="7" style="padding: 40px; text-align: center; color: #999;">No blocked devices found</td></tr>';
        return;
    }
    
    let html = '';
    devices.forEach(device => {
        const deviceId = device.deviceId;
        const data = device.data;
        
        // Calculate time left
        const timeLeft = data.blockedUntil - now;
        const minutesLeft = Math.ceil(timeLeft / 60000);
        const hours = Math.floor(minutesLeft / 60);
        const minutes = minutesLeft % 60;
        
        // Status
        let status = 'Active';
        let statusColor = '#ffd166';
        if (timeLeft <= 0) {
            status = 'Expired';
            statusColor = '#06d6a0';
        }
        
        html += `
            <tr>
                <td>
                    <div style="font-family: monospace; background: #f1f3f4; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                        ${deviceId.substring(0, 12)}...
                    </div>
                </td>
                <td>${new Date(data.blockedAt).toLocaleDateString()}</td>
                <td>${new Date(data.blockedUntil).toLocaleDateString()}</td>
                <td>${timeLeft > 0 ? `${hours}h ${minutes}m` : '0h 0m'}</td>
                <td>${data.reason || 'Multiple failed attempts'}</td>
                <td>
                    <span style="background: ${statusColor}; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px;">
                        ${status}
                    </span>
                </td>
                <td>
                    <button onclick="unblockSingleDevice('${device.key}', '${deviceId}')" 
                            style="background: #06d6a0; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; margin-right: 5px;">
                        <i class="fas fa-unlock"></i> Unblock
                    </button>
                </td>
            </tr>
        `;
    });
    
    table.innerHTML = html;
}

// Unblock a single device
function unblockSingleDevice(key, deviceId) {
    if (confirm(`Unblock device ${deviceId.substring(0, 10)}...?`)) {
        localStorage.removeItem(key);
        
        // Also remove attempts
        const attemptsKey = `admin_attempts_${deviceId}`;
        localStorage.removeItem(attemptsKey);
        
        alert('Device unblocked successfully!');
        loadBlockedDevices();
    }
}

// Unblock all devices
function unblockAllDevices() {
    if (confirm('Unblock ALL devices? This will allow all blocked devices to login.')) {
        let count = 0;
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('admin_block_')) {
                localStorage.removeItem(key);
                count++;
            }
        }
        
        alert(`Unblocked ${count} devices`);
        loadBlockedDevices();
    }
}

// Simple filter
function filterDevices() {
    const search = document.getElementById('deviceSearch')?.value.toLowerCase() || '';
    const rows = document.querySelectorAll('#blockedDevicesTable tr');
    
    rows.forEach(row => {
        if (row.querySelector('td[colspan]')) return; // Skip empty row
        
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(search) ? '' : 'none';
    });
}

// Test function (optional)
function createTestBlock() {
    const testId = 'test_' + Date.now();
    const testBlock = {
        deviceId: testId,
        blockedAt: Date.now(),
        blockedUntil: Date.now() + 3600000,
        reason: 'Test block',
        deviceInfo: { platform: 'Test' }
    };
    
    localStorage.setItem(`admin_block_${testId}`, JSON.stringify(testBlock));
    alert('Test block created. Refresh to see it.');
    loadBlockedDevices();

    // ===== NEW URL PASTE FUNCTIONS - ADD AT THE END OF YOUR FILE =====

// Focus the URL input when "Paste URL" button is clicked
function focusUrlInput() {
    const input = document.getElementById('productImage');
    if (input) {
        input.focus();
        input.select();
        showAdminNotification('📋 Paste your image URL (Ctrl+V)', 'info');
    }
}

// Handle paste event on URL input
document.addEventListener('DOMContentLoaded', function() {
    // Add paste event listener for URL input
    const imageUrlInput = document.getElementById('productImage');
    if (imageUrlInput) {
        imageUrlInput.addEventListener('paste', function(e) {
            e.preventDefault();
            
            const pastedText = e.clipboardData.getData('text');
            
            if (pastedText && (pastedText.startsWith('http://') || pastedText.startsWith('https://'))) {
                console.log('📋 Image URL pasted:', pastedText);
                
                this.value = pastedText;
                loadImageFromUrl(pastedText);
                showAdminNotification('📋 Loading image from URL...', 'info');
            } else if (pastedText) {
                showAdminNotification('⚠️ Please paste a valid URL starting with http:// or https://', 'error');
            }
        });
        
        // Also load when input loses focus
        imageUrlInput.addEventListener('blur', function() {
            const url = this.value.trim();
            if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
                loadImageFromUrl(url);
            }
        });
    }
});

// Load image from URL and display preview
function loadImageFromUrl(url) {
    const previewDiv = document.getElementById('imagePreview');
    if (!previewDiv) return;
    
    // Show loading
    previewDiv.innerHTML = `
        <div style="text-align: center; padding: 20px;">
            <i class="fas fa-spinner fa-spin" style="font-size: 30px; color: #3498db;"></i>
            <p style="margin-top: 10px; color: #666;">Loading image from URL...</p>
        </div>
    `;
    
    const img = new Image();
    img.crossOrigin = "anonymous";
    
    img.onload = function() {
        previewDiv.innerHTML = `
            <div style="text-align: center;">
                <img src="${url}" alt="Preview" 
                     style="max-width: 100%; max-height: 300px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <div style="margin-top: 10px;">
                    <span style="background: #28a745; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px;">
                        <i class="fas fa-check-circle"></i> Image Loaded
                    </span>
                </div>
            </div>
        `;
        showAdminNotification('✅ Image loaded successfully!', 'success');
    };
    
    img.onerror = function() {
        previewDiv.innerHTML = `
            <div style="text-align: center; padding: 20px; background: #fff3cd; border-radius: 8px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 30px; color: #856404;"></i>
                <p style="margin-top: 10px; color: #856404;">Failed to load image</p>
                <button class="btn btn-secondary" onclick="retryLoadImage()" style="margin-top: 10px; padding: 5px 15px;">
                    <i class="fas fa-sync-alt"></i> Retry
                </button>
            </div>
        `;
        showAdminNotification('❌ Failed to load image. Check the URL.', 'error');
    };
    
    img.src = url;
}

// Retry loading image
function retryLoadImage() {
    const url = document.getElementById('productImage').value.trim();
    if (url) {
        loadImageFromUrl(url);
    }
}

// Use example URL
function useExampleUrl(url) {
    document.getElementById('productImage').value = url;
    loadImageFromUrl(url);
}
}

// ===== HERO IMAGES MANAGEMENT =====

// Load hero images from localStorage
function loadHeroImages() {
    const heroImages = JSON.parse(localStorage.getItem('wigHeroImages') || '[]');
    displayHeroImages(heroImages);
    return heroImages;
}

// Display hero images in admin table
function displayHeroImages(images) {
    const tableBody = document.getElementById('heroImagesTable');
    if (!tableBody) return;
    
    if (images.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="empty-table">No hero images added yet</td></tr>';
        return;
    }
    
    // Sort by order
    images.sort((a, b) => a.order - b.order);
    
    let html = '';
    images.forEach((img, index) => {
        html += `
            <tr>
                <td>${img.order}</td>
                <td>
                    <img src="${img.image}" style="width: 100px; height: 60px; object-fit: cover; border-radius: 5px;">
                </td>
                <td>${img.title || '-'}</td>
                <td>${img.subtitle || '-'}</td>
                <td>
                    <span class="status-badge ${img.status === 'active' ? 'status-active' : 'status-inactive'}">
                        ${img.status || 'active'}
                    </span>
                </td>
                <td>
                    <div style="display: flex; gap: 5px;">
                        <button class="action-btn edit" onclick="editHeroImage(${index})" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="deleteHeroImage(${index})" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button class="action-btn view" onclick="moveHeroImage(${index}, 'up')" title="Move Up">
                            <i class="fas fa-arrow-up"></i>
                        </button>
                        <button class="action-btn view" onclick="moveHeroImage(${index}, 'down')" title="Move Down">
                            <i class="fas fa-arrow-down"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
}

// Browse hero image
function browseHeroImage() {
    document.getElementById('heroImageFileInput').click();
}

// Handle hero image upload
function handleHeroImageUpload(file) {
    if (!file || !file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById('heroImagePreview');
        preview.innerHTML = `<img src="${e.target.result}" style="max-width: 100%; max-height: 300px; border-radius: 8px;">`;
        document.getElementById('heroImageUrl').value = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Open camera for hero image
function openHeroCamera() {
    openCamera(); // Reuse existing camera function
    // Override the capture photo to update hero preview
    const originalCapture = capturePhoto;
    window.capturePhoto = function() {
        const video = document.getElementById('cameraVideo');
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        
        document.getElementById('heroImagePreview').innerHTML = `<img src="${dataUrl}" style="max-width: 100%; max-height: 300px; border-radius: 8px;">`;
        document.getElementById('heroImageUrl').value = dataUrl;
        closeCamera();
    };
}

// Focus hero URL input
function focusHeroUrlInput() {
    document.getElementById('heroImageUrl').focus();
}

// Add hero image
function addHeroImage() {
    const image = document.getElementById('heroImageUrl').value.trim();
    const title = document.getElementById('heroTitle').value.trim();
    const subtitle = document.getElementById('heroSubtitle').value.trim();
    const order = parseInt(document.getElementById('heroOrder').value) || 0;
    const status = document.getElementById('heroStatus').value;
    
    if (!image) {
        alert('Please select an image');
        return;
    }
    
    const heroImages = JSON.parse(localStorage.getItem('wigHeroImages') || '[]');
    
    const newImage = {
        id: Date.now(),
        image: image,
        title: title,
        subtitle: subtitle,
        order: order,
        status: status,
        createdAt: new Date().toISOString()
    };
    
    heroImages.push(newImage);
    localStorage.setItem('wigHeroImages', JSON.stringify(heroImages));
    
    clearHeroForm();
    displayHeroImages(heroImages);
    showAdminNotification('✅ Hero image added successfully!', 'success');
}

// Clear hero form
function clearHeroForm() {
    document.getElementById('heroImageUrl').value = '';
    document.getElementById('heroTitle').value = '';
    document.getElementById('heroSubtitle').value = '';
    document.getElementById('heroOrder').value = '0';
    document.getElementById('heroStatus').value = 'active';
    document.getElementById('heroImagePreview').innerHTML = '<p style="color: #999;">Image preview will appear here</p>';
    document.getElementById('heroImageFileInput').value = '';
}

// Delete hero image
function deleteHeroImage(index) {
    if (!confirm('Are you sure you want to delete this hero image?')) return;
    
    const heroImages = JSON.parse(localStorage.getItem('wigHeroImages') || '[]');
    heroImages.splice(index, 1);
    localStorage.setItem('wigHeroImages', JSON.stringify(heroImages));
    displayHeroImages(heroImages);
    showAdminNotification('✅ Hero image deleted!', 'success');
}

// Edit hero image
function editHeroImage(index) {
    const heroImages = JSON.parse(localStorage.getItem('wigHeroImages') || '[]');
    const img = heroImages[index];
    
    document.getElementById('heroImageUrl').value = img.image;
    document.getElementById('heroTitle').value = img.title || '';
    document.getElementById('heroSubtitle').value = img.subtitle || '';
    document.getElementById('heroOrder').value = img.order || 0;
    document.getElementById('heroStatus').value = img.status || 'active';
    document.getElementById('heroImagePreview').innerHTML = `<img src="${img.image}" style="max-width: 100%; max-height: 300px; border-radius: 8px;">`;
    
    // Change add button to update button
    const formActions = document.querySelector('#heroImagesSection .form-actions');
    formActions.innerHTML = `
        <button type="button" class="btn btn-secondary" onclick="clearHeroForm()">Cancel</button>
        <button type="button" class="btn btn-primary" onclick="updateHeroImage(${index})">Update Image</button>
    `;
}

// Update hero image
function updateHeroImage(index) {
    const heroImages = JSON.parse(localStorage.getItem('wigHeroImages') || '[]');
    
    heroImages[index] = {
        ...heroImages[index],
        image: document.getElementById('heroImageUrl').value.trim(),
        title: document.getElementById('heroTitle').value.trim(),
        subtitle: document.getElementById('heroSubtitle').value.trim(),
        order: parseInt(document.getElementById('heroOrder').value) || 0,
        status: document.getElementById('heroStatus').value,
        updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem('wigHeroImages', JSON.stringify(heroImages));
    
    // Reset form
    clearHeroForm();
    const formActions = document.querySelector('#heroImagesSection .form-actions');
    formActions.innerHTML = `
        <button type="button" class="btn btn-secondary" onclick="clearHeroForm()">Clear</button>
        <button type="button" class="btn btn-primary" onclick="addHeroImage()">Add Hero Image</button>
    `;
    
    displayHeroImages(heroImages);
    showAdminNotification('✅ Hero image updated!', 'success');
}

// Move hero image up/down in order
function moveHeroImage(index, direction) {
    const heroImages = JSON.parse(localStorage.getItem('wigHeroImages') || '[]');
    
    if (direction === 'up' && index > 0) {
        [heroImages[index], heroImages[index - 1]] = [heroImages[index - 1], heroImages[index]];
    } else if (direction === 'down' && index < heroImages.length - 1) {
        [heroImages[index], heroImages[index + 1]] = [heroImages[index + 1], heroImages[index]];
    } else {
        return;
    }
    
    // Update order numbers
    heroImages.forEach((img, i) => {
        img.order = i;
    });
    
    localStorage.setItem('wigHeroImages', JSON.stringify(heroImages));
    displayHeroImages(heroImages);
    showAdminNotification('✅ Order updated!', 'success');
}

// Add to showAdminSection switch case
// In showAdminSection function, add this case:
/*
case 'heroImages':
    loadHeroImages();
    break;
*/