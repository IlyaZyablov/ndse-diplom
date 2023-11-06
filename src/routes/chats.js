import express from 'express';
import UserModule from '../modules/UserModule.js';
import ChatModule from '../modules/ChatModule.js';

const chatsRouter = express.Router();

chatsRouter.post('/startchat/:userID', async (req, res) => {
  const { userID } = req.params;

  try {
    if (!req.isAuthenticated()) {
      res.render('errors/404', {
        title: 'Ошибка!',
        text: 'Для обмена сообщениями требуется авторизация!',
        authBtn: !req.isAuthenticated(),
      });
      return;
    }

    const user = await UserModule.findByEmail(req.session.passport.user);

    if (userID === user._id.toHexString()) {
      res.render('errors/404', {
        title: 'Ошибка!',
        text: 'Вы не можете обмениваться сообщениями с самим собой!',
        authBtn: !req.isAuthenticated(),
      });
      return;
    }

    const target = await UserModule.findById(userID);

    if (!target) {
      res.render('errors/404', {
        title: 'Ошибка!',
        text: 'Пользователь не существует!',
        authBtn: !req.isAuthenticated(),
      });
      return;
    }

    let chat = await ChatModule.find([user._id.toHexString(), userID]);

    if (!chat) {
      chat = await ChatModule.create([user._id.toHexString(), userID]);
    }

    res.redirect(`/api/chats/${chat._id}`);
  } catch (error) {
    console.log('[ERROR]: startChat error');
    console.error(error);
    res.render('errors/404', {
      title: 'Ошибка!',
      text: 'Не удалось загрузить чат с этим пользователем!',
      authBtn: !req.isAuthenticated(),
    });
  }
});

chatsRouter.get('/chats/:chatID', async (req, res) => {
  const { chatID } = req.params;

  try {
    if (!req.isAuthenticated()) {
      res.render('errors/404', {
        title: 'Ошибка!',
        text: 'Для обмена сообщениями требуется авторизация!',
        authBtn: !req.isAuthenticated(),
      });
      return;
    }

    const chatHistory = await ChatModule.getHistory(chatID);

    res.render('chats/index', {
      title: 'Чат',
      messages: chatHistory,
    });
  } catch (error) {
    console.log('[ERROR]: getChat error');
    console.error(error);
    res.render('errors/404', {
      title: 'Ошибка!',
      text: 'Не удалось загрузить чат с этим пользователем!',
      authBtn: !req.isAuthenticated(),
    });
  }
});

export default chatsRouter;
