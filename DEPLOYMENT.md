# Despliegue de Flix Cloud Dashboard 🚀

Este documento te guiará paso a paso para desplegar tu nueva aplicación web (Data Layer) en un entorno de producción rápido y gratuito como **Vercel**, y cómo enlazar tus credenciales de Google.

> [!IMPORTANT]
> Esta aplicación web fue diseñada **estrictamente** como una capa de visualización y gestión de datos (Data Layer). **NO** tiene permisos ni herramientas para enviar comandos de ejecución de trading al bot de MT5 (FlixArchitectV8.4-MASTER.MQ5). El Kill-Switch y la lógica operacional están aislados de forma segura en el bot.

## Requisitos Previos

1. **Cuenta en GitHub** (para alojar tu código).
2. **Cuenta en Vercel** (vinculada a GitHub).
3. Tu archivo `service_account.json` (credenciales de tu bot/API de Google Sheets).
4. El ID de tu hoja de cálculo (*Spreadsheet ID*).
5. Tu URL de inserción (*Embed URL*) de Google Looker Studio.

---

## Paso 1: Configuración de Variables de Entorno (Local)

Para probar la plataforma localmente, necesitas configurar tus variables de entorno. 
Crea un archivo `.env.local` en la raíz de tu proyecto (`C:\Users\User\.gemini\antigravity\scratch\flix_cloud_dashboard`) con lo siguiente:

```env
# ID de tu Hoja de Cálculo (Lo encuentras en la URL de Google Sheets)
NEXT_PUBLIC_SPREADSHEET_ID="XXXXXXXXXXXXXXXXXXXXXXXX"

# URL de Inserción de Looker Studio
NEXT_PUBLIC_LOOKER_URL="https://lookerstudio.google.com/embed/reporting/xxx-xxx-xxx/page/xxx"
```

*Nota: Para pruebas locales, también puedes colocar tu archivo `service_account.json` en la raíz del proyecto. El archivo `.gitignore` ya está configurado para evitar que este archivo se suba a repositorios públicos accidentalmente.*

---

## Paso 2: Subir el Proyecto a GitHub

1. Instala **Node.js** si aún no lo tienes (es necesario para correr comandos en tu máquina local).
2. Abre una terminal en la carpeta del proyecto (`flix_cloud_dashboard`).
3. Inicializa el repositorio y sube el código:

```bash
git init
git add .
git commit -m "Initial commit - Flix Cloud Dashboard"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/flix_cloud_dashboard.git
git push -u origin main
```

---

## Paso 3: Despliegue en Vercel

1. Entra a [Vercel.com](https://vercel.com/) e inicia sesión.
2. Haz clic en **"Add New Project"**.
3. Importa el repositorio `flix_cloud_dashboard` desde tu GitHub.
4. Antes de hacer clic en "Deploy", despliega la sección de **Environment Variables** (Variables de Entorno) y añade lo siguiente:

> [!CAUTION]
> Es crucial que configures estas variables de entorno correctamente para que Vercel pueda autenticarse con la API de Google Sheets sin exponer el archivo JSON físicamente.

Añade las siguientes variables extrayendo los datos de tu `service_account.json`:

| Name | Value |
| :--- | :--- |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | *Ejemplo: tu-bot@tu-proyecto.iam.gserviceaccount.com* |
| `GOOGLE_PRIVATE_KEY` | *Pega el contenido EXACTO del campo `private_key`, incluyendo los `\n` y las líneas de BEGIN/END.* |
| `NEXT_PUBLIC_SPREADSHEET_ID` | *El ID de tu Google Sheet (Flix_Data_Master)* |
| `NEXT_PUBLIC_LOOKER_URL` | *Tu URL pública de inserción de Looker Studio* |

5. Haz clic en **Deploy**.

¡Vercel compilará tu aplicación Next.js y te proporcionará una URL pública! 🎉

---

## Notas Operativas ⚙️

- **Sincronización Bidireccional**: Al usar los botones "Editar" o "Eliminar" en el Dashboard, los cambios se envían directamente a la API de Google Sheets y se reflejarán inmediatamente.
- **Polling (Actualización en tiempo real)**: La tabla de operaciones se actualiza automáticamente cada 60 segundos consultando la Hoja, emulando un *real-time stream* sin saturar el API Quota de Google.
- **Tema Oscuro (Estética Institucional)**: El Dashboard se ajustará a la altura del visor, manteniendo los tonos oscuros de Tailwind optimizados tanto para pantallas Desktop como para navegadores de Móviles.
