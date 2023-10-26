import Advertisements from '../models/ads_schema.js';

export default class AdvModule {
  static findAll() {
    return new Promise((resolve, reject) => {
      Advertisements.find().select('-__v').then(
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

  static create(data) {
    const {
      shortText, description, images, userId, tags,
    } = data;

    return new Promise((resolve, reject) => {
      const newAdv = new Advertisements({
        shortText,
        description,
        images,
        userId,
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
}
