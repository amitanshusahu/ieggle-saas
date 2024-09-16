import { useSettingStore, useSocketStore, useUserStore } from "../store/useStore"
import { VideoOn, VideoOff, MicOn, MicOff, Settings } from "../assets/Icons"

export default function ChatNav() {
  const { connect, disconnect } = useSocketStore();
  const { isConnectionStarted, isConnectedWithOtherUser } = useUserStore();
  const { isVideo, setIsVideo, isAudio, setIsAudio, isSetting, setIsSetting } = useSettingStore();

  const skip = () => {
    if (!disconnect || !connect) return;
    disconnect();
    connect();
  }

  // Toggle video, audio, and settings
  const toggleVideo = () => {
    setIsVideo(!isVideo)
  }
  const toggleAudio = () => {
    setIsAudio(!isAudio)
  }
  const toggleSettings = () => {
    setIsSetting(!isSetting)
  }

  return (
    <nav className="flex justify-between items-center animate-fade">
      <div className="flex gap-4">
        <button
          className={`p-2 px-4 rounded-lg ${isVideo ? 'bg-gray-200' : 'bg-pink-400'}`}
          onClick={toggleVideo}
        >
          {isVideo ? <VideoOn /> : <VideoOff />}
        </button>
        <button
          className={`p-2 px-4 rounded-lg ${isAudio ? 'bg-gray-200' : 'bg-pink-400'}`}
          onClick={toggleAudio}
        >
          {isAudio ? <MicOn /> : <MicOff />}
        </button>
        <button
          className={`p-2 px-4 rounded-lg bg-gray-200`}
          onClick={toggleSettings}
        >
          <Settings />
        </button>
      </div>
      <div>
        {(isConnectionStarted && isConnectedWithOtherUser) ? <button
          className="p-2 px-4 bg-pink-500 rounded-lg font-bold text-white"
          onClick={skip}
        >
          Skip
        </button>
          :
          null}
      </div>
    </nav>
  )
}