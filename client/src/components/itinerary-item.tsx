import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Heart, Sun, Utensils, Moon, Clock } from "lucide-react";
import type { ItineraryItem } from "@shared/schema";
import { useState } from "react";

interface ItineraryItemProps {
  item: ItineraryItem;
  onSkip: () => void;
  onFavorite: () => void;
}

const categoryIcons = {
  Cultural: Sun,
  Food: Utensils,
  Nightlife: Moon,
  Nature: Sun,
  Adventure: Sun,
};

export default function ItineraryItem({ item, onSkip, onFavorite }: ItineraryItemProps) {
  const [isCompleted, setIsCompleted] = useState(item.isCompleted);
  const [isFavorited, setIsFavorited] = useState(item.isFavorited);
  
  const IconComponent = categoryIcons[item.category as keyof typeof categoryIcons] || Sun;

  const handleSkip = () => {
    setIsCompleted(true);
    onSkip();
  };

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    onFavorite();
  };

  const getCategoryGradient = () => {
    switch (item.category) {
      case 'Cultural':
        return 'from-accent to-primary';
      case 'Food':
        return 'from-secondary to-accent';
      case 'Nightlife':
        return 'from-primary to-destructive';
      default:
        return 'from-primary to-secondary';
    }
  };

  const getCostColor = () => {
    if (item.cost === 0) return 'text-secondary';
    if (item.cost < 50) return 'text-accent';
    return 'text-primary';
  };

  return (
    <Card className={`itinerary-item shadow-lg ${isCompleted ? 'completed opacity-60' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 bg-gradient-to-br ${getCategoryGradient()} rounded-lg flex items-center justify-center`}>
              <IconComponent className="w-6 h-6 text-white" data-testid="category-icon" />
            </div>
            <div>
              <h3 className="font-semibold" data-testid="item-title">
                {item.title}
              </h3>
              <p className="text-sm text-muted-foreground" data-testid="item-time">
                {item.startTime} - {item.endTime}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSkip}
              className="text-destructive hover:bg-destructive hover:text-destructive-foreground rounded-lg transition-all"
              data-testid="btn-skip"
            >
              <X className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFavorite}
              className={`rounded-lg transition-all ${
                isFavorited 
                  ? 'text-primary hover:text-primary-foreground hover:bg-primary' 
                  : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
              }`}
              data-testid="btn-favorite"
            >
              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </div>
        
        <img
          src={item.imageUrl}
          alt={item.title}
          className="w-full h-32 object-cover rounded-lg mb-3"
          data-testid="item-image"
        />
        
        <p className="text-sm text-muted-foreground mb-3" data-testid="item-description">
          {item.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            {item.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs" data-testid={`tag-${tag.toLowerCase()}`}>
                {tag}
              </Badge>
            ))}
            <Badge variant="outline" className={`text-xs ${getCostColor()}`} data-testid="cost-badge">
              {item.cost === 0 ? 'Free' : `$${item.cost}`}
            </Badge>
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span data-testid="duration">{item.duration}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
