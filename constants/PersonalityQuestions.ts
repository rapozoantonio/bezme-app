// constants/personalityQuestions.ts

// Define question types
export enum QuestionType {
    Energy = "Energy",
    Information = "Information",
    Decision = "Decision",
    Perception = "Perception",
    TieBreaker = "TieBreaker"
  }
  
  // Define question interface
  export interface PersonalityQuestion {
    id: string;
    text: string;
    type: QuestionType;
    tieBreaker?: string; // Optional: indicates which type this is a tie-breaker for
  }
  
  // All questions in order
  export const personalityQuestions: PersonalityQuestion[] = [
    // Energy Questions (E/I)
    { id: "Q1", text: "It's easy for you to connect with new people.", type: QuestionType.Energy },
    { id: "Q4", text: "You love being at busy bustling places more than at intimate & secluded ones.", type: QuestionType.Energy },
    { id: "Q9", text: "Being around people feels like your natural state.", type: QuestionType.Energy },
    
    // Information Questions (N/S)
    { id: "Q2", text: "If a decision feels right to you, you often act without needing proof.", type: QuestionType.Information },
    { id: "Q6", text: "You get excited by big visions, even if they seem unrealistic.", type: QuestionType.Information },
    { id: "Q10", text: "Manifestation is a big part of you life.", type: QuestionType.Information },
    
    // Decision Questions (T/F)
    { id: "Q3", text: "You usually make decisions with your head, not your heart.", type: QuestionType.Decision },
    { id: "Q7", text: "You rarely second-guess the choices that you have made.", type: QuestionType.Decision },
    { id: "Q11", text: "You often step back from emotions to see a situation clearly.", type: QuestionType.Decision },
    
    // Perception Questions (U/R)
    { id: "Q5", text: "You used to tone yourself down to be more accepted.", type: QuestionType.Perception },
    { id: "Q8", text: "You’ve been kind of an outsider as a kid.", type: QuestionType.Perception },
    { id: "Q12", text: "You often need more time to explain your ideas.", type: QuestionType.Perception },
    
    // Tie-Breaker Questions
    { id: "Q13", text: "People are naturally attracted to you and your energy.", type: QuestionType.TieBreaker, tieBreaker: "Visionnaire" },
    { id: "Q14", text: "When I commit to something, I follow the plan no matter how I feel.", type: QuestionType.TieBreaker, tieBreaker: "Builder" },
    { id: "Q15", text: "You often feel other's emotions, sometimes like they're your own.", type: QuestionType.TieBreaker, tieBreaker: "Flow" },
    { id: "Q16", text: "Norms and rules are BS. Who even needs them?", type: QuestionType.TieBreaker, tieBreaker: "Stranger" }
  ];