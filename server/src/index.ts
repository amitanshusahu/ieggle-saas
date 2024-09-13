import express from 'express';
import { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import { handelStart, handelDisconnect, getType } from './lib';

const app = express();

const allowedOrigins = [
  'https://ieggle-client-hwnl3.ondigitalocean.app',
  'https://www.ieggle.cam',
  'https://ieggle.cam'
];

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  optionsSuccessStatus: 200
}));

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

app.get('/', (req, res) => {
  res.status(200).send('server is up and running 😍')
})

const server = app.listen(process.env.PORT || '8000', () => console.log('Server is up, 8000'));
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    }
  }
});

let online: number = 0;

io.on('connection', (socket) => {
  online++;
  io.emit('online', online);
  console.log(socket.id, " Connected");

  // on start
  socket.on('start', (personObj, cb) => {
    handelStart(socket, cb, io, personObj);
  })

  // On disconnection
  socket.on('disconnect', () => {
    online--;
    io.emit('online', online);
    handelDisconnect(socket.id, io);
    console.log("disconnected : ", socket.id);
  });

  /// ------- logic for webrtc connection ------

  // on ice send
  socket.on('ice:send', ({ candidate }) => {
    const type = getType(socket.id);
    if (!type) return;
    const peerId = type.type === 'p1' ? type.p2id : type.p1id;
    if (typeof peerId === 'string') {
      io.to(peerId).emit('ice:reply', { candidate, from: socket.id });
    }
  });

  // on sdp send
  socket.on('sdp:send', ({ sdp }) => {
    const type = getType(socket.id);
    if (!type) return;
    const peerId = type.type === 'p1' ? type.p2id : type.p1id;
    if (typeof peerId === 'string') {
      io.to(peerId).emit('sdp:reply', { sdp, from: socket.id });
    }
  })

  /// --------- Messages -----------

  // send message
  socket.on("send-message", (input, type, roomid) => {
    if (type == 'p1') type = 'You: ';
    else if (type == 'p2') type = 'Stranger: ';
    socket.to(roomid).emit('get-message', input, type);
  })

});
