export type ColumnElement = {
  type:
    | 'text'
    | 'app-button'
    | 'app-button-red'
    | 'radio'
    | 'input'
    | 'checkbox'
    | ''
    | 'right'
    | 'acum';
  value?: string;
  label?: string;
  position?: 'left' | 'right';
  state?: '1' | '2' | '3' | '4';
  boolValue?: 'true' | 'false';
  functionName?: string;
  params?: any[];
  width?: string;
};

export type ColumnConfig = {
  [key: string]: {
    type: string;
    label?: string;
    name?: string;
    render?: ColumnElement[];
    filterable?: boolean;
    filterCondition?: (value: any) => boolean;
    width?: string;
    align?: string;
  };
};

export type TableStyleConfig = {
  headerBackgroundColor?: string;
  showTableTitle?: boolean;
  titleColor?: string;
  columnStyles?: { [columnKey: string]: { color?: string } };
  groupByColumn?: string;
  sortColumn?: string;
  enableDragAndDrop?: boolean;
  rowGroupId?: string; // lets group data by specific rows due to duplicated rows due to files and tallyElement
};

export type StepConfig = {
  [tableName: string]: {
    columns: ColumnConfig;
    styles?: TableStyleConfig;
  };
};

export type ColumnConfigs = {
  [step: string]: StepConfig;
};

export const columnConfigs: ColumnConfigs = {
  stepOne: {
    table1: {
      columns: {
        sandDisplayName: {
          type: '',
          name: ' ', //display name on the page
          width: '0%',
          align: 'left',
          render: [{ type: '', value: 'sandDisplayName', position: 'left' }],
          filterable: true,
        },
        type: {
          type: '',
          name: ' ', //display name on the page
          width: '0%',
          align: 'left',
          render: [{ type: '', value: 'type', position: 'left' }],
          filterable: true,
        },
        subtype: {
          type: '',
          name: ' ', //display name on the page
          width: '0%',
          align: 'left',
          render: [{ type: '', value: 'subtype', position: 'left' }],
          filterable: true,
        },
        state: {
          type: '',
          name: ' ',
          render: [{ type: '', value: 'state', position: 'left' }],
          filterCondition: value => value != 'deleted',
        },
        campo: {
          type: 'text',
          name: 'Campo', //display name on the page
          width: '30%',
          align: 'left',
          render: [{ type: 'text', value: 'campo', position: 'left' }],
          filterable: true,
        },

        valorhistoricoopenwells: {
          type: 'text',
          name: 'Valor Historico en Openwells',
          width: '10%',
          render: [{ type: 'text', value: 'valorhistoricoopenwells', position: 'left' }],
          filterable: true,
        },
        valorhistoricofp2p: {
          type: 'text',
          label: 'Si/No',
          width: '10%',
          name: 'Valor Historico en FP2P',
          render: [{ type: 'text', value: 'valorhistoricofp2p', position: 'left' }],
          filterable: true,
        },
        valorfinal: {
          type: 'input',
          name: 'Valor Final',
          width: '20%',
          render: [
            { type: 'input', value: 'Valor final', position: 'left' },
            { type: 'text', value: 'measurementUnit', position: 'left' },
          ],
          filterable: true,
        },
        acciones: {
          type: 'checkbox',
          label: 'Accion realizada',
          name: 'Acciones',
          width: '30%',
          render: [
            { type: 'checkbox', label: 'Accion realizada', value: 'acciones', position: 'left' },
          ],
        },
      },
      styles: {
        headerBackgroundColor: 'none',
        showTableTitle: true,
        groupByColumn: 'group<DELIM>type<DELIM>subtype<DELIM>perforation<DELIM>perforations',
        sortColumn: 'ElementTally.sequence_number',
        enableDragAndDrop: false,
      },
    },
  },
  stepTwo: {
    table1: {
      columns: {
        type: {
          type: '',
          name: ' ',
          width: '0%',
          align: 'left',
          render: [{ type: '', value: 'type', position: 'left' }],
          filterable: true,
        },
        documentos_concatenados: {
          type: '',
          name: ' ',
          width: '0%',
          align: 'left',
          render: [{ type: '', value: 'documentos_concatenados', position: 'left' }],
          filterable: true,
        },
        sandDisplayName: {
          type: '',
          name: ' ',
          width: '0%',
          align: 'left',
          render: [{ type: '', value: 'sandDisplayName', position: 'left' }],
          filterable: true,
        },
        descripcionconcat: {
          type: 'text',
          name: 'Descripcion',
          width: '50%',
          render: [{ type: 'text', value: 'descripcionconcat', position: 'left' }],
          filterable: true,
        },

        documentos: {
          type: 'text',
          width: '30%',
          render: [
            {
              type: 'text',
              value: 'documentos',
              position: 'left',
              boolValue: 'false',
              functionName: 'showFile',
              params: ['filepath', 'filename', 'fileid'],
            },
          ],
          filterable: true,
        },
        /*'ElementRelease.quantity': {
          type: 'input',
          name: 'Cantidad Enviada',
          render: [{ type: 'text', value: 'ElementRelease.quantity', position: 'left' }],
          filterable: true,
        },*/
        state: {
          type: '',
          name: ' ',
          render: [{ type: '', value: 'state', position: 'left' }],
          filterCondition: value => value != 'delete',
        },
        tallyGroupParent: {
          type: '',
          name: ' ',
          render: [{ type: '', value: 'tallyGroupParent', position: 'left' }],
          filterCondition: value => value === null,
        },

        /*'ElementRelease.approvalStatus': {
          type: 'button-group',
          label: 'Aceptar/Rechazar',
          name: 'Acciones',
          render: [
            { type: 'app-button', label: 'Aceptar', boolValue: 'true', functionName: 'trueFalseSetter', params: ['ElementRelease.approvalStatus'] },
            { type: 'app-button-red', label: 'Rechazar', position: 'right', boolValue: 'false', functionName: 'genericRequestPage.openOverlay' },
          ],
          filterCondition: (value) => value == null,
        },*/
        'ElementRelease.approvalStatus': {
          type: '',
          label: ' ',
          width: '15%',
          name: 'Acciones',
          render: [{ type: '', value: 'ElementRelease.approvalStatus', position: 'left' }],
          filterCondition: value => value == null,
        },
      },
      styles: {
        headerBackgroundColor: 'none',
        showTableTitle: true,
        groupByColumn: 'type',
        sortColumn: 'ElementTally.sequence_number',
        enableDragAndDrop: false,
      },
    },
  },
  stepThree: {
    table1: {
      columns: {
        type: {
          type: '',
          name: ' ',
          width: '0%',
          align: 'left',
          render: [{ type: '', value: 'type', position: 'left' }],
          filterable: true,
        },

        'ElementRelease.approvalStatus': {
          type: '',
          label: '',
          name: '',
          render: [
            {
              type: '',
              value: 'ElementRelease.approvalStatus',
              label: '<<',
              position: 'left',
              boolValue: 'false',
              functionName: 'trueFalseSetter',
              params: ['ElementRelease.approvalStatus'],
            },
          ],
          filterCondition: value => value == true,
        },
        descripcionconcat: {
          type: 'text',
          name: 'Descripcion',
          render: [{ type: 'text', value: 'descripcionconcat', position: 'left' }],
          filterable: true,
        },
        'ElementRelease.availablequantity': {
          type: '',
          label: '',
          name: '',
          render: [
            {
              type: '',
              width: '20%',
              value: 'Cantidad enviada',
              position: 'left',
              functionName: 'onInputChangetransferRow',
              params: ['Cantidad enviada'],
            },
            { type: '', value: 'ElementRelease.availablequantity', label: '/', position: 'left' },
            {
              type: '',
              label: '>>',
              functionName: 'transferRow',
              params: ['ElementTally.quantity', 'ElementRelease.availablequantity', 'groupid'],
            },
          ],
          filterCondition: value => value != 0,
        },
        tallyGroupParent: {
          type: '',
          name: ' ',
          render: [{ type: '', value: 'tallyGroupParent', position: 'left' }],
          filterable: true,
          filterCondition: value => value === null,
        },
        grouprownumberlefttablefilter: {
          type: '',
          name: ' ',
          render: [{ type: '', value: 'grouprownumberlefttablefilter', position: 'left' }],
          filterable: true,
          filterCondition: value => value === '1',
        },
      },
      styles: {
        showTableTitle: true,
        columnStyles: {
          //descripcion: { color: 'blue' },
        },
        groupByColumn: 'type',
        sortColumn: 'type',
        enableDragAndDrop: false,
      },
    },
    table2: {
      columns: {
        /* 'ElementTally.quantity': {
          type: 'button',
          label: '<<',
          name: 'Cantidad en pozo',
          render: [
            { type: 'app-button', label: '<<', functionName: 'transferRow', params: ['ElementRelease.availablequantity', 'ElementTally.quantity', 'groupid'] },
            { type: 'text', value: 'ElementTally.quantity', position: 'right' },
          ],
         filterCondition: (value) => value !== 0, */
        'ElementTally.quantity': {
          type: '',
          label: '',
          name: ' ',
          render: [{ type: '', value: 'ElementTally.quantity' }],
          filterCondition: value => value !== 0,
        },
        posicion: {
          type: 'text',
          name: 'Posicion',
          render: [{ type: 'text', value: 'posicion', position: 'left' }],
        },
        descripcionconcat: {
          type: 'text',
          name: 'Descripcion',
          render: [{ type: 'text', value: 'descripcionconcat', position: 'left' }],
          filterable: true,
        },
        'ElementTally.sequence_number': {
          type: '',
          name: ' ',
          render: [{ type: '', value: 'ElementTally.sequence_number', position: 'left' }],
        },
        grouprownumbertally: {
          type: '',
          name: ' ',
          render: [{ type: '', value: 'grouprownumbertally', position: 'left' }],
          filterCondition: value => value === '1',
        },
        tallyGroupParent: {
          type: '',
          name: ' ',
          render: [{ type: '', value: 'tallyGroupParent', position: 'left' }],
          filterable: true,
          filterCondition: value => value === null,
        },
      },

      styles: {
        showTableTitle: true,
        sortColumn: 'ElementTally.sequence_number',
        enableDragAndDrop: true,
        //rowGroupId:'newrowid',
      },
    },
  },
  stepFour: {
    table1: {
      columns: {
        sortOrder: {
          type: 'text',
          name: 'Numero',
          width: '5%',
          render: [{ type: 'text', width: '5%', value: 'sortOrder', position: 'left' }],
          filterable: true,
        },
        'ElementTally.quantity': {
          type: 'text',
          name: 'Cantidad',
          width: '5%',
          render: [{ type: 'text', width: '5%', value: 'ElementTally.quantity', position: 'left' }],
          filterCondition: value => value > 0,
          filterable: true,
        },
        descripcion: {
          type: 'text',
          name: 'Descripcion',
          width: '70%',
          render: [{ type: 'text', width: '70%', value: 'descripcionconcat', position: 'left' }],
          filterable: true,
        },
        type: {
          type: 'text',
          name: 'Tipo',
          render: [{ type: 'text', value: 'type', position: 'left' }],
          filterable: true,
        },
        showInTally: {
          type: 'text',
          name: 'showInTally',
          render: [{ type: 'text', value: 'showInTally', position: 'left' }],
          filterable: true,
        },
        'ElementTally.length': {
          type: 'input',
          name: 'Medida',
          render: [{ type: 'input', value: 'ElementTally.length', position: 'left' }],
          filterable: true,
        },
        tallyGroupParent: {
          type: '',
          name: ' ',
          render: [{ type: '', value: 'tallyGroupParent', position: 'left' }],
          filterCondition: value => value != null,
        },
        tallyGroup: {
          type: '',
          name: ' ',
          render: [{ type: '', value: 'tallyGroup', position: 'left' }],
          filterCondition: value => value != null,
        },
        grouprownumber: {
          type: '',
          name: ' ',
          render: [{ type: '', value: 'grouprownumber', position: 'left' }],
          filterCondition: value => value === '1',
        },
      },
      styles: {
        showTableTitle: false,
        sortColumn: 'ElementTally.sequence_number',
        enableDragAndDrop: false,
        rowGroupId: 'newrowid',
      },
    },
  },
  stepFive: {
    table1: {
      columns: {
        type: {
          type: '',
          name: ' ', //display name on the page
          width: '0%',
          align: 'left',
          render: [{ type: '', value: 'type', position: 'left' }],
          filterable: true,
        },
        'ElementTally.quantity': {
          type: 'text',
          name: 'Cantidad Recibida',
          render: [{ type: 'text', value: 'ElementTally.quantity', position: 'left' }],
          filterable: true,
          filterCondition: value => value !== 0,
        },

        descripcion: {
          type: 'text',
          name: 'Descripcion',
          width: '70%',
          render: [{ type: 'text', width: '70%', value: 'descripcionconcat', position: 'left' }],
          filterable: true,
        },
        medidatotal: {
          type: 'input',
          name: 'Medida',
          render: [{ type: 'text', value: 'medidatotal', position: 'left' }],
          filterable: true,
        },
        acumulado: {
          type: 'text',
          name: 'Acumulado',
          render: [{ type: 'text', value: 'acumulado', position: 'left' }],
          filterable: true,
        },
        /* medidatotal: {
          type: 'text',
          name: 'Acumulado',
          render: [{ type: 'acum', value: 'medidatotal', position: 'left' }],
          //filterable: true,
        },*/
        cumulativeCalcValue: {
          type: 'text',
          name: 'Acumulado',
          render: [{ type: 'text', value: 'cumulativeCalcValue', position: 'left' }],
          filterable: true,
        },

        tallyGroupParent: {
          type: '',
          name: ' ',
          render: [{ type: '', value: 'tallyGroupParent', position: 'left' }],
          filterCondition: value => value === null,
        },
        grouprownumber: {
          type: '',
          name: ' ',
          render: [{ type: '', value: 'grouprownumber', position: 'left' }],
          filterCondition: value => value === '1',
        },
      },
      styles: {
        showTableTitle: true,
        sortColumn: 'ElementTally.sequence_number',
        enableDragAndDrop: false,
      },
    },
    table2: {
      columns: {
        type: {
          type: '',
          name: ' ', //display name on the page
          width: '0%',
          align: 'left',
          render: [{ type: '', value: 'type', position: 'left' }],
          filterable: true,
        },
        documentos_concatenados: {
          type: '',
          name: ' ',
          width: '0%',
          align: 'left',
          render: [{ type: '', value: 'documentos_concatenados', position: 'left' }],
          filterable: true,
        },
        descripcion: {
          type: 'text',
          name: 'Descripcion',
          width: '70%',
          render: [{ type: 'text', width: '70%', value: 'descripcionconcat', position: 'left' }],
          filterable: true,
        },
        'ElementRelease.availablequantity': {
          type: 'text',
          name: 'Cantidad',
          render: [{ type: 'text', value: 'ElementRelease.availablequantity', position: 'left' }],
          filterable: true,
          filterCondition: value => value > 0,
        },
        documentos: {
          type: 'text',
          render: [
            {
              type: 'text',
              value: 'documentos',
              position: 'left',
              boolValue: 'false',
              functionName: 'showFile',
              params: ['filepath', 'filename', 'fileid'],
            },
          ],
          filterable: true,
        },
        tallyGroupParent: {
          type: '',
          name: ' ',
          render: [{ type: '', value: 'tallyGroupParent', position: 'left' }],
          filterCondition: value => value === null,
        },
        grouprownumberlefttablefilter: {
          type: '',
          name: ' ',
          render: [{ type: '', value: 'grouprownumberlefttablefilter', position: 'left' }],
          filterable: true,
          filterCondition: value => value === '1',
        },
      },
      styles: {
        showTableTitle: true,
        groupByColumn: 'type',
        sortColumn: 'ElementTally.sequence_number',
        enableDragAndDrop: false,
      },
    },
  },
  stepSix: {
    table1: {
      columns: {},
      styles: {
        enableDragAndDrop: false,
      },
    },
  },
  stepSeven: {
    table1: {
      columns: {},
      styles: {
        enableDragAndDrop: false,
      },
    },
  },
};
