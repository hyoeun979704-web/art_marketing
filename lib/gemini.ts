import "server-only";

import { GoogleGenerativeAI } from "@google/generative-ai";

import { requireServerEnv } from "@/lib/env";

export const GEMINI_FLASH_MODEL = "gemini-1.5-flash";

let cached: GoogleGenerativeAI | null = null;

export function getGenerativeAI(): GoogleGenerativeAI {
  if (!cached) {
    cached = new GoogleGenerativeAI(requireServerEnv("GEMINI_API_KEY"));
  }
  return cached;
}

export function getFlashModel() {
  return getGenerativeAI().getGenerativeModel({ model: GEMINI_FLASH_MODEL });
}
