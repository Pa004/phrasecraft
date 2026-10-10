export type Gender = "m" | "f";

export interface WordEntry {
  id: string;
  es: string;
  ascii: string;
  gender: Gender;
  stressedA?: boolean;
  animate: boolean;
  icon: string;
  tags: string[];
}

export type PasswordMode = "standard" | "compat";

export interface PasswordResult {
  words: WordEntry[];
  text: string;
  bits: number;
  mode: PasswordMode;
  listVersion: string;
}
