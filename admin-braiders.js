// admin.js - Complete with all functions


// Global variables
let currentEditingId = null;

// HELPER FUNCTION for upload previews - FIXED
function getUploadPreviewHTML(upload) {
    if (upload.type === 'photo') {
        return '<img src="' + upload.url + '" class="upload-thumbnail" onerror="this.onerror=null; this.src=\'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'50\' height=\'50\' viewBox=\'0 0 50 50\'%3E%3Crect width=\'50\' height=\'50\' fill=\'%23f0f0f0\'/%3E%3Ctext x=\'5\' y=\'30\' font-family=\'Arial\' font-size=\'10\' fill=\'%23999\'%3EImage%20Error%3C/text%3E%3C/svg%3E\'">';
    } else {
        return '<i class="fas fa-video" style="font-size: 24px; color: #666;"></i> <span style="font-size: 12px;">Video</span>';
    }
}

// Lines 10-17 (fixed)
window.showSection = function(section, element) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.admin-sidebar li').forEach(l => l.classList.remove('active'));
    
    // Show selected section
    document.getElementById(`${section}-section`).classList.add('active');
    
    // Handle active menu item - check if element exists
    if (element) {
        element.closest('li').classList.add('active');
    } else {
        // Find the li by the section name
        document.querySelectorAll('.admin-sidebar li').forEach(li => {
            if (li.textContent.toLowerCase().includes(section)) {
                li.classList.add('active');
            }
        });
    }

    
    // Load data based on section
    if (section === 'dashboard') loadDashboard();
    if (section === 'braiders') loadAllBraiders();
    if (section === 'uploads') loadAllUploads();
    if (section === 'create') resetCreateForm();
}

// Load dashboard
function loadDashboard() {
    const braiders = JSON.parse(localStorage.getItem('braiders')) || [];
    
    // Calculate statistics
    const totalBraiders = braiders.length;
    let totalUploads = 0;
    let pendingUploads = 0;
    let approvedUploads = 0;
    
    braiders.forEach(braider => {
        if (braider.uploads) {
            totalUploads += braider.uploads.length;
            pendingUploads += braider.uploads.filter(u => u.status === 'pending').length;
            approvedUploads += braider.uploads.filter(u => u.status === 'approved').length;
        }
    });
    
    // Update stats
    document.getElementById('totalBraiders').textContent = totalBraiders;
    document.getElementById('totalUploads').textContent = totalUploads;
    document.getElementById('pendingUploads').textContent = pendingUploads;
    document.getElementById('approvedUploads').textContent = approvedUploads;
    
    // Load recent braiders
    const recentBraiders = braiders.slice(0, 5);
    const recentTable = document.getElementById('recentBraidersTable');
    recentTable.innerHTML = '';
    
    recentBraiders.forEach(braider => {
        const uploadCount = braider.uploads ? braider.uploads.length : 0;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${braider.name}</td>
            <td>${braider.profile.location}</td>
            <td>${braider.profile.speciality}</td>
            <td>${uploadCount}</td>
            <td><span class="status-badge active">Active</span></td>
            <td class="action-buttons">
                <button class="btn-small btn-edit" onclick="editBraider(${braider.id})"><i class="fas fa-edit"></i> Edit</button>
                <button class="btn-small btn-view" onclick="viewBraiderProfile(${braider.id})"><i class="fas fa-eye"></i> View</button>
            </td>
        `;
        recentTable.appendChild(row);
    });
    
    // Load recent pending uploads
    const pendingItems = [];
    braiders.forEach(braider => {
        if (braider.uploads) {
            braider.uploads.filter(u => u.status === 'pending').forEach(upload => {
                pendingItems.push({
                    braider: braider,
                    upload: upload
                });
            });
        }
    });
    
    const recentPending = document.getElementById('recentPendingTable');
    recentPending.innerHTML = '';
    
    pendingItems.slice(0, 5).forEach(item => {
        const row = document.createElement('tr');
row.innerHTML = `
    <td>${item.braider.name}</td>
    <td>${item.upload.type}</td>
    <td>
        ${getUploadPreviewHTML(item.upload)}
    </td>
    <td>${item.upload.caption}</td>
    <td>${new Date(item.upload.date).toLocaleDateString()}</td>
    <td class="action-buttons">
        <button class="btn-small btn-approve" onclick="approveUpload(${item.braider.id}, ${item.upload.id})"><i class="fas fa-check"></i> Approve</button>
        <button class="btn-small btn-reject" onclick="rejectUpload(${item.braider.id}, ${item.upload.id})"><i class="fas fa-times"></i> Reject</button>
    </td>
`;
        recentPending.appendChild(row);
    });
}

// Load all braiders
function loadAllBraiders() {
    const braiders = JSON.parse(localStorage.getItem('braiders')) || [];
    const tableBody = document.getElementById('braidersTable');
    tableBody.innerHTML = '';
    
    braiders.forEach(braider => {
        const uploadCount = braider.uploads ? braider.uploads.length : 0;
        const pendingCount = braider.uploads ? braider.uploads.filter(u => u.status === 'pending').length : 0;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${braider.id}</td>
            <td>${braider.name}</td>
            <td>${braider.email}</td>
            <td>${braider.profile.location}</td>
            <td>${braider.profile.speciality}</td>
            <td>${uploadCount} (${pendingCount} pending)</td>
            <td><span class="status-badge active">Active</span></td>
            <td class="action-buttons">
                <button class="btn-small btn-edit" onclick="editBraider(${braider.id})"><i class="fas fa-edit"></i> Edit</button>
                <button class="btn-small btn-view" onclick="viewBraiderProfile(${braider.id})"><i class="fas fa-eye"></i> View</button>
                <button class="btn-small btn-approve" onclick="resetBraiderPassword(${braider.id})"><i class="fas fa-key"></i> Reset Pass</button>
                <button class="btn-small btn-delete" onclick="deleteBraider(${braider.id})"><i class="fas fa-trash"></i> Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Load all uploads (pending and approved)
function loadAllUploads() {
    const braiders = JSON.parse(localStorage.getItem('braiders')) || [];
    
    // Load pending uploads
    const pendingTable = document.getElementById('pendingUploadsTable');
    pendingTable.innerHTML = '';
    
    // Load approved uploads
    const approvedTable = document.getElementById('approvedUploadsTable');
    approvedTable.innerHTML = '';
    
    braiders.forEach(braider => {
        if (braider.uploads) {
            // Pending uploads
            braider.uploads.filter(u => u.status === 'pending').forEach(upload => {
                const row = document.createElement('tr');
            row.innerHTML = `
    <td>${braider.name}</td>
    <td>${upload.type}</td>
    <td>
        ${getUploadPreviewHTML(upload)}
    </td>
    <td>${upload.caption}</td>
    <td>${upload.category || 'N/A'}</td>
    <td>${new Date(upload.date).toLocaleDateString()}</td>
    <td class="action-buttons">
        <button class="btn-small btn-approve" onclick="approveUpload(${braider.id}, ${upload.id})"><i class="fas fa-check"></i> Approve</button>
        <button class="btn-small btn-reject" onclick="rejectUpload(${braider.id}, ${upload.id})"><i class="fas fa-times"></i> Reject</button>
    </td>
`;
                pendingTable.appendChild(row);
            });
            
            // Approved uploads
            braider.uploads.filter(u => u.status === 'approved').forEach(upload => {
                const row = document.createElement('tr');
             row.innerHTML = `
    <td>${braider.name}</td>
    <td>${upload.type}</td>
    <td>
        ${getUploadPreviewHTML(upload)}
    </td>
    <td>${upload.caption}</td>
    <td>${new Date(upload.date).toLocaleDateString()}</td>
    <td class="action-buttons">
        <button class="btn-small btn-delete" onclick="deleteUpload(${braider.id}, ${upload.id})"><i class="fas fa-trash"></i> Delete</button>
    </td>
`;
                approvedTable.appendChild(row);
            });
        }
    });
    
    // Show message if no pending uploads
    if (pendingTable.children.length === 0) {
        pendingTable.innerHTML = '<tr><td colspan="7" style="text-align: center;">No pending uploads</td></tr>';
    }
    
    // Show message if no approved uploads
    if (approvedTable.children.length === 0) {
        approvedTable.innerHTML = '<tr><td colspan="6" style="text-align: center;">No approved uploads</td></tr>';
    }
}

// Reset create form
function resetCreateForm() {
    document.getElementById('createBraiderForm').reset();
    document.getElementById('braiderPassword').value = 'braider123';
    currentEditingId = null;
    
    // Change button text back to create
    const submitBtn = document.querySelector('#create-section .btn-primary');
    submitBtn.textContent = 'Create Braider Account';
}

// Preview photo URL
document.getElementById('braiderPhoto')?.addEventListener('input', function() {
    const url = this.value;
    const preview = document.getElementById('photoPreview');
    
    if (url) {
        preview.innerHTML = `<img src="${url}" class="preview-image" onerror="this.innerHTML='Invalid image URL'">`;
    } else {
        preview.innerHTML = '';
    }
});

// Create or update braider account
document.getElementById('createBraiderForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (currentEditingId) {
        updateBraider(currentEditingId);
    } else {
        createBraider();
    }
});

// Create new braider with sequential ID
function createBraider() {
    const braiders = JSON.parse(localStorage.getItem('braiders')) || [];
    
    // Check if email already exists
    const emailExists = braiders.some(b => b.email === document.getElementById('braiderEmail').value);
    if (emailExists) {
        alert('A braider with this email already exists!');
        return;
    }
    
    // Generate sequential ID
    let nextId = 1;
    if (braiders.length > 0) {
        // Find the highest existing ID and add 1
        const maxId = Math.max(...braiders.map(b => b.id));
        nextId = maxId + 1;
    }
    
    const newBraider = {
        id: nextId,  // Now uses sequential number instead of Date.now()
        name: document.getElementById('braiderName').value,
        email: document.getElementById('braiderEmail').value,
        password: document.getElementById('braiderPassword').value,
        role: 'braider',
        profile: {
            photo: document.getElementById('braiderPhoto').value,
            location: document.getElementById('braiderLocation').value,
            speciality: document.getElementById('braiderSpeciality').value,
            experience: parseInt(document.getElementById('braiderExperience').value),
            bio: document.getElementById('braiderBio').value,
            instagram: document.getElementById('braiderInstagram').value || '@braider',
            phone: document.getElementById('braiderPhone').value,
            rating: 0
        },
        uploads: []
    };
    
    braiders.push(newBraider);
    localStorage.setItem('braiders', JSON.stringify(braiders));
    
    alert(`Braider account created successfully!\n\nID: ${newBraider.id}\nEmail: ${newBraider.email}\nPassword: ${newBraider.password}`);
    this.reset();
    document.getElementById('braiderPassword').value = 'braider123';
    document.getElementById('photoPreview').innerHTML = '';
    
    // Refresh sections
    loadDashboard();
    showSection('braiders');
}

// Edit braider
window.editBraider = function(braiderId) {
    const braiders = JSON.parse(localStorage.getItem('braiders')) || [];
    const braider = braiders.find(b => b.id === braiderId);
    
    if (braider) {
        // Populate form with braider data
        document.getElementById('braiderName').value = braider.name;
        document.getElementById('braiderEmail').value = braider.email;
        document.getElementById('braiderPassword').value = braider.password;
        document.getElementById('braiderPhone').value = braider.profile.phone;
        document.getElementById('braiderLocation').value = braider.profile.location;
        document.getElementById('braiderSpeciality').value = braider.profile.speciality;
        document.getElementById('braiderPhoto').value = braider.profile.photo;
        document.getElementById('braiderExperience').value = braider.profile.experience;
        document.getElementById('braiderBio').value = braider.profile.bio;
        document.getElementById('braiderInstagram').value = braider.profile.instagram;
        
        // Show preview
        document.getElementById('photoPreview').innerHTML = `<img src="${braider.profile.photo}" class="preview-image">`;
        
        // Set editing mode
        currentEditingId = braiderId;
        
        // Change button text
        const submitBtn = document.querySelector('#create-section .btn-primary');
        submitBtn.textContent = 'Update Braider Account';
        
        // Switch to create section
        showSection('create');
    }
}

// Update braider
function updateBraider(braiderId) {
    const braiders = JSON.parse(localStorage.getItem('braiders')) || [];
    const index = braiders.findIndex(b => b.id === braiderId);
    
    if (index !== -1) {
        // Check if email changed and already exists
        const newEmail = document.getElementById('braiderEmail').value;
        if (newEmail !== braiders[index].email) {
            const emailExists = braiders.some(b => b.email === newEmail && b.id !== braiderId);
            if (emailExists) {
                alert('A braider with this email already exists!');
                return;
            }
        }
        
        braiders[index] = {
            ...braiders[index],
            id: braiderId, // Keep the same sequential ID
            name: document.getElementById('braiderName').value,
            email: newEmail,
            password: document.getElementById('braiderPassword').value,
            profile: {
                ...braiders[index].profile,
                photo: document.getElementById('braiderPhoto').value,
                location: document.getElementById('braiderLocation').value,
                speciality: document.getElementById('braiderSpeciality').value,
                experience: parseInt(document.getElementById('braiderExperience').value),
                bio: document.getElementById('braiderBio').value,
                instagram: document.getElementById('braiderInstagram').value,
                phone: document.getElementById('braiderPhone').value
            }
        };
        
        localStorage.setItem('braiders', JSON.stringify(braiders));
        alert('Braider updated successfully!');
        
        // Reset form
        document.getElementById('createBraiderForm').reset();
        document.getElementById('braiderPassword').value = 'braider123';
        document.getElementById('photoPreview').innerHTML = '';
        currentEditingId = null;
        
        // Change button text back
        const submitBtn = document.querySelector('#create-section .btn-primary');
        submitBtn.textContent = 'Create Braider Account';
        
        // Refresh sections
        loadDashboard();
        loadAllBraiders();
        showSection('braiders');
    }
}

// Delete braider
window.deleteBraider = function(braiderId) {
    if (confirm('Are you sure you want to delete this braider? This action cannot be undone.')) {
        let braiders = JSON.parse(localStorage.getItem('braiders')) || [];
        braiders = braiders.filter(b => b.id !== braiderId);
        localStorage.setItem('braiders', JSON.stringify(braiders));
        
        alert('Braider deleted successfully!');
        loadDashboard();
        loadAllBraiders();
    }
}

// Reset braider password
window.resetBraiderPassword = function(braiderId) {
    if (confirm('Reset password to default (braider123)?')) {
        const braiders = JSON.parse(localStorage.getItem('braiders')) || [];
        const index = braiders.findIndex(b => b.id === braiderId);
        
        if (index !== -1) {
            braiders[index].password = 'braider123';
            localStorage.setItem('braiders', JSON.stringify(braiders));
            alert(`Password reset successfully!\nNew password: braider123`);
        }
    }
}

// View braider profile
window.viewBraiderProfile = function(braiderId) {
    // Store the braider ID and open profile in new tab
    localStorage.setItem('viewingBraiderId', braiderId);
    window.open(`profile.html?id=${braiderId}`, '_blank');
}

// Approve upload
window.approveUpload = function(braiderId, uploadId) {
    const braiders = JSON.parse(localStorage.getItem('braiders')) || [];
    const braiderIndex = braiders.findIndex(b => b.id === braiderId);
    
    if (braiderIndex !== -1) {
        const uploadIndex = braiders[braiderIndex].uploads.findIndex(u => u.id === uploadId);
        
        if (uploadIndex !== -1) {
            braiders[braiderIndex].uploads[uploadIndex].status = 'approved';
            localStorage.setItem('braiders', JSON.stringify(braiders));
            
            alert('Upload approved! It will now appear in the braider\'s profile.');
            loadDashboard();
            loadAllUploads();
        }
    }
}

// Reject upload
window.rejectUpload = function(braiderId, uploadId) {
    if (confirm('Reject this upload? It will be permanently deleted.')) {
        const braiders = JSON.parse(localStorage.getItem('braiders')) || [];
        const braiderIndex = braiders.findIndex(b => b.id === braiderId);
        
        if (braiderIndex !== -1) {
            braiders[braiderIndex].uploads = braiders[braiderIndex].uploads.filter(u => u.id !== uploadId);
            localStorage.setItem('braiders', JSON.stringify(braiders));
            
            alert('Upload rejected and removed!');
            loadDashboard();
            loadAllUploads();
        }
    }
}

// Delete upload
window.deleteUpload = function(braiderId, uploadId) {
    if (confirm('Delete this upload?')) {
        const braiders = JSON.parse(localStorage.getItem('braiders')) || [];
        const braiderIndex = braiders.findIndex(b => b.id === braiderId);
        
        if (braiderIndex !== -1) {
            braiders[braiderIndex].uploads = braiders[braiderIndex].uploads.filter(u => u.id !== uploadId);
            localStorage.setItem('braiders', JSON.stringify(braiders));
            
            alert('Upload deleted!');
            loadAllUploads();
        }
    }
}

// Hero Image Management Functions

// Initialize hero images if not exists
function initializeHeroImages() {
    if (!localStorage.getItem('heroImages')) {
        const defaultHeroImages = [
            {
                id: 1,
                url: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
                title: 'Find Your Perfect Braider',
                subtitle: 'Discover professional braiders near you',
                active: true,
                order: 1
            },
            {
                id: 2,
                url: 'https://images.unsplash.com/photo-1522336572468-97b06e8ef143?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
                title: 'Expert Braiders',
                subtitle: 'Specializing in all hair types and styles',
                active: true,
                order: 2
            },
            {
                id: 3,
                url: 'https://images.unsplash.com/photo-1549236177-f9b8a1c89f7c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
                title: 'Latest Styles',
                subtitle: 'From box braids to cornrows and more',
                active: true,
                order: 3
            }
        ];
        localStorage.setItem('heroImages', JSON.stringify(defaultHeroImages));
    }
    
    if (!localStorage.getItem('heroRotationInterval')) {
        localStorage.setItem('heroRotationInterval', '180'); // Default 3 minutes
    }
}

// Call initialization
initializeHeroImages();

// Load hero images in admin panel
function loadHeroImages() {
    const heroImages = JSON.parse(localStorage.getItem('heroImages')) || [];
    const tableBody = document.getElementById('heroImagesTable');
    if (!tableBody) return;
    
    // Update current interval display
    document.getElementById('currentInterval').textContent = localStorage.getItem('heroRotationInterval') || '180';
    
    tableBody.innerHTML = '';
    
    // Sort by order
    const sortedImages = [...heroImages].sort((a, b) => a.order - b.order);
    
    sortedImages.forEach(image => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <img src="${image.url}" style="width: 80px; height: 60px; object-fit: cover; border-radius: 5px;" 
                     onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'80\' height=\'60\' viewBox=\'0 0 80 60\'%3E%3Crect width=\'80\' height=\'60\' fill=\'%23f0f0f0\'/%3E%3Ctext x=\'10\' y=\'30\' font-family=\'Arial\' font-size=\'10\' fill=\'%23999\'%3EInvalid%3C/text%3E%3C/svg%3E'">
            </td>
            <td>${image.title || 'No title'}</td>
            <td>${image.subtitle || 'No subtitle'}</td>
            <td>
                <span class="status-badge ${image.active ? 'active' : 'suspended'}" style="background: ${image.active ? '#4CAF50' : '#f44336'}; color: white;">
                    ${image.active ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td>
                <div style="display: flex; gap: 5px; align-items: center;">
                    <button class="btn-small" onclick="moveHeroImage(${image.id}, 'up')" ${image.order === 1 ? 'disabled' : ''}>
                        <i class="fas fa-arrow-up"></i>
                    </button>
                    <span style="padding: 0 5px;">${image.order}</span>
                    <button class="btn-small" onclick="moveHeroImage(${image.id}, 'down')" ${image.order === sortedImages.length ? 'disabled' : ''}>
                        <i class="fas fa-arrow-down"></i>
                    </button>
                </div>
            </td>
            <td class="action-buttons">
                <button class="btn-small btn-edit" onclick="toggleHeroImageStatus(${image.id})">
                    <i class="fas ${image.active ? 'fa-eye-slash' : 'fa-eye'}"></i> 
                    ${image.active ? 'Deactivate' : 'Activate'}
                </button>
                <button class="btn-small btn-delete" onclick="deleteHeroImage(${image.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Add hero image
document.getElementById('heroImageForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const url = document.getElementById('heroImageUrl').value;
    const title = document.getElementById('heroImageTitle').value;
    const subtitle = document.getElementById('heroImageSubtitle').value;
    const active = document.getElementById('heroImageActive').value === 'true';
    
    // Validate URL
    try {
        new URL(url);
    } catch (e) {
        alert('Please enter a valid URL');
        return;
    }
    
    const heroImages = JSON.parse(localStorage.getItem('heroImages')) || [];
    
    const newImage = {
        id: Date.now(),
        url: url,
        title: title,
        subtitle: subtitle,
        active: active,
        order: heroImages.length + 1
    };
    
    heroImages.push(newImage);
    localStorage.setItem('heroImages', JSON.stringify(heroImages));
    
    alert('Hero image added successfully!');
    this.reset();
    document.getElementById('heroImagePreview').innerHTML = '';
    loadHeroImages();
});

// Preview hero image
document.getElementById('heroImageUrl')?.addEventListener('input', function() {
    const url = this.value;
    const preview = document.getElementById('heroImagePreview');
    
    if (url) {
        try {
            new URL(url);
            preview.innerHTML = `<img src="${url}" style="max-width: 100%; max-height: 200px; border-radius: 5px;" onerror="this.onerror=null; this.parentNode.innerHTML='<p style=\'color: red;\'>Invalid image URL</p>'">`;
        } catch (e) {
            preview.innerHTML = '<p style="color: red;">Please enter a valid URL</p>';
        }
    } else {
        preview.innerHTML = '';
    }
});

// Move hero image up/down
window.moveHeroImage = function(imageId, direction) {
    let heroImages = JSON.parse(localStorage.getItem('heroImages')) || [];
    const index = heroImages.findIndex(img => img.id === imageId);
    
    if (index === -1) return;
    
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= heroImages.length) return;
    
    // Swap orders
    const tempOrder = heroImages[index].order;
    heroImages[index].order = heroImages[swapIndex].order;
    heroImages[swapIndex].order = tempOrder;
    
    // Swap positions in array
    [heroImages[index], heroImages[swapIndex]] = [heroImages[swapIndex], heroImages[index]];
    
    localStorage.setItem('heroImages', JSON.stringify(heroImages));
    loadHeroImages();
};

// Toggle hero image status
window.toggleHeroImageStatus = function(imageId) {
    let heroImages = JSON.parse(localStorage.getItem('heroImages')) || [];
    const index = heroImages.findIndex(img => img.id === imageId);
    
    if (index !== -1) {
        heroImages[index].active = !heroImages[index].active;
        localStorage.setItem('heroImages', JSON.stringify(heroImages));
        loadHeroImages();
    }
};

// Delete hero image
window.deleteHeroImage = function(imageId) {
    if (confirm('Are you sure you want to delete this hero image?')) {
        let heroImages = JSON.parse(localStorage.getItem('heroImages')) || [];
        heroImages = heroImages.filter(img => img.id !== imageId);
        
        // Reorder remaining images
        heroImages.forEach((img, index) => {
            img.order = index + 1;
        });
        
        localStorage.setItem('heroImages', JSON.stringify(heroImages));
        loadHeroImages();
    }
};

// Update rotation interval
window.updateRotationInterval = function() {
    const interval = document.getElementById('rotationInterval').value;
    const seconds = parseInt(interval);
    
    if (seconds && seconds >= 5 && seconds <= 600) {
        localStorage.setItem('heroRotationInterval', seconds.toString());
        document.getElementById('currentInterval').textContent = seconds;
        alert(`Rotation interval updated to ${seconds} seconds (${seconds/60} minutes)`);
    } else {
        alert('Please enter a valid interval between 5 and 600 seconds');
    }
};

// Update showSection function to include hero section
const originalShowSection = window.showSection;
window.showSection = function(section, element) {
    // Call original function
    if (originalShowSection) {
        originalShowSection(section, element);
    }
    
    // Load hero images if that section is selected
    if (section === 'hero') {
        loadHeroImages();
    }
};

// Logout function
window.logout = function() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Load dashboard on page load
document.addEventListener('DOMContentLoaded', loadDashboard);