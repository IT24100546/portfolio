"use strict";
// ═══════════════════════════════════════════════
// THARUSHI NAVODYA · PORTFOLIO
// main.ts
// ═══════════════════════════════════════════════
// ─── 1. Dot Grid Background ─────────────────────
class DotGrid {
    constructor(canvasId, config) {
        this.mouseX = 0;
        this.mouseY = 0;
        this.animFrame = 0;
        const canvas = document.getElementById(canvasId);
        if (!canvas)
            throw new Error(`Canvas #${canvasId} not found`);
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.config = Object.assign({ dotColor: "rgba(0,212,170,0.45)", dotSize: 1.5, spacing: 32, parallaxStrength: 18 }, config);
        this.resize();
        this.bindEvents();
        this.draw();
    }
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    bindEvents() {
        window.addEventListener("resize", () => this.resize(), { passive: true });
        window.addEventListener("mousemove", (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        }, { passive: true });
    }
    draw() {
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
    destroy() {
        cancelAnimationFrame(this.animFrame);
        window.removeEventListener("resize", () => this.resize());
    }
}
// ─── 2. Scroll Animation Observer ───────────────
function initScrollAnimations() {
    const items = document.querySelectorAll("[data-animate]");
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            var _a;
            if (entry.isIntersecting) {
                const el = entry.target;
                const delay = parseInt((_a = el.dataset.delay) !== null && _a !== void 0 ? _a : "0", 10);
                setTimeout(() => el.classList.add("visible"), delay);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -60px 0px" });
    items.forEach((el) => observer.observe(el));
}
// ─── 3. Capability Bar Animations ───────────────
function initCapabilityBars() {
    const bars = document.querySelectorAll(".cap-bar");
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            var _a;
            if (entry.isIntersecting) {
                const bar = entry.target;
                const targetWidth = (_a = bar.dataset.width) !== null && _a !== void 0 ? _a : "0";
                bar.style.width = `${targetWidth}%`;
                observer.unobserve(bar);
            }
        });
    }, { threshold: 0.3 });
    bars.forEach((bar) => observer.observe(bar));
}
// ─── 4. Stat Counter Animation ──────────────────
function animateCounter(el, target, duration = 1200) {
    const start = performance.now();
    const tick = (now) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        el.textContent = String(Math.round(target * eased));
        if (progress < 1)
            requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
}
function initStatCounters() {
    const counters = document.querySelectorAll("[data-count]");
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            var _a;
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt((_a = el.dataset.count) !== null && _a !== void 0 ? _a : "0", 10);
                animateCounter(el, target);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.5 });
    counters.forEach((el) => observer.observe(el));
}
// ─── 5. Active Nav on Scroll ────────────────────
function initNavHighlight() {
    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll(".nav-link");
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            var _a;
            if (entry.isIntersecting) {
                const id = (_a = entry.target.getAttribute("id")) !== null && _a !== void 0 ? _a : "";
                navLinks.forEach((link) => {
                    link.classList.toggle("active", link.dataset.section === id);
                });
            }
        });
    }, { threshold: 0.4 });
    sections.forEach((section) => observer.observe(section));
}
// ─── 6. Smooth Scroll for Nav Links ─────────────
function initSmoothScroll() {
    const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--nav-h"), 10) || 64;
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener("click", (e) => {
            var _a;
            const href = link.getAttribute("href");
            if (!href || href === "#")
                return;
            const target = document.querySelector(href);
            if (!target)
                return;
            e.preventDefault();
            const top = target.getBoundingClientRect().top + window.scrollY - navH;
            window.scrollTo({ top, behavior: "smooth" });
            // close mobile menu if open
            (_a = document.getElementById("navLinks")) === null || _a === void 0 ? void 0 : _a.classList.remove("open");
        });
    });
}
// ─── 7. Mobile Hamburger Menu ────────────────────
function initHamburger() {
    const btn = document.getElementById("hamburger");
    const menu = document.getElementById("navLinks");
    if (!btn || !menu)
        return;
    btn.addEventListener("click", () => {
        const open = menu.classList.toggle("open");
        btn.setAttribute("aria-expanded", String(open));
    });
    // close on outside click
    document.addEventListener("click", (e) => {
        if (!btn.contains(e.target) && !menu.contains(e.target)) {
            menu.classList.remove("open");
            btn.setAttribute("aria-expanded", "false");
        }
    });
}
// ─── 8. Project Filter ──────────────────────────
function initProjectFilter() {
    const filterBtns = document.querySelectorAll(".filter-btn");
    const cards = document.querySelectorAll(".project-card");
    filterBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            var _a;
            filterBtns.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            const filter = (_a = btn.dataset.filter) !== null && _a !== void 0 ? _a : "all";
            cards.forEach((card) => {
                var _a;
                const cat = (_a = card.dataset.cat) !== null && _a !== void 0 ? _a : "";
                const visible = filter === "all" || cat === filter;
                if (visible) {
                    card.classList.remove("hidden");
                    // Re-trigger fade-in
                    card.style.animation = "none";
                    card.offsetHeight; // reflow
                    card.style.animation = "";
                }
                else {
                    card.classList.add("hidden");
                }
            });
        });
    });
}
// ─── 9. Navbar Solid on Scroll ──────────────────
function initNavbarScroll() {
    const navbar = document.getElementById("navbar");
    if (!navbar)
        return;
    const handler = () => {
        navbar.style.borderBottomColor =
            window.scrollY > 40 ? "rgba(255,255,255,0.08)" : "var(--border)";
    };
    window.addEventListener("scroll", handler, { passive: true });
}
// ─── 10. Typed SQL Snippet ──────────────────────
function initTypedSQL() {
    var _a;
    const el = document.querySelector(".sql-snippet");
    if (!el)
        return;
    const fullText = (_a = el.textContent) !== null && _a !== void 0 ? _a : "";
    el.textContent = "";
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                typeText(el, fullText, 40);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.8 });
    observer.observe(el);
}
function typeText(el, text, speed) {
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
        }
        else {
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
        }
        catch (_) {
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
//# sourceMappingURL=main.js.map