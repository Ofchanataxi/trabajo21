import express from 'express';
import { configureMiddlewares } from './config/middlewares';
import { registerRoutes } from './routes/routes';
import { GetRequiredEnvVar } from './config/environment';
import { CronService } from './config/cronService';
import { cronTasks } from './config/cronTasks';

export class Server {
  private app: express.Application;

  constructor() {
    const port = process.env.PORT || GetRequiredEnvVar('PORT_EXPRESS') || 8080;
    console.log(
      `-------------------------------Voy a intentar subir el servidor en el puerto: ${port}-------------------------------`,
    );
    console.log(
      `-------------------------------Voy a intentar subir el servidor en el puerto: ${port}-------------------------------`,
    );
    console.log(
      `-------------------------------Voy a intentar subir el servidor en el puerto: ${port}-------------------------------`,
    );
    console.log(
      `-------------------------------Voy a intentar subir el servidor en el puerto: ${port}-------------------------------`,
    );
    console.log(
      `-------------------------------Voy a intentar subir el servidor en el puerto: ${port}-------------------------------`,
    );
    this.app = express();
    this.setup();
  }

  private async setup() {
    await configureMiddlewares(this.app);
    registerRoutes(this.app);
    const shouldExecuteCrons = process.env.EXECUTE_CRON_JOBS === 'true';
    if (shouldExecuteCrons) {
      console.log('🚀 Iniciando CRONs en producción...');
      new CronService(cronTasks);
    } else {
      console.log('🛑 CRONs desactivados en modo desarrollo.');
    }

    const shouldUseToken = process.env.SHOULD_USE_TOKEN === 'true';
    if (shouldUseToken) {
      console.log('TOKEN OFFICE activado.');
    } else {
      console.log('🛑 TOKEN OFFICE desactivado.');
    }
  }

  public start() {
    try {
      const port =
        process.env.PORT || GetRequiredEnvVar('PORT_EXPRESS') || 8080;
      this.app.listen(port, () => {
        console.log(`🚀 Servidor iniciado en el puerto ${port}`);
      });
    } catch (err) {
      console.error('❌ Error iniciando el servidor:', err);
    }
  }
}
