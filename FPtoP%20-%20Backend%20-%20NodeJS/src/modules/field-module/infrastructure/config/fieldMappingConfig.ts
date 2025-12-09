export const fieldMapping = {
  encabezado: {
    lookup: {
      tableName: 'StandardOilfieldOperationsDataSection',
      key: 'nameOpenWells',
      valueKey: 'encabezado',
      returnKey: 'id',
    },
    equipo: {
      tableName: 'oilFieldOperationsData',
      column: 'value',
      lookup: {
        tableName: 'StandardOilfieldOperationsDataSectionElement',
        key: 'nameOpenWells',
        parentIdKey: 'idStandardOilfieldOperationsDataSection',
        parentIdSource: 'encabezado',
        returnKey: 'id',
      },
      children: {
        elevationGL: {
          tableName: 'tableD',
          type: 'property',
          propertyName: 'elevation',
          referenceTable: null,
          referenceProperty: null,
        },
      },
    },
  },
  datum: {
    tableName: 'tableC',
    type: 'object',
    propertyName: null,
    referenceTable: null,
    referenceProperty: null,
    children: {
      elevationGL: {
        tableName: 'tableD',
        type: 'property',
        propertyName: 'elevation',
        referenceTable: null,
        referenceProperty: null,
      },
    },
  },
};
