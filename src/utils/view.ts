import ejs from 'ejs';
import path from 'path';
import {Response} from 'express';

export function renderPage(
  res: Response,
  view: string,
  data: Record<string, unknown> = {},
) {
  const viewsDir = path.join(__dirname, '../', 'views');
  const viewPath = path.join(viewsDir, view + '.ejs');
  const layoutPath = path.join(viewsDir, 'layouts', 'main.ejs');
  const reqAny = (res as unknown as {req: {originalUrl?: string}}).req;
  const currentPath: string = (reqAny?.originalUrl || '').split('?')[0];
  const baseData = {
    ...data,
    currentPath,
    user: (res.locals as Record<string, unknown>).user ?? null,
    flash: (res.locals as Record<string, unknown>).flash ?? null,
  };
  ejs.renderFile(viewPath, baseData, (err: Error | null, body: string) => {
    if (err) {
      console.error('EJS render error', err);
      return res.status(500).send('Erro ao renderizar página');
    }
    const layoutData = {
      ...baseData,
      body,
      title: (data as {title?: string}).title,
      hideNav: (data as {hideNav?: boolean}).hideNav,
    };
    ejs.renderFile(layoutPath, layoutData, (err2: Error | null, html: string) => {
      if (err2) {
        console.error('Layout render error', err2);
        return res.status(500).send('Erro ao renderizar layout');
      }
      res.send(html);
    });
  });
}
