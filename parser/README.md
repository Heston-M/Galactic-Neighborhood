# Google Docs Parser

This parser converts Google Docs into `JsonPage` format for use in the TGNApp.

## Setup

### 1. Copy Parser Directory

Copy the entire `parser/` directory to your isolated environment. The parser is self-contained and doesn't require any files from the parent project.

### 2. Install Dependencies

In the `parser/` directory:

```bash
npm install
```

### 3. Google Cloud Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use existing)
3. Enable the **Google Docs API**
4. Create credentials:
   - **Option A: Service Account** (recommended for automation)
     - Go to "IAM & Admin" > "Service Accounts"
     - Create a new service account
     - Create a key (JSON) and download it
     - Set `GOOGLE_APPLICATION_CREDENTIALS` environment variable to the path of the JSON file:
       ```bash
       # Windows (PowerShell)
       $env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\service-account-key.json"
       
       # Windows (CMD)
       set GOOGLE_APPLICATION_CREDENTIALS=C:\path\to\service-account-key.json
       
       # Linux/Mac
       export GOOGLE_APPLICATION_CREDENTIALS="./path/to/service-account-key.json"
       ```
   - **Option B: OAuth2** (for user authentication)
     - Go to "APIs & Services" > "Credentials"
     - Create OAuth 2.0 Client ID
     - Configure OAuth consent screen
     - Modify `googleDocsClient.ts` to use OAuth2 flow

### 4. Share Document

If using a service account:
- Share your Google Doc with the service account email (found in the JSON key file)
- Give it "Viewer" permissions

### 5. Configure Chapter Topics

Edit `config.ts` and fill in the `chapterTopicMap` with your chapter titles:

```typescript
export const chapterTopicMap: Record<string, Topic> = {
  "Introduction": "general",
  "Character Creation": "characters",
  "Equipment": "equipment",
  "Magic": "magic",
  "Combat": "rules",
  // ... add all your chapters
};
```

## Usage

### Command Line

From within the `parser/` directory:

```bash
# Parse a document by URL
npm run parse "https://docs.google.com/document/d/YOUR_DOC_ID/edit" output.json

# Or using ts-node directly
ts-node index.ts "https://docs.google.com/document/d/YOUR_DOC_ID/edit" output.json

# Or by document ID
ts-node index.ts YOUR_DOC_ID output.json
```

### Programmatic

```typescript
import { parseGoogleDocToPages } from './index';

const pages = await parseGoogleDocToPages('YOUR_DOCUMENT_ID_OR_URL');
console.log(`Parsed ${pages.length} pages`);
```

## Document Formatting Rules

The parser expects the following formatting:

### Chapters
- Chapter titles are **Header Level 1** (H1) in Google Docs
- Each chapter maps to a topic (configured in `config.ts`)

### Page Boundaries
- **H1, H2, and H3** in Google Docs all create new pages
- They do NOT map to `headingLevel` in the output

### Heading Levels
- **headingLevel = 1**: Underlined text (trailing underscores are removed)
- **headingLevel = 2**: Text with fontSize = 11

### Tables
- Headers are always **bold text**
- **Damage tables**: Only flipped tables, headers in left column
  - Uppermost header text → `damageTableOutput`
  - First row may be a title (non-bold)
- **Notes**: Tables with 1 column and 2 rows
  - First row = `noteTitle`, second row = `noteContent`
- **Lists in tables**: 1×1 tables containing lists are extracted as lists

### Aspects
- Always **bold and italic** text
- Always follow `headingLevel = 2` headers
- Format: "Name: Value" or just "Value" (name = empty string)

### Lists
- Can be simple list components or in 1×1 tables
- Bulleted or numbered

## Output

The parser generates an array of `JsonPage` objects. Each page includes:
- `title`: Page title
- `topic`: Topic from chapter mapping
- `route`: Generated route from title
- `sections`: Array of content sections

### Manual Review Required

After parsing, you'll need to manually add:
- `tableInfo.columnWidths` - Not extracted
- `tableInfo.wrappableColumns` - Not extracted

## Troubleshooting

### Authentication Errors
- Ensure `GOOGLE_APPLICATION_CREDENTIALS` is set correctly
- Verify the service account has access to the document
- Check that Google Docs API is enabled

### Missing Content
- Verify document formatting matches expected rules
- Check that headings use correct styles (H1/H2/H3)
- Ensure tables have bold headers

### Chapter Topic Mapping
- All pages from a chapter inherit the chapter's topic
- If a chapter isn't in the map, it defaults to "general"
- Make sure chapter titles match exactly (case-sensitive)

## Split Pages Script

After parsing, you can split the output JSON file into separate files for each page:

```bash
# Split parsed-pages.json into individual page files
npm run split parsed-pages.json ./pages

# Or using ts-node directly
ts-node splitPages.ts parsed-pages.json ./pages
```

This will create a separate JSON file for each page, named by the page's route (e.g., `combat-intro.json`). Files are saved in the specified output directory (defaults to `./pages`).

## File Structure

The parser is self-contained with the following structure:

```
parser/
├── index.ts              # Main entry point and parsing logic
├── config.ts              # Chapter-to-topic mapping configuration
├── extractors.ts           # Content extraction functions
├── utils.ts                # Utility functions
├── googleDocsClient.ts     # Google Docs API client
├── types/
│   ├── page.ts            # JsonPage type definition
│   ├── topic.ts           # Topic type definition
│   └── googleDocs.ts       # Google Docs API types
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── example.ts             # Example usage script
└── README.md              # This file
```

## Development

To modify the parser:
- `index.ts` - Main parsing logic
- `extractors.ts` - Content extraction functions
- `utils.ts` - Utility functions
- `config.ts` - Configuration (chapter topics)
- `googleDocsClient.ts` - Google Docs API client

