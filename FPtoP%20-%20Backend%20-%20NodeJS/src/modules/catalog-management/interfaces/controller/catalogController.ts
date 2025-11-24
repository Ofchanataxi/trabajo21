import { Request, Response } from 'express';
import { CatalogServices } from '../../aplication/services/catalogServices';

export class CatalogController {
  private catalogServices: CatalogServices;

  constructor() {
    this.catalogServices = new CatalogServices();
  }

  public async getStandardBusinessLine(req: Request, res: Response) {
    try {
      const response = await this.catalogServices.getStandardBusinessLine();
      return res.json(response);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  public async getStandardElements(req: Request, res: Response) {
    const { standardElementName, idBusinessLine } = req.body; // Corregido el typo de "stanrdElementName"
    try {
      const response = await this.catalogServices.getStandardElements(
        standardElementName, 
        idBusinessLine,
      );
      return res.json(response);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  public async getStandardElementById(req: Request, res: Response) {
    const element = req.body; 
    try {
      const response = await this.catalogServices.getStandardElementById(
        element
      );
      return res.json(response);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

   public async updateStandardElement(req: Request, res: Response) {
    const element = req.body; // Corregido el typo de "stanrdElementName"
    try {
      const response = await this.catalogServices.UpdateStandardElement(element);
      return res.status(201).json(response);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
      
  }

  public async addOrUpdateStandardElementImage(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      const { imageBase64 } = req.body;

      if (!id || !imageBase64) {
        return res.status(400).json({ message: 'Faltan el ID del elemento o los datos de la imagen.' });
      }

      const response = await this.catalogServices.addOrUpdateStandardElementImage(id, imageBase64);
      return res.status(200).json(response);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  public async deleteStandardElementImage(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);

      if (!id) {
        return res.status(400).json({ message: 'Falta el ID del elemento.' });
      }

      const response = await this.catalogServices.deleteStandardElementImage(id);
      return res.status(200).json(response);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  //   try {
  //      const response = await this.catalogServices.getStandardElements(
  //       id, name, idStandardBusinessLines, idStandardWellSections,
  //        verified, idStandardWellInfrastructureType, showRunBES,
  //         needSerialNumber
  //     );
  //   } catch (error: any) {
  //       return res.status(500).json({ message: error.message });
  //   }
  // }

  public async getStandardWellSections(req: Request, res: Response) {
    try {
      const response = await this.catalogServices.getStandardWellSections();
      return res.json(response);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  public async getStandardWellInfrastructureType(req: Request, res: Response) {
    try {
      const response = await this.catalogServices.getStandardWellInfrastructureType();
      return res.json(response);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  public async addStandardElement(req: Request, res: Response) {    
    const { 
      name, idStandardBusinessLines, idStandardWellSections,
      verified, idStandardWellInfrastructureType, showRunBES,
      needSerialNumber,
    } = req.body;
  
    try {
      const response = await this.catalogServices.addStandarElement(
        name, idStandardBusinessLines, idStandardWellSections,
        verified, idStandardWellInfrastructureType, showRunBES,
        needSerialNumber,
      );
      return res.status(201).json(response);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  public async getStandardAttributeTypes(req: Request, res: Response) {
    try {
      const response = await this.catalogServices.getStandardAttributeTypes();
      return res.json(response);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
  
  public async editStandardAttributes(req: Request, res: Response) {
    const attributes = req.body; // Ahora esperamos un array de objetos

    try {
        const response = await this.catalogServices.editStandardAttributes(attributes);
        return res.status(201).json(response);
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
  }

  public async deleteAttributeOption(req: Request, res: Response) {
    const { idStandardAttributeOption, idUser } = req.params;
    try {
        const response = await this.catalogServices.deleteAttributeOption(Number(idStandardAttributeOption), Number(idUser));
        return res.status(200).json(response);
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
}

  public async updateAttributeOption(req: Request, res: Response) {
    const {idStandardAttribute, option} = req.body;
 
    try {
      const response = await this.catalogServices.updateAttributeOption(Number(idStandardAttribute), option);
      return res.status(201).json(response);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  public async deleteAttribute(req: Request, res: Response) {
    const { idStandardElement, idStandardAttribute, attributeOrderInDescription, idUser } = req.params;
    try {
        const response = await this.catalogServices.deleteAttribute(Number(idStandardElement), Number(idStandardAttribute), Number(attributeOrderInDescription), Number(idUser));
        return res.status(200).json(response);
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
}
  public async updateAttribute(req: Request, res: Response) {
    const{idStandardElement, attribute} = req.body;
 
    try {
      const response = await this.catalogServices.updateAttribute(Number(idStandardElement), attribute);
      return res.status(201).json(response);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
  
  public async deleteStandardElement(req: Request, res: Response) {
    const { idStandardElement, idUser} = req.params;
    try {
        const response = await this.catalogServices.deleteStandardElement(Number(idStandardElement), Number(idUser));
        return res.status(200).json(response);
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
  }

  public async addStandarElementsSynonyms(req: Request, res: Response) {
    const { 
      idStandardElements, synonym,
    } = req.body;
  
    try {
      const response = await this.catalogServices.addStandarElementsSynonyms(
        idStandardElements, synonym,
      );
      return res.status(201).json(response);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  public async editStandarElementSynonym(req: Request, res: Response) {
    const id = parseInt(req.params.id, 10); 
    const { synonym } = req.body;

    if (isNaN(id) || !synonym) {
      return res.status(400).json({ message: 'Invalid input. Both synonym ID and new text are required.' });
    }

    try {
      const updatedSynonym = await this.catalogServices.editStandarElementSynonym(id, synonym);
      return res.status(200).json(updatedSynonym);
    } catch (error: any) {
      if (error.message.includes('not found')) {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: error.message });
    }
  }

  public async deleteStandarElementSynonym(req: Request, res: Response) {
    // Se extraen id y idUser de req.params
    const { id, idUser } = req.params;
    const synonymId = parseInt(id, 10);

    if (isNaN(synonymId)) {
        return res.status(400).json({ message: 'Invalid synonym ID provided.' });
    }

    try {
        // Se pasa el idUser (convertido a número) al servicio
        await this.catalogServices.deleteStandarElementSynonym(synonymId, Number(idUser));
        return res.status(200).json({ message: `Synonym with ID ${synonymId} deleted successfully.` });
    } catch (error: any) {
        if (error.message.includes('not found')) {
            return res.status(404).json({ message: error.message });
        }
        return res.status(500).json({ message: error.message });
    }
  }

  public async getSynonymsForElement(req: Request, res: Response) {
    try {
      const elementId = parseInt(req.params.elementId, 10);

      if (isNaN(elementId)) {
        return res.status(400).json({ success: false, message: 'El ID del elemento no es válido.' });
      }

      const synonyms = await this.catalogServices.getSynonymsByElementId(elementId);
      
      return res.json({ success: true, data: synonyms });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public async updateExtensionDocuments(req: Request, res: Response) {
    const reqs = req.body;

    try {
      const response = await this.catalogServices.updateExtensionDocuments(reqs);
      return res.status(201).json(response);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  public async deleteExtensionDocuments(req: Request, res: Response) {
    const { documentsToDelete, idUser } = req.body;
    if (!documentsToDelete || !idUser) {
        return res.status(400).json({ message: 'La solicitud debe incluir "documentsToDelete" y "idUser".' });
    }
    try {
        const response = await this.catalogServices.deleteExtensionDocuments(documentsToDelete, idUser);
        return res.status(200).json(response); 
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
}
}
