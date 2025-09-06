import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import RecommendationCard from "@/components/recommendation-card";
import { ArrowLeft, Search, Bot, Compass, Leaf, Music, Binoculars, MapPin, Clock, Users } from "lucide-react";
import { useTravelData } from "@/hooks/use-travel-data";
import { LocationService } from "@/lib/location-service";
import { BehaviorTracker } from "@/lib/behavior-tracker";
import type { Recommendation } from "@shared/schema";

const moodFilters = [
  { id: 'all', label: 'All', icon: Compass },
  { id: 'relax', label: 'Relax', icon: Leaf },
  { id: 'party', label: 'Party', icon: Music },
  { id: 'explore', label: 'Explore', icon: Binoculars },
];

export default function RecommendationsPage() {
  const [, setLocation] = useLocation();
  const { setCurrentScreen } = useTravelData();
  const [activeMood, setActiveMood] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [crowdOptimized, setCrowdOptimized] = useState(false);
  
  const locationService = LocationService.getInstance();
  const behaviorTracker = BehaviorTracker.getInstance();
  const userId = 'demo-user';

  // Get user location on component mount
  useEffect(() => {
    const getUserLocation = async () => {
      try {
        const location = await locationService.getCurrentLocation();
        if (location) {
          setUserLocation({ lat: location.latitude, lng: location.longitude });
          setLocationEnabled(true);
          
          // Track location-based view
          await behaviorTracker.trackView(userId, 'recommendations-page', 'recommendation', {
            currentScreen: 'recommendations',
            locationEnabled: true,
            city: location.city
          });
        }
      } catch (error) {
        console.warn('Location access denied or unavailable');
        setLocationEnabled(false);
      }
    };
    
    getUserLocation();
  }, []);

  // Build query parameters for location-based recommendations
  const queryParams = new URLSearchParams();
  queryParams.append('mood', activeMood);
  if (locationEnabled && userLocation) {
    queryParams.append('lat', userLocation.lat.toString());
    queryParams.append('lng', userLocation.lng.toString());
    queryParams.append('radius', '10'); // 10km radius
  }
  
  const queryKey = crowdOptimized 
    ? ['/api/recommendations/crowd-optimized']
    : [`/api/recommendations?${queryParams.toString()}`];

  const { data: recommendations = [], isLoading } = useQuery<Recommendation[]>({
    queryKey,
    enabled: true,
  });

  const handleBack = () => {
    setCurrentScreen('travel-dna');
    setLocation('/travel-dna');
  };

  const handleChatNavigation = () => {
    setCurrentScreen('chat');
    setLocation('/chat');
  };
  
  const handleMoodChange = async (mood: string) => {
    setActiveMood(mood);
    // Track mood preference
    await behaviorTracker.trackBehavior({
      userId,
      actionType: 'search',
      itemType: 'recommendation',
      mood,
      context: {
        currentScreen: 'recommendations',
        previousAction: `mood_filter_${activeMood}`
      }
    });
  };
  
  const handleSearchChange = async (query: string) => {
    setSearchQuery(query);
    if (query.length > 2) {
      await behaviorTracker.trackSearch(userId, query, activeMood);
    }
  };

  const filteredRecommendations = recommendations.filter(rec =>
    rec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rec.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background slide-in pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-secondary to-accent text-white p-4">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="text-white hover:bg-white/20"
            data-testid="btn-back"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-xl font-bold" data-testid="title-hidden-gems">Hidden Gems</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleChatNavigation}
            className="bg-white/20 text-white hover:bg-white/30"
            data-testid="btn-chat-nav"
          >
            <Bot className="w-5 h-5" />
          </Button>
        </div>
        
        {/* Mood Filters */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {moodFilters.map((filter) => {
            const IconComponent = filter.icon;
            return (
              <Button
                key={filter.id}
                variant={activeMood === filter.id ? "secondary" : "ghost"}
                size="sm"
                onClick={() => handleMoodChange(filter.id)}
                className={`whitespace-nowrap ${
                  activeMood === filter.id 
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90 mood-filter active' 
                    : 'bg-white/20 text-white hover:bg-white/30 mood-filter'
                }`}
                data-testid={`filter-${filter.id}`}
              >
                <IconComponent className="w-4 h-4 mr-2" />
                {filter.label}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="p-4">
        {/* Location and Filter Controls */}
        <div className="mb-4 space-y-3">
          {/* Location Status */}
          <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <MapPin className={`w-4 h-4 ${locationEnabled ? 'text-secondary' : 'text-muted-foreground'}`} />
              <span className="text-sm">
                {locationEnabled ? 'Location-based recommendations' : 'Using general recommendations'}
              </span>
            </div>
            {locationEnabled && (
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>Real-time</span>
              </div>
            )}
          </div>
          
          {/* Smart Filter Toggle */}
          <div className="flex items-center space-x-2">
            <Button
              variant={crowdOptimized ? "default" : "outline"}
              size="sm"
              onClick={() => setCrowdOptimized(!crowdOptimized)}
              className="text-xs"
              data-testid="crowd-optimized-toggle"
            >
              <Users className="w-3 h-3 mr-1" />
              {crowdOptimized ? 'Best Times Active' : 'Show Best Times'}
            </Button>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="relative mb-6">
          <Input
            type="text"
            placeholder={locationEnabled ? "Search nearby hidden gems..." : "Search hidden gems..."}
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-12 h-12 rounded-xl border-border bg-input"
            data-testid="input-search"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        </div>

        {/* Recommendations Grid */}
        <div className="space-y-4" data-testid="recommendations-grid">
          {isLoading ? (
            <div className="text-center py-8" data-testid="loading-recommendations">
              <div className="text-muted-foreground">Loading amazing places...</div>
            </div>
          ) : filteredRecommendations.length === 0 ? (
            <div className="text-center py-8" data-testid="no-recommendations">
              <div className="text-muted-foreground">No gems found matching your search</div>
            </div>
          ) : (
            filteredRecommendations.map((recommendation) => (
              <RecommendationCard
                key={recommendation.id}
                recommendation={recommendation}
                onView={() => behaviorTracker.trackView(userId, recommendation.id, 'recommendation')}
                onFavorite={(isFavorited) => {
                  if (isFavorited) {
                    behaviorTracker.trackFavorite(userId, recommendation.id, 'recommendation');
                  }
                }}
                showCrowdData={crowdOptimized}
                userLocation={userLocation}
                data-testid={`card-recommendation-${recommendation.id}`}
              />
            ))
          )}
        </div>

        {/* Load More Button */}
        {!isLoading && filteredRecommendations.length > 0 && (
          <Button
            variant="ghost"
            className="w-full mt-6 bg-muted text-muted-foreground hover:bg-secondary hover:text-white"
            data-testid="btn-load-more"
          >
            Load More Gems
            <Binoculars className="ml-2 w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
