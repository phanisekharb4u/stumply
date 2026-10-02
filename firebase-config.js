// Stumply ↔ Firebase connection.
// Paste the two values from your Firebase project (Project settings → General →
// Your apps → Web app → SDK setup and configuration). Both are safe to publish:
// access is controlled by database.rules.json, not by keeping these secret.
window.STUMPLY_FIREBASE = {
  apiKey: "PASTE_API_KEY_HERE",
  databaseURL: "PASTE_DATABASE_URL_HERE"   // e.g. https://your-project-default-rtdb.firebaseio.com
};
