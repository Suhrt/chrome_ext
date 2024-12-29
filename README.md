Here's a README file in Markdown format explaining the features of your Chrome extension code:

---

# AI Helper Chrome Extension

This Chrome extension enhances coding platforms by integrating an AI assistant button seamlessly into the interface. The assistant provides contextual support for problem-solving by utilizing AI capabilities.

## Features

### 1. **URL Change Detection**
- Monitors URL changes dynamically using a `MutationObserver`.
- Detects and handles browser navigation events (`popstate`) and page reloads (`load`).
- Automatically re-initializes the extension on URL changes.

### 2. **Event Listeners for User and Problem Details**
- Listens for custom events to capture user ID and problem details:
  - Problem constraints, hints, input/output formats, notes, samples, and titles.
- Stores captured data in the `currentProblem` object for AI integration.

### 3. **Dynamic AI Button Creation**
- Adds a button labeled **AI Helper** next to the "Ask Doubt" button.
- Ensures the button:
  - Matches the style and positioning of the existing interface.
  - Dynamically adjusts for alignment issues by modifying the problem heading's style.

### 4. **Retry Logic for Button Insertion**
- Implements an exponential backoff mechanism for retries if the target element is not found.
- Limits retries to `maxRetries` (default: 10) to avoid infinite loops.

### 5. **Interactive Button Functionality**
- Handles mouse hover events to modify the appearance of the button.
- Click functionality:
  - Prompts the user to input an API key if not already provided.
  - Launches a chat interface for AI interaction.

### 6. **UI Cleanup**
- Ensures no duplicate UI elements are created by cleaning up old instances before initializing new ones.

### 7. **Chrome Storage Integration**
- Utilizes Chrome's storage API to persist user settings, such as the AI key, for a seamless user experience across sessions.

### 8. **Scalable SVG Icon**
- Embeds an SVG icon within the AI Helper button, enhancing its visual appeal.

## Installation
1. Clone or download the repository.
2. Load the extension in Chrome:
   - Open `chrome://extensions/`.
   - Enable **Developer Mode**.
   - Click **Load Unpacked** and select the extension directory.

## Usage
1. Navigate to a supported coding platform.
2. Look for the **AI Helper** button next to the "Ask Doubt" button.
3. Click the button to interact with the AI assistant for problem-solving help.

## Configuration
- The extension requires an API key for the AI functionality. The key can be provided via the popup that appears when clicking the AI Helper button for the first time.

## Limitations
- Currently, the AI Helper button is only added to platforms that have a clearly defined "Ask Doubt" button.
- May require modifications to work with different platform layouts.
- Only works on https://maang.in
