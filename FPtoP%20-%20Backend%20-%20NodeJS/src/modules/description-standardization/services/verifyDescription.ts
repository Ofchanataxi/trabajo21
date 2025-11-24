import { BusinessLineService } from '../../business-line/application/services/businessLineServices';
import { GetStandardElementsByBusinessLine } from '../application/use-cases/GetStandardElementsByBusinessLine';
import { SequelizeStandardElementRepository } from '../infraestructure/database/repositories/SequelizeStandardElementRepository';
import { StandardElementService } from './getElementAttributesService';

/* eslint-disable no-useless-escape */
class VerifyDescriptionService {
  obtainAttributeEspecification(AttributesFromElement: any) {
    const ArrayOfAttributes = AttributesFromElement.StandardAttributes;

    // console.log('ArrayOfAttributes+++++++++++++++++++++++');
    // console.log(ArrayOfAttributes);
    // const filteredArray = ArrayOfAttributes.filter(
    //   (attribute: any) =>
    //     attribute.dataValues.orderInDescription > 0 &&
    //     attribute.dataValues.StandardAttributeOptions.length > 0 &&
    //     attribute.dataValues.name.toLowerCase() !== 'nombre del bien',
    // );

    const filteredArray = ArrayOfAttributes.filter(
      (attribute: any) =>
        attribute.dataValues.StandardAttributeOptions.length > 0 &&
        attribute.dataValues.name.toLowerCase() !== 'nombre del bien',
    );

    const sortedArray = [...filteredArray].sort((a, b) => {
      return a.dataValues.orderInDescription - b.dataValues.orderInDescription;
    });

    const arrayAttributes = [];
    for (let i = 0; i < sortedArray.length; i++) {
      const elementOfEstandarization = sortedArray[i];
      const aux = elementOfEstandarization.StandardAttributeOptions;
      const arrayOptions = [];
      for (let j = 0; j < aux.length; j++) {
        const option = aux[j].dataValues;

        // console.log(
        //   'option.value-----------------------------------------------',
        // );
        // console.log(option.value);
        const objAux = {
          idOptionAttribute: option.id,
          value: this.transformToParts(option.value, 1),
        };
        arrayOptions.push(objAux);
      }
      const obj = {
        idAttribute: elementOfEstandarization.dataValues.id,
        nameAttribute: elementOfEstandarization.dataValues.name,
        options: arrayOptions,
      };
      arrayAttributes.push(obj);
    }

    return arrayAttributes;
  }
  obtainAttributeParts(
    AttributesFromElement: any,
    descriptionWithOutNameElement: any,
    responseArray: any,
  ): any {
    const arrayAttributes = this.obtainAttributeEspecification(
      AttributesFromElement,
    );

    // console.log('arrayAttributes');
    // console.log(arrayAttributes);
    // console.dir(arrayAttributes, { depth: null });
    // console.log('descriptionWithOutNameElement');
    // console.dir(descriptionWithOutNameElement, { depth: null });
    let idAttribute = null;
    let nameAttribute = null;
    let idOptionAttribute = null;
    let quantityOfItems = 0;
    let stringArrayOption = [];
    let stringArrayOptionToSearch = [];
    // Primero obtengo los atributos almacenados en base de datos del elemento que estoy analizando y los guardo en arrayAttributes
    for (let i = 0; i < arrayAttributes.length; i++) {
      const attributeToCompare = arrayAttributes[i];
      const attributeOptionsTemp = attributeToCompare.options;
      const attributeOptions = attributeOptionsTemp.sort(
        (a, b) => b.value.length - a.value.length,
      );

      let findOption = false;
      // Despues debo ir comparando por cada atributo del elemento encontrado en base de datos y lo guardo en attributeOptions
      for (let j = 0; j < attributeOptions.length; j++) {
        const attributeOption = attributeOptions[j].value;

        // Luego recorro por cada opcion guardada en la base de datos del atributo de la base de datos
        for (let k = 0; k < attributeOption.length; k++) {
          const partOfOption = attributeOption[k];
          // partOfOption es la opcion que estoy comparando pero que estaba almacenada en la base de datos
          const partOfDescription = descriptionWithOutNameElement[k];
          if (partOfOption === partOfDescription) {
            // Comparo cada valor del elemento a verificar partOfDescription con la opcion que encontre en la base de datos partOfOption
            findOption = true;
            idAttribute = attributeToCompare.idAttribute;
            nameAttribute = attributeToCompare.nameAttribute;
            idOptionAttribute = attributeOptions[j].idOptionAttribute;
            quantityOfItems = quantityOfItems + 1;
            stringArrayOption.push(partOfOption);
            stringArrayOptionToSearch.push(partOfDescription);
            continue;
          } else {
            findOption = false;
            idAttribute = null;
            nameAttribute = null;
            idOptionAttribute = null;
            quantityOfItems = 0;
            stringArrayOption = [];
            stringArrayOptionToSearch = [];
            break;
          }
        }
        if (findOption) {
          break;
        }
      }
      if (findOption) {
        break;
      }
    }

    const restPart = descriptionWithOutNameElement.slice(
      quantityOfItems === 0 ? 1 : quantityOfItems,
    );
    const obj = {
      idAttribute: idAttribute,
      nameAttribute: nameAttribute,
      idOptionAttribute: idOptionAttribute,
      nameOption: stringArrayOption.join(' '),
      elementToSearch:
        idOptionAttribute === null
          ? descriptionWithOutNameElement[0]
          : stringArrayOptionToSearch.join(' '),
    };

    if (obj.elementToSearch !== undefined) {
      responseArray.push(obj);
    }

    if (restPart.length === 0) {
      return responseArray;
    }

    return this.obtainAttributeParts(
      AttributesFromElement,
      restPart,
      responseArray,
    );
  }
  obtainIDPartOfElement(
    arrayNameElementsByBusinessLine: any,
    description: any,
  ) {
    let id: any = null;
    let name: any = null;
    let isEqual = false;
    let maxItemOfElement = 0;
    for (let i = 0; i < arrayNameElementsByBusinessLine.length; i++) {
      const element = arrayNameElementsByBusinessLine[i];
      for (let j = 0; j < element.arrayParts.length; j++) {
        if (j === 0) {
          if (element.arrayParts[j] !== description[j]) {
            break;
          }
        }

        if (element.arrayParts[j] === description[j]) {
          isEqual = true;
          id = element.idElement;
          name = element.elementName;
          maxItemOfElement = maxItemOfElement + 1;
        } else {
          isEqual = false;
          id = null;
          name = null;
        }
      }
      if (isEqual === true) {
        break;
      }
    }

    let descriptionWithOutNameElement = null;
    if (isEqual === true) {
      descriptionWithOutNameElement = description.slice(maxItemOfElement);
    }
    return {
      idElement: id,
      elementName: name,
      descriptionWithOutNameElement: descriptionWithOutNameElement,
    };
  }
  transformToParts(text: string, showConsole: number = 0) {
    // if (showConsole === 1) {
    //   console.log(
    //     '------------------------------------------------------transformToParts',
    //   );
    //   console.log(text);
    // }

    let textTransformed: any = text;
    textTransformed = textTransformed.toLowerCase();
    textTransformed = textTransformed.replace(/,/g, ' ');
    textTransformed = textTransformed.replace(/\. /g, ' ');
    textTransformed = textTransformed.replace(/\- /g, '');
    textTransformed = textTransformed.replace(/\: /g, ' ');
    textTransformed = textTransformed.replace(/\:/g, '');
    textTransformed = textTransformed.split(' ');

    const cleanedArray = [];

    for (let i = 0; i < textTransformed.length; i++) {
      const element = textTransformed[i];
      if (element !== '' && element !== null && element !== undefined) {
        cleanedArray.push(element);
      }
    }

    // if (showConsole === 1) {
    //   console.log(cleanedArray);
    //   console.log(
    //     '------------------------------------------------------cleanedArray transformToParts',
    //   );
    // }

    return cleanedArray;
  }
  getId(description: string, nameElements: any) {
    const arrayNameElementsByBusinessLine = [];
    for (let i = 0; i < nameElements.length; i++) {
      const element = nameElements[i];
      const obj = {
        idElement: element.id,
        elementName: element.name,
        arrayParts: this.transformToParts(element.name),
      };
      arrayNameElementsByBusinessLine.push(obj);
    }
    const idPart = this.obtainIDPartOfElement(
      arrayNameElementsByBusinessLine,
      this.transformToParts(description, 1),
    );

    return idPart;
  }
  async obtainIdPart(elements: any, elementsByBusinessLine: any) {
    const elementsLogistic = [];

    for (let i = 0; i < elements.elements.length; i++) {
      const element = elements.elements[i];
      const obj = {
        ...this.getId(element.description, elementsByBusinessLine),
        serial: element.serial,
        condition: element.condition,
        quantity: element.quantity,
        brand: element.brand,
        description: element.description,
        observations: element.observations,
        oitInspection: element.oitInspection,
        oitReparation: element.oitReparation,
        heat: element.heat,
        partNumber: element.partNumber,
        reel: element.reel,
      };
      elementsLogistic.push(obj);
    }
    return elementsLogistic;
  }

  async obtainAttributesFromStringInAllBusinessLines(description: string) {
    console.log('Voy a validar');
    console.log(description);
    if (description === '') {
      return [];
    }
    if (description === null) {
      return [];
    }
    if (description === undefined) {
      return [];
    }
    const elementRepository = new SequelizeStandardElementRepository();

    const getElementsByBusinessLine = new GetStandardElementsByBusinessLine(
      elementRepository,
    );

    const businessLineService: BusinessLineService = new BusinessLineService();

    const allBusinessLines = await businessLineService.getAll();

    const arrayBusinessLines = allBusinessLines.data;

    const arrElements: any[] = [];
    for (let i = 0; i < arrayBusinessLines.length; i++) {
      const objBusinessLine = arrayBusinessLines[i];
      const elementsByBusinessLine = await getElementsByBusinessLine.execute(
        objBusinessLine.id,
      );

      const arrTemp = {
        elements: [
          {
            description: description,
          },
        ],
      };

      const responseSearch = await this.obtainIdPart(
        arrTemp,
        elementsByBusinessLine,
      );

      const elementSearched = responseSearch[0];
      if (elementSearched.idElement !== null) {
        const objTemp = {
          idElement: elementSearched.idElement,
          elementName: elementSearched.elementName,
          descriptionWithOutNameElement:
            elementSearched.descriptionWithOutNameElement,
          description: elementSearched.description,
          idStandardBusinessLines: objBusinessLine.id,
        };
        arrElements.push(objTemp);
      }
    }

    const standardElementService: StandardElementService =
      new StandardElementService();

    for (let i = 0; i < arrElements.length; i++) {
      const element = arrElements[i];
      if (element.idElement === null) {
        const aux = { ...element, attributeParts: null };
        arrElements[i] = aux;
        continue;
      }

      const AttributesFromElement =
        await standardElementService.getElementAttributesWithOptions(
          element.idElement,
        );

      // console.log('AttributesFromElement');
      // console.log(AttributesFromElement);
      // if (AttributesFromElement !== null) {
      //   console.log(AttributesFromElement.dataValues.StandardAttributes);
      //   const elementosParaMostrar =
      //     AttributesFromElement.dataValues.StandardAttributes;
      //   for (let index = 0; index < elementosParaMostrar.length; index++) {
      //     const elementoParaMostrar = elementosParaMostrar[index];
      //     if (elementoParaMostrar.dataValues.id === 803) {
      //       //console.log(elementoParaMostrar.dataValues);
      //       console.dir(elementoParaMostrar.dataValues, { depth: null });
      //     }
      //   }
      // }

      const aux = {
        ...element,
        attributeParts: this.obtainAttributeParts(
          AttributesFromElement,
          element.descriptionWithOutNameElement,
          [],
        ),
      };

      // Necesito obtener los que no logro mapear o quizas encontrar la condicion inicial

      const arrAttributePartsNotMapped = [];
      const arrAttributePartsOnlyMapped = [];
      let idCondition = null;
      let condition = '';

      console.log('aux.attributeParts');
      console.log(aux.attributeParts);

      for (let j = 0; j < aux.attributeParts.length; j++) {
        let findCondition = false;
        const attributePart = aux.attributeParts[j];

        if (attributePart.elementToSearch === undefined) {
          continue;
        }
        if (attributePart.idAttribute === null) {
          console.log('attributePart.elementToSearch');
          console.log(attributePart.elementToSearch);
          if (attributePart.elementToSearch.toLowerCase().includes('nuevo')) {
            idCondition = 1;
            condition = 'NUEVO';
            findCondition = true;
          }

          if (
            attributePart.elementToSearch
              .toLowerCase()
              .includes('inspeccionado-reparado')
          ) {
            idCondition = 3;
            condition = 'INSPECCIONADO-REPARADO';
            findCondition = true;
          } else if (
            attributePart.elementToSearch
              .toLowerCase()
              .includes('inspeccionado')
          ) {
            idCondition = 2;
            condition = 'INSPECCIONADO';
            findCondition = true;
          } else if (
            attributePart.elementToSearch.toLowerCase().includes('reutilizado')
          ) {
            idCondition = 4;
            condition = 'REUTILIZADO';
            findCondition = true;
          }

          if (findCondition === false) {
            const objTmp = {
              partToSearch: attributePart.elementToSearch,
            };
            arrAttributePartsNotMapped.push(objTmp);
          }
        } else {
          arrAttributePartsOnlyMapped.push(attributePart);
        }
      }
      aux.arrAttributePartsOnlyMapped = arrAttributePartsOnlyMapped;
      aux.attributePartsNotMapped = arrAttributePartsNotMapped;
      aux.idCondition = idCondition;
      aux.condition = condition;
      arrElements[i] = aux;
    }

    //Ordeno para que aparezca desde mayor cantidad de coincidencias a menor
    const arrayOrdered = arrElements.sort(
      (a, b) => a.attributeParts.length - b.attributeParts.length,
    );

    // console.log('arrayOrdered');
    // console.log(arrayOrdered);
    return arrayOrdered;
  }
}

export { VerifyDescriptionService };
