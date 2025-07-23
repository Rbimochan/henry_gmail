/**
 * Shopify Shoes Store Theme - Global JavaScript
 * Contains all the interactive functionality for the shoes store
 */

class ShoeStoreTheme {
  constructor() {
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.initMobileMenu();
    this.initProductVariants();
    this.initCart();
    this.initQuickView();
    this.initSearch();
    this.initScrollEffects();
    this.initAnimations();
  }

  setupEventListeners() {
    document.addEventListener('DOMContentLoaded', () => {
      console.log('Shoe Store Theme Loaded');
    });

    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseAnimations();
      } else {
        this.resumeAnimations();
      }
    });
  }

  /**
   * Mobile Menu Functionality
   */
  initMobileMenu() {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileClose = document.querySelector('.mobile-menu__close');

    if (mobileToggle && mobileMenu) {
      mobileToggle.addEventListener('click', () => {
        mobileMenu.classList.add('open');
        document.body.style.overflow = 'hidden';
      });

      if (mobileClose) {
        mobileClose.addEventListener('click', () => {
          mobileMenu.classList.remove('open');
          document.body.style.overflow = '';
        });
      }

      // Close menu when clicking outside
      mobileMenu.addEventListener('click', (e) => {
        if (e.target === mobileMenu) {
          mobileMenu.classList.remove('open');
          document.body.style.overflow = '';
        }
      });

      // Close menu on escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
          mobileMenu.classList.remove('open');
          document.body.style.overflow = '';
        }
      });
    }
  }

  /**
   * Product Variant Selection (Size & Color)
   */
  initProductVariants() {
    // Size selector
    const sizeOptions = document.querySelectorAll('.size-option');
    sizeOptions.forEach(option => {
      option.addEventListener('click', (e) => {
        if (!e.target.classList.contains('unavailable')) {
          // Remove selected class from all options
          sizeOptions.forEach(opt => opt.classList.remove('selected'));
          // Add selected class to clicked option
          e.target.classList.add('selected');
          
          // Update variant data
          this.updateVariant('size', e.target.dataset.size);
        }
      });
    });

    // Color swatches
    const colorSwatches = document.querySelectorAll('.color-swatch');
    colorSwatches.forEach(swatch => {
      swatch.addEventListener('click', (e) => {
        // Remove selected class from all swatches
        colorSwatches.forEach(sw => sw.classList.remove('selected'));
        // Add selected class to clicked swatch
        e.target.classList.add('selected');
        
        // Update product images if available
        this.updateProductImages(e.target.dataset.color);
        
        // Update variant data
        this.updateVariant('color', e.target.dataset.color);
      });
    });

    // Quantity selector
    const quantityInputs = document.querySelectorAll('.quantity-input');
    const quantityButtons = document.querySelectorAll('.quantity-btn');

    quantityButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const input = e.target.parentNode.querySelector('.quantity-input');
        const isIncrement = e.target.classList.contains('quantity-plus');
        const currentValue = parseInt(input.value) || 1;
        
        if (isIncrement) {
          input.value = currentValue + 1;
        } else if (currentValue > 1) {
          input.value = currentValue - 1;
        }
        
        // Trigger change event
        input.dispatchEvent(new Event('change'));
      });
    });
  }

  updateVariant(option, value) {
    // Store selected variant data
    if (!window.selectedVariant) {
      window.selectedVariant = {};
    }
    window.selectedVariant[option] = value;

    // Update price and availability
    this.updatePriceAndAvailability();
    
    // Update URL if needed
    this.updateURL();
  }

  updateProductImages(color) {
    const productImages = document.querySelectorAll('.product-image');
    productImages.forEach(image => {
      if (image.dataset.color === color) {
        image.style.display = 'block';
      } else {
        image.style.display = 'none';
      }
    });
  }

  updatePriceAndAvailability() {
    // This would typically make an API call to get variant data
    // For now, we'll just update the UI based on selected options
    const priceElement = document.querySelector('.product-price');
    const addToCartButton = document.querySelector('.add-to-cart-btn');
    
    if (window.selectedVariant && window.selectedVariant.size && window.selectedVariant.color) {
      if (addToCartButton) {
        addToCartButton.disabled = false;
        addToCartButton.textContent = 'Add to Cart';
      }
    } else {
      if (addToCartButton) {
        addToCartButton.disabled = true;
        addToCartButton.textContent = 'Select Size & Color';
      }
    }
  }

  updateURL() {
    // Update URL with selected variant without page reload
    if (window.history && window.history.pushState) {
      const url = new URL(window.location);
      if (window.selectedVariant) {
        Object.keys(window.selectedVariant).forEach(key => {
          url.searchParams.set(key, window.selectedVariant[key]);
        });
        window.history.pushState({}, '', url);
      }
    }
  }

  /**
   * Cart Functionality
   */
  initCart() {
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    const cartIcon = document.querySelector('.cart-icon');
    const cartCount = document.querySelector('.cart-count');

    addToCartButtons.forEach(button => {
      button.addEventListener('click', async (e) => {
        e.preventDefault();
        
        const productId = e.target.dataset.productId;
        const variantId = e.target.dataset.variantId;
        const quantity = document.querySelector('.quantity-input')?.value || 1;

        if (!variantId) {
          this.showNotification('Please select size and color', 'error');
          return;
        }

        try {
          await this.addToCart(variantId, quantity);
          this.showNotification('Added to cart!', 'success');
          this.updateCartCount();
          this.animateCartIcon();
        } catch (error) {
          this.showNotification('Error adding to cart', 'error');
          console.error('Add to cart error:', error);
        }
      });
    });

    // Cart drawer toggle
    if (cartIcon) {
      cartIcon.addEventListener('click', () => {
        this.toggleCartDrawer();
      });
    }
  }

  async addToCart(variantId, quantity) {
    const response = await fetch('/cart/add.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: variantId,
        quantity: parseInt(quantity)
      })
    });

    if (!response.ok) {
      throw new Error('Failed to add to cart');
    }

    return response.json();
  }

  async updateCartCount() {
    try {
      const response = await fetch('/cart.js');
      const cart = await response.json();
      const cartCount = document.querySelector('.cart-count');
      
      if (cartCount) {
        cartCount.textContent = cart.item_count;
        cartCount.style.display = cart.item_count > 0 ? 'block' : 'none';
      }
    } catch (error) {
      console.error('Error updating cart count:', error);
    }
  }

  animateCartIcon() {
    const cartIcon = document.querySelector('.cart-icon');
    if (cartIcon) {
      cartIcon.classList.add('cart-bounce');
      setTimeout(() => {
        cartIcon.classList.remove('cart-bounce');
      }, 600);
    }
  }

  toggleCartDrawer() {
    const cartDrawer = document.querySelector('.cart-drawer');
    if (cartDrawer) {
      cartDrawer.classList.toggle('open');
    }
  }

  /**
   * Quick View Functionality
   */
  initQuickView() {
    const quickViewButtons = document.querySelectorAll('.quick-view-btn');
    const quickViewModal = document.querySelector('.quick-view-modal');
    const quickViewClose = document.querySelector('.quick-view-close');

    quickViewButtons.forEach(button => {
      button.addEventListener('click', async (e) => {
        e.preventDefault();
        const productHandle = e.target.dataset.productHandle;
        await this.openQuickView(productHandle);
      });
    });

    if (quickViewClose) {
      quickViewClose.addEventListener('click', () => {
        this.closeQuickView();
      });
    }

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeQuickView();
      }
    });

    // Close on backdrop click
    if (quickViewModal) {
      quickViewModal.addEventListener('click', (e) => {
        if (e.target === quickViewModal) {
          this.closeQuickView();
        }
      });
    }
  }

  async openQuickView(productHandle) {
    const modal = document.querySelector('.quick-view-modal');
    const content = document.querySelector('.quick-view-content');
    
    if (modal && content) {
      try {
        // Show loading state
        content.innerHTML = '<div class="loading">Loading...</div>';
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        // Fetch product data
        const response = await fetch(`/products/${productHandle}?view=quick`);
        const html = await response.text();
        
        content.innerHTML = html;
        
        // Reinitialize product functionality for quick view
        this.initProductVariants();
      } catch (error) {
        content.innerHTML = '<div class="error">Error loading product</div>';
        console.error('Quick view error:', error);
      }
    }
  }

  closeQuickView() {
    const modal = document.querySelector('.quick-view-modal');
    if (modal) {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }
  }

  /**
   * Search Functionality
   */
  initSearch() {
    const searchInput = document.querySelector('.search-input');
    const searchResults = document.querySelector('.search-results');
    let searchTimeout;

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();

        if (query.length > 2) {
          searchTimeout = setTimeout(() => {
            this.performSearch(query);
          }, 300);
        } else {
          this.clearSearchResults();
        }
      });

      // Handle search form submission
      const searchForm = searchInput.closest('form');
      if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const query = searchInput.value.trim();
          if (query) {
            window.location.href = `/search?q=${encodeURIComponent(query)}`;
          }
        });
      }
    }
  }

  async performSearch(query) {
    try {
      const response = await fetch(`/search/suggest.json?q=${encodeURIComponent(query)}&resources[type]=product&resources[limit]=6`);
      const data = await response.json();
      this.displaySearchResults(data.resources.results.products);
    } catch (error) {
      console.error('Search error:', error);
    }
  }

  displaySearchResults(products) {
    const resultsContainer = document.querySelector('.search-results');
    if (!resultsContainer) return;

    if (products && products.length > 0) {
      let html = '<ul class="search-results-list">';
      products.forEach(product => {
        html += `
          <li class="search-result-item">
            <a href="/products/${product.handle}" class="search-result-link">
              <img src="${product.featured_image}" alt="${product.title}" class="search-result-image">
              <div class="search-result-info">
                <h4 class="search-result-title">${product.title}</h4>
                <p class="search-result-price">${this.formatPrice(product.price)}</p>
              </div>
            </a>
          </li>
        `;
      });
      html += '</ul>';
      resultsContainer.innerHTML = html;
      resultsContainer.style.display = 'block';
    } else {
      resultsContainer.innerHTML = '<p class="no-results">No products found</p>';
      resultsContainer.style.display = 'block';
    }
  }

  clearSearchResults() {
    const resultsContainer = document.querySelector('.search-results');
    if (resultsContainer) {
      resultsContainer.style.display = 'none';
    }
  }

  /**
   * Scroll Effects
   */
  initScrollEffects() {
    // Header scroll effect
    let lastScrollY = window.scrollY;
    const header = document.querySelector('.header');

    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;
      
      if (header) {
        if (currentScrollY > 100) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }

        // Hide/show header on scroll
        if (currentScrollY > lastScrollY && currentScrollY > 200) {
          header.classList.add('hidden');
        } else {
          header.classList.remove('hidden');
        }
      }
      
      lastScrollY = currentScrollY;
    });

    // Parallax effect for hero sections
    const heroElements = document.querySelectorAll('.hero');
    if (heroElements.length > 0) {
      window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        heroElements.forEach(hero => {
          const rate = scrolled * -0.5;
          hero.style.transform = `translateY(${rate}px)`;
        });
      });
    }
  }

  /**
   * Animations
   */
  initAnimations() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll('.animate-on-scroll');
    animateElements.forEach(el => observer.observe(el));

    // Product card hover effects
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.classList.add('hovered');
      });

      card.addEventListener('mouseleave', () => {
        card.classList.remove('hovered');
      });
    });
  }

  pauseAnimations() {
    const animatedElements = document.querySelectorAll('.float-animation');
    animatedElements.forEach(el => {
      el.style.animationPlayState = 'paused';
    });
  }

  resumeAnimations() {
    const animatedElements = document.querySelectorAll('.float-animation');
    animatedElements.forEach(el => {
      el.style.animationPlayState = 'running';
    });
  }

  /**
   * Utility Functions
   */
  formatPrice(price) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price / 100);
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.textContent = message;

    // Add to page
    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);

    // Remove notification
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
}

// Initialize the theme when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.shoeStoreTheme = new ShoeStoreTheme();
  });
} else {
  window.shoeStoreTheme = new ShoeStoreTheme();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ShoeStoreTheme;
}
