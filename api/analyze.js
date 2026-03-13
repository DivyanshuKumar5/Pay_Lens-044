const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async function handler(req, res) {
  // Allow frontend to connect safely
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  
  if (req.method === "OPTIONS") return res.status(200).end();
  
  try {
    const { sender, receiver, amount } = req.body;
    if (!sender || !amount) return res.status(400).json({ error: "Missing details" });

    // Connect to the Gemini API
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Analyze this UPI transaction: Sender: ${sender}, Receiver: ${receiver}, Amount: ${amount}. Is it likely fraud or legitimate? Answer in 2 short sentences.`;
    
    const result = await model.generateContent(prompt);
    
    // Fake a local score based on amount size for demonstration
    const score = amount > 50000 ? 85 : 20; 

    return res.status(200).json({
      score: score,
      analysis: result.response.text()
    });

  } catch (err) {
    return res.status(500).json({ error: "Server error", analysis: "AI unavailable. Check manually." });
  }
};
