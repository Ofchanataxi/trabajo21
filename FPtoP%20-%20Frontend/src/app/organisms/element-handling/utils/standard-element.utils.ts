import { StandardElement } from '../interfaces/interfaces.interfaces';

export interface StandardElementGroup {
  id: number;
  name: string;
  elementos: StandardElement[]; 
}

export function groupElementsByName(elementos: StandardElement[]): StandardElementGroup[] {
  const mapa = new Map<string, { id: number; name: string; elementos: StandardElement[] }>();

  for (const elemento of elementos) {
    const clave = `${elemento.id}-${elemento.name}`;
    if (!mapa.has(clave)) {
      mapa.set(clave, {
        id: elemento.id,
        name: elemento.name,
        elementos: [elemento],
      });
    } else {
      mapa.get(clave)!.elementos.push(elemento);
    }
  }

  return Array.from(mapa.values())
    .map(grupo => {
      const elementos = grupo.elementos;

      const allEqualOrderInDesc = elementos.every(
        e => e.orderInDescription === elementos[0].orderInDescription
      );

      const sortedElementos = [...elementos].sort((a, b) => {
        if (allEqualOrderInDesc) {
          return a.idStandardAttribute - b.idStandardAttribute;
        }

        if (a.orderInDescription === b.orderInDescription) {
          return a.idStandardAttribute - b.idStandardAttribute;
        }

        return a.orderInDescription - b.orderInDescription;
      });

      return {
        id: grupo.id,
        name: grupo.name,
        elementos: sortedElementos,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

