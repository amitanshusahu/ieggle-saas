import React from "react";

interface VideoPlayerProps {
  forwardRef: React.Ref<HTMLVideoElement>;
}

export default function VideoPlayer({ forwardRef }: VideoPlayerProps) {
  return (
    <div className="rounded-xl h-full w-full overflow-hidden">
      <video className="bg-black w-full h-full" autoPlay ref={forwardRef}></video>
    </div>
  );
}
