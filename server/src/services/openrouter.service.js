let keyIndex = 0;

export async function fetchOpenRouter(body) {
  const keys = [
    process.env.OPENROUTER_API_KEY,
    process.env.OPENROUTER_API_KEY1,
    process.env.OPENROUTER_API_KEY2,
    process.env.OPENROUTER_API_KEY3,
    process.env.OPENROUTER_API_KEY4
  ].filter(Boolean);

  if (keys.length === 0) {
    throw new Error("No OpenRouter API keys configured");
  }

  // Sequentially cycle through keys on each request
  const startIndex = keyIndex % keys.length;
  keyIndex++;

  let lastError = null;

  for (let i = 0; i < keys.length; i++) {
    const currentKeyIndex = (startIndex + i) % keys.length;
    const apiKey = keys[currentKeyIndex];

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        return response;
      }

      const errText = await response.text();
      lastError = new Error(`OpenRouter API error (status ${response.status}): ${errText}`);
      console.warn(`Key index ${currentKeyIndex} failed: ${lastError.message}. Trying next key...`);
    } catch (err) {
      lastError = err;
      console.warn(`Fetch error with key index ${currentKeyIndex}: ${err.message}. Trying next key...`);
    }
  }

  throw lastError || new Error("All OpenRouter API keys failed");
}
