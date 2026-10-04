(function () {
'use strict';

const { useState, useEffect, useRef, useMemo, useCallback } = React;
const { LS, useDebounce, useSearchState, HotelCard, mountPage } = window.LakeSide;
const D = window.LakeSideData;

function PageHero({ search }) {
  return (
    <section className="page-hero">
      <div className="container">
        <div className="page-hero__inner">
          <div className="page-hero__breadcrumbs">
            <a href="index.html">Главная</a>
            <i className="fa-solid fa-chevron-right"></i>
            <span>Отели</span>
          </div>
          <h1 className="page-hero__title">Каталог отелей</h1>
          <p className="page-hero__subtitle">
            {search.destination
              ? `Найдено в «${search.destination}»`
              : 'Все отели LakeSide — более 12 000 вариантов по всей России'}
          </p>
        </div>
      </div>
    </section>
  );
}

function Catalog() {
  const [search, setSearch] = useSearchState();
  const [query, setQuery] = useState(search.destination || '');
  const [maxPrice, setMaxPrice] = useState(20000);
  const [stars, setStars] = useState('any');
  const [amenities, setAmenities] = useState([]);
  const [sort, setSort] = useState('popular');

  useEffect(() => {
    const fromUrl = LS.getParam('destination');
    if (fromUrl && fromUrl !== search.destination) {
      setSearch({ ...search, destination: fromUrl });
      setQuery(fromUrl);
    }
  }, []);

  const debounced = useDebounce(query, 280);

  const filtered = useMemo(() => {
    let list = [...D.HOTELS];
    if (debounced.trim()) {
      const q = debounced.trim().toLowerCase();
      list = list.filter(
        (h) => h.name.toLowerCase().includes(q) || h.city.toLowerCase().includes(q)
      );
    }
    if (maxPrice < 20000) list = list.filter((h) => h.price <= maxPrice);
    if (stars !== 'any') list = list.filter((h) => h.stars === Number(stars));
    if (amenities.length) list = list.filter((h) => amenities.every((a) => h.amenities.includes(a)));

    switch (sort) {
      case 'price-asc':  list.sort((a, b) => a.price - b.price); break;
      case 'price-desc': list.sort((a, b) => b.price - a.price); break;
      case 'rating':     list.sort((a, b) => b.rating - a.rating); break;
      case 'stars':      list.sort((a, b) => b.stars - a.stars || b.rating - a.rating); break;
      default:           list.sort((a, b) => b.reviews - a.reviews);
    }
    return list;
  }, [debounced, maxPrice, stars, amenities, sort]);

  useEffect(() => {
    $('.hotel')
      .css({ opacity: 0, transform: 'translateY(24px) scale(.97)' })
      .each(function (i) {
        const $el = $(this);
        setTimeout(() => {
          $el.css({
            transition: 'opacity .5s cubic-bezier(.22,1,.36,1), transform .5s cubic-bezier(.22,1,.36,1)',
            opacity: 1,
            transform: 'translateY(0) scale(1)',
          });
        }, i * 55);
      });
  }, [filtered.length, sort]);

  const reset = () => {
    setQuery('');
    setMaxPrice(20000);
    setStars('any');
    setAmenities([]);
    setSort('popular');
    setSearch({ ...search, destination: '' });
    window.history.replaceState({}, '', 'hotels.html');
  };

  const toggleAmenity = (key) => {
    setAmenities((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  return (
    <section className="section" id="catalog">
      <div className="container">
        <div className="catalog__layout">
          <aside className="filters reveal reveal--left">
            <div className="filters__group">
              <h3 className="filters__title">
                <i className="fa-solid fa-magnifying-glass"></i> Поиск
              </h3>
              <input
                type="text" className="filters__input"
                placeholder="Город или отель"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSearch({ ...search, destination: e.target.value });
                }}
              />
            </div>

            <div className="filters__group">
              <h3 className="filters__title">
                <i className="fa-solid fa-ruble-sign"></i> Цена за ночь
              </h3>
              <div className="price-range">
                <div className="price-range__value">
                  <span>до</span>
                  <strong>{LS.formatPrice(maxPrice)} ₽</strong>
                </div>
                <input
                  type="range" min="3000" max="20000" step="500"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="filters__group">
              <h3 className="filters__title">
                <i className="fa-solid fa-star"></i> Звёздность
              </h3>
              <div className="stars-filter">
                <button
                  type="button"
                  className={stars === 'any' ? 'is-active' : ''}
                  onClick={() => setStars('any')}
                >Любая</button>
                {[5, 4, 3].map((s) => (
                  <button
                    key={s} type="button"
                    className={stars === String(s) ? 'is-active' : ''}
                    onClick={() => setStars(String(s))}
                  >
                    {s} <i className="fa-solid fa-star"></i>
                  </button>
                ))}
              </div>
            </div>

            <div className="filters__group">
              <h3 className="filters__title">
                <i className="fa-solid fa-list-check"></i> Удобства
              </h3>
              <div className="amenities">
                {Object.entries(D.AMENITY_LABELS).map(([key, { label, icon }]) => (
                  <label className="amenity" key={key}>
                    <input
                      type="checkbox"
                      checked={amenities.includes(key)}
                      onChange={() => toggleAmenity(key)}
                    />
                    <span className="amenity__check"></span>
                    <i className={icon} style={{ width: 16, color: 'var(--accent-2)', fontSize: '.82rem' }}></i>
                    <span className="amenity__label">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <button type="button" className="filters__reset" onClick={reset}>
              <i className="fa-solid fa-rotate-left"></i> Сбросить фильтры
            </button>
          </aside>

          <div>
            <div className="results__toolbar reveal">
              <p className="results__count">
                Найдено <strong>{filtered.length}</strong>{' '}
                {filtered.length === 1 ? 'отель' : filtered.length < 5 ? 'отеля' : 'отелей'}
              </p>
              <div className="results__sort">
                <span>Сортировка:</span>
                <select value={sort} onChange={(e) => setSort(e.target.value)}>
                  {D.SORT_OPTIONS.map((o) => (
                    <option key={o.key} value={o.key}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="hotels">
              {filtered.length === 0 ? (
                <div className="hotels__empty">
                  <i className="fa-solid fa-hotel"></i>
                  <p>По вашим фильтрам ничего не найдено</p>
                  <p style={{ fontSize: '.85rem', marginTop: 8 }}>
                    Попробуйте изменить цену или убрать часть удобств
                  </p>
                </div>
              ) : (
                filtered.map((h) => <HotelCard key={h.id} hotel={h} />)
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HotelsPage() {
  const [search] = useSearchState();
  return (
    <>
      <PageHero search={search} />
      <Catalog />
    </>
  );
}

mountPage(HotelsPage);

})();