import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import QuizCard from "@/components/quiz-card";
import { Globe, ArrowRight } from "lucide-react";
import { useTravelData } from "@/hooks/use-travel-data";

const questions = [
  {
    question: "What's your ideal vacation vibe?",
    options: [
      { text: "Adventure & Exploration", icon: "mountain", value: "adventure" },
      { text: "Relaxation & Wellness", icon: "spa", value: "relaxation" },
      { text: "Culture & History", icon: "palette", value: "culture" },
      { text: "Nightlife & Entertainment", icon: "cocktail", value: "nightlife" }
    ]
  },
  {
    question: "How do you prefer to discover new places?",
    options: [
      { text: "Detailed planning", icon: "list", value: "planned" },
      { text: "Spontaneous exploration", icon: "shuffle", value: "spontaneous" },
      { text: "Local recommendations", icon: "users", value: "local" },
      { text: "Hidden gems only", icon: "gem", value: "hidden" }
    ]
  },
  {
    question: "What's your travel budget style?",
    options: [
      { text: "Budget-conscious", icon: "piggy-bank", value: "budget" },
      { text: "Mid-range comfort", icon: "scale", value: "midrange" },
      { text: "Luxury experiences", icon: "crown", value: "luxury" },
      { text: "Flexible spending", icon: "credit-card", value: "flexible" }
    ]
  },
  {
    question: "How social are you when traveling?",
    options: [
      { text: "Love meeting new people", icon: "user-friends", value: "social" },
      { text: "Small group preferred", icon: "user-plus", value: "smallgroup" },
      { text: "Solo exploration", icon: "user", value: "solo" },
      { text: "Depends on the mood", icon: "settings", value: "flexible" }
    ]
  },
  {
    question: "What motivates your travel choices?",
    options: [
      { text: "Instagram-worthy spots", icon: "camera", value: "instagram" },
      { text: "Authentic experiences", icon: "heart", value: "authentic" },
      { text: "Learning opportunities", icon: "graduation-cap", value: "learning" },
      { text: "Pure relaxation", icon: "bed", value: "relaxation" }
    ]
  }
];

export default function OnboardingPage() {
  const [, setLocation] = useLocation();
  const { setCurrentScreen, calculateTravelDNA } = useTravelData();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleAnswerSelect = (value: string) => {
    setSelectedAnswer(value);
    setQuizAnswers(prev => ({ ...prev, [currentQuestionIndex]: value }));
  };

  const handleContinue = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(quizAnswers[currentQuestionIndex + 1] || null);
    } else {
      // Quiz completed - calculate travel DNA and navigate
      const travelDNA = calculateTravelDNA(quizAnswers);
      console.log("Travel DNA calculated:", travelDNA);
      setCurrentScreen('travel-dna');
      setLocation('/travel-dna');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 p-4 slide-in">
      {/* Header */}
      <div className="text-center py-8">
        <div className="mb-4">
          <Globe className="w-16 h-16 text-primary mx-auto" data-testid="globe-icon" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="welcome-title">
          Welcome to TravelMate AI
        </h1>
        <p className="text-muted-foreground" data-testid="welcome-subtitle">
          Let's discover your travel personality
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span data-testid="question-counter">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <span data-testid="progress-percent">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="w-full h-2" data-testid="quiz-progress" />
      </div>

      {/* Quiz Questions */}
      <div className="mb-8">
        <QuizCard
          question={questions[currentQuestionIndex]}
          selectedAnswer={selectedAnswer}
          onAnswerSelect={handleAnswerSelect}
          data-testid={`quiz-card-${currentQuestionIndex}`}
        />
      </div>

      {/* Continue Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/90 backdrop-blur">
        <Button
          onClick={handleContinue}
          disabled={!selectedAnswer}
          className="w-full py-4 text-lg font-semibold"
          size="lg"
          data-testid="continue-quiz-btn"
        >
          {currentQuestionIndex < questions.length - 1 ? 'Continue' : 'Complete Quiz'}
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
