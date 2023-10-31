import express from 'express';
import passport from 'passport';
import { Strategy } from 'passport-local';
import UserModule from '../modules/UserModule.js';

const userRouter = express.Router();

const register = async (req, email, password, done) => {
  try {
    const result = await UserModule.create({
      email,
      password,
      name: req.body.name,
      contactPhone: req.body.contactPhone,
    });

    if (result.status === 'error') {
      done(null, false, {
        message: result.error,
      });
      return;
    }

    done(null, result.data);
  } catch (error) {
    done(error);
    console.log(error);
  }
};

const registerOptions = {
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true,
};

passport.use('register', new Strategy(registerOptions, register));

const login = async (email, password, done) => {
  try {
    const result = await UserModule.login({ email, password });

    if (result.status === 'error') {
      done(null, false, {
        message: result.error,
      });
      return;
    }

    done(null, result.data);
  } catch (error) {
    done(error);
    console.log(error);
  }
};

const loginOptions = {
  usernameField: 'email',
  passwordField: 'password',
};

passport.use('login', new Strategy(loginOptions, login));

passport.serializeUser((user, done) => {
  done(null, user.email);
});

passport.deserializeUser(async (email, done) => {
  try {
    const user = await UserModule.findByEmail(email);

    done(null, user);
  } catch (error) {
    done(error);
    console.log(error);
  }
});

// РЕГИСТРАЦИЯ

userRouter.get('/signup', (req, res) => {
  let errorText = '';

  if (req.session.messages) {
    errorText = req.session.messages[0];
    req.session.messages = [];
  }

  res.render('users/signup', {
    title: 'Регистрация',
    errorText,
  });
});

userRouter.post('/signup', passport.authenticate('register', {
  successRedirect: '/',
  failureRedirect: '/api/signup',
  failureMessage: true,
}));

// АВТОРИЗАЦИЯ

userRouter.get('/signin', (req, res) => {
  let errorText = '';

  if (req.session.messages) {
    errorText = req.session.messages[0];
    req.session.messages = [];
  }

  res.render('users/signin', {
    title: 'Авторизация',
    errorText,
  });
});

userRouter.post('/signin', passport.authenticate('login', {
  successRedirect: '/',
  failureRedirect: '/api/signin',
  failureMessage: true,
}));

userRouter.get('/users', async (req, res) => {
  try {
    const users = await UserModule.findAll();

    res.render('users/list', {
      title: 'Список пользователей',
      list: users.data,
      authBtn: !req.isAuthenticated(),
    });
  } catch (error) {
    console.error(error);
    res.render('errors/404', {
      title: 'Ошибка!',
      text: 'Ошибка при загрузке списка пользователей!',
      authBtn: !req.isAuthenticated(),
    });
  }
});

export default userRouter;
