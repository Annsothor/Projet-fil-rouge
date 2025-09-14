// Enhanced Carousel Class - Version corrigée et fonctionnelle
class EnhancedCarousel {
  constructor() {
    this.track = document.querySelector(".carousel-track");
    this.carousel = document.querySelector(".carousel");

    if (!this.track || !this.carousel) {
      console.warn('Carrousel : Éléments DOM manquants');
      return;
    }

    this.items = Array.from(this.track.children);
    this.dotsContainer = document.querySelector(".carousel-dots");

    this.prevBtn = document.querySelector(".carousel-btn-prev");
    this.nextBtn = document.querySelector(".carousel-btn-next");
    this.playPauseBtn = document.querySelector(".carousel-play-pause");

    this.visibleCount = this.getVisibleCount();
    this.itemWidth = 0;
    this.baseSpeed = 1;
    this.currentSpeed = 1;
    this.position = 0;
    this.isPlaying = true;
    this.isTransitioning = false;
    this.currentIndex = 0;
    this.animationId = null;
    this.wasPlayingBeforeHover = false;

    this.touchStartX = 0;
    this.touchEndX = 0;
    this.isDragging = false;

    this.resizeTimeout = null;

    if (this.items.length > 0) {
      this.init();
    } else {
      console.warn('Carrousel : Aucun élément trouvé dans .carousel-track');
    }
  }

  init() {
    this.cloneItems();
    this.calculateDimensions();
    this.createDots();
    this.setupEventListeners();
    this.startAnimation();
    console.log('Carrousel initialisé avec', this.items.length, 'éléments');
  }

  cloneItems() {
    this.items.forEach(item => {
      const clone = item.cloneNode(true);
      this.track.appendChild(clone);
    });
  }

  calculateDimensions() {
    if (this.items.length > 0) {
      const itemRect = this.items[0].getBoundingClientRect();
      this.itemWidth = itemRect.width + 10; // largeur + gap
    }
  }

  getVisibleCount() {
    if (window.innerWidth <= 600) return 1;
    if (window.innerWidth <= 900) return 2;
    return 3;
  }

  createDots() {
    if (!this.dotsContainer) return;
    this.dotsContainer.innerHTML = '';
    for (let i = 0; i < this.items.length; i++) {
      const dot = document.createElement('div');
      dot.classList.add('carousel-dot');
      dot.setAttribute('role', 'button');
      dot.setAttribute('aria-label', `Aller à l'image ${i + 1}`);
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => this.goToSlide(i));
      this.dotsContainer.appendChild(dot);
    }
    this.dots = Array.from(this.dotsContainer.children);
  }

  setupEventListeners() {
    if (this.prevBtn) this.prevBtn.addEventListener('click', () => this.previousSlide());
    if (this.nextBtn) this.nextBtn.addEventListener('click', () => this.nextSlide());
    if (this.playPauseBtn) this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());

    this.carousel.addEventListener('mouseenter', () => this.pauseOnHover());
    this.carousel.addEventListener('mouseleave', () => this.resumeFromHover());

    document.addEventListener('keydown', (e) => this.handleKeyboard(e));

    this.setupTouchEvents();

    window.addEventListener('resize', () => this.handleResize());

    this.handleImageErrors();
  }

  setupTouchEvents() {
    this.carousel.addEventListener('touchstart', (e) => {
      this.touchStartX = e.touches[0].clientX;
      this.isDragging = true;
    }, { passive: true });

    this.carousel.addEventListener('touchmove', (e) => {
      if (!this.isDragging) return;
      this.touchEndX = e.touches[0].clientX;
    }, { passive: true });

    this.carousel.addEventListener('touchend', () => {
      if (!this.isDragging) return;
      this.handleSwipe();
      this.isDragging = false;
    });
  }

  handleSwipe() {
    const threshold = 50;
    const diff = this.touchStartX - this.touchEndX;
    if (Math.abs(diff) > threshold) {
      if (diff > 0) this.nextSlide();
      else this.previousSlide();
    }
  }

  handleKeyboard(e) {
    if (!this.carousel.contains(document.activeElement)) return;
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        this.previousSlide();
        break;
      case 'ArrowRight':
        e.preventDefault();
        this.nextSlide();
        break;
      case ' ':
        e.preventDefault();
        this.togglePlayPause();
        break;
    }
  }

  handleResize() {
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => {
      const oldVisibleCount = this.visibleCount;
      this.visibleCount = this.getVisibleCount();
      this.calculateDimensions();
      if (oldVisibleCount !== this.visibleCount) {
        this.position = -this.itemWidth * this.currentIndex;
        this.track.style.transform = `translateX(${this.position}px)`;
      }
    }, 250);
  }

  handleImageErrors() {
    const images = this.carousel.querySelectorAll('img');
    images.forEach(img => {
      img.addEventListener('error', () => {
        img.parentElement.classList.add('loading');
        img.alt = 'Image non disponible';
      });
      img.addEventListener('load', () => {
        img.parentElement.classList.remove('loading');
      });
    });
  }

  startAnimation() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    this.animate();
  }

  animate() {
    if (this.isPlaying && !this.isTransitioning && this.itemWidth > 0) {
      this.position -= this.baseSpeed * this.currentSpeed;

      // Loop infini
      const totalWidth = this.itemWidth * this.items.length;
      if (Math.abs(this.position) >= totalWidth) {
        this.position = 0;
      }

      this.track.style.transform = `translateX(${this.position}px)`;

      // Update currentIndex pour dots
      const newIndex = Math.floor(Math.abs(this.position) / this.itemWidth) % this.items.length;
      if (newIndex !== this.currentIndex) {
        this.currentIndex = newIndex;
        this.updateDots();
      }
    }
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  goToSlide(index) {
    if (this.isTransitioning || index === this.currentIndex) return;
    this.isTransitioning = true;
    this.currentIndex = index;
    this.position = -this.itemWidth * index;
    this.track.style.transition = 'transform 0.5s ease-out';
    this.track.style.transform = `translateX(${this.position}px)`;
    setTimeout(() => {
      this.track.style.transition = '';
      this.isTransitioning = false;
    }, 500);
    this.updateDots();
  }

  nextSlide() {
    this.goToSlide((this.currentIndex + 1) % this.items.length);
  }

  previousSlide() {
    this.goToSlide((this.currentIndex - 1 + this.items.length) % this.items.length);
  }

  togglePlayPause() {
    this.isPlaying = !this.isPlaying;
    if (this.playPauseBtn) this.playPauseBtn.classList.toggle('paused', !this.isPlaying);
    this.carousel.classList.toggle('paused', !this.isPlaying);
  }

  pauseOnHover() {
    if (this.isPlaying) {
      this.wasPlayingBeforeHover = true;
      this.isPlaying = false;
    }
  }

  resumeFromHover() {
    if (this.wasPlayingBeforeHover) {
      this.isPlaying = true;
      this.wasPlayingBeforeHover = false;
    }
  }

  updateDots() {
    if (!this.dots) return;
    this.dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === this.currentIndex);
    });
  }
}

// Initialiser le carrousel
document.addEventListener("DOMContentLoaded", () => new EnhancedCarousel());
