/* Dr. Humaira's Laser & Advanced Aesthetics — shared behaviour */
(function () {
  "use strict";

  /* ---------- Sticky header shadow ---------- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("scrolled", window.scrollY > 10);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Mobile navigation ---------- */
  var navToggle = document.querySelector(".nav-toggle");
  var siteNav = document.querySelector(".site-nav");
  if (navToggle && siteNav) {
    var iconOpen = navToggle.querySelector(".icon-open");
    var iconClose = navToggle.querySelector(".icon-close");
    var setNav = function (open) {
      siteNav.classList.toggle("open", open);
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
      if (iconOpen && iconClose) {
        iconOpen.style.display = open ? "none" : "block";
        iconClose.style.display = open ? "block" : "none";
      }
    };
    navToggle.addEventListener("click", function () {
      setNav(!siteNav.classList.contains("open"));
    });
    siteNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () { setNav(false); });
    });
    window.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setNav(false);
    });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in-view"); });
  }

  /* ---------- Setmore booking modal ---------- */
  var modal = document.getElementById("booking-modal");
  if (modal) {
    var frameHost = modal.querySelector(".modal__frame");
    var lastFocus = null;
    var openModal = function () {
      lastFocus = document.activeElement;
      if (!frameHost.querySelector("iframe")) {
        var iframe = document.createElement("iframe");
        iframe.src = "https://aestheticsbyhumaira.setmore.com";
        iframe.title = "Book an appointment online";
        frameHost.appendChild(iframe);
      }
      modal.classList.add("open");
      document.body.style.overflow = "hidden";
      modal.querySelector(".modal__close").focus();
    };
    var closeModal = function () {
      modal.classList.remove("open");
      document.body.style.overflow = "";
      if (lastFocus) lastFocus.focus();
    };
    document.querySelectorAll("[data-book]").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        openModal();
      });
    });
    modal.querySelector(".modal__close").addEventListener("click", closeModal);
    modal.addEventListener("click", function (e) {
      if (e.target === modal) closeModal();
    });
    window.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal.classList.contains("open")) closeModal();
    });
  }

  /* ---------- Reviews carousel ---------- */
  document.querySelectorAll(".reviews-carousel").forEach(function (carousel) {
    var track = carousel.querySelector(".reviews-carousel__track");
    var slides = Array.prototype.slice.call(track.children);
    var dotsHost = carousel.querySelector(".reviews-carousel__dots");
    if (!slides.length || !dotsHost) return;
    var idx = 0;
    var timer = null;
    var setActive = function (i) {
      idx = (i + slides.length) % slides.length;
      track.style.transform = "translateX(-" + idx * 100 + "%)";
      Array.prototype.forEach.call(dotsHost.children, function (dot, j) {
        dot.classList.toggle("active", j === idx);
      });
    };
    var restart = function () {
      if (timer) clearInterval(timer);
      timer = setInterval(function () { setActive(idx + 1); }, 4500);
    };
    slides.forEach(function (_, i) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("aria-label", "Go to review " + (i + 1));
      dot.addEventListener("click", function () { setActive(i); restart(); });
      dotsHost.appendChild(dot);
    });
    setActive(0);
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      restart();
      carousel.addEventListener("mouseenter", function () { clearInterval(timer); });
      carousel.addEventListener("mouseleave", restart);
    }
  });

  /* ---------- Treatments: search filter + category chips ---------- */
  var searchInput = document.getElementById("treatment-search");
  var sections = document.querySelectorAll(".treat-section");
  if (searchInput && sections.length) {
    var noResults = document.getElementById("no-results");
    searchInput.addEventListener("input", function () {
      var q = searchInput.value.trim().toLowerCase();
      var anyVisible = false;
      sections.forEach(function (section) {
        var visibleInSection = 0;
        section.querySelectorAll(".menu-item, .card").forEach(function (item) {
          var match = !q || item.textContent.toLowerCase().indexOf(q) !== -1;
          item.style.display = match ? "" : "none";
          if (match) visibleInSection++;
        });
        section.style.display = visibleInSection ? "" : "none";
        if (visibleInSection) anyVisible = true;
      });
      if (noResults) noResults.style.display = anyVisible ? "none" : "block";
    });
  }

  var chipNav = document.querySelector(".treat-nav");
  var chips = chipNav ? chipNav.querySelectorAll(".chip") : [];
  if (chips.length && sections.length) {
    var chipStrip = chipNav.querySelector(".treat-nav__inner");
    var suppressSpyUntil = 0;
    // Edge fades + chevron: show while there is more strip to scroll to
    var updateHints = function () {
      chipNav.classList.toggle("can-left", chipStrip.scrollLeft > 4);
      chipNav.classList.toggle(
        "can-right",
        chipStrip.scrollLeft + chipStrip.clientWidth < chipStrip.scrollWidth - 4
      );
    };
    chipStrip.addEventListener("scroll", updateHints, { passive: true });
    window.addEventListener("resize", updateHints);
    updateHints();
    // Highlight a chip and slide the chip strip horizontally (never the page)
    var setChip = function (id) {
      chips.forEach(function (chip) {
        var active = chip.getAttribute("href") === "#" + id;
        chip.classList.toggle("active", active);
        if (active && chipStrip) {
          var target = chip.offsetLeft - chipStrip.clientWidth / 2 + chip.offsetWidth / 2;
          chipStrip.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
        }
      });
    };
    // Clicking a chip: highlight immediately and pause the scrollspy while
    // the smooth scroll is in flight so it doesn't flicker through sections.
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        suppressSpyUntil = Date.now() + 900;
        setChip(chip.getAttribute("href").slice(1));
      });
    });
    if ("IntersectionObserver" in window) {
      var spy = new IntersectionObserver(
        function (entries) {
          if (Date.now() < suppressSpyUntil) return;
          entries.forEach(function (entry) {
            if (entry.isIntersecting) setChip(entry.target.id);
          });
        },
        { rootMargin: "-30% 0px -60% 0px" }
      );
      sections.forEach(function (section) {
        if (section.id) spy.observe(section);
      });
    }
  }
})();
