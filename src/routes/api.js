import express from 'express';
import passport from 'passport';
import { Strategy } from 'passport-local';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import UserModule from '../modules/UserModule.js';
import AdvModule from '../modules/AdvModule.js';
import uploadFile from '../middleware/file.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const apiRouter = express.Router();

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

apiRouter.get('/signup', (req, res) => {
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

apiRouter.post('/signup', passport.authenticate('register', {
  successRedirect: '/',
  failureRedirect: '/api/signup',
  failureMessage: true,
}));

// АВТОРИЗАЦИЯ

apiRouter.get('/signin', (req, res) => {
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

apiRouter.post('/signin', passport.authenticate('login', {
  successRedirect: '/',
  failureRedirect: '/api/signin',
  failureMessage: true,
}));

// ОБЪЯВЛЕНИЯ
function deleteImages(images) {
  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    fs.unlinkSync(path.join(__dirname, '..', `public/adv/${img}`), deleteError => {
      if (deleteError) console.error(deleteError);
    });
  }
}

apiRouter.get('/advertisements', async (req, res) => {
  try {
    const advertisements = await AdvModule.findAll();

    res.render('adv/index', {
      title: 'Список объявлений',
      list: advertisements.data,
      createAdvBtn: req.isAuthenticated(),
      authBtn: !req.isAuthenticated(),
    });
  } catch (error) {
    console.error(error);
    res.render('errors/404', {
      title: 'Ошибка!',
      text: 'Ошибка при загрузке объявлений!',
      authBtn: !req.isAuthenticated(),
    });
  }
});

apiRouter.post('/advertisements', async (req, res) => {
  try {
    const uploadImages = uploadFile.array('images', 10);

    uploadImages(req, res, async err => {
      if (err) {
        res.render('errors/404', {
          title: 'Ошибка!',
          text: err,
          authBtn: !req.isAuthenticated(),
        });
        return;
      }

      const { shortText, description, tags } = req.body;

      const images = [];

      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        images.push(file.filename);
      }

      let tagsArray = [];
      if (tags) {
        tagsArray = [...tags.split(',').map(el => el.trim())];
      }

      const user = await UserModule.findByEmail(req.session.passport.user);

      const result = await AdvModule.create({
        shortText,
        description: description || '',
        images,
        userId: user._id,
        tags: tagsArray,
      });

      if (result.status === 'error') {
        deleteImages(images);

        res.render('errors/404', {
          title: 'Ошибка!',
          text: result.error,
          authBtn: !req.isAuthenticated(),
        });
        return;
      }

      res.redirect('/api/advertisements');
    });
  } catch (error) {
    console.error(error);
    res.render('errors/404', {
      title: 'Ошибка!',
      text: 'Ошибка при создании объявления!',
      authBtn: !req.isAuthenticated(),
    });
  }
});

export default apiRouter;
