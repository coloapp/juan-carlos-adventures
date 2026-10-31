# 🌟 Juan Carlos's Adventures - Kínder Pedagógico Interactivo

Una aplicación didáctica preescolar creada para digitalizar la experiencia de los libros de texto de kínder (SEP / Editorial Gonvill), adaptada para dispositivos Android, tablets y pantallas táctiles.

![Juan Carlos](public/assets/images/character_avatar.svg)

---

## 🎨 Características Principales

1. **100% Offline-First:** No requiere conexión a internet ni backend. Todo el progreso, estrellas y premios se guardan localmente en el dispositivo (`LocalStorage`).
2. **Personalización del Alumno:**
   - Personaje principal por defecto: **Juan Carlos** (con sus tenis naranjas y playera azul).
   - Desde el botón **⚙️ Ajustes** en la esquina superior derecha, puedes cambiar el nombre del alumno, tomar una foto o subir un sticker en PNG para que cualquier niño sea el protagonista.
3. **Módulos Educativos Interactivos:**
   - 🔤 **Trazado de Letras (Abecedario):** Práctica táctil de la A a la Z con guías y fonética.
   - 🧩 **Sílabas y Palabras:** Ejercicios interactivos con ilustraciones (Elefante, Monito, Pelota, Estrella) para formar palabras.
   - 🔢 **Números y el Tren Matemático:** Secuencias y conteo guiado con el monito ayudante.
   - 🍎 **Vocales:** Dinámica de las 5 vocales (A, E, I, O, U) con locución y asociación de objetos.
   - 🔷 **Figuras y Colores:** Identificación de formas (círculo, triángulo, cuadrado, estrella), asociación con objetos cotidianos y paleta para colorear.
   - ✍️ **Trazado del Nombre:** Lienzo interactivo para trazar letra por letra el nombre del niño con pincel mágico y confeti.
4. **Mundo Abierto / Sala Libre (Estilo Toca Boca World):**
   - Espacio interactivo donde el alumno puede arrastrar y soltar a su personaje y los premios que va ganando al estudiar (gorra de astronauta, dinosaurio mascota, carrito de carreras, cohete espacial, corona real, medalla de oro).
5. **Efectos de Sonido y Voz:**
   - Motor sintetizador Web Audio API autónomo (aplausos, estrellas, clics, fanfarrias).
   - Locución de fonemas y felicitaciones en español mediante la API nativa de voz.
6. **Código Abierto y Seguro para GitHub:**
   - `.gitignore` estricto configurado para no exponer llaves de firma `.jks`, `.keystore` ni secretos personales al publicar en GitHub.

---

## 📁 ¿Cómo cambiar o agregar dibujos manualmente?

Puedes sustituir los archivos directamente en las carpetas de recursos sin tocar código:

- **Cambiar el avatar de Juan Carlos:**
  Reemplaza el archivo `public/assets/images/character_avatar.png` (o `.svg`) con la foto o dibujo recortado con fondo transparente.
- **Agregar nuevos juguetes al Mundo Abierto:**
  Coloca nuevos PNGs o SVGs en `public/assets/images/items/` y agrégalos a la lista de `src/core/RewardManager.js`.
- **Cambiar iconos de los botones:**
  Edita o reemplaza los archivos en `public/assets/icons/`.

---

## 🚀 Cómo Probar la Aplicación en tu Computadora

### Opción 1: Abrir directamente en el navegador
Dado que el proyecto utiliza módulos web estándar limpios:
1. Haz doble clic en el archivo `index.html` o ábrelo con Google Chrome o Microsoft Edge.
2. Si tu navegador bloquea módulos ES locales por protocolo `file://`, puedes abrirlo con cualquier servidor local simple:
   - Con la extensión **Live Server** de VSCode / Antigravity IDE (clic derecho en `index.html` > *Open with Live Server*).
   - O ejecutando `npx serve .` o `npm run dev` en una terminal.

---

## 📱 Cómo compilar la APK para Android (Google Play Store)

Este proyecto está configurado con **Capacitor** para empaquetarse directamente como APK nativa:

1. **Instalar dependencias de Node / Capacitor (si no las tienes instaladas aún):**
   ```bash
   npm install
   ```

2. **Generar / Sincronizar el proyecto nativo de Android:**
   ```bash
   npx cap add android
   npx cap sync android
   ```

3. **Abrir el proyecto en Android Studio:**
   ```bash
   npx cap open android
   ```

4. **Generar la APK firmada para Play Store:**
   - En Android Studio, ve al menú: **Build > Generate Signed Bundle / APK**.
   - Selecciona **Android App Bundle (AAB)** o **APK**.
   - Elige tu archivo Keystore privado (asegurado por tu `.gitignore`).
   - ¡Listo! Sube el paquete generado directamente a tu Consola de Desarrollador de Google Play.

---

## 🛡️ Seguridad de Credenciales
Tu archivo `.gitignore` ya está preconfigurado para omitir:
- `*.jks`, `*.keystore`, `*.pepk`
- `release-key.properties`
- `node_modules/`
- `.env`

¡Puedes subir este repositorio a GitHub con total tranquilidad!
