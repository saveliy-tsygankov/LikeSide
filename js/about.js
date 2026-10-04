(function () {
'use strict';

const { useState, useEffect, useRef } = React;
const { StatItem, mountPage } = window.LakeSide;

const ADVANTAGES = [
  { icon: 'fa-solid fa-bolt',       title: 'Мгновенное бронирование', text: 'Подтверждение приходит за пару секунд. Без ожидания, звонков и писем.' },
  { icon: 'fa-solid fa-tags',       title: 'Честные цены',            text: 'Мы работаем напрямую с отелями и не накручиваем комиссию сверху.' },
  { icon: 'fa-solid fa-shield-halved', title: 'Безопасные платежи',   text: 'Все транзакции защищены по стандарту PCI DSS. Данные не передаются третьим лицам.' },
  { icon: 'fa-solid fa-headset',    title: 'Поддержка 24/7',          text: 'Отвечаем в чате, по телефону и email в любое время дня и ночи.' },
  { icon: 'fa-solid fa-percent',    title: 'Кэшбэк до 7%',            text: 'Чем больше броней — тем выше статус и процент возврата баллами.' },
  { icon: 'fa-solid fa-globe',      title: '12 000+ отелей',          text: 'От мини-отелей в глубинке до пятизвёздочных курортов на побережье.' },
];

const TIMELINE = [
  { year: '2018', title: 'Идея и первый прототип', text: 'Двое основателей запустили MVP на голом энтузиазме — 40 отелей в Петербурге.' },
  { year: '2020', title: 'Первая тысяча отелей',    text: 'Расширились на Москву и Сочи. Запустили программу лояльности.' },
  { year: '2022', title: 'Мобильное приложение',    text: 'Вышли на iOS и Android. 250 000 скачиваний в первый год.' },
  { year: '2024', title: '850 000 бронирований',    text: 'Стали одним из крупнейших независимых сервисов бронирования в России.' },
];

function HeroSection() {
  return (
    <section className="page-hero page-hero--tall">
      <div className="container">
        <div className="page-hero__inner">
          <div className="page-hero__breadcrumbs">
            <a href="index.html">Главная</a>
            <i className="fa-solid fa-chevron-right"></i>
            <span>О нас</span>
          </div>
          <h1 className="page-hero__title">
            Мы делаем путешествия <em>проще</em>
          </h1>
          <p className="page-hero__subtitle">
            LakeSide — команда из 84 человек, которая помогает миллионам людей находить идеальные отели по всей России.
          </p>
        </div>
      </div>
    </section>
  );
}

function Stats() {
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const $el = $(ref.current);
    const check = () => {
      if ($(window).scrollTop() + $(window).height() > $el.offset().top + 60) {
        setStarted(true);
        $(window).off('scroll.aboutStats');
      }
    };
    $(window).on('scroll.aboutStats', check); check();
    return () => $(window).off('scroll.aboutStats');
  }, []);

  return (
    <section className="section section--alt">
      <div className="container">
        <div className="hero__stats" ref={ref} style={{ borderTop: 'none', marginTop: 0, paddingTop: 0, gap: 60 }}>
          <StatItem value={12000}  suffix="+" label="Отелей"           start={started} />
          <StatItem value={850000} suffix="+" label="Бронирований"      start={started} />
          <StatItem value={84}     suffix=""  label="Человека в команде" start={started} />
          <StatItem value={98}     suffix="%" label="Довольны сервисом"  start={started} />
        </div>
      </div>
    </section>
  );
}

function Advantages() {
  return (
    <section className="section" id="advantages">
      <div className="container">
        <div className="section__head reveal">
          <div>
            <span className="section__label">Преимущества</span>
            <h2 className="section__title">
              Почему выбирают <em>LakeSide</em>
            </h2>
          </div>
        </div>

        <div className="advantages">
          {ADVANTAGES.map((a, i) => (
            <article className="advantage reveal" key={a.title} style={{ transitionDelay: `${i * 0.08}s` }}>
              <div className="advantage__icon">
                <i className={a.icon}></i>
              </div>
              <h3 className="advantage__title">{a.title}</h3>
              <p className="advantage__text">{a.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Timeline() {
  return (
    <section className="section section--alt" id="history">
      <div className="container">
        <div className="section__head reveal">
          <div>
            <span className="section__label">История</span>
            <h2 className="section__title">
              Как всё <em>начиналось</em>
            </h2>
          </div>
        </div>

        <div className="timeline">
          {TIMELINE.map((item, i) => (
            <div className="timeline__item reveal reveal--left" key={item.year} style={{ transitionDelay: `${i * 0.1}s` }}>
              <span className="timeline__dot"></span>
              <div className="timeline__card">
                <span className="timeline__period">{item.year}</span>
                <h3 className="timeline__role">{item.title}</h3>
                <p className="timeline__company">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AboutPage() {
  return (
    <>
      <HeroSection />
      <Stats />
      <Advantages />
      <Timeline />
    </>
  );
}

mountPage(AboutPage);

})();