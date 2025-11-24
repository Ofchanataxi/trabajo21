//import 'dotenv/config';
import { Server } from './server';

// (async () => {
  try {
    console.log('⏳ Iniciando aplicación...');

    const server = new Server();
    console.log('✅ Servidor instanciado correctamente.');

    server.start();

    console.log('🚀 Llamada a `start()` ejecutada.');
  } catch (error) {
    console.error('❌ Error crítico al iniciar la aplicación:', error);
    process.exit(1); // opcional: fuerza salida con error
  }
// })();

// import express from 'express';

// const app = express();
// const port = process.env.PORT || 8080;

// app.get('/', (_req, res) => {
//   res.send('✅ ¡Servidor funcionando correctamente!');
// });

// app.get('*', (_req, res) => {
//   res.status(200).send('🩺 Servidor activo - Ruta genérica capturada');
// });

// app.listen(port, () => {
//   console.log(`🚀 Servidor escuchando en http://localhost:${port}`);
// });