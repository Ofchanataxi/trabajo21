import { migrateTask } from './tasks/migrateTask';
import { cleanLogsTask } from './tasks/cleanLogsTask';
import { sendReportsTask } from './tasks/sendReportsTask';

export const cronTasks = [
  {
    schedule: '0,15,30,45 * * * *',
    task: migrateTask,
    name: 'Migración de AVOCET a FP2P',
  }, // Migración cada 15 minutos
  {
    schedule: '0 0 * * *',
    task: cleanLogsTask,
    name: 'Test - limpieza de logs - NO IMPLEMENTADO',
  }, // Limpieza de logs a medianoche
  {
    schedule: '30 8 * * 1',
    task: sendReportsTask,
    name: 'Test - limpieza de logs - NO IMPLEMENTADO',
  }, // Envío de reportes todos los lunes a las 8:30 AM
];
