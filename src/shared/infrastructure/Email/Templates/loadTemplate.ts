import { readFileSync } from 'fs';
import * as Handlebars from 'handlebars';
import path from 'path';

export function loadTemplate(
  templateName: string,
): Handlebars.TemplateDelegate {
  const filePath = path.join(__dirname, 'Templates', `${templateName}.hbs`);
  const templateSource = readFileSync(filePath, 'utf8');
  return Handlebars.compile(templateSource);
}
