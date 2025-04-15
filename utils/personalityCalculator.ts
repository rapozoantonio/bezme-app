// utils/personalityCalculator.ts
import { QuestionType, personalityQuestions } from '@/constants/PersonalityQuestions';

// Define personality types
export enum PersonalityType {
  Visionnaire = "Visionnaire",
  Builder = "Builder",
  Flow = "Flow",
  Stranger = "Stranger"
}

// Define energy levels
export enum EnergyLevel {
  Extrovert = "Extrovert",
  Introvert = "Introvert",
  Neutral = "E+I" // Both extrovert and introvert
}

// Interface for personality result
export interface PersonalityResult {
  dominantType: PersonalityType;
  secondClosestType: PersonalityType | null;
  energyLevel: EnergyLevel;
  dimensionScores: {
    energy: number;
    information: number;
    decision: number;
    perception: number;
  };
}

// Calculate personality based on answers
export function calculatePersonality(answers: Record<string, number>): PersonalityResult {
  // Initialize scores for each dimension
  const dimensionScores = {
    energy: 0,
    information: 0,
    decision: 0,
    perception: 0
  };
  
  // Calculate dimension scores based on questions
  personalityQuestions.forEach(question => {
    const score = answers[question.id] || 0;
    
    switch (question.type) {
      case QuestionType.Energy:
        dimensionScores.energy += score;
        break;
      case QuestionType.Information:
        dimensionScores.information += score;
        break;
      case QuestionType.Decision:
        dimensionScores.decision += score;
        break;
      case QuestionType.Perception:
        dimensionScores.perception += score;
        break;
    }
  });
  
  // Determine traits based on scores
  // Energy: E (Extrovert) or I (Introvert)
  let energyTrait = dimensionScores.energy >= 9 ? 'E' : 
                    dimensionScores.energy <= 6 ? 'I' : 'E+I';
  
  // Information: N (Intuitive) or S (Sensing)
  let informationTrait = dimensionScores.information >= 9 ? 'N' : 
                         dimensionScores.information <= 6 ? 'S' : 'N+S';
  
  // Decision: T (Thinker) or F (Feeler)
  let decisionTrait = dimensionScores.decision >= 9 ? 'T' : 
                      dimensionScores.decision <= 6 ? 'F' : 'T+F';
  
  // Perception: U (Unconventional) or R (Relatable)
  let perceptionTrait = dimensionScores.perception >= 9 ? 'U' : 
                        dimensionScores.perception <= 6 ? 'R' : 'R+U';
  
  // Match to personality types based on traits
  // Each type has fixed traits:
  // Visionnaire: E + R
  // Builder: S + T
  // Flow: N + F
  // Stranger: N + U
  
  const typeScores = {
    [PersonalityType.Visionnaire]: 0,
    [PersonalityType.Builder]: 0,
    [PersonalityType.Flow]: 0,
    [PersonalityType.Stranger]: 0
  };
  
  // Calculate scores for each type
  // Visionnaire: E + R
  if (energyTrait === 'E' || energyTrait === 'E+I') typeScores[PersonalityType.Visionnaire]++;
  if (perceptionTrait === 'R' || perceptionTrait === 'R+U') typeScores[PersonalityType.Visionnaire]++;
  
  // Builder: S + T
  if (informationTrait === 'S' || informationTrait === 'N+S') typeScores[PersonalityType.Builder]++;
  if (decisionTrait === 'T' || decisionTrait === 'T+F') typeScores[PersonalityType.Builder]++;
  
  // Flow: N + F
  if (informationTrait === 'N' || informationTrait === 'N+S') typeScores[PersonalityType.Flow]++;
  if (decisionTrait === 'F' || decisionTrait === 'T+F') typeScores[PersonalityType.Flow]++;
  
  // Stranger: N + U
  if (informationTrait === 'N' || informationTrait === 'N+S') typeScores[PersonalityType.Stranger]++;
  if (perceptionTrait === 'U' || perceptionTrait === 'R+U') typeScores[PersonalityType.Stranger]++;
  
  // Find types with highest scores
  const sortedTypes = Object.entries(typeScores)
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0] as PersonalityType);
  
  // Check if there's a tie for top spot
  const isTopTie = typeScores[sortedTypes[0]] === typeScores[sortedTypes[1]];
  
  let dominantType = sortedTypes[0];
  let secondClosestType = sortedTypes[1];
  
  // If there's a tie, use tie-breaker questions
  if (isTopTie) {
    // Get tie-breaker questions for the tied types
    const tiebreakers = personalityQuestions.filter(
      q => q.type === QuestionType.TieBreaker && 
      (q.tieBreaker === sortedTypes[0] || q.tieBreaker === sortedTypes[1])
    );
    
    // Compare tie-breaker scores
    const tieScore1 = answers[tiebreakers.find(q => q.tieBreaker === sortedTypes[0])?.id || ''] || 0;
    const tieScore2 = answers[tiebreakers.find(q => q.tieBreaker === sortedTypes[1])?.id || ''] || 0;
    
    // Adjust types based on tie-breaker
    if (tieScore2 > tieScore1) {
      dominantType = sortedTypes[1];
      secondClosestType = sortedTypes[0];
    }
  }
  
  // Determine energy level based on energy trait
  const energyLevel = energyTrait === 'E' ? EnergyLevel.Extrovert :
                      energyTrait === 'I' ? EnergyLevel.Introvert :
                      EnergyLevel.Neutral;
  
  return {
    dominantType,
    secondClosestType,
    energyLevel,
    dimensionScores
  };
}