# ⚽ Marcador en Vivo con Server-Sent Events (SSE) y Migraciones Versionadas

Aplicación web full-stack para la transmisión de eventos y marcadores de partidos de fútbol en tiempo real. Utiliza el protocolo **Server-Sent Events (SSE)** con `EventSource`, base de datos relacional **PostgreSQL** sobre **Docker**, y control de versiones del esquema mediante **Drizzle ORM**.

---

## 📋 Tabla de Contenidos
1. [Arquitectura y Tecnologías](#-arquitectura-y-tecnologias)
2. [Análisis y Cumplimiento de los 5 Requisitos](#-analisis-y-cumplimiento-de-los-5-requisitos)
3. [Documentación de Endpoints](#-documentacion-de-endpoints)
4. [Instalación y Puesta en Marcha](#-instalacion-y-puesta-en-marcha)
5. [Guía de Migraciones con Drizzle ORM](#-guia-de-migraciones-con-drizzle-orm)
6. [📸 Guía Paso a Paso para la Toma de Capturas de Pantalla (Para Canvas)](#-guia-paso-a-paso-para-la-toma-de-capturas-de-pantalla-para-canvas)

---

## 🛠️ Arquitectura y Tecnologías

* **Lenguaje:** TypeScript (Tipado estricto en cliente y servidor).
* **Backend:** Node.js + Express con soporte nativo de streaming `text/event-stream`.
* **Frontend:** React 18 + Vite + TailwindCSS + Lucide Icons (diseño dinámico estilo estadio con marcadores tipo transmisión de TV).
* **Base de Datos:** PostgreSQL 16 ejecutándose en contenedor Docker (`docker-compose.yml`).
* **ORM & Migraciones:** Drizzle ORM + Drizzle Kit (con 2 migraciones SQL versionadas).
* **Validación de Formularios:** Zod.

---

## 🏆 Análisis y Cumplimiento de los 5 Requisitos

### Requisito 1: Partidos y Eventos
* **Múltiples Partidos:** Registra y muestra 3 partidos activos con equipos locales, visitantes, estados (*En Vivo, Programado, Finalizado*) y marcadores.
* **Diversidad de Eventos:** Soporta **Goles (⚽)**, **Faltas (⚠️)**, **Tarjetas Amarillas (🟨)**, **Tarjetas Rojas (🟥)** y **Cambios/Sustituciones (🔄)**.
* **Componentes Visuales Diferenciados:** Cada tipo de evento cuenta con su propio icono animado, color distintivo, etiqueta de equipo y descripción visual.
* **Orden Cronológico:** La línea de tiempo está ordenada ascendentemente por minuto de juego (`minute ASC`) y por fecha de creación (`createdAt ASC`).

### Requisito 2: Administración
* **Selección de Partido:** El panel de administración permite alternar entre cualquiera de los partidos disponibles.
* **Formulario Validado:** Validación estricta en tiempo real y en servidor con Zod (minutos válidos 1-130, descripción requerida, equipos válidos).
* **Envío HTTP:** El registro se envía mediante `POST /api/matches/:id/events`.
* **Flujo Seguro:** El evento se persiste primero en PostgreSQL antes de ser difundido a los espectadores conectados.

### Requisito 3: Actualizaciones con SSE
* **Ruta de Streaming:** Conexión persistente mediante `GET /api/matches/:id/events/stream`.
* **Cabecera Oficial:** Respuesta con `Content-Type: text/event-stream; charset=utf-8` y `Cache-Control: no-cache`.
* **Consumo Nativo:** Utiliza la API estándar `EventSource` en el navegador.
* **Aislamiento por Partido:** Un cliente suscrito al Partido 1 únicamente recibe eventos del Partido 1.
* **Badge de Estado de Conexión:** Indicador dinámico en la esquina superior del marcador:
  * 🟢 **Conectado (SSE Activo)**
  * 🟡 **Reconectando stream...**
  * 🔴 **Desconectado**
* **Limpieza de Recursos:** Al cambiar de partido o abandonar la vista, se ejecuta explícitamente `eventSource.close()` y el servidor remueve el socket del pool para evitar fugas de memoria.
* **Cero Polling:** No se utiliza `setInterval` ni polling repetitivo para actualizar la pantalla.

### Requisito 4: Persistencia y Migraciones
* **Base de Datos Relacional:** PostgreSQL 16 con Drizzle ORM.
* **Dos Migraciones Versionadas Incluidas:**
  * `0000_initial_schema.sql`: Creación de tablas base `matches` y `match_events` con llave foránea.
  * `0001_evolve_schema.sql`: Evolución del esquema añadiendo la columna `period` a `matches`, y `player_name`, `card_type` y `extra_info` a `match_events`.
* **Versionamiento:** Archivos rastreados en la carpeta `drizzle/` con su respectivo `meta/_journal.json`.

### Requisito 5: Recuperación del Estado y Resiliencia
* **Carga Inicial HTTP:** Al entrar o sintonizar un partido, se realiza `GET /api/matches/:id` y `GET /api/matches/:id/events`.
* **Apertura Posterior de SSE:** La conexión `EventSource` se inicializa únicamente después de cargar los datos existentes.
* **Persistencia:** Al recargar el navegador con **F5**, la base de datos devuelve el estado íntegro y el marcador se conserva sin pérdidas.
* **Deduplicación:** Uso de un `Set<number>` con los IDs de eventos ya cargados para evitar eventos duplicados en caso de reconexiones intermitentes de red.
* **Demostración de Aislamiento:** Un gol registrado en el Partido A no altera el marcador ni la línea de tiempo del Partido B.

---

## 🔌 Documentación de Endpoints

| Método | Endpoint | Nombre | Función |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/matches` | Obtener Partidos | Retorna la lista completa de partidos con su marcador, estado y período actual. |
| **GET** | `/api/matches/:id` | Detalle de Partido | Retorna la información de un partido específico según su ID. |
| **GET** | `/api/matches/:id/events` | Historial de Eventos | Carga inicial HTTP de todos los eventos del partido ordenados cronológicamente (`minute ASC, createdAt ASC`). |
| **POST** | `/api/matches/:id/events` | Registrar Evento | Valida y guarda un evento en PostgreSQL (y actualiza el marcador si fue gol). Tras persistir, emite el evento vía SSE al canal del partido. |
| **GET** | `/api/matches/:id/events/stream` | Canal SSE en Vivo | Abre la conexión unidireccional persistente (`text/event-stream`) con EventSource para transmitir eventos y cambios de marcador en tiempo real. |

---

## 🚀 Instalación y Puesta en Marcha

### Prerrequisitos
* **Node.js** (v18 o superior).
* **Docker Desktop** (para el contenedor de PostgreSQL).

### Paso 1: Clonar el repositorio y configurar variables de entorno
```bash
git clone <URL_DE_TU_REPOSITORIO>
cd "d:\Desarrollo Web"
cp .env.example .env
```

### Paso 2: Levantar la Base de Datos PostgreSQL con Docker
Asegúrate de que Docker Desktop esté abierto y ejecuta:
```bash
npm run docker:up
```
*(O de forma directa: `docker compose up -d`)*

### Paso 3: Instalar dependencias
```bash
npm install
```

### Paso 4: Aplicar las migraciones a PostgreSQL
Aplica las 2 migraciones versionadas a la base de datos:
```bash
npm run db:migrate
```

### Paso 5: Sembrar datos iniciales (Seed)
Inserta los partidos de prueba y sus eventos base:
```bash
npm run db:seed
```

### Paso 6: Iniciar la Aplicación en Modo Desarrollo
Ejecuta el frontend y el backend de forma simultánea:
```bash
npm run dev
```
* **Frontend:** Abre tu navegador en [http://localhost:5173](http://localhost:5173).
* **Backend API:** [http://localhost:3001/api/matches](http://localhost:3001/api/matches).

---

## 🗄️ Guía de Migraciones con Drizzle ORM

### Comandos de Migración
* **Generar migraciones:** Si modificas `src/server/db/schema.ts`, ejecuta:
  ```bash
  npm run db:generate
  ```
  Esto creará el siguiente archivo secuencial en `drizzle/` (ej. `0002_nuevo_cambio.sql`).

* **Aplicar migraciones:** Para ejecutar todas las migraciones pendientes en PostgreSQL:
  ```bash
  npm run db:migrate
  ```

* **Drizzle Studio (Opcional):** Si deseas inspeccionar la base de datos en una interfaz gráfica web:
  ```bash
  npm run db:studio
  ```

---

## 📸 Guía Paso a Paso para la Toma de Capturas de Pantalla (Para Canvas)

A continuación tienes la guía exacta para tomar las **6 capturas requeridas** con la descripción recomendada para pegar en Canvas debajo de cada una:

---

### 📷 Captura 1: Vista Pública con al menos dos partidos
* **Cómo prepararla:**
  1. Abre el navegador en `http://localhost:5173` en la pestaña **Vista Pública**.
  2. Asegúrate de que en la parte superior se vean las tarjetas de los partidos disponibles (ej. *Real Madrid vs FC Barcelona* y *Manchester City vs Liverpool FC*).
  3. Haz clic en el primer partido para que se muestre su marcador grande y el timeline de eventos.
* **Qué debe verse:** El carrusel de partidos con al menos dos partidos visibles, el marcador en vivo y la línea de tiempo.
* **Texto sugerido para Canvas:**
  > *"Demostración del Requisito 1: Vista pública con múltiples partidos registrados y sintonizables. Se muestra el estado del partido, marcador en vivo y la línea de tiempo con eventos diferenciados por iconos y colores."*

---

### 📷 Captura 2: Vista de Administración con partido seleccionado y evento registrado
* **Cómo prepararla:**
  1. En el encabezado superior, haz clic en el botón **Panel Admin**.
  2. Selecciona un partido del selector (ej. *Real Madrid vs FC Barcelona*).
  3. Llena el formulario con un evento (o presiona uno de los botones rápidos de demostración, ej. *Gol Real Madrid*, minuto 72, jugador *Vinicius Jr*, y descripción).
  4. Presiona el botón **Registrar y Transmitir Evento**.
  5. Espera a que aparezca el banner verde de confirmación: *"¡Evento registrado exitosamente en la base de datos y transmitido por SSE a los espectadores!"*.
* **Qué debe verse:** El formulario de administración con los campos llenos, el partido seleccionado y el mensaje de éxito de registro.
* **Texto sugerido para Canvas:**
  > *"Demostración del Requisito 2: Vista de administración con formulario validado. Se observa el registro exitoso de un evento para el partido seleccionado mediante petición HTTP POST, persistido en la base de datos PostgreSQL."*

---

### 📷 Captura 3: Solicitud SSE activa en Developer Tools y Evento recibido
* **Cómo prepararla:**
  1. En tu navegador, presiona `F12` (o clic derecho -> *Inspeccionar*) y ve a la pestaña **Network (Red)**.
  2. En el filtro de Network, selecciona **Fetch/XHR** o **All**, y recarga la página o cambia de partido.
  3. Localiza la solicitud llamada `stream` (URL completa: `/api/matches/:id/events/stream`).
  4. Haz clic en ella y ve a la sub-pestaña **EventStream** (o *Mensajes*).
  5. Con las herramientas de desarrollo abiertas, envía un evento desde el Panel de Administración (o en otra pestaña).
  6. Observa cómo entra la fila con `event: match_event` o `event: score_update` y el tipo de contenido `text/event-stream`.
* **Qué debe verse:** La solicitud con tipo `eventsource` o `text/event-stream`, estado `200 OK` (pendiente/activa) y la lista de mensajes recibidos en tiempo real por EventSource.
* **Texto sugerido para Canvas:**
  > *"Demostración del Requisito 3: Solicitud SSE persistente activa (`text/event-stream`) en las herramientas de desarrollo del navegador. Se evidencia la recepción en tiempo real de eventos mediante EventSource sin realizar polling."*

---

### 📷 Captura 4: Archivos de migraciones y ejecución exitosa en terminal
* **Cómo prepararla:**
  1. En VS Code, abre el explorador de archivos mostrando la carpeta `drizzle/` expandida, donde se vean `0000_initial_schema.sql` y `0001_evolve_schema.sql`.
  2. Abre la terminal integrada y ejecuta:
     ```bash
     npm run db:migrate
     ```
  3. Deja visible la terminal con el mensaje: *"✅ ¡Todas las migraciones fueron aplicadas con éxito a PostgreSQL!"*.
* **Qué debe verse:** Los dos archivos de migración versionados en el árbol de archivos y la salida exitosa del comando de migración en la terminal.
* **Texto sugerido para Canvas:**
  > *"Demostración del Requisito 4: Persistencia y migraciones versionadas con Drizzle ORM. Se observan los archivos de migración inicial (0000) y de evolución del esquema (0001), así como la ejecución exitosa del script de migración en la terminal."*

---

### 📷 Captura 5: Marcador y línea de tiempo conservados tras recarga (F5)
* **Cómo prepararla:**
  1. En la Vista Pública, agrega un nuevo evento (por ejemplo, un gol que suba el marcador a 3 - 1).
  2. Verifica que el nuevo gol aparece en el marcador y en la línea de tiempo.
  3. Presiona la tecla **F5** (o botón de refrescar del navegador).
  4. Observa cómo al recargar la página, la solicitud HTTP inicial consulta a PostgreSQL y restaura inmediatamente el marcador en 3 - 1 y el gol en la línea de tiempo.
* **Qué debe verse:** El navegador tras la recarga completa conservando el marcador y todos los eventos previamente registrados.
* **Texto sugerido para Canvas:**
  > *"Demostración del Requisito 5 (Persistencia del estado): El marcador y el historial de eventos se recuperan íntegramente desde PostgreSQL mediante solicitud HTTP al recargar la página (F5), abriendo la conexión SSE para nuevos eventos."*

---

### 📷 Captura 6: Demostración de Aislamiento de Eventos entre dos partidos
* **Cómo prepararla:**
  1. Abre dos ventanas del navegador lado a lado (Ventana Izquierda y Ventana Derecha):
     * **Ventana Izquierda:** Sintoniza el **Partido 1** (*Real Madrid vs Barcelona*).
     * **Ventana Derecha:** Sintoniza el **Partido 2** (*Manchester City vs Liverpool*).
  2. En el Panel Admin, registra un evento (ej. un gol) exclusivamente para el **Partido 1**.
  3. Observa cómo el evento y el marcador se actualizan de inmediato en la Ventana Izquierda por SSE, mientras que en la Ventana Derecha (**Partido 2**) el marcador y la línea de tiempo permanecen totalmente intactos.
* **Qué debe verse:** Ambas ventanas en pantalla dividida demostrando que el stream SSE aísla estrictamente los eventos por `matchId`.
* **Texto sugerido para Canvas:**
  > *"Demostración del Requisito 3 y 5 (Aislamiento de eventos): Dos ventanas simultáneas sintonizadas a partidos diferentes. El evento emitido al Partido 1 es recibido en su stream sin propagarse ni contaminar al Partido 2."*
