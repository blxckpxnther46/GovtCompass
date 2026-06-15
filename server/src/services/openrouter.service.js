let keyIndex = 0;

export async function fetchOpenRouter(body) {
  const configuredKeys = [
    { name: "OPENROUTER_API_KEY", value: process.env.OPENROUTER_API_KEY },
    { name: "OPENROUTER_API_KEY1", value: process.env.OPENROUTER_API_KEY1 },
    { name: "OPENROUTER_API_KEY2", value: process.env.OPENROUTER_API_KEY2 },
    { name: "OPENROUTER_API_KEY3", value: process.env.OPENROUTER_API_KEY3 },
    { name: "OPENROUTER_API_KEY4", value: process.env.OPENROUTER_API_KEY4 }
  ].filter(k => k.value);

  if (configuredKeys.length === 0) {
    throw new Error("No OpenRouter API keys configured");
  }

  // Sequentially cycle through keys on each request
  const startIndex = keyIndex % configuredKeys.length;
  keyIndex++;

  let lastError = null;

  for (let i = 0; i < configuredKeys.length; i++) {
    const currentKeyIndex = (startIndex + i) % configuredKeys.length;
    const currentKey = configuredKeys[currentKeyIndex];

    console.log(`[AI Key Trace] Attempting LLM call using Key Name: ${currentKey.name}`);

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${currentKey.value}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        console.log(`[AI Key Trace] Success using Key Name: ${currentKey.name}`);
        return response;
      }

      const errText = await response.text();
      lastError = new Error(`OpenRouter API error (status ${response.status}): ${errText}`);
      console.warn(`Key Name ${currentKey.name} failed: ${lastError.message}. Trying next key...`);
    } catch (err) {
      lastError = err;
      console.warn(`Fetch error with Key Name ${currentKey.name}: ${err.message}. Trying next key...`);
    }
  }

  throw lastError || new Error("All OpenRouter API keys failed");
}
