// braider-dashboard.js - Complete with all functions

// Get current braider
let currentBraider = null;

// ========== SECTION NAVIGATION ==========
window.showBraiderSection = function(section, element) {
    document.querySelectorAll('.braider-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.dashboard-sidebar li').forEach(l => l.classList.remove('active'));
    
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
    if (section === 'password') loadPasswordSection();
}

// ========== DASHBOARD FUNCTIONS ==========
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
    
    // Profile views
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
        
        const status = document.createElement('span');
        status.className = `status-badge ${upload.status}`;
        status.textContent = upload.status;
        status.style.cssText = 'position: absolute; top: 10px; right: 10px; padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: 500; z-index: 5;';
        item.appendChild(status);
        
        const caption = document.createElement('div');
        caption.className = 'upload-info';
        caption.textContent = upload.caption;
        item.appendChild(caption);
        
        recentUploads.appendChild(item);
    });
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

// ========== PROFILE MANAGEMENT ==========
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

// ========== FIXED: PROFILE PHOTO UPLOAD WITH COMPRESSION ==========
// Remove duplicate listeners by using a single clean implementation

// Initialize profile photo upload after DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initProfilePhotoUpload();
});

function initProfilePhotoUpload() {
    const profilePhotoFile = document.getElementById('profilePhotoFile');
    if (profilePhotoFile) {
        // Remove any existing listeners
        const newFileInput = profilePhotoFile.cloneNode(true);
        profilePhotoFile.parentNode.replaceChild(newFileInput, profilePhotoFile);
        
        newFileInput.addEventListener('change', handleProfilePhotoUpload);
    }
}

async function handleProfilePhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size (max 5MB as requested)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
        showNotification('❌ File is too large! Maximum size is 5MB.', 'error');
        e.target.value = '';
        return;
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
        showNotification('❌ Please select an image file (JPEG, PNG, GIF)', 'error');
        e.target.value = '';
        return;
    }
    
    const previewDiv = document.getElementById('profilePhotoPreview');
    
    try {
        // Show loading/compressing message
        previewDiv.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <i class="fas fa-spinner fa-spin" style="font-size: 24px; color: #E91E63;"></i>
                <p style="margin-top: 10px; color: #666;">Compressing image...</p>
            </div>
        `;
        
        // Read file as data URL
        const dataUrl = await readFileAsDataURL(file);
        
        // Compress image (max 5MB, will be compressed to ~1-2MB)
        const compressedImage = await compressImage(dataUrl, 1200, 0.8);
        
        // Update the photo URL input
        document.getElementById('profilePhoto').value = compressedImage;
        
        // Show compressed preview
        previewDiv.innerHTML = `
            <div style="margin-top: 10px;">
                <img src="${compressedImage}" style="max-width: 200px; max-height: 200px; border-radius: 5px; border: 3px solid #E91E63;">
                <p style="margin-top: 5px; color: #4CAF50; font-size: 12px;">
                    <i class="fas fa-check-circle"></i> Image compressed successfully!
                </p>
            </div>
        `;
        
        // Calculate and show compression stats
        const originalSizeKB = Math.round(file.size / 1024);
        const compressedSizeKB = Math.round((compressedImage.length * 3) / 4 / 1024);
        const savings = ((1 - compressedSizeKB/originalSizeKB) * 100).toFixed(1);
        
        console.log(`✅ Profile photo compressed: ${originalSizeKB}KB → ${compressedSizeKB}KB (${savings}% reduction)`);
        
    } catch (error) {
        console.error('Error processing image:', error);
        previewDiv.innerHTML = `
            <div style="color: #f44336; padding: 10px; background: #ffebee; border-radius: 5px;">
                <i class="fas fa-exclamation-triangle"></i> 
                Error processing image. Please try again.
            </div>
        `;
    }
}

// ========== FIXED: CHANGE PASSWORD FUNCTIONALITY ==========
function loadPasswordSection() {
    // Reset form fields
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
    
    // Clear any previous messages
    const messageDiv = document.getElementById('passwordMessage');
    if (messageDiv) messageDiv.remove();
    
    // Add message container if it doesn't exist
    const form = document.getElementById('changePasswordForm');
    if (!document.getElementById('passwordMessage')) {
        const msgDiv = document.createElement('div');
        msgDiv.id = 'passwordMessage';
        msgDiv.style.marginTop = '15px';
        form.appendChild(msgDiv);
    }
}

// Initialize password form
document.addEventListener('DOMContentLoaded', function() {
    initPasswordForm();
});

function initPasswordForm() {
    const passwordForm = document.getElementById('changePasswordForm');
    if (passwordForm) {
        // Remove any existing listeners
        const newForm = passwordForm.cloneNode(true);
        passwordForm.parentNode.replaceChild(newForm, passwordForm);
        
        newForm.addEventListener('submit', handlePasswordChange);
    }
}

function handlePasswordChange(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const messageDiv = document.getElementById('passwordMessage');
    
    // Clear previous messages
    messageDiv.innerHTML = '';
    
    // Validate current password
    if (!currentPassword) {
        showPasswordMessage('Please enter your current password', 'error');
        return;
    }
    
    if (currentPassword !== currentBraider.password) {
        showPasswordMessage('❌ Current password is incorrect!', 'error');
        return;
    }
    
    // Validate new password
    if (!newPassword) {
        showPasswordMessage('Please enter a new password', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        showPasswordMessage('❌ New password must be at least 6 characters long!', 'error');
        return;
    }
    
    // Check if passwords match
    if (newPassword !== confirmPassword) {
        showPasswordMessage('❌ New passwords do not match!', 'error');
        return;
    }
    
    // Check if new password is same as old
    if (newPassword === currentPassword) {
        showPasswordMessage('❌ New password must be different from current password', 'error');
        return;
    }
    
    // Check password strength
    const strength = checkPasswordStrength(newPassword);
    if (strength === 'weak') {
        if (!confirm('⚠️ Password is weak. Consider using a mix of letters, numbers, and symbols. Continue anyway?')) {
            return;
        }
    }
    
    // Update password in localStorage
    try {
        const braiders = JSON.parse(localStorage.getItem('braiders')) || [];
        const index = braiders.findIndex(b => b.id === currentBraider.id);
        
        if (index !== -1) {
            braiders[index].password = newPassword;
            localStorage.setItem('braiders', JSON.stringify(braiders));
            
            // Update current user
            currentBraider = braiders[index];
            localStorage.setItem('currentUser', JSON.stringify(currentBraider));
            
            // Show success message
            showPasswordMessage('✅ Password changed successfully!', 'success');
            
            // Reset form
            document.getElementById('currentPassword').value = '';
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmPassword').value = '';
            
            // Optional: Switch to dashboard after 2 seconds
            setTimeout(() => {
                showBraiderSection('dashboard');
            }, 2000);
        }
    } catch (error) {
        console.error('Password change error:', error);
        showPasswordMessage('❌ Error changing password. Please try again.', 'error');
    }
}

function showPasswordMessage(message, type) {
    const messageDiv = document.getElementById('passwordMessage');
    if (!messageDiv) return;
    
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    const bgColor = type === 'success' ? '#4CAF50' : '#f44336';
    
    messageDiv.innerHTML = `
        <div style="
            padding: 12px 15px;
            background: ${bgColor};
            color: white;
            border-radius: 5px;
            display: flex;
            align-items: center;
            gap: 10px;
            animation: fadeIn 0.3s ease;
        ">
            <i class="fas ${icon}" style="font-size: 18px;"></i>
            <span style="flex: 1;">${message}</span>
        </div>
    `;
    
    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            messageDiv.innerHTML = '';
        }, 5000);
    }
}

function checkPasswordStrength(password) {
    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]+/)) strength++;
    if (password.match(/[A-Z]+/)) strength++;
    if (password.match(/[0-9]+/)) strength++;
    if (password.match(/[$@#&!]+/)) strength++;
    
    if (strength <= 2) return 'weak';
    if (strength <= 4) return 'medium';
    return 'strong';
}

// Update profile
document.addEventListener('DOMContentLoaded', function() {
    initProfileForm();
});

function initProfileForm() {
    const profileForm = document.getElementById('editProfileForm');
    if (profileForm) {
        const newForm = profileForm.cloneNode(true);
        profileForm.parentNode.replaceChild(newForm, profileForm);
        
        newForm.addEventListener('submit', handleProfileUpdate);
    }
}

function handleProfileUpdate(e) {
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
        
        // Show success notification
        showNotification('✅ Profile updated successfully!', 'success');
        loadBraiderDashboard();
    }
}

// ========== HELPER FUNCTIONS ==========
function showNotification(message, type = 'success') {
    // Remove any existing notification
    const existing = document.querySelector('.notification-toast');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = 'notification-toast';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#4CAF50' : '#f44336'};
        color: white;
        border-radius: 5px;
        box-shadow: 0 3px 10px rgba(0,0,0,0.2);
        z-index: 9999;
        animation: slideIn 0.3s ease;
        display: flex;
        align-items: center;
        gap: 10px;
    `;
    
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Read file as data URL
function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// ========== FIXED: COMPRESS IMAGE FUNCTION ==========
function compressImage(dataUrl, maxWidth = 1200, quality = 0.8) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = dataUrl;
        
        img.onload = function() {
            try {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                
                // Calculate new dimensions while maintaining aspect ratio
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }
                
                // Also limit height if needed
                const maxHeight = 1200;
                if (height > maxHeight) {
                    width = Math.round((width * maxHeight) / height);
                    height = maxHeight;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // Compress and convert to JPEG for better compression
                const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
                
                // Check if compression actually reduced size
                const originalSize = Math.round((dataUrl.length * 3) / 4);
                const compressedSize = Math.round((compressedDataUrl.length * 3) / 4);
                
                // If compression didn't help, return original
                if (compressedSize >= originalSize) {
                    console.log('⚠️ Compression not beneficial, using original');
                    resolve(dataUrl);
                } else {
                    const ratio = ((1 - compressedSize/originalSize) * 100).toFixed(1);
                    console.log(`✅ Image compressed: ${(originalSize/1024).toFixed(2)}KB → ${(compressedSize/1024).toFixed(2)}KB (${ratio}% reduction)`);
                    resolve(compressedDataUrl);
                }
            } catch (error) {
                reject(error);
            }
        };
        
        img.onerror = function() {
            console.log('⚠️ Image compression failed, using original');
            resolve(dataUrl);
        };
    });
}

// ========== UPLOAD FORM HANDLING ==========
const uploadForm = document.getElementById('uploadForm');
if (uploadForm) {
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
        
        if (!caption) {
            showNotification('Please enter a caption', 'error');
            return;
        }
        
        let mediaUrl = '';
        let compressed = false;
        
        if (file) {
            if (file.size > 50 * 1024 * 1024) {
                showNotification('File is too large! Maximum size is 50MB.', 'error');
                return;
            }
            
            simulateUploadProgress(file);
            
            try {
                if (type === 'photo' || file.type.startsWith('image/')) {
                    document.getElementById('uploadPreview').innerHTML = '<p style="color: #666;">Compressing image...</p>';
                    mediaUrl = await readFileAsDataURL(file);
                    mediaUrl = await compressImage(mediaUrl, 1200, 0.8);
                    compressed = true;
                } else {
                    document.getElementById('uploadPreview').innerHTML = '<p style="color: #666;">Processing video...</p>';
                    mediaUrl = await readFileAsDataURL(file);
                    compressed = true;
                }
            } catch (error) {
                console.error('Error processing file:', error);
                showNotification('Error processing file. Please try again.', 'error');
                return;
            }
        } else if (urlInput) {
            try {
                new URL(urlInput);
                mediaUrl = urlInput;
            } catch (e) {
                showNotification('Please enter a valid URL', 'error');
                return;
            }
        } else {
            showNotification('Please either select a file or enter a media URL', 'error');
            return;
        }
        
        // Get braiders data
        const braiders = JSON.parse(localStorage.getItem('braiders')) || [];
        const index = braiders.findIndex(b => b.id === currentBraider.id);
        
        if (index !== -1) {
            const newUpload = {
                id: Date.now(),
                type: type,
                url: mediaUrl,
                caption: caption,
                category: category,
                status: 'pending',
                date: new Date().toISOString(),
                fileName: file ? file.name : null,
                fileSize: file ? file.size : null,
                compressed: compressed
            };
            
            if (!braiders[index].uploads) {
                braiders[index].uploads = [];
            }
            
            braiders[index].uploads.push(newUpload);
            localStorage.setItem('braiders', JSON.stringify(braiders));
            
            showNotification('✅ Work submitted for approval!', 'success');
            
            // Reset form
            this.reset();
            document.getElementById('uploadPreview').innerHTML = '';
            document.getElementById('selectedFileName').innerHTML = '';
            document.getElementById('uploadProgressContainer').style.display = 'none';
            document.getElementById('mediaFile').value = '';
            
            loadBraiderDashboard();
            showBraiderSection('dashboard');
        }
    });
}

// Preview upload
const mediaUrlInput = document.getElementById('mediaUrl');
if (mediaUrlInput) {
    const newMediaUrl = mediaUrlInput.cloneNode(true);
    mediaUrlInput.parentNode.replaceChild(newMediaUrl, mediaUrlInput);
    
    newMediaUrl.addEventListener('input', function() {
        const url = this.value.trim();
        const type = document.getElementById('uploadType').value;
        const preview = document.getElementById('uploadPreview');
        
        if (url) {
            try {
                new URL(url);
                preview.innerHTML = '';
                
                if (type === 'photo') {
                    const img = document.createElement('img');
                    img.src = url;
                    img.alt = 'Preview';
                    img.style.maxWidth = '100%';
                    img.style.maxHeight = '300px';
                    img.style.borderRadius = '5px';
                    
                    img.onerror = function() {
                        preview.innerHTML = '<p style="color: red;">❌ Invalid image URL or image not accessible.</p>';
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
                        preview.innerHTML = '<p style="color: red;">❌ Invalid video URL or video not accessible.</p>';
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

// Change preview when upload type changes
document.getElementById('uploadType')?.addEventListener('change', function() {
    const url = document.getElementById('mediaUrl').value.trim();
    const preview = document.getElementById('uploadPreview');
    
    if (url) {
        try {
            new URL(url);
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

// Handle file selection
document.getElementById('mediaFile')?.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    document.getElementById('selectedFileName').innerHTML = `
        <i class="fas fa-check-circle" style="color: #4CAF50;"></i> 
        Selected: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)
    `;
    
    if (file.size > 50 * 1024 * 1024) {
        showNotification('File is too large! Maximum size is 50MB.', 'error');
        document.getElementById('mediaFile').value = '';
        document.getElementById('selectedFileName').innerHTML = '';
        return;
    }
    
    const uploadType = document.getElementById('uploadType').value;
    const reader = new FileReader();
    
    reader.onload = function(event) {
        const dataUrl = event.target.result;
        
        if (uploadType === 'photo' || file.type.startsWith('image/')) {
            showFilePreview(dataUrl, uploadType, file.type);
        } else if (uploadType === 'video' || file.type.startsWith('video/')) {
            showFilePreview(dataUrl, uploadType, file.type);
        }
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

// Simulate upload progress
function simulateUploadProgress(file) {
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
            }, 500);
        }
    }, 100);
}

// ========== GALLERY FUNCTIONS ==========
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
        
        const status = document.createElement('span');
        status.className = `status-badge ${upload.status}`;
        status.textContent = upload.status;
        status.style.cssText = 'position: absolute; top: 10px; left: 10px; padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: 500; z-index: 5;';
        item.appendChild(status);
        
        if (upload.compressed) {
            const compressIndicator = document.createElement('span');
            compressIndicator.className = 'compress-badge';
            compressIndicator.innerHTML = '<i class="fas fa-compress-alt"></i> Compressed';
            compressIndicator.style.cssText = 'position: absolute; top: 10px; right: 10px; padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: 500; z-index: 5; background: #4CAF50; color: white;';
            compressIndicator.title = 'Compressed for faster upload';
            item.appendChild(compressIndicator);
        }
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Delete';
        deleteBtn.onclick = function(e) {
            e.stopPropagation();
            deleteUpload(upload.id);
        };
        item.appendChild(deleteBtn);
        
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

// Delete upload
window.deleteUpload = function(uploadId) {
    if (!confirm('Delete this upload? This action cannot be undone.')) {
        return;
    }
    
    try {
        const braiders = JSON.parse(localStorage.getItem('braiders')) || [];
        const index = braiders.findIndex(b => b.id === currentBraider.id);
        
        if (index === -1) {
            showNotification('Braider not found', 'error');
            return;
        }
        
        const beforeCount = braiders[index].uploads ? braiders[index].uploads.length : 0;
        braiders[index].uploads = (braiders[index].uploads || []).filter(u => u.id !== uploadId);
        const afterCount = braiders[index].uploads.length;
        
        if (beforeCount === afterCount) {
            showNotification('Upload not found', 'error');
            return;
        }
        
        localStorage.setItem('braiders', JSON.stringify(braiders));
        
        currentBraider = braiders[index];
        localStorage.setItem('currentUser', JSON.stringify(currentBraider));
        
        showNotification('Upload deleted successfully!', 'success');
        
        if (document.getElementById('gallery-section').classList.contains('active')) {
            loadMyGallery();
        }
        loadBraiderDashboard();
        
    } catch (error) {
        console.error('Delete error:', error);
        showNotification('Error deleting upload. Please try again.', 'error');
    }
};

// ========== LOGOUT FUNCTION ==========
window.logout = function() {
    localStorage.removeItem('currentUser');
    window.location.href = 'braiders.html';
}

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', function() {
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
    
    // Initialize forms
    initProfilePhotoUpload();
    initPasswordForm();
    initProfileForm();

     // ADD THIS - Force reinitialize profile photo after a short delay
    setTimeout(() => {
        initProfilePhotoUpload();
    }, 500);


});

// ========== DRAG & DROP SUPPORT ==========
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
            
            const event = new Event('change', { bubbles: true });
            fileInput.dispatchEvent(event);
        }
    });
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(style);