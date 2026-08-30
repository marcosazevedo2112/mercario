import Express from 'express';
import path from 'path';
import routes from './routes';
import session from 'express-session';
import env from './config/env';

const app = Express();

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static
app.use(Express.static(path.join(__dirname, '..', 'public')));
app.use('/public', Express.static(path.join(__dirname, 'public')));

// Parsers
app.use(Express.json());
app.use(Express.urlencoded({extended: true}));

app.use(
  session({
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    },
  }),
);

// Flash middleware
app.use((req, _res, next) => {
  const s = req.session as unknown as Record<string, unknown>;
  if (s.flash) {
    (req as unknown as Record<string, unknown>).flash = s.flash;
    delete s.flash;
  }
  next();
});

// Make session user available in views
app.use((req, res, next) => {
  res.locals.user = req.session?.user ?? null;
  res.locals.flash = (req as unknown as Record<string, unknown>).flash ?? null;
  next();
});

app.use(routes);

export default app;
