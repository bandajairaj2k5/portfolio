/* ============================================================
   API/CHAT.JS — Vercel Serverless Function
   Relays chat questions to Google Gemini (free tier).
   The API key is stored in the GEMINI_API_KEY env var —
   NEVER hardcoded in client-side code.
   Falls back to local FAQ matching if the API is unavailable.
   ============================================================ */

// Inlined knowledge base (kept in sync with assets/data/knowledge-base.js)
// Vercel functions can't read from /assets at runtime, so this is duplicated here.
// To update the bot's knowledge, edit BOTH this file and assets/data/knowledge-base.js.
const KNOWLEDGE_BASE = `
ABOUT JAIRAJ:
Banda Jairaj is an Electronics and Communication Engineering student focused on Embedded Systems, Robotics, and IoT. He builds systems from the hardware up — working with microcontrollers, sensors, communication protocols, and embedded software to turn ideas into working physical systems. His interests are increasingly moving toward robotics and ROS 2, where embedded hardware, sensing, control, and software come together. He doesn't just want to make hardware run — he wants to understand why it works, what happens underneath the code, and how to make the complete system better.

PROJECTS:
1. ESP32 RC Car with Blynk IoT — A Wi-Fi controlled robotic car built around the ESP32 and controlled through Blynk IoT. Combines embedded programming, motor control, and wireless communication. Uses ESP32, L298N motor driver, DC motors, Blynk IoT platform, Wi-Fi. Status: Working.

2. ESP8266 Home Automation — An IoT home-automation system for remotely controlling electrical appliances with ESP8266. Includes voice control through Google Assistant and Amazon Alexa. Uses ESP8266, relay modules, IoT cloud platform. Status: Working.

3. Arduino Radar System — A radar-inspired object detection system that scans surroundings using an ultrasonic sensor (HC-SR04) mounted on a servo motor. Visualizes detected objects in real time using a Processing sketch on PC. Uses Arduino Uno, HC-SR04, SG90 servo, Processing. Status: Working.

SKILLS:
- Hardware: Arduino, ESP8266, ESP32, Sensors, Motor Drivers, Electronics
- Embedded: C, Embedded C, Microcontroller Programming
- Programming: Python, C
- Robotics: ROS 2, Robot Control, Sensor Integration
- Design: SOLIDWORKS, 3D Modelling
- IoT: Blynk, Wi-Fi Communication, Home Automation

CERTIFICATIONS:
(Certificate details to be added by Jairaj — currently placeholders.)

ROLES/EXPERIENCE:
Jairaj is a student. No specific employers or job titles to mention. Do not invent any.

CONTACT:
Email, LinkedIn, GitHub, and phone are available on the contact section of the portfolio website.

RULES:
- ONLY answer questions about Jairaj's portfolio, projects, skills, and engineering background.
- NEVER invent achievements, employers, technologies, or experiences not listed above.
- If asked about something unrelated, politely say you are a portfolio assistant and can only help with Jairaj's engineering background.
- Keep answers concise and friendly. Use a slightly playful but professional tone.
- For recruiter summaries, highlight: embedded systems focus, hands-on hardware+software projects, ESP32/ESP8266/Arduino experience, and growing interest in robotics/ROS 2.
`;

// Inlined FAQ fallback (synced with assets/data/faq-fallback.js)
const FAQ_ENTRIES = [
  { keywords: ["recruiter", "summary", "30-second", "tldr", "overview"],
    answer: "Here's a 30-second summary: Jairaj is an Electronics & Communication Engineering student focused on Embedded Systems, Robotics, and IoT. He has hands-on experience with ESP32, ESP8266, and Arduino, and has built working projects including a Wi-Fi-controlled RC car, a voice-controlled home automation system, and an Arduino-based radar. His interests are moving toward robotics and ROS 2. He builds systems from the hardware up — not just the code on top." },
  { keywords: ["esp32"],
    answer: "Yes, Jairaj works with the ESP32. He used it to build a Wi-Fi-controlled RC car with the Blynk IoT platform, combining embedded programming, motor control, and wireless communication. The ESP32 is one of his primary microcontrollers for IoT projects." },
  { keywords: ["esp8266"],
    answer: "Jairaj uses the ESP8266 for IoT projects. He built a home automation system with it that controls electrical appliances remotely and includes voice control via Google Assistant and Amazon Alexa." },
  { keywords: ["arduino"],
    answer: "Yes, Jairaj works with Arduino. He built an Arduino-based radar system using an HC-SR04 ultrasonic sensor mounted on a servo, with a real-time Processing visualization on PC." },
  { keywords: ["rc car", "robot car"],
    answer: "The ESP32 RC Car is a Wi-Fi-controlled robotic car. It uses an ESP32 microcontroller, an L298N motor driver, and two DC motors. It's controlled through the Blynk IoT mobile app, which sends joystick values over Wi-Fi that the firmware maps to motor speeds. Status: Working." },
  { keywords: ["home automation", "iot skills", "smart home"],
    answer: "Jairaj's ESP8266 Home Automation project demonstrates his IoT skills. It controls electrical appliances remotely via an app and voice assistants (Google Assistant, Amazon Alexa), using an ESP8266 and relay modules." },
  { keywords: ["radar"],
    answer: "The Arduino Radar System uses an HC-SR04 ultrasonic sensor on a rotating servo to scan a 180-degree arc. The Arduino sends angle and distance data over serial to a Processing sketch that renders a real-time radar display." },
  { keywords: ["ros", "ros2", "robotics"],
    answer: "Jairaj is actively learning ROS 2 (Robot Operating System 2). His interests are increasingly moving toward robotics, where embedded hardware, sensing, control, and software come together. He's currently in the learning phase with ROS 2." },
  { keywords: ["skills", "technologies", "tech stack", "work with"],
    answer: "Jairaj's skills: Hardware (Arduino, ESP8266, ESP32, Sensors, Motor Drivers, Electronics), Embedded (C, Embedded C, Microcontroller Programming), Programming (Python, C), Robotics (ROS 2, Robot Control, Sensor Integration), Design (SOLIDWORKS, 3D Modelling), IoT (Blynk, Wi-Fi Communication, Home Automation)." },
  { keywords: ["built", "projects", "made", "work"],
    answer: "Jairaj has built three main projects: 1) ESP32 RC Car with Blynk IoT (Wi-Fi-controlled robotic car), 2) ESP8266 Home Automation (voice-controlled appliance switching), 3) Arduino Radar System (ultrasonic scanning with Processing visualization). All are working systems." },
  { keywords: ["contact", "email", "reach", "linkedin", "github"],
    answer: "You can reach Jairaj via the Contact section of this site — links to Email, LinkedIn, GitHub, and Phone are all there." },
  { keywords: ["resume", "cv"],
    answer: "Jairaj's resume is available in the Resume section of this site — you can view it or download it as a PDF." },
  { keywords: ["certification", "certificate"],
    answer: "Certification details are being added soon. Check the Certifications section of the site for the latest." },
  { keywords: ["solidworks", "cad", "3d model"],
    answer: "Jairaj uses SOLIDWORKS for 3D CAD modelling — designing custom parts and enclosures for robotics and hardware projects." }
];

function faqMatch(question) {
  const q = (question || "").toLowerCase();
  for (const entry of FAQ_ENTRIES) {
    if (entry.keywords.some(kw => q.includes(kw))) return entry.answer;
  }
  return "I'm a portfolio assistant for Jairaj — I can tell you about his projects (ESP32 RC Car, ESP8266 Home Automation, Arduino Radar), his skills (Embedded Systems, IoT, Robotics, ROS 2), or give you a recruiter summary. Try asking \"What has Jairaj built?\" or \"Does he know ESP32?\"";
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json"
};

module.exports = async (req, res) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return res.status(200).setHeader("Access-Control-Allow-Origin", "*").end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { question } = req.body || {};
  if (!question || typeof question !== "string") {
    return res.status(400).json({ error: "Question is required" });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  // No API key — use FAQ fallback
  if (!apiKey) {
    return res.status(200).json({
      answer: faqMatch(question),
      fallback: true
    });
  }

  try {
    // Gemini free tier API (gemini-1.5-flash)
    const model = "gemini-1.5-flash-latest";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const systemInstruction = `You are JAIRAJ.AI, a portfolio assistant for Banda Jairaj, an engineering student. ${KNOWLEDGE_BASE} Answer the user's question based ONLY on this knowledge. Be concise, friendly, and slightly playful but professional. If the question is unrelated to Jairaj's portfolio, politely say you can only help with his engineering background.`;

    const body = {
      contents: [
        {
          role: "user",
          parts: [{ text: question }]
        }
      ],
      systemInstruction: { parts: [{ text: systemInstruction }] },
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
        topP: 0.9
      }
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`Gemini API returned ${response.status}`);
    }

    const data = await response.json();
    const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!answer) {
      throw new Error("No response text from Gemini");
    }

    return res.status(200).json({ answer: answer.trim(), fallback: false });
  } catch (err) {
    // API failed — fall back to FAQ
    console.error("Gemini API error:", err.message);
    return res.status(200).json({
      answer: faqMatch(question),
      fallback: true
    });
  }
};
