import { useNavigate } from "react-router-dom";

export default function useReplaceNavigation(){
  const navigate = useNavigate();

  return (path: string) => {
    navigate(path, {replace: true})
  }
}