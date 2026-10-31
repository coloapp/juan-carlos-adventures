# 🚀 MASTER PROMPT & ARQUITECTURA: JUAN CARLOS'S ADVENTURES
## Proyecto Pedagógico Infantil para Kínder / Preescolar

Este documento contiene la especificación completa, arquitectura de código, diseño pedagógico y guía técnica del proyecto **Juan Carlos's Adventures**, una plataforma educativa interactiva diseñada para la digitalización de materiales preescolares (estilo libros de texto SEP y cuadernos de trabajo Gonvill).

---

## 1. Visión y Propósito del Proyecto
- **Destinatario Principal:** Juan Carlos (alumno preescolar / kínder), con soporte multialumno mediante perfiles dinámicos.
- **Filosofía Educativa:** Aprendizaje lúdico, estimulación multisensorial (trazos táctiles, fonética por voz, refuerzo positivo visual/auditivo) y gamificación estilo *Toca Boca World*.
- **Enfoque de Ingeniería:** 
  - **100% Offline-First:** No requiere internet, no depende de APIs externas ni servidores. Todos los datos, progresos y recompensas se guardan en `LocalStorage`.
  - **Código Abierto y Seguro:** El repositorio está listo para publicarse en GitHub protegiendo llaves privadas de Play Store (`.jks`, `keystore`) y variables privadas.
  - **Empaquetado Nativo para Android:** Estructurado para compilarse como APK mediante **Capacitor** y publicarse directamente en Google Play Store con cuenta de desarrollador.
  - **Personalización Manual por Carpetas:** El avatar principal (`character_avatar.png`), objetos de recompensa, iconos y sonidos pueden ser reemplazados directamente en `public/assets/` por el desarrollador o educador sin tocar el código central.

---

## 2. Stack Tecnológico
- **Frontend Core:** HTML5 Canvas interactivo, CSS3 responsivo (orientado a tablets y móviles Android), ES6 / TypeScript.
- **Audio Engine:** Sintetizador Web Audio API autónomo (efectos de sonido instantáneos sin dependencias externas) y soporte de SpeechSynthesis para fonética en español.
- **Empaquetador Nativo:** Capacitor (`@capacitor/core`, `@capacitor/android`).
- **Persistencia:** `LocalStorage` con gestión transaccional JSON y respaldo local.
- **Control de Versiones:** Git con `.gitignore` exhaustivo para seguridad de credenciales y builds.

---

## 3. Estructura de Carpetas del Proyecto

```text
juan-carlos-adventures/
├── .github/                   # Workflows de CI/CD para compilar la APK
├── .gitignore                 # EXCLUSIÓN ESTRICTA de llaves de firma y archivos locales
├── capacitor.config.json      # Configuración del paquete nativo Android Capacitor
├── package.json               # Dependencias y scripts de desarrollo / build
├── tsconfig.json              # Configuración de TypeScript
├── MASTER_PROMPT.md           # Especificación maestra del proyecto
├── README.md                  # Guía rápida para educadores y desarrolladores
├── index.html                 # Punto de entrada HTML5 responsivo
├── public/                    # Assets estáticos editables manualmente
│   └── assets/
│       ├── audio/             # Archivos de sonido y voces (.mp3)
│       ├── icons/             # Iconos vectoriales de los módulos
│       └── images/            # Ilustraciones y sprites
│           ├── character_avatar.png  # Sprite editable de Juan Carlos
│           ├── items/         # Premios desbloqueables para el mundo abierto
│           └── educational/   # Ilustraciones didácticas (animales, objetos)
└── src/                       # Código fuente modular
    ├── core/                  # Motores de juego (Audio, Storage, Rewards)
    ├── components/            # UI reutilizable (Canvas de trazo, modales, confeti)
    ├── modules/               # Pantallas y minijuegos didácticos
    │   ├── HomeScreen.js           # Menú principal y dashboard de progreso
    │   ├── NameTracingScreen.js    # Trazado interactivo del nombre
    │   ├── LetterTracingScreen.js  # Trazado de abecedario A-Z
    │   ├── SyllablesScreen.js      # Formación de palabras y sílabas
    │   ├── NumbersScreen.js        # Secuencias numéricas y conteo
    │   ├── VowelsScreen.js         # Reconocimiento y trazo de vocales
    │   ├── ShapesScreen.js         # Formas geométricas y colores
    │   └── OpenWorldScreen.js      # Mundo abierto interactivo (estilo Toca Boca)
    └── styles/                # Hojas de estilo temáticas infantiles
```

---

## 4. Módulos Educativos y Especificaciones

### Módulo 0: Pantalla Principal (Dashboard)
- Header con nivel actual, barra de estrellas acumuladas, botón de silenciar/activar audio y acceso a ajustes/perfil.
- Columna izquierda con tarjeta del alumno activo ("Juan Carlos"), avatar interactivo con animación reactiva y botón de acceso directo a su **Mundo Virtual**.
- Cuadrícula de 6 botones coloridos con feedback háptico/sonoro:
  1. 🔤 **Trazado de Letras:** Abecedario guiado con flechas y puntos de inicio.
  2. 🧩 **Sílabas:** Rompecabezas de palabras ilustradas para aprender a leer.
  3. 🔢 **Números:** Trencito de números y ejercicios de conteo y orden.
  4. 🍎 **Vocales:** Dinámica interactiva de las 5 vocales (A, E, I, O, U).
  5. 🔷 **Figuras:** Asociación de formas con objetos reales y paleta de colorear.
  6. ✍️ **Trazado del Nombre:** Práctica caligráfica personalizada de "JUAN CARLOS".
- Barra inferior con inventario rápido de recompensas y contador de trofeos.

### Módulo 1: Trazado del Nombre ("Juan Carlos")
- Lienzo HTML5 Canvas con soporte táctil (`touchstart`, `touchmove`, `touchend`) y ratón (`mousedown`, `mousemove`, `mouseup`).
- Trazo mágico grueso con terminaciones redondeadas y partículas de estrellas.
- Plantilla de letras punteadas de fondo.
- Barra superior de casillas que marca letra por letra el avance del nombre ("J - U - A - N   C - A - R - L - O - S").
- Detección de trazo y avance automático con confeti y aplausos al completar el nombre completo.

### Módulo 2: Sílabas y Construcción de Palabras
- Digitalización de ejercicios de lectura temprana de libros de la SEP.
- Ilustración del objeto (ej. Elefante, Mariposa, Pelota, Sol, Mesa).
- Separación silábica interactiva: el niño presiona la sílaba correcta faltante para armar la palabra.
- Síntesis de voz que pronuncia la palabra completa y celebra el logro.

### Módulo 3: Números y Secuencias Numéricas
- Trencito de vagones numéricos con un vagón faltante ("3, 4, 5, [ ? ], 7").
- Opciones numéricas grandes para pulsar.
- Mini-juego de conteo con objetos interactivos que se cuentan en voz alta.

### Módulo 4: Vocales (A, E, I, O, U)
- Tarjetas ilustradas de alta visibilidad: Avión, Elefante, Isla, Oso, Uva.
- Modo de reconocimiento sonoro y modo de trazo guiado de cada vocal.

### Módulo 5: Figuras Geométricas y Colores
- Asociación de formas básicas: Círculo (dona, pelota), Triángulo (rebanada de pizza), Cuadrado (regalo, ventana), Rectángulo (puerta), Estrella.
- Mini-lienzo para colorear figuras con paleta interactiva de colores brillantes.

### Módulo 6: Mundo Abierto Interactivo (Estilo Toca Boca World)
- Escenario libre ("Playmat") tipo habitación/parque donde el avatar del niño puede colocarse y moverse libremente.
- **Cajón de Recompensas (Inventario 🎒):** Los objetos desbloqueados por estudiar (gorra espacial, dinosaurio, carrito, medallas, coronas, juguetes) se cargan del inventario.
- Mecánica de Arrastrar y Soltar (Drag & Drop) totalmente táctil.
- Los objetos persisten su posición en el mundo usando `LocalStorage`.

---

## 5. Seguridad y Reglas para GitHub (.gitignore)
Para que el proyecto sea público y open-source sin comprometer firmas privadas de Android:
- Se ignoran estrictamente archivos `.jks`, `.keystore`, `.pepk` y `release-key.properties`.
- Se ignoran carpetas generadas: `node_modules/`, `dist/`, `www/`, `.capacitor/`.
- Se incluye `.env.example` público con las claves de ejemplo pero `.env` local permanece ignorado.

---

## 6. Procedimiento de Empaquetado APK Android (Capacitor)
1. Instalar dependencias: `npm install`
2. Sincronizar proyecto Android: `npx cap sync android`
3. Abrir en Android Studio: `npx cap open android`
4. Generar APK firmada: Menú `Build` > `Generate Signed Bundle / APK` usando tu Keystore privado.
