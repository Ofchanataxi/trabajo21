export interface StandardElement {
  id: number;
  name: string;
  idStandardBusinessLines: number;
  required_file_name: string;
  fileExtension: string;
  multipleFiles: boolean;
  useDocumentoHabilitante: boolean;
  useDossier: boolean;
  idStandardCondition: number;
  option_id: number;
  option_value: string;
  option_verified: boolean;
  idStandardAttribute: number;
  attribute_name: string;
  alwaysShow: boolean;
  attribute_verified: boolean;
  required: boolean;
  showRunBES: boolean;
  useInGroupBy: boolean;
  idStandardAttributeTypes: number;
  orderInDescription: number;
  measurementUnit: string;
  synonyms: string | null;
  image: { type: 'Buffer'; data: number[] } | null;
}

export interface StandardAttributes {
  id: number;
  name: string;
  idStandardAttributeTypes: number;
  required: boolean;
  orderInDescription: number;
  idStandardElement: number;
  alwaysShow: boolean;
  onlyShowWith_idStandardAttributes: number[]; // o string[] si manejas IDs como texto
  onlyShowWith_idStandardAttributeOptions: number[]; // igual aquí
  verified: boolean;
  idDefaultStandardAttributeOptions: number;
  useInGroupBy: boolean;
  measurementUnit: string;
  showRunBES: boolean;
  options: StandardAttributeOption[];
}

export interface StandardAttributeOption {
  option_id: number;
  option_value: string;
  option_verified: boolean;
}

export interface Synonym {
  id: number;
  idStandardElements: number;
  synonym: string;
}