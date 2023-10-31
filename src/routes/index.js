import express from 'express';
import userRouter from './users.js';
import advRouter from './ads.js';
import chatsRouter from './chats.js';

const indexRouter = express.Router();

indexRouter.use('/api', userRouter);
indexRouter.use('/api', advRouter);
indexRouter.use('/api', chatsRouter);

indexRouter.get('/', (req, res) => {
  res.render('index', {
    title: 'Главная',
    authBtn: !req.isAuthenticated(),
  });
});

export default indexRouter;
