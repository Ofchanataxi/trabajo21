import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  Input,
  SimpleChanges,
} from '@angular/core';
import { CellClickedEvent, CellDoubleClickedEvent, GridOptions } from 'ag-grid-community';

@Component({
  selector: 'shared-well-table-information',
  templateUrl: './well-table-information.component.html',
  styleUrls: ['./well-table-information.component.scss'],
})
export class WellTableInformationComponent implements OnInit, OnDestroy {
  @Input() rowData!: any[];
  @Input() rowDataFromTable!: any[];
  @Input() testDataList: Object[];
  @Input() fields!: any[];
  @Input() standardConditions: string[] = [];
  columnDefs: any[] = [];

  gridOptions: GridOptions = {
    onCellClicked: (params: CellClickedEvent) => {
      if (!this.gridApi.getFocusedCell()) {
        return;
      }
      if (
        params.colDef.field === 'action' &&
        params.event &&
        (params.event.target as HTMLElement).classList.contains('delete-button')
      ) {
        this.handleDeleteRow(params);
      } else {
        this.removePasteListener();
        this.addPasteListener();
      }
    },
    suppressClickEdit: true,
    onCellDoubleClicked: (params: CellDoubleClickedEvent) => {
      if (!this.gridApi.getFocusedCell()) {
        return;
      }
      params.api.startEditingCell({
        rowIndex: params.node.rowIndex!,
        colKey: params.column.getColId(),
      });
    },
    onCellValueChanged: event => this.onCellValueChanged(event),
    enableRangeSelection: true,
    onCellEditingStopped: () => this.removePasteListener(),
  };

  private gridApi: any;
  private gridColumnApi: any;

  @Output() updateRowDataEvent = new EventEmitter<any[]>();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['rowDataFromTable']) {
      this.rowData = this.rowDataFromTable;
    }
    if (
      (changes['fields'] && this.fields) ||
      (changes['standardConditions'] && this.standardConditions)
    ) {
      this.initializeGrid(this.fields || []);
    }
  }

  updateRowData() {
    this.updateRowDataEvent.emit(this.rowData);
  }

  handleTestData(data: any) {
    this.updateRowDataEvent.emit(data);
    this.rowData = data.value;
  }

  ngOnInit(): void {
    this.initializeGrid(this.fields);
    this.rowData = this.rowDataFromTable || [{}];
  }

  private isEmptyRow(row: any): boolean {
    if (!row) return true;
    const keys = Object.keys(row);
    if (keys.length === 0) return true;
    return keys.every(key => row[key] == null || row[key] === '');
  }

  onCellValueChanged(event: any): void {
    this.updateRowData();

    const changedNode = event.node;
    const isLastRow = changedNode.rowIndex === this.gridApi.getDisplayedRowCount() - 1;

    if (isLastRow) {
      let emptyRowCount = 0;
      this.gridApi.forEachNode((node: any) => {
        if (this.isEmptyRow(node.data)) {
          emptyRowCount++;
        }
      });

      if (emptyRowCount === 0) {
        this.gridApi.applyTransaction({ add: [{}] });
      }
    }
  }
  initializeGrid(fields: any[]): void {
    if (!fields) return;
    this.columnDefs = fields.map(field => {
      const colDef: any = {
        headerName: field.textToShow,
        field: field.name,
        sortable: true,
        filter: true,
        editable: true,
        cellDataType: field.cellDataType,
      };

      if (field.name === 'condition') {
        colDef.cellEditor = 'agSelectCellEditor';
        colDef.cellEditorParams = {
          values: this.standardConditions, 
        };
      }
      return colDef;
    });

    this.columnDefs.push({
      headerName: 'Acción',
      field: 'action',
      editable: false,
      sortable: false,
      filter: false,
      width: 90,
      cellRenderer: () => {
        return `<button class="delete-button" style="cursor: pointer; color: red;" label="Eliminar">
            <mat-icon svgIcon="delete">X</mat-icon>
            </button>`;
      },
    });
    const emptyRow: any = {};
    this.rowData = [emptyRow];
    this.updateRowData();
  }

  ngOnDestroy(): void {
    this.removePasteListener();
  }

  addPasteListener() {
    document.addEventListener('paste', this.handlePaste);
  }

  removePasteListener() {
    document.removeEventListener('paste', this.handlePaste);
  }

  handleDeleteRow(params: CellClickedEvent) {
    const rowToDelete = [params.node.data];
    this.gridApi.applyTransaction({ remove: rowToDelete });

    setTimeout(() => {
      let emptyRowCount = 0;
      this.gridApi.forEachNode((node: any) => {
        if (this.isEmptyRow(node.data)) {
          emptyRowCount++;
        }
      });

      if (emptyRowCount === 0) {
        this.gridApi.applyTransaction({ add: [{}] });
      }
    }, 0);
  }

  handlePaste = (event: ClipboardEvent): void => {
    event.preventDefault();
    this.gridApi.stopEditing();

    const clipboardData = event.clipboardData;
    if (!clipboardData) return;
    const pastedData = clipboardData.getData('Text');

    const focusedCell = this.gridApi.getFocusedCell();
    if (!focusedCell) return;

    const parsedRows = pastedData
      .trimEnd()
      .split('\n')
      .map((row: string) => row.split('\t').map((cell: string) => cell.replace(/\r/g, '')));

    if (parsedRows.length === 0) {
      return;
    }

    const isCleanMatrix = (() => {
      if (parsedRows.length <= 1) return false;
      const firstRowColCount = parsedRows[0].length;
      return parsedRows.every(row => row.length === firstRowColCount);
    })();

    let finalRowsToPaste = parsedRows;

    if (isCleanMatrix) {
      const colCount = parsedRows[0].length;
      const colsToKeep: boolean[] = new Array(colCount).fill(false);
      parsedRows.forEach(row => {
        row.forEach((cell, colIndex) => {
          if (cell && cell.trim() !== '') {
            colsToKeep[colIndex] = true;
          }
        });
      });

      finalRowsToPaste = parsedRows.map(row => row.filter((_, colIndex) => colsToKeep[colIndex]));
    }
    let updatedRowData = [...this.rowData];

    const rows = finalRowsToPaste;
    const startRowIndex = focusedCell.rowIndex;
    const allDisplayedColumns = this.gridColumnApi.getAllDisplayedColumns();
    const startColumnIndex = allDisplayedColumns.indexOf(focusedCell.column);

    const createNewRow = () => {
      const newRow: any = {};
      return newRow;
    };

    rows.forEach((rowData: string[], rowIndexOffset: number) => {
      const targetRowIndex = startRowIndex + rowIndexOffset;

      while (targetRowIndex >= updatedRowData.length) {
        updatedRowData.push(createNewRow());
      }

      rowData.forEach((cellValue: string, colIndexOffset: number) => {
        const colIndex = startColumnIndex + colIndexOffset;
        if (colIndex < allDisplayedColumns.length) {
          const column = allDisplayedColumns[colIndex];
          if (updatedRowData[targetRowIndex]) {
            updatedRowData[targetRowIndex][column.getColId()] = cellValue;
          }
        }
      });
    });

    const finalData = updatedRowData.filter(row => !this.isEmptyRow(row));
    finalData.push({});

    this.rowData = finalData;
    this.gridApi.setRowData(this.rowData);

    this.updateRowData();
    event.preventDefault();
  };

  onGridReady(params: any): void {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
  }

  cleanTable() {
    this.initializeGrid(this.fields);
    this.updateRowData();
  }

  public stopEditing(): void {
    if (this.gridApi) {
      this.gridApi.stopEditing();
      this.updateRowData();
    }
  }
}