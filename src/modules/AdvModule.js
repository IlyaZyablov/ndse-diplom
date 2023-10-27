import Advertisements from '../models/ads_schema.js';

export default class AdvModule {
  static findAll() {
    return new Promise((resolve, reject) => {
      Advertisements.find({ isDeleted: false }).select('-__v').then(
        result => {
          resolve({ status: 'ok', data: result });
        },
        error => {
          reject(error);
          console.log('AdvModule.findAll ERROR');
          console.error(error);
        },
      );
    });
  }

  static async find(params) {
    const advertisements = await this.findAll();

    return new Promise(resolve => {
      let result = null;

      // если проверка по id объявления
      if (Object.prototype.hasOwnProperty.call(params, 'id')) {
        result = advertisements.data.filter(el => el._id.toHexString() === params.id);
      } else {
        result = advertisements.data.filter(el => {
          const validShortText = new RegExp(params.shortText, 'i');
          const validDesc = new RegExp(params.description, 'i');

          const tagsArray = [...params.tags.split(',').map(tag => tag.trim())];

          let tagsIncluded = true;
          for (let i = 0; i < tagsArray.length; i++) {
            const tag = tagsArray[i];
            if (!el.tags.includes(tag)) {
              tagsIncluded = false;
            }
          }

          return el.user.id.toHexString() === params.userId
            && validShortText.test(el.shortText)
            && validDesc.test(el.description)
            && tagsIncluded;
        });
      }

      if (result && result.length > 0) {
        resolve({ status: 'ok', data: result });
      } else {
        resolve({ status: 'error', error: 'Объявление по заданной информации не найдено!' });
      }
    });
  }

  static create(data) {
    const {
      shortText, description, images, user, tags,
    } = data;

    return new Promise((resolve, reject) => {
      const newAdv = new Advertisements({
        shortText,
        description,
        images,
        user,
        tags,
        isDeleted: false,
      });

      newAdv.save()
        .then(
          () => {
            resolve({ status: 'ok', data: newAdv });
          },
          err => {
            reject({ status: 'error', error: err });
          },
        );
    });
  }

  static remove(data) {
    const { id, email } = data;

    return new Promise((resolve, reject) => {
      Advertisements.findOne({ _id: id, isDeleted: false }).select('-__v').then(
        result => {
          if (result.user.email !== email) {
            resolve({ status: 'error', error: 'Вы не можете удалять объявления, которые опубликованы не Вами!' });
            return;
          }

          Advertisements.findByIdAndUpdate(id, { isDeleted: true }).then(() => {
            resolve({ status: 'ok' });
          }, err => {
            reject(err);
            console.log('AdvModule.findAll ERROR');
            console.error(err);
          });
        },
        error => {
          reject(error);
          console.log('AdvModule.findAll ERROR');
          console.error(error);
        },
      );
    });
  }
}
