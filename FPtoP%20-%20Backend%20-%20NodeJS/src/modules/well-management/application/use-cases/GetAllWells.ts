// application/use-cases/GetAllWells.ts
import { createDatabase } from '../../../../shared/infrastructure/Database/DatabaseFactory';

export class GetAllWells {
  constructor() {}

  async execute(): Promise<any> {
    const db = createDatabase('POSTGRESQL');
    await db.connect();
    const response = await db.query(
      `SELECT item_name as "ITEM_NAME", status as "STATUS", joblog_start_date AS "JOBLOG_START_DATE", joblog_end_date AS "JOBLOG_END_DATE", joblog_type AS "JOBLOG_TYPE", joblog_wo_number AS "JOBLOG_WO_NUMBER", joblog_activity AS "JOBLOG_ACTIVITY", joblog_wo_equip AS "JOBLOG_WO_EQUIP", long_well_name AS "LONG_WELL_NAME", joblog_end_suspen AS "JOBLOG_END_SUSPEN", joblog_start_suspen AS "JOBLOG_START_SUSPEN"
	     FROM public.shaya_wells;`,
    );
    await db.disconnect();

    return response;
  }
}
