import { useSocketStore } from "../store/useStore"
import {VideoOn, MicOn, Settings} from "../assets/Icons"

export default function ChatNav() {
  const {connect, disconnect} = useSocketStore();

  const skip = () => {
    if(!disconnect || !connect) return;
    disconnect();
    connect();
  }
  
  return (
    <nav className="flex justify-between items-center">
      <div className="flex gap-4">
        <button className="p-2 px-4 bg-gray-200 rounded-lg"> <VideoOn /> </button>
        <button className="p-2 px-4 bg-gray-200 rounded-lg"> <MicOn /> </button>
        <button className="p-2 px-4 bg-gray-200 rounded-lg"> <Settings /> </button>
      </div>
      <div>
        <button 
        className="p-2 px-4 bg-pink-500 rounded-lg font-bold text-white"
        onClick={skip}
        > 
        Skip
        </button>
      </div>
    </nav>
  )
}