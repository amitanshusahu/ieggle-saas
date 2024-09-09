import { useSocketStore } from "../store/useStore"

export default function ChatNav() {
  const {connect} = useSocketStore();
  return (
    <nav className="flex justify-between items-center">
      <div className="flex gap-4">
        <button className="p-2 px-4 bg-gray-200 rounded-lg"> video</button>
        <button className="p-2 px-4 bg-gray-200 rounded-lg"> audio</button>
        <button className="p-2 px-4 bg-gray-200 rounded-lg"> settings</button>
      </div>
      <div>
        <button 
        className="p-2 px-4 bg-pink-500 rounded-lg font-bold text-white"
        onClick={() => {if (connect) connect()}}
        > 
        Start
        </button>
      </div>
    </nav>
  )
}