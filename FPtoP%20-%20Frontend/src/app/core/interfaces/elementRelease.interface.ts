export interface ElementRelease {
  idElement:                     number;
  descriptionWithOutNameElement: string[] | null;
  description:                   string;
  condition:                     string;
  quantity:                      string;
  serial:                        string;
  heat:                          string;
  oitInspection:                 string;
  oitReparation:                 string;
  observation:                   string;
  attributeParts:                AttributePart[] | null;
}

export interface AttributePart {
  idAttribute:       number | null;
  nameAttribute:     null | string;
  idOptionAttribute: number | null;
  nameOption:        string;
  elementToSearch:   string;
}
