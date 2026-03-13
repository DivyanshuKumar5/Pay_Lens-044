const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini using the environment variable (set this in Vercel later)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  // 1. Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    // 2. Grab the Base64 image string and file type from the frontend request
    const { imageBase64, mimeType } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ success: false, error: 'No image provided' });
    }

    // 3. Setup Gemini 1.5 Flash (Super fast for images + text)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // 4. The System Prompt
    const prompt = `
      You are a FinTech fraud investigator. Analyze this UPI payment screenshot. 
      Extract the Sender ID, Receiver ID, and Amount. 
      Flag any suspicious visual elements that might indicate a fake receipt generator (e.g., mismatched fonts, weird alignment, suspicious transaction IDs, unusual time formats).
      Keep the report concise, professional, and use bullet points.
    `;

    // 5. Package the image for Gemini
    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: mimeType || 'image/jpeg'
      }
    };

    // 6. Send to Google and wait for the response
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    // 7. Send the analysis back to the frontend!
    return res.status(200).json({ success: true, analysis: text });

  } catch (error) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
  }
}
