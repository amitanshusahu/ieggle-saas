export default function RoomSelectionBox() {
  return (
    <div className="m-auto mt-24 border-2 rounded-xl border-dashed p-8 max-w-fit">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <h3 className="font-semibold">I am a</h3>
          <div className="bg-gray-100 p-1 px-2 rounded-md text-2xl">🧔</div>
          <div className="bg-gray-100 p-1 px-2 rounded-md text-2xl">👩</div>
          <div className="bg-gray-100 p-1 px-2 rounded-md text-2xl">🌈</div>
        </div>
        <div className="flex items-center gap-4">
          <h3 className="font-semibold">Looking for a</h3>
          <div className="bg-gray-100 p-1  px-2 rounded-md text-2xl">🧔</div>
          <div className="bg-gray-100 p-1  px-2 rounded-md text-2xl">👩</div>
          <div className="bg-gray-100 p-1  px-2 rounded-md text-2xl">🌈</div>
        </div>
        <div className="flex items-center gap-4">
          <h3 className="font-semibold">Room Type</h3>
          <div className="bg-gray-100 p-1 px-2 rounded-md text-2xl">🙂</div>
          <div className="bg-gray-100 p-1 px-2 rounded-md text-2xl">😈</div>
        </div>
        <div>
          <textarea name="" id="" placeholder="Tags" className="resize-none mt-4 border-gray-200 border-2 rounded-md p-2 font-semibold outline-none text-gray-400"></textarea>
        </div>
      </div>
    </div>
  )
}