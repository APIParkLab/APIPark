# Translation Workflow in Windsurf

Follow these steps to manage translations in the project:

1. **Scan for New Translations**
   * Navigate to the `frontend` directory
   * Run `pnpm run scan` to detect new translatable content

2. **Locate New Translation Fields**
   * Go to `packages/common/src/locales/scan/newJson`
   * Find the language-specific JSON files (e.g., en-US.json, ja-JP.json)
   * These files contain the new fields that need translation

3. **Apply Translations**
   * After translating the content, go to `packages/common/src/locales/scan`
   * Open the corresponding language JSON file include ja-JP.json,en-US.json,zh-CH.json,zh-TW.json
   * Paste the translated content into the appropriate file

4. **Save and Apply**
   * Save the file
   * Changes will take effect immediately
   * No additional build or restart is required

Note: Available language files are en-US.json, ja-JP.json, zh-CN.json, and zh-TW.json.