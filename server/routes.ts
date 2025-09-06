import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertQuizResponseSchema, insertChatMessageSchema, insertUserBehaviorSchema, insertLocalPlaceSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Quiz endpoints
  app.post("/api/quiz/response", async (req, res) => {
    try {
      const response = insertQuizResponseSchema.parse(req.body);
      const savedResponse = await storage.saveQuizResponse(response);
      res.json(savedResponse);
    } catch (error) {
      res.status(400).json({ error: "Invalid quiz response data" });
    }
  });

  app.get("/api/quiz/responses/:userId", async (req, res) => {
    try {
      const responses = await storage.getUserQuizResponses(req.params.userId);
      res.json(responses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch quiz responses" });
    }
  });

  app.post("/api/user/:userId/travel-dna", async (req, res) => {
    try {
      const { userId } = req.params;
      const { travelDNA } = req.body;
      await storage.updateUserTravelDNA(userId, travelDNA);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update travel DNA" });
    }
  });

  // Recommendations endpoints
  app.get("/api/recommendations", async (req, res) => {
    try {
      const { mood, lat, lng, radius } = req.query;
      let recommendations;
      
      // Location-based recommendations
      if (lat && lng) {
        recommendations = await storage.getLocationBasedRecommendations(
          parseFloat(lat as string), 
          parseFloat(lng as string), 
          radius ? parseInt(radius as string) : undefined
        );
        // Further filter by mood if specified
        if (mood && mood !== 'all') {
          recommendations = recommendations.filter(rec => rec.moods.includes(mood as string));
        }
      } else if (mood && mood !== 'all') {
        recommendations = await storage.getRecommendationsByMood(mood as string);
      } else {
        recommendations = await storage.getRecommendations();
      }
      
      res.json(recommendations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recommendations" });
    }
  });

  // Get recommendations with crowd data
  app.get("/api/recommendations/crowd-optimized", async (req, res) => {
    try {
      const recommendations = await storage.getRecommendationsWithCrowdData();
      res.json(recommendations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch crowd-optimized recommendations" });
    }
  });

  // Get adaptive recommendations based on user behavior
  app.get("/api/recommendations/adaptive/:userId", async (req, res) => {
    try {
      const recommendations = await storage.getAdaptiveRecommendations(req.params.userId);
      res.json(recommendations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch adaptive recommendations" });
    }
  });

  // Itinerary endpoints
  app.get("/api/itinerary/:userId", async (req, res) => {
    try {
      const itinerary = await storage.getUserItinerary(req.params.userId);
      res.json(itinerary);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch itinerary" });
    }
  });

  app.put("/api/itinerary/:itemId", async (req, res) => {
    try {
      const { itemId } = req.params;
      const updates = req.body;
      await storage.updateItineraryItem(itemId, updates);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update itinerary item" });
    }
  });

  // Chat endpoints
  app.get("/api/chat/:userId/history", async (req, res) => {
    try {
      const history = await storage.getChatHistory(req.params.userId);
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chat history" });
    }
  });

  app.post("/api/chat/message", async (req, res) => {
    try {
      const message = insertChatMessageSchema.parse(req.body);
      const savedMessage = await storage.saveChatMessage(message);
      
      // Generate personalized AI response
      if (message.sender === 'user') {
        const personalizedResponse = await storage.getPersonalizedChatResponse(
          message.userId || 'demo-user', 
          message.message, 
          message.context
        );
        
        const aiMessage = {
          userId: message.userId,
          message: personalizedResponse,
          sender: 'ai',
          context: message.context,
          aiPersonality: {
            responseStyle: 'friendly',
            knowledgeLevel: 'expert',
            enthusiasm: 85
          }
        };
        
        setTimeout(async () => {
          await storage.saveChatMessage(aiMessage);
        }, 1500);
      }
      
      res.json(savedMessage);
    } catch (error) {
      res.status(400).json({ error: "Invalid message data" });
    }
  });

  // Get personalized chat response
  app.post("/api/chat/personalized/:userId", async (req, res) => {
    try {
      const { message, context } = req.body;
      const response = await storage.getPersonalizedChatResponse(req.params.userId, message, context);
      res.json({ response });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate personalized response" });
    }
  });

  // User behavior tracking endpoints
  app.post("/api/behavior/track", async (req, res) => {
    try {
      const behavior = insertUserBehaviorSchema.parse(req.body);
      const savedBehavior = await storage.trackUserBehavior(behavior);
      res.json(savedBehavior);
    } catch (error) {
      res.status(400).json({ error: "Invalid behavior data" });
    }
  });

  app.get("/api/behavior/:userId/patterns", async (req, res) => {
    try {
      const patterns = await storage.getUserBehaviorPatterns(req.params.userId);
      res.json(patterns);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch behavior patterns" });
    }
  });

  // Local places endpoints
  app.get("/api/places/local", async (req, res) => {
    try {
      const { lat, lng, category } = req.query;
      if (!lat || !lng) {
        return res.status(400).json({ error: "Latitude and longitude required" });
      }
      
      const places = await storage.getLocalPlaces(
        parseFloat(lat as string),
        parseFloat(lng as string),
        category as string
      );
      res.json(places);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch local places" });
    }
  });

  app.post("/api/places/local", async (req, res) => {
    try {
      const place = insertLocalPlaceSchema.parse(req.body);
      const savedPlace = await storage.addLocalPlace(place);
      res.json(savedPlace);
    } catch (error) {
      res.status(400).json({ error: "Invalid place data" });
    }
  });

  app.put("/api/places/:placeId/crowd-data", async (req, res) => {
    try {
      const { crowdData } = req.body;
      await storage.updateCrowdData(req.params.placeId, crowdData);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update crowd data" });
    }
  });

  // User location update endpoint
  app.put("/api/user/:userId/location", async (req, res) => {
    try {
      const { location } = req.body;
      await storage.updateUserLocation(req.params.userId, location);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update user location" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
