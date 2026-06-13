export const requireApiKey = (req, res, next) => {
  // We look for 'x-api-key' in the request headers
  const providedKey = req.header("x-api-key");
  
  // You can set this in your .env file as FRONTEND_API_KEY
  // Fallback string provided so the app doesn't immediately crash if the .env is missing it
  const validKey = process.env.FRONTEND_API_KEY || "GovtCompass-Secret-Key-2026";

  if (!providedKey || providedKey !== validKey) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid or missing API Key"
    });
  }

  next();
};
