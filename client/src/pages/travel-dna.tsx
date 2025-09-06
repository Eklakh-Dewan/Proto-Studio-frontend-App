import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import DonutChart from "@/components/donut-chart";
import { ArrowLeft, Dna } from "lucide-react";
import { useTravelData } from "@/hooks/use-travel-data";

export default function TravelDNAPage() {
  const [, setLocation] = useLocation();
  const { setCurrentScreen, travelDNA } = useTravelData();

  const handleBack = () => {
    setCurrentScreen('onboarding');
    setLocation('/onboarding');
  };

  const handleExploreRecommendations = () => {
    setCurrentScreen('recommendations');
    setLocation('/recommendations');
  };

  return (
    <div className="min-h-screen bg-background slide-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white p-4 pb-8">
        <div className="flex items-center mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="mr-4 text-white hover:bg-white/20"
            data-testid="btn-back"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-2xl font-bold" data-testid="title-travel-dna">Your Travel DNA</h1>
        </div>
        <p className="text-white/90" data-testid="subtitle-discover">
          Discover what makes you unique as a traveler
        </p>
      </div>

      <div className="p-4 -mt-4">
        {/* DNA Profile Card */}
        <Card className="shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-3">
                <Dna className="w-8 h-8 text-white" data-testid="dna-icon" />
              </div>
              <h2 className="text-xl font-bold text-foreground" data-testid="personality-type">
                {travelDNA?.personality || 'The Explorer'}
              </h2>
              <p className="text-muted-foreground" data-testid="personality-description">
                You seek adventure and authentic experiences
              </p>
            </div>

            {/* Donut Chart */}
            <div className="mb-6">
              <DonutChart
                value={travelDNA?.adventureSeeker || 75}
                label="Adventure Seeker"
                data-testid="adventure-chart"
              />
            </div>

            {/* Traits Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary" data-testid="trait-spontaneous">
                  {travelDNA?.spontaneous || 85}%
                </div>
                <div className="text-sm text-muted-foreground">Spontaneous</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-secondary" data-testid="trait-cultural">
                  {travelDNA?.cultural || 70}%
                </div>
                <div className="text-sm text-muted-foreground">Cultural</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-accent" data-testid="trait-social">
                  {travelDNA?.social || 60}%
                </div>
                <div className="text-sm text-muted-foreground">Social</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary" data-testid="trait-active">
                  {travelDNA?.active || 90}%
                </div>
                <div className="text-sm text-muted-foreground">Active</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations Teaser */}
        <Card className="shadow-lg">
          <CardHeader>
            <h3 className="text-lg font-semibold" data-testid="perfect-destinations-title">
              Perfect Destinations for You
            </h3>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
              <img
                src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80"
                alt="Mountain hiking destination"
                className="w-12 h-12 rounded-lg object-cover"
                data-testid="img-mountain-adventure"
              />
              <div>
                <div className="font-medium" data-testid="destination-mountain">Mountain Adventures</div>
                <div className="text-sm text-muted-foreground" data-testid="match-mountain">95% match</div>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
              <img
                src="https://images.unsplash.com/photo-1542640244-7e672d6cef4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80"
                alt="Cultural heritage temple"
                className="w-12 h-12 rounded-lg object-cover"
                data-testid="img-cultural-heritage"
              />
              <div>
                <div className="font-medium" data-testid="destination-cultural">Cultural Heritage</div>
                <div className="text-sm text-muted-foreground" data-testid="match-cultural">88% match</div>
              </div>
            </div>
            <Button
              onClick={handleExploreRecommendations}
              className="w-full mt-4"
              data-testid="btn-explore-recommendations"
            >
              Explore Recommendations
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
