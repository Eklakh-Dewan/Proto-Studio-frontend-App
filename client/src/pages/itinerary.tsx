import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import ItineraryItem from "@/components/itinerary-item";
import { ArrowLeft, Share, MapPin, Clock, Zap, Brain, Users, CloudSun } from "lucide-react";
import { useTravelData } from "@/hooks/use-travel-data";
import { mockItineraryData } from "@/lib/travel-data";
import { LocationService } from "@/lib/location-service";
import { BehaviorTracker } from "@/lib/behavior-tracker";
import { apiRequest } from "@/lib/queryClient";

export default function ItineraryPage() {
  const [, setLocation] = useLocation();
  const { setCurrentScreen, travelDNA } = useTravelData();
  const [activeDay, setActiveDay] = useState(1);
  const [adaptiveMode, setAdaptiveMode] = useState(true);
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number, city: string} | null>(null);
  const [weatherData, setWeatherData] = useState<{condition: string, temp: number} | null>(null);
  const [crowdLevels, setCrowdLevels] = useState<Record<string, 'low' | 'medium' | 'high'>>({}); 
  const queryClient = useQueryClient();
  const locationService = LocationService.getInstance();
  const behaviorTracker = BehaviorTracker.getInstance();
  
  // Mock user ID for demo
  const userId = 'demo-user';

  // Get real-time location and context
  useEffect(() => {
    const updateContext = async () => {
      try {
        const location = await locationService.getCurrentLocation();
        if (location) {
          setCurrentLocation({
            lat: location.latitude,
            lng: location.longitude,
            city: location.city
          });
          
          // Mock weather data (in real app, would fetch from weather API)
          setWeatherData({
            condition: 'sunny',
            temp: 24
          });
          
          // Mock crowd levels (in real app, would use real crowd data)
          setCrowdLevels({
            'activity1': 'low',
            'activity2': 'high',
            'activity3': 'medium'
          });
        }
      } catch (error) {
        console.warn('Location/weather data unavailable');
      }
    };
    
    updateContext();
    
    // Update every 5 minutes if real-time updates enabled
    const interval = realTimeUpdates ? setInterval(updateContext, 5 * 60 * 1000) : null;
    return () => interval && clearInterval(interval);
  }, [realTimeUpdates]);

  // Enhanced itinerary query with real-time data
  const { data: itineraryItems, isLoading } = useQuery({
    queryKey: ['/api/itinerary', userId, activeDay, adaptiveMode],
    queryFn: async () => {
      if (adaptiveMode && currentLocation) {
        // In real app, this would fetch adaptive recommendations based on location, weather, crowd data
        return mockItineraryData.filter(item => item.day === activeDay).map(item => ({
          ...item,
          adaptiveRecommendation: getAdaptiveRecommendation(item),
          crowdLevel: crowdLevels[item.id] || 'medium',
          estimatedTime: adjustTimeForCrowds(item.duration, crowdLevels[item.id] || 'medium')
        }));
      }
      return mockItineraryData.filter(item => item.day === activeDay);
    },
    enabled: true
  });
  
  const itineraryData = itineraryItems || [];

  const updateItineraryMutation = useMutation({
    mutationFn: async ({ itemId, updates }: { itemId: string, updates: any }) => {
      const response = await apiRequest('PUT', `/api/itinerary/${itemId}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/itinerary', userId] });
    },
  });

  const handleBack = () => {
    setCurrentScreen('chat');
    setLocation('/chat');
  };

  const handleSkipActivity = async (itemId: string) => {
    await behaviorTracker.trackSkip(userId, itemId, 'itinerary_item', 'User chose to skip activity');
    updateItineraryMutation.mutate({
      itemId,
      updates: { isCompleted: true }
    });
  };

  const handleFavoriteActivity = async (itemId: string, isFavorited: boolean) => {
    if (!isFavorited) {
      await behaviorTracker.trackFavorite(userId, itemId, 'itinerary_item');
    }
    updateItineraryMutation.mutate({
      itemId,
      updates: { isFavorited: !isFavorited }
    });
  };
  
  const getAdaptiveRecommendation = (item: any): string => {
    if (!weatherData || !travelDNA) return '';
    
    // Generate adaptive suggestions based on context
    if (weatherData.condition === 'sunny' && item.type === 'outdoor') {
      return 'Perfect weather for this outdoor activity!';
    }
    
    if (travelDNA.adventureSeeker > 70 && item.category === 'adventure') {
      return 'This matches your adventurous spirit perfectly!';
    }
    
    if (crowdLevels[item.id] === 'high') {
      return 'Consider visiting earlier or later to avoid crowds';
    }
    
    return '';
  };
  
  const adjustTimeForCrowds = (originalTime: number, crowdLevel: string): number => {
    const multiplier = {
      'low': 0.8,   // 20% less time needed
      'medium': 1.0, // Same time
      'high': 1.3    // 30% more time needed
    }[crowdLevel] || 1.0;
    
    return Math.round(originalTime * multiplier);
  };
  
  const getTimeOfDay = (): string => {
    const hour = new Date().getHours();
    if (hour < 6) return 'Early morning';
    if (hour < 12) return 'Morning';
    if (hour < 18) return 'Afternoon';
    return 'Evening';
  };

  const dayStats = {
    totalCost: itineraryData.reduce((sum, item) => sum + item.cost, 0),
    totalDistance: "3.2km",
    totalActivities: itineraryData.length
  };

  return (
    <div className="min-h-screen bg-background slide-in pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-accent to-primary text-white p-4">
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
          <div className="text-center">
            <h1 className="text-xl font-bold" data-testid="title-itinerary">Your Itinerary</h1>
            <p className="text-white/80 text-sm" data-testid="trip-name">Japan Adventure - 7 Days</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="bg-white/20 text-white hover:bg-white/30"
            data-testid="btn-share"
          >
            <Share className="w-5 h-5" />
          </Button>
        </div>
        
        {/* Trip Overview */}
        <div className="bg-white/10 rounded-lg p-3">
          <div className="flex justify-between items-center text-sm">
            <div className="text-center">
              <div className="font-semibold">Days</div>
              <div data-testid="stat-days">7</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">Activities</div>
              <div data-testid="stat-activities">12</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">Budget</div>
              <div data-testid="stat-budget">$2,400</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">Offline</div>
              <div className="offline-indicator text-xs px-2 py-1 rounded" data-testid="offline-status">
                Ready
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Adaptive Controls */}
        <div className="mb-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Smart Adaptation</span>
            </div>
            <Switch 
              checked={adaptiveMode} 
              onCheckedChange={setAdaptiveMode}
              data-testid="adaptive-mode-toggle"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium">Real-time Updates</span>
            </div>
            <Switch 
              checked={realTimeUpdates} 
              onCheckedChange={setRealTimeUpdates}
              data-testid="realtime-updates-toggle"
            />
          </div>
        </div>
        
        {/* Context Information */}
        {currentLocation && (
          <div className="mb-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <MapPin className="w-3 h-3" />
                <span data-testid="current-location">{currentLocation.city}</span>
              </div>
              {weatherData && (
                <div className="flex items-center space-x-1">
                  <CloudSun className="w-3 h-3" />
                  <span data-testid="weather-info">{weatherData.temp}°C, {weatherData.condition}</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Day Navigation */}
        <div className="flex space-x-2 overflow-x-auto pb-4 mb-6">
          {[1, 2, 3, 4, 5].map((day) => {
            const isToday = day === new Date().getDate() % 7 + 1; // Mock today
            return (
              <Button
                key={day}
                variant={activeDay === day ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveDay(day)}
                className={`whitespace-nowrap relative ${
                  activeDay === day 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}
                data-testid={`day-nav-${day}`}
              >
                Day {day}
                {isToday && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full" />
                )}
              </Button>
            );
          })}
        </div>

        {/* Adaptive Insights */}
        {adaptiveMode && (
          <div className="mb-6 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Brain className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">Smart Insights for Day {activeDay}</span>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              {weatherData && (
                <div>• Weather: {weatherData.condition}, {weatherData.temp}°C - Great for outdoor activities</div>
              )}
              <div>• Best visiting time: {getTimeOfDay()} - Lower crowds expected</div>
              {travelDNA && (
                <div>• Matches your {travelDNA.personality} preferences perfectly</div>
              )}
            </div>
          </div>
        )}
        
        {/* Itinerary Items */}
        <div className="space-y-4" data-testid="itinerary-items">
          {isLoading ? (
            <div className="space-y-4">
              {[1,2,3].map(i => (
                <div key={i} className="animate-pulse bg-muted/50 h-24 rounded-lg" />
              ))}
            </div>
          ) : (
            itineraryData.map((item: any) => (
              <div key={item.id} className="relative">
                <ItineraryItem
                  item={item}
                  onSkip={() => handleSkipActivity(item.id)}
                  onFavorite={() => handleFavoriteActivity(item.id, item.isFavorited)}
                  data-testid={`itinerary-item-${item.id}`}
                />
                
                {/* Adaptive overlays */}
                {adaptiveMode && item.adaptiveRecommendation && (
                  <div className="mt-2 p-2 bg-primary/10 border-l-2 border-primary rounded-r text-xs">
                    <div className="flex items-center space-x-1">
                      <Zap className="w-3 h-3 text-primary" />
                      <span className="font-medium text-primary">Smart Tip:</span>
                    </div>
                    <div className="text-muted-foreground mt-1">
                      {item.adaptiveRecommendation}
                    </div>
                  </div>
                )}
                
                {/* Crowd level indicator */}
                {item.crowdLevel && (
                  <div className="absolute top-2 right-2">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        item.crowdLevel === 'low' ? 'bg-secondary/20 text-secondary' :
                        item.crowdLevel === 'medium' ? 'bg-accent/20 text-accent' :
                        'bg-destructive/20 text-destructive'
                      }`}
                      data-testid={`crowd-level-${item.id}`}
                    >
                      <Users className="w-2 h-2 mr-1" />
                      {item.crowdLevel}
                    </Badge>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Day Summary */}
        <div className="mt-6 bg-muted rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold" data-testid="day-summary-title">Day {activeDay} Summary</h3>
            <span className="text-sm text-muted-foreground" data-testid="planned-hours">
              9 hours planned
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-primary" data-testid="summary-cost">
                ${dayStats.totalCost}
              </div>
              <div className="text-xs text-muted-foreground">Total Cost</div>
            </div>
            <div>
              <div className="text-lg font-bold text-secondary" data-testid="summary-distance">
                {dayStats.totalDistance}
              </div>
              <div className="text-xs text-muted-foreground">Walking</div>
            </div>
            <div>
              <div className="text-lg font-bold text-accent" data-testid="summary-activities">
                {dayStats.totalActivities}
              </div>
              <div className="text-xs text-muted-foreground">Activities</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
