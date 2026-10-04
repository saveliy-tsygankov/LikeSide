(function () {
'use strict';

const { useState, useEffect, useRef, useMemo, useCallback, memo } = React;

const LS = {
  formatPrice: (v) => new Intl.NumberFormat('ru-RU').format(v),
  dateOffset(days) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  },
  nightsBetween(a, b) {
    if (!a || !b) return 0;
    const diff = (new Date(b) - new Date(a)) / (1000 * 60 * 60 * 24);
    return diff > 0 ? Math.round(diff) : 0;
  },
  formatDate(iso) {
    if (!iso) return '';
    const months = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
    const d = new Date(iso);
    return `${d.getDate()} ${months[d.getMonth()]}`;
  },
  getParam(key) {
    return new URLSearchParams(window.location.search).get(key);
  },
  currentPage() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    return path.replace('.html', '') || 'index';
  },
};

function useScrollPosition(threshold = 40) {
  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    const $win = $(window);
    const h = () => setIsScrolled($win.scrollTop() > threshold);
    $win.on('scroll.sp', h); h();
    return () => $win.off('scroll.sp', h);
  }, [threshold]);
  return isScrolled;
}

function useCounter(target, duration = 1800, start = false) {
  const [value, setValue] = useState(0);
  const ran = useRef(false);
  useEffect(() => {
    if (!start || ran.current) return;
    ran.current = true;
    const $c = $({ val: 0 });
    $c.animate({ val: target }, {
      duration, easing: 'swing',
      step: (n) => setValue(Math.floor(n)),
      complete: () => setValue(target),
    });
    return () => $c.stop(true);
  }, [start, target, duration]);
  return value;
}

function useDebounce(value, delay = 280) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

function useTheme() {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('lakeside-theme') || 'dark'; }
    catch { return 'dark'; }
  });
  useEffect(() => {
    $('body').toggleClass('theme-light', theme === 'light');
    try { localStorage.setItem('lakeside-theme', theme); } catch {}
  }, [theme]);
  return [theme, () => setTheme((p) => (p === 'dark' ? 'light' : 'dark'))];
}

function useSearchState() {
  const [search, setSearch] = useState(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem('lakeside-search') || 'null');
      if (saved && saved.destination) return saved;
    } catch {}
    return {
      destination: '',
      checkIn:  LS.dateOffset(1),
      checkOut: LS.dateOffset(3),
      guests:   2,
    };
  });

  useEffect(() => {
    try { sessionStorage.setItem('lakeside-search', JSON.stringify(search)); } catch {}
  }, [search]);

  return [search, setSearch];
}


const Preloader = memo(function Preloader() {
  useEffect(() => {
    const $p = $('#preloader-progress');
    let v = 0;
    const t = setInterval(() => {
      v += Math.random() * 17 + 6;
      if (v >= 100) {
        v = 100;
        clearInterval(t);
        setTimeout(() => {
          $('#preloader').addClass('is-hidden');
          $('body').css('overflow', '');
          $(window).trigger('scroll.reveal');
        }, 320);
      }
      $p.css('width', v + '%');
    }, 160);
    $('body').css('overflow', 'hidden');
    return () => { clearInterval(t); $('body').css('overflow', ''); };
  }, []);
  return null;
});

function Navbar({ theme, onToggleTheme }) {
  const [isOpen, setIsOpen] = useState(false);
  const isScrolled = useScrollPosition(40);
  const current = LS.currentPage();

  const links = [
    { id: 'index',    label: 'Главная',      href: 'index.html' },
    { id: 'hotels',   label: 'Отели',        href: 'hotels.html' },
    { id: 'about',    label: 'О нас',        href: 'about.html' },
    { id: 'contacts', label: 'Контакты',     href: 'contacts.html' },
  ];

  useEffect(() => {
    const outside = (e) => {
      if (!$(e.target).closest('.navbar__menu, .navbar__burger').length) {
        setIsOpen(false);
      }
    };
    if (isOpen) $(document).on('click.nav', outside);
    return () => $(document).off('click.nav', outside);
  }, [isOpen]);

  const handleAnchor = (e, href) => {
    const hashIndex = href.indexOf('#');
    if (hashIndex < 0) { setIsOpen(false); return; }

    const anchor = href.slice(hashIndex + 1);
    const $target = $('#' + anchor);

    if ($target.length) {
      e.preventDefault();
      setIsOpen(false);
      $('html, body').stop(true).animate(
        { scrollTop: $target.offset().top - 66 },
        700,
        'swing'
      );
    }
  };

  return (
    <nav className={`navbar ${isScrolled ? 'is-scrolled' : ''}`}>
      <div className="navbar__inner">
        <a href="index.html" className="navbar__logo">
          <img src="images/logo.png" alt="LakeSide" className="navbar__logo-img" />
          <span className="navbar__logo-text">LAKE<span>SIDE</span></span>
        </a>

        <ul className={`navbar__menu ${isOpen ? 'is-open' : ''}`}>
          {links.map((l) => (
            <li key={l.id}>
              <a
                href={l.href}
                className={`navbar__link ${current === l.id ? 'is-active' : ''}`}
                onClick={(e) => handleAnchor(e, l.href)}
              >
                {l.label}
              </a>
            </li>
          ))}
          <li>
            <a
              href="booking.html"
              className={`navbar__link ${current === 'booking' ? 'is-active' : ''}`}
              onClick={() => setIsOpen(false)}
            >
              Бронирование
            </a>
          </li>
        </ul>

        <div className="navbar__spacer" />

        <div className="navbar__actions">
          <a href="login.html" className="navbar__login">
            <i className="fa-solid fa-user"></i>
            Войти
          </a>

          <button
            type="button"
            className="theme-toggle"
            onClick={onToggleTheme}
            aria-label="Переключить тему"
          >
            <span className="theme-toggle__thumb">
              <i className={theme === 'dark' ? 'fa-solid fa-moon' : 'fa-solid fa-sun'}></i>
            </span>
          </button>

          <button
            type="button"
            className={`navbar__burger ${isOpen ? 'is-open' : ''}`}
            onClick={() => setIsOpen((p) => !p)}
            aria-label="Меню"
          >
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  const year = new Date().getFullYear();
  const current = LS.currentPage();

  const links = [
    { id: 'index',    label: 'Главная',      href: 'index.html' },
    { id: 'hotels',   label: 'Отели',        href: 'hotels.html' },
    { id: 'about',    label: 'О нас',        href: 'about.html' },
    { id: 'contacts', label: 'Контакты',     href: 'contacts.html' },
    { id: 'booking',  label: 'Бронирование', href: 'booking.html' },
  ];

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__inner">
          <a href="index.html" className="navbar__logo">
            <img src="images/logo.png" alt="LakeSide" className="navbar__logo-img" />
            <span className="navbar__logo-text">LAKE<span>SIDE</span></span>
          </a>

          <ul className="footer__menu">
            {links.map((l) => (
              <li key={l.id}>
                <a
                  href={l.href}
                  className={`footer__link ${current === l.id ? 'is-active' : ''}`}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <a href="login.html" className="footer__login">
            <i className="fa-solid fa-user"></i>
            Войти
          </a>
        </div>

        <div className="footer__bottom">
          <span>© {year} LakeSide. Все права защищены.</span>
        </div>
      </div>
    </footer>
  );
}

function BackToTop() {
  const [v, setV] = useState(false);
  useEffect(() => {
    const $win = $(window);
    const t = () => setV($win.scrollTop() > 520);
    $win.on('scroll.top', t); t();
    return () => $win.off('scroll.top', t);
  }, []);
  return (
    <button
      type="button"
      className={`to-top ${v ? 'is-visible' : ''}`}
      onClick={() => $('html, body').stop(true).animate({ scrollTop: 0 }, 720)}
      aria-label="Наверх"
    >
      <i className="fa-solid fa-arrow-up"></i>
    </button>
  );
}

function StatItem({ value, suffix, label, start }) {
  const current = useCounter(value, 2000, start);
  const formatted = useMemo(() => {
    if (value >= 1000000) return (current / 1000000).toFixed(1).replace('.', ',') + 'M';
    if (value >= 1000) return Math.floor(current / 1000) + 'K';
    return current;
  }, [current, value]);
  return (
    <div className="stat">
      <div className="stat__value">{formatted}{suffix}</div>
      <div className="stat__label">{label}</div>
    </div>
  );
}

function Reviews({ items }) {
  const [index, setIndex] = useState(0);
  const total = items.length;

  const goTo = useCallback((i) => setIndex(((i % total) + total) % total), [total]);

  useEffect(() => {
    const t = setInterval(() => goTo(index + 1), 8000);
    return () => clearInterval(t);
  }, [index, goTo]);

  return (
    <>
      <div className="reviews__viewport reveal reveal--zoom">
        <div className="reviews__track" style={{ transform: `translateX(-${index * 100}%)` }}>
          {items.map((r) => (
            <div className="review" key={r.name}>
              <div className="review__card">
                <div className="review__quote"><i className="fa-solid fa-quote-left"></i></div>
                <p className="review__text">«{r.text}»</p>
                <div className="review__stars">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <i
                      key={i}
                      className={i < r.stars ? 'fa-solid fa-star' : 'fa-regular fa-star'}
                    ></i>
                  ))}
                </div>
                <div className="review__author">
                  <div className="review__avatar">{r.initials}</div>
                  <div>
                    <div className="review__name">{r.name}</div>
                    <div className="review__role">{r.role}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="reviews__nav">
        <button type="button" className="carousel-btn" onClick={() => goTo(index - 1)}>
          <i className="fa-solid fa-chevron-left"></i>
        </button>
        <div className="reviews__dots">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`reviews__dot ${i === index ? 'is-active' : ''}`}
              onClick={() => goTo(i)}
              aria-label={`Отзыв ${i + 1}`}
            />
          ))}
        </div>
        <button type="button" className="carousel-btn" onClick={() => goTo(index + 1)}>
          <i className="fa-solid fa-chevron-right"></i>
        </button>
      </div>
    </>
  );
}

function Faq({ items }) {
  const [openIndex, setOpenIndex] = useState(-1);

  const toggle = (i) => setOpenIndex((prev) => (prev === i ? -1 : i));

  return (
    <div className="faq reveal">
      {items.map((it, i) => (
        <div className={`faq__item ${openIndex === i ? 'is-open' : ''}`} key={i}>
          <button
            type="button"
            className="faq__question"
            onClick={() => toggle(i)}
            aria-expanded={openIndex === i}
          >
            <span>{it.q}</span>
            <span className="faq__icon"><i className="fa-solid fa-plus"></i></span>
          </button>
          <div className="faq__answer">{it.a}</div>
        </div>
      ))}
    </div>
  );
}

function HotelCard({ hotel, compact = false }) {
  const cardRef = useRef(null);
  const D = window.LakeSideData;

  useEffect(() => {
    const $c = $(cardRef.current);
    if (!$c.length || window.matchMedia('(pointer: coarse)').matches) return;
    const move = (e) => {
      const r = cardRef.current.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      $c.css('transform', `translateY(-8px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg)`);
    };
    const leave = () => $c.css('transform', '');
    $c.on('mousemove.tilt', move).on('mouseleave.tilt', leave);
    return () => $c.off('mousemove.tilt mouseleave.tilt');
  }, []);

  const amenities = compact ? hotel.amenities.slice(0, 2) : hotel.amenities.slice(0, 3);

  return (
    <a href={`hotel.html?id=${hotel.id}`} className="hotel" ref={cardRef}>
      <div className="hotel__cover" style={{ backgroundImage: `url(${hotel.image})` }}>
        {hotel.tag && <span className="hotel__tag">{hotel.tag}</span>}
        <span className="hotel__credit">{hotel.credit}</span>
        <div className="hotel__stars">
          {Array.from({ length: hotel.stars }).map((_, i) => (
            <i key={i} className="fa-solid fa-star"></i>
          ))}
        </div>
      </div>

      <div className="hotel__body">
        <h3 className="hotel__name">{hotel.name}</h3>
        <p className="hotel__city">
          <i className="fa-solid fa-location-dot"></i>
          {hotel.city}
        </p>

        {!compact && (
          <div className="hotel__amenities">
            {amenities.map((a) => (
              <span className="hotel__amenity" key={a}>
                <i className={D.AMENITY_LABELS[a].icon}></i>
                {D.AMENITY_LABELS[a].label}
              </span>
            ))}
          </div>
        )}

        <div className="hotel__footer">
          <div>
            <span className="hotel__rating">
              <i className="fa-solid fa-thumbs-up"></i>
              {hotel.rating.toFixed(1)}
            </span>
            <span className="hotel__reviews">{hotel.reviews} отзывов</span>
          </div>
          <div className="hotel__price">
            <div className="hotel__price-value">{LS.formatPrice(hotel.price)} ₽</div>
            <div className="hotel__price-label">за ночь</div>
          </div>
        </div>
      </div>
    </a>
  );
}

function usePageEffects() {
  useEffect(() => {
    const $win = $(window);

    const reveal = () => {
      const vb = $win.scrollTop() + $win.height();
      $('.reveal').each(function () {
        const $el = $(this);
        if (vb > $el.offset().top + 70) $el.addClass('is-visible');
      });
    };

    const onScroll = () => reveal();
    $win.on('scroll.page resize.page', onScroll);
    $win.on('scroll.reveal', reveal);
    setTimeout(onScroll, 120);

    return () => $win.off('scroll.page resize.page scroll.reveal');
  }, []);
}

function mountPage(PageComponent) {
  function Shell() {
    const [theme, toggleTheme] = useTheme();
    usePageEffects();

    return (
      <>
        <Preloader />
        <Navbar theme={theme} onToggleTheme={toggleTheme} />
        <main>
          <PageComponent />
        </main>
        <Footer />
        <BackToTop />
      </>
    );
  }

  ReactDOM.createRoot(document.getElementById('root')).render(<Shell />);
}

window.LakeSide = {
  LS, Preloader, Navbar, Footer, BackToTop, StatItem,
  Reviews, Faq, HotelCard, useTheme, useSearchState,
  useScrollPosition, useCounter, useDebounce,
  usePageEffects, mountPage,
};

})();