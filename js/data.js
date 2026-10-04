window.LakeSideData = (function () {
  const AMENITY_LABELS = {
    spa:        { label: 'СПА-центр',         icon: 'fa-solid fa-spa' },
    pool:       { label: 'Бассейн',           icon: 'fa-solid fa-water-ladder' },
    wifi:       { label: 'Wi-Fi',             icon: 'fa-solid fa-wifi' },
    restaurant: { label: 'Ресторан',          icon: 'fa-solid fa-utensils' },
    parking:    { label: 'Парковка',          icon: 'fa-solid fa-square-parking' },
    gym:        { label: 'Фитнес-зал',        icon: 'fa-solid fa-dumbbell' },
    bar:        { label: 'Бар',               icon: 'fa-solid fa-martini-glass' },
    breakfast:  { label: 'Завтрак включён',   icon: 'fa-solid fa-mug-hot' },
    pets:       { label: 'Можно с питомцами', icon: 'fa-solid fa-paw' },
    beach:      { label: 'Пляж',              icon: 'fa-solid fa-umbrella-beach' },
  };

  const DESTINATIONS = [
    { id: 1, city: 'Санкт-Петербург', country: 'Россия', hotels: 342, price: 4500,
      image: 'images/destination-1.png', credit: 'Image by Peter H from Pixabay' },
    { id: 2, city: 'Сочи',            country: 'Россия', hotels: 218, price: 6200,
      image: 'images/destination-2.png', credit: 'Image by InessaTokmina from Pixabay' },
    { id: 3, city: 'Москва',          country: 'Россия', hotels: 891, price: 5800,
      image: 'images/destination-3.png', credit: 'Image by LENA15 from Pixabay' },
    { id: 4, city: 'Казань',          country: 'Россия', hotels: 156, price: 3900,
      image: 'images/destination-4.png', credit: 'Image by winklerchristopher from Pixabay' },
    { id: 5, city: 'Калининград',     country: 'Россия', hotels: 87,  price: 4200,
      image: 'images/destination-5.png', credit: 'Image by MadebyNastia from Pixabay' },
    { id: 6, city: 'Байкал',          country: 'Россия', hotels: 64,  price: 7100,
      image: 'images/destination-6.png', credit: 'Image by AndreyKlementyev from Pixabay' },
  ];

  const HOTELS = [
    { id: 1,  name: 'Гранд Отель Европа',  city: 'Санкт-Петербург', stars: 5, rating: 9.4, reviews: 1284, price: 12400, tag: 'Выбор гостей',
      image: 'images/hotel-1.png', credit: 'Image by Nordseher from Pixabay',
      lat: 59.9359, lon: 30.3256,
      amenities: ['spa', 'pool', 'wifi', 'restaurant', 'parking', 'bar'],
      desc: 'Исторический отель в самом сердце Северной столицы. Изысканные номера, авторская кухня и панорамный вид на Невский проспект.' },
    { id: 2,  name: 'Radisson Rosa Khutor', city: 'Сочи',           stars: 5, rating: 9.2, reviews: 2160, price: 9800, tag: '',
      image: 'images/hotel-2.png', credit: 'Image by ChiemSeherin from Pixabay',
      lat: 43.5633, lon: 40.0583,
      amenities: ['spa', 'pool', 'wifi', 'restaurant', 'gym', 'breakfast'],
      desc: 'Курортный отель в Красной Поляне с прямым выходом к подъёмникам. Идеален как для горнолыжного отдыха, так и для летних походов.' },
    { id: 3,  name: 'Four Seasons Moscow', city: 'Москва',          stars: 5, rating: 9.6, reviews: 892,  price: 18500, tag: 'Люкс',
      image: 'images/hotel-3.png', credit: 'Image by Ananta_sarkar from Pixabay',
      lat: 55.7569, lon: 37.6165,
      amenities: ['spa', 'pool', 'wifi', 'restaurant', 'bar', 'gym', 'parking'],
      desc: 'Роскошь в двух шагах от Красной площади. Номера с видом на Кремль, рестораны от мировых шефов и приватный СПА.' },
    { id: 4,  name: 'Корстон Казань',      city: 'Казань',          stars: 4, rating: 8.8, reviews: 1420, price: 6400, tag: '',
      image: 'images/hotel-4.png', credit: 'Image by ChiemSeherin from Pixabay',
      lat: 55.7783, lon: 49.1417,
      amenities: ['pool', 'wifi', 'restaurant', 'gym', 'parking', 'breakfast'],
      desc: 'Современный отель в центре Казани. Просторные номера, бассейн с подогревом и завтрак по системе «шведский стол».' },
    { id: 5,  name: 'Hotel Astoria',       city: 'Санкт-Петербург', stars: 5, rating: 9.1, reviews: 1085, price: 11200, tag: '',
      image: 'images/hotel-5.png', credit: 'Image by YHBae from Pixabay',
      lat: 59.9333, lon: 30.3089,
      amenities: ['spa', 'wifi', 'restaurant', 'bar', 'parking'],
      desc: 'Отель с вековой историей и безупречным сервисом. Собственный ресторан с мишленовской кухней и вид на Исаакиевский собор.' },
    { id: 6,  name: 'Swissôtel Resort',    city: 'Сочи',            stars: 5, rating: 9.0, reviews: 1670, price: 8900, tag: 'Хит сезона',
      image: 'images/hotel-6.png', credit: 'Image by Hans from Pixabay',
      lat: 43.5733, lon: 39.7489,
      amenities: ['spa', 'pool', 'wifi', 'restaurant', 'beach', 'gym'],
      desc: 'Прямо на первой линии Черноморского побережья. Собственный пляж, открытый бассейн и вечерние развлекательные программы.' },
    { id: 7,  name: 'Radisson Kaliningrad', city: 'Калининград',    stars: 4, rating: 8.7, reviews: 620,  price: 5400, tag: '',
      image: 'images/hotel-7.png', credit: 'Image by Hans from Pixabay',
      lat: 54.7205, lon: 20.4964,
      amenities: ['wifi', 'restaurant', 'gym', 'parking', 'breakfast'],
      desc: 'Восстановленное историческое здание в центре города. Сочетание прусской архитектуры и современного комфорта.' },
    { id: 8,  name: 'Байкал Резорт',       city: 'Байкал',          stars: 4, rating: 9.3, reviews: 410,  price: 8600, tag: 'Уединение',
      image: 'images/hotel-8.png', credit: 'Image by jessebridgewater from Pixabay',
      lat: 51.8564, lon: 104.8686,
      amenities: ['spa', 'wifi', 'restaurant', 'parking', 'breakfast', 'pets'],
      desc: 'Эко-отель на берегу самого глубокого озера планеты. Панорамные окна, деревянные интерьеры и полное погружение в природу.' },
    { id: 9,  name: 'Grand Hotel Tverskaya', city: 'Москва',        stars: 4, rating: 8.5, reviews: 980,  price: 7800, tag: '',
      image: 'images/hotel-9.png', credit: 'Image by EjupLila from Pixabay',
      lat: 55.7697, lon: 37.6055,
      amenities: ['wifi', 'restaurant', 'bar', 'gym', 'parking'],
      desc: 'Деловой отель в шаге от станции метро. Скоростной Wi-Fi, переговорные комнаты и завтраки с 6 утра.' },
    { id: 10, name: 'Санаторий Кавказ',    city: 'Кисловодск',      stars: 4, rating: 8.9, reviews: 745,  price: 5900, tag: '',
      image: 'images/hotel-10.png', credit: 'Image by Kasman from Pixabay',
      lat: 43.9036, lon: 42.7167,
      amenities: ['spa', 'pool', 'wifi', 'restaurant', 'gym', 'breakfast'],
      desc: 'Классический санаторий с лечебной минеральной водой. Полный пансион, программы оздоровления и прогулки по Курортному парку.' },
    { id: 11, name: 'Park Inn Kazan',      city: 'Казань',          stars: 3, rating: 8.2, reviews: 1100, price: 3900, tag: '',
      image: 'images/hotel-11.png', credit: 'Image by dirkgauert from Pixabay',
      lat: 55.7838, lon: 49.1214,
      amenities: ['wifi', 'restaurant', 'parking', 'breakfast'],
      desc: 'Уютный отель для деловых поездок и путешествий. Чистые номера, дружелюбный персонал и хорошие завтраки.' },
    { id: 12, name: 'Дом у Моря',          city: 'Сочи',            stars: 3, rating: 8.4, reviews: 530,  price: 4300, tag: '',
      image: 'images/hotel-12.png', credit: 'Image by franky1st from Pixabay',
      lat: 43.5814, lon: 39.7217,
      amenities: ['wifi', 'beach', 'breakfast', 'pets'],
      desc: 'Небольшой семейный отель в 5 минутах от пляжа. Домашняя атмосфера, кухня с местными продуктами и приветливые хозяева.' },
  ];

  const SORT_OPTIONS = [
    { key: 'popular',    label: 'По популярности' },
    { key: 'price-asc',  label: 'Сначала дешёвые' },
    { key: 'price-desc', label: 'Сначала дорогие' },
    { key: 'rating',     label: 'По рейтингу' },
    { key: 'stars',      label: 'По звёздности' },
  ];

  const REVIEWS = [
    { name: 'Елена Морозова', role: 'Путешественница, 42 города', initials: 'ЕМ', stars: 5,
      text: 'Забронировала отель в Петербурге за 5 минут. Цены честные, фото соответствуют реальности, а поддержка ответила за пару минут.' },
    { name: 'Андрей Волков', role: 'Бизнес-путешественник', initials: 'АВ', stars: 5,
      text: 'Часто летаю в командировки — сервис экономит кучу времени. Удобные фильтры, понятное бронирование, моментальное подтверждение.' },
    { name: 'Ольга Тихонова', role: 'Мама двоих детей', initials: 'ОТ', stars: 5,
      text: 'Фильтр по удобствам помог найти отель с бассейном и детской площадкой. Скидка по раннему бронированию приятно удивила.' },
    { name: 'Максим Орлов', role: 'Фотограф', initials: 'МО', stars: 4,
      text: 'Нашёл уединённый отель на Байкале, о котором даже не слышал. Отзывы реальные, рейтинги объективные.' },
  ];

  const FAQ_ITEMS = [
    { q: 'Как забронировать отель?',              a: 'Найдите город через поиск, отфильтруйте отели по цене, звёздности и удобствам, откройте карточку и нажмите «Забронировать». Заполните контактные данные и подтвердите.' },
    { q: 'Нужна ли предоплата?',                  a: 'Большинство отелей работают по системе «оплата при заселении». Точные условия указаны в карточке отеля перед бронированием.' },
    { q: 'Можно ли отменить бронь?',              a: 'Да, условия отмены зависят от тарифа. Стандартно — бесплатная отмена за 24 часа до заселения.' },
    { q: 'Как рассчитывается стоимость?',         a: 'Итоговая цена = стоимость за ночь × количество ночей. Дополнительно могут применяться городской сбор и стоимость доп. услуг.' },
    { q: 'Что делать, если что-то пошло не так?', a: 'Свяжитесь с нашей поддержкой через чат на сайте или по телефону. Мы на связи 24/7.' },
    { q: 'Есть ли программа лояльности?',         a: 'Да. После третьей брони вы получаете статус Silver (3% кэшбэка), после десятой — Gold (7%).' },
  ];

  const MARQUEE_ITEMS = [
    'Бесплатная отмена', 'Отели 5 звёзд', 'Мгновенное подтверждение',
    'Поддержка 24/7', 'Кэшбэк до 7%', 'Более 12 000 отелей',
  ];

  const HERO_SLIDES = [
    { gradient: 'linear-gradient(160deg, #264653 0%, #2a9d8f 100%)' },
    { gradient: 'linear-gradient(160deg, #e9b949 0%, #d95d39 100%)' },
    { gradient: 'linear-gradient(160deg, #1d3557 0%, #3a7ca5 100%)' },
  ];

  return {
    AMENITY_LABELS, DESTINATIONS, HOTELS, SORT_OPTIONS,
    REVIEWS, FAQ_ITEMS, MARQUEE_ITEMS, HERO_SLIDES,
  };
})();