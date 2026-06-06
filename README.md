# Peluquería Express - Frontend

Frontend en React + TypeScript + Vite para el sistema de gestión de turnos de peluquería.

## 🎯 Objetivo del Proyecto

Este proyecto fullstack explora cómo conviven la persistencia real (guardar datos sagrados en PostgreSQL) con el desacoplamiento asíncrono (hacer tareas secundarias sin hacer esperar al cliente).

### Flujo de Operación

1. **Operación Sagrada (Sincrónica)**: El backend recibe los datos del turno, pasa por las capas y los guarda en PostgreSQL. Si Postgres falla, se le avisa al frontend.

2. **El Grito al Mundo (El Evento)**: Una vez que el turno se guardó con éxito, el caso de uso no se pone a mandar mails ni a calcular estadísticas. Solo agarra el EventBus y grita: "¡turno.sacado!", pasándole los datos del turno.

3. **Efectos Secundarios (Asíncronos)**: El EventBus recibe ese grito y se lo pasa a los servicios anotados para escuchar. El cliente en React ya recibió su "OK, tu turno está reservado", mientras en el fondo se ejecutan los listeners de estadísticas y notificaciones en paralelo.

## 🛠️ Stack Tecnológico

- **React 18** - Biblioteca UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **TailwindCSS** - Estilos (via CDN)

## 📦 Instalación

```bash
npm install
```

## 🚀 Desarrollo

```bash
npm run dev
```

El servidor de desarrollo corre en `http://localhost:5173` con proxy al backend en `http://localhost:3001`.

## 🏗️ Build

```bash
npm run build
```

## 👀 Preview

```bash
npm run preview
```

## 📁 Estructura

```
frontend/
├── src/
│   ├── App.tsx          # Componente principal
│   └── main.tsx         # Entry point
├── index.html           # HTML entry point
├── vite.config.ts       # Configuración de Vite
├── tsconfig.json        # Configuración de TypeScript
└── package.json         # Dependencias
```

## 🔗 API Endpoints

El frontend se comunica con el backend a través de:

- `GET /api/turnos` - Obtener lista de turnos
- `POST /api/turnos` - Crear nuevo turno
- `DELETE /api/turnos/:id` - Eliminar turno

## 📝 Notas

- El frontend está configurado para funcionar independientemente del backend
- Usa TailwindCSS via CDN para simplificar el setup
- Incluye manejo de errores y estados de carga
