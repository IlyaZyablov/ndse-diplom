/* eslint-disable consistent-return */
import Message from '../models/message_schema.js';

export default class MessageModule {
  static async create(author, text) {
    try {
      const newMessage = new Message({
        author,
        text,
      });

      await newMessage.save();

      return new Promise(resolve => {
        resolve(newMessage);
      });
    } catch (error) {
      console.log('[ERROR]: MessageModule.create -');
      console.error(error);
    }
  }

  static find(id) {
    return new Promise((resolve, reject) => {
      Message.findById(id).then(
        result => {
          resolve({ status: 'ok', data: result });
        },
        error => {
          reject(error);
          console.log('MessageModule.find ERROR');
          console.error(error);
        },
      );
    });
  }
}
