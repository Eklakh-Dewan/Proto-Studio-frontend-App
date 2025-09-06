import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Star, MapPin, Clock, Users, Navigation } from "lucide-react";
import type { Recommendation } from "@shared/schema";
import { useState, useEffect } from "react";
import { LocationService } from "@/lib/location-service";

interface RecommendationCardProps {
  recommendation: Recommendation;
  onView?: () => void;
  onFavorite?: (isFavorited: boolean) => void;
  showCrowdData?: boolean;
  userLocation?: { lat: number; lng: number } | null;
}

export default function RecommendationCard({ 
  recommendation, 
  onView, 
  onFavorite,
  showCrowdData = false,
  userLocation 
}: RecommendationCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  const locationService = LocationService.getInstance();
  
  // Calculate distance if user location and recommendation location are available
  useEffect(() => {
    if (userLocation && recommendation.location) {
      const calculatedDistance = locationService.getDistance(
        userLocation.lat,
        userLocation.lng,
        recommendation.location.latitude,
        recommendation.location.longitude
      );
      setDistance(calculatedDistance);
    }
  }, [userLocation, recommendation.location]);
  
  // Track view when component mounts
  useEffect(() => {
    onView?.();
  }, []);

  const handleFavorite = () => {
    const newFavoriteState = !isFavorited;
    setIsFavorited(newFavoriteState);
    onFavorite?.(newFavoriteState);
  };

  const getBadgeVariant = () => {
    if (recommendation.isHiddenGem) return "secondary";
    return "outline";
  };

  const getBadgeText = () => {
    if (recommendation.isHiddenGem) return "Hidden Gem";
    return recommendation.category;
  };

  return (
    <Card className="recommendation-card overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="relative">
        <img
          src={recommendation.imageUrl}
          alt={recommendation.title}
          className="w-full h-48 object-cover"
          data-testid="recommendation-image"
        />
        <div className="absolute top-3 right-3 bg-black/50 text-white px-2 py-1 rounded-full text-xs flex items-center">
          <Star className="w-3 h-3 text-accent mr-1" />
          <span data-testid="recommendation-rating">{(recommendation.rating / 10).toFixed(1)}</span>
        </div>
        <div className="absolute bottom-3 left-3 flex space-x-1">
          <Badge variant={getBadgeVariant()} className="text-xs" data-testid="recommendation-badge">
            {getBadgeText()}
          </Badge>
          {distance && (
            <Badge variant="outline" className="text-xs bg-black/50 text-white border-white/20" data-testid="distance-badge">
              <MapPin className="w-2 h-2 mr-1" />
              {distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`}
            </Badge>
          )}
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2" data-testid="recommendation-title">
          {recommendation.title}
        </h3>
        <p className="text-muted-foreground text-sm mb-3" data-testid="recommendation-description">
          {recommendation.description}
        </p>
        
        {/* Location and crowd data */}
        {recommendation.location && (
          <div className="flex items-center space-x-2 text-xs text-muted-foreground mb-2">
            <MapPin className="w-3 h-3" />
            <span data-testid="recommendation-location">
              {recommendation.location.neighborhood}, {recommendation.location.city}
            </span>
          </div>
        )}
        
        {showCrowdData && recommendation.crowdData && (
          <div className="mb-3 p-2 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3 text-secondary" />
                <span className="text-secondary font-medium" data-testid="best-time">
                  {recommendation.crowdData.bestTimeToVisit}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-3 h-3" />
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    recommendation.crowdData.crowdLevel === 'low' ? 'text-secondary' :
                    recommendation.crowdData.crowdLevel === 'medium' ? 'text-accent' : 'text-destructive'
                  }`}
                  data-testid="crowd-level"
                >
                  {recommendation.crowdData.crowdLevel} crowd
                </Badge>
              </div>
            </div>
          </div>
        )}
        
        {/* Local insights */}
        {recommendation.localInsights && recommendation.localInsights.localTips.length > 0 && (
          <div className="mb-3">
            <div className="text-xs font-medium text-foreground mb-1">💡 Local Tip:</div>
            <div className="text-xs text-muted-foreground italic" data-testid="local-tip">
              {recommendation.localInsights.localTips[0]}
            </div>
          </div>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 flex-wrap">
            {recommendation.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs" data-testid={`tag-${tag.toLowerCase()}`}>
                {tag}
              </Badge>
            ))}
            {userLocation && recommendation.location && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs px-2 py-1 h-auto text-muted-foreground hover:text-primary"
                data-testid="get-directions"
              >
                <Navigation className="w-3 h-3 mr-1" />
                Directions
              </Button>
            )}
          </div>
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
            <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
