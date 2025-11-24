//Interfaz de los datos de releases y elementos del mismo luego de  haber sido standarizado. 

export class AttributePart {
    idAttribute: number | null;
    nameAttribute: null | string;
    idOptionAttribute: number | null;
    nameOption: string;
    elementToSearch: string;

    constructor(
        idAttribute: number | null,
        nameAttribute: null | string,
        idOptionAttribute: number | null,
        nameOption: string,
        elementToSearch: string
    ) {
        this.idAttribute = idAttribute;
        this.nameAttribute = nameAttribute;
        this.idOptionAttribute = idOptionAttribute;
        this.nameOption = nameOption;
        this.elementToSearch = elementToSearch;
    }
}

export class ElementReleaseStandard {
    idElement: number | null;
    descriptionWithOutNameElement: string[] | null;
    description: string;
    condition: string;
    quantity: string;
    serial: string;
    heat: string;
    oitInspection: string;
    oitReparation: string;
    observation: string;
    attributeParts: AttributePart[] | null;

    constructor(
        idElement: number | null,
        descriptionWithOutNameElement: string[] | null,
        description: string,
        condition: string,
        quantity: string,
        serial: string,
        heat: string,
        oitInspection: string,
        oitReparation: string,
        observation: string,
        attributeParts: AttributePart[] | null
    ) {
        this.idElement = idElement;
        this.descriptionWithOutNameElement = descriptionWithOutNameElement;
        this.description = description;
        this.condition = condition;
        this.quantity = quantity;
        this.serial = serial;
        this.heat = heat;
        this.oitInspection = oitInspection;
        this.oitReparation = oitReparation;
        this.observation = observation;
        this.attributeParts = attributeParts;
    }
}