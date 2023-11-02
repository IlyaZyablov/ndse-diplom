import express from 'express';
import { config } from 'dotenv';
import mongoose from 'mongoose';
import passport from 'passport';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import { Server } from 'socket.io';
import indexRouter from './routes/index.js';
import ChatModule from './modules/ChatModule.js';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.urlencoded());
app.set('view engine', 'ejs');
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
app.set('views', path.join(__dirname, '/views'));

const sessionMiddleware = session({ secret: 'SECRET' });
app.use(sessionMiddleware);

app.use(passport.initialize());
app.use(passport.session());

app.use('/', indexRouter);

io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, next);
});

io.on('connection', socket => {
  const { id } = socket;
  console.log(`Socket connected: ${id}`);

  const { roomName } = socket.handshake.query;
  socket.join(roomName);

  socket.on('message-to-chat', async msg => {
    const newMessage = await ChatModule.sendMessage(roomName, socket.request.session.passport?.user, msg.text);
    console.log('newMessage DEBUG');
    console.log(newMessage);
    socket.to(roomName).emit('message-to-chat', newMessage);
    socket.emit('message-to-chat', newMessage);
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${id}`);
  });
});

const PORT = process.env.HTTP_PORT || 3000;

async function mongoConnect(url) {
  try {
    await mongoose.connect(url);

    server.listen(PORT, () => {
      console.log(`Server started at port ${PORT}`);
    });
  } catch (error) {
    console.log('[ERROR]: Database connect error:');
    console.error(error);
  }
}

mongoConnect(process.env.MONGO_URL);
