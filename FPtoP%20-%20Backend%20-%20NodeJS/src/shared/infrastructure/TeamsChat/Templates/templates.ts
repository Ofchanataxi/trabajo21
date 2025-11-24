import { obtainData } from './releaseChangeState';
export const templates: any = {
  releaseChangeState: obtainData,
};

export const obtainTemplate = (nameTemplate: string, dataToSend: any) => {
  return templates[nameTemplate](dataToSend);
};
