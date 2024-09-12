import { v4 as uuidv4 } from 'uuid';
import { GetTypesResult, room, person, User} from './types';
import { Socket } from 'socket.io';
let connectedRoomArr: Array<room> = [];

export function handelStart(socket: any, cb: Function, io: any, personObj: person): void {
  // console.log(connectedRoomArr);
  let user: User = {
    id: socket.id,
    im: personObj.im,
    lookingFor: personObj.lookingFor,
    roomType: personObj.roomType
  }
  onUserJoin(user, socket, io);

}

/**
 * @desc handels disconnceition event
 */
export function handelDisconnect(disconnectedId: string, io: any) {
  for (let i = 0; i < connectedRoomArr.length; i++) {
    if (connectedRoomArr[i].p1.id == disconnectedId) {
      io.to(connectedRoomArr[i].p2.id).emit("disconnected");
      if (connectedRoomArr[i].p2.id) {
        connectedRoomArr[i].isAvailable = true;
        connectedRoomArr[i].p1.id = connectedRoomArr[i].p2.id;
        connectedRoomArr[i].p2.id = null;
      }
      else {
        connectedRoomArr.splice(i, 1);
      }
    } else if (connectedRoomArr[i].p2.id == disconnectedId) {
      io.to(connectedRoomArr[i].p1.id).emit("disconnected");
      if (connectedRoomArr[i].p1.id) {
        connectedRoomArr[i].isAvailable = true;
        connectedRoomArr[i].p2.id = null;
      }
      else {
        connectedRoomArr.splice(i, 1);
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

// Store connected users in memory (you can use Redis or any other storage for scaling)
const waitingRoom: { [key: string]: User[] } = {};  // Store users by roomType

// Function to find a match for the user
function findMatch(user: User): User | null {
  const { im, lookingFor, roomType } = user;

  // Check if the roomType exists
  if (!waitingRoom[roomType]) {
    waitingRoom[roomType] = [];  // Initialize if not present
  }

  // Iterate over the users in the same roomType
  for (let i = 0; i < waitingRoom[roomType].length; i++) {
    const potentialMatch = waitingRoom[roomType][i];

    // Match criteria: im and lookingFor should complement
    if (potentialMatch.im === lookingFor && potentialMatch.lookingFor === im) {
      // Remove the matched user from the waiting pool
      waitingRoom[roomType].splice(i, 1);

      // Return the matched user
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
  io.to(user2.id).emit('get-type', "p1" );
  io.to(user1.id).emit('get-type', "p2" );
  io.to(user2.id).emit('remote-socket', user1.id);
  io.to(user1.id).emit('remote-socket', user2.id);
  // console.log("sending room id")
  // console.log(connectedRoomArr)
}