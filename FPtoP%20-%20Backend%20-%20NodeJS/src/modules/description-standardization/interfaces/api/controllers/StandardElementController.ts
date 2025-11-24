import { Request, Response } from 'express';
import { GetStandardElementsByBusinessLine } from '../../../application/use-cases/GetStandardElementsByBusinessLine';
import { StandardElementService } from '../../../services/getElementAttributesService';
import { VerifyDescriptionService } from '../../../services/verifyDescription';

export class StandardElementController {
  standardElementService = new StandardElementService();
  verifyDescriptionService = new VerifyDescriptionService();
  constructor(
    private getElementsByBusinessLine: GetStandardElementsByBusinessLine,
  ) {}

  async getElements(req: Request, res: Response) {
    try {
      const businessLineId = parseInt(req.params.businessLineId, 10);
      if (isNaN(businessLineId) || businessLineId <= 0) {
        return res.status(400).json({ error: 'Invalid business line ID' });
      }
      const elements =
        await this.getElementsByBusinessLine.execute(businessLineId);
      res.json(elements);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An unexpected error occurred' });
    }
  }

  async getElementAttributes(req: Request, res: Response) {
    const elementId = parseInt(req.params.id, 10);

    if (isNaN(elementId)) {
      return res.status(400).json({ error: 'Invalid element ID' });
    }

    try {
      const element =
        await this.standardElementService.getElementAttributesWithOptions(
          elementId,
        );
      if (!element) {
        return res.status(404).json({ error: 'Element not found' });
      }
      res.json(element);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async verifyStandard(req: Request, res: Response) {
    //console.log('req.body');
    //console.log(req.body);

    try {
      const { idBusinessLine, elements } = req.body;

      if (!idBusinessLine) {
        return res.status(400).json({ error: 'idBusinessLine is required' });
      }

      const elementsByBusinessLine =
        await this.getElementsByBusinessLine.execute(idBusinessLine);
      // 1: obtain the element id of each element

      // Obtener los elementos para la línea de negocio proporcionada
      // const elementsByBusinessLine =
      //   await this.getElementsByBusinessLine.executeAll();

      // if (!elementsByBusinessLine || elementsByBusinessLine.length === 0) {
      //   return res.status(404).json({
      //     error: `No elements found for business line ID ${req.body.idBusinessLine}`,
      //   });
      // }
      // Procesar los elementos y obtener IDs de parte
      const response = await this.verifyDescriptionService.obtainIdPart(
        { elements }, // Pasamos solo los elementos, ya que idBusinessLine ya se usó
        elementsByBusinessLine,
      );

      if (response === null) {
        return res
          .status(404)
          .json({ error: 'ID of business line not included' });
      }

      //2: For each element we parse in parts
      for (let i = 0; i < response.length; i++) {
        const element = response[i];
        if (element.idElement === null) {
          const aux = { ...element, attributeParts: null };
          response[i] = aux;
          continue;
        }

        const AttributesFromElement =
          await this.standardElementService.getElementAttributesWithOptions(
            element.idElement,
          );
        const aux = {
          ...element,
          attributeParts: this.verifyDescriptionService.obtainAttributeParts(
            AttributesFromElement,
            element.descriptionWithOutNameElement,
            [],
          ),
        };
        response[i] = aux;
      }

      return res.status(200).json(response);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
