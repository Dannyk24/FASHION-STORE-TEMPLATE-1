/* =========================================================
   ASHE — Site Scripts (vanilla JS only)
========================================================= */
(function () {
  "use strict";

  /* ---------- Lucide icons ---------- */
  function initIcons() {
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons({
        attrs: { "stroke-width": 1.75 },
      });
    }
  }
  initIcons();
  // In case the CDN script finishes loading after this file executes.
  window.addEventListener("load", initIcons);

  /* ---------- WhatsApp config ---------- */
  const WHATSAPP_NUMBER = "2349013151297"; // swap for the client's real number

  /* ---------- Mobile menu ---------- */
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const mobileMenu = document.getElementById("mobileMenu");

  function closeMobileMenu() {
    mobileMenu.classList.remove("is-open");
    mobileMenu.setAttribute("aria-hidden", "true");
    hamburgerBtn.setAttribute("aria-expanded", "false");
    hamburgerBtn.setAttribute("aria-label", "Open menu");
    document.body.style.overflow = "";
  }

  function openMobileMenu() {
    mobileMenu.classList.add("is-open");
    mobileMenu.setAttribute("aria-hidden", "false");
    hamburgerBtn.setAttribute("aria-expanded", "true");
    hamburgerBtn.setAttribute("aria-label", "Close menu");
    document.body.style.overflow = "hidden";
  }

  hamburgerBtn.addEventListener("click", function () {
    const isOpen = mobileMenu.classList.contains("is-open");
    if (isOpen) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });

  mobileMenu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", closeMobileMenu);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && mobileMenu.classList.contains("is-open")) {
      closeMobileMenu();
      hamburgerBtn.focus();
    }
  });

  /* =========================================================
     Scroll-triggered animations (IntersectionObserver)
  ========================================================= */
  const animatedSelectors =
    ".fade-up, .fade-left, .fade-right, .scale-in, .stagger-card";
  const animatedEls = document.querySelectorAll(animatedSelectors);

  // Apply staggered delay per group (siblings within the same parent get
  // increasing delay so cards / features appear one after another).
  const delayCounters = new WeakMap();
  animatedEls.forEach(function (el) {
    const explicitDelay = el.getAttribute("data-delay");
    if (explicitDelay !== null) {
      el.style.setProperty("--d", explicitDelay);
      return;
    }
    const parent = el.parentElement;
    const count = delayCounters.get(parent) || 0;
    el.style.setProperty("--d", count);
    delayCounters.set(parent, count + 1);
  });

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target); // animate once only
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    );

    animatedEls.forEach(function (el) {
      // Hero entrance elements animate immediately on load, not on scroll.
      if (el.closest("#hero")) {
        requestAnimationFrame(function () {
          el.classList.add("is-visible");
        });
      } else {
        revealObserver.observe(el);
      }
    });
  } else {
    // Fallback: no IntersectionObserver support, just show everything.
    animatedEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* =========================================================
     Best sellers carousel
  ========================================================= */
  const track = document.getElementById("carouselTrack");
  const prevBtn = document.getElementById("carouselPrev");
  const nextBtn = document.getElementById("carouselNext");

  function getScrollStep() {
    const card = track.querySelector(".product-card");
    if (!card) return 300;
    const style = window.getComputedStyle(track);
    const gap = parseFloat(style.columnGap || style.gap || "24");
    return card.getBoundingClientRect().width + gap;
  }

  function updateCarouselButtons() {
    const maxScroll = track.scrollWidth - track.clientWidth - 4;
    prevBtn.disabled = track.scrollLeft <= 4;
    nextBtn.disabled = track.scrollLeft >= maxScroll;
    prevBtn.style.opacity = prevBtn.disabled ? "0.35" : "1";
    nextBtn.style.opacity = nextBtn.disabled ? "0.35" : "1";
  }

  if (track && prevBtn && nextBtn) {
    prevBtn.addEventListener("click", function () {
      track.scrollBy({ left: -getScrollStep(), behavior: "smooth" });
    });
    nextBtn.addEventListener("click", function () {
      track.scrollBy({ left: getScrollStep(), behavior: "smooth" });
    });
    track.addEventListener("scroll", updateCarouselButtons, { passive: true });
    window.addEventListener("resize", updateCarouselButtons);
    updateCarouselButtons();

    // Touch / drag support for non-touch pointers (mouse drag scrolling).
    let isDown = false;
    let startX = 0;
    let startScroll = 0;

    track.addEventListener("pointerdown", function (e) {
      isDown = true;
      startX = e.clientX;
      startScroll = track.scrollLeft;
      track.style.cursor = "grabbing";
    });
    window.addEventListener("pointerup", function () {
      isDown = false;
      track.style.cursor = "";
    });
    window.addEventListener("pointermove", function (e) {
      if (!isDown) return;
      const delta = startX - e.clientX;
      track.scrollLeft = startScroll + delta;
    });
  }

  /* =========================================================
     Testimonial slider (auto-rotating)
  ========================================================= */
  const testimonialTrack = document.getElementById("testimonialTrack");

  if (testimonialTrack) {
    const slides = Array.from(testimonialTrack.children);
    let activeIndex = 0;
    let autoTimer = null;

    function goToSlide(i) {
      activeIndex = (i + slides.length) % slides.length;

      testimonialTrack.style.transform = `translateX(-${activeIndex * 100}%)`;
    }

    function startAutoSlide() {
      autoTimer = setInterval(() => {
        goToSlide(activeIndex + 1);
      }, 3000);
    }

    function stopAutoSlide() {
      clearInterval(autoTimer);
    }

    startAutoSlide();

    const slider = testimonialTrack.closest(".testimonial-slider");

    if (slider) {
      slider.addEventListener("mouseenter", stopAutoSlide);
      slider.addEventListener("mouseleave", startAutoSlide);
    }
  }

  /* =========================================================
     WhatsApp product ordering
  ========================================================= */
  function buildWhatsappUrl(name, price) {
    const message =
      "Hello, I'm interested in the " +
      name +
      " priced at \u20A6" +
      price +
      ". Is it available?";
    return (
      "https://wa.me/" +
      WHATSAPP_NUMBER +
      "?text=" +
      encodeURIComponent(message)
    );
  }

  document.querySelectorAll(".order-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const card = btn.closest("[data-name]");
      if (!card) return;
      const name = card.getAttribute("data-name");
      const price = card.getAttribute("data-price");
      const url = buildWhatsappUrl(name, price);
      window.open(url, "_blank", "noopener");
    });
  });

  // Generic floating WhatsApp button — opens a general enquiry chat.
  const whatsappFloat = document.getElementById("whatsappFloat");
  if (whatsappFloat) {
    whatsappFloat.addEventListener("click", function (e) {
      e.preventDefault();
      const message = "Hello! I have a question about ASHE.";
      window.open(
        "https://wa.me/" +
          WHATSAPP_NUMBER +
          "?text=" +
          encodeURIComponent(message),
        "_blank",
        "noopener",
      );
    });
  }

  /* =========================================================
     Newsletter form (front-end only, no backend wired up)
  ========================================================= */
  const newsletterForm = document.getElementById("newsletterForm");
  const newsletterNote = document.getElementById("newsletterNote");

  if (newsletterForm) {
    newsletterForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const email = document.getElementById("newsletterEmail").value.trim();
      if (!email) return;
      newsletterNote.textContent =
        "You're on the list — welcome to ASHE, " + email;
      newsletterForm.reset();
    });
  }

  /* =========================================================
     Contact form (front-end only, no backend wired up)
  ========================================================= */
  const contactForm = document.getElementById("contactForm");
  const contactNote = document.getElementById("contactNote");

  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const name = document.getElementById("cfName").value.trim();
      contactNote.textContent =
        "Thanks" +
        (name ? ", " + name : "") +
        " — we'll reply within the hour.";
      contactForm.reset();
    });
  }
})();
