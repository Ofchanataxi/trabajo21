import { Exception } from 'handlebars';
import { releaseStateHistory } from '../../../domain/entities/WellInformation';
import { WellStatusRepository } from '../../../domain/repositories/WellStatusRepository';
import { ReleaseStateHistory } from '../models/ReleaseStateHistoryModel';
import { Release } from '../models/releaseModel';
import { sequelize } from '../../../../well-management/infrastructure/database/sequelize';

export class SequelizeWellStatusRepository implements WellStatusRepository {
  async OnRejectElementReleaseStatus(
    releaseId: number,
    isApproved: boolean,
    commentaryRelease: string,
  ): Promise<any> {
    try {
      //console.log(releaseId, "este es el id que toca buscar")
      const _release = await Release.findOne({
        where: {
          id: releaseId,
          idReleaseState: 2, //Release State especifico para calidad
        },
      });
      if (_release === null) {
        //console.log('No existe release para revisar en QAQC!');
      } else {
        const _releaseHistory = await ReleaseStateHistory.findOne({
          where: {
            idPreviousState: 1, //Identificador para release state de Logistica
            idNewReleaseState: 2, //Identificador para release state de Calidad
          },
        });

        if (_releaseHistory === null) {
          //console.log("No existe historial del Release")
        } else {
          //console.log("Se ha creado una entrada más al historial")
          const newReleaseHistory = await ReleaseStateHistory.create({
            idRelease: releaseId,
            idNewReleaseState: 1,
            idPreviousState: 2,
            idChangedBy: 2,
            changeTimestamp: new Date(),
            changeReason: commentaryRelease, //editado
          });
          //console.log(newReleaseHistory.toJSON())
        }
      }
      return null;
    } catch (error) {
      //console.log(error);
      throw new Exception(
        'Error getting rejected oil field operations by QAQC',
      );
    }
  }
}
