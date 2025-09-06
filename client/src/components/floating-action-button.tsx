import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useLocation } from "wouter";
import { useTravelData } from "@/hooks/use-travel-data";

export default function FloatingActionButton() {
  const [, setLocation] = useLocation();
  const { setCurrentScreen } = useTravelData();

  const handleClick = () => {
    setCurrentScreen('chat');
    setLocation('/chat');
  };

  return (
    <Button
      onClick={handleClick}
      className="floating-btn fixed bottom-20 right-4 w-14 h-14 rounded-full shadow-lg z-30"
      data-testid="floating-action-btn"
    >
      <Plus className="w-6 h-6" />
    </Button>
  );
}
