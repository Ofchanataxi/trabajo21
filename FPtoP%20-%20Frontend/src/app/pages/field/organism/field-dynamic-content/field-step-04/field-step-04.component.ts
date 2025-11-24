import {
  Component,
  Input,
  Output,
  OnInit,
  EventEmitter,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { IwcExcelService } from '../../../services/iwc-excel.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-field-step-four',
  templateUrl: './field-step-04.component.html',
  styleUrls: ['./field-step-04.component.scss'],
})
export class FieldStepFourComponent implements OnInit {
  @Input() searchingItems: any[];
  @Input() groupedData: any;
  @Input() columnConfig: any;

  @Input() updatedFields: {
    tableName: string;
    fieldName: string;
    idRow: string;
    newValue: any;
    idOilfieldOperations: string;
    tally_id: string;
    idElementRelease: string;
    groupid: string;
    sequence_number: any;
  }[] = [];

  @Output() searchChange = new EventEmitter<any>();
  @Output() search = new EventEmitter<any>();
  @Output() searchClear = new EventEmitter<any>();

  @Output() updatedFieldsChange = new EventEmitter<
    {
      tableName: string;
      fieldName: string;
      idRow: string;
      newValue: any;
      idOilfieldOperations: string;
      tally_id: string;
      idElementRelease: string;
      groupid: string;
      sequence_number: any;
    }[]
  >();

  @ViewChild('printSection', { static: false })
  printSection!: ElementRef<HTMLDivElement>;

  // Forzar refresco “duro” de la tabla
  tableAlive = true;

  searchTerm: string = '';
  filteredData: { [key: string]: any[] };

  constructor(private iwcExcelService: IwcExcelService) {}

  ngOnInit() {
    // Filtrar para que solo queden los elementos con showInTally = true
    if (this.groupedData) {
      Object.keys(this.groupedData).forEach(groupKey => {
        this.groupedData[groupKey] = this.groupedData[groupKey].filter(
          (item: any) => item.showInTally === true
        );
      });
    }
  }

  // ---- Notificaciones centralizadas ----
  private notifyOk(msg: string) {
    alert(msg);
  }
  private notifyErr(msg: string) {
    alert(msg);
  }

  // Helper para mostrar mensaje del backend cuando responde con JSON como Blob (422 u otros)
  private async showBackendErrorBlob(blob: Blob) {
    try {
      const text = await blob.text();
      try {
        const data = JSON.parse(text);
        const msg = data?.message || 'No fue posible generar el IWC.';
        const missing =
          Array.isArray(data?.missing) && data.missing.length
            ? `\nFaltan: ${data.missing.join(', ')}`
            : '';
        const hint = data?.hint ? `\n${data.hint}` : '';
        this.notifyErr(`${msg}${missing}${hint}`);
      } catch {
        this.notifyErr(text || 'No fue posible generar el IWC.');
      }
    } catch {
      this.notifyErr('No fue posible leer el error del servidor.');
    }
  }

  downloadIWC(): void {
    // Aplanar los grupos en un solo array
    const allGroups: any[] = Object.values(this.groupedData || {}).flat();

    // Buscar el primer elemento que tenga tally_id
    const found: any = allGroups.find((item: any) => item.tally_id);
    const tallyId = found?.tally_id;

    if (!tallyId) {
      this.notifyErr('No se encontró el Tally seleccionado.');
      return;
    }

    this.iwcExcelService.downloadIwcExcel(tallyId).subscribe({
      next: (response: Blob) => {
        // Si viene JSON/TEXT, mostrar mensaje y no descargar
        if (response.type.includes('json') || response.type.includes('text')) {
          this.showBackendErrorBlob(response);
          return;
        }

        // Crear Blob como Excel solo si el tipo es correcto
        const blob = new Blob([response], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `IWC_${tallyId}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: err => {
        // En 422 el backend manda JSON como Blob en err.error
        if (err?.error instanceof Blob) {
          this.showBackendErrorBlob(err.error);
          return;
        }
        this.notifyErr(err?.error?.message || err?.message || 'No fue posible generar el IWC.');
      },
    });
  }

  // Config cargar plantilla IWC - BLOQUE 1 (ya existente)
  startRow = 9;
  idCol = 'C';
  lenCol = 'J';

  // >>> NUEVO: Config BLOQUE 2 adicional (conservar + agregar desde AY20 / AU20)
  startRow2 = 20;
  idCol2 = 'AY'; // idElementTally
  lenCol2 = 'AU'; // length

  private cell(ws: XLSX.WorkSheet, r1: number, col: string) {
    const c = ws[`${col}${r1}`];
    return c?.v ?? null;
  }

  /** Busca en groupedData el tally_id e idOilfieldOperations visibles en la página */
  private getCurrentPageIds(): { tallyId?: number; idOilfieldOperations?: number } {
    const allGroups: any[] = Object.values(this.groupedData || {}).flat();
    const found = allGroups.find((it: any) => it?.tally_id || it?.idOilfieldOperations);
    const tallyId = found?.tally_id != null ? Number(found.tally_id) : undefined;
    const idOilfieldOperations =
      found?.idOilfieldOperations != null ? Number(found.idOilfieldOperations) : undefined;
    return { tallyId, idOilfieldOperations };
  }

  onExcelTallySelected(evt: Event) {
    const file = (evt.target as HTMLInputElement)?.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const wb = XLSX.read(new Uint8Array(reader.result as ArrayBuffer), { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        if (!ws) {
          this.notifyErr('No se encontró la hoja 1.');
          return;
        }

        // --- Validación: A6 (tally_id) y D6 (idOilfieldOperations) deben coincidir con la página
        const { tallyId: expectedTallyId, idOilfieldOperations: expectedOp } =
          this.getCurrentPageIds();

        const excelTallyRaw = ws['A6']?.v ?? null;
        const excelOpRaw = ws['D6']?.v ?? null;

        const excelTally = excelTallyRaw === null ? NaN : Number(excelTallyRaw);
        const excelOp = excelOpRaw === null ? NaN : Number(excelOpRaw);

        if (!Number.isFinite(excelTally) || !Number.isFinite(excelOp)) {
          this.notifyErr(
            'El archivo no tiene valores numéricos válidos en A6 (tally_id) y/o D6 (idOilfieldOperations).'
          );
          return;
        }
        if (expectedTallyId != null && excelTally !== expectedTallyId) {
          this.notifyErr(
            `tally_id de Excel (A6=${excelTally}) no coincide con el de la página (${expectedTallyId}).`
          );
          return;
        }
        if (expectedOp != null && excelOp !== expectedOp) {
          this.notifyErr(
            `idOilfieldOperations de Excel (D6=${excelOp}) no coincide con el de la página (${expectedOp}).`
          );
          return;
        }
        // --- fin validación

        const ref = ws['!ref'] || 'A1:A1';
        const range = XLSX.utils.decode_range(ref);
        const lastRow1 = range.e.r + 1;

        // Arreglos a enviar (conservamos lo anterior y agregamos el nuevo bloque)
        const idElementTally: number[] = [];
        const length: (number | null)[] = [];

        // ========== BLOQUE 1 (C / J desde fila 9) ==========
        for (let r = this.startRow; r <= lastRow1; r++) {
          const idRaw = this.cell(ws, r, this.idCol);
          const lenRaw = this.cell(ws, r, this.lenCol);

          // cortar en la PRIMERA fila con idElementTally vacío
          if (idRaw == null || idRaw === '') break;

          const idNum = Number(idRaw);
          if (!Number.isFinite(idNum)) {
            this.notifyErr(`Fila ${r}: idElementTally no numérico -> "${idRaw}"`);
            break; // cortamos para preservar correspondencia
          }

          let len: number | null = null;
          if (!(lenRaw == null || lenRaw === '')) {
            const lenNum = Number(lenRaw);
            if (Number.isFinite(lenNum)) {
              len = lenNum;
            } else {
              this.notifyErr(`Fila ${r}: length no numérico, se envía null (ID ${idNum}).`);
              len = null;
            }
          }

          idElementTally.push(idNum);
          length.push(len);
        }

        // ========== BLOQUE 2 (AY / AU desde fila 20) ==========
        // Conserva lo leído y AÑADE todo lo que encuentre desde AY20 (id) y AU20 (length)
        for (let r = this.startRow2; r <= lastRow1; r++) {
          const idRaw2 = this.cell(ws, r, this.idCol2); // AY
          const lenRaw2 = this.cell(ws, r, this.lenCol2); // AU

          // si está vacío, cortamos el bloque 2
          if (idRaw2 == null || idRaw2 === '') break;

          const idNum2 = Number(idRaw2);
          if (!Number.isFinite(idNum2)) {
            this.notifyErr(`Fila ${r}: idElementTally (AY) no numérico -> "${idRaw2}"`);
            break;
          }

          let len2: number | null = null;
          if (!(lenRaw2 == null || lenRaw2 === '')) {
            const lenNum2 = Number(lenRaw2);
            if (Number.isFinite(lenNum2)) {
              len2 = lenNum2;
            } else {
              this.notifyErr(`Fila ${r}: length (AU) no numérico, se envía null (ID ${idNum2}).`);
              len2 = null;
            }
          }

          idElementTally.push(idNum2);
          length.push(len2);
        }

        if (!idElementTally.length) {
          this.notifyErr('No se detectaron IDs en ninguno de los bloques configurados.');
          return;
        }

        this.iwcExcelService.updateTallyLengths({ idElementTally, length }).subscribe({
          next: (res: { updated: number; errors: any[] }) => {
            this.notifyOk(`Se cargo el template correctamente`);

            // Avisar al padre (si lo escucha)
            this.search.emit({ force: true, source: 'excelUpload', updated: res.updated });

            // Refresco local garantizado de la tabla
            this.groupedData = { ...this.groupedData };
            this.tableAlive = false;
            setTimeout(() => (this.tableAlive = true));
          },
          error: (err: any) => {
            this.notifyErr(
              'Error al actualizar: ' + (err?.error?.message ?? err?.message ?? 'desconocido')
            );
          },
        });

        // Logs de verificación (opcional)
        console.log('idElementTally[] (number):', idElementTally);
        console.log('length[] (number|null):', length);
        console.table(idElementTally.map((id, i) => ({ id, length: length[i] })));
      } catch (e: any) {
        this.notifyErr('No se pudo leer el Excel: ' + (e?.message ?? e));
      }
    };
    reader.readAsArrayBuffer(file);
  }

  getKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  getColumnKeys(group: string): string[] {
    return this.groupedData[group] && this.groupedData[group].length > 0
      ? Object.keys(this.groupedData[group][0]).filter(key => key !== 'type')
      : [];
  }

  onSearchChange(event: any) {
    this.searchChange.emit(event);
    this.searchTerm = event;
  }

  onSearch(event: any) {
    this.search.emit(event);
  }

  onSearchClear(event: any) {
    this.searchClear.emit(event);
    this.filteredData = { ...this.groupedData };
  }

  getColumnType(columnKey: string): string {
    return this.columnConfig[columnKey]?.type || 'text';
  }

  getColumnLabel(columnKey: string): string {
    return this.columnConfig[columnKey]?.label || '';
  }

  KNOWN_TYPES = ['Cabezales', 'Logistica', 'Completion', 'ALS'];

  elementsCheckListFilter = [
    { name: 'Cabezal', code: 'Cabezales', selected: false },
    { name: 'Logistica', code: 'Logistica', selected: false },
    { name: 'Completación', code: 'Completion', selected: false },
    { name: 'ALS', code: 'ALS', selected: false },
    { name: 'Otros', code: 'OTROS', selected: false },
  ];

  private getFilterParams() {
    const codes = this.elementsCheckListFilter
      .filter(e => e.selected && e.code !== 'OTROS')
      .map(e => e.code);

    const hasOtros = this.elementsCheckListFilter.some(e => e.code === 'OTROS' && e.selected);

    return { codes, hasOtros };
  }

  private getActiveTypes(): string[] {
    return this.elementsCheckListFilter.filter(e => e.selected).map(e => e.code);
  }

  onCheckboxChange(): void {
    const activeCodes = this.getActiveTypes();
    const hasOtros = activeCodes.includes('OTROS');
    const explicit = activeCodes.filter(c => c !== 'OTROS');

    const rows = this.printSection?.nativeElement.querySelectorAll('tbody tr') || [];

    rows.forEach((tr: any) => {
      const tipo = (tr.getAttribute('data-type') || '').trim();

      const visible =
        activeCodes.length === 0 ||
        explicit.includes(tipo) ||
        (hasOtros && !this.KNOWN_TYPES.includes(tipo));

      tr.style.display = visible ? '' : 'none';
    });
  }

  getElementsCheckList() {
    const elementosSeleccionados = this.elementsCheckListFilter
      .filter(elemento => elemento.selected)
      .map(elemento => elemento.name);

    alert(`Elementos seleccionados: ${elementosSeleccionados.join(', ')}`);
  }

  onUpdatedFieldsChange(
    updatedFields: {
      tableName: string;
      fieldName: string;
      idRow: string;
      newValue: any;
      idOilfieldOperations: string;
      tally_id: string;
      idElementRelease: string;
      groupid: string;
      sequence_number: any;
    }[]
  ): void {
    this.updatedFieldsChange.emit(updatedFields); // Re-emit the event
  }

  printElementsWithoutMeasure(): void {
    if (!this.printSection) return;

    const tbodyRows = Array.from(
      this.printSection.nativeElement.querySelectorAll('tbody tr')
    ) as HTMLTableRowElement[];

    const COL_INDEX = 4;

    const activeCodes = this.getActiveTypes();
    const hasOtros = activeCodes.includes('OTROS');
    const explicit = activeCodes.filter(c => c !== 'OTROS');

    const rowsToPrint = tbodyRows.filter(tr => {
      const measureCell = tr.querySelector(`td:nth-child(${COL_INDEX})`);
      const input = measureCell?.querySelector('input');
      const value = input ? (input as HTMLInputElement).value.trim() : '';

      const tipo = (tr.getAttribute('data-type') || '').trim();

      const matchTipo =
        activeCodes.length === 0 ||
        explicit.includes(tipo) ||
        (hasOtros && !this.KNOWN_TYPES.includes(tipo));

      return value.length === 0 && matchTipo;
    });

    if (!rowsToPrint.length) {
      this.notifyErr('No hay elementos sin medida para imprimir.');
      return;
    }

    const theadNode = this.printSection.nativeElement
      .querySelector('thead')!
      .cloneNode(true) as HTMLElement;

    const headerRow = theadNode.querySelector('tr')!;
    const thItem = document.createElement('th');
    thItem.textContent = 'Item';
    thItem.style.textAlign = 'center';
    headerRow.insertBefore(thItem, headerRow.firstChild);

    const removeComments = (node: Node) => {
      Array.from(node.childNodes).forEach(c => {
        if (c.nodeType === 8) node.removeChild(c);
        else removeComments(c);
      });
    };
    removeComments(theadNode);

    const tbodyHtml = rowsToPrint
      .map((tr, idx) => {
        const trClone = tr.cloneNode(true) as HTMLElement;
        trClone.querySelectorAll('input').forEach(inp => inp.remove());
        removeComments(trClone);
        const tdItem = document.createElement('td');
        tdItem.textContent = String(idx + 1);
        tdItem.style.textAlign = 'center';
        trClone.insertBefore(tdItem, trClone.firstChild);
        return trClone.outerHTML;
      })
      .join('');

    const tableHtml = `<table>${theadNode.outerHTML}<tbody>${tbodyHtml}</tbody></table>`;

    const popup = window.open('', '_blank', 'width=900,height=600,scrollbars=yes');
    if (!popup) return;

    popup.document.open();
    popup.document.write(`
    <html>
      <head>
        <title>Elementos sin medida</title>
        <style>
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #000; padding: 6px; text-align: left; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body onload="window.print(); window.close();">
        ${tableHtml}
      </body>
    </html>
  `);
    popup.document.close();
  }
}
