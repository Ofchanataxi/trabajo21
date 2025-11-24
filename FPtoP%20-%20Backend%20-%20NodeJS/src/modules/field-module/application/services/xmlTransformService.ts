import * as fs from 'fs';
import { parseStringPromise } from 'xml2js';
import { conversion } from '../../domain/services/transformacionXMLold';

export class XmlTransformService {
  async transformXmlToJson(filePath: string): Promise<any> {
    try {
      // eslint-disable-next-line no-console
      console.log('transformXmlToJson 1');
      const xmlData = fs.readFileSync(filePath, 'utf-8');
      // eslint-disable-next-line no-console
      console.log('transformXmlToJson 2', xmlData);
      const jsonResult = await parseStringPromise(xmlData);
      // eslint-disable-next-line no-console
      console.log('transformXmlToJson 3', jsonResult);
      const converted = await conversion(
        jsonResult,
        filePath.replace('.xml', '.json'),
      );
      // eslint-disable-next-line no-console
      console.log('converted', filePath, converted);
      return converted;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error converting XML to JSON:', error);
      throw error;
    }
  }
}
