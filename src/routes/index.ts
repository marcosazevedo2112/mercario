import {Router} from 'express';
import apiRouter from './api';
import pagesRouter from './pages';

const routes = Router();

routes.use('/api', apiRouter);
routes.use('/', pagesRouter);

export default routes;
