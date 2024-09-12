import { useMessageStore, useSocketStore, useUserStore } from "../../store/useStore";
import VideoPlayer from "../VideoPlayer";

interface LayoutProps {
  myVideoRef: React.Ref<HTMLVideoElement>;
  strangerVideoRef: React.Ref<HTMLVideoElement>;
}

export default function DefaultLayout1({ myVideoRef, strangerVideoRef }: LayoutProps) {
  const { start } = useUserStore();
  return (
    <div className="mt-4 flex h-[calc(100dvh-100px)] gap-4">
      <div className="flex flex-col gap-4 h-full justify-center w-[50%]">
        <VideoPlayer forwardRef={myVideoRef} />
        <VideoPlayer forwardRef={strangerVideoRef} />
      </div>
      {
        start ? <MessageBox /> : <ReadyBox />
      }
    </div>
  )
}

function MessageBox() {
  const { strangerMsg } = useMessageStore()
  const { socket, type, roomid } = useSocketStore()
  const {lookingFor} = useUserStore();
  const handelMsgInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!socket) return;
    socket.emit("send-message", e.target.value, type, roomid)
  }
  return (
    <div className="border-2 rounded-2xl w-[50%] flex flex-col overflow-hidden">

      <div className="m-4 h-full overflow-hidden flex flex-col rounded-2xl border-2 border-pink-200">
        <div className="bg-pink-400 flex justify-center items-center h-[50px]">
          <span className="font-bold text-white">
            {(lookingFor == "random") ? "STRANGER" : (lookingFor == "female") ? "SHE" : "HE"}
          </span>
        </div>
        <div className="h-full m-4 font-bold text-gray-600 overflow-scroll">
          {strangerMsg}
        </div>
      </div>

      <div className="m-4 h-full overflow-hidden flex flex-col rounded-2xl border-2 border-pink-200">
        <div className="bg-pink-400 flex justify-center items-center h-[50px]">
          <span className="font-bold text-white">YOU</span>
        </div>
        <textarea className="h-full m-4 font-bold text-gray-600 resize-none outline-none" onInput={handelMsgInput} placeholder="type your message here..">
        </textarea>
      </div>

      <div className="flex h-[130px] bg-gray-200 gap-4 justify-center items-center">
        <span>😂</span>
        <span>😇</span>
        <span>😍</span>
        <span>🍑</span>
        <span>🦄</span>
      </div>

    </div>
  )
}

function ReadyBox() {
  const { setStart } = useUserStore();
  const { connect } = useSocketStore();
  return (
    <div className="border-2 rounded-2xl w-[50%] flex flex-col justify-center items-center">
      <div className="flex flex flex-col justify-center items-center gap-4">
        <h2 className="font-bold text-gray-600 text-xl">Are you ready ?</h2>
        <button className="btn"
          onClick={() => {
            if (connect) {
              connect();
              setStart(true);
            }
          }}>
          Let's Go</button>
      </div>
    </div>
  )
}