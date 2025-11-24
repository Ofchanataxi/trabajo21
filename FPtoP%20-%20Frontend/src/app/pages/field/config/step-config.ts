
import { ColumnConfigs } from './column-config';

export interface Step {
  label: string;
  number: string;
  ariaLabel: string;
  config: keyof ColumnConfigs;
}

export const steps: Step[] = [
  {
    label: 'Información del pozo',
    number: 'one',
    ariaLabel: 'Información del pozo',
    config: 'stepOne',
  },
  {
    label: 'Recepción de materiales',
    number: 'two',
    ariaLabel: 'Recepción de materiales',
    config: 'stepTwo',
  },
  {
    label: 'Selección de herramientas',
    number: 'three',
    ariaLabel: 'Selección de herramientas',
    config: 'stepThree',
  },
  {
    label: 'Elaboración Tally',
    number: 'four',
    ariaLabel: 'Elaboración Tally',
    config: 'stepFour',
  },
  {
    label: 'Resumen',
    number: 'five',
    ariaLabel: 'Resumen',
    config: 'stepFive',
  },
  {
    label: 'Revisión - CWI Campo',
    number: 'six',
    ariaLabel: 'Revisión - CWI Campo',
    config: 'stepSix',
  },
  {
    label: 'Revisión - CWI Quito',
    number: 'seven',
    ariaLabel: 'Revisión - CWI Quito',
    config: 'stepSeven',
  },
  {
    label: 'WorkAround - RUNBES',
    number: 'eight',
    ariaLabel: 'WorkAround - RUNBES',
    config: 'stepEight',
  },
];
