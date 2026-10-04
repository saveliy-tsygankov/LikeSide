(function () {
'use strict';

const { useState } = React;
const { mountPage } = window.LakeSide;

function LoginPage() {
  const [tab, setTab] = useState('login');

  const switchTab = (t) => {
    if (t === tab) return;
    setTab(t);
  };

  return (
    <section className="auth">
      <div className="auth__backdrop"></div>

      <div className="container">
        <div className="auth__grid">
          <div className="auth__promo reveal reveal--left">
            <a href="index.html" className="navbar__logo" style={{ marginBottom: 32 }}>
              <img src="images/logo.png" alt="LakeSide" className="navbar__logo-img" />
              <span className="navbar__logo-text">LAKE<span>SIDE</span></span>
            </a>

            <h1 className="auth__title">
              Путешествуйте <em>выгоднее</em>
            </h1>
            <p className="auth__text">
              Войдите в личный кабинет, чтобы видеть свои брони, копить баллы
              и получать персональные скидки.
            </p>

            <ul className="auth__features">
              <li><i className="fa-solid fa-circle-check"></i> Кэшбэк до 7% баллами</li>
              <li><i className="fa-solid fa-circle-check"></i> Мгновенная отмена брони</li>
              <li><i className="fa-solid fa-circle-check"></i> Персональные подборки</li>
              <li><i className="fa-solid fa-circle-check"></i> Ранний доступ к акциям</li>
            </ul>
          </div>

          <div className="auth__panel reveal reveal--right">
            <div className="auth__panel-inner">
              <div className="auth-tabs">
                <button
                  type="button"
                  className={`auth-tab ${tab === 'login' ? 'is-active' : ''}`}
                  onClick={() => switchTab('login')}
                >
                  Вход
                </button>
                <button
                  type="button"
                  className={`auth-tab ${tab === 'register' ? 'is-active' : ''}`}
                  onClick={() => switchTab('register')}
                >
                  Регистрация
                </button>
              </div>

              <div key={tab} className="auth-form-wrap">
                {tab === 'login' ? <LoginForm /> : <RegisterForm />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function LoginForm() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [status, setStatus] = useState({ type: '', text: '' });

  const handle = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    $(e.target).removeClass('has-error');
    $(e.target).siblings('.form__error').removeClass('is-visible').text('');
  };

  const submit = (e) => {
    e.preventDefault();
    let ok = true;

    $('#login-form .form__input').each(function () {
      const $f = $(this);
      const n = $f.attr('name');
      const v = $.trim($f.val());
      let err = '';

      if (!v) err = 'Обязательное поле';
      else if (n === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) err = 'Некорректный email';
      else if (n === 'password' && v.length < 6) err = 'Минимум 6 символов';

      if (err) {
        ok = false;
        $f.addClass('has-error');
        $f.siblings('.form__error').addClass('is-visible').text(err);
      }
    });

    if (!ok) {
      $('#login-form').stop(true)
        .animate({ marginLeft: '-6px' }, 60)
        .animate({ marginLeft: '6px' }, 60)
        .animate({ marginLeft: '0' }, 60);
      return;
    }

    setStatus({ type: 'success', text: 'Входим…' });
    setTimeout(() => {
      setStatus({ type: 'success', text: 'Добро пожаловать в LakeSide!' });
    }, 800);
  };

  return (
    <form className="auth-form" id="login-form" onSubmit={submit} noValidate>
      <h2 className="auth-form__title">Вход в аккаунт</h2>
      <p className="auth-form__subtitle">Рады видеть вас снова!</p>

      <div className="form__group">
        <label className="form__label" htmlFor="login-email">Email <span>*</span></label>
        <input
          id="login-email" name="email" type="email" className="form__input"
          placeholder="you@example.com"
          value={form.email} onChange={handle}
        />
        <span className="form__error"></span>
      </div>

      <div className="form__group">
        <label className="form__label" htmlFor="login-password">Пароль <span>*</span></label>
        <input
          id="login-password" name="password" type="password" className="form__input"
          placeholder="••••••••"
          value={form.password} onChange={handle}
        />
        <span className="form__error"></span>
      </div>

      <div className="auth-form__row">
        <label className="checkbox-row checkbox-row--sm">
          <input type="checkbox" defaultChecked />
          <span className="amenity__check"></span>
          <span>Запомнить меня</span>
        </label>
        <a href="#" className="auth-form__link">Забыли пароль?</a>
      </div>

      <button type="submit" className="btn btn--primary" style={{ width: '100%' }}>
        <i className="fa-solid fa-right-to-bracket"></i> Войти
      </button>

      {status.text && (
        <div className={`booking__status is-${status.type}`}>{status.text}</div>
      )}
    </form>
  );
}

function RegisterForm() {
  const [form, setForm] = useState({ name: '', email: '', password: '', agree: true });
  const [status, setStatus] = useState({ type: '', text: '' });

  const handle = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
    $(e.target).removeClass('has-error');
    $(e.target).siblings('.form__error').removeClass('is-visible').text('');
  };

  const submit = (e) => {
    e.preventDefault();
    let ok = true;

    $('#register-form .form__input').each(function () {
      const $f = $(this);
      const n = $f.attr('name');
      const v = $.trim($f.val());
      let err = '';

      if (!v) err = 'Обязательное поле';
      else if (n === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) err = 'Некорректный email';
      else if (n === 'password' && v.length < 6) err = 'Минимум 6 символов';
      else if (n === 'name' && v.length < 2) err = 'Минимум 2 символа';

      if (err) {
        ok = false;
        $f.addClass('has-error');
        $f.siblings('.form__error').addClass('is-visible').text(err);
      }
    });

    if (!form.agree) {
      ok = false;
      setStatus({ type: 'error', text: 'Необходимо согласие с условиями' });
    }

    if (!ok) {
      $('#register-form').stop(true)
        .animate({ marginLeft: '-6px' }, 60)
        .animate({ marginLeft: '6px' }, 60)
        .animate({ marginLeft: '0' }, 60);
      return;
    }

    setStatus({ type: 'success', text: 'Регистрируем…' });
    setTimeout(() => {
      setStatus({ type: 'success', text: 'Аккаунт создан! Проверьте почту для подтверждения.' });
    }, 900);
  };

  return (
    <form className="auth-form" id="register-form" onSubmit={submit} noValidate>
      <h2 className="auth-form__title">Создать аккаунт</h2>
      <p className="auth-form__subtitle">Первая бронь — со скидкой 10%</p>

      <div className="form__group">
        <label className="form__label" htmlFor="reg-name">Имя <span>*</span></label>
        <input
          id="reg-name" name="name" type="text" className="form__input"
          placeholder="Как к вам обращаться?"
          value={form.name} onChange={handle}
        />
        <span className="form__error"></span>
      </div>

      <div className="form__group">
        <label className="form__label" htmlFor="reg-email">Email <span>*</span></label>
        <input
          id="reg-email" name="email" type="email" className="form__input"
          placeholder="you@example.com"
          value={form.email} onChange={handle}
        />
        <span className="form__error"></span>
      </div>

      <div className="form__group">
        <label className="form__label" htmlFor="reg-password">Пароль <span>*</span></label>
        <input
          id="reg-password" name="password" type="password" className="form__input"
          placeholder="Минимум 6 символов"
          value={form.password} onChange={handle}
        />
        <span className="form__error"></span>
      </div>

      <label className="checkbox-row checkbox-row--sm">
        <input type="checkbox" name="agree" checked={form.agree} onChange={handle} />
        <span className="amenity__check"></span>
        <span>Согласен с условиями и политикой конфиденциальности</span>
      </label>

      <button type="submit" className="btn btn--primary" style={{ width: '100%', marginTop: 18 }}>
        <i className="fa-solid fa-user-plus"></i> Зарегистрироваться
      </button>

      {status.text && (
        <div className={`booking__status is-${status.type}`}>{status.text}</div>
      )}
    </form>
  );
}

mountPage(LoginPage);

})();