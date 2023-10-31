import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import moment from 'moment';
import AdvModule from '../modules/AdvModule.js';
import UserModule from '../modules/UserModule.js';
import uploadFile from '../middleware/file.js';

moment.locale('ru');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const advRouter = express.Router();

function deleteImages(images) {
  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    fs.unlinkSync(path.join(__dirname, '..', `public${img}`), deleteError => {
      if (deleteError) console.error(deleteError);
    });
  }
}

advRouter.get('/advertisements', async (req, res) => {
  try {
    const advertisements = await AdvModule.findAll();

    const advertisementsRender = advertisements.data.map(el => {
      const parsedTime = moment(el.createdAt).startOf('hour').fromNow();
      return { ...el._doc, createdAt: parsedTime };
    });

    res.render('adv/index', {
      title: 'Список объявлений',
      list: advertisementsRender,
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

advRouter.post('/advertisements', async (req, res) => {
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

      let tagsArray = [];
      if (tags) {
        tagsArray = [...tags.split(',').map(el => el.trim())];
      }

      const user = await UserModule.findByEmail(req.session.passport.user);

      const images = [];

      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        images.push(`/uploads/${user._id}/${file.filename}`);
      }

      const result = await AdvModule.create({
        shortText,
        description: description || '',
        images,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          contactPhone: user.contactPhone,
        },
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

advRouter.get('/advertisements/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const advertisement = await AdvModule.find({ id });

    if (advertisement.status === 'ok') {
      res.render('adv/view', {
        title: 'Просмотр объявления',
        adv: advertisement.data[0],
        createAdvBtn: false,
        authBtn: !req.isAuthenticated(),
      });
    } else {
      res.render('errors/404', {
        title: 'Ошибка!',
        text: advertisement.error,
        authBtn: !req.isAuthenticated(),
      });
    }
  } catch (error) {
    console.error(error);
    res.render('errors/404', {
      title: 'Ошибка!',
      text: 'Объявление не найдено!',
      authBtn: !req.isAuthenticated(),
    });
  }
});

advRouter.get('/search', async (req, res) => {
  console.log(req.query);
  const {
    shortText, description, tags, userId,
  } = req.query;

  if (!shortText || !description || !tags || !userId) {
    res.render('errors/404', {
      title: 'Ошибка!',
      text: 'Не все аргументы поиска указаны! (shortText, description, tags, userId)',
      authBtn: !req.isAuthenticated(),
    });
  }

  try {
    const advertisement = await AdvModule.find({
      shortText, description, tags, userId,
    });

    if (advertisement.status === 'ok') {
      res.render('adv/view', {
        title: 'Просмотр объявления',
        adv: advertisement.data[0],
        createAdvBtn: false,
        authBtn: !req.isAuthenticated(),
      });
    } else {
      res.render('errors/404', {
        title: 'Ошибка!',
        text: advertisement.error,
        authBtn: !req.isAuthenticated(),
      });
    }
  } catch (error) {
    console.error(error);
    res.render('errors/404', {
      title: 'Ошибка!',
      text: 'Объявление не найдено!',
      authBtn: !req.isAuthenticated(),
    });
  }
});

advRouter.post('/advertisements/delete/:id', async (req, res) => {
  const { id } = req.params;

  try {
    if (!req.isAuthenticated()) {
      res.render('errors/404', {
        title: 'Ошибка!',
        text: 'Для удаления этого объявления требуется авторизация!',
        authBtn: !req.isAuthenticated(),
      });
      return;
    }

    const advertisement = await AdvModule.remove({ id, email: req.session.passport.user });

    if (advertisement.status === 'ok') {
      res.redirect('/api/advertisements');
    } else {
      res.render('errors/404', {
        title: 'Ошибка!',
        text: advertisement.error,
        authBtn: !req.isAuthenticated(),
      });
    }
  } catch (error) {
    console.error(error);
    res.render('errors/404', {
      title: 'Ошибка!',
      text: 'Объявление не найдено!',
      authBtn: !req.isAuthenticated(),
    });
  }
});

export default advRouter;
