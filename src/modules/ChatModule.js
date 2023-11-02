/* eslint-disable consistent-return */
import moment from 'moment';
import Chat from '../models/chat_schema.js';
import MessageModule from './MessageModule.js';
import UserModule from './UserModule.js';

moment.locale('ru');

export default class ChatModule {
  static async create(users) {
    try {
      const newChat = new Chat({
        users,
      });

      await newChat.save();

      return new Promise(resolve => {
        resolve(newChat);
      });
    } catch (error) {
      console.log('[ERROR]: ChatModule.create -');
      console.error(error);
    }
  }

  static findAll() {
    return new Promise((resolve, reject) => {
      Chat.find().select('users').then(
        result => {
          resolve({ status: 'ok', data: result });
        },
        error => {
          reject(error);
          console.log('ChatModule.findAll ERROR');
          console.error(error);
        },
      );
    });
  }

  static async find(users) {
    try {
      const chats = await this.findAll();

      return new Promise(resolve => {
        if (chats.data.length === 0) {
          resolve(null);
          return;
        }

        const result = chats.data.find(chat => chat.users.includes(users[0]) && chat.users.includes(users[1]));

        if (!result) {
          resolve(null);
        } else {
          resolve(result);
        }
      });
    } catch (error) {
      console.log('[ERROR]: ChatModule.create -');
      console.error(error);
    }
  }

  static async getHistory(chatID) {
    try {
      const chat = await Chat.findById(chatID).select('messages');

      const messages = [];
      for (let i = 0; i < chat.messages.length; i++) {
        const message = chat.messages[i];
        const findMessage = await MessageModule.find(message);
        messages.push(findMessage.data);
      }

      return new Promise(resolve => {
        if (!chat.messages.length) {
          resolve([]);
          return;
        }

        this.parseMessages(messages).then(result => {
          resolve(result);
        });
      });
    } catch (error) {
      console.log('[ERROR]: ChatModule.getHistory -');
      console.error(error);
    }
  }

  static async parseMessages(messages) {
    const result = [];
    for (let i = 0; i < messages.length; i++) {
      const user = await UserModule.findById(messages[i].author);
      result.push({
        name: user.name,
        date: moment(messages[i].sentAt).startOf('hour').fromNow(),
        text: messages[i].text,
      });
    }

    return new Promise(resolve => {
      resolve(result);
    });
  }

  static async sendMessage(chatID, email, text) {
    try {
      const user = await UserModule.findByEmail(email);

      const chat = await Chat.findById(chatID).select('messages');

      const newMessage = await MessageModule.create(user._id, text);

      chat.messages.push(newMessage);

      await Chat.updateOne(
        { _id: chatID },
        { $push: { messages: newMessage._id } },
      );

      return new Promise(resolve => {
        this.parseMessages([chat.messages[chat.messages.length - 1]]).then(result => {
          resolve(result[0]);
        });
      });
    } catch (error) {
      console.log('[ERROR]: ChatModule.sendMessage -');
      console.error(error);
    }
  }
}
