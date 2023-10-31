import express from 'express';
import UserModule from '../modules/UserModule.js';
import ChatModule from '../modules/ChatModule.js';

const chatsRouter = express.Router();

chatsRouter.get('/chats/:id', async (req, res) => {
  const { id } = req.params;

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

    // if (id === user._id.toHexString()) {
    //   res.render('errors/404', {
    //     title: 'Ошибка!',
    //     text: 'Вы не можете обмениваться сообщениями с самим собой!',
    //     authBtn: !req.isAuthenticated(),
    //   });
    //   return;
    // }

    const target = await UserModule.findById(id);

    if (!target) {
      res.render('errors/404', {
        title: 'Ошибка!',
        text: 'Пользователь не существует!',
        authBtn: !req.isAuthenticated(),
      });
      return;
    }

    let chat = await ChatModule.find([user._id.toHexString(), id]);

    if (!chat) {
      chat = await ChatModule.create([user._id.toHexString(), id]);
      res.render('chats/index', {
        title: `Сообщения с ${target.name}`,
        messages: [],
      });
      return;
    }

    const chatHistory = await ChatModule.getHistory(chat._id);

    console.log(chatHistory);

    res.render('chats/index', {
      title: `Сообщения с ${target.name}`,
      messages: chatHistory,
    });
  } catch (error) {
    console.error(error);
    res.render('errors/404', {
      title: 'Ошибка!',
      text: 'Не удалось загрузить чат с этим пользователем!',
      authBtn: !req.isAuthenticated(),
    });
  }
});

export default chatsRouter;
