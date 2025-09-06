import { Button } from "@/components/ui/button";
import { Dna, Compass, Bot, Calendar } from "lucide-react";
import { useLocation } from "wouter";
import { useTravelData } from "@/hooks/use-travel-data";

export default function BottomNavigation() {
  const [location, setLocation] = useLocation();
  const { setCurrentScreen } = useTravelData();

  const navItems = [
    { id: 'travel-dna', label: 'DNA', icon: Dna, path: '/travel-dna' },
    { id: 'recommendations', label: 'Explore', icon: Compass, path: '/recommendations' },
    { id: 'chat', label: 'AI Twin', icon: Bot, path: '/chat' },
    { id: 'itinerary', label: 'Itinerary', icon: Calendar, path: '/itinerary' },
  ];

  const handleNavigation = (item: typeof navItems[0]) => {
    setCurrentScreen(item.id as any);
    setLocation(item.path);
  };

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40" data-testid="bottom-nav">
      <div className="flex">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const active = isActive(item.path);
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => handleNavigation(item)}
              className={`flex-1 p-4 flex flex-col items-center space-y-1 h-auto ${
                active ? 'text-primary' : 'text-muted-foreground'
              }`}
              data-testid={`nav-${item.id}`}
            >
              <IconComponent className="w-6 h-6" />
              <span className="text-xs">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
