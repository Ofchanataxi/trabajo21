import express, { Request, Response, NextFunction, Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import compression from 'compression';
import { RedisStore } from 'connect-redis';
import { createClient } from 'redis';

export async function configureMiddlewares(app: Application) {
  app.use(compression());

  const FRONTEND = process.env.FRONTEND_URI || 'http://localhost:4100';

  const corsOptions = {
    origin: [FRONTEND, 'http://localhost:4100'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'Url-name',
    ],
    exposedHeaders: ['Content-Disposition', 'Authorization', 'Url-name'],
    maxAge: 86400,
  };

  app.use(cors(corsOptions));

  // ✅ manejar los preflights sin path con comodín
  app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
      res.header(
        'Access-Control-Allow-Origin',
        Array.isArray(corsOptions.origin) ? corsOptions.origin[0] : FRONTEND,
      );
      res.header(
        'Access-Control-Allow-Methods',
        corsOptions.methods!.join(','),
      );
      res.header(
        'Access-Control-Allow-Headers',
        corsOptions.allowedHeaders!.join(','),
      );
      res.header('Access-Control-Allow-Credentials', 'true');
      return res.sendStatus(204);
    }
    next();
  });

  /**
   * helmet es un middleware de seguridad para Express que ayuda a proteger tu aplicación de varias vulnerabilidades web mediante el ajuste de varios encabezados HTTP.
   */

  app.use(helmet());

  /**
   * Agrego el registro
   */

  // Configura morgan para que registre el cuerpo de la solicitud
  morgan.token('body', function (req: Request) {
    return JSON.stringify(req.body);
  });

  // Middleware para capturar la respuesta antes de enviarla
  app.use((req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send; // Guardamos la función original

    res.send = function (body: any) {
      (res as any)._body = body; // Guardamos el cuerpo de la respuesta temporalmente
      return originalSend.call(this, body); // Llamamos a la función original
    };

    next();
  });

  // Definir token de Morgan para capturar la respuesta
  morgan.token('res-body', (req: Request, res: Response) => {
    return JSON.stringify((res as any)._body) || '-';
  });

  // const logPath = path.join(os.tmpdir(), 'logs');
  // await fs.mkdirSync(logPath, { recursive: true });

  // const accessLogStream = rfs.createStream('access.log', {
  //   interval: '1d', // Genera un archivo log cada dia
  //   path: logPath,
  // });
  // app.use(
  //   morgan(
  //     ':method :url :status :res[content-length] - :response-time ms :body - :res-body',
  //     { stream: accessLogStream },
  //   ),
  // );

  /*
   *  Cuando una solicitud llega al servidor y contiene datos en formato JSON en el cuerpo
   *  (por ejemplo, al enviar datos desde un formulario HTML con Content-Type: application/json),
   *  express.json() analiza esos datos y los convierte en un objeto JavaScript accesible a través de req.body.
   */

  app.use(express.json({ limit: '4048mb' }));
  /**
   * express.urlencoded({ extended: false }) es otro middleware de Express que se utiliza para analizar los datos
   * de las solicitudes entrantes con el tipo de contenido application/x-www-form-urlencoded.
   * Este tipo de contenido se utiliza comúnmente cuando se envían datos de un formulario HTML.
   *
   * Al utilizar express.urlencoded({ extended: false }), Express puede analizar estos datos y hacer que estén
   * disponibles en el objeto req.body para que puedas acceder a ellos en tu aplicación.
   */

  app.use(express.urlencoded({ limit: '4048mb', extended: false }));

  /**
   * Al utilizar cookieParser(), Express puede analizar las cookies adjuntas a las solicitudes entrantes
   * y hacer que la información de las cookies esté disponible en el objeto req.cookies para que puedas acceder a ella en tu aplicación.
   */

  app.use(cookieParser());

  /**
   * Using express-session middleware for persistent user session. Be sure to
   * familiarize yourself with available options. Visit: https://www.npmjs.com/package/express-session
   */

  if (!process.env.EXPRESS_SESSION_SECRET) {
    throw new Error(
      'Falta la variable de entorno EXPRESS_SESSION_SECRET. Agrega una en tu .env',
    );
  }

  const shouldUseToken = process.env.SHOULD_USE_TOKEN === 'true';
  if (shouldUseToken) {
    if (!process.env.REDIS_URL) {
      throw new Error('Falta REDIS_URL en .env');
    }

    const redisClient = createClient({ url: process.env.REDIS_URL });
    redisClient.on('connect', () => console.log('✅ Redis conectado'));
    redisClient.on('error', err => console.error('❌ Redis error:', err));

    try {
      await redisClient.connect();
    } catch (err) {
      console.error('Error al conectar con Redis:', err);
    }

    const redisStore = new RedisStore({ client: redisClient });

    app.set('trust proxy', 1);

    app.use(
      session({
        store: redisStore,
        secret: process.env.EXPRESS_SESSION_SECRET!,
        resave: false,
        saveUninitialized: false,
        cookie: {
          httpOnly: true,
          secure: false,      // cambia a true en producción (HTTPS)
          sameSite: 'lax',    // cambia a 'none' si front/back están en dominios distintos con HTTPS
          maxAge: 1000 * 60 * 60, // 1h
        },
      }),
    );
  } else {
    app.use(
      session({
        // *** Ajusta estas opciones según tus requisitos ***
        secret: process.env.EXPRESS_SESSION_SECRET || 'un-secreto-muy-fuerte',
        resave: false, // no rescribir la sesión si no hubo cambios
        saveUninitialized: false, // sólo guardar la sesión si tiene datos
        cookie: {
          httpOnly: true,
          secure: false, // true si sirves sobre HTTPS, false en dev http://localhost
          maxAge: 1000 * 60 * 60, // 1 hora en milisegundos (ajústalo a tu gusto)
          sameSite: 'lax', // evita bloqueos en algunos esquemas de redirección
        },
        // Si quieres persistencia en un store distinto a MemoryStore (recomendado en prod),
        // aquí podrías indicar `store: new RedisStore({ client: redisClient })`, etc.
      }),
    );
  }
}
