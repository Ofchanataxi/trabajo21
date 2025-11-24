export interface ElementToSend {
  idBusinessLine: number;
  elements:       Element[];
}

export interface Element {
  description:   string;
  condition:     string;
  quantity:      number;
  serial:        string;
  heat:          string;
  oitInspection: string;
  oitReparation: string;
  observation:   string;
}
