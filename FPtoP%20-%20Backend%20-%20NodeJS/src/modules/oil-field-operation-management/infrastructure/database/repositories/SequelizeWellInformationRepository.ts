import { WellInformationRepository } from '../../../domain/repositories/WellInformationRepository';
import {
  ElementRelease,
  OilfieldOperation,
  PendingReleaseForQAQC,
} from '../../../domain/entities/WellInformation';
import { Release } from '../models/releaseModel';
import { OilfieldOperations as OilfieldOperationsModel } from '../models/oilfieldOperationsModels';
import { Well } from '../models/WellReleaseModel';
import { ReleaseState } from '../models/ReleaseStateModel';
import { StandardBussinessLine } from '../models/StandardBussinessLineModel';
import { ReleaseStateHistory } from '../models/ReleaseStateHistoryModel';
import { Users } from '../models/UserModel';
import { ElementRelease as ElementReleaseModel } from '../models/ElementReleaseModel';
import { QueryTypes, Sequelize } from 'sequelize';
import { postgres_sequelize } from '../../../../well-management/infrastructure/database/sequelize';
import { Rig } from '../models/RigModel';
import { OilfieldTypeOperations } from '../models/OilfieldTypeOperationsModel';
import { ApprovalInformation } from '../../../../well-management/infrastructure/incoming/services/approvalInformation';
import { Exception } from 'handlebars/runtime';
import { sequelize } from '../../../../description-standardization/infraestructure/database/sequelize';

export class SequelizeWellInformationRepository
  implements WellInformationRepository
{
  constructor(private approvalService: ApprovalInformation) {}

  async findAll(): Promise<Release[]> {
    const releases = await Release.findAll();
    return releases;
  }

  async insertOne(): Promise<void> {}

  async findAllOilfieldOperations(
    releaseStatus: any,
  ): Promise<OilfieldOperation[]> {
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
        WHERE RS."id" = ${releaseStatus}
        GROUP BY W."id", OTO."id", OFO."id", R."id", Rel."id", RSH."id", U."id", UC."id", Rel."timestamp", RSH."changeTimestamp", SBL."name"`,
        { type: QueryTypes.SELECT },
      );
      if (newoilfieldOps === null || newoilfieldOps === undefined) {
        return [new OilfieldOperation()];
      } else {
        let pendings: OilfieldOperation[] = [];
        newoilfieldOps.forEach((element: any) => {
          pendings.push(
            new OilfieldOperation(
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
        return pendings;
      }
    } catch (error) {
      throw new Exception('Error getting oil field operations');
    }
  }

  async findReleaseElementInformation(
    releaseId: any,
  ): Promise<PendingReleaseForQAQC> {
    let pdfFileExample = await this.approvalService.fileToJson(
      new File(
        [
          new Blob(['Este es el contenido del archivo.'], {
            type: 'application/pdf',
          }),
        ],
        'file.pdf',
        {
          type: 'application/pdf',
          lastModified: new Date().getTime(),
        },
      ),
    );

    let excelFileExample = await this.approvalService.fileToJson(
      new File(
        [
          new Blob(['Este es el contenido del archivo.'], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          }),
        ],
        'archivo excel.xslx',
        {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          lastModified: new Date().getTime(),
        },
      ),
    );

    let availableFiles = [
      {
        id: 1,
        groupName: 'Tallysheet',
        files: [excelFileExample],
        required: true,
      },
      {
        id: 2,
        groupName: 'Guia',
        files: [pdfFileExample],
        required: true,
      },
    ];

    const elementReleases = await ElementReleaseModel.findAll({
      include: [
        {
          model: Release,
          where: {
            id: releaseId,
          },
          required: true,
        },
      ],
    });

    let elementReleaseArr: ElementRelease[] = [];

    elementReleaseArr = elementReleases.map(elementRelease => {
      let data = elementRelease.dataValues;
      let release = elementRelease.dataValues.Release.dataValues;

      return new ElementRelease(
        data.id,
        release.id,
        data.pecDescription,
        data.quantity,
        [
          {
            groupName: 'Documentos de soporte',
            files: [pdfFileExample],
          },
        ],
      );
    });

    let pendingReleaseForQAQC = new PendingReleaseForQAQC(
      availableFiles,
      elementReleaseArr,
    );

    return pendingReleaseForQAQC;
  }
}
