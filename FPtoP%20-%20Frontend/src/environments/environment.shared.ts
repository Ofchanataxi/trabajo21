import { update } from 'cypress/types/lodash';
import { elementAt } from 'rxjs';

export const sharedEnvironment = {
  endpoints: {
    signing: {
      url: 'signs/sign-pdf-document',
      name: 'Generando firma',
    },

    checkSign: {
      url: 'api/check-signs',
      name: 'Validacion de firmas',
    },

    extractDataFromITP: {
      url: 'api/v1/extract-data',
      name: 'Extrayendo datos del ITP Firmado',
    },

    notifications: {
      release: {
        send: {
          url: 'api/notifications',
          name: 'Envio ',
        },
      },
    },
    logistic: {
      uploadWellData: {
        url: 'api/logistic/oilfieldOperations/uploadWellDataFromFile',
        name: 'Carga de informacion transformada en logistica',
      },
      uploadNewElement: {
        url: 'api/logistic/oilfieldOperations/newElement',
        name: 'Crear nuevo elemento',
      },
      postNewAttributeElement: {
        url: 'api/logistic/oilfieldOperations/newElment',
        name: 'Creacion de nuevo elemento para un atributo correspondiente en logistica',
      },
      postNewAttributeList: {
        url: 'api/logistic/oilfieldOperations/newAttribute',
        name: 'Creacion de nuevo atributo correspondiente en logistica',
      },
      postNewStandardElementError: {
        url: 'api/logistic/oilfieldOperations/newStandardElementError',
        name: 'Creacion de nuevo elemento erroneo ´Nuevo´ correspondiente en logistica',
      },
      postNewErrorExtensionDocuments: {
        url: 'api/logistic/oilfieldOperations/newErrorExtensionDocuments',
        name: 'Creacion de nuevas extensiones de documentos correspondiente en logistica',
      },
    },
    releaseManagement: {
      getMetaDataReleasesByState: {
        url: 'api/get-meta-data-releases-by-state',
        name: 'Obteneniendo despachos',
      },
      getMetaDataActiveWells: {
        url: 'api/get-meta-data-active-wells',
        name: 'Obteneniendo wells activos',
      },
      obtainReleaseData: {
        url: 'api/get-release-data',
        name: 'Obteniendo información del release',
      },
      obtainReleaseHistory: {
        url: 'api/get-release-history',
        name: 'Obteniendo información histórica del release',
      },
      getDocumentsOfRelease: {
        url: 'api/get-files-of-release',
        name: 'Obteniendo documentos del release',
      },
      getDocumentsOfReleaseToReturn: {
        url: 'api/get-files-of-release-to-return',
        name: 'Obteniendo documentos del release que retornan',
      },
      getDocumentsOfReleaseToDetained: {
        url: 'api/get-files-of-release-to-detained',
        name: 'Obteniendo documentos del release que retornan',
      },
      getReleases: {
        url: 'api/get-release',
        name: 'Obteniendo los releases',
      },
      getStandardCondition: {
        url: 'api/get-standard-condition',
        name: 'Obteniendo los standard conditions',
      },
    },
    CatalogManagement: {
      getStandardBusinessLine: {
        url: 'api/get-standard-business-line',
        name: 'Obteniendo los Business Lines',
      },
      getStandardElements: {
        url: 'api/get-standard-elements',
        name: 'Obteniendo los elementos del catálogo',
      },
      getStandardWellSections: {
        url: 'api/get-standard-well-sections',
        name: 'Obteniendo los standard well sections',
      },
      getStandardWellInfrastructureType: {
        url: 'api/get-standard-well-infrastructure-type',
        name: 'Obteniendo los tipos de infraestructura del catálogo',
      },
      addStandardElement: {
        url: 'api/add-standard-element',
        name: 'Agregar un nuevo elemento al catálogo',
      },
      getStandardAttributeTypes: {
        url: 'api/get-standard-attribute-types',
        name: 'Obteniendo los tipos de atributos del catálogo',
      },
      editStandardAttributes: {
        url: 'api/edit-standard-attributes',
        name: 'editar el standard element',
      },
      deleteAttributeOption: {
        url: 'api/delete-attribute-option',
        name: 'Delete Attribute Option',
      },
      updateAttributeOption: {
        url: 'api/update-attribute-option',
        name: 'Update Attribute Option',
      },
      deleteAttribute: {
        url: 'api/delete-attribute',
        name: 'Delete Attribute',
      },
      updateAttribute: {
        url: 'api/update-attribute',
        name: 'Update Attribute',
      },
      deleteStandardElement: {
        url: 'api/delete-standard-element',
        name: 'Eliminar un elemento del catálogo',
      },
      addStandardElementsSynonyms: {
        url: 'api/add-standard-elements-Synonyms',
        name: 'Agregar un nuevo sinonimo al elemento del catálogo',
      },
      getStandardElementsById: {
        url: 'api/get-standard-elements-by-id',
        name: 'Obteniendo un elemento del catálogo por ID',
      },
      updateStandardElement: {
        url: 'api/update-standard-element',
        name: 'Actualizar un elemento del catálogo',
      },
      updateExtensionDocuments: {
        url: 'api/update-extension-documents',
        name: 'Actualizar extensiones de documentos',
      },
      deleteExtensionDocuments: {
        url: 'api/delete-extension-documents',
        name: 'Eliminar extensiones de documentos',
      },
      editStandarElementsSynonyms: {
        url: 'api/synonyms',
        name: 'Editar un sinonimo del elemento del catálogo',
      },
      deleteStandarElementsSynonyms: {
        url: 'api/synonyms',
        name: 'Eliminar un sinonimo del elemento del catálogo',
      },
      getSynonymsForElement: {
        url: 'api/standard-elements',
        name: 'Obtener sinónimos de un elemento del catálogo',
      },
      addOrUpdateStandardElementImage: {
        url: 'api/standard-element-image',
        name: 'Añadir o actualizar imagen de elemento',
      },
      deleteStandardElementImage: {
        url: 'api/standard-element-image',
        name: 'Eliminar imagen de elemento',
      },
    },

    segment: {
      draftReleases: {
        url: 'api/segment/oilFieldOperations/drafts',
        name: 'Borradores de Operaciones de pozo',
      },
      pendingReleases: {
        url: 'api/segment/oilFieldOperations/pending',
        name: 'Operaciones de pozo en revisión',
      },
      approvedReleases: {
        url: 'api/segment/oilFieldOperations/approved',
        name: 'Operaciones de pozo aprobadas',
      },
      rejectedReleases: {
        url: 'api/segment/oilFieldOperations/rejected',
        name: 'Operaciones de pozo rechazadas',
      },
      elementsByRelease: {
        url: 'api/wells/qaqc/elementReleases',
        name: 'Información de pendiente',
      },
    },
    qaqc: {
      pendingCheck: {
        url: 'api/wells/oilFieldOperations/',
        name: 'Pendientes por revisar',
        query: 2,
      },
      sendUploadedWellData: {
        url: 'api/wells/logistic/upload/',
        name: 'Envio de Informacion cargada en Logistica',
      },
      elementsByRelease: {
        url: 'api/wells/qaqc/elementReleases',
        name: 'Información de pendiente',
      },
      releaseStateHistory: {
        url: 'api/wells/qaqc/ReleaseStateHistory',
        name: 'Consultar Estado de Release',
      },
      rejectedRelases: {
        url: 'api/wells/qaqc/oilfieldOperations/rejected',
        name: 'Releases Rechazados por QAQC',
      },
      approvedRelases: {
        url: 'api/wells/qaqc/oilfieldOperations/approved',
        name: 'Releases Aceptados por QAQC',
      },
    },
    wellhead: {
      postWellheadPacking: {
        url: 'api/standardWellheadVerification',
        name: 'Verificacion de posibilidad de anexar los elementos de Cabezales',
      },
    },
    pec: {
      pendingCheck: {
        url: 'api/wells/oilFieldOperations/',
        name: 'Pendientes por revisar',
        query: 3,
      },
      elementsByRelease: {
        url: 'api/wells/qaqc/elementReleases',
        name: 'Información de pendiente',
      },
    },
    createNewRelease: {
      url: 'api/save-oilfieldOperationRelease',
      name: 'Creando una nueva liberación en la actividad seleccionada',
    },
    login: {
      url: 'auth/signin',
      name: 'Login',
    },
    acquireToken: {
      url: 'auth/acquireToken',
      name: 'Adquirir Token',
    },
    status: {
      url: 'auth/status',
      name: 'Estado',
    },
    logout: {
      url: 'auth/signout',
      name: 'Cerrar sesión',
    },
    getAllWells: {
      url: 'api/wells',
      name: 'Pozos',
    },
    getElementsInfo: {
      url: 'api/business-lines/1/elements',
      name: 'Elementos de business lines',
    },
    getElementAttributes: {
      url: 'api/elements/',
      name: 'Elementos',
    },

    getExtensionDocuments: {
      url: 'api/extensionDocuments',
      name: 'Extension de Documentos',
    },
    uploadZip: {
      url: 'api/upload-zip',
      name: 'Subir zip',
    },
    obtainFile: {
      url: 'api/file-upload/obtain-file',
      name: 'Obteniendo archivo',
    },
    uploadDocuments: {
      url: 'files/upload',
      name: 'Subir archivos',
    },
    fileUploadToRelease: {
      url: 'api/file-upload/release',
      name: 'Subiendo archivos de soporte del despacho',
    },
    fileReloadToRelease: {
      url: 'api/file-upload/reload-release',
      name: 'Recargando archivos de soporte del despacho',
    },
    fileUploaToElementdRelease: {
      url: 'api/file-upload/elementRelease',
      name: 'Subiendo archivos de soporte del elemento del despacho',
    },
    standardVerification: {
      url: 'api/standardVerification',
      name: 'Verificación de estandarización',
    },
    getDocumentsofElement: {
      url: 'api/get-documents-of-element',
      name: 'Obteniendo documentos necesarios del elemento',
    },
    obtainSheets: {
      url: 'api/file-upload/obtain-sheets',
      name: 'Obteniendo pestañas del archivo',
    },
    obtainElementsOfSheet: {
      url: 'api/file-upload/obtain-elements-of-sheet',
      name: 'Obteniendo elementos de la pestaña',
    },
    updateReleaseStateService: {
      url: 'api/update-release-state',
      name: 'Actualizando estado del despacho',
    },
    obtainElementsOfRelease: {
      url: 'api/elements-of-release',
      name: 'Obteniendo elementos del despacho',
    },
    checkUrlWellId: {
      url: '',
      name: '',
    },
    getPendingWells: {
      url: 'api/wells/pending-approve/all',
      name: 'Información pendiente',
    },
    getApprovedWells: {
      url: 'api/wells/accepted-approve/all',
      name: 'Información pendiente',
    },
    getRejectedWells: {
      url: 'api/wells/rejected-approve/all',
      name: 'Información pendiente',
    },
    getPendingWellInformation: {
      url: 'api/wells/pending-approve/',
      name: 'Obtener informacion',
    },
    getRequieredExtensionDocuments: {
      url: 'api/getExtensionDocuments',
      name: 'Mostrar extensiones de documentos requeridas existentes',
    },
    deleteReleaseData: {
      url: 'api/delete-release-data',
      name: 'Eliminar data de release',
    },

    /////////////////////////field module FE
    getFieldWellInformation: {
      url: 'field/infoData',
      name: 'Informacion de pozo',
    },
    getFieldWellElements: {
      url: 'field/well-elements',
      name: 'Elementos del pozo',
    },
    getTallyElements: {
      url: 'field/tally-elements',
      name: 'Elementos del pozo',
    },

    updateRows: {
      url: 'field/update',
      name: 'Actualizar registros',
    },
    uploadFileOpenwells: {
      url: 'field-upload-xml',
      name: 'Cargar archivo openwells',
    },
    /////////////////////////field module end FE
    //*                     Begin module RUN BES
    getDataOperationDetails: {
      url: 'run-bes/operation-details',
      name: 'Run Bes Detalle Operaciones',
    },
    getMechanicalDetails: {
      url: 'run-bes/mechanical-details',
      name: 'Run Bes Detalles Mecanicos',
    },
    getUndergroundEquipmentDetails: {
      url: 'run-bes/undergroundEquip-details',
      name: 'Run Bes Detalles de Equipo de Subsuelo',
    },
    getDiameterCamisaCirculacion: {
      url: 'run-bes/diameters-camisaCircul',
      name: 'Diameters Camisa de Circulacion',
    },
    getDiameterFlowCoupling: {
      url: 'run-bes/diameters-flowCoupling',
      name: 'Diameters Camisa de Flow Coupling',
    },
    getDiameterNoGo: {
      url: 'run-bes/diameters-noGo',
      name: 'Diameters Camisa de No-Go',
    },
    getYToolDetails: {
      url: 'run-bes/undergroundEquip-YToolDetails',
      name: 'Run Bes Detalles de Equipo de Subsuelo Y-Tool',
    },
    getInfoCableProtectors: {
      url: 'run-bes/cable-protectors',
      name: 'Run Bes Protectores de Cable',
    },
    getInfoProtectolizers: {
      url: 'run-bes/protectolizers',
      name: 'Run Bes Protectolizers',
    },
    getInfoBandas: {
      url: 'run-bes/bandas',
      name: 'Run Bes Bandas',
    },
    getInfoLowProfile: {
      url: 'run-bes/low-profile',
      name: 'Run Bes Low-profile',
    },
    getAnyReleaseALSvalidation: {
      url: 'run-bes/anyReleaseALSvalidation',
      name: 'Run Bes Liberacion',
    },
    getDownholeHeaders: {
      url: 'run-bes/downhole-headers',
      name: 'Run Bes Downhole Headers',
    },
    getInformationDownhole: {
      url: 'run-bes/information-downhole',
      name: 'Run Bes Downhole information',
    },
    getInformationDownholeCabezaDescarga: {
      url: 'run-bes/information-downhole-cabezaDescarga',
      name: 'Run Bes Downhole information of cabezaDescarga',
    },
    getInformationDownholeBomb: {
      url: 'run-bes/information-downhole-bombs',
      name: 'Run Bes Downhole information of Bomb',
    },
    getInformationDownholeIntkSepGas: {
      url: 'run-bes/information-downhole-IntkSepGas',
      name: 'Run Bes Downhole information of IntkSepGas',
    },
    getInformationDownholeProtectors: {
      url: 'run-bes/information-downhole-protectors',
      name: 'Run Bes Downhole information of protectors',
    },
    getInformationDownholeMotors: {
      url: 'run-bes/information-downhole-motors',
      name: 'Run Bes Downhole information of motors',
    },
    getInformationDownholeSensors: {
      url: 'run-bes/information-downhole-sensors',
      name: 'Run Bes Downhole information of sensors',
    },
    getInformationDownholeTransferline: {
      url: 'run-bes/information-downhole-transferline',
      name: 'Run Bes Downhole information of transferline',
    },
    getInformationDownholeCable: {
      url: 'run-bes/information-downhole-cable',
      name: 'Run Bes Downhole information of cable',
    },
    getInformationDownholePenetrador: {
      url: 'run-bes/information-downhole-penetrador',
      name: 'Run Bes Downhole information of penetrador',
    },
    createRunBesData: {
      url: 'run-bes/createRunBesData',
      name: 'Run Bes insercion de informacion',
    },
    getRunBesData: {
      url: 'run-bes/information-data-run-bes',
      name: 'Run Bes insercion de informacion',
    },
    getRigTimeData: {
      url: 'run-bes/information-data-rig-time',
      name: 'Run Bes insercion de informacion',
    },
    getSignFlow: {
      url: 'run-bes/get-permissions-signature',
      name: 'Run Bes get-permissions-signature',
    },
    updateSignFlow: {
      url: 'run-bes/sign-report',
      name: 'Run Bes sign-report',
    },
    getLastRunBesState: {
      url: 'run-bes/getLastRunBesState',
      name: 'Run Bes get-Last-RunBes-State',
    },
    createRunBesStateHistory: {
      url: 'run-bes/createRunBesStateHistory',
      name: 'Run Bes create-RunBes-State-History',
    },
    getFileRunBesOperation: {
      url: 'run-bes/getFilesOfOilFieldOperations',
      name: 'Run Bes getFilesOfOilFieldOperations',
    },
    getStandardElementsGroups: {
      url: 'run-bes/getStandardElementGroups',
      name: 'Run Bes getStandardElementGroups',
    },
    insertRunBesElementDetail: {
      url: 'run-bes/insertRunBesElementDetail',
      name: 'Run Bes insertRunBesElementDetail',
    },
    getRunBesElementDetail: {
      url: 'run-bes/getRunBesElementDetailTemporals',
      name: 'Run Bes getRunBesElementDetailTemporals',
    },
    downloadRunBesXslRepot: {
      url: 'run-bes/runBesXslRepot',
      name: 'Run Bes runBesXslRepot',
    },
    getFileRunBesReport: {
      url: 'run-bes/getFileOfReportRunBes',
      name: 'Run Bes getFileOfReportRunBes',
    },
    //*                     End module RUN BES
    businessLine: {
      getAll: {
        url: 'api/business-line/get-all/',
        name: 'Obtener información de todos los business line',
      },
      updateBusinessLine: {
        url: 'api/business-line/update/',
        name: 'Actualizar business line del usuario',
      },
    },
    rolesBusinessLine: {
      getAll: {
        url: 'api/roles-business-line/get-all/',
        name: 'Obtener información de todos los roles de business line',
      },
    },
    userManagement: {
      create: {
        url: 'auth/user-management/create/',
        name: 'Guardar informacion del usuario',
      },
      getByID: {
        url: 'auth/user-management/getByID/',
        name: 'Obtener informacion del usuario',
      },
      getCurrentUserSession: {
        url: 'auth/user-management/getCurrentUserSession/',
        name: 'Obtener informacion de la sesion del usuario',
      },
    },
    fileManagement: {
      verifySign: {
        url: 'signs/verify-sign',
        name: 'Guardar informacion del usuario',
      },
      dropFileOfRelease: {
        url: 'api/file-upload/delete-file-of-release',
        name: 'Borrar archivo del release',
      },
      dropFileOfElementRelease: {
        url: 'api/file-upload/delete-file-of-element-release',
        name: 'Borrar archivo de elemento del release',
      },
      fileUploadToOilfieldOperation: {
        url: 'api/file-upload/oilfieldOperation',
        name: 'Subiendo archivos al pozo actividad',
      },
      dropFileOfOilfieldOperation: {
        url: 'api/file-upload/delete-file-of-oilfield-operation',
        name: 'Borrar archivos del pozo actividad',
      },
    },
  },
  approvementWellsEndpoints: {
    acceptWellInformation: {
      url: 'api/wells/approve/',
      name: 'Aprobar información',
    },
    rejectWellInformation: {
      url: 'api/wells/reject/',
      name: 'Rechazar informacion',
    },
    //Para qaqc

    //endpoint para verificar el estado de en el segmento de qaqc
  },
  frontEndpoints: {
    releases: {
      draft: {
        url: 'releases/draft',
        name: 'En revisión segmento',
      },
      qaqcReview: {
        url: 'releases/qaqc-review',
        name: 'En revisión QAQC',
      },
      pecReview: {
        url: 'releases/pec-review',
        name: 'En revisión QAQC',
      },
      approved: {
        url: 'releases/approved',
        name: 'En revisión QAQC',
      },
      review: {
        url: 'releases/review',
        name: 'Revisión',
      },
      support: {
        url: 'releases/support',
        name: 'Soporte',
      },
      elements: {
        url: 'releases/elements',
        name: 'Elementos',
      },
      validateDescription: {
        url: 'releases/validate-description',
        name: 'Validación de descripción',
      },
    },
    segment: {
      approvedRelease: {
        url: 'oil-field-operations/elements-approved',
        name: 'Revisar Información de Release',
      },
      rejectedRelease: {
        url: 'oil-field-operations/elements-rejected',
        name: 'Revisar Información de Release',
      },
      draftsRelease: {
        url: 'oil-field-operations/update-information',
        name: 'Revisar Información de Release',
      },
      pendingRelease: {
        url: 'oil-field-operations/elements-pending',
        name: 'Revisar Información de Release',
      },
      checkRelease: {
        url: 'oil-field-operations/check-element',
        name: 'Revisar Información de Release',
      },
      checkHistory: {
        url: 'oil-field-operations/check-history',
        name: 'Revisar Historico de Release',
      },
    },
    field: {
      runBes: {
        url: 'releases/review',
        name: 'Revisión',
      },
      field: {
        url: 'app-field',
        name: 'Revisión',
      },
    },
    privacy: {
      url: 'privacy',
      name: 'Aviso de privacidad',
    },
  },

  query: {
    segment: {
      ids: {
        Logistic: 1,
        ALS: 2,
        Completion: 3,
        Cameron: 4,
        IWC: 5,
      },
    },
  },
};
