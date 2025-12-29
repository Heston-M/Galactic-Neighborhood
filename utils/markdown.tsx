import { Text } from "react-native";

/**
 * Parses markdown-style bold text at the start of a string.
 * 
 * If the text starts with **Bold text.**, it will be parsed into:
 * - A bold Text component for the bold portion
 * - A regular Text component for the remaining text
 * 
 * @param text - The text string to parse
 * @returns A React Native Text component with the bold text and the remaining text
 */
export function parseBoldText(text: string): React.ReactNode {
  const textStr = String(text);
  
  const boldMatch = textStr.match(/^\*\*(.+?)\*\*(.*)$/);
  
  if (boldMatch) {
    const [, boldContent, remainingText] = boldMatch;
    
    const components: React.ReactElement[] = [
      <Text key="bold" style={{ fontWeight: "bold" }}>
        {boldContent}
      </Text>,
    ];
    // Add remaining text
    if (remainingText.length > 0) {
      components.push(
        <Text key="normal">{remainingText}</Text>
      );
    }
    return components;
  }
  return textStr;
}

