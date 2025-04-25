// Main DOM elements
const imageGrid = document.getElementById('imageGrid');
const refreshButton = document.getElementById('refreshButton');
const darkModeToggle = document.getElementById('darkModeToggle');
const imageModal = document.getElementById('imageModal');
const modalImg = document.getElementById('modalImg');
const modalImageInfo = document.getElementById('modalImageInfo');
const downloadBtn = document.getElementById('downloadBtn');
const closeModal = document.querySelector('.close-modal');

// Configuration constants
const NUMBER_OF_IMAGES = 9;
const IMAGE_WIDTH = 300;
const IMAGE_HEIGHT = 200;
const LARGE_IMAGE_WIDTH = 800;
const LARGE_IMAGE_HEIGHT = 600;

// Initialize app on DOM load
document.addEventListener('DOMContentLoaded', () => {
  // Restore dark mode preference
  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
  }
  
  loadImages();

  // Set up modal close behaviors
  closeModal.addEventListener('click', closeImageModal);
  window.addEventListener('click', (e) => {
    if (e.target === imageModal) {
      closeImageModal();
    }
  });
  
  // Keyboard accessibility
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && imageModal.style.display === 'block') {
      closeImageModal();
    }
  });
});

// Event listeners
refreshButton.addEventListener('click', loadImages);
darkModeToggle.addEventListener('click', toggleDarkMode);

// Toggle between light/dark theme
function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
}

// Load/refresh all images in the grid
function loadImages() {
  imageGrid.innerHTML = '';
  
  for (let i = 0; i < NUMBER_OF_IMAGES; i++) {
    createImageCard();
  }
}

// Create single image card with loading and error handling
function createImageCard() {
  const randomId = Math.floor(Math.random() * 1000);
  
  const card = document.createElement('div');
  card.className = 'image-card';
  
  const imageContainer = document.createElement('div');
  imageContainer.className = 'image-container';
  
  const loadingContainer = document.createElement('div');
  loadingContainer.className = 'loading-container';
  
  const loadingSpinner = document.createElement('div');
  loadingSpinner.className = 'loading';
  loadingContainer.appendChild(loadingSpinner);
  
  imageContainer.appendChild(loadingContainer);
  card.appendChild(imageContainer);
  
  const infoDiv = document.createElement('div');
  infoDiv.className = 'image-info';
  
  imageGrid.appendChild(card);
  
  const imageUrl = `https://picsum.photos/id/${randomId}/${IMAGE_WIDTH}/${IMAGE_HEIGHT}?random=${Date.now()}`;
  const largeImageUrl = `https://picsum.photos/id/${randomId}/${LARGE_IMAGE_WIDTH}/${LARGE_IMAGE_HEIGHT}?random=${Date.now()}`;
  
  const img = document.createElement('img');
  
  img.onload = function() {
    imageContainer.removeChild(loadingContainer);
    imageContainer.appendChild(img);
    
    infoDiv.innerHTML = `
      <p>Image ID: ${randomId}</p>
      <p>Size: ${IMAGE_WIDTH} x ${IMAGE_HEIGHT}</p>
    `;
    card.appendChild(infoDiv);
    
    card.addEventListener('click', () => {
      openImageModal(randomId, largeImageUrl);
    });
  };
  
  // Handle error by trying another random image
  img.onerror = function() {
    const newRandomId = Math.floor(Math.random() * 1000);
    img.src = `https://picsum.photos/id/${newRandomId}/${IMAGE_WIDTH}/${IMAGE_HEIGHT}?random=${Date.now()}`;
    
    const newLargeImageUrl = `https://picsum.photos/id/${newRandomId}/${LARGE_IMAGE_WIDTH}/${LARGE_IMAGE_HEIGHT}?random=${Date.now()}`;
    
    // If second attempt fails, show fallback UI
    img.onerror = function() {
      imageContainer.removeChild(loadingContainer);
      
      const fallbackDiv = document.createElement('div');
      fallbackDiv.className = 'image-fallback';
      fallbackDiv.innerHTML = `
        <p>Image unavailable</p>
        <button onclick="reloadThisImage(this)">Try Again</button>
      `;
      imageContainer.appendChild(fallbackDiv);
    };
    
    card.addEventListener('click', () => {
      openImageModal(newRandomId, newLargeImageUrl);
    });
  };
  
  img.src = imageUrl;
  img.alt = 'Random Image';
  img.loading = "eager";
}

// Reload a specific image card when retry button is clicked
function reloadThisImage(buttonElement) {
  const card = buttonElement.closest('.image-card');
  const imageContainer = card.querySelector('.image-container');
  
  imageContainer.innerHTML = '';
  
  // Re-add loading indicator
  const loadingContainer = document.createElement('div');
  loadingContainer.className = 'loading-container';
  
  const loadingSpinner = document.createElement('div');
  loadingSpinner.className = 'loading';
  loadingContainer.appendChild(loadingSpinner);
  
  imageContainer.appendChild(loadingContainer);
  
  const randomId = Math.floor(Math.random() * 1000);
  const imageUrl = `https://picsum.photos/id/${randomId}/${IMAGE_WIDTH}/${IMAGE_HEIGHT}?random=${Date.now()}`;
  const largeImageUrl = `https://picsum.photos/id/${randomId}/${LARGE_IMAGE_WIDTH}/${LARGE_IMAGE_HEIGHT}?random=${Date.now()}`;
  
  const img = document.createElement('img');
  
  img.onload = function() {
    imageContainer.removeChild(loadingContainer);
    imageContainer.appendChild(img);
    
    const infoDiv = card.querySelector('.image-info') || document.createElement('div');
    infoDiv.className = 'image-info';
    infoDiv.innerHTML = `
      <p>Image ID: ${randomId}</p>
      <p>Size: ${IMAGE_WIDTH} x ${IMAGE_HEIGHT}</p>
    `;
    
    if (!card.querySelector('.image-info')) {
      card.appendChild(infoDiv);
    }
    
    card.addEventListener('click', () => {
      openImageModal(randomId, largeImageUrl);
    });
  };
  
  // Try alternative image source if primary fails
  img.onerror = function() {
    img.src = `https://source.unsplash.com/random/${IMAGE_WIDTH}x${IMAGE_HEIGHT}?sig=${Date.now()}`;
    
    img.onerror = function() {
      imageContainer.removeChild(loadingContainer);
      imageContainer.innerHTML = `
        <div class="image-fallback">
          <p>Image unavailable</p>
          <button onclick="reloadThisImage(this)">Try Again</button>
        </div>
      `;
    };
  };
  
  img.src = imageUrl;
  img.alt = 'Random Image';
}

// Open modal with high-resolution version of clicked image
function openImageModal(imageId, largeImageUrl) {
  imageModal.style.display = 'block';
  document.body.style.overflow = 'hidden'; // Prevent scrolling behind modal
  
  // Add loading indicator to modal
  const modalLoading = document.createElement('div');
  modalLoading.className = 'modal-loading';
  modalLoading.innerHTML = '<div class="loading"></div>';
  imageModal.appendChild(modalLoading);
  
  modalImg.src = '';
  
  modalImageInfo.innerHTML = `
    <p>Image ID: ${imageId}</p>
    <p>Loading high resolution image...</p>
  `;
  
  // Preload high-res image
  const tempImg = new Image();
  
  tempImg.onload = function() {
    if (imageModal.contains(modalLoading)) {
      imageModal.removeChild(modalLoading);
    }
    
    modalImg.src = largeImageUrl;
    
    modalImageInfo.innerHTML = `
      <p>Image ID: ${imageId}</p>
      <p>Full Size: ${tempImg.width} x ${tempImg.height}</p>
    `;
    
    downloadBtn.href = largeImageUrl;
    downloadBtn.download = `random-image-${imageId}.jpg`;
  };
  
  tempImg.onerror = function() {
    if (imageModal.contains(modalLoading)) {
      imageModal.removeChild(modalLoading);
    }
    
    modalImg.src = '';
    modalImg.alt = 'Image could not be loaded';
    modalImageInfo.innerHTML = `
      <p>Error: Failed to load high resolution image.</p>
      <p>Please try another image.</p>
    `;
    
    // Disable download button
    downloadBtn.style.opacity = '0.5';
    downloadBtn.style.pointerEvents = 'none';
  };
  
  tempImg.src = largeImageUrl;
}

// Close modal and restore UI state
function closeImageModal() {
  imageModal.style.display = 'none';
  document.body.style.overflow = ''; // Restore scrolling
  
  // Reset download button
  downloadBtn.style.opacity = '1';
  downloadBtn.style.pointerEvents = 'auto';
  
  // Remove any loading overlays
  const modalLoading = imageModal.querySelector('.modal-loading');
  if (modalLoading) {
    imageModal.removeChild(modalLoading);
  }
}

// Export function for inline button usage
window.reloadThisImage = reloadThisImage;