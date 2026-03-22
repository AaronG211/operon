/* ═══════════════════════════════════════
   OPERON PITCH DECK — Interactive JS
   ═══════════════════════════════════════ */

let currentSlide = 0;
const totalSlides = 11;
let isTransitioning = false;
let touchStartX = 0;
let touchStartY = 0;

// ─── Initialize ───
document.addEventListener("DOMContentLoaded", () => {
  createParticles("particleField1", 25);
  createParticles("particleField10", 25);
  goToSlide(0, "none");
  setupKeyboard();
  setupTouch();
  setupMouseParallax();
});

// ─── Slide Navigation ───
function goToSlide(index, direction = "next") {
  if (index < 0 || index >= totalSlides || isTransitioning) return;

  isTransitioning = true;
  const slides = document.querySelectorAll(".slide");
  const oldSlide = slides[currentSlide];
  const newSlide = slides[index];

  // Reset all slides
  slides.forEach((s) => {
    s.classList.remove("active", "exit-left", "exit-right");
    // Reset animation items
    s.querySelectorAll(".anim-item").forEach((item) => {
      item.style.transitionDelay = "0s";
    });
    // Reset chat messages
    s.querySelectorAll(".chat-msg").forEach((msg) => {
      msg.classList.remove("visible");
    });
  });

  // Animate old slide out
  if (direction === "next") {
    oldSlide.classList.add("exit-left");
  } else if (direction === "prev") {
    oldSlide.classList.add("exit-right");
  }

  // Animate new slide in
  newSlide.classList.add("active");

  // Staggered content animation
  const animItems = newSlide.querySelectorAll(".anim-item");
  animItems.forEach((item) => {
    const delay = parseFloat(item.dataset.delay || 0);
    item.style.transitionDelay = `${delay}s`;
  });

  currentSlide = index;
  updateUI();

  // Trigger slide-specific animations
  setTimeout(() => {
    triggerSlideAnimations(index);
    isTransitioning = false;
  }, 300);
}

function nextSlide() {
  if (currentSlide < totalSlides - 1) {
    goToSlide(currentSlide + 1, "next");
  }
}

function prevSlide() {
  if (currentSlide > 0) {
    goToSlide(currentSlide - 1, "prev");
  }
}

// ─── Update UI ───
function updateUI() {
  // Progress bar
  const progress = ((currentSlide + 1) / totalSlides) * 100;
  document.getElementById("progressBar").style.width = `${progress}%`;

  // Slide counter
  document.getElementById("slideCounter").textContent = `${currentSlide + 1} / ${totalSlides}`;

  // Nav buttons
  document.getElementById("prevBtn").style.opacity = currentSlide === 0 ? 0.3 : 1;
  document.getElementById("nextBtn").style.opacity = currentSlide === totalSlides - 1 ? 0.3 : 1;
}

// ─── Slide-Specific Animations ───
function triggerSlideAnimations(index) {
  switch (index) {
    case 5: // KPI slide — animate counters + health ring
      animateCounters();
      animateHealthRing();
      break;
    case 8: // Chat slide — animate messages
      animateChatMessages();
      break;
    case 9: // Market slide — animate bars + counters
      animateMarketBars();
      animateMarketCounters();
      break;
  }
}

// ─── Counter Animation ───
function animateCounters() {
  const counters = document.querySelectorAll(".slide.active .kpi-value[data-count]");
  counters.forEach((counter) => {
    const target = parseFloat(counter.dataset.count);
    const prefix = counter.dataset.prefix || "";
    const suffix = counter.dataset.suffix || "";
    const decimals = parseInt(counter.dataset.decimals || 0);
    const duration = 1500;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out expo
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = target * eased;

      if (decimals > 0) {
        counter.textContent = `${prefix}${current.toFixed(decimals)}${suffix}`;
      } else {
        counter.textContent = `${prefix}${Math.round(current).toLocaleString()}${suffix}`;
      }

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }
    requestAnimationFrame(update);
  });
}

// ─── Health Ring Animation ───
function animateHealthRing() {
  const ring = document.querySelector(".health-progress");
  if (!ring) return;
  const circumference = 326.7;
  const score = 74;
  const offset = circumference - (score / 100) * circumference;
  setTimeout(() => {
    ring.style.strokeDashoffset = offset;
  }, 400);
}

// ─── Chat Messages Animation ───
function animateChatMessages() {
  const messages = document.querySelectorAll(".slide.active .chat-msg");
  messages.forEach((msg) => {
    const delay = parseFloat(msg.dataset.chatDelay || 0) * 1000;
    setTimeout(() => {
      msg.classList.add("visible");
    }, delay);
  });
}

// ─── Market Bar Animation ───
function animateMarketBars() {
  const bars = document.querySelectorAll(".slide.active .bar-fill");
  bars.forEach((bar) => {
    const width = bar.dataset.width || 0;
    setTimeout(() => {
      bar.style.width = `${width}%`;
    }, 600);
  });
}

// ─── Market Counter Animation ───
function animateMarketCounters() {
  const counters = document.querySelectorAll(".slide.active .market-number[data-count]");
  counters.forEach((counter) => {
    const target = parseFloat(counter.dataset.count);
    const prefix = counter.dataset.prefix || "";
    const suffix = counter.dataset.suffix || "";
    const duration = 2000;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = target * eased;
      counter.textContent = `${prefix}${Math.round(current).toLocaleString()}${suffix}`;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  });
}

// ─── Keyboard Controls ───
function setupKeyboard() {
  document.addEventListener("keydown", (e) => {
    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
      case " ":
      case "Enter":
        e.preventDefault();
        nextSlide();
        break;
      case "ArrowLeft":
      case "ArrowUp":
        e.preventDefault();
        prevSlide();
        break;
      case "Home":
        e.preventDefault();
        goToSlide(0, "prev");
        break;
      case "End":
        e.preventDefault();
        goToSlide(totalSlides - 1, "next");
        break;
    }

    // Number keys 1-9 for direct slide access, 0 for slide 10
    const num = parseInt(e.key);
    if (!isNaN(num)) {
      const target = num === 0 ? 9 : num - 1;
      if (target < totalSlides) {
        goToSlide(target, target > currentSlide ? "next" : "prev");
      }
    }
  });
}

// ─── Touch / Swipe ───
function setupTouch() {
  const wrapper = document.getElementById("slidesWrapper");

  wrapper.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  wrapper.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;

    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      if (dx < 0) nextSlide();
      else prevSlide();
    }
  }, { passive: true });

  // Click to advance (on non-interactive elements)
  wrapper.addEventListener("click", (e) => {
    if (e.target.closest("button, a, .nav-btn, .deck-nav")) return;
    const x = e.clientX / window.innerWidth;
    if (x > 0.65) nextSlide();
    else if (x < 0.35) prevSlide();
  });
}

// ─── Mouse Parallax (3D tilt on cards) ───
function setupMouseParallax() {
  document.addEventListener("mousemove", (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;

    // Parallax on background orbs
    const orbs = document.querySelectorAll(".slide.active .bg-orb");
    orbs.forEach((orb, i) => {
      const speed = (i + 1) * 8;
      orb.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
    });

    // Subtle 3D tilt on cards
    const cards = document.querySelectorAll(".slide.active .card-3d");
    cards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      const cardX = (e.clientX - rect.left) / rect.width - 0.5;
      const cardY = (e.clientY - rect.top) / rect.height - 0.5;

      if (
        cardX > -1 && cardX < 1 &&
        cardY > -1 && cardY < 1
      ) {
        const inner = card.querySelector(".card-inner");
        if (inner) {
          inner.style.transform = `
            perspective(800px)
            rotateX(${-cardY * 6}deg)
            rotateY(${cardX * 6}deg)
            translateZ(4px)
          `;
        }
      }
    });
  });

  // Reset card transforms on mouse leave
  document.addEventListener("mouseleave", () => {
    document.querySelectorAll(".card-inner").forEach((inner) => {
      inner.style.transform = "";
    });
  });
}

// ─── Particles ───
function createParticles(containerId, count) {
  const container = document.getElementById(containerId);
  if (!container) return;

  for (let i = 0; i < count; i++) {
    const particle = document.createElement("div");
    particle.className = "particle";
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = `${Math.random() * 100}%`;
    particle.style.animationDelay = `${Math.random() * 8}s`;
    particle.style.animationDuration = `${6 + Math.random() * 6}s`;

    const size = 1 + Math.random() * 3;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;

    const colors = ["#10b981", "#14b8a6", "#34d399", "#a78bfa", "#38bdf8"];
    particle.style.background = colors[Math.floor(Math.random() * colors.length)];

    container.appendChild(particle);
  }
}

// ─── Expose to global ───
window.nextSlide = nextSlide;
window.prevSlide = prevSlide;
