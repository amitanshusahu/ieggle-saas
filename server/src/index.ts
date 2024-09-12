import express from 'express';
const app = express();
import cors from 'cors';
app.use(cors());
import { Server } from 'socket.io';
const server = app.listen('8000', () => console.log('Server is up, 8000'));
const io = new Server(server, { cors: { origin: '*' } });
import { handelStart, handelDisconnect, getType } from './lib';

let online: number = 0;

io.on('connection', (socket) => {
  online++;
  io.emit('online', online);
  // console.log(socket.id, " Connected");

  // on start
  socket.on('start', (personObj, cb) => {
    handelStart(socket, cb, io, personObj);
  })

  // On disconnection
  socket.on('disconnect', () => {
    online--;
    io.emit('online', online);
    handelDisconnect(socket.id, io);
    // console.log("disconnected : ", socket.id);
  });




  /// ------- logic for webrtc connection ------

  // on ice send
  socket.on('ice:send', ({ candidate }) => {
    // console.log("received ice candidates");

    const type = getType(socket.id);
    if (!type) return;

    const peerId = type.type === 'p1' ? type.p2id : type.p1id;

    if (typeof peerId === 'string') {
      io.to(peerId).emit('ice:reply', { candidate, from: socket.id });
    }
  });

  // on sdp send
  socket.on('sdp:send', ({ sdp }) => {
    // console.log("received sdp");

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
