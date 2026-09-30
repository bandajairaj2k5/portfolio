/* ============================================================
   FAQ-FALLBACK.JS — Non-AI fallback answers matching resume
   ============================================================ */

const FAQ_FALLBACK = {
  entries: [
    {
      keywords: ["recruiter", "summary", "30-second", "tldr", "overview"],
      answer: "Jairaj is a final-year ECE student at Keshav Memorial College of Engineering focused on embedded firmware. He designed and built a quadcopter flight controller end to end (schematic, PCB, firmware) and wrote bare-metal STM32 drivers at register level. He is seeking an entry-level embedded/firmware role."
    },
    {
      keywords: ["quadcopter", "flight controller"],
      answer: "Quadcopter Flight Controller (Personal Project): Sole developer across schematic, PCB, and firmware bring-up for a quadcopter flight controller; tested firmware behaviour on physical hardware using STM32."
    },
    {
      keywords: ["stm32", "bare-metal", "baremetal", "register", "blackpill"],
      answer: "STM32 Bare-Metal Drivers: Wrote LED-blink and button-input drivers for the STM32F411 (BlackPill) using direct register manipulation only, with no HAL or CMSIS, verifying peripheral behaviour against the reference manual register map."
    },
    {
      keywords: ["rc car", "motor control", "tb6612", "drv8833"],
      answer: "ESP32-Based RC Car: Implemented PWM-based DC motor control using TB6612FNG/DRV8833 drivers with Blynk remote control; debugged driver and timing issues through incremental functional testing."
    },
    {
      keywords: ["weather station", "thingspeak", "dht22", "matlab"],
      answer: "IoT Weather Station & Cloud Dashboard: Built DHT22 sensing with Wi-Fi upload to a ThingSpeak dashboard and threshold-based email alerts; analysed logged data in MATLAB."
    },
    {
      keywords: ["radar", "ultrasonic"],
      answer: "Ultrasonic Radar System: Built a servo-driven ultrasonic radar sweep on ESP32 in C++, debugging sensor-noise and timing issues to produce a reliable distance-vs-angle scan."
    },
    {
      keywords: ["home automation"],
      answer: "ESP32 Home Automation System: Developed remote monitoring and control through the Blynk app over Wi-Fi."
    },
    {
      keywords: ["bunny", "android", "termux", "telegram bot"],
      answer: "BUNNY Personal Assistant Server: Converted an old Android phone into a lightweight always-on server using Termux, Python, and SQLite. Built a job-search pipeline with scheduled searches, scoring, and delivery through a Telegram bot."
    },
    {
      keywords: ["naradh", "ai task router", "gemini api", "routing"],
      answer: "NARADH Personal AI Task Router: Full-stack web application in Node.js/Express, SQLite, and Google Gemini API that analyses a prompt and routes it to the most suitable of 8 AI platforms based on intent classification."
    },
    {
      keywords: ["education", "college", "degree", "keshav", "school"],
      answer: "Education:\n• B.Tech in ECE — Keshav Memorial College of Engineering (JNTUH), CGPA: 6.05, Expected 2027\n• Intermediate (MPC) — Narayana Junior College (85%, 2023)\n• Schooling (ICSE) — Sri Sai Public School (80%, 2021)"
    },
    {
      keywords: ["skills", "technical skills", "languages", "tech stack"],
      answer: "Technical Skills:\n• Languages: Embedded C, C++, Python\n• Embedded Platforms: ESP32, ESP8266, STM32 (BlackPill F411CEU6), Arduino, sensor interfacing, PCB design and bringup\n• IoT & Software: MQTT/HTTP, Blynk, ThingSpeak, Node.js/Express, SQLite, Telegram Bot API, Google Gemini API\n• Other: ROS 2 (in progress)"
    },
    {
      keywords: ["certification", "certifications", "certs"],
      answer: "Certifications:\n1. JIJNASA National Certificate\n2. Aigen Labs Certification\n3. Outskill Certification\n4. KMCE Certification"
    },
    {
      keywords: ["contact", "email", "phone", "linkedin", "github"],
      answer: "Contact Jairaj:\n• Email: bandajairaj2k5@gmail.com\n• Phone: +91 76808 36062\n• LinkedIn: linkedin.com/in/banda-jairaj-b38b1527a\n• GitHub: github.com/bandajairaj2k5\n• Website: bandajairaj2k5.github.io/portfolio"
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

  default: "I am a portfolio assistant for Banda Jairaj. I can answer questions about his 8 resume projects (Quadcopter Flight Controller, STM32 Bare-Metal Drivers, ESP32 RC Car, IoT Weather Station, Ultrasonic Radar, ESP32 Home Automation, BUNNY Assistant Server, NARADH AI Task Router), technical skills, education at Keshav Memorial College of Engineering, and contact details."
};
