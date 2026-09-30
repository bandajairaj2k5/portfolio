/* ============================================================
   LAB.JS — The Lab module data matching resume skills & hardware
   ============================================================ */

const LAB_MODULES = [
  {
    id: "stm32",
    icon: "STM",
    name: "STM32 (BlackPill F411CEU6)",
    status: "ACTIVE",
    statusType: "green",
    used: "ARM Cortex-M4 microcontroller. Used for Quadcopter Flight Controller bring-up and bare-metal register-level drivers (GPIO, RCC, interrupts).",
    related: ["Quadcopter Flight Controller", "STM32 Bare-Metal GPIO & Button Input Drivers"],
    skills: ["ARM Cortex-M4", "Register Manipulation", "RCC Clocks", "Bare-Metal", "PWM", "Interrupts"]
  },
  {
    id: "esp32",
    icon: "ESP",
    name: "ESP32",
    status: "ACTIVE",
    statusType: "green",
    used: "Dual-core Wi-Fi + Bluetooth microcontroller. Used for RC Car PWM motor control, IoT Weather Station, Ultrasonic Radar, and Home Automation.",
    related: ["ESP32-Based RC Car", "IoT Weather Station & Cloud Dashboard", "Ultrasonic Radar System", "ESP32 Home Automation System"],
    skills: ["Wi-Fi", "Blynk", "ThingSpeak", "PWM", "Sensor Interfacing"]
  },
  {
    id: "esp8266",
    icon: "ESP",
    name: "ESP8266",
    status: "ACTIVE",
    statusType: "green",
    used: "Low-cost Wi-Fi microcontroller. Used for IoT appliance monitoring and control projects.",
    related: ["ESP32 Home Automation System"],
    skills: ["Wi-Fi", "IoT", "Relays", "Serial"]
  },
  {
    id: "arduino",
    icon: "ARD",
    name: "Arduino",
    status: "ACTIVE",
    statusType: "green",
    used: "Prototyping platform for sensor interfacing and motor control logic.",
    related: ["Ultrasonic Radar System", "ESP32-Based RC Car"],
    skills: ["GPIO", "PWM", "Serial", "Sensors", "Servo"]
  },
  {
    id: "embedded-c",
    icon: "C",
    name: "Embedded C / C++",
    status: "ACTIVE",
    statusType: "green",
    used: "Primary language for embedded firmware, register-level drivers, and IoT sensor loops.",
    related: ["Quadcopter Flight Controller", "STM32 Bare-Metal Drivers", "ESP32-Based RC Car", "Ultrasonic Radar System"],
    skills: ["Pointers", "Direct Register Manipulation", "Memory-Mapped I/O", "Interrupts", "PWM"]
  },
  {
    id: "python",
    icon: "PY",
    name: "Python",
    status: "ACTIVE",
    statusType: "green",
    used: "Scripting, server automation, Termux environment pipelines, and AI integration.",
    related: ["BUNNY — Personal Assistant Server"],
    skills: ["Scripting", "SQLite", "Telegram Bot API", "Termux Linux", "Automation"]
  },
  {
    id: "ros2",
    icon: "ROS",
    name: "ROS 2",
    status: "IN PROGRESS",
    statusType: "yellow",
    used: "Robot Operating System 2 framework for robotics middleware and sensor integration. Actively learning.",
    related: ["Robotics & Controls"],
    skills: ["Nodes", "Topics", "Middleware", "Sensors"]
  },
  {
    id: "pcb-design",
    icon: "PCB",
    name: "PCB Design & Bringup",
    status: "ACTIVE",
    statusType: "green",
    used: "Schematic capture, PCB layout, and physical board bring-up for quadcopter flight controller.",
    related: ["Quadcopter Flight Controller"],
    skills: ["Schematic Capture", "PCB Layout", "Hardware Bring-up", "Soldering & Testing"]
  }
];
