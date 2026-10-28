(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  $('#year').textContent = new Date().getFullYear();

  const bar = $('#progress'), nav = $('#nav');
  const burger = $('#burger'), links = $('#links');
  let ticking = false;
  const onScroll = () => {
    const y = scrollY;
    const h = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
    nav.classList.toggle('scrolled', y > 40);
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });

  const setMenu = open => {
    links.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  burger.addEventListener('click', () => setMenu(!links.classList.contains('open')));
  $$('a', links).forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => e.key === 'Escape' && setMenu(false));

  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: .12 });
  $$('.reveal').forEach(el => io.observe(el));

  const co = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, end = +el.dataset.count, suf = el.dataset.suffix || '';
    const t0 = performance.now(), dur = 1800;
    const tick = t => {
      const p = Math.min((t - t0) / dur, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suf;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    co.unobserve(el);
  }), { threshold: .6 });
  $$('[data-count]').forEach(el => co.observe(el));

  const so = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) $$('.links a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach(s => so.observe(s));

  // FAQ accordion (one open at a time)
  $$('.acc-q').forEach(q => q.addEventListener('click', () => {
    const item = q.closest('.acc-item'), open = !item.classList.contains('open');
    $$('.acc-item').forEach(i => {
      i.classList.remove('open');
      $('.acc-q', i).setAttribute('aria-expanded', 'false');
    });
    if (open) { item.classList.add('open'); q.setAttribute('aria-expanded', 'true'); }
  }));
  $('.acc-q').click();

  // Quote form -> WhatsApp
  const form = $('#contact'), err = $('#ferr');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = form.name.value.trim(), phone = form.phone.value.trim();
    if (!name || phone.replace(/\D/g, '').length < 10) {
      err.hidden = false;
      err.textContent = 'Please enter your name and a valid phone number.';
      (name ? form.phone : form.name).focus();
      return;
    }
    err.hidden = true;
    const msg = `Hello, I need a quote.\nName: ${name}\nPhone: ${phone}\nService: ${form.service.value}\nDetails: ${form.message.value.trim() || '-'}`;
    open('https://wa.me/923184415455?text=' + encodeURIComponent(msg), '_blank', 'noopener');
  });

  // before / after slider
  const ba = $('#ba'), range = $('input', ba);
  const setBa = v => ba.style.setProperty('--pos', v + '%');
  range.addEventListener('input', () => setBa(range.value));
  setBa(range.value);
  let nudged = false;
  new IntersectionObserver((es, o) => es.forEach(e => {
    if (!e.isIntersecting || nudged) return;
    nudged = true; o.disconnect();
    const t0 = performance.now();
    const go = t => {
      const p = Math.min((t - t0) / 1600, 1);
      const v = 50 + Math.sin(p * Math.PI * 2) * 25 * (1 - p);
      range.value = v; setBa(v);
      if (p < 1) requestAnimationFrame(go);
    };
    requestAnimationFrame(go);
  }), { threshold: .6 }).observe(ba);

  // rotating headline word
  const rot = $('#rot'), words = ['Marble', 'Tiles', 'Stone', 'Brickwork', 'Stairs', 'Home Construction'];
  let wi = 0;
  if (!matchMedia('(prefers-reduced-motion:reduce)').matches) {
    setInterval(() => {
      rot.classList.add('out');
      setTimeout(() => {
        wi = (wi + 1) % words.length;
        rot.textContent = words[wi];
        rot.classList.remove('out');
      }, 350);
    }, 2400);
  }

  // WhatsApp nudge bubble
  const pop = $('#waPop');
  let seen = false;
  try { seen = sessionStorage.getItem('waPop') === '1'; } catch (e) {}
  if (!seen) setTimeout(() => { pop.hidden = false; requestAnimationFrame(() => pop.classList.add('show')); }, 6000);
  $('#waX').addEventListener('click', () => {
    pop.classList.remove('show');
    setTimeout(() => { pop.hidden = true; }, 400);
    try { sessionStorage.setItem('waPop', '1'); } catch (e) {}
  });

  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const calm = matchMedia('(prefers-reduced-motion:reduce)').matches;
  if (!fine || calm) return;

  // hero collage parallax + cursor glow
  const hero = $('.hero'), shots = $$('.shot');
  hero.addEventListener('mousemove', e => {
    const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
    shots.forEach(s => {
      const d = +s.dataset.depth;
      s.style.setProperty('--px', (x * d).toFixed(1) + 'px');
      s.style.setProperty('--py', (y * d).toFixed(1) + 'px');
    });
    hero.style.setProperty('--gx', e.clientX + 'px');
    hero.style.setProperty('--gy', (e.clientY - hero.getBoundingClientRect().top) + 'px');
  });
})();
