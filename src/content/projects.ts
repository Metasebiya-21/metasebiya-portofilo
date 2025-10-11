import { link } from "fs";

export const projects = [
  {
    title: "OCR for Handwritten Amharic Sentences",
    summary:
      "A* algorithm for precise line segmentation (near-touching lines), BLSTM trained on handwritten Amharic; future work: Ge’ez ↔ Amharic MT.",
    tags: ["Python", "TensorFlow", "PyTorch", "OpenCV", "BLSTM", "A*"],
    link: "https://github.com/Metasebiya-21/amharic-ocr-prepocessor", 
  },
  {
    title: "Data Acquisition & Onboarding Platform (Kifiya)",
    summary:
      "Led development of offline-first onboarding & verification with auto-sync recovery and secure KYC.",
    tags: ["Python", "Java", "Spring Boot", "FastAPI", "AWS", "Pulsar", "Kafka"],
    link: "https://github.com/Metasebiya-21/"
  },
  {
    title: "MICHU — Digital Lending Platform",
    summary:
      "Backend engineer for uncollateralized digital lending; integrated KYC and loan approvals, improved performance.",
    tags: ["Python", "FastAPI", "Django", "PostgreSQL", "AWS"],
    link: "https://play.google.com/store/apps/details?id=com.kifiya.digital.lending"
  },
  {
    title: "Real-time Data Pipeline",
    summary:
      "High-throughput event streaming prototype using Apache Pulsar + PostgreSQL; low-latency processing.",
    tags: ["Java", "Spring Boot", "Apache Pulsar", "PostgreSQL", "Docker"],
    link: ""
  },
  {
    title: "Live Event Streaming Platform (Personal)",
    summary:
      "Node.js/Express backend with Mediasoup, Sequelize + MySQL; optimized SQL and DB config for low-latency delivery.",
    tags: ["Node.js", "Express", "Mediasoup", "Sequelize", "MySQL"],
    linkL: "https://github.com/Metasebiya-21/live-event-stream"
  },
  {
    title: "Healthcare Chatbot (Personal)",
    summary:
      "NLP-driven chatbot for health FAQs and triage support.",
    tags: ["Python", "Transformers", "FastAPI", "NLP"],
    link: "https://github.com/Metasebiya-21/health-care-chatbot"
  },
  {
    title: "Decision Support: Stroke Diagnosis (Bahir Dar Univ.)",
    summary:
      "SVM-based system for stroke detection; Django backend for clinician-facing predictions.",
    tags: ["Python", "Django", "SVM", "MySQL"],
    link: "https://github.com/Metasebiya-21/stroke-diagnosis.git"
  },
  {
    title: "Robotics: Arm & Vehicle (Personal)",
    summary:
      "Robotic arm and autonomous vehicle with A* path planning for navigation.",
    tags: ["Python", "ROS", "C++", "A*"],
    link: "https://github.com/Metasebiya-21/autonomous_vehicle"
  },
];
