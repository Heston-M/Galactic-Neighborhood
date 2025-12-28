/**
 * Example usage of the Google Docs parser
 * 
 * Run with: ts-node parser/example.ts
 */

import { parseGoogleDocToPages } from './index';

async function main() {
  // Replace with your Google Doc ID or URL
  const documentIdOrUrl = 'YOUR_DOCUMENT_ID_OR_URL';
  
  try {
    console.log('Parsing document...');
    const pages = await parseGoogleDocToPages(documentIdOrUrl);
    
    console.log(`\nSuccessfully parsed ${pages.length} pages:\n`);
    
    pages.forEach((page, index) => {
      console.log(`${index + 1}. ${page.title} (${page.topic})`);
      console.log(`   Route: ${page.route}`);
      console.log(`   Sections: ${page.sections?.length || 0}`);
      console.log('');
    });
    
    // Optionally export to file
    // const { exportPagesToFile } = await import('./index');
    // await exportPagesToFile(pages, 'parsed-pages.json');
    
  } catch (error) {
    console.error('Error parsing document:', error);
    if (error instanceof Error) {
      console.error('Message:', error.message);
    }
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

