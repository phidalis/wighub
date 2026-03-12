// braider-dashboard.js - Complete with all functions

// Get current braider
let currentBraider = null;

window.showBraiderSection = function(section, element) {
    document.querySelectorAll('.braider-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.dashboard-sidebar li').forEach(l => l.classList.remove('active'));
    
    // Fix: Handle different ID patterns correctly
    if (section === 'dashboard') {
        document.getElementById('braider-dashboard-section').classList.add('active');
    } else {
        document.getElementById(`${section}-section`).classList.add('active');
    }
    
    if (element) {
        element.closest('li').classList.add('active');
    } else {
        document.querySelectorAll('.dashboard-sidebar li').forEach(li => {
            if (li.textContent.toLowerCase().includes(section)) {
                li.classList.add('active');
            }
        });
    }

    if (section === 'dashboard') loadBraiderDashboard();
    if (section === 'profile') loadProfile();
    if (section === 'gallery') loadMyGallery();
}

// Load braider dashboard
function loadBraiderDashboard() {
    const braiders = JSON.parse(localStorage.getItem('braiders')) || [];
    const braider = braiders.find(b => b.id === currentBraider.id) || currentBraider;
    
    document.getElementById('braiderName').textContent = braider.name;
    
    const uploads = braider.uploads || [];
    const approved = uploads.filter(u => u.status === 'approved').length;
    const pending = uploads.filter(u => u.status === 'pending').length;
    
    document.getElementById('totalUploads').textContent = uploads.length;
    document.getElementById('approvedUploads').textContent = approved;
    document.getElementById('pendingCount').textContent = pending;
    
    // Profile views functions
function getProfileViews(braiderId) {
    const views = JSON.parse(localStorage.getItem('profileViews')) || {};
    return views[braiderId] || 0;
}

function incrementProfileViews(braiderId) {
    const views = JSON.parse(localStorage.getItem('profileViews')) || {};
    views[braiderId] = (views[braiderId] || 0) + 1;
    localStorage.setItem('profileViews', JSON.stringify(views));
    return views[braiderId];
}

// Then add this line inside loadBraiderDashboard AFTER getting the braider:
document.getElementById('profileViews').textContent = getProfileViews(currentBraider.id);
    
    // Show recent uploads (last 6)
    const recentUploads = document.getElementById('recentUploads');
    recentUploads.innerHTML = '';
    
    if (uploads.length === 0) {
        recentUploads.innerHTML = '<p class="empty-gallery">No uploads yet. Start by uploading your work!</p>';
        return;
    }
    
    const recent = [...uploads].reverse().slice(0, 6);
    
    recent.forEach(upload => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        
        if (upload.type === 'photo') {
            item.innerHTML = `<img src="${upload.url}" alt="${upload.caption}" onerror="this.src='https://via.placeholder.com/300'">`;
        } else {
            item.innerHTML = `
                <video src="${upload.url}" onerror="this.outerHTML='<div class=\'gallery-item\'><i class=\'fas fa-video\' style=\'font-size: 48px; color: #999;\'></i></div>'"></video>
                <div class="video-indicator"><i class="fas fa-play"></i></div>
            `;
        }
        
        // Add status badge
        const status = document.createElement('span');
        status.className = `status-badge ${upload.status}`;
        status.textContent = upload.status;
        status.style.cssText = 'position: absolute; top: 10px; right: 10px; padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: 500; z-index: 5;';
        item.appendChild(status);
        
        // Add caption
        const caption = document.createElement('div');
        caption.className = 'upload-info';
        caption.textContent = upload.caption;
        item.appendChild(caption);
        
        recentUploads.appendChild(item);
    });
}

// Load profile data
function loadProfile() {
    const braiders = JSON.parse(localStorage.getItem('braiders')) || [];
    const braider = braiders.find(b => b.id === currentBraider.id) || currentBraider;
    
    document.getElementById('profilePhoto').value = braider.profile.photo || '';
    document.getElementById('profileName').value = braider.name || '';
    document.getElementById('profileLocation').value = braider.profile.location || '';
    document.getElementById('profileSpeciality').value = braider.profile.speciality || '';
    document.getElementById('profileExperience').value = braider.profile.experience || 0;
    document.getElementById('profileBio').value = braider.profile.bio || '';
    document.getElementById('profilePhone').value = braider.profile.phone || '';
    document.getElementById('profileInstagram').value = braider.profile.instagram || '';
    
    // Show photo preview
    if (braider.profile.photo) {
        document.getElementById('profilePhotoPreview').innerHTML = `<img src="${braider.profile.photo}" style="max-width: 200px; max-height: 200px; border-radius: 5px;">`;
    }
}

// Profile photo preview
document.getElementById('profilePhoto')?.addEventListener('input', function() {
    const url = this.value;
    const preview = document.getElementById('profilePhotoPreview');
    
    if (url) {
        preview.innerHTML = `<img src="${url}" style="max-width: 200px; max-height: 200px; border-radius: 5px;" onerror="this.outerHTML='<p style=\'color: red;\'>Invalid image URL</p>'">`;
    } else {
        preview.innerHTML = '';
    }
});

// Update profile
document.getElementById('editProfileForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const braiders = JSON.parse(localStorage.getItem('braiders')) || [];
    const index = braiders.findIndex(b => b.id === currentBraider.id);
    
    if (index !== -1) {
        braiders[index] = {
            ...braiders[index],
            name: document.getElementById('profileName').value,
            profile: {
                photo: document.getElementById('profilePhoto').value,
                location: document.getElementById('profileLocation').value,
                speciality: document.getElementById('profileSpeciality').value,
                experience: parseInt(document.getElementById('profileExperience').value),
                bio: document.getElementById('profileBio').value,
                phone: document.getElementById('profilePhone').value,
                instagram: document.getElementById('profileInstagram').value || '@braider',
                rating: braiders[index].profile.rating || 0
            }
        };
        
        localStorage.setItem('braiders', JSON.stringify(braiders));
        
        // Update current user
        currentBraider = braiders[index];
        localStorage.setItem('currentUser', JSON.stringify(currentBraider));
        
        alert('Profile updated successfully!');
        loadBraiderDashboard();
    }
});

// Handle upload form with file upload support
const uploadForm = document.getElementById('uploadForm');
if (uploadForm) {
    // Remove old listener by cloning
    const newUploadForm = uploadForm.cloneNode(true);
    uploadForm.parentNode.replaceChild(newUploadForm, uploadForm);
    
    newUploadForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const fileInput = document.getElementById('mediaFile');
        const file = fileInput?.files[0];
        const urlInput = document.getElementById('mediaUrl').value.trim();
        const caption = document.getElementById('caption').value.trim();
        const type = document.getElementById('uploadType').value;
        const category = document.getElementById('styleCategory').value;
        
        // Validate caption
        if (!caption) {
            alert('Please enter a caption');
            return;
        }
        
        let mediaUrl = '';
        
        // Case 1: File uploaded
        if (file) {
            // Check file size again
            if (file.size > 10 * 1024 * 1024) {
                alert('File is too large! Maximum size is 10MB.');
                return;
            }
            
            // Read file as data URL
            const reader = new FileReader();
            
            // Show progress
            simulateUploadProgress(file, () => {
                // This will run after progress bar completes
            });
            
            // Wait for file to be read
            mediaUrl = await new Promise((resolve) => {
                reader.onload = async function(e) {
                    let dataUrl = e.target.result;
                    
                    // Compress images to save space
                    if (type === 'photo' || file.type.startsWith('image/')) {
                        dataUrl = await compressImage(dataUrl);
                    }
                    
                    resolve(dataUrl);
                };
                reader.readAsDataURL(file);
            });
            
        } 
        // Case 2: URL provided
        else if (urlInput) {
            try {
                new URL(urlInput); // Validate URL
                mediaUrl = urlInput;
            } catch (e) {
                alert('Please enter a valid URL (including http:// or https://)');
                return;
            }
        } 
        // No file and no URL
        else {
            alert('Please either select a file or enter a media URL');
            return;
        }
        
        // Get braiders data
        const braiders = JSON.parse(localStorage.getItem('braiders')) || [];
        const index = braiders.findIndex(b => b.id === currentBraider.id);
        
        if (index !== -1) {
            // Create new upload object
            const newUpload = {
                id: Date.now(),
                type: type,
                url: mediaUrl,
                caption: caption,
                category: category,
                status: 'pending',
                date: new Date().toISOString(),
                fileName: file ? file.name : null,
                fileSize: file ? file.size : null
            };
            
            // Initialize uploads array if needed
            if (!braiders[index].uploads) {
                braiders[index].uploads = [];
            }
            
            // Add to braider's uploads
            braiders[index].uploads.push(newUpload);
            
            // Save to localStorage
            localStorage.setItem('braiders', JSON.stringify(braiders));
            
            // Show success message
            alert('✅ Work submitted for approval! You will be notified once approved.');
            
            // Reset form
            this.reset();
            document.getElementById('uploadPreview').innerHTML = '';
            document.getElementById('selectedFileName').innerHTML = '';
            document.getElementById('uploadProgressContainer').style.display = 'none';
            document.getElementById('mediaFile').value = '';
            
            // Refresh dashboard
            loadBraiderDashboard();
            
            // Switch to dashboard view
            showBraiderSection('dashboard');
        }
    });
}

// Preview upload
// Preview upload - FIXED VERSION
const mediaUrlInput = document.getElementById('mediaUrl');
if (mediaUrlInput) {
    // Remove old listener by cloning
    const newMediaUrl = mediaUrlInput.cloneNode(true);
    mediaUrlInput.parentNode.replaceChild(newMediaUrl, mediaUrlInput);
    
    newMediaUrl.addEventListener('input', function() {
        const url = this.value.trim();
        const type = document.getElementById('uploadType').value;
        const preview = document.getElementById('uploadPreview');
        
        if (url) {
            // Validate URL format
            try {
                new URL(url); // This will throw if invalid URL
                
                // Clear previous preview
                preview.innerHTML = '';
                
                if (type === 'photo') {
                    // For photos, create an image element
                    const img = document.createElement('img');
                    img.src = url;
                    img.alt = 'Preview';
                    img.style.maxWidth = '100%';
                    img.style.maxHeight = '300px';
                    img.style.borderRadius = '5px';
                    
                    // Handle image load error
                    img.onerror = function() {
                        preview.innerHTML = '<p style="color: red;">❌ Invalid image URL or image not accessible. Please check the URL.</p>';
                    };
                    
                    // Handle successful load
                    img.onload = function() {
                        preview.innerHTML = ''; // Clear any error messages
                        preview.appendChild(img);
                    };
                    
                    preview.appendChild(img);
                    
                } else {
                    // For videos, create a video element
                    const video = document.createElement('video');
                    video.src = url;
                    video.controls = true;
                    video.style.maxWidth = '100%';
                    video.style.maxHeight = '300px';
                    video.style.borderRadius = '5px';
                    
                    // Handle video load error
                    video.onerror = function() {
                        preview.innerHTML = '<p style="color: red;">❌ Invalid video URL or video not accessible. Please check the URL.</p>';
                    };
                    
                    // Handle successful load
                    video.onloadeddata = function() {
                        preview.innerHTML = ''; // Clear any error messages
                        preview.appendChild(video);
                    };
                    
                    preview.appendChild(video);
                }
            } catch (e) {
                preview.innerHTML = '<p style="color: red;">❌ Please enter a valid URL (include http:// or https://)</p>';
            }
        } else {
            preview.innerHTML = '';
        }
    });
}

// Change preview when upload type changes - FIXED VERSION
document.getElementById('uploadType')?.addEventListener('change', function() {
    const url = document.getElementById('mediaUrl').value.trim();
    const preview = document.getElementById('uploadPreview');
    
    if (url) {
        try {
            new URL(url); // Validate URL
            
            preview.innerHTML = '';
            
            if (this.value === 'photo') {
                const img = document.createElement('img');
                img.src = url;
                img.alt = 'Preview';
                img.style.maxWidth = '100%';
                img.style.maxHeight = '300px';
                img.style.borderRadius = '5px';
                
                img.onerror = function() {
                    preview.innerHTML = '<p style="color: red;">❌ Invalid image URL</p>';
                };
                
                preview.appendChild(img);
            } else {
                const video = document.createElement('video');
                video.src = url;
                video.controls = true;
                video.style.maxWidth = '100%';
                video.style.maxHeight = '300px';
                video.style.borderRadius = '5px';
                
                video.onerror = function() {
                    preview.innerHTML = '<p style="color: red;">❌ Invalid video URL</p>';
                };
                
                preview.appendChild(video);
            }
        } catch (e) {
            preview.innerHTML = '<p style="color: red;">❌ Invalid URL format</p>';
        }
    }
});

// Load my gallery
function loadMyGallery() {
    const braiders = JSON.parse(localStorage.getItem('braiders')) || [];
    const braider = braiders.find(b => b.id === currentBraider.id) || currentBraider;
    
    const gallery = document.getElementById('myGallery');
    gallery.innerHTML = '';
    
    const uploads = braider.uploads || [];
    
    if (uploads.length === 0) {
        gallery.innerHTML = '<p class="empty-gallery">No uploads yet. Go to "Upload Work" to add your portfolio.</p>';
        return;
    }
    
    // Sort by date (newest first)
    const sortedUploads = [...uploads].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    sortedUploads.forEach(upload => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        
        if (upload.type === 'photo') {
            item.innerHTML = `<img src="${upload.url}" alt="${upload.caption}" onerror="this.src='https://via.placeholder.com/300'">`;
        } else {
            item.innerHTML = `
                <video src="${upload.url}" onerror="this.outerHTML='<div class=\'gallery-item\'><i class=\'fas fa-video\' style=\'font-size: 48px; color: #999;\'></i></div>'"></video>
                <div class="video-indicator"><i class="fas fa-play"></i></div>
            `;
        }
        
        // Add status badge
        const status = document.createElement('span');
        status.className = `status-badge ${upload.status}`;
        status.textContent = upload.status;
        status.style.cssText = 'position: absolute; top: 10px; left: 10px; padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: 500; z-index: 5;';
        item.appendChild(status);
        
        // Add delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Delete';
        deleteBtn.onclick = function(e) {
            e.stopPropagation();
            deleteUpload(upload.id);
        };
        item.appendChild(deleteBtn);
        
        // Add caption and date
        const info = document.createElement('div');
        info.className = 'upload-info';
        info.innerHTML = `
            <strong>${upload.caption}</strong><br>
            <small>${new Date(upload.date).toLocaleDateString()}</small>
        `;
        item.appendChild(info);
        
        gallery.appendChild(item);
    });
}

// ===== FILE UPLOAD HANDLING =====

// Handle file selection
document.getElementById('mediaFile')?.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Display selected file name
    document.getElementById('selectedFileName').innerHTML = `
        <i class="fas fa-check-circle" style="color: #4CAF50;"></i> 
        Selected: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)
    `;
    
    // Check file size (limit to 10MB for now)
    if (file.size > 10 * 1024 * 1024) {
        alert('File is too large! Maximum size is 10MB.');
        document.getElementById('mediaFile').value = '';
        document.getElementById('selectedFileName').innerHTML = '';
        return;
    }
    
    // Show preview based on file type
    const uploadType = document.getElementById('uploadType').value;
    const reader = new FileReader();
    
    reader.onload = function(event) {
        const dataUrl = event.target.result;
        showFilePreview(dataUrl, uploadType, file.type);
    };
    
    reader.readAsDataURL(file);
});

// Show file preview
function showFilePreview(dataUrl, type, mimeType) {
    const preview = document.getElementById('uploadPreview');
    preview.innerHTML = '';
    
    if (type === 'photo' || mimeType?.startsWith('image/')) {
        const img = document.createElement('img');
        img.src = dataUrl;
        img.style.maxWidth = '100%';
        img.style.maxHeight = '300px';
        img.style.borderRadius = '5px';
        preview.appendChild(img);
    } else if (type === 'video' || mimeType?.startsWith('video/')) {
        const video = document.createElement('video');
        video.src = dataUrl;
        video.controls = true;
        video.style.maxWidth = '100%';
        video.style.maxHeight = '300px';
        video.style.borderRadius = '5px';
        preview.appendChild(video);
    }
}

// Compress image before saving (to reduce storage size)
function compressImage(dataUrl, maxWidth = 800, quality = 0.7) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = dataUrl;
        
        img.onload = function() {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            
            // Calculate new dimensions
            if (width > maxWidth) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
            }
            
            canvas.width = width;
            canvas.height = height;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            // Compress and get new data URL
            const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
            resolve(compressedDataUrl);
        };
    });
}

// Simulate upload progress (for UX)
function simulateUploadProgress(file, callback) {
    const progressContainer = document.getElementById('uploadProgressContainer');
    const progressBar = document.getElementById('uploadProgressBar');
    const percentText = document.getElementById('uploadPercent');
    
    progressContainer.style.display = 'block';
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += 10;
        progressBar.style.width = progress + '%';
        percentText.textContent = progress + '%';
        
        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                progressContainer.style.display = 'none';
                callback();
            }, 500);
        }
    }, 100);
}

// Delete upload - make globally accessible and add error handling
window.deleteUpload = function(uploadId) {
    if (!confirm('Delete this upload? This action cannot be undone.')) {
        return;
    }
    
    try {
        const braiders = JSON.parse(localStorage.getItem('braiders')) || [];
        const index = braiders.findIndex(b => b.id === currentBraider.id);
        
        if (index === -1) {
            alert('Braider not found');
            return;
        }
        
        const beforeCount = braiders[index].uploads ? braiders[index].uploads.length : 0;
        braiders[index].uploads = (braiders[index].uploads || []).filter(u => u.id !== uploadId);
        const afterCount = braiders[index].uploads.length;
        
        if (beforeCount === afterCount) {
            alert('Upload not found');
            return;
        }
        
        localStorage.setItem('braiders', JSON.stringify(braiders));
        
        // Update current user
        currentBraider = braiders[index];
        localStorage.setItem('currentUser', JSON.stringify(currentBraider));
        
        alert('Upload deleted successfully!');
        
        // Refresh the view
        if (document.getElementById('gallery-section').classList.contains('active')) {
            loadMyGallery();
        }
        loadBraiderDashboard();
        
    } catch (error) {
        console.error('Delete error:', error);
        alert('Error deleting upload. Please try again.');
    }
};

// Logout function
window.logout = function() {
    localStorage.removeItem('currentUser');
    window.location.href = 'braiders.html';
}

// Load dashboard on page load with authentication check
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        alert('Please login first');
        window.location.href = 'braiders.html';
        return;
    }
    
    if (currentUser.role !== 'braider') {
        alert('Unauthorized access');
        window.location.href = 'braiders.html';
        return;
    }
    
    currentBraider = currentUser;
    loadBraiderDashboard();
});
// Drag & drop support
const dropZone = document.querySelector('.file-upload-container');
if (dropZone) {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.add('dragover');
        });
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.remove('dragover');
        });
    });
    
    dropZone.addEventListener('drop', (e) => {
        const file = e.dataTransfer.files[0];
        if (file) {
            const fileInput = document.getElementById('mediaFile');
            fileInput.files = e.dataTransfer.files;
            
            // Trigger change event
            const event = new Event('change', { bubbles: true });
            fileInput.dispatchEvent(event);
        }
    });
}