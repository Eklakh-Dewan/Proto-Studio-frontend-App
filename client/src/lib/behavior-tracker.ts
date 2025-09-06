import { apiRequest } from './queryClient';
import { LocationService, type LocationData } from './location-service';

export interface UserBehaviorData {
  userId: string;
  actionType: 'visit' | 'skip' | 'favorite' | 'rate' | 'view' | 'search';
  itemId?: string;
  itemType: 'recommendation' | 'itinerary_item' | 'local_place' | 'chat_message';
  location?: {
    latitude: number;
    longitude: number;
    city: string;
  };
  mood?: string;
  timeOfDay?: string;
  weatherCondition?: string;
  companionType?: 'solo' | 'couple' | 'family' | 'friends';
  rating?: number;
  feedback?: string;
  context?: {
    searchQuery?: string;
    currentScreen?: string;
    previousAction?: string;
  };
}

export class BehaviorTracker {
  private static instance: BehaviorTracker;
  private locationService: LocationService;
  private behaviorQueue: UserBehaviorData[] = [];
  private isProcessing = false;

  constructor() {
    this.locationService = LocationService.getInstance();
    
    // Process behavior queue every 5 seconds
    setInterval(() => {
      this.processBehaviorQueue();
    }, 5000);
  }

  static getInstance(): BehaviorTracker {
    if (!BehaviorTracker.instance) {
      BehaviorTracker.instance = new BehaviorTracker();
    }
    return BehaviorTracker.instance;
  }

  async trackBehavior(behaviorData: UserBehaviorData): Promise<void> {
    try {
      // Enhance behavior data with location and context
      const enhancedData = await this.enhanceBehaviorData(behaviorData);
      
      // Add to queue for batch processing
      this.behaviorQueue.push(enhancedData);
      
      // If it's a critical action, process immediately
      if (['favorite', 'rate', 'skip'].includes(behaviorData.actionType)) {
        await this.processBehaviorQueue();
      }
    } catch (error) {
      console.error('Error tracking behavior:', error);
    }
  }

  private async enhanceBehaviorData(behaviorData: UserBehaviorData): Promise<UserBehaviorData> {
    const enhanced = { ...behaviorData };

    // Add location data if not provided
    if (!enhanced.location) {
      try {
        const currentLocation = await this.locationService.getCurrentLocation();
        if (currentLocation) {
          enhanced.location = {
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            city: currentLocation.city
          };
        }
      } catch (error) {
        // Location not available, continue without it
        console.warn('Location not available for behavior tracking');
      }
    }

    // Add time of day if not provided
    if (!enhanced.timeOfDay) {
      enhanced.timeOfDay = this.getTimeOfDay();
    }

    // Add companion type inference (mock for demo)
    if (!enhanced.companionType) {
      enhanced.companionType = this.inferCompanionType(behaviorData);
    }

    return enhanced;
  }

  private async processBehaviorQueue(): Promise<void> {
    if (this.isProcessing || this.behaviorQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    const behaviorsToProcess = [...this.behaviorQueue];
    this.behaviorQueue = [];

    try {
      // Process behaviors in batch
      for (const behavior of behaviorsToProcess) {
        await this.sendBehaviorToServer(behavior);
      }
    } catch (error) {
      console.error('Error processing behavior queue:', error);
      // Re-add failed behaviors to queue
      this.behaviorQueue.unshift(...behaviorsToProcess);
    } finally {
      this.isProcessing = false;
    }
  }

  private async sendBehaviorToServer(behavior: UserBehaviorData): Promise<void> {
    try {
      const response = await apiRequest('POST', '/api/behavior/track', behavior);
      if (!response.ok) {
        throw new Error('Failed to track behavior');
      }
    } catch (error) {
      console.error('Failed to send behavior to server:', error);
      throw error;
    }
  }

  private getTimeOfDay(): string {
    const hour = new Date().getHours();
    if (hour < 6) return 'night';
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  }

  private inferCompanionType(behaviorData: UserBehaviorData): 'solo' | 'couple' | 'family' | 'friends' {
    // Mock inference - in real app, this could be based on user profile or patterns
    const companionTypes: Array<'solo' | 'couple' | 'family' | 'friends'> = ['solo', 'couple', 'family', 'friends'];
    return companionTypes[Math.floor(Math.random() * companionTypes.length)];
  }

  // Convenience methods for common actions
  async trackView(userId: string, itemId: string, itemType: string, context?: any): Promise<void> {
    await this.trackBehavior({
      userId,
      actionType: 'view',
      itemId,
      itemType: itemType as any,
      context
    });
  }

  async trackFavorite(userId: string, itemId: string, itemType: string, rating?: number): Promise<void> {
    await this.trackBehavior({
      userId,
      actionType: 'favorite',
      itemId,
      itemType: itemType as any,
      rating
    });
  }

  async trackSkip(userId: string, itemId: string, itemType: string, feedback?: string): Promise<void> {
    await this.trackBehavior({
      userId,
      actionType: 'skip',
      itemId,
      itemType: itemType as any,
      feedback
    });
  }

  async trackSearch(userId: string, searchQuery: string, mood?: string): Promise<void> {
    await this.trackBehavior({
      userId,
      actionType: 'search',
      itemType: 'recommendation',
      mood,
      context: {
        searchQuery,
        currentScreen: window.location.pathname
      }
    });
  }

  async trackRating(userId: string, itemId: string, itemType: string, rating: number, feedback?: string): Promise<void> {
    await this.trackBehavior({
      userId,
      actionType: 'rate',
      itemId,
      itemType: itemType as any,
      rating,
      feedback
    });
  }
}