import { useUserStore } from '../store/useStore';

export default function RoomSelectionBox() {
  const {im, setIm, lookingFor, setLookingFor, roomType, setRoomType} = useUserStore();
  // const [iAm, setIAm] = useState<string>("random");
  // const [lookingFor, setLookingFor] = useState<string>("random");
  // const [roomType, setRoomType] = useState<string | null>("normal");

  const selectableStyles = (selected: string | null, value: string) => (
    `selectable ${
      selected === value ? 'selectable-selected' : 'selectable'
    }`
  );

  return (
    <div className="m-auto mt-24 border-2 rounded-xl border-dashed p-8 max-w-fit">
      <div className="flex flex-col gap-4">
        {/* "I am" selection */}
        <div className="flex items-center gap-4">
          <h3 className="font-semibold">I am a</h3>
          <div 
            className={selectableStyles(im, 'male')} 
            onClick={() => setIm('male')}
          >
            🧔
          </div>
          <div 
            className={selectableStyles(im, 'female')} 
            onClick={() => setIm('female')}
          >
            👩
          </div>
          <div 
            className={selectableStyles(im, 'random')} 
            onClick={() => setIm('random')}
          >
            🌈
          </div>
        </div>

        {/* "Looking for" selection */}
        <div className="flex items-center gap-4">
          <h3 className="font-semibold">Looking for a</h3>
          <div 
            className={selectableStyles(lookingFor, 'male')} 
            onClick={() => setLookingFor('male')}
          >
            🧔
          </div>
          <div 
            className={selectableStyles(lookingFor, 'female')} 
            onClick={() => setLookingFor('female')}
          >
            👩
          </div>
          <div 
            className={selectableStyles(lookingFor, 'random')} 
            onClick={() => setLookingFor('random')}
          >
            🌈
          </div>
        </div>

        {/* "Room Type" selection */}
        <div className="flex items-center gap-4">
          <h3 className="font-semibold">Room Type</h3>
          <div 
            className={selectableStyles(roomType, 'normal')} 
            onClick={() => setRoomType('normal')}
          >
            🙂
          </div>
          <div 
            className={selectableStyles(roomType, 'adult')} 
            onClick={() => setRoomType('adult')}
          >
            😈
          </div>
        </div>

        {/* Tags input */}
        <div>
          <textarea 
            name="" 
            id="" 
            placeholder="Tags" 
            className="resize-none mt-4 border-gray-200 border-2 rounded-md p-2 font-semibold outline-none text-gray-400"
          ></textarea>
        </div>
      </div>
    </div>
  );
}
