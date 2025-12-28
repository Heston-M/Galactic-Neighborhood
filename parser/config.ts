import { Topic } from './types/topic';

/**
 * Map chapter titles (H1 headings in Google Doc) to topics.
 * Fill this in with your actual chapter titles.
 */
export const chapterTopicMap: Record<string, Topic> = {
  // Example entries - replace with your actual chapter titles
  // "Introduction": "general",
  // "Character Creation": "characters",
  // "Equipment": "equipment",
  // "Magic": "magic",
  // "Combat": "rules",
};

/**
 * Get the topic for a given chapter title.
 * Returns "general" as default if chapter not found in map.
 */
export function getTopicForChapter(chapterTitle: string): Topic {
  return chapterTopicMap[chapterTitle] || "general";
}

