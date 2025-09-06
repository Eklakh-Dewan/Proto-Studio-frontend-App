import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ChatMessage from "@/components/chat-message";
import { ArrowLeft, Send, Mic, Camera, MapPin, Bot, User, Brain, Heart, Sparkles } from "lucide-react";
import { useTravelData } from "@/hooks/use-travel-data";
import { apiRequest } from "@/lib/queryClient";
import { LocationService } from "@/lib/location-service";
import { BehaviorTracker } from "@/lib/behavior-tracker";
import type { ChatMessage as ChatMessageType } from "@shared/schema";

export default function ChatPage() {
  const [, setLocation] = useLocation();
  const { setCurrentScreen, travelDNA } = useTravelData();
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [aiPersonality, setAiPersonality] = useState<{
    tone: 'casual' | 'formal' | 'humorous' | 'enthusiastic';
    expertise: number;
    empathy: number;
  }>({ tone: 'casual', expertise: 75, empathy: 85 });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const locationService = LocationService.getInstance();
  const behaviorTracker = BehaviorTracker.getInstance();
  
  // Mock user ID for demo
  const userId = 'demo-user';

  const { data: chatHistory = [], isLoading } = useQuery<ChatMessageType[]>({
    queryKey: ['/api/chat', userId, 'history'],
    enabled: true,
  });

  // Adapt AI personality based on user's travel DNA
  useEffect(() => {
    if (travelDNA) {
      let tone: 'casual' | 'formal' | 'humorous' | 'enthusiastic' = 'casual';
      let expertise = 75;
      let empathy = 85;
      
      // Adapt tone based on personality
      if (travelDNA.adventureSeeker > 80) {
        tone = 'enthusiastic';
        expertise = 90;
      } else if (travelDNA.cultural > 80) {
        tone = 'formal';
        expertise = 95;
        empathy = 90;
      } else if (travelDNA.social > 80) {
        tone = 'humorous';
        empathy = 95;
      }
      
      setAiPersonality({ tone, expertise, empathy });
    }
  }, [travelDNA]);

  const sendMessageMutation = useMutation({
    mutationFn: async (messageText: string) => {
      // Get current location for context
      let currentLocation;
      try {
        const location = await locationService.getCurrentLocation();
        if (location) {
          currentLocation = {
            latitude: location.latitude,
            longitude: location.longitude,
            city: location.city
          };
        }
      } catch (error) {
        // Location not available
      }
      
      // Track chat message behavior
      await behaviorTracker.trackBehavior({
        userId,
        actionType: 'view',
        itemType: 'chat_message',
        context: {
          currentScreen: 'chat',
          searchQuery: messageText,
        },
        location: currentLocation
      });
      
      const response = await apiRequest('POST', '/api/chat/message', {
        userId,
        message: messageText,
        sender: 'user',
        context: {
          currentLocation,
          mood: getInferredMood(messageText),
          personalizedTone: aiPersonality.tone
        },
        aiPersonality: {
          responseStyle: aiPersonality.tone,
          knowledgeLevel: aiPersonality.expertise.toString(),
          enthusiasm: aiPersonality.empathy
        }
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat', userId, 'history'] });
      setMessage('');
      setIsTyping(true);
      // Simulate AI typing delay
      setTimeout(() => {
        setIsTyping(false);
        queryClient.invalidateQueries({ queryKey: ['/api/chat', userId, 'history'] });
      }, 2000);
    },
  });
  
  // Infer mood from message content
  const getInferredMood = (text: string): string => {
    const relaxKeywords = ['relax', 'calm', 'peaceful', 'quiet', 'spa', 'beach'];
    const partyKeywords = ['party', 'nightlife', 'bar', 'club', 'fun', 'drink'];
    const exploreKeywords = ['explore', 'adventure', 'hike', 'discover', 'new'];
    
    const lowerText = text.toLowerCase();
    
    if (relaxKeywords.some(keyword => lowerText.includes(keyword))) return 'relax';
    if (partyKeywords.some(keyword => lowerText.includes(keyword))) return 'party';
    if (exploreKeywords.some(keyword => lowerText.includes(keyword))) return 'explore';
    
    return 'all';
  };
  
  // Generate personalized welcome message based on travel DNA
  const getPersonalizedWelcome = (): string => {
    if (!travelDNA) {
      return "Hey there! I'm your AI travel twin. I've learned your preferences and I'm here to help plan your perfect trip. What destination are you thinking about?";
    }
    
    const { personality, adventureSeeker, cultural, social, spontaneous } = travelDNA;
    
    if (aiPersonality.tone === 'enthusiastic' && adventureSeeker > 70) {
      return `🎉 Hey adventure seeker! I can tell you're all about those epic experiences! As ${personality}, I'm super excited to help you discover some incredible hidden gems and off-the-beaten-path adventures. Where should we explore next?`;
    } else if (aiPersonality.tone === 'formal' && cultural > 70) {
      return `Greetings! I understand you appreciate cultural depth and authentic experiences. As ${personality}, I'm delighted to assist you in discovering meaningful destinations that align with your sophisticated travel preferences. Which region interests you most?`;
    } else if (aiPersonality.tone === 'humorous' && social > 70) {
      return `Hey there, social butterfly! 🦋 I see you're ${personality} - basically the life of the travel party! I'm here to help you find the coolest spots where you can meet amazing people and have unforgettable experiences. Ready to make some travel magic happen?`;
    } else {
      return `Hi! I'm your personalized AI travel twin. I've analyzed your travel DNA and see you're ${personality}. I'm here to suggest experiences that match your unique style. What kind of adventure are you in the mood for?`;
    }
  };
  
  // Generate adaptive response based on user behavior and DNA
  const getAdaptiveResponse = (): string => {
    if (!travelDNA) return "Perfect! Based on your interests, I'd recommend:";
    
    if (aiPersonality.tone === 'enthusiastic') {
      return "AMAZING choice! Your adventurous spirit is calling, and I've got some incredible discoveries for you:";
    } else if (aiPersonality.tone === 'formal') {
      return "Excellent selection. Given your appreciation for cultural authenticity, I recommend these distinguished experiences:";
    } else if (aiPersonality.tone === 'humorous') {
      return "Ooh, I love where your head's at! Your social radar is pinging, and I've got some spots that'll blow your mind:";
    } else {
      return "Great choice! Based on your travel style, here are some perfect matches:";
    }
  };
  
  // Get personalized recommendations based on travel DNA
  const getPersonalizedRecommendations = () => {
    if (!travelDNA) {
      return [
        { emoji: '🏔️', name: 'Kumano Kodo', description: 'Ancient pilgrimage trails' },
        { emoji: '🏠', name: 'Shirakawa-go', description: 'Traditional villages' },
        { emoji: '🌊', name: 'Naoshima Island', description: 'Art & nature fusion' }
      ];
    }
    
    const recommendations = [];
    
    if (travelDNA.adventureSeeker > 70) {
      recommendations.push(
        { emoji: '🏔️', name: 'Hidden Alpine Routes', description: 'Secret mountain trails locals use' },
        { emoji: '🏄', name: 'Underground Surf Spots', description: 'Waves only locals know about' }
      );
    }
    
    if (travelDNA.cultural > 70) {
      recommendations.push(
        { emoji: '🏛️', name: 'Artisan Workshops', description: 'Learn from master craftspeople' },
        { emoji: '🎭', name: 'Private Cultural Tours', description: 'Behind-scenes cultural experiences' }
      );
    }
    
    if (travelDNA.social > 70) {
      recommendations.push(
        { emoji: '🍻', name: 'Local Hangout Spots', description: 'Where locals actually socialize' },
        { emoji: '🎪', name: 'Community Events', description: 'Festivals & gatherings happening now' }
      );
    }
    
    if (travelDNA.spontaneous > 70) {
      recommendations.push(
        { emoji: '🎲', name: 'Mystery Adventures', description: 'Surprise experiences based on your mood' },
        { emoji: '🚪', name: 'Pop-up Experiences', description: 'Limited-time local events' }
      );
    }
    
    return recommendations.slice(0, 3);
  };
  
  // Generate follow-up question based on personality
  const getFollowUpQuestion = (): string => {
    if (aiPersonality.tone === 'enthusiastic') {
      return "Which one's calling your name? I can create an epic itinerary around any of these! 🚀";
    } else if (aiPersonality.tone === 'formal') {
      return "Would you prefer a detailed itinerary for any of these experiences? I can provide comprehensive planning assistance.";
    } else if (aiPersonality.tone === 'humorous') {
      return "So... which one's making your travel heart skip a beat? Let's make some magic happen! ✨";
    } else {
      return "Interested in any of these? I can help plan the perfect experience around your choice!";
    }
  };

  const handleBack = () => {
    setCurrentScreen('recommendations');
    setLocation('/recommendations');
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      sendMessageMutation.mutate(message.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Adaptive quick replies based on travel DNA
  const getQuickReplies = () => {
    if (!travelDNA) {
      return [
        "Tell me about Kumano Kodo",
        "Create full itinerary", 
        "Budget considerations"
      ];
    }
    
    const replies = [];
    
    if (travelDNA.adventureSeeker > 70) {
      replies.push("Show me adventure spots", "What about outdoor activities?");
    }
    
    if (travelDNA.cultural > 70) {
      replies.push("Cultural experiences nearby", "Local art & history");
    }
    
    if (travelDNA.social > 70) {
      replies.push("Where do locals hang out?", "Social events this week");
    }
    
    replies.push("Create personalized itinerary", "Best time to visit?");
    
    return replies.slice(0, 4);
  };
  
  const quickReplies = getQuickReplies();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Initialize with welcome message if no chat history
  useEffect(() => {
    if (!isLoading && chatHistory.length === 0) {
      sendMessageMutation.mutate("Hello! I'm interested in visiting Japan, but I want to avoid the typical tourist spots");
    }
  }, [isLoading, chatHistory.length]);

  return (
    <div className="min-h-screen bg-background flex flex-col slide-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white p-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="text-white hover:bg-white/20"
            data-testid="btn-back"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex-1 text-center">
            <h1 className="text-xl font-bold flex items-center justify-center" data-testid="title-ai-twin">
              <Brain className="w-5 h-5 mr-2" />
              AI Travel Twin
            </h1>
            <p className="text-white/80 text-sm flex items-center justify-center" data-testid="subtitle-advisor">
              <Sparkles className="w-3 h-3 mr-1" />
              {aiPersonality.tone === 'enthusiastic' && 'Adventurous & Excited'}
              {aiPersonality.tone === 'formal' && 'Cultural Expert'}
              {aiPersonality.tone === 'humorous' && 'Fun & Social'}
              {aiPersonality.tone === 'casual' && 'Friendly & Relaxed'}
            </p>
          </div>
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center relative">
            <Bot className="w-5 h-5" data-testid="icon-ai-avatar" />
            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${
              aiPersonality.tone === 'enthusiastic' ? 'bg-accent' :
              aiPersonality.tone === 'formal' ? 'bg-secondary' :
              aiPersonality.tone === 'humorous' ? 'bg-primary' : 'bg-muted'
            }`} />
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto" data-testid="chat-messages-container">
        {isLoading ? (
          <div className="text-center py-8" data-testid="loading-chat">
            <div className="text-muted-foreground">Loading conversation...</div>
          </div>
        ) : (
          <>
            {/* Welcome Message */}
            <ChatMessage
              message={{
                id: 'welcome',
                userId,
                message: getPersonalizedWelcome(),
                sender: 'ai',
                timestamp: new Date(),
                aiPersonality: {
                  responseStyle: aiPersonality.tone,
                  knowledgeLevel: aiPersonality.expertise.toString(),
                  enthusiasm: aiPersonality.empathy
                },
                context: null
              }}
              data-testid="message-welcome"
            />
            
            {chatHistory.map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                data-testid={`message-${msg.id}`}
              />
            ))}
            
            {/* Smart AI Response with Adaptive Content */}
            {chatHistory.some(msg => msg.sender === 'user') && (
              <div className="chat-bubble flex items-start space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  aiPersonality.tone === 'enthusiastic' ? 'bg-accent' :
                  aiPersonality.tone === 'formal' ? 'bg-secondary' :
                  aiPersonality.tone === 'humorous' ? 'bg-primary' : 'bg-primary'
                }`}>
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-muted p-3 rounded-lg rounded-tl-none max-w-xs">
                  <p className="text-sm mb-2">{getAdaptiveResponse()}</p>
                  <div className="space-y-2">
                    {getPersonalizedRecommendations().map((rec, index) => (
                      <div key={index} className="bg-card p-2 rounded text-xs">
                        {rec.emoji} <strong>{rec.name}</strong> - {rec.description}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm mt-2">{getFollowUpQuestion()}</p>
                </div>
              </div>
            )}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="chat-bubble flex items-start space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-primary`}>
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-muted p-3 rounded-lg rounded-tl-none max-w-xs">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.1s'}} />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.2s'}} />
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Adaptive Quick Reply Suggestions */}
        {chatHistory.length > 0 && (
          <div className="mb-4">
            <div className="text-xs text-muted-foreground mb-2 flex items-center">
              <Sparkles className="w-3 h-3 mr-1" />
              Suggestions based on your travel style:
            </div>
            <div className="flex flex-wrap gap-2">
              {quickReplies.map((reply) => (
                <Button
                  key={reply}
                  variant="outline"
                  size="sm"
                  onClick={() => setMessage(reply)}
                  className={`text-xs ${
                    aiPersonality.tone === 'enthusiastic' ? 'bg-accent/20 text-accent hover:bg-accent hover:text-white border-accent/30' :
                    aiPersonality.tone === 'formal' ? 'bg-secondary/20 text-secondary hover:bg-secondary hover:text-white border-secondary/30' :
                    aiPersonality.tone === 'humorous' ? 'bg-primary/20 text-primary hover:bg-primary hover:text-white border-primary/30' :
                    'bg-secondary/20 text-secondary hover:bg-secondary hover:text-white border-secondary/30'
                  }`}
                  data-testid={`quick-reply-${reply.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`}
                >
                  {reply}
                </Button>
              ))}
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 bg-card border-t border-border">
        <div className="flex items-center space-x-2 mb-2">
          <Input
            type="text"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 rounded-xl border-border bg-input"
            data-testid="input-chat-message"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || sendMessageMutation.isPending}
            className="rounded-xl p-3"
            data-testid="btn-send-message"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
          <Button variant="ghost" size="sm" className="flex items-center space-x-1 p-1" data-testid="btn-voice">
            <Mic className="w-4 h-4" />
            <span>Voice</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex items-center space-x-1 p-1" data-testid="btn-photo">
            <Camera className="w-4 h-4" />
            <span>Photo</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex items-center space-x-1 p-1" data-testid="btn-location">
            <MapPin className="w-4 h-4" />
            <span>Location</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
