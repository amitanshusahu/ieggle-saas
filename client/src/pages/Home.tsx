import RoomSelectionBox from "../components/RoomSelectionBox";
import useReplaceNavigation from "../hooks/useReplaceNavigation";

export default function Home() {

  const navigate = useReplaceNavigation();
  
  return (
    <div className="m-4 animate-fade">
      <div className="m-auto max-w-[1444px]">

        <div className=" mt-20 flex justify-center">
          <img src="/ieggle.gif" alt="logo" />
        </div>
        <RoomSelectionBox />
        <div className="w-full mt-8 flex justify-center">
          <div>
            <button
              className="bg-pink-400 p-2 px-8 rounded-lg font-bold text-white text-xl"
              onClick={() =>navigate('/chat')}>
              Start
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
