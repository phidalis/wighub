// Add at the very top of braiders.js
const APP_VERSION = '1.0.0';

function migrateData() {
    const currentVersion = localStorage.getItem('appVersion');
    
    if (!currentVersion) {
        // First time migration from old system
        migrateFromV0();
    } else if (currentVersion !== APP_VERSION) {
        // Handle version-specific migrations
        migrateToLatest(currentVersion);
    }
    
    localStorage.setItem('appVersion', APP_VERSION);
}

function migrateFromV0() {
    console.log('Migrating from v0 to v1...');
    
    // Check if old data structure exists
    const oldBraiders = localStorage.getItem('braiders');
    if (oldBraiders) {
        try {
            const braiders = JSON.parse(oldBraiders);
            // Ensure all braiders have required fields
            braiders.forEach(b => {
                if (!b.role) b.role = 'braider';
                if (!b.uploads) b.uploads = [];
                if (b.uploads) {
                    b.uploads.forEach(u => {
                        if (!u.date) u.date = new Date().toISOString();
                        if (!u.status) u.status = 'pending';
                    });
                }
            });
            localStorage.setItem('braiders', JSON.stringify(braiders));
        } catch (e) {
            console.error('Migration failed:', e);
        }
    }
}

function migrateToLatest(oldVersion) {
    console.log(`Migrating from ${oldVersion} to ${APP_VERSION}...`);
    // Add version-specific migrations here as app evolves
}

// Call migration at start
migrateData();

// Hero Image Rotation System
let currentHeroIndex = 0;
let rotationInterval = null;

// Initialize hero rotation
function initHeroRotation() {
    const heroSection = document.getElementById('hero-section');
    if (!heroSection) return;
    
    // Clear any existing interval
    if (rotationInterval) {
        clearInterval(rotationInterval);
    }
    
    // Get rotation interval from localStorage
    const intervalSeconds = parseInt(localStorage.getItem('heroRotationInterval')) || 180;
    
    // Start rotation
    rotationInterval = setInterval(rotateHeroImage, intervalSeconds * 1000);
    
    // Load first image
    updateHeroImage();
}

// Rotate to next hero image
function rotateHeroImage() {
    const heroImages = JSON.parse(localStorage.getItem('heroImages')) || [];
    const activeImages = heroImages.filter(img => img.active).sort((a, b) => a.order - b.order);
    
    if (activeImages.length > 0) {
        currentHeroIndex = (currentHeroIndex + 1) % activeImages.length;
        updateHeroImage(activeImages[currentHeroIndex]);
    }
}

// Update hero image display
function updateHeroImage(image = null) {
    const heroSection = document.getElementById('hero-section');
    if (!heroSection) return;
    
    let heroImages = JSON.parse(localStorage.getItem('heroImages')) || [];
    let activeImages = heroImages.filter(img => img.active).sort((a, b) => a.order - b.order);
    
    if (activeImages.length === 0) {
        // Use default if no active images
        activeImages = [
            {
                url: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
                title: 'Find Your Perfect Braider',
                subtitle: 'Discover professional braiders near you'
            }
        ];
    }
    
    const currentImage = image || activeImages[currentHeroIndex % activeImages.length];
    
    // Update hero section background
    heroSection.style.background = `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('${currentImage.url}')`;
    heroSection.style.backgroundSize = 'cover';
    heroSection.style.backgroundPosition = 'center';
    
    // Update text content
    const titleElement = document.getElementById('hero-title');
    const subtitleElement = document.getElementById('hero-subtitle');
    
    if (titleElement && currentImage.title) {
        titleElement.textContent = currentImage.title;
    }
    
    if (subtitleElement && currentImage.subtitle) {
        subtitleElement.textContent = currentImage.subtitle;
    }
}
// ========== RATING SYSTEM FUNCTIONS ==========

// Check if user has rated this braider before
function hasRatedBefore(braiderId) {
    const ratedBraiders = JSON.parse(localStorage.getItem('ratedBraiders')) || {};
    return !!ratedBraiders[braiderId];
}

// Mark braider as rated
function markAsRated(braiderId) {
    const ratedBraiders = JSON.parse(localStorage.getItem('ratedBraiders')) || {};
    ratedBraiders[braiderId] = Date.now();
    localStorage.setItem('ratedBraiders', JSON.stringify(ratedBraiders));
}

// Calculate average rating from ratings array
function calculateAverageRating(ratings) {
    if (!ratings || ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
    return Math.round((sum / ratings.length) * 10) / 10;
}

// Get rating breakdown
function getRatingBreakdown(ratings) {
    const breakdown = {5:0, 4:0, 3:0, 2:0, 1:0};
    ratings.forEach(r => {
        if (r.rating >= 1 && r.rating <= 5) {
            breakdown[r.rating]++;
        }
    });
    return breakdown;
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.style.background = type === 'success' ? '#4CAF50' : '#f44336';
    toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i> ${message}`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Add a new rating
function addRating(braiderId, ratingData) {
    const braiders = JSON.parse(localStorage.getItem('braiders')) || [];
    const index = braiders.findIndex(b => b.id === braiderId);
    
    if (index !== -1) {
        // Initialize ratings array if needed
        if (!braiders[index].ratings) {
            braiders[index].ratings = [];
        }
        
        // Add new rating
        const newRating = {
            id: 'rating_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            ...ratingData,
            date: new Date().toISOString()
        };
        
        braiders[index].ratings.push(newRating);
        
        // Update profile stats
        const allRatings = braiders[index].ratings;
        braiders[index].profile.rating = calculateAverageRating(allRatings);
        braiders[index].profile.totalRatings = allRatings.length;
        braiders[index].profile.ratingBreakdown = getRatingBreakdown(allRatings);
        
        localStorage.setItem('braiders', JSON.stringify(braiders));
        
        // Mark as rated in this browser
        markAsRated(braiderId);
        
        return newRating;
    }
    return null;
}

// Generate star HTML
function generateStars(rating) {
    let stars = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
        if (i <= fullStars) {
            stars += '<i class="fas fa-star"></i>';
        } else if (i === fullStars + 1 && hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    return stars;
}
// Show rating modal
// Add this function to show rating modal
function showRatingModal(braiderId) {
    const braiders = JSON.parse(localStorage.getItem('braiders')) || [];
    const braider = braiders.find(b => b.id === braiderId);
    
    if (!braider) return;
    
    // Check if modal exists, create if not
    let modal = document.getElementById('ratingModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'ratingModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content rating-modal">
                <span class="close">&times;</span>
                <h2>Rate Braider</h2>
                <div class="rating-options">
                    ${[5,4,3,2,1].map(star => `
                        <div class="rating-option" data-rating="${star}">
                            <div class="stars">${'★'.repeat(star)}${'☆'.repeat(5-star)}</div>
                            <div class="label">${star} Star${star !== 1 ? 's' : ''}</div>
                        </div>
                    `).join('')}
                </div>
                <div class="form-group">
                    <label>Your Name</label>
                    <input type="text" id="reviewerName" placeholder="Anonymous">
                </div>
                <div class="form-group">
                    <label>Service Type</label>
                    <select id="serviceType">
                        <option value="">Select service</option>
                        <option value="Box Braids">Box Braids</option>
                        <option value="Cornrows">Cornrows</option>
                        <option value="Fulani">Fulani</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Your Review</label>
                    <textarea id="reviewComment" rows="3"></textarea>
                </div>
                <button class="btn-primary" onclick="submitRating(${braiderId})">Submit</button>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Add close functionality
        modal.querySelector('.close').onclick = () => modal.style.display = 'none';
        
        // Add click handlers for rating options
        modal.querySelectorAll('.rating-option').forEach(opt => {
            opt.onclick = function() {
                document.querySelectorAll('.rating-option').forEach(o => o.classList.remove('selected'));
                this.classList.add('selected');
            };
        });
    }
    
    modal.style.display = 'block';
    
    // Click outside to close
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
}

// Add this function to submit rating
function submitRating(braiderId) {
    const selectedRating = document.querySelector('.rating-option.selected');
    if (!selectedRating) {
        alert('Please select a rating');
        return;
    }
    
    const rating = parseInt(selectedRating.dataset.rating);
    const userName = document.getElementById('reviewerName').value.trim() || 'Anonymous';
    const serviceType = document.getElementById('serviceType').value;
    const comment = document.getElementById('reviewComment').value.trim() || 'No comment';
    
    const braiders = JSON.parse(localStorage.getItem('braiders')) || [];
    const index = braiders.findIndex(b => b.id === braiderId);
    
    if (index !== -1) {
        if (!braiders[index].ratings) braiders[index].ratings = [];
        
        const newRating = {
            id: Date.now(),
            rating: rating,
            userName: userName,
            serviceType: serviceType,
            comment: comment,
            date: new Date().toISOString()
        };
        
        braiders[index].ratings.push(newRating);
        
        // Update average rating
        const total = braiders[index].ratings.reduce((sum, r) => sum + r.rating, 0);
        braiders[index].profile.rating = total / braiders[index].ratings.length;
        
        localStorage.setItem('braiders', JSON.stringify(braiders));
        
        document.getElementById('ratingModal').style.display = 'none';
        alert('Thank you for your review!');
        
        // Refresh reviews if on profile page
        if (window.location.pathname.includes('profile.html')) {
            loadReviews(braiderId);
        }
    }
}

function initializeData() {
    // Initialize admin if not exists
    if (!localStorage.getItem('admin')) {
        const admin = {
            id: 'admin1',
            name: 'Admin',
            email: 'admin@wighub.com',
            password: 'admin123',
            role: 'admin'
        };
        localStorage.setItem('admin', JSON.stringify(admin));
    }
    
    // Initialize braiders if not exists OR if data is corrupted
    try {
        const existingBraiders = localStorage.getItem('braiders');
        if (!existingBraiders) {
            createDefaultBraiders();
        } else {
            // Validate existing data
            const braiders = JSON.parse(existingBraiders);
            if (!Array.isArray(braiders) || braiders.length === 0) {
                createDefaultBraiders();
            }
        }
    } catch (e) {
        // Corrupted data, recreate
        console.log('Recreating corrupted braiders data');
        createDefaultBraiders();
    }
}

function createDefaultBraiders() {
    const defaultBraiders = [
        {
            id: 1,
            name: 'Sarah Beauty',
            email: 'sarah@example.com',
            password: 'braider123',
            role: 'braider',
            profile: {
                photo: 'https://images.unsplash.com/photo-1494790108777-2961285f93ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80',
                location: 'Nairobi',
                speciality: 'Box Braids',
                experience: 5,
                bio: 'Professional braider with 5 years experience specializing in box braids and knotless styles.',
                instagram: '@sarahbeauty',
                phone: '+254700000001',
                rating: 4.8
            },
            uploads: [
                {
                    id: 101,
                    type: 'photo',
                    url: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
                    caption: 'Beautiful box braids',
                    category: 'Box Braids',
                    status: 'approved',
                    date: '2024-01-15'
                },
                {
                    id: 102,
                    type: 'photo',
                    url: 'https://images.unsplash.com/photo-1549236177-f9b8a1c89f7c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
                    caption: 'Knotless braids',
                    category: 'Knotless Braids',
                    status: 'approved',
                    date: '2024-01-20'
                }
            ]
        },
        {
            id: 2,
            name: 'Grace Styles',
            email: 'grace@example.com',
            password: 'braider123',
            role: 'braider',
            profile: {
                photo: 'https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80',
                location: 'Eldoret',
                speciality: 'Cornrows',
                experience: 3,
                bio: 'Creative braider specializing in cornrows and creative patterns.',
                instagram: '@gracestyles',
                phone: '+254700000002',
                rating: 4.5
            },
            uploads: [
                {
                    id: 201,
                    type: 'photo',
                    url: 'https://unsplash.com/photos/woman-in-gray-sweater-holding-white-clothes-hanger-WDmvpGs2060',
                    caption: 'Straight back cornrows',
                    category: 'Cornrows',
                    status: 'approved',
                    date: '2024-01-18'
                },
                {
                    id: 202,
                    type: 'video',
                    url: 'https://unsplash.com/photos/woman-in-gray-sweater-holding-white-clothes-hanger-WDmvpGs2060',
                    caption: 'Cornrow tutorial',
                    category: 'Cornrows',
                    status: 'pending',
                    date: '2024-01-25'
                }
            ]
        },
        {
            id: 3,
            name: 'Mary Hair Art',
            email: 'mary@example.com',
            password: 'braider123',
            role: 'braider',
            profile: {
                photo: 'https://images.unsplash.com/photo-1526510747491-58f928ec870f?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80',
                location: 'Nakuru',
                speciality: 'Fulani',
                experience: 4,
                bio: 'Expert in Fulani braids and tribal styles.',
                instagram: '@maryhairart',
                phone: '+254700000003',
                rating: 4.9
            },
            uploads: [
                {
                    id: 301,
                    type: 'photo',
                    url: 'https://unsplash.com/photos/person-wearing-black-top-W6cwaL7PMSw',
                    caption: 'Fulani braids with beads',
                    category: 'Fulani',
                    status: 'approved',
                    date: '2024-01-22'
                }
            ]
        }
    ];
    localStorage.setItem('braiders', JSON.stringify(defaultBraiders));
}

// Call initialization
initializeData();
// Add after line 7
function validateBraidersData() {
    try {
        const braiders = JSON.parse(localStorage.getItem('braiders'));
        if (!braiders) return true; // No data yet
        
        // Check if it's an array
        if (!Array.isArray(braiders)) {
            console.error('Invalid braiders data structure');
            return false;
        }
        
        // Validate each braider has required fields
        return braiders.every(b => 
            b.id && 
            b.name && 
            b.email && 
            b.profile && 
            b.profile.location
        );
    } catch (e) {
        console.error('Corrupted localStorage data:', e);
        return false;
    }
}

// Use it in initializeData
function initializeData() {
    if (!validateBraidersData()) {
        // Clear corrupted data
        localStorage.removeItem('braiders');
    }
    // ... rest of initialization
}

// Modal functionality
const modal = document.getElementById('loginModal');
const loginBtn = document.getElementById('loginBtn');
const closeBtn = document.querySelector('.close');

if (loginBtn) {
    loginBtn.onclick = function() {
        modal.style.display = 'block';
    }
}

if (closeBtn) {
    closeBtn.onclick = function() {
        modal.style.display = 'none';
    }
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}


// Login form handling
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // Check if it's admin
        const admin = JSON.parse(localStorage.getItem('admin'));
        if (admin && admin.email === email && admin.password === password) {
            localStorage.setItem('currentUser', JSON.stringify(admin));
            window.location.href = 'service-admin.html';
            return;
        }
        
        // Check if it's a braider
        const braiders = JSON.parse(localStorage.getItem('braiders')) || [];
        const braider = braiders.find(b => b.email === email && b.password === password);
        
        if (braider) {
            localStorage.setItem('currentUser', JSON.stringify(braider));
            window.location.href = 'braider-dashboard.html';
        } else {
            alert('Invalid email or password');
        }
    });
}

// Load braiders on home page
function loadBraiders() {
    const braidersGrid = document.getElementById('braidersGrid');
    if (!braidersGrid) return;
    
    const braiders = JSON.parse(localStorage.getItem('braiders')) || [];
    const cityFilter = document.getElementById('cityFilter')?.value || '';
    const specialityFilter = document.getElementById('specialityFilter')?.value || '';
    const sortFilter = document.getElementById('sortFilter')?.value || '';
    
    let filteredBraiders = braiders.filter(b => b.role === 'braider');
    
    if (cityFilter) {
        filteredBraiders = filteredBraiders.filter(b => b.profile.location === cityFilter);
    }
    
    if (specialityFilter) {
        filteredBraiders = filteredBraiders.filter(b => b.profile.speciality === specialityFilter);
    }
    
    // Apply sorting
    if (sortFilter) {
        switch(sortFilter) {
            case 'rating_high':
                filteredBraiders.sort((a, b) => (b.profile.rating || 0) - (a.profile.rating || 0));
                break;
            case 'rating_low':
                filteredBraiders.sort((a, b) => (a.profile.rating || 0) - (b.profile.rating || 0));
                break;
            case 'reviews_most':
                filteredBraiders.sort((a, b) => (b.ratings?.length || 0) - (a.ratings?.length || 0));
                break;
            case 'name_asc':
                filteredBraiders.sort((a, b) => a.name.localeCompare(b.name));
                break;
        }
    }
    
    if (filteredBraiders.length === 0) {
        braidersGrid.innerHTML = '<p class="no-results">No braiders found matching your criteria.</p>';
        return;
    }
    
    braidersGrid.innerHTML = '';
    
    filteredBraiders.forEach(braider => {
        const card = createBraiderCard(braider);
        braidersGrid.appendChild(card);
    });
}

function createBraiderCard(braider) {
    const card = document.createElement('div');
    card.className = 'braider-card';
    
    // Get approved uploads count for portfolio preview
    const approvedUploads = braider.uploads ? braider.uploads.filter(u => u.status === 'approved') : [];
    const previewImage = approvedUploads.length > 0 ? approvedUploads[0].url : braider.profile.photo;
    
    card.innerHTML = `
        <div class="braider-image">
            <img src="${previewImage}" alt="${braider.name}" onerror="this.src='${braider.profile.photo}'">
        </div>
        <div class="braider-info">
            <h3>${braider.name}</h3>
            <p class="location"><i class="fas fa-map-marker-alt"></i> ${braider.profile.location}</p>
            <span class="speciality">${braider.profile.speciality}</span>
            <div class="rating">
                ${generateStars(braider.profile.rating)}
                <span>(${braider.profile.rating})</span>
            </div>
            <p class="portfolio-count"><i class="fas fa-camera"></i> ${approvedUploads.length} works</p>
            <button class="view-profile-btn" onclick="viewProfile(${braider.id})">View Profile</button>
        </div>
    `;
    
    return card;
}

// Load and display reviews
// Replace lines 494-522 in braiders.js with this:
function loadReviews(braiderId) {
    const braiders = JSON.parse(localStorage.getItem('braiders')) || [];
    const braider = braiders.find(b => b.id === braiderId);
    
    if (!braider) return;
    
    // Create reviews section if it doesn't exist
    let reviewsSection = document.querySelector('.reviews-section');
    if (!reviewsSection) {
        reviewsSection = document.createElement('div');
        reviewsSection.className = 'reviews-section';
        
        // Find where to insert - after gallery section
        const gallerySection = document.querySelector('.gallery-section');
        if (gallerySection) {
            gallerySection.parentNode.insertBefore(reviewsSection, gallerySection.nextSibling);
        } else {
            // If no gallery, append to profile container
            const profileContainer = document.querySelector('.profile-container');
            if (profileContainer) {
                profileContainer.appendChild(reviewsSection);
            }
        }
    }
    
    const ratings = braider.ratings || [];
    const totalRatings = ratings.length;
    const averageRating = braider.profile?.rating || 0;
    
    // Get breakdown
    const breakdown = {5:0, 4:0, 3:0, 2:0, 1:0};
    ratings.forEach(r => {
        if (r.rating >= 1 && r.rating <= 5) breakdown[r.rating]++;
    });
    
    // Generate breakdown HTML
    const breakdownHTML = [5,4,3,2,1].map(stars => {
        const count = breakdown[stars];
        const percentage = totalRatings > 0 ? Math.round((count / totalRatings) * 100) : 0;
        return `
            <div class="rating-bar">
                <span class="stars-label">${stars} star${stars !== 1 ? 's' : ''}</span>
                <div class="bar-container">
                    <div class="bar-fill" style="width: ${percentage}%"></div>
                </div>
                <span class="percentage">${percentage}%</span>
            </div>
        `;
    }).join('');
    
    // Generate reviews list
    const reviewsList = ratings.slice(-5).reverse().map(r => `
        <div class="review-item">
            <div class="review-header">
                <span class="reviewer-name">${r.userName}</span>
                <span class="review-date">${new Date(r.date).toLocaleDateString()}</span>
            </div>
            <div class="review-rating">
                ${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}
            </div>
            <div class="review-comment">${r.comment}</div>
            ${r.serviceType ? `<span class="review-service">${r.serviceType}</span>` : ''}
        </div>
    `).join('');
    
    reviewsSection.innerHTML = `
        <h2>Reviews & Ratings</h2>
        <div class="rating-summary">
            <div class="rating-average">
                <div class="average-number">${averageRating.toFixed(1)}</div>
                <div class="average-stars">${generateStars(averageRating)}</div>
                <div class="total-reviews">${totalRatings} reviews</div>
            </div>
            <div class="rating-breakdown">
                ${breakdownHTML}
            </div>
        </div>
        <div class="reviews-header">
            <h3>Recent Reviews</h3>
            <button class="rate-button" onclick="showRatingModal(${braider.id})">
                <i class="fas fa-star"></i> Write Review
            </button>
        </div>
        <div class="reviews-list">
            ${ratings.length > 0 ? reviewsList : '<p class="no-reviews">No reviews yet</p>'}
        </div>
    `;
}
// Replace your existing createBraiderCard function with this updated version
function createBraiderCard(braider) {
    const card = document.createElement('div');
    card.className = 'braider-card';
    
    // Get approved uploads count for portfolio preview
    const approvedUploads = braider.uploads ? braider.uploads.filter(u => u.status === 'approved') : [];
    const previewImage = approvedUploads.length > 0 ? approvedUploads[0].url : braider.profile.photo;
    
    // Get rating info
    const rating = braider.profile.rating || 0;
    const totalRatings = braider.ratings?.length || 0;
    
    card.innerHTML = `
        <div class="braider-image">
            <img src="${previewImage}" alt="${braider.name}" onerror="this.src='${braider.profile.photo}'">
        </div>
        <div class="braider-info">
            <h3>${braider.name}</h3>
            <p class="location"><i class="fas fa-map-marker-alt"></i> ${braider.profile.location}</p>
            <span class="speciality">${braider.profile.speciality}</span>
            <div class="rating">
                ${generateStars(rating)}
                <span class="rating-count">(${rating}) • ${totalRatings} review${totalRatings !== 1 ? 's' : ''}</span>
            </div>
            <p class="portfolio-count"><i class="fas fa-camera"></i> ${approvedUploads.length} works</p>
            <button class="view-profile-btn" onclick="viewProfile(${braider.id})">View Profile</button>
        </div>
    `;
    
    return card;
}

// View profile function
// Replace your existing viewProfile function
window.viewProfile = function(braiderId) {
    const braiders = JSON.parse(localStorage.getItem('braiders')) || [];
    const braider = braiders.find(b => b.id === braiderId);
    
    if (braider) {
        // Store selected braider and redirect to profile page
        localStorage.setItem('viewingBraider', JSON.stringify(braider));
        window.location.href = `profile.html?id=${braiderId}`;
    }
}

// Search functionality
const searchBtn = document.getElementById('searchBtn');
const searchLocation = document.getElementById('searchLocation');

if (searchBtn) {
    searchBtn.addEventListener('click', function() {
        const location = searchLocation.value.trim();
        if (location) {
            // Check if location exists in our cities
            const braiders = JSON.parse(localStorage.getItem('braiders')) || [];
            const locations = [...new Set(braiders.map(b => b.profile.location))];
            
            const matchedLocation = locations.find(l => 
                l.toLowerCase().includes(location.toLowerCase())
            );
            
            if (matchedLocation) {
                document.getElementById('cityFilter').value = matchedLocation;
                loadBraiders();
            } else {
                alert(`No braiders found in "${location}". Showing all braiders.`);
                document.getElementById('cityFilter').value = '';
                loadBraiders();
            }
        }
    });
}

// Filter listeners
const cityFilter = document.getElementById('cityFilter');
const specialityFilter = document.getElementById('specialityFilter');

if (cityFilter) {
    cityFilter.addEventListener('change', loadBraiders);
}

if (specialityFilter) {
    specialityFilter.addEventListener('change', loadBraiders);
}

// Profile page functionality
function createProfilePage() {
    // Check if we're on profile page
    if (!window.location.pathname.includes('profile.html')) return;
    
    // Clear existing content to prevent double rendering
    document.body.innerHTML = '';
    
    const urlParams = new URLSearchParams(window.location.search);
    const braiderId = parseInt(urlParams.get('id'));
    
    if (!braiderId) {
        window.location.href = 'braiders.html';
        return;
    }
    
    const braiders = JSON.parse(localStorage.getItem('braiders')) || [];
    const braider = braiders.find(b => b.id === braiderId);
    
    if (!braider) {
        window.location.href = 'braiders.html';
        return;
    }
    
    // Create profile HTML
    document.body.innerHTML = `
        <header class="header">
            <nav class="nav-container">
                <div class="logo">WigHub</div>
                <ul class="nav-menu">
                    <li><a href="braiders.html">Home</a></li>
                    <li><a href="braiders.html#braiders">Braiders</a></li>
                    <li><a href="braiders.html#contact">Contact</a></li>
                </ul>
                <div class="nav-right">
                    <button class="login-btn" id="loginBtn">
                        <i class="fas fa-lock"></i> Braider Login
                    </button>
                </div>
            </nav>
        </header>

        <div class="profile-container">
            <div class="profile-header">
                <img src="${braider.profile.photo}" alt="${braider.name}" id="profileImage">
                <div class="profile-details">
                    <h1 id="profileName">${braider.name}</h1>
                    <div class="profile-meta">
                        <p id="profileLocation"><i class="fas fa-map-marker-alt"></i> ${braider.profile.location}</p>
                        <p id="profileExperience"><i class="fas fa-clock"></i> ${braider.profile.experience} years experience</p>
                    </div>
                    <div class="rating">
                        ${generateStars(braider.profile.rating)}
                        <span>(${braider.profile.rating})</span>
                    </div>
                    <p class="bio" id="profileBio">${braider.profile.bio}</p>
                    <div class="contact-info">
                        <p id="profileInstagram"><i class="fab fa-instagram"></i> ${braider.profile.instagram}</p>
                        <p id="profilePhone"><i class="fas fa-phone"></i> ${braider.profile.phone}</p>
                    </div>
                </div>
            </div>

           <div class="gallery-section">
    <h2>Portfolio</h2>
    <div class="gallery-grid" id="galleryGrid">
        ${generateGalleryHTML(braider.uploads)}
    </div>
</div>

<!-- Reviews will be added here dynamically by JavaScript -->

        <footer class="footer">
            <p>&copy; 2024 WigHub. All rights reserved.</p>
        </footer>

        <!-- Login Modal -->
        <div id="loginModal" class="modal">
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>Braider Login</h2>
                <form id="loginForm">
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" required>
                    </div>
                    <button type="submit" class="btn-primary">Login</button>
                </form>
                <p class="login-note">Only registered braiders can login. Accounts created by admin only.</p>
            </div>
        </div>
    `;
    
    // Re-attach event listeners
    attachEventListeners();
    loadReviews(braiderId);
}

function generateGalleryHTML(uploads) {
    if (!uploads || uploads.length === 0) {
        return '<p class="no-results">No portfolio items yet.</p>';
    }
    
    const approvedUploads = uploads.filter(u => u.status === 'approved');
    
    if (approvedUploads.length === 0) {
        return '<p class="no-results">No approved portfolio items yet.</p>';
    }
    
    return approvedUploads.map(upload => {
        if (upload.type === 'photo') {
            return `
                <div class="gallery-item">
                    <img src="${upload.url}" alt="${upload.caption}">
                    <div class="gallery-caption">${upload.caption}</div>
                </div>
            `;
        } else {
            return `
                <div class="gallery-item">
                    <video src="${upload.url}" controls></video>
                    <div class="video-indicator"><i class="fas fa-play"></i></div>
                    <div class="gallery-caption">${upload.caption}</div>
                </div>
            `;
        }
    }).join('');
}
// Lines 337-385 (fixed - prevents duplicate listeners)
let listenersAttached = false;

function attachEventListeners() {
    // Prevent duplicate attachments
    if (listenersAttached) return;
    
    // Modal functionality
    const modal = document.getElementById('loginModal');
    const loginBtn = document.getElementById('loginBtn');
    const closeBtn = document.querySelector('.close');
    
    // Remove existing listeners by cloning and replacing
    if (loginBtn) {
        const newLoginBtn = loginBtn.cloneNode(true);
        loginBtn.parentNode.replaceChild(newLoginBtn, loginBtn);
        newLoginBtn.onclick = function() {
            modal.style.display = 'block';
        }
    }
    
    if (closeBtn) {
        const newCloseBtn = closeBtn.cloneNode(true);
        closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
        newCloseBtn.onclick = function() {
            modal.style.display = 'none';
        }
    }
    
    // Replace window.onclick
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }
    
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        const newLoginForm = loginForm.cloneNode(true);
        loginForm.parentNode.replaceChild(newLoginForm, loginForm);
        
        newLoginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            const admin = JSON.parse(localStorage.getItem('admin'));
            if (admin && admin.email === email && admin.password === password) {
                localStorage.setItem('currentUser', JSON.stringify(admin));
                window.location.href = 'service-admin.html';
                return;
            }
            
            const braiders = JSON.parse(localStorage.getItem('braiders')) || [];
            const braider = braiders.find(b => b.email === email && b.password === password);
            
            if (braider) {
                localStorage.setItem('currentUser', JSON.stringify(braider));
                window.location.href = 'braider-dashboard.html';
            } else {
                alert('Invalid email or password');
            }
        });
    }
    
    listenersAttached = true;
}

// One DOMContentLoaded to rule them all
document.addEventListener('DOMContentLoaded', function() {
    // Your existing hero rotation
    initHeroRotation();
    
    // Load braiders
    loadBraiders();
    
    // Setup sort filter if it exists
    const sortFilter = document.getElementById('sortFilter');
    if (sortFilter) {
        sortFilter.addEventListener('change', loadBraiders);
    }
    
    // Handle profile page
    if (window.location.pathname.includes('profile.html')) {
        createProfilePage();
    }
});

// Logout function
window.logout = function() {
    localStorage.removeItem('currentUser');
    window.location.href = 'braiders.html';
}
// Add at the bottom of braiders.js
function isValidVideoUrl(url) {
    return url && (url.includes('.mp4') || url.includes('.webm') || 
           url.includes('youtube.com') || url.includes('vimeo.com') || 
           url.includes('player.'));
}
// Add this function to track profile views
function incrementProfileViews(braiderId) {
    const views = JSON.parse(localStorage.getItem('profileViews')) || {};
    views[braiderId] = (views[braiderId] || 0) + 1;
    localStorage.setItem('profileViews', JSON.stringify(views));
    return views[braiderId];
}