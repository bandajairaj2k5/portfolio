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
      overview: 'Wi-Fi-controlled robotic RC car built around an ESP32 microcontroller controlled wirelessly using a smartphone via Blynk IoT platform instead of a traditional physical RF remote.',
      objective: 'Build a remotely controllable robotic vehicle using ESP32 over Wi-Fi via smartphone interface to demonstrate IoT motor control.',
      hardware: ['ESP32 Development Board', 'L298N Motor Driver', 'DC Geared Motors', 'Robot Car Chassis', 'Wheels', 'Smartphone', '18650 Li-ion Battery Pack', 'Jumper Wires'],
      software: ['Arduino IDE (C/C++)', 'ESP32 Libraries', 'Blynk IoT Library', 'PWM Motor Control'],
      roleOfESP32: 'Acts as main controller: connects to Wi-Fi, receives Blynk commands from smartphone, converts them into motor-control GPIO signals for L298N motor driver.',
      roleOfBlynk: 'Provides smartphone user interface (Forward, Backward, Left, Right, Stop) and IoT communication layer.',
      dataFlow: 'Smartphone → Blynk → Wi-Fi → ESP32 → Motor Driver → Motors → Vehicle Movement',
      engineeringConcepts: 'User Interface → Wireless Communication → Microcontroller → Actuator Control (ESP32 bridges digital IoT interface to physical motors).',
      interviewQnA: [
        { q: 'Why use ESP32?', a: 'ESP32 provides integrated Wi-Fi, dual-core processing, and rich GPIO peripherals for compact IoT robotics.' },
        { q: 'Why use Blynk?', a: 'Blynk provides an instant smartphone interface and IoT cloud backend, eliminating the need to write custom Android/iOS apps.' },
        { q: 'What is the role of the motor driver?', a: 'ESP32 GPIO pins cannot supply the high current required by DC motors. The motor driver acts as a high-power interface between ESP32 control logic and the motor power supply.' },
        { q: 'What happens when you press Forward?', a: 'Smartphone sends command via Blynk over Wi-Fi -> ESP32 receives command -> generates GPIO control signals -> motor driver drives both motors forward.' }
      ],
      futureImprovements: ['Speed control using PWM', 'Obstacle detection via Ultrasonic sensors', 'Autonomous navigation', 'Camera streaming', 'GPS tracking', 'Battery monitoring', 'Bluetooth fallback control']
    },
    {
      id: 'esp8266-home',
      title: 'ESP8266 Home Automation',
      status: 'Completed',
      overview: '4-channel IoT home automation system using ESP8266 NodeMCU to remotely control household electrical appliances via voice commands using Amazon Alexa and Google Assistant.',
      objective: 'Develop a multi-channel wireless voice-controlled home automation system allowing appliance switching without physical manual switches.',
      hardware: ['NodeMCU ESP8266', '4-Channel Relay Module', 'Electrical Appliances / Loads', '5V Power Supply', 'Wi-Fi Network', 'Alexa / Google Assistant Devices'],
      software: ['Arduino IDE (C/C++)', 'ESP8266 Core', 'Sinric Pro SDK', 'WiFiManager'],
      roleOfESP8266: 'Central controller connecting to Wi-Fi, receiving cloud commands from voice assistants, and toggling corresponding relay GPIO output channels.',
      whyRelays: 'ESP8266 operates at low-voltage 3.3V logic, while appliances operate at high mains voltages. Relays provide electrical switching and isolation (ESP8266 → Relay → Appliance).',
      dataFlow: 'User Voice Command → Alexa / Google Assistant → IoT Service → ESP8266 → GPIO Output → Relay → Appliance ON/OFF',
      safetyConsiderations: 'Isolation between low-voltage electronics and hazardous mains voltage, relay power ratings, fused protection, grounded enclosure, proper insulation.',
      interviewQnA: [
        { q: 'Why use ESP8266 instead of Arduino Uno?', a: 'ESP8266 features built-in Wi-Fi for cloud and voice assistant connectivity, whereas a basic Arduino Uno requires external network shields.' }
      ],
      futureImprovements: ['Mobile dashboard', 'Energy monitoring & current sensing', 'Automatic scheduling', 'Motion & temperature-based automation', 'MQTT architecture', 'Local/offline control & physical manual override switches']
    },
    {
      id: 'arduino-radar',
      title: 'Arduino Radar System',
      status: 'Completed',
      overview: 'Ultrasonic radar visualization system using an Arduino Uno, HC-SR04 ultrasonic sensor, SG90 servo motor, and Processing desktop visualization.',
      objective: 'Demonstrate distance sensing, servo sweep mechanics, serial communication, and real-time graphical radar UI mapping.',
      hardware: ['Arduino Uno', 'HC-SR04 Ultrasonic Sensor', 'SG90 Servo Motor', 'Computer', 'Connecting Wires & Breadboard'],
      software: ['Arduino IDE (C/C++)', 'Processing 3 (Java UI)', 'Serial Communication'],
      workingPrinciple: 'Distance = (Time × Speed of Sound) / 2. Sensor sends ultrasonic pulse, measures echo return time divided by 2 for round-trip travel.',
      roleOfArduino: 'Rotates servo 0° to 180°, triggers ultrasonic pulse, measures echo, calculates distance at each angle, and streams (angle, distance) pairs over Serial at 9600 baud.',
      dataFlow: 'Servo Angle → Ultrasonic Measurement → Distance Calculation → Arduino → Serial Communication → Processing → Radar Display Visualization',
      engineeringConcepts: 'Sensing + Actuation + Serial Communication + Real-time Visualization.',
      interviewQnA: [
        { q: 'Why is the ultrasonic sensor mounted on a servo?', a: 'A fixed ultrasonic sensor only measures distance in one direction. Mounting it on a sweeping servo allows scanning multiple angles to construct a 180° spatial map.' }
      ],
      futureImprovements: ['Multiple ultrasonic sensors', 'LiDAR sensor upgrade', 'Object tracking algorithms', 'Wireless communication', '2D/3D visual mapping']
    },
    {
      id: 'quadcopter-fc',
      title: 'DIY Quadcopter Flight Controller',
      status: 'In Progress',
      overview: 'Most technically advanced project — developing a custom flight controller for a quadcopter from scratch using an STM32 microcontroller, MPU6050 IMU, PID control loops, and ESC motor mixing.',
      objective: 'Understand and implement fundamental drone flight control algorithms, attitude estimation, PID stabilization, and high-speed motor mixing from first principles.',
      hardware: ['STM32 Microcontroller (F103C8T6 Blue Pill)', 'MPU6050 IMU (Accelerometer + Gyroscope)', '4x ESCs (Electronic Speed Controllers)', '4x Brushless Motors', 'LiPo Battery', 'Quadcopter Frame'],
      software: ['STM32 HAL / Arduino Core (C++)', 'Custom PID Controller', 'Complementary Filter', 'PWM Generation (Timer Interrupts)'],
      flightParameters: 'Roll (left/right rotation), Pitch (forward/backward rotation), Yaw (clockwise/counter-clockwise heading rotation).',
      pidFormula: 'Output = Kp * e + Ki * ∫e dt + Kd * (de/dt). P responds to current error, I compensates accumulated bias over time, D dampens rapid rate of change to prevent oscillation.',
      motorMixing: 'Adjusts individual motor thrusts: Roll changes left vs right motor outputs; Pitch changes front vs rear motor outputs; Yaw changes diagonal motor counter-torque outputs.',
      controlLoop: 'MPU6050 → Raw Sensor Data → Attitude Estimation → Desired vs Actual Angle -> Error Calculation → PID Controller → Roll/Pitch/Yaw Corrections → Motor Mixer → ESC Signals → Brushless Motors',
      sensorFusion: 'Gyroscope is fast but drifts over time. Accelerometer measures gravity vector but is noisy under motor vibration. Complementary filter blends gyro high-pass + accel low-pass data.',
      developmentStages: '1. STM32 Setup -> 2. MPU6050 I2C Interface -> 3. Sensor Calibration -> 4. Attitude Estimation -> 5. PID Controller -> 6. Motor Control & Mixing -> 7. Bench Stabilization -> 8. Flight Testing',
      engineeringChallenges: ['IMU sensor noise & frame vibration', 'Gyroscope bias drift over time', 'Motor/propeller thrust imbalances', 'PID tuning instability', 'Real-time timing constraints (250Hz interrupt loop)'],
      futureImprovements: ['Barometer (Altitude Hold)', 'Magnetometer & GPS (Position Hold)', 'Optical Flow camera', 'Telemetry & Ground Control software', 'Autonomous Waypoint Navigation']
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
