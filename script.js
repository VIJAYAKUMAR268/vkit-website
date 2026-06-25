/* =====================================================================
   VK Institute of Technology — script.js
   Handles: Loader, Navbar, Hamburger, Smooth Scroll, Counters,
            Reveal Animations, Course Filters, FAQ, Testimonial Slider,
            Form Validation, Scroll-to-Top
   ===================================================================== */

"use strict";

/* ─── Utility ──────────────────────────────────────────────────────── */
const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

/* ─── 1. Loader ─────────────────────────────────────────────────────── */
window.addEventListener("load", () => {
  const loader = $("#loader");
  setTimeout(() => {
    loader.classList.add("hidden");
    document.body.style.overflow = "";
  }, 2000); // Let the fill animation complete
});

// Prevent scroll during load
document.body.style.overflow = "hidden";

/* ─── 2. Navbar Scroll Behaviour ────────────────────────────────────── */
const navbar = $("#navbar");
const navLinks = $$(".nav-link");
const sections = $$("section[id]");

function updateNavbar() {
  const scrolled = window.scrollY > 40;
  navbar.classList.toggle("scrolled", scrolled);
}

function updateActiveLink() {
  let currentSection = "";
  sections.forEach((section) => {
    const sectionTop = section.offsetTop - 100;
    if (window.scrollY >= sectionTop) {
      currentSection = section.getAttribute("id");
    }
  });

  navLinks.forEach((link) => {
    link.classList.toggle(
      "active",
      link.getAttribute("href") === `#${currentSection}`
    );
  });
}

window.addEventListener("scroll", () => {
  updateNavbar();
  updateActiveLink();
  updateScrollTopBtn();
});

updateNavbar(); // Run on page load

/* ─── 3. Hamburger Menu ─────────────────────────────────────────────── */
const hamburger = $("#hamburger");
const navLinksContainer = $("#navLinks");

hamburger.addEventListener("click", () => {
  const isOpen = navLinksContainer.classList.toggle("open");
  hamburger.classList.toggle("open", isOpen);
  hamburger.setAttribute("aria-expanded", isOpen);
});

// Close menu when a nav link is clicked
$$(".nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    navLinksContainer.classList.remove("open");
    hamburger.classList.remove("open");
    hamburger.setAttribute("aria-expanded", false);
  });
});

// Close menu on outside click
document.addEventListener("click", (e) => {
  if (!navbar.contains(e.target)) {
    navLinksContainer.classList.remove("open");
    hamburger.classList.remove("open");
  }
});

/* ─── 4. Smooth Scroll ──────────────────────────────────────────────── */
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) {
    const navHeight = navbar.offsetHeight;
    const top = el.getBoundingClientRect().top + window.scrollY - navHeight;
    window.scrollTo({ top, behavior: "smooth" });
  }
}

// Delegated smooth scroll for all anchor links
document.addEventListener("click", (e) => {
  const link = e.target.closest("a[href^='#']");
  if (!link) return;
  const id = link.getAttribute("href").slice(1);
  const target = document.getElementById(id);
  if (!target) return;
  e.preventDefault();
  scrollToSection(id);
});

/* ─── 5. Reveal on Scroll (Intersection Observer) ───────────────────── */
// Add .reveal class to all major children of sections
const revealCandidates = [
  ".stat-card", ".course-card", ".faculty-card", ".campus-card",
  ".placement-stat-card", ".recruiter-logo", ".news-card", ".testimonial-card",
  ".timeline-item", ".vm-card", ".contact-detail", ".faq-item",
  ".about-lead", ".about-text p", ".section-header"
];

revealCandidates.forEach((selector) => {
  $$(selector).forEach((el) => el.classList.add("reveal"));
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
);

$$(".reveal").forEach((el) => revealObserver.observe(el));

/* ─── 6. Animated Counters ──────────────────────────────────────────── */
function animateCounter(el, target, duration = 2000) {
  let start = 0;
  const step = target / (duration / 16);
  const timer = setInterval(() => {
    start += step;
    if (start >= target) {
      el.textContent = target.toLocaleString();
      clearInterval(timer);
    } else {
      el.textContent = Math.floor(start).toLocaleString();
    }
  }, 16);
}

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const card = entry.target;
        const counterEl = $(".counter", card);
        const target = parseInt(card.dataset.count, 10);
        if (counterEl && target) {
          animateCounter(counterEl, target);
        }
        counterObserver.unobserve(card);
      }
    });
  },
  { threshold: 0.5 }
);

$$("[data-count]").forEach((card) => counterObserver.observe(card));

/* ─── 7. Course Filter ──────────────────────────────────────────────── */
const filterBtns = $$(".filter-btn");
const courseCards = $$(".course-card");

filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    const filter = btn.dataset.filter;
    courseCards.forEach((card) => {
      const show = filter === "all" || card.dataset.category === filter;
      card.style.display = show ? "" : "none";
      // Re-trigger reveal for visible cards
      if (show) {
        card.classList.remove("visible");
        setTimeout(() => card.classList.add("visible"), 50);
      }
    });
  });
});

/* ─── 8. FAQ Accordion ──────────────────────────────────────────────── */
$$(".faq-question").forEach((btn) => {
  btn.addEventListener("click", () => {
    const item = btn.closest(".faq-item");
    const answer = $(".faq-answer", item);
    const isOpen = btn.classList.contains("open");

    // Close all
    $$(".faq-question.open").forEach((q) => {
      q.classList.remove("open");
      $(".faq-answer", q.closest(".faq-item")).classList.remove("open");
    });

    // Open clicked (if it was closed)
    if (!isOpen) {
      btn.classList.add("open");
      answer.classList.add("open");
    }
  });
});

/* ─── 9. Testimonial Slider ─────────────────────────────────────────── */
const track = $("#testimonialTrack");
const dots = $$(".dot");
let currentSlide = 0;
let autoSlideTimer;

function goToSlide(index) {
  currentSlide = index;
  track.style.transform = `translateX(-${index * 100}%)`;
  dots.forEach((dot, i) => dot.classList.toggle("active", i === index));
}

function nextSlide() {
  const next = (currentSlide + 1) % dots.length;
  goToSlide(next);
}

function startAutoSlide() {
  autoSlideTimer = setInterval(nextSlide, 5000);
}

function stopAutoSlide() {
  clearInterval(autoSlideTimer);
}

dots.forEach((dot) => {
  dot.addEventListener("click", () => {
    stopAutoSlide();
    goToSlide(parseInt(dot.dataset.index, 10));
    startAutoSlide();
  });
});

// Touch/swipe support for slider
let touchStartX = 0;
track.addEventListener("touchstart", (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
track.addEventListener("touchend", (e) => {
  const diff = touchStartX - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 50) {
    stopAutoSlide();
    goToSlide(diff > 0
      ? (currentSlide + 1) % dots.length
      : (currentSlide - 1 + dots.length) % dots.length
    );
    startAutoSlide();
  }
});

startAutoSlide();

/* ─── 10. Application Form Validation ──────────────────────────────── */
const applyForm = $("#applyForm");

function showError(fieldId, message) {
  const field = document.getElementById(fieldId);
  const errorEl = document.getElementById(`${fieldId}Error`);
  if (field) field.classList.add("error");
  if (errorEl) errorEl.textContent = message;
}

function clearError(fieldId) {
  const field = document.getElementById(fieldId);
  const errorEl = document.getElementById(`${fieldId}Error`);
  if (field) field.classList.remove("error");
  if (errorEl) errorEl.textContent = "";
}

function validateApplyForm() {
  let valid = true;

  const firstName = $("#firstName").value.trim();
  const lastName  = $("#lastName").value.trim();
  const email     = $("#email").value.trim();
  const phone     = $("#phone").value.trim();
  const programme = $("#programme").value;
  const marks     = parseFloat($("#marks").value);

  // First Name
  if (!firstName) { showError("firstName", "First name is required."); valid = false; }
  else if (firstName.length < 2) { showError("firstName", "Must be at least 2 characters."); valid = false; }
  else clearError("firstName");

  // Last Name
  if (!lastName) { showError("lastName", "Last name is required."); valid = false; }
  else clearError("lastName");

  // Email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) { showError("email", "Email is required."); valid = false; }
  else if (!emailRegex.test(email)) { showError("email", "Enter a valid email address."); valid = false; }
  else clearError("email");

  // Phone
  const phoneRegex = /^[6-9]\d{9}$/;
  const cleanPhone = phone.replace(/\s/g, "");
  if (!phone) { showError("phone", "Mobile number is required."); valid = false; }
  else if (!phoneRegex.test(cleanPhone)) { showError("phone", "Enter a valid 10-digit Indian mobile number."); valid = false; }
  else clearError("phone");

  // Programme
  if (!programme) { showError("programme", "Please select a programme."); valid = false; }
  else clearError("programme");

  // Marks
  if (isNaN(marks) || marks === "") { showError("marks", "Percentage is required."); valid = false; }
  else if (marks < 0 || marks > 100) { showError("marks", "Enter a percentage between 0 and 100."); valid = false; }
  else clearError("marks");

  return valid;
}

if (applyForm) {
  applyForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (validateApplyForm()) {
      const btn = applyForm.querySelector("button[type='submit']");
      btn.textContent = "Submitting…";
      btn.disabled = true;
      setTimeout(() => {
        $("#formSuccess").classList.remove("hidden");
        applyForm.reset();
        btn.textContent = "Submit Application";
        btn.disabled = false;
        ["firstName", "lastName", "email", "phone", "programme", "marks"].forEach(clearError);
      }, 1200);
    }
  });

  // Inline validation on blur
  $$("input, select, textarea", applyForm).forEach((field) => {
    field.addEventListener("blur", () => validateApplyForm());
    field.addEventListener("input", () => {
      field.classList.remove("error");
      const errEl = document.getElementById(`${field.id}Error`);
      if (errEl) errEl.textContent = "";
    });
  });
}

/* ─── 11. Contact Form Validation ───────────────────────────────────── */
const contactForm = $("#contactForm");

function validateContactForm() {
  let valid = true;

  const name    = $("#cName").value.trim();
  const email   = $("#cEmail").value.trim();
  const subject = $("#cSubject").value.trim();
  const message = $("#cMessage").value.trim();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!name)    { showError("cName", "Name is required."); valid = false; } else clearError("cName");
  if (!email || !emailRegex.test(email)) { showError("cEmail", "Valid email is required."); valid = false; } else clearError("cEmail");
  if (!subject) { showError("cSubject", "Subject is required."); valid = false; } else clearError("cSubject");
  if (!message || message.length < 10) { showError("cMessage", "Please write at least 10 characters."); valid = false; } else clearError("cMessage");

  return valid;
}

if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (validateContactForm()) {
      const btn = contactForm.querySelector("button[type='submit']");
      btn.textContent = "Sending…";
      btn.disabled = true;
      setTimeout(() => {
        $("#contactSuccess").classList.remove("hidden");
        contactForm.reset();
        btn.textContent = "Send Message";
        btn.disabled = false;
      }, 1200);
    }
  });

  $$("input, textarea", contactForm).forEach((field) => {
    field.addEventListener("input", () => {
      field.classList.remove("error");
      const errEl = document.getElementById(`${field.id}Error`);
      if (errEl) errEl.textContent = "";
    });
  });
}

/* ─── 12. Scroll-to-Top Button ──────────────────────────────────────── */
const scrollTopBtn = $("#scrollTop");

function updateScrollTopBtn() {
  scrollTopBtn.classList.toggle("visible", window.scrollY > 400);
}

scrollTopBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

/* ─── 13. Staggered card animations ─────────────────────────────────── */
// Stagger delays for grid children
function applyStaggerDelays(containerSelector, childSelector, delayStep = 80) {
  $$(containerSelector).forEach((container) => {
    $$(childSelector, container).forEach((child, i) => {
      child.style.transitionDelay = `${i * delayStep}ms`;
    });
  });
}

applyStaggerDelays(".courses-grid",   ".course-card");
applyStaggerDelays(".faculty-grid",   ".faculty-card");
applyStaggerDelays(".recruiters-grid",".recruiter-logo", 40);
applyStaggerDelays(".news-grid",      ".news-card");
applyStaggerDelays(".about-stats-grid", ".stat-card", 100);

/* ─── 14. Keyboard accessibility for FAQ ────────────────────────────── */
$$(".faq-question").forEach((btn) => {
  btn.setAttribute("role", "button");
  btn.setAttribute("aria-expanded", "false");
  btn.addEventListener("click", function () {
    const expanded = this.classList.contains("open");
    this.setAttribute("aria-expanded", String(expanded));
  });
});

/* ─── Init ──────────────────────────────────────────────────────────── */
// Ensure navbar is correct on initial load
document.addEventListener("DOMContentLoaded", () => {
  updateNavbar();
  updateActiveLink();
  updateScrollTopBtn();
});
