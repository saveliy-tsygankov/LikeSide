(function () {
'use strict';

const { useState, useEffect, useMemo, useCallback } = React;
const { LS, useSearchState, mountPage } = window.LakeSide;
const D = window.LakeSideData;

function Steps({ step }) {
  const steps = [
    { n: 1, label: 'Даты и гости' },
    { n: 2, label: 'Данные гостя' },
    { n: 3, label: 'Подтверждение' },
  ];
  return (
    <div className="steps">
      {steps.map((s, i) => (
        <div
          key={s.n}
          className={`step ${step >= s.n ? 'is-done' : ''} ${step === s.n ? 'is-active' : ''}`}
        >
          <div className="step__num">
            {step > s.n ? <i className="fa-solid fa-check"></i> : s.n}
          </div>
          <span className="step__label">{s.label}</span>
          {i < steps.length - 1 && <div className="step__line" />}
        </div>
      ))}
    </div>
  );
}

function BookingPage() {
  const id = Number(LS.getParam('id') || 1);
  const hotel = useMemo(() => D.HOTELS.find((h) => h.id === id) || D.HOTELS[0], [id]);
  const [search, setSearch] = useSearchState();
  const [step, setStep] = useState(1);
  const [guest, setGuest] = useState({ name: '', email: '', phone: '', comment: '' });
  const [status, setStatus] = useState({ type: '', text: '' });

  const nights = LS.nightsBetween(search.checkIn, search.checkOut);
  const subtotal = nights * hotel.price;
  const service = Math.round(subtotal * 0.05);
  const total = subtotal + service;

  const validateStep2 = useCallback(() => {
    let ok = true;
    const errors = {};

    $('#guest-form .form__input').each(function () {
      const $f = $(this);
      const name = $f.attr('name');
      const v = $.trim($f.val());
      let err = '';

      if (!v) err = 'Обязательное поле';
      else if (name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) err = 'Некорректный email';
      else if (name === 'name' && v.length < 2) err = 'Минимум 2 символа';
      else if (name === 'phone' && v.replace(/\D/g, '').length < 10) err = 'Некорректный телефон';

      if (err) {
        ok = false;
        errors[name] = err;
        $f.addClass('has-error');
        $f.siblings('.form__error').addClass('is-visible').text(err);
      } else {
        $f.removeClass('has-error');
        $f.siblings('.form__error').removeClass('is-visible').text('');
      }
    });

    if (!ok) {
      $('#guest-form').stop(true)
        .animate({ marginLeft: '-6px' }, 60)
        .animate({ marginLeft: '6px' }, 60)
        .animate({ marginLeft: '0' }, 60);
    }
    return ok;
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setGuest((p) => ({ ...p, [name]: value }));
    $(e.target).removeClass('has-error');
    $(e.target).siblings('.form__error').removeClass('is-visible').text('');
  };

  const goNext = () => {
    if (step === 1) {
      if (nights <= 0) {
        setStatus({ type: 'error', text: 'Дата выезда должна быть позже даты заезда' });
        return;
      }
      setStatus({ type: '', text: '' });
      setStep(2);
    } else if (step === 2) {
      if (!validateStep2()) return;
      setStatus({ type: '', text: '' });
      setStep(3);
    }
  };

  const goBack = () => {
    setStatus({ type: '', text: '' });
    setStep((p) => Math.max(1, p - 1));
  };

  const confirm = () => {
    setStatus({ type: 'success', text: 'Бронь подтверждена! Мы отправили детали на ваш email.' });
    $('.booking-form__success').stop(true, true).slideDown(400);
  };

  useEffect(() => {
    const $from = $('#book-checkin');
    const $to = $('#book-checkout');
    const sync = () => {
      const from = $from.val();
      if (!from) return;
      const min = new Date(from);
      min.setDate(min.getDate() + 1);
      $to.attr('min', min.toISOString().slice(0, 10));
      if ($to.val() && new Date($to.val()) <= new Date(from)) {
        $to.val(min.toISOString().slice(0, 10));
        setSearch({ ...search, checkOut: min.toISOString().slice(0, 10) });
      }
    };
    $from.on('change.bk', sync);
    return () => $from.off('change.bk', sync);
  }, [search, setSearch]);

  return (
    <section className="section">
      <div className="container">
        <div className="booking-page">
          <div className="booking-page__breadcrumbs">
            <a href="index.html">Главная</a>
            <i className="fa-solid fa-chevron-right"></i>
            <a href={`hotel.html?id=${hotel.id}`}>{hotel.name}</a>
            <i className="fa-solid fa-chevron-right"></i>
            <span>Бронирование</span>
          </div>

          <h1 className="booking-page__title">Бронирование</h1>
          <Steps step={step} />

          <div className="booking-page__grid">
            <div className="booking-form">
              {step === 1 && (
                <div className="booking-form__step">
                  <h2 className="booking-form__title">Даты и гости</h2>

                  <div className="form__row">
                    <div className="form__group">
                      <label className="form__label" htmlFor="book-checkin">Заезд <span>*</span></label>
                      <input
                        id="book-checkin" type="date" className="form__input"
                        min={LS.dateOffset(0)}
                        value={search.checkIn}
                        onChange={(e) => setSearch({ ...search, checkIn: e.target.value })}
                      />
                      <span className="form__error"></span>
                    </div>

                    <div className="form__group">
                      <label className="form__label" htmlFor="book-checkout">Выезд <span>*</span></label>
                      <input
                        id="book-checkout" type="date" className="form__input"
                        min={LS.dateOffset(1)}
                        value={search.checkOut}
                        onChange={(e) => setSearch({ ...search, checkOut: e.target.value })}
                      />
                      <span className="form__error"></span>
                    </div>
                  </div>

                  <div className="form__group">
                    <label className="form__label" htmlFor="book-guests">Гости</label>
                    <select
                      id="book-guests" className="form__input"
                      value={search.guests}
                      onChange={(e) => setSearch({ ...search, guests: Number(e.target.value) })}
                    >
                      {[1, 2, 3, 4, 5, 6].map((n) => (
                        <option key={n} value={n}>{n} {n === 1 ? 'гость' : n < 5 ? 'гостя' : 'гостей'}</option>
                      ))}
                    </select>
                  </div>

                  <div className="booking-form__actions">
                    <a href={`hotel.html?id=${hotel.id}`} className="btn btn--ghost">
                      <i className="fa-solid fa-arrow-left"></i> Назад
                    </a>
                    <button type="button" className="btn btn--primary" onClick={goNext}>
                      Далее <i className="fa-solid fa-arrow-right"></i>
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="booking-form__step">
                  <h2 className="booking-form__title">Данные гостя</h2>

                  <form id="guest-form" noValidate>
                    <div className="form__row">
                      <div className="form__group">
                        <label className="form__label" htmlFor="name">Имя и фамилия <span>*</span></label>
                        <input
                          id="name" type="text" name="name"
                          className="form__input" placeholder="Иван Петров"
                          value={guest.name}
                          onChange={handleChange}
                        />
                        <span className="form__error"></span>
                      </div>
                      <div className="form__group">
                        <label className="form__label" htmlFor="email">Email <span>*</span></label>
                        <input
                          id="email" type="email" name="email"
                          className="form__input" placeholder="you@example.com"
                          value={guest.email}
                          onChange={handleChange}
                        />
                        <span className="form__error"></span>
                      </div>
                    </div>

                    <div className="form__group">
                      <label className="form__label" htmlFor="phone">Телефон <span>*</span></label>
                      <input
                        id="phone" type="tel" name="phone"
                        className="form__input" placeholder="+7 (999) 123-45-67"
                        value={guest.phone}
                        onChange={handleChange}
                      />
                      <span className="form__error"></span>
                    </div>

                    <div className="form__group">
                      <label className="form__label" htmlFor="comment">Пожелания</label>
                      <textarea
                        id="comment" name="comment"
                        className="form__input" style={{ minHeight: 100, resize: 'vertical' }}
                        placeholder="Ранний заезд, номер с видом и т.п."
                        value={guest.comment}
                        onChange={handleChange}
                      />
                    </div>
                  </form>

                  <div className="booking-form__actions">
                    <button type="button" className="btn btn--ghost" onClick={goBack}>
                      <i className="fa-solid fa-arrow-left"></i> Назад
                    </button>
                    <button type="button" className="btn btn--primary" onClick={goNext}>
                      Далее <i className="fa-solid fa-arrow-right"></i>
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="booking-form__step">
                  <h2 className="booking-form__title">Подтверждение</h2>

                  <div className="booking-form__summary">
                    <h3 className="booking-form__summary-title">
                      <i className="fa-solid fa-circle-info"></i> Проверьте детали
                    </h3>

                    <div className="summary-row">
                      <span>Отель</span><strong>{hotel.name}</strong>
                    </div>
                    <div className="summary-row">
                      <span>Город</span><strong>{hotel.city}</strong>
                    </div>
                    <div className="summary-row">
                      <span>Заезд</span><strong>{LS.formatDate(search.checkIn)}</strong>
                    </div>
                    <div className="summary-row">
                      <span>Выезд</span><strong>{LS.formatDate(search.checkOut)}</strong>
                    </div>
                    <div className="summary-row">
                      <span>Ночей</span><strong>{nights}</strong>
                    </div>
                    <div className="summary-row">
                      <span>Гости</span><strong>{search.guests}</strong>
                    </div>
                    <div className="summary-row">
                      <span>Имя</span><strong>{guest.name}</strong>
                    </div>
                    <div className="summary-row">
                      <span>Email</span><strong>{guest.email}</strong>
                    </div>
                    <div className="summary-row">
                      <span>Телефон</span><strong>{guest.phone}</strong>
                    </div>
                  </div>

                  <label className="checkbox-row">
                    <input type="checkbox" id="agree" defaultChecked />
                    <span className="amenity__check"></span>
                    <span>Согласен с условиями бронирования и политикой конфиденциальности</span>
                  </label>

                  <div className="booking-form__actions">
                    <button type="button" className="btn btn--ghost" onClick={goBack}>
                      <i className="fa-solid fa-arrow-left"></i> Назад
                    </button>
                    <button type="button" className="btn btn--primary" onClick={confirm}>
                      <i className="fa-solid fa-check"></i> Подтвердить бронь
                    </button>
                  </div>

                  {status.text && (
                    <div className={`booking__status is-${status.type}`}>{status.text}</div>
                  )}
                </div>
              )}
            </div>

            <aside className="booking-sidebar reveal reveal--right">
              <div className="booking-widget">
                <div className="booking-widget__hotel" style={{ backgroundImage: `url(${hotel.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                  <span>{hotel.name.charAt(0)}</span>
                </div>
                <h3 className="booking-widget__title">{hotel.name}</h3>
                <p className="booking-widget__city">
                  <i className="fa-solid fa-location-dot"></i> {hotel.city}
                </p>

                <div className="booking-widget__row">
                  <span>{LS.formatDate(search.checkIn)} → {LS.formatDate(search.checkOut)}</span>
                  <span>{nights} {nights === 1 ? 'ночь' : 'ночей'}</span>
                </div>

                <div className="booking-widget__divider" />

                <div className="booking-widget__row">
                  <span>{LS.formatPrice(hotel.price)} ₽ × {nights}</span>
                  <span>{LS.formatPrice(subtotal)} ₽</span>
                </div>
                <div className="booking-widget__row">
                  <span>Сервисный сбор</span>
                  <span>{LS.formatPrice(service)} ₽</span>
                </div>

                <div className="booking-widget__divider" />

                <div className="booking-widget__total booking-widget__total--big">
                  <div>
                    <div className="booking-widget__total-label">Итого к оплате</div>
                    <div className="booking-widget__total-value">{LS.formatPrice(total)} ₽</div>
                  </div>
                </div>

                <p className="booking-widget__note">
                  <i className="fa-solid fa-shield-halved"></i>
                  Оплата при заселении. Бесплатная отмена за 24 часа.
                </p>
              </div>
            </aside>
          </div>

          <div className="booking-form__success" style={{ display: 'none' }}>
            <div className="success-card">
              <div className="success-card__icon">
                <i className="fa-solid fa-check"></i>
              </div>
              <h2>Бронь подтверждена!</h2>
              <p>
                Мы отправили детали бронирования на <strong>{guest.email}</strong>.
                Если что-то пойдёт не так — свяжитесь с поддержкой.
              </p>
              <div className="success-card__actions">
                <a href="index.html" className="btn btn--primary">
                  <i className="fa-solid fa-house"></i> На главную
                </a>
                <a href="hotels.html" className="btn btn--ghost">
                  <i className="fa-solid fa-hotel"></i> Ещё отели
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

mountPage(BookingPage);

})();