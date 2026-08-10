/* ============================================================
   FAQ-FALLBACK.JS — Non-AI fallback answers
   Used if the Gemini API is unavailable or not configured.
   Matches keywords to pre-written answers.
   ============================================================ */

const FAQ_FALLBACK = {
  // Keyword matching — first match wins
  entries: [
    {
      keywords: ["recruiter", "summary", "30-second", "tldr", "overview"],
      answer: "Here's a 30-second summary: Jairaj is an Electronics & Communication Engineering student focused on Embedded Systems, Robotics, and IoT. He has hands-on experience with ESP32, ESP8266, and Arduino, and has built working projects including a Wi-Fi-controlled RC car, a voice-controlled home automation system, and an Arduino-based radar. His interests are moving toward robotics and ROS 2. He builds systems from the hardware up — not just the code on top."
    },
    {
      keywords: ["esp32"],
      answer: "Yes, Jairaj works with the ESP32. He used it to build a Wi-Fi-controlled RC car with the Blynk IoT platform, combining embedded programming, motor control, and wireless communication. The ESP32 is one of his primary microcontrollers for IoT projects."
    },
    {
      keywords: ["esp8266"],
      answer: "Jairaz uses the ESP8266 for IoT projects. He built a home automation system with it that controls electrical appliances remotely and includes voice control via Google Assistant and Amazon Alexa."
    },
    {
      keywords: ["arduino"],
      answer: "Yes, Jairaj works with Arduino. He built an Arduino-based radar system using an HC-SR04 ultrasonic sensor mounted on a servo, with a real-time Processing visualization on PC."
    },
    {
      keywords: ["rc car", "robot car", "rcar"],
      answer: "The ESP32 RC Car is a Wi-Fi-controlled robotic car. It uses an ESP32 microcontroller, an L298N motor driver, and two DC motors. It's controlled through the Blynk IoT mobile app, which sends joystick values over Wi-Fi that the firmware maps to motor speeds. Status: Working."
    },
    {
      keywords: ["home automation", "iot skills", "smart home"],
      answer: "Jairaj's ESP8266 Home Automation project demonstrates his IoT skills. It controls electrical appliances remotely via an app and voice assistants (Google Assistant, Amazon Alexa), using an ESP8266 and relay modules."
    },
    {
      keywords: ["radar"],
      answer: "The Arduino Radar System uses an HC-SR04 ultrasonic sensor on a rotating servo to scan a 180-degree arc. The Arduino sends angle and distance data over serial to a Processing sketch that renders a real-time radar display."
    },
    {
      keywords: ["ros", "ros2", "robotics"],
      answer: "Jairaj is actively learning ROS 2 (Robot Operating System 2). His interests are increasingly moving toward robotics, where embedded hardware, sensing, control, and software come together. He's currently in the learning phase with ROS 2."
    },
    {
      keywords: ["skills", "technologies", "tech stack", "what does he know", "work with"],
      answer: "Jairaj's skills: Hardware (Arduino, ESP8266, ESP32, Sensors, Motor Drivers, Electronics), Embedded (C, Embedded C, Microcontroller Programming), Programming (Python, C), Robotics (ROS 2, Robot Control, Sensor Integration), Design (SOLIDWORKS, 3D Modelling), IoT (Blynk, Wi-Fi Communication, Home Automation)."
    },
    {
      keywords: ["built", "projects", "made", "work"],
      answer: "Jairaj has built three main projects: 1) ESP32 RC Car with Blynk IoT (Wi-Fi-controlled robotic car), 2) ESP8266 Home Automation (voice-controlled appliance switching), 3) Arduino Radar System (ultrasonic scanning with Processing visualization). All are working systems."
    },
    {
      keywords: ["contact", "email", "reach", "linkedin", "github"],
      answer: "You can reach Jairaj via the Contact section of this site — links to Email, LinkedIn, GitHub, and Phone are all there."
    },
    {
      keywords: ["resume", "cv"],
      answer: "Jairaj's resume is available in the Resume section of this site — you can view it or download it as a PDF."
    },
    {
      keywords: ["certification", "certificate", "certifications"],
      answer: "Certification details are being added soon. Check the Certifications section of the site for the latest."
    },
    {
      keywords: ["solidworks", "cad", "3d model"],
      answer: "Jairaj uses SOLIDWORKS for 3D CAD modelling — designing custom parts and enclosures for robotics and hardware projects."
    }
  ],

  match(question) {
    const q = question.toLowerCase();
    for (const entry of this.entries) {
      if (entry.keywords.some(kw => q.includes(kw))) {
        return entry.answer;
      }
    }
    return null;
  },

  default: "I'm a portfolio assistant for Jairaj — I can tell you about his projects (ESP32 RC Car, ESP8266 Home Automation, Arduino Radar), his skills (Embedded Systems, IoT, Robotics, ROS 2), or give you a recruiter summary. Try asking \"What has Jairaj built?\" or \"Does he know ESP32?\""
};
