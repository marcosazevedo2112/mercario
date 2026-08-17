import Express from 'express';
import path from 'path';
import routes from './routes';
import session from 'express-session';
import env from './config/env';

const app = Express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

app.use(Express.json());
app.use(Express.urlencoded({extended: true}));
app.use(Express.static(path.join(__dirname, '..', 'public')));

app.use(
  session({
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: true,
      domain: process.env.COOKIE_DOMAIN || 'localhost',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    },
  }),
);

app.use(routes);

console.log('App initialized');

export default app;
