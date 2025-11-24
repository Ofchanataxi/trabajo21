// src/domain/entities/StandardAttribute.ts
export class StandardAttribute {
  constructor(
    public id: number,
    public name: string,
    public attributeTypeId: number,
    public required: boolean,
    public orderInDescription: number,
    public elementId: number,
    public alwaysShow: boolean,
    public onlyShowWithAttributeId: number | null,
    public onlyShowWithAttributeOptionId: number | null,
    public options: StandardAttributeOption[],
    public attributeType: StandardAttributeType,
  ) {}
}

export class StandardAttributeOption {
  constructor(
    public id: number,
    public value: string,
    public attributeId: number,
  ) {}
}

export class StandardAttributeType {
  constructor(
    public id: number,
    public type: string,
  ) {}
}
