import { Socket } from "socket.io-client";
import { create } from "zustand";

interface SocketState {
  socket: Socket | null
  setSocketFromStore: (val: Socket | null) => void;
  type: string;
  setType: (person: string) => void;
  remoteSocket: string;
  setRemoteSocket: (id: string) => void;
  roomid: string;
  setRoomId: (id: string) => void;
  connect: null | Function;
  setConnect: (fun: Function) => void;
  disconnect: null | Function;
  setDisonnect: (fun: Function) => void;
}

interface UserState{
  im: "male" | "female" | "random";
  setIm: (sex: "male" | "female" | "random") => void;
  lookingFor: "male" | "female" | "random";
  setLookingFor: (sex: "male" | "female" | "random") => void;
  roomType: "normal" | "adult";
  setRoomType: (type: "normal" | "adult") => void;
  start: boolean;
  setStart : (val: boolean) => void;
}

interface MessageState{
  strangerMsg: string;
  setStrangerMsg: (msg: string) => void;
  myMsg: string;
  setMyMsg: (msg: string) => void;
}

interface SettingState{
  isVideo: boolean;
  isAudio: boolean;
}

export const useSocketStore = create<SocketState>((set) => ({
  socket: null,
  setSocketFromStore: (val) => set(() => ({socket: val})),
  type: "",
  setType: (person: string) => set(() => ({ type: person })),
  remoteSocket: "",
  setRemoteSocket: (id: string) => set(() => ({ remoteSocket: id })),
  roomid: "",
  setRoomId: (id: string) => set(() => ({ roomid: id })),
  connect: null,
  setConnect: (fun: Function) => set(() => ({ connect: fun })),
  disconnect: null,
  setDisonnect: (fun: Function) => set(() => ({ disconnect: fun }))
}));

export const useUserStore = create<UserState>((set) => ({
  im: "random",
  setIm: (sex) => set(() => ({im: sex})),
  lookingFor: "random",
  setLookingFor: (sex) => set(() => ({lookingFor: sex})),
  roomType: "normal",
  setRoomType: (type) => set(() => ({roomType: type})),
  start: false,
  setStart: (val) => set(() => ({start: val}))
}));

export const useMessageStore = create<MessageState>((set) => ({
  strangerMsg: "stranger messages wil appear here...",
  setStrangerMsg : (msg) => set(() => ({strangerMsg: msg})),
  myMsg: "type your msg here",
  setMyMsg: (msg) => set(() => ({myMsg: msg}))
}))