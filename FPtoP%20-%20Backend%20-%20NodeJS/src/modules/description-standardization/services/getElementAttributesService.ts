import { StandardElementModel } from '../infraestructure/database/models/StandardElementModel';
import { StandardAttributes } from '../infraestructure/database/models/StandardAttributes';
import { StandardAttributeOptions } from '../infraestructure/database/models/StandardAttributeOptions';
import { StandardAttributeTypes } from '../infraestructure/database/models/StandardAttributeTypes';

class StandardElementService {
  async getElementsByBusinessLine(businessLineId: number) {
    return await StandardElementModel.findAll({
      where: { businessLineId },
    });
  }

  async getElementAttributesWithOptions(elementId: number) {
    const element = await StandardElementModel.findByPk(elementId, {
      include: [
        {
          model: StandardAttributes,
          include: [
            {
              model: StandardAttributeOptions,
            },
            {
              model: StandardAttributeTypes,
            },
          ],
        },
      ],
    });

    return element;
  }
}

export { StandardElementService };
