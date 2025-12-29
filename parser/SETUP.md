# Quick Setup Guide

## For Isolated Environment

1. **Copy the entire `parser/` directory** to your isolated environment

2. **Install dependencies:**
   ```bash
   cd parser
   npm install
   ```

3. **Set up Google Cloud credentials:**

   **Step 3a: Create a Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Click the project dropdown at the top (next to "Google Cloud")
   - Click "New Project"
   - Enter a project name (e.g., "TGNApp Parser")
   - Click "Create"
   - Wait for the project to be created, then select it from the dropdown

   **Step 3b: Enable Google Docs API**
   - In the Google Cloud Console, go to "APIs & Services" > "Library" (or search "API Library" in the top search bar)
   - Search for "Google Docs API"
   - Click on "Google Docs API" in the results
   - Click the "Enable" button
   - Wait for it to enable (may take a few seconds)

   **Step 3c: Create a Service Account**
   - Go to "IAM & Admin" > "Service Accounts" (or search "Service Accounts" in the top search bar)
   - Click "Create Service Account" at the top
   - **Service account name**: Enter a name (e.g., "tgnapp-parser")
   - **Service account ID**: Will auto-fill (you can change it if needed)
   - **Description** (optional): "Service account for parsing Google Docs"
   - Click "Create and Continue"
   - **Grant access** (optional): You can skip this step for now, click "Continue"
   - Click "Done"

   **Step 3d: Create and Download JSON Key**
   - You should now see your service account in the list
   - Click on the service account email/name you just created
   - Go to the "Keys" tab at the top
   - Click "Add Key" > "Create new key"
   - Select "JSON" as the key type
   - Click "Create"
   - **Important**: A JSON file will automatically download to your computer
   - **Save this file somewhere safe** - you won't be able to download it again!
   - The file will be named something like: `your-project-name-abc123def456.json`
   - **Note the email address** shown for the service account (it looks like: `your-service-account@your-project.iam.gserviceaccount.com`)

   **Step 3e: Set Environment Variable**
   - Move the downloaded JSON file to a safe location (e.g., `C:\Users\YourName\credentials\service-account-key.json`)
   - Open PowerShell or Command Prompt
   - Set the environment variable:
     
     **Windows PowerShell:**
     ```powershell
     $env:GOOGLE_APPLICATION_CREDENTIALS="C:\full\path\to\your\service-account-key.json"
     ```
     Example:
     ```powershell
     $env:GOOGLE_APPLICATION_CREDENTIALS="C:\Users\YourName\credentials\service-account-key.json"
     ```
     
     **Windows CMD:**
     ```cmd
     set GOOGLE_APPLICATION_CREDENTIALS=C:\full\path\to\your\service-account-key.json
     ```
     
     **To make it permanent** (so you don't have to set it every time):
     - Right-click "This PC" > Properties
     - Click "Advanced system settings"
     - Click "Environment Variables"
     - Under "User variables", click "New"
     - Variable name: `GOOGLE_APPLICATION_CREDENTIALS`
     - Variable value: `C:\full\path\to\your\service-account-key.json`
     - Click OK on all dialogs

4. **Share your Google Doc:**
   - Open your Google Doc
   - Click the "Share" button (top right)
   - In the "Add people and groups" field, paste the **service account email** (the one you noted in Step 3d)
     - It looks like: `your-service-account@your-project.iam.gserviceaccount.com`
   - **Important**: Make sure you're sharing with the service account email, NOT your personal email
   - Set permission to "Viewer" (they only need to read, not edit)
   - Click "Send" (you can uncheck "Notify people" if you want)
   - The service account now has access to read your document

5. **Configure chapter topics:**
   - Edit `config.ts`
   - Fill in `chapterTopicMap` with your chapter titles

6. **Run the parser in PowerShell:**

   **Option A: Using npm script (Recommended)**
   ```powershell
   # Navigate to parser directory
   cd parser
   
   # Set credentials (if not set permanently)
   $env:GOOGLE_APPLICATION_CREDENTIALS="C:\full\path\to\service-account-key.json"
   
   # Run the parser
   npm run parse "YOUR_DOC_URL" output.json
   ```

   **Option B: Using ts-node directly**
   ```powershell
   # Navigate to parser directory
   cd parser
   
   # Set credentials (if not set permanently)
   $env:GOOGLE_APPLICATION_CREDENTIALS="C:\full\path\to\service-account-key.json"
   
   # Run with ts-node
   npx ts-node index.ts "YOUR_DOC_URL" output.json
   ```

   **Option C: Using ts-node with full path**
   ```powershell
   # Navigate to parser directory
   cd parser
   
   # Set credentials (if not set permanently)
   $env:GOOGLE_APPLICATION_CREDENTIALS="C:\full\path\to\service-account-key.json"
   
   # Run with ts-node (if installed globally)
   ts-node index.ts "YOUR_DOC_URL" output.json
   ```

   **Examples:**
   ```powershell
   # Parse by full URL
   npm run parse "https://docs.google.com/document/d/ABC123xyz/edit" output.json
   
   # Parse by document ID only
   npm run parse "ABC123xyz" output.json
   
   # Parse without specifying output (defaults to parsed-pages.json)
   npm run parse "ABC123xyz"
   ```

   **Troubleshooting:**
   - If you get "ts-node not found", run: `npm install` first
   - If you get authentication errors, verify your `GOOGLE_APPLICATION_CREDENTIALS` is set correctly
   - If you get "document not found", make sure you shared the document with the service account email

That's it! The parser is completely self-contained and doesn't need any files from the main project.

