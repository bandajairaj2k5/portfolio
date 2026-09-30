export const portfolioKnowledge = {
  profile: {
    name: 'Banda Jairaj',
    role: 'Final-year ECE Student focused on Embedded Firmware',
    objective: 'Final-year ECE student focused on embedded firmware. Designed and built a quadcopter flight controller end to end (schematic, PCB, firmware) and wrote bare-metal STM32 drivers at register level. Comfortable debugging C/C++ and Python from hardware to application layer. Seeking an entry-level embedded/firmware role.',
    summary: 'Final-year ECE student with hands-on experience in bare-metal STM32 drivers, quadcopter PCB/firmware bring-up, ESP32 IoT systems, and software automation.',
    education: [
      { degree: 'B.Tech, ECE', institution: 'Keshav Memorial College of Engineering (JNTUH), Hyderabad', cgpa: '6.05', year: 'Expected 2027' },
      { degree: 'Intermediate, MPC', institution: 'Narayana Junior College, Hyderabad', percentage: '85%', year: 'Passed out 2023' },
      { degree: 'Schooling, ICSE', institution: 'Sri Sai Public School, Habsiguda, Hyderabad', percentage: '80%', year: 'Passed out 2021' }
    ],
    contact: {
      email: 'bandajairaj2k5@gmail.com',
      phone: '+91 76808 36062',
      location: 'Hyderabad, India',
      linkedin: 'https://linkedin.com/in/banda-jairaj-b38b1527a',
      github: 'https://github.com/bandajairaj2k5',
      website: 'https://bandajairaj2k5.github.io/portfolio',
      resume: 'assets/resume/Jairaj_Banda_Resume.pdf'
    }
  },
  skills: {
    languages: ['Embedded C', 'C++', 'Python'],
    embeddedPlatforms: ['ESP32', 'ESP8266', 'STM32 (BlackPill F411CEU6)', 'Arduino', 'Sensor Interfacing', 'PCB Design & Bringup'],
    iotAndSoftware: ['MQTT / HTTP', 'Blynk', 'ThingSpeak', 'Node.js / Express', 'SQLite', 'Telegram Bot API', 'Google Gemini API'],
    other: ['ROS 2 (in progress)']
  },
  projects: [
    {
      id: 'quadcopter-flight-controller',
      title: 'Quadcopter Flight Controller',
      category: 'Personal Project',
      tech: ['Embedded Firmware', 'PCB Design', 'STM32', 'C/C++', 'IMU'],
      highlights: [
        'Sole developer across schematic, PCB, and firmware bring-up for a quadcopter flight controller; tested firmware behaviour on the physical hardware.'
      ]
    },
    {
      id: 'stm32-baremetal-drivers',
      title: 'STM32 Bare-Metal GPIO & Button Input Drivers',
      category: 'Personal Project',
      tech: ['STM32F411', 'Embedded C', 'Bare-Metal', 'Registers'],
      highlights: [
        'Wrote LED-blink and button-input drivers for the STM32F411 (BlackPill) using direct register manipulation only, with no HAL or CMSIS.',
        'Verified peripheral behaviour against the reference manual register map.'
      ]
    },
    {
      id: 'esp32-rc-car',
      title: 'ESP32-Based RC Car (Motor Control System)',
      category: 'Personal Project',
      tech: ['ESP32', 'C++', 'Blynk', 'PWM', 'Motor Drivers'],
      highlights: [
        'Implemented PWM-based DC motor control using TB6612FNG/DRV8833 drivers with Blynk remote control; debugged driver and timing issues through incremental functional testing.'
      ]
    },
    {
      id: 'iot-weather-station',
      title: 'IoT Weather Station & Cloud Dashboard',
      category: 'Industrial Training Project',
      tech: ['ESP32', 'DHT22', 'ThingSpeak', 'MATLAB'],
      highlights: [
        'Built DHT22 sensing with Wi-Fi upload to a ThingSpeak dashboard and threshold-based email alerts; analysed the logged data in MATLAB.'
      ]
    },
    {
      id: 'ultrasonic-radar-system',
      title: 'Ultrasonic Radar System',
      category: 'College Project',
      tech: ['ESP32', 'C++', 'Ultrasonic Sensor', 'Servo Motor', 'Processing'],
      highlights: [
        'Built a servo-driven ultrasonic radar sweep, debugging sensor-noise and timing issues to produce a reliable distance-vs-angle scan.'
      ]
    },
    {
      id: 'esp32-home-automation',
      title: 'ESP32 Home Automation System',
      category: 'College Project',
      tech: ['ESP32', 'Blynk', 'IoT'],
      highlights: [
        'Developed remote monitoring and control through the Blynk app; tested connectivity and command reliability over Wi-Fi.'
      ]
    },
    {
      id: 'bunny-assistant-server',
      title: 'BUNNY — Personal Assistant Server',
      category: 'Personal Project',
      tech: ['Python', 'Termux', 'SQLite', 'Telegram Bot API'],
      highlights: [
        'Converted an old Android phone into a lightweight always-on server using Termux, Python, and SQLite, designed as a low-footprint coordinator that calls cloud APIs.',
        'Built a job-search pipeline with scheduled searches, scoring and filtering of listings, and delivery through a Telegram bot.'
      ]
    },
    {
      id: 'naradh-ai-task-router',
      title: 'NARADH — Personal AI Task Router',
      category: 'Full-Stack Web App',
      tech: ['Node.js/Express', 'SQLite', 'Google Gemini API'],
      highlights: [
        'Built a full-stack app that analyses a prompt and routes it to the most suitable of 8 AI platforms, using the Gemini API for intent classification.'
      ]
    }
  ],
  certifications: [
    { name: 'JIJNASA National Certificate' },
    { name: 'Aigen Labs Certification' },
    { name: 'Outskill Certification' },
    { name: 'KMCE Certification' }
  ],
  recruiterHints: {
    whyHire: 'He demonstrates end-to-end embedded firmware engineering, register-level STM32 programming, PCB bring-up, and real hardware testing.',
    bestFitRoles: ['Embedded Firmware Engineer', 'Embedded Systems Engineer', 'Microcontroller Developer', 'IoT Systems Engineer']
  }
};
