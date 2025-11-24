// // src/interfaces/routes/zipRoutes.ts
import { Router } from 'express';
import { CatalogController } from '../controller/catalogController';

const router = Router();
const catalogController = new CatalogController();

    router.get('/get-standard-business-line', (req, res) =>
        catalogController.getStandardBusinessLine(req, res),
    );

    router.post('/get-standard-elements', (req, res) =>
        catalogController.getStandardElements(req, res),
    );

    router.get('/get-standard-well-sections', (req, res) =>
        catalogController.getStandardWellSections(req, res),
    );

    router.get('/get-standard-well-infrastructure-type', (req, res) =>
        catalogController.getStandardWellInfrastructureType(req, res),
    );

    router.post('/add-standard-element', (req, res) =>
        catalogController.addStandardElement(req, res),
    );
    router.get('/get-standard-attribute-types', (req, res) =>
        catalogController.getStandardAttributeTypes(req, res),
    );

    router.post('/edit-standard-attributes', (req, res) =>
        catalogController.editStandardAttributes(req, res),
    );

    router.post('/add-standard-elements-Synonyms', (req, res) =>
        catalogController.addStandarElementsSynonyms(req, res),
    );

    router.put('/synonyms/:id', (req, res) =>
        catalogController.editStandarElementSynonym(req, res),
    );

    router.delete('/synonyms/:id/:idUser', (req, res) =>
    catalogController.deleteStandarElementSynonym(req, res),
);

    router.delete('/delete-attribute-option/:idStandardAttributeOption/:idUser', (req, res) =>
    catalogController.deleteAttributeOption(req, res),
);

    router.post('/update-attribute-option', (req, res) =>
        catalogController.updateAttributeOption(req, res),
    );

    router.post('/update-attribute', (req, res) =>
        catalogController.updateAttribute(req, res),
    );

    router.post('/get-standard-elements-by-id', (req, res) =>
        catalogController.getStandardElementById(req, res),
    );

    router.post('/update-standard-element', (req, res) =>
        catalogController.updateStandardElement(req, res),
    );

    router.delete('/delete-attribute/:idStandardElement/:idStandardAttribute/:attributeOrderInDescription/:idUser', (req, res) =>
    catalogController.deleteAttribute(req, res),
);

    router.delete('/delete-standard-element/:idStandardElement/:idUser', (req, res) =>
        catalogController.deleteStandardElement(req, res),
    );

    router.post('/update-extension-documents', (req, res) =>
        catalogController.updateExtensionDocuments(req, res),
    );

    router.post('/delete-extension-documents', (req, res) =>
        catalogController.deleteExtensionDocuments(req, res),
    );

    router.get('/standard-elements/:elementId/synonyms', (req, res) =>
        catalogController.getSynonymsForElement(req, res),
    );

    router.post('/standard-element-image/:id', (req, res) =>
    catalogController.addOrUpdateStandardElementImage(req, res),
    );

    router.delete('/standard-element-image/:id', (req, res) =>
    catalogController.deleteStandardElementImage(req, res),
    );

export default router;
