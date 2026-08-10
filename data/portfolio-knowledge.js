export const portfolioKnowledge = {
  profile: {
    name: 'Banda Jairaj',
    role: 'Electronics & Communication Engineering student',
    summary: 'Focused on embedded systems, IoT, electronics, and robotics with hands-on engineering experience.',
    education: [
      'B.Tech in Electronics & Communication Engineering at Bhoj Reddy Engineering College for Women.'
    ],
    strengths: [
      'Embedded systems',
      'IoT',
      'Electronics',
      'Robotics',
      'Firmware and hardware integration',
      'Hands-on prototyping'
    ],
    contact: {
      email: 'bandajairaj2k5@gmail.com',
      phone: '+91 76808 36062',
      linkedin: 'https://linkedin.com/in/banda-jairaj-b38b1527a',
      github: 'https://github.com/bandajairaj2k5',
      resume: 'assets/resume/Jairaj_Banda_Resume.pdf'
    }
  },
  skills: {
    languages: ['C', 'Embedded C', 'C++', 'Python'],
    hardware: ['Arduino', 'ESP32', 'ESP8266', 'STM32', 'Raspberry Pi'],
    protocols: ['I2C', 'SPI', 'UART', 'PWM', 'GPIO', 'MQTT', 'HTTP'],
    domains: ['Embedded systems', 'IoT', 'Electronics', 'Robotics', 'PCB design', 'ROS 2']
  },
  projects: [
    {
      id: 'esp32-rc-car',
      title: 'ESP32 RC Car with Blynk IoT',
      status: 'Completed',
      objective: 'Create a wireless RC car controlled from a smartphone over WiFi.',
      problem: 'Traditional RC cars rely on limited-range RF remotes and lack telemetry.',
      technologies: ['ESP32', 'C++', 'Blynk IoT', 'PWM', 'motor control'],
      hardware: ['ESP32 DevKit V1', 'L298N Motor Driver', 'DC Motors', '18650 Li-ion Battery Pack', 'Chassis and Wheels'],
      software: ['Arduino Framework', 'Blynk IoT Library', 'PWM motor control'],
      architecture: 'ESP32 acts as the controller and communicates with the Blynk app over WiFi for real-time command execution.',
      role: 'Builder and implementer of the embedded control and IoT interface.',
      features: ['Smartphone-based control', 'Real-time motor control', 'WiFi connectivity'],
      challenges: ['Power management under motor load', 'Voltage drop issues'],
      results: ['Smooth control over WiFi', 'Latency under 100ms', 'Battery and connection status exposed in the dashboard'],
      futureImprovements: ['Improve power regulation', 'Add better telemetry']
    },
    {
      id: 'esp8266-home',
      title: 'ESP8266 Home Automation',
      status: 'Completed',
      objective: 'Control lights and appliances through voice assistants and a smart-home setup.',
      problem: 'Needed a cost-effective way to automate home appliances without commercial smart switches.',
      technologies: ['ESP8266', 'C++', 'Google Assistant', 'Amazon Alexa', 'Relay modules'],
      hardware: ['NodeMCU ESP8266', '4-Channel Relay Module', '5V Power Supply', 'Jumper Wires', 'Enclosure'],
      software: ['Arduino', 'Sinric Pro SDK', 'WiFiManager'],
      architecture: 'ESP8266 controls relay outputs and integrates with voice assistants through a cloud-connected smart-home platform.',
      role: 'Built the controller and integration layer for appliance switching.',
      features: ['Voice control', 'Local network operation', 'Multiple appliance support'],
      challenges: ['Alexa discovery reliability'],
      results: ['Four appliances controllable via voice commands', 'Response time under 500ms'],
      futureImprovements: ['Improve provisioning reliability', 'Expand device support']
    },
    {
      id: 'arduino-radar',
      title: 'Arduino Radar System',
      status: 'Completed',
      objective: 'Build a radar-style object detection system using an ultrasonic sensor and servo sweep.',
      problem: 'Wanted to understand sensor fusion and spatial mapping without expensive LiDAR equipment.',
      technologies: ['Arduino', 'C++', 'Processing', 'Ultrasonic sensor', 'Servo motor'],
      hardware: ['Arduino Uno', 'HC-SR04 Ultrasonic Sensor', 'SG90 Servo Motor', 'Breadboard and Wires'],
      software: ['Arduino C++', 'Processing 3', 'Serial communication'],
      architecture: 'The ultrasonic sensor scans across a servo sweep while a Processing sketch visualizes the distance data as a radar display.',
      role: 'Designed the sensor sweep, data handling, and visualization flow.',
      features: ['Object detection', 'Radar-style visuals', 'Angle-based scanning'],
      challenges: ['Servo jitter and noisy readings'],
      results: ['Reliable detection up to 2m', 'Smooth visual display'],
      futureImprovements: ['Improve filtering', 'Add more accurate mapping']
    },
    {
      id: 'quadcopter-fc',
      title: 'DIY Quadcopter Flight Controller Build',
      status: 'In progress',
      objective: 'Develop a custom flight controller for a DIY quadcopter.',
      problem: 'Commercial flight controllers are often opaque, so a deeper understanding of stabilization was needed.',
      technologies: ['STM32', 'C++', 'PID control', 'IMU', 'PWM'],
      hardware: ['STM32F103C8T6', 'MPU6050', 'ESCs', 'Brushless Motors', 'LiPo Battery', 'Frame'],
      software: ['STM32 HAL / Arduino Core', 'Custom PID controller', 'Complementary filter', 'PWM generation'],
      architecture: 'STM32 reads IMU data and runs control loops that generate PWM for the motors.',
      role: 'Implemented the firmware and control approach for stabilization.',
      features: ['IMU-based control', 'Basic stabilization loop', 'Manual PID tuning'],
      challenges: ['IMU drift and tuning instability'],
      results: ['Motors respond to tilt', 'PID gains roughly tuned', 'Still working toward stable hover'],
      futureImprovements: ['Improve filtering', 'Tune PID gains further']
    }
  ],
  certifications: [
    { org: 'Aigen Labs', name: 'Drone Training Basics', year: '2024', notes: 'Drone-related foundational training.' },
    { org: 'Bhoj Reddy Engineering College', name: 'JIJNASA — Electronic Ensemble', year: '2024', notes: 'Electronics project showcase.' },
    { org: 'Bhoj Reddy Engineering College', name: 'JIJNASA — Vision Voyage', year: '2024', notes: 'Project showcase related to vision and electronics.' },
    { org: 'KMEC', name: 'Internal Hackathon — Participation', year: '2024', notes: 'Hackathon participation.' },
    { org: 'Outskill', name: 'AI Mastermind', year: '2026', notes: 'AI and Python fundamentals.' }
  ],
  resume: {
    summary: 'The portfolio includes a PDF resume. The website content and resume both point to embedded systems, IoT, electronics, robotics, projects, and certifications.',
    notes: 'If asked about any detail not clearly visible in the portfolio content, ARCHIE should say that the information is not explicitly documented rather than guessing.'
  },
  recruiterHints: {
    whyHire: 'He shows hands-on work across embedded systems, IoT, electronics, and robotics with project-based evidence rather than only theoretical knowledge.',
    bestFitRoles: ['Embedded systems engineer', 'IoT developer', 'Electronics engineer', 'Firmware engineer', 'Robotics/controls-focused engineer']
  }
};
