# Theme Testing Instructions

Shopify Liquid themes are tested visually and functionally in the Shopify admin or with Shopify CLI. There are no automated unit tests for Liquid files, but you can validate and preview your theme as follows:

## 1. **Theme Preview (Recommended)**
- Upload your theme folder to your Shopify store.
- Use the Shopify admin's theme preview to test all pages, sections, and settings.
- Check for correct rendering, interactivity, and responsiveness.

## 2. **Shopify CLI (Local Development)**
- Install Shopify CLI: https://shopify.dev/docs/themes/tools/cli/installation
- In your theme directory, run:
  ```sh
  shopify theme dev
  ```
- This will open a local preview and hot-reload changes as you edit files.

## 3. **Theme Check (Linting)**
- Install Theme Check: https://shopify.github.io/theme-check/
- Run in your theme directory:
  ```sh
  theme-check
  ```
- This will report Liquid, JSON, and best practice errors.

## 4. **Manual QA**
- Test all product, collection, and cart flows.
- Check mobile and desktop layouts.
- Validate accessibility (keyboard navigation, screen reader labels).

---

**Note:**
- Automated tests (like Jest or Mocha) are not applicable to Liquid/Shopify themes.
- Use Shopify's preview and Theme Check for best results.
