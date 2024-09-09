import { create } from "zustand";

interface SocketState {
  type: string;
  setType: (person: string) => void;
  remoteSocket: string;
  setRemoteSocket: (id: string) => void;
  roomid: string;
  setRoomId: (id: string) => void;
  connect: null | Function;
  setConnect: (fun: Function) => void;
}

export const useSocketStore = create<SocketState>((set) => ({
  type: "",
  setType: (person: string) => set(() => ({ type: person })),
  remoteSocket: "",
  setRemoteSocket: (id: string) => set(() => ({ remoteSocket: id })),
  roomid: "",
  setRoomId: (id: string) => set(() => ({ roomid: id })),
  connect: null,
  setConnect: (fun: Function) => set(() => ({ connect: fun }))
}));