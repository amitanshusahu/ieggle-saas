import VideoPlayer from "../VideoPlayer";

interface LayoutProps {
  myVideoRef : React.Ref<HTMLVideoElement>;
  strangerVideoRef : React.Ref<HTMLVideoElement>;
}

export default function DefaultLayout1({myVideoRef, strangerVideoRef} : LayoutProps) {
  return(
    <div className="mt-4 flex h-[calc(100dvh-100px)] gap-4">
      <div className="flex flex-col gap-4 h-full justify-center w-[50%]">
        <VideoPlayer forwardRef={myVideoRef}/>
        <VideoPlayer forwardRef={strangerVideoRef}/>
      </div>
      <div className="border-2 rounded-xl w-[50%]">
        message box
      </div>
    </div>
  )
}