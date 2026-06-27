const https = require('https');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

/**
 * Ask Google Gemini API for completion
 * @param {Array} contents conversation history
 * @param {string} systemInstruction system context rules
 * @param {number} retries number of retry attempts remaining
 * @returns {Promise<string>} AI response text (JSON string)
 */
function askGemini(contents, systemInstruction, retries = 3) {
  return new Promise((resolve, reject) => {
    if (!GEMINI_API_KEY) {
      reject(new Error("GEMINI_API_KEY is not configured. Falling back to local NLU."));
      return;
    }
    const postData = JSON.stringify({
      contents: contents,
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      },
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2
      }
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      port: 443,
      path: `/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 4000 // 4 seconds timeout
    };

    const attemptRequest = () => {
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const parsed = JSON.parse(data);
              if (parsed.candidates && parsed.candidates[0] && parsed.candidates[0].content && parsed.candidates[0].content.parts[0]) {
                resolve(parsed.candidates[0].content.parts[0].text);
              } else {
                reject(new Error("Empty candidates from Gemini response"));
              }
            } catch (e) {
              reject(new Error("Failed to parse Gemini response: " + e.message));
            }
          } else {
            handleRetryOrReject(
              new Error(`Gemini API returned status ${res.statusCode}: ${data}`),
              res.statusCode
            );
          }
        });
      });

      req.on('error', (e) => {
        handleRetryOrReject(e);
      });

      req.on('timeout', () => {
        req.destroy();
        handleRetryOrReject(new Error('Request to Gemini API timed out after 4s'));
      });

      req.write(postData);
      req.end();
    };

    const handleRetryOrReject = (error, statusCode) => {
      // Do not retry on client errors (4xx) such as 400, 403, 404, 429
      if (statusCode >= 400 && statusCode < 500) {
        console.warn(`Gemini API client error ${statusCode}. Skipping retries.`);
        reject(error);
        return;
      }

      if (retries > 0) {
        const delay = Math.pow(2, 4 - retries) * 1000; // Exponential backoff: 2s, 4s, 8s
        console.warn(`Gemini API request failed. Retrying in ${delay}ms... (Attempts left: ${retries}) Error: ${error.message}`);
        setTimeout(() => {
          askGemini(contents, systemInstruction, retries - 1).then(resolve).catch(reject);
        }, delay);
      } else {
        reject(error);
      }
    };

    attemptRequest();
  });
}

module.exports = {
  askGemini
};
