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
    bar.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
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

  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const calm = matchMedia('(prefers-reduced-motion:reduce)').matches;
  if (!fine || calm) return;

  // hero frame tilt
  const frame = $('.frame'), hero = $('.hero');
  hero.addEventListener('mousemove', e => {
    const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
    frame.style.transform = `rotateY(${-8 + x * 12}deg) rotateX(${3 - y * 10}deg)`;
  });
  hero.addEventListener('mouseleave', () => { frame.style.transform = ''; });

  // gentle parallax on section background images
  const bgs = $$('.bg-img');
  addEventListener('scroll', () => requestAnimationFrame(() => bgs.forEach(img => {
    const r = img.parentElement.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    img.style.transform = `translateY(${(r.top * -0.08).toFixed(1)}px) scale(1.12)`;
  })), { passive: true });
})();
