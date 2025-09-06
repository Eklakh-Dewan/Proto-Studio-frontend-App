import { createContext, useContext, useState, ReactNode } from "react";

interface TravelDNA {
  adventureSeeker: number;
  spontaneous: number;
  cultural: number;
  social: number;
  active: number;
  personality: string;
  preferences: string[];
}

interface TravelDataContextType {
  currentScreen: string;
  setCurrentScreen: (screen: string) => void;
  travelDNA: TravelDNA | null;
  setTravelDNA: (dna: TravelDNA) => void;
  calculateTravelDNA: (answers: Record<number, string>) => TravelDNA;
}

const TravelDataContext = createContext<TravelDataContextType | undefined>(undefined);

export function TravelDataProvider({ children }: { children: ReactNode }) {
  const [currentScreen, setCurrentScreen] = useState('onboarding');
  const [travelDNA, setTravelDNA] = useState<TravelDNA | null>(null);

  const calculateTravelDNA = (answers: Record<number, string>): TravelDNA => {
    // Calculate personality scores based on answers
    let adventureSeeker = 0;
    let spontaneous = 0;
    let cultural = 0;
    let social = 0;
    let active = 0;

    // Question 1: vacation vibe
    switch (answers[0]) {
      case 'adventure':
        adventureSeeker += 30;
        active += 25;
        break;
      case 'relaxation':
        adventureSeeker += 10;
        active += 5;
        break;
      case 'culture':
        cultural += 30;
        adventureSeeker += 15;
        break;
      case 'nightlife':
        social += 30;
        active += 20;
        break;
    }

    // Question 2: discovery style
    switch (answers[1]) {
      case 'planned':
        spontaneous += 5;
        break;
      case 'spontaneous':
        spontaneous += 30;
        adventureSeeker += 20;
        break;
      case 'local':
        social += 25;
        cultural += 20;
        break;
      case 'hidden':
        adventureSeeker += 25;
        spontaneous += 15;
        break;
    }

    // Question 3: budget style
    switch (answers[2]) {
      case 'budget':
        adventureSeeker += 10;
        break;
      case 'midrange':
        adventureSeeker += 15;
        break;
      case 'luxury':
        social += 15;
        break;
      case 'flexible':
        spontaneous += 20;
        break;
    }

    // Question 4: social style
    switch (answers[3]) {
      case 'social':
        social += 30;
        break;
      case 'smallgroup':
        social += 20;
        break;
      case 'solo':
        social += 5;
        adventureSeeker += 15;
        break;
      case 'flexible':
        social += 15;
        spontaneous += 10;
        break;
    }

    // Question 5: motivation
    switch (answers[4]) {
      case 'instagram':
        social += 20;
        break;
      case 'authentic':
        cultural += 25;
        adventureSeeker += 20;
        break;
      case 'learning':
        cultural += 30;
        break;
      case 'relaxation':
        active += 5;
        break;
    }

    // Normalize scores to 0-100 range
    adventureSeeker = Math.min(100, Math.max(0, adventureSeeker + 25));
    spontaneous = Math.min(100, Math.max(0, spontaneous + 25));
    cultural = Math.min(100, Math.max(0, cultural + 25));
    social = Math.min(100, Math.max(0, social + 25));
    active = Math.min(100, Math.max(0, active + 25));

    // Determine personality type
    let personality = "The Explorer";
    if (adventureSeeker >= 70) {
      personality = "The Adventurer";
    } else if (cultural >= 70) {
      personality = "The Culture Seeker";
    } else if (social >= 70) {
      personality = "The Social Butterfly";
    } else if (spontaneous >= 70) {
      personality = "The Free Spirit";
    }

    const calculatedDNA: TravelDNA = {
      adventureSeeker,
      spontaneous,
      cultural,
      social,
      active,
      personality,
      preferences: Object.values(answers)
    };

    setTravelDNA(calculatedDNA);
    return calculatedDNA;
  };

  return (
    <TravelDataContext.Provider 
      value={{
        currentScreen,
        setCurrentScreen,
        travelDNA,
        setTravelDNA,
        calculateTravelDNA
      }}
    >
      {children}
    </TravelDataContext.Provider>
  );
}

export function useTravelData() {
  const context = useContext(TravelDataContext);
  if (context === undefined) {
    throw new Error('useTravelData must be used within a TravelDataProvider');
  }
  return context;
}
