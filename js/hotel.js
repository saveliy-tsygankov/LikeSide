(function () {
'use strict';

const { useState, useEffect, useMemo } = React;
const { LS, useSearchState, Reviews, Faq, HotelCard, mountPage } = window.LakeSide;
const D = window.LakeSideData;

function NotFound() {
  return (
    <section className="section">
      <div className="container" style={{ textAlign: 'center', padding: '80px 0' }}>
        <i className="fa-solid fa-hotel" style={{ fontSize: '4rem', color: 'var(--border-hover)', marginBottom: 24, display: 'block' }}></i>
        <h1 className="section__title">Отель не найден</h1>
        <p style={{ color: 'var(--text-secondary)', margin: '16px 0 30px' }}>
          Возможно, ссылка устарела или отель больше не доступен.
        </p>
        <a href="hotels.html" className="btn btn--primary">
          <i className="fa-solid fa-arrow-left"></i> Вернуться в каталог
        </a>
      </div>
    </section>
  );
}

function HotelMap({ hotel }) {
  if (typeof hotel.lat !== 'number' || typeof hotel.lon !== 'number') return null;

  const d = 0.012;
  const bbox = `${hotel.lon - d},${hotel.lat - d},${hotel.lon + d},${hotel.lat + d}`;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${hotel.lat},${hotel.lon}`;

  return (
    <div className="hotel-map reveal">
      <iframe
        title={`Карта: ${hotel.name}`}
        src={src}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      ></iframe>
      <span className="hotel-map__label">
        <i className="fa-solid fa-location-dot"></i> {hotel.city}, Россия
      </span>
    </div>
  );
}

function HotelPage() {
  const id = Number(LS.getParam('id') || 1);
  const hotel = useMemo(() => D.HOTELS.find((h) => h.id === id), [id]);
  const [search, setSearch] = useSearchState();

  if (!hotel) return <NotFound />;

  const nights = LS.nightsBetween(search.checkIn, search.checkOut);
  const total = nights * hotel.price;
  const similar = D.HOTELS.filter((h) => h.id !== hotel.id && h.city === hotel.city).slice(0, 3);
  const backup = D.HOTELS.filter((h) => h.id !== hotel.id).slice(0, 3);

  return (
    <>
      <section className="hotel-page">
        <div className="container">
          <div className="hotel-page__breadcrumbs">
            <a href="index.html">Главная</a>
            <i className="fa-solid fa-chevron-right"></i>
            <a href="hotels.html">Отели</a>
            <i className="fa-solid fa-chevron-right"></i>
            <span>{hotel.name}</span>
          </div>

          <div className="gallery reveal">
            <div className="gallery__main" style={{ backgroundImage: `url(${hotel.image})` }}>
              {hotel.tag && <span className="hotel__tag">{hotel.tag}</span>}
              <span className="gallery__credit">{hotel.credit}</span>
            </div>
          </div>

          <div className="hotel-page__grid">
            <div>
              <header className="hotel-page__header reveal">
                <div className="hotel-page__stars">
                  {Array.from({ length: hotel.stars }).map((_, i) => (
                    <i key={i} className="fa-solid fa-star"></i>
                  ))}
                  <span className="hotel-page__star-label">{hotel.stars} звёзд</span>
                </div>
                <h1 className="hotel-page__title">{hotel.name}</h1>
                <p className="hotel-page__city">
                  <i className="fa-solid fa-location-dot"></i> {hotel.city}, Россия
                </p>

                <div className="hotel-page__badges">
                  <span className="modal__badge modal__badge--rating">
                    <i className="fa-solid fa-thumbs-up"></i>
                    {hotel.rating.toFixed(1)} / 10
                  </span>
                  <span className="modal__badge">
                    <i className="fa-solid fa-comment"></i> {hotel.reviews} отзывов
                  </span>
                </div>
              </header>

              <section className="hotel-page__section reveal">
                <h2 className="hotel-page__section-title">Об отеле</h2>
                <p className="hotel-page__desc">{hotel.desc}</p>
              </section>

              <section className="hotel-page__section reveal">
                <h2 className="hotel-page__section-title">Удобства и услуги</h2>
                <div className="modal__amenities">
                  {hotel.amenities.map((a) => (
                    <div className="modal__amenity" key={a}>
                      <i className={D.AMENITY_LABELS[a].icon}></i>
                      {D.AMENITY_LABELS[a].label}
                    </div>
                  ))}
                </div>
              </section>

              <section className="hotel-page__section reveal">
                <h2 className="hotel-page__section-title">Расположение</h2>
                <HotelMap hotel={hotel} />
              </section>
            </div>

            <aside className="hotel-page__sidebar">
              <div className="booking-widget reveal reveal--right">
                <div className="booking-widget__price">
                  <span className="booking-widget__price-value">{LS.formatPrice(hotel.price)} ₽</span>
                  <span className="booking-widget__price-label">за ночь</span>
                </div>

                <div className="booking-widget__field">
                  <label htmlFor="w-checkin">Заезд</label>
                  <input
                    id="w-checkin" type="date"
                    min={LS.dateOffset(0)}
                    value={search.checkIn}
                    onChange={(e) => setSearch({ ...search, checkIn: e.target.value })}
                  />
                </div>

                <div className="booking-widget__field">
                  <label htmlFor="w-checkout">Выезд</label>
                  <input
                    id="w-checkout" type="date"
                    min={LS.dateOffset(1)}
                    value={search.checkOut}
                    onChange={(e) => setSearch({ ...search, checkOut: e.target.value })}
                  />
                </div>

                <div className="booking-widget__field">
                  <label htmlFor="w-guests">Гости</label>
                  <select
                    id="w-guests"
                    value={search.guests}
                    onChange={(e) => setSearch({ ...search, guests: Number(e.target.value) })}
                  >
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>{n} {n === 1 ? 'гость' : n < 5 ? 'гостя' : 'гостей'}</option>
                    ))}
                  </select>
                </div>

                <div className="booking-widget__total">
                  <div>
                    <div className="booking-widget__total-label">
                      {nights} {nights === 1 ? 'ночь' : nights < 5 ? 'ночи' : 'ночей'}
                    </div>
                    <div className="booking-widget__total-value">{LS.formatPrice(total)} ₽</div>
                  </div>
                </div>

                <a
                  href={`booking.html?id=${hotel.id}`}
                  className="btn btn--primary"
                  style={{ width: '100%' }}
                >
                  <i className="fa-solid fa-calendar-check"></i> Забронировать
                </a>

                <p className="booking-widget__note">
                  <i className="fa-solid fa-shield-halved"></i>
                  Бесплатная отмена за 24 часа
                </p>
              </div>
            </aside>
          </div>

          {similar.length > 0 && (
            <section className="hotel-page__section" style={{ marginTop: 60 }}>
              <h2 className="hotel-page__section-title reveal">Ещё в {hotel.city}</h2>
              <div className="hotels">
                {similar.map((h) => <HotelCard key={h.id} hotel={h} compact />)}
              </div>
            </section>
          )}

          {similar.length === 0 && (
            <section className="hotel-page__section" style={{ marginTop: 60 }}>
              <h2 className="hotel-page__section-title reveal">Похожие отели</h2>
              <div className="hotels">
                {backup.map((h) => <HotelCard key={h.id} hotel={h} compact />)}
              </div>
            </section>
          )}

          <section className="hotel-page__section" style={{ marginTop: 60 }}>
            <h2 className="hotel-page__section-title reveal">Отзывы гостей</h2>
            <Reviews items={D.REVIEWS} />
          </section>

          <section className="hotel-page__section" style={{ marginTop: 60 }}>
            <h2 className="hotel-page__section-title reveal">Частые вопросы</h2>
            <Faq items={D.FAQ_ITEMS.slice(0, 4)} />
          </section>
        </div>
      </section>
    </>
  );
}

mountPage(HotelPage);

})();