/* ============================================================
   PROJECTS.JS — Project data
   To edit: change the text in this file. To add a project,
   copy a project object and add it to the array.
   Image placeholders: replace the `image` field with a path
   to your photo in assets/projects/, e.g. "assets/projects/rc-car.jpg"
   GitHub links: replace `github` with your real repo URL.
   ============================================================ */

const PROJECTS = [
  {
    id: "esp32-rc-car",
    title: "ESP32 RC Car with Blynk IoT",
    short: "A Wi-Fi controlled robotic car built around the ESP32 and controlled through Blynk IoT, combining embedded programming, motor control and wireless communication.",
    tech: ["ESP32", "Blynk", "Motor Control", "IoT", "Wi-Fi"],
    status: "SYSTEM STATUS: WORKING ✓",
    statusType: "green",
    image: "", // PLACEHOLDER — add assets/projects/rc-car.jpg
    overview: "A Wi-Fi controlled robotic car built around the ESP32 microcontroller and the Blynk IoT platform. The car receives drive commands over Wi-Fi from a mobile app, translating them into real-time motor control. It demonstrates end-to-end embedded system design — from firmware on the chip to a cloud-connected control interface.",
    problem: "Building a responsive, real-time remote-controlled vehicle using off-the-shelf components requires solving latency, reliable wireless communication, and bidirectional motor control — all within the constraints of a low-cost microcontroller.",
    solution: "I used the ESP32's built-in Wi-Fi and the Blynk IoT platform to create a low-latency control channel. The ESP32 runs a firmware loop that subscribes to virtual pins from the Blynk app, maps incoming joystick values to motor speeds, and drives an L298N motor driver to control two DC motors with direction and speed.",
    howItWorks: [
      { title: "App → Cloud", desc: "Joystick values from the Blynk mobile app are sent to the Blynk cloud server over the internet." },
      { title: "Cloud → ESP32", desc: "The ESP32 maintains a persistent connection to Blynk and receives updated virtual pin values in near real-time." },
      { title: "Firmware Processing", desc: "The firmware maps joystick coordinates to left/right motor speeds, handling forward, reverse, and turning." },
      { title: "Motor Driver Output", desc: "PWM signals are sent to the L298N H-bridge to drive the two DC motors with the correct direction and speed." }
    ],
    hardware: ["ESP32 dev board", "L298N motor driver", "2× DC motors", "Chassis kit", "Li-ion battery pack", "Jumper wires"],
    software: ["Embedded C / Arduino framework", "Blynk IoT library", "PWM motor control", "Wi-Fi connectivity (WiFi.h)", "Blynk mobile app (iOS/Android)"],
    architecture: ["Blynk App", "Blynk Cloud", "ESP32 Wi-Fi", "Firmware Logic", "L298N Driver", "DC Motors"],
    circuitDiagram: "", // PLACEHOLDER — add assets/projects/rc-car-circuit.png
    buildPhotos: [], // PLACEHOLDER — add photo paths
    demoVideo: "", // PLACEHOLDER — add YouTube or video link
    challenges: "The main challenge was minimizing control latency over Wi-Fi. I tuned the Blynk write interval and used virtual pin updates efficiently to keep the car responsive. Power management was also important — the motor driver and ESP32 needed a stable supply under load.",
    results: "The car achieves responsive real-time control with sub-second latency over a standard Wi-Fi network, with smooth directional driving and speed control.",
    learned: "I deepened my understanding of PWM motor control, Wi-Fi-based IoT communication, and how to design firmware that reliably handles asynchronous network events while maintaining real-time motor output.",
    github: "" // PLACEHOLDER — add your GitHub repo URL
  },
  {
    id: "esp8266-home-automation",
    title: "ESP8266 Home Automation",
    short: "An IoT home-automation system for remotely controlling electrical appliances with ESP8266, including voice control through Google Assistant and Amazon Alexa.",
    tech: ["ESP8266", "IoT", "Google Assistant", "Alexa", "Home Automation"],
    status: "SYSTEM STATUS: WORKING ✓",
    statusType: "green",
    image: "",
    overview: "A home automation system that lets you control electrical appliances from anywhere using a smartphone, with added voice control through Google Assistant and Amazon Alexa. Built on the ESP8266, it connects appliances to the internet and exposes them to smart home ecosystems.",
    problem: "Making everyday appliances remotely controllable and voice-activated without expensive commercial smart-home hubs — using only a low-cost Wi-Fi microcontroller.",
    solution: "I built a system around the ESP8266 that connects to a cloud IoT platform, exposes relay-controlled outputs for appliances, and integrates with Google Assistant and Alexa via voice service bridges. Each appliance is toggled through app commands or voice triggers routed through the cloud.",
    howItWorks: [
      { title: "Voice/App Command", desc: "User issues a command via Google Assistant, Alexa, or the mobile app." },
      { title: "Cloud Relay", desc: "The command is routed through the IoT cloud platform to the ESP8266." },
      { title: "Relay Control", desc: "The ESP8266 toggles the appropriate GPIO pin, activating a relay that switches the appliance." },
      { title: "Status Feedback", desc: "The current state is synced back to the app and voice assistants." }
    ],
    hardware: ["ESP8266 (NodeMCU)", "Relay module (channel count depends on appliances)", "AC wiring (with proper safety precautions)", "Power supply"],
    software: ["Arduino framework / Embedded C", "IoT cloud platform (e.g. Blynk / Sinric / custom)", "Google Assistant integration", "Amazon Alexa integration", "Wi-Fi connectivity"],
    architecture: ["Voice Assistant", "Cloud Platform", "ESP8266", "Relay Module", "Appliances"],
    circuitDiagram: "",
    buildPhotos: [],
    demoVideo: "",
    challenges: "Working with AC mains requires strict attention to safety — proper relay isolation and wiring. Integrating with two different voice ecosystems (Google and Alexa) also required understanding their respective bridge services and device schemas.",
    results: "Multiple appliances can be toggled remotely via app or voice, with near-instant response time over a stable Wi-Fi connection.",
    learned: "I learned how to interface microcontrollers with cloud voice ecosystems, design safe relay control circuits for AC loads, and build a practical IoT product end-to-end.",
    github: ""
  },
  {
    id: "arduino-radar",
    title: "Arduino Radar System",
    short: "A radar-inspired object detection system that scans its surroundings using an ultrasonic sensor mounted on a servo and visualizes detected objects in real time.",
    tech: ["Arduino", "Ultrasonic Sensor", "Servo Motor", "Processing"],
    status: "SYSTEM STATUS: WORKING ✓",
    statusType: "green",
    image: "",
    overview: "A radar-inspired scanning system. An ultrasonic sensor mounted on a rotating servo sweeps a 180-degree arc, measuring distance at each angle. The data is sent to a PC running a Processing visualization that draws a real-time radar display showing detected objects.",
    problem: "Creating a low-cost, visual object detection and ranging system that mimics radar functionality using cheap, accessible components.",
    solution: "I combined an HC-SR04 ultrasonic sensor with a servo motor for angular scanning and an Arduino for control and data acquisition. The Arduino sends angle-distance pairs over serial to a Processing sketch that renders a polar radar display in real time.",
    howItWorks: [
      { title: "Servo Sweep", desc: "The Arduino rotates the servo from 0° to 180° in small increments." },
      { title: "Distance Measurement", desc: "At each angle, the HC-SR04 ultrasonic sensor fires and measures the time-of-flight of the echo to calculate distance." },
      { title: "Serial Transmission", desc: "Angle and distance data are sent to the PC over the serial port." },
      { title: "Visualization", desc: "A Processing sketch reads the serial data and draws a radar sweep with detected objects plotted on a polar grid." }
    ],
    hardware: ["Arduino Uno", "HC-SR04 ultrasonic sensor", "SG90 servo motor", "Mounting bracket", "Jumper wires", "Breadboard"],
    software: ["Arduino firmware (C/C++)", "Servo library", "NewPing / pulseIn for ultrasonic", "Processing (Java) for visualization", "Serial communication"],
    architecture: ["Servo Motor", "Ultrasonic Sensor", "Arduino", "Serial", "Processing Display"],
    circuitDiagram: "",
    buildPhotos: [],
    demoVideo: "",
    challenges: "Ultrasonic sensors have a limited beam width and can produce noisy readings. I averaged multiple pulses per angle and tuned the sweep speed to balance resolution and refresh rate. The Processing sketch needed smooth animation with fading trails for a convincing radar look.",
    results: "The system reliably detects objects within a 180° arc and ~4m range, displaying them on a real-time radar visualization with smooth sweep animation.",
    learned: "I gained experience with sensor fusion concepts (angle + distance), serial communication between an embedded device and a host PC, and real-time data visualization in Processing.",
    github: ""
  }
];
