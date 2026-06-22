(function () {
  "use strict";

  var body = document.body;
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var portal = document.getElementById("accessPortal");
  var dashboard = document.getElementById("dashboardShell");
  var transition = document.getElementById("portalTransition");
  var progressBar = document.getElementById("progressBar");
  var progressLabel = document.getElementById("progressLabel");
  var portalState = document.getElementById("portalState");
  var scanFeed = document.getElementById("scanFeed");
  var accessGranted = document.getElementById("accessGranted");
  var enterPortal = document.getElementById("enterPortal");
  var portalReady = false;
  var hasEntered = false;

  body.classList.add("portal-active");

  var scanSteps = [
    "Scanning Network...",
    "Checking Infrastructure...",
    "Connecting Cloud Services...",
    "Verifying Identity...",
    "Loading Dashboard..."
  ];

  function appendScanLine(text) {
    if (!scanFeed) return;
    var line = document.createElement("span");
    line.textContent = text;
    scanFeed.appendChild(line);

    while (scanFeed.children.length > 5) {
      scanFeed.removeChild(scanFeed.firstElementChild);
    }
  }

  function revealAccessGranted() {
    portalReady = true;

    if (progressBar) progressBar.style.width = "100%";
    if (progressLabel) progressLabel.textContent = "100%";
    if (portalState) portalState.textContent = "ACCESS GRANTED";
    if (portal) portal.classList.add("is-complete");
    if (accessGranted) accessGranted.removeAttribute("hidden");

    try {
      if (enterPortal) enterPortal.focus({ preventScroll: true });
    } catch (error) {
      if (enterPortal) enterPortal.focus();
    }
  }

  function runAccessSequence() {
    if (!progressBar || !progressLabel || !portalState) {
      revealAccessGranted();
      return;
    }

    var progress = 0;
    var stepIndex = 0;
    var interval = window.setInterval(function () {
      progress += Math.floor(Math.random() * 8) + 4;
      if (progress > 100) progress = 100;

      progressBar.style.width = progress + "%";
      progressLabel.textContent = progress + "%";

      var nextStep = Math.min(scanSteps.length - 1, Math.floor(progress / 22));
      if (nextStep !== stepIndex || progress === 100) {
        stepIndex = nextStep;
        appendScanLine(scanSteps[stepIndex]);
      }

      if (progress >= 100) {
        window.clearInterval(interval);
        revealAccessGranted();
      }
    }, reducedMotion ? 40 : 220);
  }

  function enterDashboard() {
    if (hasEntered || !portal || !dashboard) return;
    hasEntered = true;

    if (!portalReady) revealAccessGranted();
    if (transition) transition.classList.add("is-active");

    window.setTimeout(function () {
      portal.setAttribute("hidden", "hidden");
      dashboard.removeAttribute("hidden");
      body.classList.remove("portal-active");
      window.scrollTo(0, 0);
      initializeDashboard();
    }, reducedMotion ? 80 : 680);

    window.setTimeout(function () {
      if (transition) transition.classList.remove("is-active");
    }, reducedMotion ? 120 : 1600);
  }

  if (enterPortal) {
    enterPortal.addEventListener("click", enterDashboard);
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Enter" && portalReady && !hasEntered && !dashboard.hidden) return;
    if (event.key === "Enter" && portalReady && !hasEntered) enterDashboard();
  });

  runAccessSequence();

  var canvas = document.getElementById("particleCanvas");
  if (canvas && !reducedMotion) {
    var ctx = canvas.getContext("2d");
    var width = 0;
    var height = 0;
    var particles = [];
    var rafId = null;

    function resizeCanvas() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      var total = Math.max(42, Math.min(96, Math.round((width * height) / 21000)));
      particles = Array.from({ length: total }, function (_, index) {
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.34,
          vy: (Math.random() - 0.5) * 0.34,
          r: Math.random() * 1.5 + 0.8,
          red: index % 4 === 0
        };
      });
    }

    function drawParticles() {
      ctx.clearRect(0, 0, width, height);

      particles.forEach(function (p) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.red ? "rgba(225, 29, 72, 0.62)" : "rgba(0, 217, 255, 0.62)";
        ctx.fill();
      });

      var maxDistance = Math.min(165, width / 5);
      for (var a = 0; a < particles.length; a += 1) {
        for (var b = a + 1; b < particles.length; b += 1) {
          var dx = particles[a].x - particles[b].x;
          var dy = particles[a].y - particles[b].y;
          var distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < maxDistance) {
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.strokeStyle = "rgba(230, 241, 255, " + ((1 - distance / maxDistance) * 0.16) + ")";
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      rafId = window.requestAnimationFrame(drawParticles);
    }

    resizeCanvas();
    drawParticles();

    var resizeTimer;
    window.addEventListener("resize", function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resizeCanvas, 180);
    });

    document.addEventListener("visibilitychange", function () {
      if (document.hidden && rafId) {
        window.cancelAnimationFrame(rafId);
      } else if (!document.hidden) {
        rafId = window.requestAnimationFrame(drawParticles);
      }
    });
  }

  var initialized = false;
  function initializeDashboard() {
    if (initialized) return;
    initialized = true;

    var profileImage = document.getElementById("profileImage");
    if (profileImage) {
      profileImage.addEventListener("error", function () {
        profileImage.setAttribute("hidden", "hidden");
      });
    }

    if (window.Typed) {
      new window.Typed("#typedRole", {
        strings: [
          "Computer Engineering Student",
          "Cloud Computing Enthusiast",
          "Network Engineer",
          "IoT Developer",
          "EVCONN Laboratory Assistant"
        ],
        typeSpeed: 48,
        backSpeed: 28,
        backDelay: 1400,
        smartBackspace: true,
        showCursor: true,
        cursorChar: "_",
        loop: true
      });
    }

    var navToggle = document.getElementById("navToggle");
    var navLinks = document.getElementById("navLinks");
    if (navToggle && navLinks) {
      navToggle.addEventListener("click", function () {
        var open = navLinks.classList.toggle("is-open");
        navToggle.setAttribute("aria-expanded", String(open));
      });

      navLinks.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
          navLinks.classList.remove("is-open");
          navToggle.setAttribute("aria-expanded", "false");
        });
      });
    }

    setupRevealAnimations();
    setupCounters();
  }

  function setupRevealAnimations() {
    var revealItems = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      revealItems.forEach(function (item) {
        item.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -40px 0px" });

    revealItems.forEach(function (item) {
      observer.observe(item);
    });
  }

  function setupCounters() {
    var counters = document.querySelectorAll("[data-count]");

    function animateCounter(el) {
      var target = parseInt(el.getAttribute("data-count"), 10) || 0;
      var startTime = null;
      var duration = 1000;

      function tick(time) {
        if (!startTime) startTime = time;
        var progress = Math.min((time - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = String(Math.round(target * eased));
        if (progress < 1) window.requestAnimationFrame(tick);
      }

      window.requestAnimationFrame(tick);
    }

    if (!("IntersectionObserver" in window)) {
      counters.forEach(animateCounter);
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });

    counters.forEach(function (counter) {
      observer.observe(counter);
    });
  }
})();
