(function () {
'use strict';

const { useState, useCallback } = React;
const { Faq, mountPage } = window.LakeSide;
const D = window.LakeSideData;

const OFFICES = [
  { city: 'Санкт-Петербург', address: 'Невский проспект, 28, офис 512', phone: '+7 (812) 123-45-67', email: 'spb@lakeside.ru', hours: 'Пн–Пт 9:00–20:00' },
  { city: 'Москва',          address: 'ул. Тверская, 15, БЦ «Гранд», 8 этаж', phone: '+7 (495) 123-45-67', email: 'msk@lakeside.ru', hours: 'Пн–Пт 9:00–20:00' },
  { city: 'Сочи',            address: 'ул. Морская, 3, офис 210', phone: '+7 (862) 123-45-67', email: 'sochi@lakeside.ru', hours: 'Ежедневно 10:00–22:00' },
];

const OFFICE_COORDS = {
  'Санкт-Петербург': { lat: 59.9359, lon: 30.3256 },
  'Москва':          { lat: 55.7616, lon: 37.6093 },
  'Сочи':            { lat: 43.5814, lon: 39.7217 },
};

const CHANNELS = [
  { icon: 'fa-solid fa-headset', title: 'Поддержка 24/7', value: '+7 (800) 555-35-35', hint: 'Бесплатно по России' },
  { icon: 'fa-solid fa-envelope', title: 'Общие вопросы',  value: 'hello@lakeside.ru',   hint: 'Ответим в течение часа' },
  { icon: 'fa-solid fa-briefcase', title: 'Партнёрам',      value: 'partners@lakeside.ru', hint: 'Для отелей и агрегаторов' },
  { icon: 'fa-solid fa-bullhorn', title: 'Пресс-служба',   value: 'press@lakeside.ru',   hint: 'Для СМИ и блогеров' },
];

function HeroSection() {
  return (
    <section className="page-hero">
      <div className="container">
        <div className="page-hero__inner">
          <div className="page-hero__breadcrumbs">
            <a href="index.html">Главная</a>
            <i className="fa-solid fa-chevron-right"></i>
            <span>Контакты</span>
          </div>
          <h1 className="page-hero__title">
            Свяжитесь с <em>нами</em>
          </h1>
          <p className="page-hero__subtitle">
            Отвечаем в среднем за 3 минуты в чате и в течение часа по email.
          </p>
        </div>
      </div>
    </section>
  );
}

function Channels() {
  return (
    <section className="section">
      <div className="container">
        <div className="channels">
          {CHANNELS.map((c, i) => (
            <a href="#" className="channel reveal" key={c.title} style={{ transitionDelay: `${i * 0.07}s` }}>
              <div className="channel__icon"><i className={c.icon}></i></div>
              <div className="channel__title">{c.title}</div>
              <div className="channel__value">{c.value}</div>
              <div className="channel__hint">{c.hint}</div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function Offices() {
  return (
    <section className="section section--alt" id="offices">
      <div className="container">
        <div className="section__head reveal">
          <div>
            <span className="section__label">Офисы</span>
            <h2 className="section__title">
              Мы <em>рядом</em> с вами
            </h2>
          </div>
        </div>

        <div className="offices">
          {OFFICES.map((o, i) => (
            <article className="office reveal" key={o.city} style={{ transitionDelay: `${i * 0.08}s` }}>
              <div className="office__city">
                <i className="fa-solid fa-location-dot"></i> {o.city}
              </div>
              <p className="office__line">
                <i className="fa-solid fa-building"></i> {o.address}
              </p>
              <p className="office__line">
                <i className="fa-solid fa-phone"></i> {o.phone}
              </p>
              <p className="office__line">
                <i className="fa-solid fa-envelope"></i> {o.email}
              </p>
              <p className="office__line">
                <i className="fa-solid fa-clock"></i> {o.hours}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function OfficeMap({ city }) {
  const c = OFFICE_COORDS[city];
  if (!c) return null;

  const d = 0.012;
  const bbox = `${c.lon - d},${c.lat - d},${c.lon + d},${c.lat + d}`;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${c.lat},${c.lon}`;

  return (
    <article className="office-map reveal">
      <iframe
        title={`Карта: ${city}`}
        src={src}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      ></iframe>
      <span className="office-map__label">
        <i className="fa-solid fa-location-dot"></i> {city}
      </span>
    </article>
  );
}

function Maps() {
  return (
    <section className="section">
      <div className="container">
        <div className="section__head reveal">
          <div>
            <span className="section__label">Карта</span>
            <h2 className="section__title">
              Наши офисы <em>на карте</em>
            </h2>
          </div>
        </div>

        <div className="maps-grid">
          {OFFICES.map((o) => <OfficeMap key={o.city} city={o.city} />)}
        </div>
      </div>
    </section>
  );
}

function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState({ type: '', text: '' });

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    $(e.target).removeClass('has-error');
    $(e.target).siblings('.form__error').removeClass('is-visible').text('');
  }, []);

  const validate = useCallback(() => {
    let ok = true;

    $('#contact-form .form__input').each(function () {
      const $f = $(this);
      const n = $f.attr('name');
      const v = $.trim($f.val());
      let err = '';

      if (!v) err = 'Обязательное поле';
      else if (n === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) err = 'Некорректный email';
      else if (n === 'name' && v.length < 2) err = 'Минимум 2 символа';
      else if (n === 'message' && v.length < 10) err = 'Минимум 10 символов';

      if (err) {
        ok = false;
        $f.addClass('has-error');
        $f.siblings('.form__error').addClass('is-visible').text(err);
      } else {
        $f.removeClass('has-error');
        $f.siblings('.form__error').removeClass('is-visible').text('');
      }
    });
    return ok;
  }, []);

  const submit = (e) => {
    e.preventDefault();

    if (!validate()) {
      $('#contact-form').stop(true)
        .animate({ marginLeft: '-6px' }, 60)
        .animate({ marginLeft: '6px' }, 60)
        .animate({ marginLeft: '0' }, 60);
      setStatus({ type: 'error', text: 'Пожалуйста, исправьте ошибки в форме' });
      return;
    }

    setStatus({ type: 'success', text: 'Отправляем сообщение…' });
    setTimeout(() => {
      setStatus({ type: 'success', text: 'Спасибо! Мы ответим в течение часа.' });
      setForm({ name: '', email: '', subject: '', message: '' });
      $('#contact-form')[0].reset();
    }, 900);
  };

  return (
    <section className="section section--alt" id="form">
      <div className="container">
        <div className="section__head reveal">
          <div>
            <span className="section__label">Написать</span>
            <h2 className="section__title">
              Оставьте <em>сообщение</em>
            </h2>
          </div>
          <p className="section__subtitle">
            Заполните форму — и мы свяжемся с вами в удобном канале.
          </p>
        </div>

        <form className="contact-form reveal" id="contact-form" onSubmit={submit} noValidate>
          <div className="form__row">
            <div className="form__group">
              <label className="form__label" htmlFor="c-name">Имя <span>*</span></label>
              <input
                id="c-name" name="name" type="text" className="form__input"
                placeholder="Как к вам обращаться?"
                value={form.name} onChange={handleChange}
              />
              <span className="form__error"></span>
            </div>
            <div className="form__group">
              <label className="form__label" htmlFor="c-email">Email <span>*</span></label>
              <input
                id="c-email" name="email" type="email" className="form__input"
                placeholder="you@example.com"
                value={form.email} onChange={handleChange}
              />
              <span className="form__error"></span>
            </div>
          </div>

          <div className="form__group">
            <label className="form__label" htmlFor="c-subject">Тема</label>
            <input
              id="c-subject" name="subject" type="text" className="form__input"
              placeholder="О чём хотите поговорить?"
              value={form.subject} onChange={handleChange}
            />
          </div>

          <div className="form__group">
            <label className="form__label" htmlFor="c-message">Сообщение <span>*</span></label>
            <textarea
              id="c-message" name="message" className="form__input"
              style={{ minHeight: 140, resize: 'vertical' }}
              placeholder="Опишите ваш вопрос"
              value={form.message} onChange={handleChange}
            />
            <span className="form__error"></span>
          </div>

          <button type="submit" className="btn btn--primary">
            <i className="fa-solid fa-paper-plane"></i> Отправить
          </button>

          {status.text && (
            <div className={`booking__status is-${status.type}`}>{status.text}</div>
          )}
        </form>
      </div>
    </section>
  );
}

function ContactsPage() {
  return (
    <>
      <HeroSection />
      <Channels />
      <Offices />
      <Maps />
      <ContactForm />
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section__head reveal" style={{ justifyContent: 'center', textAlign: 'center', flexDirection: 'column', alignItems: 'center' }}>
            <div>
              <span className="section__label">FAQ</span>
              <h2 className="section__title">Частые <em>вопросы</em></h2>
            </div>
          </div>
          <Faq items={D.FAQ_ITEMS} />
        </div>
      </section>
    </>
  );
}

mountPage(ContactsPage);

})();