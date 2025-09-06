import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Mountain, 
  Sparkles, 
  Palette, 
  Wine,
  List,
  Shuffle,
  Users,
  Gem,
  PiggyBank,
  Scale,
  Crown,
  CreditCard,
  UserPlus,
  User,
  Settings,
  Camera,
  Heart,
  GraduationCap,
  Bed
} from "lucide-react";

const iconMap = {
  mountain: Mountain,
  spa: Sparkles,
  palette: Palette,
  cocktail: Wine,
  list: List,
  shuffle: Shuffle,
  users: Users,
  gem: Gem,
  "piggy-bank": PiggyBank,
  scale: Scale,
  crown: Crown,
  "credit-card": CreditCard,
  "user-friends": Users,
  "user-plus": UserPlus,
  user: User,
  settings: Settings,
  camera: Camera,
  heart: Heart,
  "graduation-cap": GraduationCap,
  bed: Bed,
};

interface QuizCardProps {
  question: {
    question: string;
    options: Array<{
      text: string;
      icon: string;
      value: string;
    }>;
  };
  selectedAnswer: string | null;
  onAnswerSelect: (value: string) => void;
}

export default function QuizCard({ question, selectedAnswer, onAnswerSelect }: QuizCardProps) {
  return (
    <Card className="quiz-card active shadow-lg" data-testid="quiz-card">
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold mb-4" data-testid="quiz-question">
          {question.question}
        </h3>
        <div className="space-y-3">
          {question.options.map((option) => {
            const IconComponent = iconMap[option.icon as keyof typeof iconMap] || Heart;
            const isSelected = selectedAnswer === option.value;
            
            return (
              <Button
                key={option.value}
                variant="ghost"
                className={`w-full p-4 text-left justify-start h-auto transition-all ${
                  isSelected
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'bg-muted hover:bg-primary hover:text-primary-foreground'
                }`}
                onClick={() => onAnswerSelect(option.value)}
                data-testid={`quiz-option-${option.value}`}
              >
                <IconComponent className="w-5 h-5 mr-3 flex-shrink-0" />
                <span>{option.text}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
