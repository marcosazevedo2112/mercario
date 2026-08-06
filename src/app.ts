import Express from 'express';
import routes from './routes';
import session from 'express-session';
import env from './config/env';

const app = Express();

app.use(Express.json());

app.use(
  session({
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 dias
      httpOnly: true,
      domain: process.env.COOKIE_DOMAIN || 'localhost', // Para desenvolvimento
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    },
  }),
);

app.use(routes);

console.log('App initialized');

export default app;
