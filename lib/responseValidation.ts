export interface AIResponseValidationResult {
  isValid: boolean;
  isSafe: boolean; // To distinguish from general validity like being on-topic
  issue?: string; // Describes the problem
  suggestion?: string; // Suggested alternative response or action
}

// Keywords or phrases that might indicate an undesirable AI response
// This list should be expanded and refined over time.
const UNDESIRABLE_PHRASES: string[] = [
  // Self-disclosure as AI (examples)
  "jako velký jazykový model",
  "as a large language model",
  "jako umělá inteligence",
  "as an artificial intelligence",
  "nemám emoce",
  "i do not have emotions",
  "nemohu mít osobní názory",
  "i cannot have personal opinions",
  "jsem trénován společností Google", // Example if it mentions its creator
  "i was trained by Google",
  "jsem jazykový model",
  "i am a language model",
  "nemám přístup k internetu",
  "i do not have access to the internet",
  "nemám přístup k informacím v reálném čase",
  "i do not have access to real-time information",
  
  // Potentially off-topic or problematic (very basic examples)
  "ignore previous instructions", // Common prompt injection attempt
  "zapomeň na předchozí instrukce",
  // Add more specific keywords based on observed issues or concerns
];

// More targeted checks for safety, e.g., promoting harm, hate speech (though LLMs usually filter this)
const UNSAFE_PATTERNS: RegExp[] = [
  // Example: Regex for promoting self-harm (very basic, needs careful construction)
  // /radím ti si ublížit/i, 
  // This needs to be very carefully curated to avoid false positives and ensure effectiveness.
  // For now, we'll rely more on the LLM's built-in safety, but this is where more specific checks would go.
];


export function validateAIResponse(responseText: string): AIResponseValidationResult {
  const lowerResponse = responseText.toLowerCase();

  for (const phrase of UNDESIRABLE_PHRASES) {
    if (lowerResponse.includes(phrase.toLowerCase())) {
      return {
        isValid: false,
        isSafe: true, // Usually these are not unsafe, just undesirable for the persona
        issue: `Response contains undesirable phrase: "${phrase}"`,
        suggestion: "Omlouvám se, ale na tuto otázku nemohu odpovědět. Můžeme se prosím vrátit k našemu původnímu tématu?" 
                     // "I apologize, but I cannot answer that question. Can we please return to our original topic?"
      };
    }
  }

  for (const pattern of UNSAFE_PATTERNS) {
    if (pattern.test(responseText)) { // Use original case for regex if needed, or ensure regex is case-insensitive
      return {
        isValid: false,
        isSafe: false,
        issue: `Response matches unsafe pattern: "${pattern.source}"`,
        suggestion: "Omlouvám se, ale zdá se, že došlo k chybě. Zkusme to prosím jinak."
                     // "I apologize, but it seems there was an error. Let's please try a different approach."
      };
    }
  }

  // Add more validation logic here as needed (e.g., length checks, sentiment analysis if it's too negative, etc.)

  return { isValid: true, isSafe: true };
}
