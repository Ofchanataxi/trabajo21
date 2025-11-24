import { Exception } from 'handlebars';

import { ReleasesRepository } from '../../../domain/repositories/ReleasesRepository';
import { Release } from '../models/releaseModel';
import { ReleaseStateHistory } from '../models/ReleaseStateHistoryModel';
import { Users } from '../models/UserModel';
import { StandardBussinessLine } from '../models/StandardBussinessLineModel';
import { Op, QueryTypes, Sequelize } from 'sequelize';
import { ReleaseState } from '../models/ReleaseStateModel';
import { Well } from '../models/WellReleaseModel';
import { OilfieldTypeOperations } from '../models/OilfieldTypeOperationsModel';
import { Rig } from '../models/RigModel';
import { OilfieldOperations as OilfieldOperationsModel } from '../models/oilfieldOperationsModels';
import {
  AcceptOilFieldOperationRelease,
  LogisticApprovedOilFieldOperation,
  RejectOilFieldOperationRelease,
  SegmentEditingOilFieldOperation,
  SegmentPendingOilFieldOperation,
  UserInformation,
} from '../../../domain/entities/Releases';
import { sequelize } from '../../../../description-standardization/infraestructure/database/sequelize';

export class SequelizeOilFieldOperationRepository
  implements ReleasesRepository
{
  constructor() {}

  idSegment: number = 1;
  idQAQC: number = 2;
  idPEC: number = 3;

  async rejectByQAQC(): Promise<RejectOilFieldOperationRelease[]> {
    try {
      let newoilfieldOps = await sequelize.query(
        `
 WITH latest_release AS (
          SELECT * 
          FROM "Release"
          ORDER BY "timestamp" DESC
        ), latest_rsh AS (
          SELECT DISTINCT ON ("idRelease") *
          FROM "ReleaseStateHistory"
          ORDER BY "idRelease", "changeTimestamp" DESC
        )
        SELECT 
        OFO."id" "oilfieldOperationId",
        W."wellName"  || ' ' || OTO."operationCode" || ' ' || TO_CHAR(OFO."operationNumber", 'FM00') || ' / ' || R."name" "wellName",
        Rel."id" "releaseId",
        Rel."timestamp" "timestamp",
        U."id" "createdUserId",
        U."firstName" || ' ' || U."lastName" "createdUserName",
        RSH."id" "releaseStateHistoryId",
        RSH."changeTimestamp" "changeTimestamp",
        UC."id" "changedUserId",
		SBL."name" "businessLine",
        UC."firstName" || ' ' || UC."lastName" "changedUserName",
        ARRAY_AGG(DISTINCT PG."name") "createdUserGroup",
        ARRAY_AGG(DISTINCT PGC."name") "changedUserGroup"
        FROM "OilfieldOperations" OFO
        JOIN "Rig" R ON OFO."idRig" = R."id"
        JOIN "OilfieldTypeOperations" OTO ON OFO."idOilfieldTypeOperations" = OTO."id"
        JOIN "Well" W ON OFO."idWell" = W."id"
        JOIN latest_release Rel ON Rel."idOilfieldOperations" = OFO."id"
        JOIN latest_rsh RSH ON RSH."idRelease" = Rel."id"
        JOIN "Users" U ON Rel."idCreatedBy" = U."id"
        JOIN "Users" UC ON RSH."idChangedBy" = UC."id"
        JOIN "UserGroupsAccess" UGA ON UGA."idUser" = U."id"
        JOIN "UserGroupsAccess" UGAC ON UGAC."idUser" = UC."id"
        JOIN "PermissionsGroups" PG ON UGA."idGroup" = PG."id"
        JOIN "PermissionsGroups" PGC ON UGAC."idGroup" = PGC."id"
        JOIN "ReleaseState" RS ON Rel."idReleaseState" = RS."id"
        JOIN "StandardBusinessLines" SBL ON SBL."id" = Rel."idBusinessLine"
        WHERE RSH."idPreviousState" = ${this.idPEC} AND RSH."idNewReleaseState" = ${this.idQAQC}
        GROUP BY W."id", OTO."id", OFO."id", R."id", Rel."id", RSH."id", U."id", UC."id", Rel."timestamp", RSH."changeTimestamp", SBL."name"

        `,
        { type: QueryTypes.SELECT },
      );
      if (newoilfieldOps === null || newoilfieldOps === undefined) {
        return [new RejectOilFieldOperationRelease()];
      } else {
        let rejecteds: RejectOilFieldOperationRelease[] = [];
        newoilfieldOps.forEach((element: any) => {
          rejecteds.push(
            new RejectOilFieldOperationRelease(
              element.oilfieldOperationId,
              element.releaseId,
              element.wellName,
              element.changedUserName,
              element.changedUserId,
              element.changeTimestamp,
              element.businessLine,
            ),
          );
        });
        return rejecteds;
      }
    } catch (error) {
      //console.log(error);
      throw new Exception(
        'Error getting rejected oil field operations by QAQC',
      );
    }
  }

  async approvedByQAQC(): Promise<AcceptOilFieldOperationRelease[]> {
    try {
      let newoilfieldOps = await sequelize.query(
        `
 WITH latest_release AS (
          SELECT * 
          FROM "Release"
          ORDER BY "timestamp" DESC
        ), latest_rsh AS (
          SELECT DISTINCT ON ("idRelease") *
          FROM "ReleaseStateHistory"
          ORDER BY "idRelease", "changeTimestamp" DESC
        )
        SELECT 
        OFO."id" "oilfieldOperationId",
        W."wellName"  || ' ' || OTO."operationCode" || ' ' || TO_CHAR(OFO."operationNumber", 'FM00') || ' / ' || R."name" "wellName",
        Rel."id" "releaseId",
        Rel."timestamp" "timestamp",
        U."id" "createdUserId",
        U."firstName" || ' ' || U."lastName" "createdUserName",
        RSH."id" "releaseStateHistoryId",
        RSH."changeTimestamp" "changeTimestamp",
        UC."id" "changedUserId",
		SBL."name" "businessLine",
        UC."firstName" || ' ' || UC."lastName" "changedUserName",
        ARRAY_AGG(DISTINCT PG."name") "createdUserGroup",
        ARRAY_AGG(DISTINCT PGC."name") "changedUserGroup"
        FROM "OilfieldOperations" OFO
        JOIN "Rig" R ON OFO."idRig" = R."id"
        JOIN "OilfieldTypeOperations" OTO ON OFO."idOilfieldTypeOperations" = OTO."id"
        JOIN "Well" W ON OFO."idWell" = W."id"
        JOIN latest_release Rel ON Rel."idOilfieldOperations" = OFO."id"
        JOIN latest_rsh RSH ON RSH."idRelease" = Rel."id"
        JOIN "Users" U ON Rel."idCreatedBy" = U."id"
        JOIN "Users" UC ON RSH."idChangedBy" = UC."id"
        JOIN "UserGroupsAccess" UGA ON UGA."idUser" = U."id"
        JOIN "UserGroupsAccess" UGAC ON UGAC."idUser" = UC."id"
        JOIN "PermissionsGroups" PG ON UGA."idGroup" = PG."id"
        JOIN "PermissionsGroups" PGC ON UGAC."idGroup" = PGC."id"
        JOIN "ReleaseState" RS ON Rel."idReleaseState" = RS."id"
        JOIN "StandardBusinessLines" SBL ON SBL."id" = Rel."idBusinessLine"
        WHERE RSH."idPreviousState" = ${this.idQAQC} AND RSH."idNewReleaseState" = ${this.idPEC}
        GROUP BY W."id", OTO."id", OFO."id", R."id", Rel."id", RSH."id", U."id", UC."id", Rel."timestamp", RSH."changeTimestamp", SBL."name"

        `,
        { type: QueryTypes.SELECT },
      );
      if (newoilfieldOps === null || newoilfieldOps === undefined) {
        return [new AcceptOilFieldOperationRelease()];
      } else {
        let approveds: AcceptOilFieldOperationRelease[] = [];
        newoilfieldOps.forEach((element: any) => {
          approveds.push(
            new AcceptOilFieldOperationRelease(
              element.oilfieldOperationId,
              element.releaseId,
              element.wellName,
              element.changedUserName,
              element.changedUserId,
              element.changeTimestamp,
              element.businessLine,
            ),
          );
        });
        return approveds;
      }
    } catch (error) {
      //console.log(error);
      throw new Exception(
        'Error getting rejected oil field operations by QAQC',
      );
    }
  }

  async approvedSegmentSubmissions(segmentId: any): Promise<any> {
    let oilfieldOps = await sequelize.query(
      `
        WITH latest_release AS (
          SELECT * 
          FROM "Release"
          ORDER BY "timestamp" DESC
        ), latest_rsh AS (
          SELECT DISTINCT ON ("idRelease") *
          FROM "ReleaseStateHistory"
          ORDER BY "idRelease", "changeTimestamp" DESC
        )
        SELECT 
        OFO."id" "oilfieldOperationId",
        W."wellName"  || ' ' || OTO."operationCode" || ' ' || TO_CHAR(OFO."operationNumber", 'FM00') || ' / ' || R."name" "wellName",
        Rel."id" "releaseId",
        Rel."timestamp" "timestamp",
        U."id" "createdUserId",
        U."firstName" || ' ' || U."lastName" "createdUserName",
        RSH."id" "releaseStateHistoryId",
        RSH."changeTimestamp" "changeTimestamp",
        UC."id" "changedUserId",
        UC."firstName" || ' ' || UC."lastName" "changedUserName",
        ARRAY_AGG(DISTINCT PG."name") "createdUserGroup",
        ARRAY_AGG(DISTINCT PGC."name") "changedUserGroup"
        FROM "OilfieldOperations" OFO
        JOIN "Rig" R ON OFO."idRig" = R."id"
        JOIN "OilfieldTypeOperations" OTO ON OFO."idOilfieldTypeOperations" = OTO."id"
        JOIN "Well" W ON OFO."idWell" = W."id"
        JOIN latest_release Rel ON Rel."idOilfieldOperations" = OFO."id"
        JOIN latest_rsh RSH ON RSH."idRelease" = Rel."id"
        JOIN "Users" U ON Rel."idCreatedBy" = U."id"
        JOIN "Users" UC ON RSH."idChangedBy" = UC."id"
        JOIN "UserGroupsAccess" UGA ON UGA."idUser" = U."id"
        JOIN "UserGroupsAccess" UGAC ON UGAC."idUser" = UC."id"
        JOIN "PermissionsGroups" PG ON UGA."idGroup" = PG."id"
        JOIN "PermissionsGroups" PGC ON UGAC."idGroup" = PGC."id"
        JOIN "ReleaseState" RS ON Rel."idReleaseState" = RS."id"
        JOIN "StandardBusinessLines" SBL ON SBL."id" = Rel."idBusinessLine"
        WHERE RSH."idNewReleaseState" > RSH."idPreviousState" AND SBL."id" = ${segmentId}
        GROUP BY W."id", OTO."id", OFO."id", R."id", Rel."id", RSH."id", U."id", UC."id", Rel."timestamp", RSH."changeTimestamp"
    `,
      { type: QueryTypes.SELECT },
    );

    if (oilfieldOps === null || oilfieldOps === undefined) {
      return new LogisticApprovedOilFieldOperation();
    } else {
      if (oilfieldOps.length !== 0) {
        let approves: LogisticApprovedOilFieldOperation[] = [];
        oilfieldOps.forEach((element: any) => {
          let createUser = new UserInformation(
            element.createdUserId,
            element.createdUserName,
            element.createdUserGroup,
          );
          let modifyUser = new UserInformation(
            element.changedUserId,
            element.changedUserName,
            element.changedUserGroup,
          );

          approves.push(
            new LogisticApprovedOilFieldOperation(
              element.oilfieldOperationId,
              element.releaseStateHistoryId,
              element.releaseId,
              element.wellName,
              createUser,
              element.timestamp,
              modifyUser,
              element.changeTimestamp,
            ),
          );
        });
        return approves;
      }
    }
    return oilfieldOps;
  }

  async rejectedSegmentSubmissions(segmentId: number): Promise<any> {
    let oilfieldOps = await sequelize.query(
      `
        WITH latest_release AS (
          SELECT * 
          FROM "Release"
          ORDER BY "timestamp" DESC
        ), latest_rsh AS (
          SELECT DISTINCT ON ("idRelease") *
          FROM "ReleaseStateHistory"
          ORDER BY "idRelease", "changeTimestamp" DESC
        )
        SELECT 
        OFO."id" "oilfieldOperationId",
        W."wellName"  || ' ' || OTO."operationCode" || ' ' || TO_CHAR(OFO."operationNumber", 'FM00') || ' / ' || R."name" "wellName",
        Rel."id" "releaseId",
        Rel."timestamp" "timestamp",
        U."id" "createdUserId",
        U."firstName" || ' ' || U."lastName" "createdUserName",
        RSH."id" "releaseStateHistoryId",
        RSH."changeTimestamp" "changeTimestamp",
        UC."id" "changedUserId",
        UC."firstName" || ' ' || UC."lastName" "changedUserName",
        ARRAY_AGG(DISTINCT PG."name") "createdUserGroup",
        ARRAY_AGG(DISTINCT PGC."name") "changedUserGroup"
        FROM "OilfieldOperations" OFO
        JOIN "Rig" R ON OFO."idRig" = R."id"
        JOIN "OilfieldTypeOperations" OTO ON OFO."idOilfieldTypeOperations" = OTO."id"
        JOIN "Well" W ON OFO."idWell" = W."id"
        JOIN latest_release Rel ON Rel."idOilfieldOperations" = OFO."id"
        JOIN latest_rsh RSH ON RSH."idRelease" = Rel."id"
        JOIN "Users" U ON Rel."idCreatedBy" = U."id"
        JOIN "Users" UC ON RSH."idChangedBy" = UC."id"
        JOIN "UserGroupsAccess" UGA ON UGA."idUser" = U."id"
        JOIN "UserGroupsAccess" UGAC ON UGAC."idUser" = UC."id"
        JOIN "PermissionsGroups" PG ON UGA."idGroup" = PG."id"
        JOIN "PermissionsGroups" PGC ON UGAC."idGroup" = PGC."id"
        JOIN "ReleaseState" RS ON Rel."idReleaseState" = RS."id"
        JOIN "StandardBusinessLines" SBL ON SBL."id" = Rel."idBusinessLine"
        WHERE RSH."idPreviousState" > RSH."idNewReleaseState" AND SBL."id" = ${segmentId}
        GROUP BY W."id", OTO."id", OFO."id", R."id", Rel."id", RSH."id", U."id", UC."id", Rel."timestamp", RSH."changeTimestamp"
    `,
      { type: QueryTypes.SELECT },
    );

    if (oilfieldOps === null || oilfieldOps === undefined) {
      return new LogisticApprovedOilFieldOperation();
    } else {
      if (oilfieldOps.length !== 0) {
        let approves: LogisticApprovedOilFieldOperation[] = [];
        oilfieldOps.forEach((element: any) => {
          let createUser = new UserInformation(
            element.createdUserId,
            element.createdUserName,
            element.createdUserGroup,
          );
          let modifyUser = new UserInformation(
            element.changedUserId,
            element.changedUserName,
            element.changedUserGroup,
          );

          approves.push(
            new LogisticApprovedOilFieldOperation(
              element.oilfieldOperationId,
              element.releaseStateHistoryId,
              element.releaseId,
              element.wellName,
              createUser,
              element.timestamp,
              modifyUser,
              element.changeTimestamp,
            ),
          );
        });
        return approves;
      }
    }
    return oilfieldOps;
  }

  async pendingSegmentSubmissions(segmentId: any): Promise<any> {
    // Releases where the latest release status is not equal to 1 and 4
    let oilfieldOps = await sequelize.query(
      `
        WITH latest_release AS (
        SELECT * 
        FROM "Release"
        ORDER BY "timestamp" DESC
      ), latest_rsh AS (
        SELECT DISTINCT ON ("idRelease") *
	      FROM "ReleaseStateHistory"
	      ORDER BY "idRelease", "changeTimestamp" DESC
      )
      SELECT 
      OFO."id" "oilfieldOperationId",
      W."wellName"  || ' ' || OTO."operationCode" || ' ' || TO_CHAR(OFO."operationNumber", 'FM00') || ' / ' || R."name" "wellName",
      Rel."id" "releaseId",
      Rel."timestamp" "timestamp",
      U."id" "createdUserId",
      U."firstName" || ' ' || U."lastName" "createdUserName",
      RSH."id" "releaseStateHistoryId",
      RSH."changeTimestamp" "changeTimestamp",
      UC."id" "changedUserId",
      UC."firstName" || ' ' || UC."lastName" "changedUserName",
      SBL."name" "StandardBussinessLineName",
      RS."name" "stateText",
      ARRAY_AGG(DISTINCT PG."name") "createdUserGroup",
      ARRAY_AGG(DISTINCT PGC."name") "changedUserGroup"
      FROM "OilfieldOperations" OFO
      JOIN "Rig" R ON OFO."idRig" = R."id"
      JOIN "OilfieldTypeOperations" OTO ON OFO."idOilfieldTypeOperations" = OTO."id"
      JOIN "Well" W ON OFO."idWell" = W."id"
      JOIN latest_release Rel ON Rel."idOilfieldOperations" = OFO."id"
      JOIN latest_rsh RSH ON RSH."idRelease" = Rel."id"
      JOIN "Users" U ON Rel."idCreatedBy" = U."id"
      JOIN "Users" UC ON RSH."idChangedBy" = UC."id"
      JOIN "UserGroupsAccess" UGA ON UGA."idUser" = U."id"
      JOIN "UserGroupsAccess" UGAC ON UGAC."idUser" = UC."id"
      JOIN "PermissionsGroups" PG ON UGA."idGroup" = PG."id"
      JOIN "PermissionsGroups" PGC ON UGAC."idGroup" = PGC."id"
      JOIN "ReleaseState" RS ON Rel."idReleaseState" = RS."id"
      JOIN "StandardBusinessLines" SBL ON SBL."id" = Rel."idBusinessLine"
      WHERE Rel."idReleaseState" != 1 AND Rel."idReleaseState" != 4 AND SBL."id" = ${segmentId}
      GROUP BY W."id", OTO."id", OFO."id", R."id", Rel."id", RSH."id", U."id", UC."id", Rel."timestamp", RSH."changeTimestamp", SBL."name", RS."name"
  `,
      { type: QueryTypes.SELECT },
    );

    if (oilfieldOps === null || oilfieldOps === undefined) {
      return new SegmentPendingOilFieldOperation();
    } else {
      if (oilfieldOps.length !== 0) {
        let pendings: SegmentPendingOilFieldOperation[] = [];
        oilfieldOps.forEach((element: any) => {
          let createUser = new UserInformation(
            element.createdUserId,
            element.createdUserName,
            element.createdUserGroup,
          );
          pendings.push(
            new SegmentPendingOilFieldOperation(
              element.oilfieldOperationId,
              element.releaseStateHistoryId,
              element.releaseId,
              element.wellName,
              createUser,
              element.timestamp,
              element.StandardBussinessLineName,
              element.stateText,
            ),
          );
        });
        return pendings;
      }
    }
    return oilfieldOps;
  }

  async editingSegmentSubmissions(segmentId: any): Promise<any> {
    let oilfieldOps = await sequelize.query(
      `
      WITH latest_release AS (
      SELECT * 
      FROM "Release"
      ORDER BY "timestamp" DESC
      --LIMIT 1
    ), latest_rsh AS (
      SELECT DISTINCT ON ("idRelease") *
	    FROM "ReleaseStateHistory"
	    ORDER BY "idRelease", "changeTimestamp" DESC
    )
    SELECT 
    OFO."id" "oilfieldOperationId",
    W."wellName"  || ' ' || OTO."operationCode" || ' ' || TO_CHAR(OFO."operationNumber", 'FM00') || ' / ' || R."name" "wellName",
    Rel."id" "releaseId",
    Rel."timestamp" "timestamp",
    U."id" "createdUserId",
    U."firstName" || ' ' || U."lastName" "createdUserName",
    RSH."id" "releaseStateHistoryId",
    RSH."changeTimestamp" "changeTimestamp",
    UC."id" "changedUserId",
    UC."firstName" || ' ' || UC."lastName" "changedUserName",
    SBL."name" "StandardBussinessLineName",
    ARRAY_AGG(DISTINCT PG."name") "createdUserGroup",
    ARRAY_AGG(DISTINCT PGC."name") "changedUserGroup"
    FROM "OilfieldOperations" OFO
    JOIN "Rig" R ON OFO."idRig" = R."id"
    JOIN "OilfieldTypeOperations" OTO ON OFO."idOilfieldTypeOperations" = OTO."id"
    JOIN "Well" W ON OFO."idWell" = W."id"
    JOIN latest_release Rel ON Rel."idOilfieldOperations" = OFO."id"
    JOIN latest_rsh RSH ON RSH."idRelease" = Rel."id"
    JOIN "Users" U ON Rel."idCreatedBy" = U."id"
    JOIN "Users" UC ON RSH."idChangedBy" = UC."id"
    JOIN "UserGroupsAccess" UGA ON UGA."idUser" = U."id"
    JOIN "UserGroupsAccess" UGAC ON UGAC."idUser" = UC."id"
    JOIN "PermissionsGroups" PG ON UGA."idGroup" = PG."id"
    JOIN "PermissionsGroups" PGC ON UGAC."idGroup" = PGC."id"
    JOIN "ReleaseState" RS ON Rel."idReleaseState" = RS."id"
    JOIN "StandardBusinessLines" SBL ON SBL."id" = Rel."idBusinessLine"
    WHERE Rel."idReleaseState" = 1  AND SBL."id" = ${segmentId}  
    GROUP BY W."id", OTO."id", OFO."id", R."id", Rel."id", RSH."id", U."id", UC."id", Rel."timestamp", RSH."changeTimestamp", SBL."name"
`,
      { type: QueryTypes.SELECT },
    );

    if (oilfieldOps === null || oilfieldOps === undefined) {
      return new SegmentEditingOilFieldOperation();
    } else {
      if (oilfieldOps.length !== 0) {
        let editing: SegmentEditingOilFieldOperation[] = [];
        oilfieldOps.forEach((element: any) => {
          let createUser = new UserInformation(
            element.createdUserId,
            element.createdUserName,
            element.createdUserGroup,
          );
          editing.push(
            new SegmentEditingOilFieldOperation(
              element.oilfieldOperationId,
              element.releaseStateHistoryId,
              element.releaseId,
              element.wellName,
              createUser,
              element.timestamp,
            ),
          );
        });
        return editing;
      }
    }
    return oilfieldOps;
  }
}
