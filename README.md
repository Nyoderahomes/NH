# NH

## Getting started

This repo serves the frontend and payment backend together from the Node/Express server in `server/index.js`.

### Run the app

1. Install server dependencies:
   ```bash
   npm install --prefix server
   ```
2. Start the app from the project root:
   ```bash
   npm start
   ```
3. Open the app in your browser at:
   ```text
   http://127.0.0.1:4242
   ```

### Notes

- Do not open `index.html` directly with a file or static server for payment flows.
- The backend must be running to handle `/create-mpesa-payment`, `/config`, and other payment routes.
- If you want hot reload during development, use:
  ```bash
  npm run dev
  ```
