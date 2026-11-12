/* Prior Remedy — motion system
   GSAP + ScrollTrigger + Lenis smooth scroll */

const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

gsap.registerPlugin(ScrollTrigger);

/* ---------- Lenis smooth scroll ---------- */
let lenis = null;
if (!prefersReduced) {
  lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });

  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // anchor links through lenis
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const target = document.querySelector(a.getAttribute("href"));
      if (target) {
        e.preventDefault();
        lenis.scrollTo(target, { offset: 0 });
      }
    });
  });
}

/* ---------- Split headline into words ---------- */
function splitWords(el) {
  const text = el.textContent.trim();
  el.setAttribute("aria-label", text);
  el.textContent = "";
  text.split(/\s+/).forEach((word, i, arr) => {
    const span = document.createElement("span");
    span.className = "word";
    span.textContent = word;
    span.setAttribute("aria-hidden", "true");
    el.appendChild(span);
    if (i < arr.length - 1) el.appendChild(document.createTextNode(" "));
  });
  return el.querySelectorAll(".word");
}

const heroWords = splitWords(document.querySelector(".headline"));
const sectionWords = splitWords(document.querySelector(".panel .section-title"));
const founderWords = splitWords(document.querySelector(".founders .section-title"));

/* ---------- Intro timeline ---------- */
if (prefersReduced) {
  gsap.set(".nav, .headline, .subtext, .figure, .baseline", { clearProps: "all" });
  gsap.set('[data-wave="1"] circle', { fill: "#5b3002", stroke: "#5b3002" });
  gsap.set('[data-wave="2"] circle', { fill: "#b56110", stroke: "#b56110" });
} else {
  const intro = gsap.timeline({ defaults: { ease: "power3.out" } });

  intro
    .from(".nav", { y: -24, autoAlpha: 0, duration: 0.8 })
    .from(heroWords, {
      y: 34,
      autoAlpha: 0,
      duration: 0.9,
      stagger: 0.045,
    }, "-=0.4")
    .from(".subtext", { y: 20, autoAlpha: 0, duration: 0.8 }, "-=0.5")
    .from(".figure", {
      y: 60,
      autoAlpha: 0,
      duration: 1.0,
      stagger: 0.12,
    }, "-=1.1")
    .from(".baseline", {
      scaleX: 0,
      autoAlpha: 0,
      duration: 0.9,
      ease: "power2.inOut",
    }, "-=0.5");

  /* ---------- emitting rings ----------
     rings continuously spawn at the center and expand outward,
     fading as they travel — like ripples behind the mascots */
  const RING_CYCLE = 4.2;
  const emit = (el, delay) => {
    gsap.set(el, { transformOrigin: "50% 50%" });
    gsap.fromTo(el,
      { scale: 0.15, opacity: 0 },
      {
        keyframes: [
          { opacity: 1, duration: RING_CYCLE * 0.25 },
          { scale: 1.6, opacity: 0, duration: RING_CYCLE, ease: "power1.out" },
        ],
        delay,
        repeat: -1,
        repeatDelay: 0,
      });
  };

  emit(".ellipse-sm", 1.6);
  emit(".ellipse-md", 1.6 + RING_CYCLE / 3);
  emit(".ellipse-lg", 1.6 + (RING_CYCLE / 3) * 2);

  /* ---------- Scroll choreography ---------- */

  // gentle parallax: glows drift, figures rise at different rates
  gsap.to(".ellipse-lg", {
    yPercent: 12,
    ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
  });
  gsap.to(".hero-copy", {
    yPercent: -18,
    autoAlpha: 0.25,
    ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "70% top", scrub: true },
  });
  // the whole mascot group (figures + floor line) drifts as one unit,
  // so the curvy line always stays beneath them like a floor
  gsap.to(".figures", {
    y: -45,
    ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
  });

  // next-section reveals
  gsap.from("[data-panel]", {
    y: 80,
    autoAlpha: 0,
    duration: 1.0,
    ease: "power3.out",
    scrollTrigger: { trigger: ".section", start: "top 85%" },
  });
  if (sectionWords.length) {
    gsap.from(sectionWords, {
      y: 28,
      autoAlpha: 0,
      duration: 0.8,
      stagger: 0.05,
      ease: "power3.out",
      scrollTrigger: { trigger: ".panel", start: "top 70%" },
    });
  }
  gsap.from("[data-reveal]", {
    y: 18,
    autoAlpha: 0,
    duration: 0.7,
    stagger: 0.12,
    ease: "power3.out",
    scrollTrigger: { trigger: ".panel", start: "top 72%" },
  });
  gsap.from("[data-step]", {
    y: 44,
    autoAlpha: 0,
    duration: 0.8,
    stagger: 0.12,
    ease: "power3.out",
    scrollTrigger: { trigger: ".pillars", start: "top 82%" },
  });

  /* ---------- healing ripple ----------
     pinned, scrubbed: you heal → ring reaches family →
     ring reaches everyone around them */
  const healTl = gsap.timeline({
    scrollTrigger: {
      trigger: ".heal",
      start: "top top",
      end: "+=180%",
      scrub: 1,
      pin: true,
      anticipatePin: 1,
    },
  });

  healTl
    // you ignite
    .from(".heal-dot.you", {
      scale: 0, autoAlpha: 0, duration: 0.6, ease: "back.out(2)",
    })
    .from(".you-label", { autoAlpha: 0, y: 8, duration: 0.4 }, "<0.2")
    .from('[data-heal-line="1"]', { autoAlpha: 0, y: 24, duration: 0.5 }, "<")

    // first ring reaches your family
    .from('[data-ring="1"]', {
      scale: 0, autoAlpha: 0, duration: 1.2, ease: "power1.out",
    })
    .to('[data-wave="1"] circle', {
      fill: "#5b3002", stroke: "#5b3002",
      duration: 0.5, stagger: 0.12, ease: "power2.out",
    }, "-=0.35")
    .from('[data-wave-label="1"]', { autoAlpha: 0, duration: 0.4 }, "<")
    .from('[data-heal-line="2"]', { autoAlpha: 0, y: 24, duration: 0.5 }, "<0.1")

    // second ring reaches everyone around them
    .from('[data-ring="2"]', {
      scale: 0.55, autoAlpha: 0, duration: 1.2, ease: "power1.out",
    }, "+=0.15")
    .to('[data-wave="2"] circle', {
      fill: "#b56110", stroke: "#b56110",
      duration: 0.5, stagger: 0.1, ease: "power2.out",
    }, "-=0.4")
    .from('[data-wave-label="2"]', { autoAlpha: 0, duration: 0.4 }, "<")
    .from('[data-heal-line="3"]', {
      autoAlpha: 0, y: 24, scale: 0.96, duration: 0.6, ease: "power2.out",
    }, "<0.1");

  /* ---------- founders ---------- */
  if (founderWords.length) {
    gsap.from(founderWords, {
      y: 26, autoAlpha: 0, duration: 0.8, stagger: 0.05, ease: "power3.out",
      scrollTrigger: { trigger: ".founders", start: "top 75%" },
    });
  }
  gsap.from("[data-founder]", {
    y: 44, autoAlpha: 0, duration: 0.9, stagger: 0.15, ease: "power3.out",
    scrollTrigger: { trigger: ".founder-list", start: "top 82%" },
  });

  /* ---------- video placeholder ---------- */
  gsap.from("[data-video]", {
    y: 60, autoAlpha: 0, duration: 0.9, ease: "power3.out",
    scrollTrigger: { trigger: ".video-frame", start: "top 85%" },
  });
}

// refresh triggers once assets settle
window.addEventListener("load", () => ScrollTrigger.refresh());
