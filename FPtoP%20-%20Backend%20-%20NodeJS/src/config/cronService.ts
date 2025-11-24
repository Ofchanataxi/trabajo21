import { CronJob } from 'cron';

export class CronService {
  private jobs: CronJob[] = [];

  constructor(
    private tasks: {
      schedule: string;
      task: () => Promise<void>;
      name: string;
    }[],
  ) {
    console.log('🕒 Iniciando CRON...');
    this.setupJobs();
  }

  private setupJobs() {
    this.tasks.forEach(async ({ schedule, task, name }) => {
      try {
        console.log('✅ Inicio de Tarea CRON. ' + name);
        await task();
        console.log('✅ Tarea CRON ejecutada correctamente. ' + name);
      } catch (error) {
        console.error('❌ Error en tarea CRON: ' + name, error);
      }

      const job = new CronJob(schedule, async () => {
        console.log(
          `🔄 Ejecutando CRON a las ${new Date().toISOString()} ` + name,
        );
        try {
          console.log('✅ Inicio de Tarea CRON. ' + name);
          await task();
          console.log('✅ Tarea CRON ejecutada correctamente. ' + name);
        } catch (error) {
          console.error('❌ Error en tarea CRON: ' + name, error);
        }
      });

      job.start();
      this.jobs.push(job);
      console.log(`📆 CRON programado con horario: ${schedule}` + name);
    });
  }
}
