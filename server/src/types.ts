export interface room {
  roomid: string,
  isAvailable: boolean,
  p1: {
    id: string | null,
    im: string | null,
    lookingfor: string | null,
  },
  p2: {
    id: string | null,
    im: string | null,
    lookingfor: string | null,
  }
}

export interface person {
  im: "male" | "female" | "random";           // User's gender
  lookingFor: "male" | "female" | "random";    // Desired match gender
  roomType: "normal" | "adult";     // Room type (normal or adult)
}
// Define User type
export type User = {
  id: string;
  im: "male" | "female" | "random";           // User's gender
  lookingFor: "male" | "female" | "random";    // Desired match gender
  roomType: "normal" | "adult";     // Room type (normal or adult)
};

export type GetTypesResult =
  | { type: 'p1', p2id: string | null }
  | { type: 'p2', p1id: string | null }
  | false;