import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import OnboardingPage from "@/pages/onboarding";
import TravelDNAPage from "@/pages/travel-dna";
import RecommendationsPage from "@/pages/recommendations";
import ChatPage from "@/pages/chat";
import ItineraryPage from "@/pages/itinerary";
import BottomNavigation from "@/components/bottom-navigation";
import FloatingActionButton from "@/components/floating-action-button";
import { useTravelData, TravelDataProvider } from "@/hooks/use-travel-data";

function Router() {
  const { currentScreen } = useTravelData();
  
  return (
    <div className="min-h-screen bg-background">
      <Switch>
        <Route path="/" component={OnboardingPage} />
        <Route path="/onboarding" component={OnboardingPage} />
        <Route path="/travel-dna" component={TravelDNAPage} />
        <Route path="/recommendations" component={RecommendationsPage} />
        <Route path="/chat" component={ChatPage} />
        <Route path="/itinerary" component={ItineraryPage} />
        <Route component={NotFound} />
      </Switch>
      
      {currentScreen !== 'onboarding' && (
        <>
          <BottomNavigation />
          <FloatingActionButton />
        </>
      )}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <TravelDataProvider>
          <Toaster />
          <Router />
        </TravelDataProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
