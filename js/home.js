const { useState, useEffect, useRef, useMemo, useCallback } = React;
const { LS, useSearchState, useCounter, StatItem, Reviews, Faq, HotelCard, mountPage } = window.LakeSide;

const D = window.LakeSideData;

function Hero({ onSearch }) {
  const [search, setSearch] = useSearchState();
  const [slide, setSlide] = useState(0);
  const [countersStarted, setCountersStarted] = useState(false);
  const statsRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => setSlide((p) => (p + 1) % D.HERO_SLIDES.length), 6500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const $el = $('#hero-typed');
    if (!$el.length) return;
    const phrases = ['в Санкт-Петербурге', 'на берегу Сочи', 'в центре Москвы', 'у озера Байкал', 'в горах Кавказа'];
    let pi = 0, ci = 0, del = false, tid = null;
    const tick = () => {
      const cur = phrases[pi];
      ci += del ? -1 : 1;
      $el.text(cur.substring(0, ci));
      let d = del ? 40 : 80;
      if (!del && ci === cur.length) { d = 1800; del = true; }
      else if (del && ci === 0) { del = false; pi = (pi + 1) % phrases.length; d = 320; }
      tid = setTimeout(tick, d);
    };
    tid = setTimeout(tick, 500);
    return () => clearTimeout(tid);
  }, []);

  useEffect(() => {
    const $s = $(statsRef.current);
    if (!$s.length) return;
    const check = () => {
      if ($(window).scrollTop() + $(window).height() > $s.offset().top + 60) {
        setCountersStarted(true);
        $(window).off('scroll.stats');
      }
    };
    $(window).on('scroll.stats', check); check();
    return () => $(window).off('scroll.stats');
  }, []);

  useEffect(() => {
    const $from = $('#home-checkin');
    const $to = $('#home-checkout');
    const sync = () => {
      const from = $from.val();
      if (from) {
        const next = new Date(from);
        next.setDate(next.getDate() + 1);
        const min = next.toISOString().slice(0, 10);
        $to.attr('min', min);
        if ($to.val() && new Date($to.val()) <= new Date(from)) {
          $to.val(min);
        }
      }
    };
    $from.on('change.hero', sync);
    return () => $from.off('change.hero', sync);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!search.destination) {
      $('#search-card').stop(true)
        .animate({ marginLeft: '-8px' }, 60)
        .animate({ marginLeft: '8px' }, 60)
        .animate({ marginLeft: '0' }, 60);
      return;
    }
    window.location.href = `hotels.html?destination=${encodeURIComponent(search.destination)}`;
  };

  const quick = ['Санкт-Петербург', 'Сочи', 'Москва', 'Казань', 'Байкал'];

  return (
    <section className="hero" id="hero">
      <div className="hero__bg">
        {D.HERO_SLIDES.map((s, i) => (
          <div key={i} className={`hero__bg-slide ${i === slide ? 'is-active' : ''}`} style={{ background: s.gradient }} />
        ))}
      </div>

      <div className="container">
        <div className="hero__content">
          <div className="hero__badge">
            <span className="hero__badge-dot"></span>
            Более 12 000 отелей по всей России
          </div>

          <h1 className="hero__title">
            Найдите идеальный отель
            <span className="hero__title-accent">
              <span id="hero-typed"></span>
              <span style={{ animation: 'blink 1s step-end infinite' }}>|</span>
            </span>
          </h1>

          <p className="hero__text">
            Бронируйте за минуту, платите при заселении и получайте кэшбэк до 7% с каждой поездки.
          </p>
        </div>

        <form className="search-card" id="search-card" onSubmit={handleSubmit}>
          <div className="search-card__grid">
            <div className="search-field">
              <label className="search-field__label" htmlFor="home-dest">
                <i className="fa-solid fa-location-dot"></i> Куда
              </label>
              <input
                id="home-dest" type="text" className="search-field__input"
                placeholder="Город или отель"
                value={search.destination}
                onChange={(e) => setSearch({ ...search, destination: e.target.value })}
              />
            </div>

            <div className="search-field">
              <label className="search-field__label" htmlFor="home-checkin">
                <i className="fa-solid fa-calendar-check"></i> Заезд
              </label>
              <input
                id="home-checkin" type="date" className="search-field__input"
                min={LS.dateOffset(0)}
                value={search.checkIn}
                onChange={(e) => setSearch({ ...search, checkIn: e.target.value })}
              />
            </div>

            <div className="search-field">
              <label className="search-field__label" htmlFor="home-checkout">
                <i className="fa-solid fa-calendar-xmark"></i> Выезд
              </label>
              <input
                id="home-checkout" type="date" className="search-field__input"
                min={LS.dateOffset(1)}
                value={search.checkOut}
                onChange={(e) => setSearch({ ...search, checkOut: e.target.value })}
              />
            </div>

            <div className="search-field">
              <label className="search-field__label" htmlFor="home-guests">
                <i className="fa-solid fa-user-group"></i> Гости
              </label>
              <select
                id="home-guests" className="search-field__input"
                value={search.guests}
                onChange={(e) => setSearch({ ...search, guests: Number(e.target.value) })}
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>{n} {n === 1 ? 'гость' : n < 5 ? 'гостя' : 'гостей'}</option>
                ))}
              </select>
            </div>

            <button type="submit" className="search-card__btn">
              <i className="fa-solid fa-magnifying-glass"></i> Найти
            </button>
          </div>
        </form>

        <div className="hero__chips">
          {quick.map((city) => (
            <button
              key={city} type="button" className="hero__chip"
              onClick={() => {
                setSearch({ ...search, destination: city });
                window.location.href = `hotels.html?destination=${encodeURIComponent(city)}`;
              }}
            >
              <i className="fa-solid fa-location-dot"></i> {city}
            </button>
          ))}
        </div>

        <div className="hero__stats" ref={statsRef}>
          <StatItem value={12000} suffix="+" label="Отелей" start={countersStarted} />
          <StatItem value={850000} suffix="+" label="Бронирований" start={countersStarted} />
          <StatItem value={98} suffix="%" label="Довольны сервисом" start={countersStarted} />
        </div>
      </div>
    </section>
  );
}

function Marquee() {
  const doubled = [...D.MARQUEE_ITEMS, ...D.MARQUEE_ITEMS];
  return (
    <div className="marquee">
      <div className="marquee__track">
        {doubled.map((item, i) => (
          <span className="marquee__item" key={i}>
            <i className="fa-solid fa-diamond"></i> {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function Destinations() {
  const viewportRef = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const updateArrows = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    $(el).on('scroll.dest', updateArrows);
    $(window).on('resize.dest', updateArrows);
    updateArrows();
    return () => { $(el).off('scroll.dest'); $(window).off('resize.dest'); };
  }, [updateArrows]);

  const scrollBy = (dir) => {
    const el = viewportRef.current;
    const target = el.scrollLeft + 282 * 2 * dir;
    $(el).stop(true).animate({ scrollLeft: target }, 520, 'swing', updateArrows);
  };

  return (
    <section className="section" id="destinations">
      <div className="container">
        <div className="section__head reveal">
          <div>
            <span className="section__label">Направления</span>
            <h2 className="section__title">
              Куда поедем <em>в этот раз?</em>
            </h2>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" className="carousel-btn" onClick={() => scrollBy(-1)} disabled={!canLeft}>
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            <button type="button" className="carousel-btn" onClick={() => scrollBy(1)} disabled={!canRight}>
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        </div>

        <div className="destinations__viewport" ref={viewportRef}>
          <div className="destinations__track">
            {D.DESTINATIONS.map((d) => (
              <a href={`hotels.html?destination=${encodeURIComponent(d.city)}`} className="dest-card" key={d.id}>
                <div className="dest-card__cover" style={{ backgroundImage: `url(${d.image})` }}>
                  <span className="dest-card__credit">{d.credit}</span>
                  <div className="dest-card__body">
                    <h3 className="dest-card__city">{d.city}</h3>
                    <div className="dest-card__meta">
                      <span>{d.country}</span>
                      <span>{d.hotels} отелей</span>
                    </div>
                    <span className="dest-card__price">
                      <i className="fa-solid fa-tag"></i> от {LS.formatPrice(d.price)} ₽
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturedHotels() {
  const top = useMemo(() => [...D.HOTELS].sort((a, b) => b.rating - a.rating).slice(0, 6), []);

  return (
    <section className="section section--alt" id="featured">
      <div className="container">
        <div className="section__head reveal">
          <div>
            <span className="section__label">Топ отелей</span>
            <h2 className="section__title">
              Выбор <em>наших гостей</em>
            </h2>
          </div>
          <a href="hotels.html" className="btn btn--ghost">
            Все отели <i className="fa-solid fa-arrow-right"></i>
          </a>
        </div>

        <div className="hotels">
          {top.map((h) => <HotelCard key={h.id} hotel={h} />)}
        </div>
      </div>
    </section>
  );
}

function ReviewsSection() {
  return (
    <section className="section" id="reviews">
      <div className="container">
        <div className="section__head reveal">
          <div>
            <span className="section__label">Отзывы</span>
            <h2 className="section__title">
              Что говорят <em>подписчики</em>
            </h2>
          </div>
        </div>
        <Reviews items={D.REVIEWS} />
      </div>
    </section>
  );
}

function FaqSection() {
  return (
    <section className="section section--alt" id="faq">
      <div className="container">
        <div className="section__head reveal" style={{ justifyContent: 'center', textAlign: 'center', flexDirection: 'column', alignItems: 'center' }}>
          <div>
            <span className="section__label">Вопросы</span>
            <h2 className="section__title">
              Часто <em>спрашивают</em>
            </h2>
          </div>
        </div>
        <Faq items={D.FAQ_ITEMS} />
      </div>
    </section>
  );
}

function Cta() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: '', text: '' });

  const submit = (e) => {
    e.preventDefault();
    const $inp = $('#cta-email');
    const value = $.trim($inp.val());
    if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      $inp.addClass('has-error');
      setStatus({ type: 'error', text: 'Введите корректный email' });
      return;
    }
    $inp.removeClass('has-error');
    setStatus({ type: 'success', text: 'Отлично! Проверьте почту — мы отправили промокод.' });
    setEmail('');
    setTimeout(() => setStatus({ type: '', text: '' }), 6000);
  };

  return (
    <section className="section">
      <div className="container">
        <div className="cta reveal reveal--zoom">
          <h2 className="cta__title">Скидка <em>10%</em> на первую бронь</h2>
          <p className="cta__text">
            Оставьте email — пришлём промокод на первую поездку и подборку отелей со скидками.
          </p>
          <form className="cta__form" onSubmit={submit}>
            <input
              id="cta-email" type="email" placeholder="your@email.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); $(e.target).removeClass('has-error'); }}
            />
            <button type="submit" className="btn btn--primary">
              <i className="fa-solid fa-paper-plane"></i> Получить промокод
            </button>
          </form>
          <p className={`cta__status ${status.type ? 'is-' + status.type : ''}`}>{status.text}</p>
        </div>
      </div>
    </section>
  );
}

function HomePage() {
  const [, setSearch] = useSearchState();
  return (
    <>
      <Hero onSearch={setSearch} />
      <Marquee />
      <Destinations />
      <FeaturedHotels />
      <ReviewsSection />
      <FaqSection />
      <Cta />
    </>
  );
}

mountPage(HomePage);