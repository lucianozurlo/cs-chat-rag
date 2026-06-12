const STORAGE_KEY = "comustock";

const STARTER_PRESETS = {
  analizar: {
    label: "Analizar",
    items: [
      "Analizar este texto y resumirlo con los puntos clave.",
      "Analizar este contenido y detectar oportunidades de mejora.",
      "Analizar esta idea y señalar riesgos, ventajas y próximos pasos.",
      "Analizar este mensaje y reescribirlo más claro y profesional.",
    ],
  },
  escribir: {
    label: "Escribir",
    items: [
      "Escribir un mail claro y profesional a partir de esta idea.",
      "Escribir una propuesta breve, directa y convincente.",
      "Escribir preguntas frecuentes para este proyecto.",
      "Escribir un texto con tono simple, claro y humano.",
    ],
  },
  planificar: {
    label: "Planificar",
    items: [
      "Planificar este proyecto paso a paso con prioridades y tiempos.",
      "Planificar una estrategia simple para ejecutar esta idea.",
      "Planificar tareas concretas para avanzar sin perder tiempo.",
      "Planificar un roadmap corto con entregables claros.",
    ],
  },
};

const RANDOM_GREETINGS = [
  "Hola Benja!",
  "__TIME_BASED__",
  "¿Todo bien, Benja?",
  "¿Cómo va, Benja?",
  "Ey, Benja, ¿todo ok?",
  "Che Benja, ¿todo bien?",
  "Buenas, Benja!",
  "¿Qué hacés, Benja?",
  "¿Cómo andás, Benja?",
  "Benja, ¿todo joya?",
  "Hola, Benja, ¿cómo va?",
  "Benja, ¿cómo estás?",
  "Buenas, Benja, ¿va?",
  "¿Todo tranqui, Benja?",
  "Benja, ¿qué contás?",
  "Hola Benja, ¿todo?",
  "Ey Benja, ¿cómo va?",
  "Che, Benja, ¿todo?",
  "¿Qué onda, Benja?",
  "Benja, ¿en qué andás?",
];

const N8N_WEBHOOK_URL = "http://localhost:5678/webhook/comustock-chat";
