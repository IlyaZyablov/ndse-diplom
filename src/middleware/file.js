import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import UserModule from '../modules/UserModule.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  async destination(req, file, cb) {
    const user = await UserModule.findByEmail(req.session.passport.user);

    fs.stat(path.join(__dirname, '..', `public/uploads/${user._id}`), err => {
      if (err?.code === 'ENOENT') {
        fs.mkdir(path.join(__dirname, '..', `public/uploads/${user._id}`), error => {
          if (error && error.code !== 'EEXIST') {
            console.log('mkdirSync MIDDLEWARE ERROR');
            console.error(error);
            cb(error, false);
            return;
          }

          cb(null, `src/public/uploads/${user._id}`);
        });
      } else {
        cb(null, `src/public/uploads/${user._id}`);
      }
    });
  },
  filename(req, file, cb) {
    if (!file.originalname.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/)) {
      cb('Можно загружать только картинки!', false);
    } else {
      cb(null, `${Date.now()}-${file.originalname}`);
    }
  },
});

const uploadFile = multer({ storage });

export default uploadFile;
