import { type User, type InsertUser, type QuizResponse, type InsertQuizResponse, type Recommendation, type ItineraryItem, type InsertItineraryItem, type ChatMessage, type InsertChatMessage, type UserBehavior, type InsertUserBehavior, type LocalPlace, type InsertLocalPlace } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserTravelDNA(userId: string, travelDNA: any): Promise<void>;
  updateUserLocation(userId: string, location: any): Promise<void>;

  // Quiz methods
  saveQuizResponse(response: InsertQuizResponse): Promise<QuizResponse>;
  getUserQuizResponses(userId: string): Promise<QuizResponse[]>;

  // Recommendation methods
  getRecommendations(): Promise<Recommendation[]>;
  getRecommendationsByMood(mood: string): Promise<Recommendation[]>;
  getLocationBasedRecommendations(lat: number, lng: number, radius?: number): Promise<Recommendation[]>;
  getRecommendationsWithCrowdData(): Promise<Recommendation[]>;

  // Itinerary methods
  getUserItinerary(userId: string): Promise<ItineraryItem[]>;
  createItineraryItem(item: InsertItineraryItem): Promise<ItineraryItem>;
  updateItineraryItem(id: string, updates: Partial<ItineraryItem>): Promise<void>;

  // Chat methods
  getChatHistory(userId: string): Promise<ChatMessage[]>;
  saveChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getPersonalizedChatResponse(userId: string, message: string, context?: any): Promise<string>;

  // Behavior tracking methods
  trackUserBehavior(behavior: InsertUserBehavior): Promise<UserBehavior>;
  getUserBehaviorPatterns(userId: string): Promise<UserBehavior[]>;
  getAdaptiveRecommendations(userId: string): Promise<Recommendation[]>;

  // Local places methods
  getLocalPlaces(lat: number, lng: number, category?: string): Promise<LocalPlace[]>;
  addLocalPlace(place: InsertLocalPlace): Promise<LocalPlace>;
  updateCrowdData(placeId: string, crowdData: any): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private quizResponses: Map<string, QuizResponse> = new Map();
  private recommendations: Map<string, Recommendation> = new Map();
  private itineraryItems: Map<string, ItineraryItem> = new Map();
  private chatMessages: Map<string, ChatMessage> = new Map();
  private userBehavior: Map<string, UserBehavior> = new Map();
  private localPlaces: Map<string, LocalPlace> = new Map();

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Seed recommendations with location data
    const sampleRecommendations = [
      {
        id: "rec1",
        title: "Secret Waterfall Trail",
        description: "A hidden oasis perfect for meditation and nature photography",
        imageUrl: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
        rating: 48,
        category: "Nature",
        moods: ["relax", "explore"],
        tags: ["Nature", "Peaceful"],
        isHiddenGem: true,
        location: {
          latitude: 35.6762,
          longitude: 139.6503,
          city: "Tokyo",
          country: "Japan",
          address: "Shibuya Forest Sanctuary",
          neighborhood: "Shibuya"
        },
        crowdData: {
          peakHours: ["10:00-12:00", "15:00-17:00"],
          bestTimeToVisit: "Early morning (7:00-9:00)",
          crowdLevel: "low" as const,
          lastUpdated: new Date().toISOString()
        },
        localInsights: {
          discoveredBy: "local" as const,
          localTips: ["Bring water shoes for the stream crossing", "Best photography light at golden hour"],
          seasonalInfo: "Most beautiful in autumn with fall colors",
          accessibilityInfo: "Moderate hiking required"
        }
      },
      {
        id: "rec2",
        title: "The Hidden Door",
        description: "Exclusive speakeasy known only to locals, featuring craft cocktails",
        imageUrl: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
        rating: 46,
        category: "Nightlife",
        moods: ["party"],
        tags: ["Nightlife", "Cocktails"],
        isHiddenGem: true,
        location: {
          latitude: 35.6694,
          longitude: 139.7018,
          city: "Tokyo",
          country: "Japan",
          address: "2-15-3 Ginza Underground",
          neighborhood: "Ginza"
        },
        crowdData: {
          peakHours: ["20:00-23:00"],
          bestTimeToVisit: "Weekdays after 18:00",
          crowdLevel: "medium" as const,
          lastUpdated: new Date().toISOString()
        },
        localInsights: {
          discoveredBy: "local" as const,
          localTips: ["Ask for the 'Tokyo Sunset' cocktail - not on menu", "Reservation recommended on weekends"],
          accessibilityInfo: "Basement level, stairs only"
        }
      },
      {
        id: "rec3",
        title: "Forgotten Temple Ruins",
        description: "Ancient architectural wonder with breathtaking sunrise views",
        imageUrl: "https://images.unsplash.com/photo-1545558014-8692077e9b5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
        rating: 49,
        category: "History",
        moods: ["explore"],
        tags: ["History", "Adventure"],
        isHiddenGem: true,
        location: {
          latitude: 35.7149,
          longitude: 139.7969,
          city: "Tokyo",
          country: "Japan",
          address: "Ueno Park Historic District",
          neighborhood: "Ueno"
        },
        crowdData: {
          peakHours: ["09:00-11:00", "14:00-16:00"],
          bestTimeToVisit: "Sunrise (6:00-7:30)",
          crowdLevel: "low" as const,
          lastUpdated: new Date().toISOString()
        },
        localInsights: {
          discoveredBy: "traveler" as const,
          localTips: ["Bring a flashlight for exploring inner chambers", "Perfect for sunrise photography"],
          seasonalInfo: "Cherry blossoms frame the ruins in spring",
          accessibilityInfo: "Some stairs and uneven ground"
        }
      }
    ];

    sampleRecommendations.forEach(rec => this.recommendations.set(rec.id, rec));

    // Seed local places
    const sampleLocalPlaces = [
      {
        id: "place1",
        name: "Grandmother's Kitchen",
        category: "Restaurant",
        location: {
          latitude: 35.6586,
          longitude: 139.7454,
          city: "Tokyo",
          country: "Japan",
          address: "3-22-8 Shimbashi",
          neighborhood: "Shimbashi"
        },
        discoveredBy: "local_tip" as const,
        popularity: 85,
        crowdData: {
          peakHours: ["12:00-13:00", "19:00-21:00"],
          bestTimeToVisit: "14:00-17:00 for quiet dining",
          crowdLevel: "high" as const,
          lastUpdated: new Date().toISOString()
        },
        localInsights: {
          tips: ["Order the daily special - it's always amazing", "Cash only establishment"],
          priceRange: "budget" as const,
          seasonalInfo: "Seasonal menu changes monthly"
        },
        isVerified: true,
        createdAt: new Date()
      }
    ];

    sampleLocalPlaces.forEach(place => this.localPlaces.set(place.id, place));
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id, travelDNA: null, currentLocation: null, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }

  async updateUserTravelDNA(userId: string, travelDNA: any): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.travelDNA = travelDNA;
      this.users.set(userId, user);
    }
  }

  async updateUserLocation(userId: string, location: any): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.currentLocation = location;
      this.users.set(userId, user);
    }
  }

  async saveQuizResponse(response: InsertQuizResponse): Promise<QuizResponse> {
    const id = randomUUID();
    const quizResponse: QuizResponse = { ...response, id, userId: response.userId || null, createdAt: new Date() };
    this.quizResponses.set(id, quizResponse);
    return quizResponse;
  }

  async getUserQuizResponses(userId: string): Promise<QuizResponse[]> {
    return Array.from(this.quizResponses.values()).filter(response => response.userId === userId);
  }

  async getRecommendations(): Promise<Recommendation[]> {
    return Array.from(this.recommendations.values());
  }

  async getRecommendationsByMood(mood: string): Promise<Recommendation[]> {
    return Array.from(this.recommendations.values()).filter(rec => 
      mood === 'all' || rec.moods.includes(mood)
    );
  }

  async getLocationBasedRecommendations(lat: number, lng: number, radius: number = 10): Promise<Recommendation[]> {
    return Array.from(this.recommendations.values()).filter(rec => {
      if (!rec.location) return false;
      const distance = this.calculateDistance(lat, lng, rec.location.latitude, rec.location.longitude);
      return distance <= radius;
    });
  }

  async getRecommendationsWithCrowdData(): Promise<Recommendation[]> {
    return Array.from(this.recommendations.values()).filter(rec => rec.crowdData);
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  async getUserItinerary(userId: string): Promise<ItineraryItem[]> {
    return Array.from(this.itineraryItems.values())
      .filter(item => item.userId === userId)
      .sort((a, b) => a.day - b.day);
  }

  async createItineraryItem(item: InsertItineraryItem): Promise<ItineraryItem> {
    const id = randomUUID();
    const itineraryItem: ItineraryItem = { ...item, id, userId: item.userId || null };
    this.itineraryItems.set(id, itineraryItem);
    return itineraryItem;
  }

  async updateItineraryItem(id: string, updates: Partial<ItineraryItem>): Promise<void> {
    const item = this.itineraryItems.get(id);
    if (item) {
      Object.assign(item, updates);
      this.itineraryItems.set(id, item);
    }
  }

  async getChatHistory(userId: string): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(message => message.userId === userId)
      .sort((a, b) => (a.timestamp?.getTime() || 0) - (b.timestamp?.getTime() || 0));
  }

  async saveChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const id = randomUUID();
    const chatMessage: ChatMessage = { ...message, id, userId: message.userId || null, context: message.context || null, aiPersonality: message.aiPersonality || null, timestamp: new Date() };
    this.chatMessages.set(id, chatMessage);
    return chatMessage;
  }

  async getPersonalizedChatResponse(userId: string, message: string, context?: any): Promise<string> {
    const user = await this.getUser(userId);
    const behavior = Array.from(this.userBehavior.values()).filter(b => b.userId === userId);
    
    // Analyze user's travel DNA and behavior patterns
    const travelDNA = user?.travelDNA;
    const conversationStyle = travelDNA?.conversationStyle;
    
    // Generate personalized responses based on user's personality
    const responses = [
      "Based on your love for authentic experiences, I'd recommend these local favorites...",
      "Since you enjoy cultural exploration, here are some hidden temples and art spaces...",
      "Given your adventurous spirit, let me suggest some off-the-beaten-path activities...",
      "Considering your social nature, here are great spots to meet locals and fellow travelers..."
    ];
    
    // Select response based on user's dominant travel DNA traits
    let responseIndex = 0;
    if (travelDNA) {
      if (travelDNA.cultural > 70) responseIndex = 1;
      else if (travelDNA.adventureSeeker > 70) responseIndex = 2;
      else if (travelDNA.social > 70) responseIndex = 3;
    }
    
    return responses[responseIndex];
  }

  async trackUserBehavior(behavior: InsertUserBehavior): Promise<UserBehavior> {
    const id = randomUUID();
    const userBehavior: UserBehavior = { ...behavior, id, userId: behavior.userId || null, itemId: behavior.itemId || null, location: behavior.location || null, mood: behavior.mood || null, timeOfDay: behavior.timeOfDay || null, weatherCondition: behavior.weatherCondition || null, companionType: behavior.companionType || null, rating: behavior.rating || null, feedback: behavior.feedback || null, timestamp: new Date() };
    this.userBehavior.set(id, userBehavior);
    return userBehavior;
  }

  async getUserBehaviorPatterns(userId: string): Promise<UserBehavior[]> {
    return Array.from(this.userBehavior.values()).filter(b => b.userId === userId);
  }

  async getAdaptiveRecommendations(userId: string): Promise<Recommendation[]> {
    const behavior = await this.getUserBehaviorPatterns(userId);
    const allRecommendations = Array.from(this.recommendations.values());
    
    // Analyze user behavior to adapt recommendations
    const preferences = this.analyzeBehaviorPatterns(behavior);
    
    return allRecommendations.filter(rec => {
      // Score recommendations based on user's demonstrated preferences
      if (preferences.skipsCultural && rec.category === 'Cultural') return false;
      if (preferences.lovesNature && rec.category === 'Nature') return true;
      if (preferences.prefersQuietPlaces && rec.crowdData?.crowdLevel === 'high') return false;
      return true;
    });
  }

  private analyzeBehaviorPatterns(behavior: UserBehavior[]) {
    const skipped = behavior.filter(b => b.actionType === 'skip');
    const favorited = behavior.filter(b => b.actionType === 'favorite');
    
    return {
      skipsCultural: skipped.filter(s => s.itemType === 'Cultural').length > 2,
      lovesNature: favorited.filter(f => f.itemType === 'Nature').length > 0,
      prefersQuietPlaces: behavior.filter(b => b.mood === 'relax').length > behavior.filter(b => b.mood === 'party').length
    };
  }

  async getLocalPlaces(lat: number, lng: number, category?: string): Promise<LocalPlace[]> {
    let places = Array.from(this.localPlaces.values());
    
    // Filter by location (within 5km radius)
    places = places.filter(place => {
      const distance = this.calculateDistance(lat, lng, place.location.latitude, place.location.longitude);
      return distance <= 5;
    });
    
    // Filter by category if specified
    if (category) {
      places = places.filter(place => place.category.toLowerCase() === category.toLowerCase());
    }
    
    return places;
  }

  async addLocalPlace(place: InsertLocalPlace): Promise<LocalPlace> {
    const id = randomUUID();
    const localPlace: LocalPlace = { ...place, id, crowdData: place.crowdData || null, localInsights: place.localInsights || null, popularity: place.popularity || 0, isVerified: place.isVerified || false, createdAt: new Date() };
    this.localPlaces.set(id, localPlace);
    return localPlace;
  }

  async updateCrowdData(placeId: string, crowdData: any): Promise<void> {
    const place = this.localPlaces.get(placeId);
    if (place) {
      place.crowdData = { ...place.crowdData, ...crowdData, lastUpdated: new Date().toISOString() };
      this.localPlaces.set(placeId, place);
    }
  }
}

export const storage = new MemStorage();
