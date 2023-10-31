import pkg from 'bcryptjs';
import Users from '../models/users_schema.js';

const { hashSync, genSaltSync, compareSync } = pkg;

export default class UserModule {
  static create(data) {
    const {
      email, password, name, contactPhone,
    } = data;

    return new Promise((resolve, reject) => {
      Users.findOne({ email })
        .then(
          user => {
            if (user) {
              resolve({ status: 'error', error: 'Пользователь уже существует!' });
              return;
            }

            const newUser = new Users({
              email,
              passwordHash: hashSync(password, genSaltSync(3)),
              name,
              contactPhone: contactPhone || '',
            });

            newUser.save();

            resolve({ status: 'ok', data: newUser });
          },
          err => {
            reject(err);
            console.log('UserModule.create ERROR');
            console.error(err);
          },
        );
    });
  }

  static login(data) {
    const { email, password } = data;

    return new Promise((resolve, reject) => {
      Users.findOne({ email })
        .then(
          user => {
            if (!user) {
              resolve({ status: 'error', error: 'Пользователь с указанным email не существует!' });
              return;
            }

            if (!compareSync(password, user.passwordHash)) {
              resolve({ status: 'error', error: 'Неверный email или пароль!' });
              return;
            }

            resolve({ status: 'ok', data: user });
          },
          err => {
            reject(err);
            console.log('UserModule.login ERROR');
            console.error(err);
          },
        );
    });
  }

  static findByEmail(email) {
    return new Promise((resolve, reject) => {
      Users.findOne({ email })
        .then(
          user => {
            if (user) {
              resolve(user);
              return;
            }

            resolve(null);
          },
          err => {
            reject(err);
            console.log('UserModule.findByEmail ERROR');
            console.error(err);
          },
        );
    });
  }

  static findById(id) {
    return new Promise((resolve, reject) => {
      Users.findById(id)
        .then(
          user => {
            if (user) {
              resolve(user);
              return;
            }

            resolve(null);
          },
          err => {
            reject(err);
            console.log('UserModule.findById ERROR');
            console.error(err);
          },
        );
    });
  }

  static findAll() {
    return new Promise((resolve, reject) => {
      Users.find().select('_id name').then(
        result => {
          resolve({ status: 'ok', data: result });
        },
        error => {
          reject(error);
          console.log('UserModule.findAll ERROR');
          console.error(error);
        },
      );
    });
  }
}
