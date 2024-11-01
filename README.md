# XM Report Downloader Bot

**XM Report Downloader** es un bot de Telegram diseñado para descargar los informes de despacho y redespacho proporcionados por XM en Colombia. Este bot, desarrollado en **Node.js**, utiliza varias librerías para ofrecer un acceso ágil a los datos.

## Tabla de Contenidos
- [Funcionalidades](#funcionalidades)
- [Dependencias](#dependencias)
- [Comandos Disponibles](#comandos-disponibles)
- [Prueba el Bot](#prueba-el-bot)


---

### Funcionalidades

- Descarga rápida de informes de despacho y redespacho.
- Comandos de fácil acceso en Telegram.
- Automatización para mantener los datos actualizados.


### Dependencias
El bot utiliza las siguientes dependencias para su funcionamiento:

**Paquete	Descripción**
- dayjs	Manejo de fechas y horas.
- dotenv	Carga de variables de entorno desde .env.
- node-fetch	Peticiones HTTP.
- nodemon	Reinicio automático en cada cambio del código.
- punycode	Manejo de codificaciones de texto.
- puppeteer	Control de navegación en páginas web.
- telegraf	Framework para crear bots en Telegram.

### Scripts
**Comando	Descripción**
- npm start	Ejecuta el bot en modo producción.
- npm run dev	Ejecuta el bot en modo desarrollo con nodemon.

### Comandos Disponibles
En Telegram, puedes interactuar con el bot mediante los siguientes comandos:

- /start - Inicia el bot
- /help - Muestra esta lista de comandos
- /obtener_dDEC - Generar informe de Despacho Programado
- /obtener_rDEC - Genera informe de Redespacho Diario

### Prueba el Bot
Para probar el bot de Telegram, utiliza el siguiente enlace: https://t.me/dsProgramadobot
