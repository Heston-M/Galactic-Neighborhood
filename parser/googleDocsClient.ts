import { google } from 'googleapis';
import { GoogleDoc } from './types/googleDocs';

/**
 * Initialize Google Docs API client
 * 
 * You can use either:
 * 1. OAuth2 (for user authentication)
 * 2. Service Account (for server-to-server)
 * 
 * For service account, set GOOGLE_APPLICATION_CREDENTIALS environment variable
 * or pass credentials directly.
 */
export async function createGoogleDocsClient() {
  // Option 1: Use service account (recommended for automation)
  const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/documents.readonly'],
  });
  
  return google.docs({
    version: 'v1',
    auth: auth,
  });
}

/**
 * Fetch a Google Doc by document ID
 * 
 * @param documentId - The Google Doc ID (from the URL: /d/{documentId}/edit)
 */
export async function fetchGoogleDoc(documentId: string): Promise<GoogleDoc> {
  const docs = await createGoogleDocsClient();
  
  const response = await docs.documents.get({
    documentId: documentId,
  });
  
  if (!response.data) {
    throw new Error('Failed to fetch document');
  }
  
  // Map the response to our GoogleDoc type
  // The Google Docs API returns tables with the structure we expect, so we can pass it through
  const doc: GoogleDoc = {
    documentId: response.data.documentId || '',
    title: response.data.title || '',
    body: {
      content: (response.data.body?.content || []) as GoogleDoc['body']['content'],
    },
    lists: response.data.lists as GoogleDoc['lists'],
  };
  
  // Debug: check if any tables are in the content
  const tableCount = doc.body.content.filter(el => el.table).length;
  if (tableCount > 0) {
    console.log(`Found ${tableCount} tables in document`);
    // Log first table structure for debugging
    const firstTable = doc.body.content.find(el => el.table)?.table;
    if (firstTable) {
      console.log('First table structure:', {
        rows: firstTable.rows, // This is a number (count)
        tableRowsCount: firstTable.tableRows?.length || 0, // This is the array length
        tableRowsIsArray: Array.isArray(firstTable.tableRows),
        columns: firstTable.columns,
        keys: Object.keys(firstTable),
      });
    }
  }
  
  return doc;
}

/**
 * Extract document ID from Google Docs URL
 * 
 * Supports formats:
 * - https://docs.google.com/document/d/{id}/edit
 * - https://docs.google.com/document/d/{id}
 * - Just the ID itself
 */
export function extractDocumentId(urlOrId: string): string {
  // If it's already just an ID, return it
  if (!urlOrId.includes('/')) {
    return urlOrId;
  }
  
  // Extract ID from URL
  const match = urlOrId.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  
  throw new Error(`Could not extract document ID from: ${urlOrId}`);
}

