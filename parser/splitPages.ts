import * as fs from 'fs/promises';
import * as path from 'path';
import { JsonPage } from './types/page';

/**
 * Split a JSON file containing an array of pages into separate files
 * 
 * Usage:
 *   ts-node splitPages.ts input.json [output-directory]
 * 
 * Example:
 *   ts-node splitPages.ts parsed-pages.json ./pages
 */
async function splitPages() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('Usage: ts-node splitPages.ts <input-json-file> [output-directory]');
    console.error('');
    console.error('Example:');
    console.error('  ts-node splitPages.ts parsed-pages.json ./pages');
    console.error('  ts-node splitPages.ts parsed-pages.json');
    process.exit(1);
  }
  
  const inputFile = args[0];
  const outputDir = args[1] || './pages';
  
  try {
    // Read the input JSON file
    console.log(`Reading ${inputFile}...`);
    const fileContent = await fs.readFile(inputFile, 'utf-8');
    const pages: JsonPage[] = JSON.parse(fileContent);
    
    if (!Array.isArray(pages)) {
      throw new Error('Input file must contain a JSON array of pages');
    }
    
    console.log(`Found ${pages.length} pages`);
    
    // Create output directory if it doesn't exist
    await fs.mkdir(outputDir, { recursive: true });
    
    // Track pages per topic
    const pagesByTopic: Record<string, number> = {};
    
    // Write each page to a separate file
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      
      // Create topic subdirectory
      const topicDir = path.join(outputDir, page.topic);
      await fs.mkdir(topicDir, { recursive: true });
      
      // Generate filename from route or title
      // Remove topic prefix from route if it exists (since we're organizing by directory)
      let filename: string;
      if (page.route) {
        // Route is like "rules/armor-class", extract just "armor-class"
        const routeParts = page.route.split('/');
        filename = routeParts.length > 1 ? routeParts[routeParts.length - 1] : page.route;
        filename = `${filename}.json`;
      } else {
        filename = `${sanitizeFilename(page.title)}.json`;
      }
      
      const filePath = path.join(topicDir, filename);
      
      // Write the page as a pretty-printed JSON file
      await fs.writeFile(
        filePath,
        JSON.stringify(page, null, 2),
        'utf-8'
      );
      
      // Track pages per topic
      pagesByTopic[page.topic] = (pagesByTopic[page.topic] || 0) + 1;
      
      console.log(`  [${i + 1}/${pages.length}] Created: ${filePath}`);
    }
    
    console.log(`\nSuccessfully created ${pages.length} page files:`);
    Object.entries(pagesByTopic).forEach(([topic, count]) => {
      console.log(`  ${topic}: ${count} pages in ${path.join(outputDir, topic)}`);
    });
    
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error:', error.message);
    } else {
      console.error('Error:', error);
    }
    process.exit(1);
  }
}

/**
 * Sanitize a string to be used as a filename
 */
function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100); // Limit length
}

// Run if executed directly
if (require.main === module) {
  splitPages();
}

