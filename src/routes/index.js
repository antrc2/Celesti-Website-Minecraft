import fs from 'fs';
import path from 'path';

const loadRoutes = (app) => {
  const routesPath = path.join(path.resolve(), 'src/routes');

  // Đọc các folder (v0, v1, v2, ...) bên trong thư mục /routes/
  fs.readdirSync(routesPath).forEach((folder) => {
    const folderPath = path.join(routesPath, folder);
    if (fs.lstatSync(folderPath).isDirectory()) {
      import(`./${folder}/index.js`).then((route) => {
        app.use(`/api/${folder}`, route.default);
        console.log(`Loaded routes for /api/${folder}`);
      });
    }
  });
};

export default loadRoutes;