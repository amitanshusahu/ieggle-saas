import useSocketAndWebRTC from "../hooks/useSocketAndWebrtc";
import ChatNav from "../components/ChatNav";
import DefaultLayout1 from "../components/Layouts/DefaultLayout";
import { useEffect } from "react";
import { useSocketStore } from "../store/useStore";

export default function Chat() {
  const {setConnect} = useSocketStore();
  const { myVideoRef, strangerVideoRef, connectSocket, disconnectSocket, status } = useSocketAndWebRTC();

  useEffect(() => {
    setConnect(connectSocket)
  }, [])

  return (
    <div className="w-[100dvw] h-[100dvh] overflow-hidden">
      <div className="m-4">
        <ChatNav />
        <DefaultLayout1 myVideoRef={myVideoRef} strangerVideoRef={strangerVideoRef}/>
      </div>
    </div>
  );
}

// const VideoPlayer = React.forwardRef<HTMLVideoElement, { id: string }>(({ id }, ref) => (
//   <video className="bg-black" autoPlay id={id} ref={ref}></video>
// ));
