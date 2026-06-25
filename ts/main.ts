// ═══════════════════════════════════════════════
// THARUSHI NAVODYA · PORTFOLIO
// main.ts
// ═══════════════════════════════════════════════

// ─── Types ──────────────────────────────────────
interface DotGridConfig {
  dotColor: string;
  dotSize: number;
  spacing: number;
  parallaxStrength: number;
}

// ─── 1. Dot Grid Background ─────────────────────
class DotGrid {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private config: DotGridConfig;
  private mouseX: number = 0;
  private mouseY: number = 0;
  private animFrame: number = 0;

  constructor(canvasId: string, config?: Partial<DotGridConfig>) {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
    if (!canvas) throw new Error(`Canvas #${canvasId} not found`);

    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.config = {
      dotColor: "rgba(0,212,170,0.45)",
      dotSize: 1.5,
      spacing: 32,
      parallaxStrength: 18,
      ...config,
    };

    this.resize();
    this.bindEvents();
    this.draw();
  }

  private resize(): void {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  private bindEvents(): void {
    window.addEventListener("resize", () => this.resize(), { passive: true });
    window.addEventListener(
      "mousemove",
      (e: MouseEvent) => {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
      },
      { passive: true }
    );
  }

  private draw(): void {
    const { ctx, canvas, config } = this;
    const { dotColor, dotSize, spacing, parallaxStrength } = config;

    const offsetX = ((this.mouseX / canvas.width) - 0.5) * parallaxStrength;
    const offsetY = ((this.mouseY / canvas.height) - 0.5) * parallaxStrength;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = dotColor;

    const cols = Math.ceil(canvas.width / spacing) + 2;
    const rows = Math.ceil(canvas.height / spacing) + 2;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * spacing + offsetX;
        const y = r * spacing + offsetY;
        ctx.beginPath();
        ctx.arc(x, y, dotSize, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    this.animFrame = requestAnimationFrame(() => this.draw());
  }

  public destroy(): void {
    cancelAnimationFrame(this.animFrame);
    window.removeEventListener("resize", () => this.resize());
  }
}

// ─── 2. Scroll Animation Observer ───────────────
function initScrollAnimations(): void {
  const items = document.querySelectorAll<HTMLElement>("[data-animate]");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement;
          const delay = parseInt(el.dataset.delay ?? "0", 10);
          setTimeout(() => el.classList.add("visible"), delay);
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
  );

  items.forEach((el) => observer.observe(el));
}

// ─── 3. Capability Bar Animations ───────────────
function initCapabilityBars(): void {
  const bars = document.querySelectorAll<HTMLElement>(".cap-bar");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const bar = entry.target as HTMLElement;
          const targetWidth = bar.dataset.width ?? "0";
          bar.style.width = `${targetWidth}%`;
          observer.unobserve(bar);
        }
      });
    },
    { threshold: 0.3 }
  );

  bars.forEach((bar) => observer.observe(bar));
}

// ─── 4. Stat Counter Animation ──────────────────
function animateCounter(el: HTMLElement, target: number, duration: number = 1200): void {
  const start = performance.now();

  const tick = (now: number): void => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    el.textContent = String(Math.round(target * eased));
    if (progress < 1) requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
}

function initStatCounters(): void {
  const counters = document.querySelectorAll<HTMLElement>("[data-count]");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement;
          const target = parseInt(el.dataset.count ?? "0", 10);
          animateCounter(el, target);
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((el) => observer.observe(el));
}

// ─── 5. Active Nav on Scroll ────────────────────
function initNavHighlight(): void {
  const sections = document.querySelectorAll<HTMLElement>("section[id]");
  const navLinks = document.querySelectorAll<HTMLAnchorElement>(".nav-link");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute("id") ?? "";
          navLinks.forEach((link) => {
            link.classList.toggle(
              "active",
              link.dataset.section === id
            );
          });
        }
      });
    },
    { threshold: 0.4 }
  );

  sections.forEach((section) => observer.observe(section));
}

// ─── 6. Smooth Scroll for Nav Links ─────────────
function initSmoothScroll(): void {
  const navH = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue("--nav-h"),
    10
  ) || 64;

  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (!href || href === "#") return;
      const target = document.querySelector<HTMLElement>(href);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: "smooth" });
      // close mobile menu if open
      document.getElementById("navLinks")?.classList.remove("open");
    });
  });
}

// ─── 7. Mobile Hamburger Menu ────────────────────
function initHamburger(): void {
  const btn = document.getElementById("hamburger");
  const menu = document.getElementById("navLinks");
  if (!btn || !menu) return;

  btn.addEventListener("click", () => {
    const open = menu.classList.toggle("open");
    btn.setAttribute("aria-expanded", String(open));
  });

  // close on outside click
  document.addEventListener("click", (e) => {
    if (!btn.contains(e.target as Node) && !menu.contains(e.target as Node)) {
      menu.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
    }
  });
}

// ─── 8. Project Filter ──────────────────────────
function initProjectFilter(): void {
  const filterBtns = document.querySelectorAll<HTMLButtonElement>(".filter-btn");
  const cards = document.querySelectorAll<HTMLElement>(".project-card");

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const filter = btn.dataset.filter ?? "all";

      cards.forEach((card) => {
        const cat = card.dataset.cat ?? "";
        const visible = filter === "all" || cat === filter;

        if (visible) {
          card.classList.remove("hidden");
          // Re-trigger fade-in
          card.style.animation = "none";
          card.offsetHeight; // reflow
          card.style.animation = "";
        } else {
          card.classList.add("hidden");
        }
      });
    });
  });
}

// ─── 9. Navbar Solid on Scroll ──────────────────
function initNavbarScroll(): void {
  const navbar = document.getElementById("navbar");
  if (!navbar) return;

  const handler = (): void => {
    navbar.style.borderBottomColor =
      window.scrollY > 40 ? "rgba(255,255,255,0.08)" : "var(--border)";
  };

  window.addEventListener("scroll", handler, { passive: true });
}

// ─── 10. Typed SQL Snippet ──────────────────────
function initTypedSQL(): void {
  const el = document.querySelector<HTMLElement>(".sql-snippet");
  if (!el) return;

  const fullText = el.textContent ?? "";
  el.textContent = "";

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          typeText(el, fullText, 40);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.8 }
  );

  observer.observe(el);
}

function typeText(el: HTMLElement, text: string, speed: number): void {
  let i = 0;
  const cursor = document.createElement("span");
  cursor.textContent = "|";
  cursor.style.cssText = "color:#00d4aa;animation:blink 1s step-end infinite";
  el.appendChild(cursor);

  // add blink keyframe dynamically
  if (!document.querySelector("#blink-style")) {
    const style = document.createElement("style");
    style.id = "blink-style";
    style.textContent = "@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}";
    document.head.appendChild(style);
  }

  const interval = setInterval(() => {
    if (i < text.length) {
      el.insertBefore(document.createTextNode(text[i]), cursor);
      i++;
    } else {
      clearInterval(interval);
      setTimeout(() => cursor.remove(), 800);
    }
  }, speed);
}

// ─── Bootstrap ──────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  // Dot grid — only if canvas exists and not reduced motion
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!prefersReduced) {
    try {
      new DotGrid("dotGrid");
    } catch (_) {
      /* canvas not found, skip silently */
    }
  }

  initScrollAnimations();
  initCapabilityBars();
  initStatCounters();
  initNavHighlight();
  initSmoothScroll();
  initHamburger();
  initProjectFilter();
  initNavbarScroll();

  if (!prefersReduced) {
    initTypedSQL();
  }
});
