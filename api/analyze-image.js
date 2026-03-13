const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) return res.status(400).json({ error: "No image provided" });

    // Connect to Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Clean up the image string so Google can read it
    const cleanBase64 = imageBase64.split(",")[1];

    const prompt = "Act as a fraud investigator. Look at this UPI payment screenshot. Does it look like a fake generator app? Look for missing transaction IDs, weird fonts, or misaligned text. Give me a 2-sentence verdict.";

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: cleanBase64, mimeType: "image/jpeg" } },
    ]);

    return res.status(200).json({ analysis: result.response.text() });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ analysis: "Image scan failed. Ensure image is clear and under 4MB." });
  }
};
