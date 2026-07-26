/* ============================================================
   LAB.JS — The Lab module data
   Click a module on the workbench to see its details here.
   ============================================================ */

const LAB_MODULES = [
  {
    id: "esp32",
    icon: "ESP",
    name: "ESP32",
    status: "ACTIVE",
    statusType: "green",
    used: "Dual-core Wi-Fi + Bluetooth microcontroller. Used for IoT, robotics control, and wireless communication projects.",
    related: ["ESP32 RC Car with Blynk IoT", "ESP8266 Home Automation"],
    skills: ["Wi-Fi", "Bluetooth", "Dual-core", "PWM", "ADC", "GPIO"]
  },
  {
    id: "esp8266",
    icon: "ESP",
    name: "ESP8266",
    status: "ACTIVE",
    statusType: "green",
    used: "Low-cost Wi-Fi microcontroller. Great for IoT and home automation where Bluetooth isn't needed.",
    related: ["ESP8266 Home Automation"],
    skills: ["Wi-Fi", "IoT", "GPIO", "Serial"]
  },
  {
    id: "arduino",
    icon: "ARD",
    name: "Arduino",
    status: "ACTIVE",
    statusType: "green",
    used: "Classic microcontroller platform for prototyping. Used in sensor-based and motor-control projects.",
    related: ["Arduino Radar System"],
    skills: ["GPIO", "PWM", "Serial", "Sensors", "Servo"]
  },
  {
    id: "embedded-c",
    icon: "C",
    name: "Embedded C",
    status: "ACTIVE",
    statusType: "green",
    used: "Primary language for firmware. Writing efficient, hardware-level code for microcontrollers.",
    related: ["ESP32 RC Car with Blynk IoT", "ESP8266 Home Automation", "Arduino Radar System"],
    skills: ["Pointers", "Registers", "Interrupts", "Memory", "Timing"]
  },
  {
    id: "c",
    icon: "C",
    name: "C",
    status: "ACTIVE",
    statusType: "green",
    used: "Foundational programming language. The backbone of embedded and systems-level development.",
    related: ["All projects"],
    skills: ["Data Structures", "Pointers", "Memory Management"]
  },
  {
    id: "python",
    icon: "PY",
    name: "Python",
    status: "ACTIVE",
    statusType: "green",
    used: "Scripting, data processing, and higher-level logic. Useful for testing, tools, and ROS 2 nodes.",
    related: ["ROS 2 work"],
    skills: ["Scripting", "Data", "ROS 2", "Automation"]
  },
  {
    id: "ros2",
    icon: "ROS",
    name: "ROS 2",
    status: "LEARNING",
    statusType: "yellow",
    used: "Robot Operating System 2. The framework where embedded hardware, sensing, control and software come together. Actively learning.",
    related: ["Future robotics projects"],
    skills: ["Nodes", "Topics", "Messages", "Actions", "Navigation"]
  },
  {
    id: "solidworks",
    icon: "SW",
    name: "SOLIDWORKS",
    status: "ACTIVE",
    statusType: "green",
    used: "3D CAD modelling for mechanical design and custom parts for robotics and hardware enclosures.",
    related: ["Robotics builds"],
    skills: ["3D Modelling", "CAD", "Parts", "Assemblies"]
  }
];
