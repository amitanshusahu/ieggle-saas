import { GetTypesResult, room, person, User } from './types';
import { Socket } from 'socket.io';
let connectedRoomArr: Array<room> = [];

export function handelStart(socket: any, cb: Function, io: any, personObj: person): void {
  let user: User = {
    id: socket.id,
    im: personObj.im,
    lookingFor: personObj.lookingFor,
    roomType: personObj.roomType
  }
  onUserJoin(user, socket, io);

}

export function handelDisconnect(disconnectedId: string, io: any) {
  // remove users from commected room 
  for (let i = 0; i < connectedRoomArr.length; i++) {
    if (connectedRoomArr[i].p1.id == disconnectedId) {
      io.to(connectedRoomArr[i].p2.id).emit("disconnected");
      connectedRoomArr.splice(i, 1);
    } else if (connectedRoomArr[i].p2.id == disconnectedId) {
      io.to(connectedRoomArr[i].p1.id).emit("disconnected");
      connectedRoomArr.splice(i, 1);
    }
  }
  // remove users from waiting room normal
  if ("normal" in waitingRoom) {
    for (let i = 0; i < waitingRoom.normal.length; i++) {
      if (waitingRoom.normal[i].id == disconnectedId) {
        waitingRoom.normal.splice(i, 1);
      }
    }
  }
  // remove users from waiting room adult
  if ("adult" in waitingRoom) {
    for (let i = 0; i < waitingRoom.adult.length; i++) {
      if (waitingRoom.adult[i].id == disconnectedId) {
        waitingRoom.adult.splice(i, 1);
      }
    }
  }
}


// get type of person (p1 or p2)
export function getType(id: string): GetTypesResult {
  for (let i = 0; i < connectedRoomArr.length; i++) {
    if (connectedRoomArr[i].p1.id == id) {
      return { type: 'p1', p2id: connectedRoomArr[i].p2.id };
    } else if (connectedRoomArr[i].p2.id == id) {
      return { type: 'p2', p1id: connectedRoomArr[i].p1.id };
    }
  }
  return false;
}

/* TODO 
  use redis for scaling
*/ 
const waitingRoom: { [key: string]: User[] } = {};  // Store users by roomType

function findMatch(user: User): User | null {
  const { im, lookingFor, roomType } = user;

  if (!waitingRoom[roomType]) {
    waitingRoom[roomType] = [];  // Initialize if not present
  }

  for (let i = 0; i < waitingRoom[roomType].length; i++) {
    const potentialMatch = waitingRoom[roomType][i];
    if (potentialMatch.im === lookingFor && potentialMatch.lookingFor === im) {
      // if match found remove user from room pool and return
      waitingRoom[roomType].splice(i, 1);
      return potentialMatch;
    }
  }

  // No match found, add the user to the room pool
  waitingRoom[roomType].push(user);
  return null;
}

function onUserJoin(user: User, socket: Socket, io: any): void {
  const match = findMatch(user);

  if (match) {
    // console.log(`User ${user.id} matched with ${match.id}`);
    connectUsers(user, match, socket, io);
  } else {
    // console.log(`User ${user.id} is waiting for a match in roomType: ${user.roomType}`);
    // console.log('waitingroom: ', waitingRoom);
  }
}

function connectUsers(user1: User, user2: User, socket: Socket, io: any): void {
  // console.log(`Connecting user ${user1.id} and user ${user2.id}`);
  let roomid = `${user1.id}${user2.id}`;
  io.sockets.sockets.get(user2.id)?.join(roomid);
  io.sockets.sockets.get(user1.id)?.join(roomid);
  connectedRoomArr.push({
    roomid,
    isAvailable: true,
    p1: {
      id: user2.id,
      im: user2.im,
      lookingfor: user2.lookingFor,
    },
    p2: {
      id: user1.id,
      im: user1.im,
      lookingfor: user1.lookingFor,
    }
  });
  io.to(roomid).emit('roomid', roomid);
  io.to(user2.id).emit('get-type', "p1");
  io.to(user1.id).emit('get-type', "p2");
  io.to(user2.id).emit('remote-socket', user1.id);
  io.to(user1.id).emit('remote-socket', user2.id);
  // console.log("connected room: ", connectedRoomArr);
}