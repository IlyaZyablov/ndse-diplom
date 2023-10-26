import multer from 'multer';

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'src/public/adv');
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
