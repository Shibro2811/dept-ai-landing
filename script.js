document.addEventListener('DOMContentLoaded', () => {
  const header = document.getElementById('header');
  const videoContainer = document.getElementById('videoContainer');
  const videoPlay = document.getElementById('videoPlay');
  const video = document.getElementById('heroVideo');

  // Header scroll effect + scroll-spy for active nav link
  const navLinks = document.querySelectorAll('.header__link[href^="#"]');
  const sections = Array.from(navLinks)
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  const SCROLL_OFFSET = 160;

  const updateActiveLink = () => {
    const scrollPos = window.scrollY + SCROLL_OFFSET;

    let currentId = sections[0]?.id || '';
    sections.forEach((section) => {
      if (scrollPos >= section.offsetTop) {
        currentId = section.id;
      }
    });

    navLinks.forEach((link) => {
      const isActive = link.getAttribute('href') === `#${currentId}`;
      link.classList.toggle('header__link--active', isActive);
    });
  };

  const handleScroll = () => {
    const scrolled = window.scrollY > 20;
    header.classList.toggle('header--scrolled', scrolled);
    updateActiveLink();
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  updateActiveLink();

  // Video play/pause toggle
  videoContainer.addEventListener('click', () => {
    if (video.paused) {
      video.play();
      videoContainer.classList.add('playing');
    } else {
      video.pause();
      videoContainer.classList.remove('playing');
    }
  });

  video.addEventListener('ended', () => {
    videoContainer.classList.remove('playing');
  });

  // Chart draw-in animation using real path lengths
  const mainLine = document.querySelector('.chart-line--main');
  const predictLine = document.querySelector('.chart-line--predict');

  if (mainLine && predictLine) {
    const mainLen = mainLine.getTotalLength();
    const predictLen = predictLine.getTotalLength();

    // Set up main line
    mainLine.style.strokeDasharray = mainLen;
    mainLine.style.strokeDashoffset = mainLen;

    // Set up predict line
    predictLine.style.strokeDasharray = '12 10';
    predictLine.style.strokeDashoffset = predictLen;
    predictLine.style.opacity = '0';

    // Animate main line immediately
    requestAnimationFrame(() => {
      mainLine.style.transition = 'stroke-dashoffset 1s ease-out';
      mainLine.style.strokeDashoffset = '0';

      // Start predict line right as main finishes — slight overlap for fluidity
      setTimeout(() => {
        predictLine.style.transition = 'stroke-dashoffset 0.5s ease-out, opacity 0.3s ease-out';
        predictLine.style.strokeDashoffset = '0';
        predictLine.style.opacity = '1';

        // Start marching dashes after predict draws in
        setTimeout(() => {
          predictLine.style.transition = 'none';
          predictLine.style.animation = 'marchDash 1.5s linear infinite';
        }, 500);
      }, 850);
    });
  }

  // Model chart scroll-triggered animation
  const modelChart = document.querySelector('.model__chart');

  if (modelChart) {
    const MARCH_DELAY_MS = 2200;

    const modelObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            modelChart.classList.add('is-animated');

            // Start marching dashes after all draw-in animations finish
            setTimeout(() => {
              modelChart.classList.add('is-marching');
            }, MARCH_DELAY_MS);

            modelObserver.unobserve(modelChart);
          }
        });
      },
      { threshold: 0.3 }
    );

    modelObserver.observe(modelChart);
  }

  // Subtle parallax on dashboard card
  const dashboard = document.querySelector('.hero__dashboard-inner');

  if (dashboard && window.matchMedia('(pointer: fine)').matches) {
    dashboard.addEventListener('mousemove', (e) => {
      const rect = dashboard.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      dashboard.style.transform = `
        translateY(-4px)
        rotateY(${x * 3}deg)
        rotateX(${y * -3}deg)
      `;
    });

    dashboard.addEventListener('mouseleave', () => {
      dashboard.style.transform = 'translateY(0) rotateY(0) rotateX(0)';
    });
  }

  // Press carousel — seamless infinite auto-scroll with hover pause
  const pressCarousel = document.getElementById('pressCarousel');

  if (pressCarousel) {
    const SCROLL_SPEED_PX = 0.7;
    const GAP_PX = 28;

    // Clone all original cards to create seamless loop
    const originalCards = [...pressCarousel.children];
    originalCards.forEach((card) => {
      const clone = card.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      pressCarousel.appendChild(clone);
    });

    // Total width of one full set of original cards (cards + gaps)
    const singleSetWidth = originalCards.reduce((total, card) => {
      return total + card.offsetWidth + GAP_PX;
    }, 0);

    let animationId = null;

    const step = () => {
      pressCarousel.scrollLeft += SCROLL_SPEED_PX;

      // When we've scrolled past the original set, silently jump back
      if (pressCarousel.scrollLeft >= singleSetWidth) {
        pressCarousel.scrollLeft -= singleSetWidth;
      }

      animationId = requestAnimationFrame(step);
    };

    const startAutoScroll = () => {
      if (animationId) return;
      animationId = requestAnimationFrame(step);
    };

    const stopAutoScroll = () => {
      cancelAnimationFrame(animationId);
      animationId = null;
    };

    pressCarousel.addEventListener('mouseenter', stopAutoScroll);
    pressCarousel.addEventListener('mouseleave', startAutoScroll);

    startAutoScroll();
  }

  // Certs carousel — infinite auto-scroll on mobile
  const certsCarousel = document.getElementById('certsCarousel');
  const MOBILE_BREAKPOINT = 640;

  if (certsCarousel && window.innerWidth <= MOBILE_BREAKPOINT) {
    const CERTS_SCROLL_SPEED = 0.5;
    const CERTS_GAP = 16;

    const originalCertsCards = [...certsCarousel.children];
    // Clone cards twice for seamless looping
    for (let i = 0; i < 2; i++) {
      originalCertsCards.forEach((card) => {
        const clone = card.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        certsCarousel.appendChild(clone);
      });
    }

    const certsSingleSetWidth = originalCertsCards.reduce((total, card) => {
      return total + card.offsetWidth + CERTS_GAP;
    }, 0);

    let certsAnimId = null;

    const certsStep = () => {
      certsCarousel.scrollLeft += CERTS_SCROLL_SPEED;

      if (certsCarousel.scrollLeft >= certsSingleSetWidth) {
        certsCarousel.scrollLeft -= certsSingleSetWidth;
      }

      certsAnimId = requestAnimationFrame(certsStep);
    };

    const startCertsScroll = () => {
      if (certsAnimId) return;
      certsAnimId = requestAnimationFrame(certsStep);
    };

    const stopCertsScroll = () => {
      cancelAnimationFrame(certsAnimId);
      certsAnimId = null;
    };

    certsCarousel.addEventListener('touchstart', stopCertsScroll, { passive: true });
    certsCarousel.addEventListener('touchend', startCertsScroll);

    startCertsScroll();
  }

  // FAQ accordion with smooth animation
  const faqItems = document.querySelectorAll('.faq__item');

  const openItem = (item) => {
    const answer = item.querySelector('.faq__answer');
    item.classList.add('is-open');

    // Temporarily remove transition so we can measure full height
    answer.style.transition = 'none';
    answer.style.maxHeight = 'none';
    const fullHeight = answer.offsetHeight;

    // Reset to 0, restore transition, then animate to full height
    answer.style.maxHeight = '0';
    // Force reflow so the browser registers the 0 state
    void answer.offsetHeight;
    answer.style.transition = '';
    answer.style.maxHeight = fullHeight + 'px';
  };

  const closeItem = (item) => {
    const answer = item.querySelector('.faq__answer');
    // Lock current height, then collapse
    answer.style.maxHeight = answer.offsetHeight + 'px';
    void answer.offsetHeight;
    answer.style.maxHeight = '0';
    item.classList.remove('is-open');
  };

  // Initialize: set correct height for any pre-opened items
  faqItems.forEach((item) => {
    const answer = item.querySelector('.faq__answer');

    if (item.classList.contains('is-open')) {
      answer.style.maxHeight = 'none';
      const fullHeight = answer.offsetHeight;
      answer.style.maxHeight = fullHeight + 'px';
    }

    item.querySelector('.faq__question').addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      if (isOpen) {
        closeItem(item);
      } else {
        // Close all others first
        faqItems.forEach((other) => {
          if (other !== item && other.classList.contains('is-open')) {
            closeItem(other);
          }
        });
        openItem(item);
      }
    });
  });

  // Mobile menu
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileMenuBackdrop = document.getElementById('mobileMenuBackdrop');
  const mobileMenuClose = document.getElementById('mobileMenuClose');
  const headerBurger = document.getElementById('headerBurger');
  const mobileMenuLinks = document.querySelectorAll('.mobile-menu__link');
  const mobileMenuContact = document.getElementById('mobileMenuContact');

  let menuScrollY = 0;
  const MENU_SCROLL_THRESHOLD = 8;

  const openMobileMenu = () => {
    mobileMenu.classList.add('is-open');
    headerBurger.classList.add('is-open');
    headerBurger.setAttribute('aria-expanded', 'true');
    menuScrollY = window.scrollY;
  };

  const closeMobileMenu = () => {
    mobileMenu.classList.remove('is-open');
    headerBurger.classList.remove('is-open');
    headerBurger.setAttribute('aria-expanded', 'false');
  };

  // Close menu on scroll — let the user scroll freely
  const handleMenuScroll = () => {
    if (!mobileMenu.classList.contains('is-open')) return;
    const delta = Math.abs(window.scrollY - menuScrollY);
    if (delta > MENU_SCROLL_THRESHOLD) {
      closeMobileMenu();
    }
  };

  window.addEventListener('scroll', handleMenuScroll, { passive: true });

  if (headerBurger) {
    headerBurger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.contains('is-open');
      if (isOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });
  }

  if (mobileMenuBackdrop) {
    mobileMenuBackdrop.addEventListener('click', closeMobileMenu);
  }

  if (mobileMenuClose) {
    mobileMenuClose.addEventListener('click', closeMobileMenu);
  }

  // Close mobile menu on nav link click and smooth scroll
  mobileMenuLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      closeMobileMenu();
      // Let smooth scroll happen naturally after menu closes
    });
  });

  // Mobile menu contact button — handler set after modal is initialized (below)

  // Update mobile menu active link on scroll
  const updateMobileActiveLink = () => {
    const scrollPos = window.scrollY + SCROLL_OFFSET;
    let currentId = sections[0]?.id || '';
    sections.forEach((section) => {
      if (scrollPos >= section.offsetTop) {
        currentId = section.id;
      }
    });

    mobileMenuLinks.forEach((link) => {
      const href = link.getAttribute('href');
      const isActive = href === `#${currentId}`;
      link.classList.toggle('is-active', isActive);
    });
  };

  // Add mobile active link update to scroll handler
  const originalHandleScroll = handleScroll;
  window.removeEventListener('scroll', handleScroll);

  const enhancedHandleScroll = () => {
    const scrolled = window.scrollY > 20;
    header.classList.toggle('header--scrolled', scrolled);
    updateActiveLink();
    updateMobileActiveLink();
  };

  window.addEventListener('scroll', enhancedHandleScroll, { passive: true });
  updateMobileActiveLink();

  // Contact modal
  const modal = document.getElementById('contactModal');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const modalClose = document.getElementById('modalClose');
  const contactForm = document.getElementById('contactForm');
  const modalSuccess = document.getElementById('modalSuccess');

  const CONTACT_SELECTORS = [
    '.hero__button',
    '.dashboard__cta',
    '.team__btn--primary',
    '.cta__button',
    '.footer__contact-pill',
  ];

  const openModal = () => {
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';

    // Reset form after close animation
    setTimeout(() => {
      contactForm.reset();
      contactForm.style.display = '';
      document.querySelector('.modal__header').style.display = '';
      document.querySelector('.modal__channels').style.display = '';
      modalSuccess.classList.remove('is-visible');
    }, 350);
  };

  // Attach open handler to all contact buttons
  CONTACT_SELECTORS.forEach((selector) => {
    document.querySelectorAll(selector).forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal();
      });
    });
  });

  // Close handlers
  modalBackdrop.addEventListener('click', closeModal);
  modalClose.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      closeModal();
    }
  });

  // Form submit — show success state
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Hide form, show success
    contactForm.style.display = 'none';
    document.querySelector('.modal__header').style.display = 'none';
    document.querySelector('.modal__channels').style.display = 'none';
    modalSuccess.classList.add('is-visible');

    // Auto-close after 2.5s
    setTimeout(closeModal, 2500);
  });

  // Wire up mobile menu contact button (now that openModal is defined)
  if (mobileMenuContact) {
    mobileMenuContact.addEventListener('click', (e) => {
      e.preventDefault();
      closeMobileMenu();
      setTimeout(() => {
        openModal();
      }, 350);
    });
  }

  // Close mobile menu on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu && mobileMenu.classList.contains('is-open')) {
      closeMobileMenu();
    }
  });
});
