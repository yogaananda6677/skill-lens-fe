export type AcademicScores = Partial<Record<"numerik" | "bahasa" | "sains" | "sosial" | "teknologi" | "agama" | "kreativitas" | "softskill", number>>;

export type StudentProfileForm = {
  name: string;
  nisn: string;
  school: string;
  className: string;
  major: string;
  academicScores: AcademicScores;
  interests: string[];
  hobbies: string[];
  talents: string[];
  experiences: string[];
  achievements: string;
  goal: string;
};

export type MasterTagOption = {
  id: number;
  tipe: "minat" | "bakat" | "hobi" | "pengalaman" | string;
  label: string;
  mapped_key: string;
  kategori_hint?: string | null;
  sort_order?: number;
};

export type MasterTagGroups = {
  minat: MasterTagOption[];
  bakat: MasterTagOption[];
  hobi: MasterTagOption[];
  pengalaman: MasterTagOption[];
};

export type CriteriaBreakdown = {
  academic: number;
  interest: number;
  talentSkill: number;
  goalFit: number;
};

export type Recommendation = {
  id: string;
  title: string;
  category: "Kuliah" | "Karier" | "Pelatihan" | "Jalur Kerja" | string;
  score: number;
  fuzzyLabel: string;
  topsisRank: number;
  summary: string;
  reasons: string[];
  suggestedMajors: string[];
  criteria: CriteriaBreakdown;
  dominantFactors: string[];
};

export type RoadmapStep = {
  id: string;
  phase: string;
  title: string;
  description: string;
  duration: string;
  output: string;
  checklist: string[];
};

export type CareerRoadmap = {
  careerId: string;
  headline: string;
  targetRole: string;
  initialCompleted: number;
  steps: RoadmapStep[];
};
