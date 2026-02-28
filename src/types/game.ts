export type CaseState = {
  _id: string;
  sourceType: string;
  difficulty: number;
  content?: any; // To support v3 7-layer structure without breaking types yet
  hint1?: string; // Legacy
  nextHint?: string; // Legacy
  // properties sent when finished
  answer?: string;
  teachingPoints?: string[];
  systemTags?: string[];
  diseaseTags?: string[];
};

export type GuessResult = {
  success: boolean;
  correct: boolean;
  normalizedGuess: string;
  finished: boolean;
  nextLayerIndex?: number;
  nextHintIndex?: number; // Legacy
  nextHint?: string;
  answer?: string;
  teachingPoints?: string[];
  systemTags?: string[];
  diseaseTags?: string[];
  message?: string;
};
