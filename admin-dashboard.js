// Admin Dashboard JavaScript - COMPLETE VERSION WITH SUPPORT SYSTEM
let allProducts = [];
let filteredProducts = [];
let allClients = [];
let allOrders = [];
let uploadedImages = []; // Store uploaded images

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
    syncAllClientsData(); // ADDED THIS LINE
    
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
            initImageUpload(); // ADDED THIS LINE
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

// Load products table
function loadProductsTable() {
    const tableBody = document.getElementById('adminProductsTable');
    if (!tableBody) return;
    
    if (filteredProducts.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-table">
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
                <td><strong>#${product.id}</strong></td>
                <td>
                    <img src="${product.image || 'https://via.placeholder.com/80x80?text=Wig'}" 
                         alt="${product.name}" 
                         style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; cursor: pointer;"
                         onclick="viewProduct(${product.id})">
                </td>
                <td>
                    <strong style="cursor: pointer;" onclick="viewProduct(${product.id})">${product.name}</strong><br>
                    <small style="color: #666;">${product.description.substring(0, 60)}...</small>
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
                        <button class="action-btn edit" onclick="editProduct(${product.id})" 
                                title="Edit Product" style="background: #3498db; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer;">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn view" onclick="viewProduct(${product.id})"
                                title="View Details" style="background: #2ecc71; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer;">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn delete" onclick="deleteProduct(${product.id})"
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

// Update image preview
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

// Add new product
function addProduct() {
    // Get form values
    const name = document.getElementById('productName').value.trim();
    const category = document.getElementById('productCategory').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const stock = parseInt(document.getElementById('productStock').value);
    const description = document.getElementById('productDescription').value.trim();
    const length = document.getElementById('productLength').value.trim();
    const color = document.getElementById('productColor').value.trim();
    const image = document.getElementById('productImage').value.trim();
    
    // Validate
    if (!name || !category || isNaN(price) || isNaN(stock) || !description) {
        alert('Please fill in all required fields (Name, Category, Price, Stock, Description)');
        return;
    }
    
    // Check if image is a data URL (too long for localStorage)
    let finalImage = image || 'https://via.placeholder.com/400x400?text=Wig+Image';
    
    // If it's a data URL and too long, compress or convert it
    if (image && image.startsWith('data:image') && image.length > 100000) {
        alert('Image is too large. Please use a smaller image or use image URL instead.');
        return;
    }
    
    // Create new product
    const newProduct = {
        id: allProducts.length > 0 ? Math.max(...allProducts.map(p => p.id)) + 1 : 1,
        name,
        category,
        price,
        stock,
        description,
        length: length || 'Not specified',
        color: color || 'Natural',
        image: finalImage,
        active: true,
        createdAt: new Date().toISOString()
    };
    
    // Add to products
    allProducts.push(newProduct);
    saveProducts();
    
    // Clear form
    clearProductForm();
    
    // Show success and switch to products section
    alert('Product added successfully!');
    showAdminSection('products');
}

// Clear product form
function clearProductForm() {
    document.getElementById('productName').value = '';
    document.getElementById('productCategory').value = '';
    document.getElementById('productPrice').value = '';
    document.getElementById('productStock').value = '';
    document.getElementById('productDescription').value = '';
    document.getElementById('productLength').value = '';
    document.getElementById('productColor').value = '';
    document.getElementById('productImage').value = '';
    // Add this line to clear file input
    if (document.getElementById('imageFileInput')) {
        document.getElementById('imageFileInput').value = '';
    }
    updateImagePreview('');
}

// Edit product
function editProduct(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    
    // Fill the form with product data
    document.getElementById('productName').value = product.name;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productStock').value = product.stock;
    document.getElementById('productDescription').value = product.description;
    document.getElementById('productLength').value = product.length;
    document.getElementById('productColor').value = product.color;
    document.getElementById('productImage').value = product.image;
    
    updateImagePreview(product.image);
    
    // Change form to edit mode
    const formActions = document.querySelector('.form-actions');
    if (formActions) {
        formActions.innerHTML = `
            <button type="button" class="btn btn-secondary" onclick="clearProductForm()">
                Cancel
            </button>
            <button type="button" class="btn btn-danger" onclick="deleteProduct(${product.id})">
                Delete Product
            </button>
            <button type="button" class="btn btn-primary" onclick="updateProduct(${product.id})">
                Update Product
            </button>
        `;
    }
    
    // Show add product section
    showAdminSection('addProduct');
}

// Update product
function updateProduct(productId) {
    const productIndex = allProducts.findIndex(p => p.id === productId);
    if (productIndex === -1) return;
    
    // Get form values
    const name = document.getElementById('productName').value.trim();
    const category = document.getElementById('productCategory').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const stock = parseInt(document.getElementById('productStock').value);
    const description = document.getElementById('productDescription').value.trim();
    const length = document.getElementById('productLength').value.trim();
    const color = document.getElementById('productColor').value.trim();
    const image = document.getElementById('productImage').value.trim();
    
    // Validate
    if (!name || !category || isNaN(price) || isNaN(stock) || !description) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Update product
    allProducts[productIndex] = {
        ...allProducts[productIndex],
        name,
        category,
        price,
        stock,
        description,
        length: length || 'Not specified',
        color: color || 'Natural',
        image: image || 'https://via.placeholder.com/400x400?text=Wig+Image',
        updatedAt: new Date().toISOString()
    };
    
    saveProducts();
    clearProductForm();
    
    // Reset form actions
    const formActions = document.querySelector('.form-actions');
    if (formActions) {
        formActions.innerHTML = `
            <button type="button" class="btn btn-secondary" onclick="clearProductForm()">
                Clear Form
            </button>
            <button type="button" class="btn btn-primary" onclick="addProduct()">
                Add Product
            </button>
        `;
    }
    
    alert('Product updated successfully!');
    showAdminSection('products');
}

// Delete product
function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }
    
    allProducts = allProducts.filter(p => p.id !== productId);
    saveProducts();
    
    alert('Product deleted successfully!');
    showAdminSection('products');
}

// Load orders table
function loadOrdersTable() {
    const tableBody = document.getElementById('adminOrdersTable');
    if (!tableBody) return;
    
    if (allOrders.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-table">No orders yet</td>
            </tr>
        `;
        return;
    }
    
    // Sort orders by date (newest first)
    const sortedOrders = [...allOrders].sort((a, b) => 
        new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)
    );
    
    let html = '';
    sortedOrders.forEach((order, index) => {
        const orderDate = new Date(order.date || order.createdAt);
        const formattedDate = orderDate.toLocaleDateString();
        const formattedTime = orderDate.toLocaleTimeString();
        
        let statusClass = 'pending';
        let statusText = 'Pending';
        if (order.status === 'delivered') {
            statusClass = 'delivered';
            statusText = 'Delivered';
        } else if (order.status === 'processing') {
            statusClass = 'processing';
            statusText = 'Processing';
        }
        
        const customerName = order.customer ? 
            order.customer.username || order.customer.email.split('@')[0] : 
            'Unknown Customer';
        
        html += `
            <tr>
                <td>${order.id || 'ORD' + (index + 1)}</td>
                <td>${customerName}</td>
                <td>${formattedDate} ${formattedTime}</td>
                <td>$${(order.total || 0).toFixed(2)}</td>
                <td>
                    <span class="status-badge ${statusClass}" 
                          style="padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;
                                 background: ${statusClass === 'delivered' ? '#d4edda' : statusClass === 'processing' ? '#d1ecf1' : '#fff3cd'};
                                 color: ${statusClass === 'delivered' ? '#155724' : statusClass === 'processing' ? '#0c5460' : '#856404'}">
                        ${statusText}
                    </span>
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
}

// Load recent products for dashboard
function loadRecentProducts() {
    const recentProductsContainer = document.getElementById('recentProducts');
    if (!recentProductsContainer) return;
    
    // Get 5 most recent products
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

// Load sample products
function loadSampleProducts() {
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
            image: "https://images.unsplash.com/photo-1522338242990-e923b56a8c8d?w=400&h=400&fit=crop",
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
    
    allProducts = sampleProducts;
    saveProducts();
    alert('Sample products loaded successfully!');
    showAdminSection('dashboard');
}

// Load settings
function loadSettings() {
    // This can be expanded with actual settings
}

// Export products
function exportProducts() {
    const dataStr = JSON.stringify(allProducts, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'wighub-products.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    alert('Products exported successfully!');
}

// Create backup
function createBackup() {
    const backup = {
        products: allProducts,
        clients: allClients,
        orders: allOrders,
        backupDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(backup, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `wighub-backup-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    alert('Backup created successfully!');
}

// Clear all data
function clearAllData() {
    if (!confirm('Are you sure you want to clear ALL data? This cannot be undone!')) {
        return;
    }
    
    // Clear all WigHub data
    localStorage.removeItem('wigProducts');
    localStorage.removeItem('wigClients');
    localStorage.removeItem('wigAdmins');
    localStorage.removeItem('wigSupportTickets');
    
    // Clear all order-related data
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('orders_') || key.startsWith('cart_') || key.startsWith('wishlist_') || key.startsWith('tickets_')) {
            localStorage.removeItem(key);
        }
    }
    
    // Reload data
    loadProducts();
    loadClients();
    loadOrders();
    
    alert('All data cleared successfully!');
    showAdminSection('dashboard');
}

// Logout admin
function logoutAdmin() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    window.location.href = 'admin-login.html';
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
    const product = allProducts.find(p => p.id === productId);
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
                        <img src="${product.image || 'https://via.placeholder.com/400x400?text=Wig'}" 
                             alt="${product.name}" 
                             style="width: 100%; border-radius: 10px; margin-bottom: 20px;">
                    </div>
                    
                    <div class="customer-details-grid">
                        <div class="detail-row">
                            <span class="detail-label">Product ID:</span>
                            <span class="detail-value">#${product.id}</span>
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
    showNotification('✅ Customer deleted successfully!', 'success');
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
        showNotification('Username and email are required', 'error');
        return;
    }
    
    // Check if email is being changed and already exists
    if (email !== allClients[clientIndex].email) {
        const emailExists = allClients.some((client, index) => 
            index !== clientIndex && client.email === email
        );
        if (emailExists) {
            showNotification('Email already exists. Please use a different email.', 'error');
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
    
    showNotification('✅ Customer updated successfully!', 'success');
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

// ===== IMAGE COMPRESSION FUNCTION =====
function compressImage(file, maxWidth = 800, quality = 0.7) {
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
                
                // Resize if too large
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // Get compressed data URL
                const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
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
                    // Hide progress bar
                    setTimeout(() => {
                        progressDiv.style.display = 'none';
                    }, 500);
                    
                    // Create image object with COMPRESSED data
                    const imageData = {
                        id: Date.now(),
                        name: file.name,
                        type: 'image/jpeg',
                        size: compressedDataUrl.length,
                        dataUrl: compressedDataUrl,
                        uploadedAt: new Date().toISOString()
                    };
                    
                    uploadedImages.push(imageData);
                    
                    // Update preview (show the uploaded image)
                    updateImagePreview(imageData.dataUrl);

                    // Update URL input WITH THE DATA URL
                    document.getElementById('productImage').value = imageData.dataUrl;

                    // Save to localStorage for persistence
                    saveUploadedImages();

                    showNotification('✅ Image uploaded successfully!', 'success');
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

                        showNotification('✅ Image uploaded successfully!', 'success');
                    };
                    reader.readAsDataURL(file);
                });
        }
    }, 100);
}

// Take photo from camera
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
        <video class="camera-video" id="cameraVideo" autoplay></video>
        <div class="camera-controls">
            <button class="btn btn-primary" onclick="capturePhoto()">
                <i class="fas fa-camera"></i> Capture Photo
            </button>
            <button class="btn btn-secondary" onclick="closeCamera()">
                <i class="fas fa-times"></i> Close
            </button>
        </div>
    `;
    
    document.body.appendChild(cameraModal);
    
    // Access camera
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(function(stream) {
            const video = document.getElementById('cameraVideo');
            video.srcObject = stream;
        })
        .catch(function(err) {
            console.error('Camera error:', err);
            alert('Unable to access camera. Please check permissions.');
            closeCamera();
        });
}

// Capture photo from camera
function capturePhoto() {
    const video = document.getElementById('cameraVideo');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    // Set canvas dimensions to video dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert to data URL
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    
    // Create image object
    const imageData = {
        id: Date.now(),
        name: `camera-photo-${Date.now()}.jpg`,
        type: 'image/jpeg',
        size: dataUrl.length,
        dataUrl: dataUrl,
        uploadedAt: new Date().toISOString(),
        source: 'camera'
    };
    
    // Add to uploaded images
    uploadedImages.push(imageData);
    
    // Update preview
    updateImagePreview(dataUrl);

    // Update URL input WITH THE DATA URL
    document.getElementById('productImage').value = dataUrl;

    // Save to localStorage
    saveUploadedImages();

    // Close camera
    closeCamera();

    showNotification('✅ Photo captured successfully!', 'success');
}

// Close camera
function closeCamera() {
    const cameraModal = document.getElementById('cameraModal');
    if (cameraModal) {
        // Stop camera stream
        const video = document.getElementById('cameraVideo');
        if (video && video.srcObject) {
            const stream = video.srcObject;
            const tracks = stream.getTracks();
            tracks.forEach(track => track.stop());
        }
        
        cameraModal.remove();
    }
}

// Paste image from clipboard
function pasteImage() {
    // Focus on the page to enable paste
    document.body.focus();
    
    showNotification('📋 Press Ctrl+V (Cmd+V on Mac) to paste an image', 'info');
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
    showNotification('✅ Image selected', 'success');
}

// Remove uploaded image
function removeUploadedImage(imageId) {
    if (confirm('Remove this image?')) {
        uploadedImages = uploadedImages.filter(img => img.id !== imageId);
        saveUploadedImages();
        displayRecentImages();
        showNotification('Image removed', 'info');
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
    showNotification('✅ Tickets refreshed!', 'success');
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
