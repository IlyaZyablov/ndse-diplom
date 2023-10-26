import express from 'express';
import apiRouter from './api.js';

const indexRouter = express.Router();

indexRouter.use('/api', apiRouter);

indexRouter.get('/', (req, res) => {
  res.render('index', {
    title: 'Главная',
    authBtn: !req.isAuthenticated(),
  });
});

export default indexRouter;
