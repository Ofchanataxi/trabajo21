import { group } from 'console';
import { Request, Response, NextFunction } from 'express';

export class ApprovalInformation {
  public async pendingApprovals(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    let pendingWells: { [key: string]: any }[] = [
      {
        id: 1,
        name: 'ACAK 119 WO 01/ TUSCANY 111',
        madeBy: 'Oscar Loor',
        dateSent: '2024-08-19T21:59:28.741Z',
        other: 'ALS',
      },
      {
        id: 2,
        name: 'YCAC 024 WO 05/ ORIENDRILL 903',
        madeBy: 'Oscar Loor',
        dateSent: '2024-08-19T21:59:28.741Z',
        other: 'ALS',
      },
    ];
    res.status(200).json(pendingWells);
  }

  public async rejectApprovals(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    let rejectWells: { [key: string]: any }[] = [
      {
        id: 1,
        name: 'ACAK 119 WO 01/ TUSCANY 111',
        rejectSent: '2024-08-19T21:59:28.741Z',
      },
      {
        id: 2,
        name: 'YCAC 024 WO 05/ ORIENDRILL 903',
        rejectSent: '2024-08-19T21:59:28.741Z',
      },
    ];
    res.status(200).json(rejectWells);
  }

  public async acceptApprovals(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    let approvedWells: { [key: string]: any }[] = [
      {
        id: 1,
        name: 'ACAK 119 WO 01/ TUSCANY 111',
        sent: '2024-08-19T21:59:28.741Z',
      },
      {
        id: 2,
        name: 'YCAC 024 WO 05/ ORIENDRILL 903',
        sent: '2024-08-19T21:59:28.741Z',
      },
    ];
    res.status(200).json(approvedWells);
  }

  public async pendingWellInformation(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    let findWell = req.query.wellId;

    let pdfFileExample = await this.fileToJson(
      new File(
        [
          new Blob(['Este es el contenido del archivo.'], {
            type: 'application/pdf',
          }),
        ],
        'file.pdf',
        {
          type: 'application/pdf',
          lastModified: new Date().getTime(),
        },
      ),
    );
    let excelFileExample = await this.fileToJson(
      new File(
        [
          new Blob(['Este es el contenido del archivo.'], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          }),
        ],
        'archivo excel.xslx',
        {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          lastModified: new Date().getTime(),
        },
      ),
    );
    let availableFilesName = 'Documentos de soporte';
    let pendingWellsInformation: { [key: string]: any }[] = [
      {
        wellId: 1,
        availableFilesName: availableFilesName,
        availableFiles: [
          {
            id: 1,
            groupName: 'Tallysheet',
            files: [excelFileExample],
            required: true,
          },
          {
            id: 2,
            groupName: 'Guia',
            files: [pdfFileExample],
            required: true,
          },
        ],
        elements: [
          {
            id: 1,
            description:
              'MOTOR: RA-S-RLOY-AS-AFL-HL-GRB-MAX 240 HP / 1993 V / 78.6 ASN: 100297337-SN36 (REPARADO)',
            quantity: 1,
            supportDocuments: [
              {
                groupName: 'Documentos de soporte',
                files: [pdfFileExample],
              },
            ],
          },
          {
            id: 2,
            description:
              'PROTECTOR: BPBSL-UT-RLOY-AFL-MAX-INC 718-ARZ-TT-HD-ADVANCED-NTB/RTB SN: 104597517-SN49 (NUEVO)',
            quantity: 1,
            supportDocuments: [
              {
                groupName: 'Documentos de soporte',
                files: [pdfFileExample],
              },
            ],
          },
          {
            id: 3,
            description:
              'PROTECTOR: LSBSB-LT-RLOY-AFL-MAX-INC 718-ARZ-TT-HD-NTB/RTB SN: 3CN0A80680-SN204 (REPARADO)',
            quantity: 1,
            supportDocuments: [
              {
                groupName: 'Documentos de soporte',
                files: [pdfFileExample],
              },
            ],
          },
          {
            id: 4,
            description:
              'PUMP: RCXLF CR-CT-RLOY BTHD-INC718- AFLAS-ARZ-TT-MOD CR-FACT SHIM / 100 STG SN: 103339600-SN633 (REPARADO)',
            quantity: 1,
            supportDocuments: [
              {
                groupName: 'Documentos de soporte',
                files: [pdfFileExample],
              },
            ],
          },
          {
            id: 5,
            description:
              'PUMP: RCXLF CR-CT-RLOY BTHD-INC718- AFLAS-ARZ-TT-MOD CR-FACT SHIM / 100 STG SN: 103339600-SN634 (REPARADO)',
            quantity: 1,
            supportDocuments: [
              {
                groupName: 'Documentos de soporte',
                files: [pdfFileExample],
              },
            ],
          },
          {
            id: 6,
            description:
              'PUMP: RCXLF CR-CT-RLOY BTHD-INC718- AFLAS-ARZ-TT-MOD CR-FACT SHIM / 100 STG SN: 2FS7H8207146 (REPARADO)',
            quantity: 1,
            supportDocuments: [
              {
                groupName: 'Documentos de soporte',
                files: [pdfFileExample],
              },
            ],
          },
          {
            id: 7,
            description:
              'AGH RC D5-21 CR-CT-RLOY-BTHD-INC 718-ARZ-TT-FACT SHIM / 117 STG SN: 103389025-SN604 (NUEVO)',
            quantity: 1,
            supportDocuments: [
              {
                groupName: 'Documentos de soporte',
                files: [pdfFileExample],
              },
            ],
          },
          {
            id: 8,
            description:
              'VGSA D20-60 RLOY-INC-ES-TT-INC 718-EXTD HEAD-FACT SHIM SN: 101736912-SN419 (REPARADO)',
            quantity: 1,
            supportDocuments: [
              {
                groupName: 'Documentos de soporte',
                files: [pdfFileExample],
              },
            ],
          },
        ],
      },
      {
        wellId: 2,
        availableFilesName: availableFilesName,
        availableFiles: [
          {
            id: 1,
            groupName: 'Tallysheet',
            files: [excelFileExample],
            required: true,
          },
          {
            id: 2,
            groupName: 'Guia',
            files: [pdfFileExample],
            required: true,
          },
        ],
        elements: [
          {
            id: 1,
            description:
              'MOTOR: RA-S-RLOY-AS-AFL-HL-GRB-MAX 240 HP / 1993 V / 78.6 ASN: 100297337-SN36 (REPARADO)',
            quantity: 2,
            supportDocuments: [
              {
                groupName: 'Grupo 1',
                files: [pdfFileExample],
              },
              {
                groupName: 'Documentos de soporte',
                files: [pdfFileExample],
              },
            ],
          },
          {
            id: 2,
            description:
              'PROTECTOR: BPBSL-UT-RLOY-AFL-MAX-INC 718-ARZ-TT-HD-ADVANCED-NTB/RTB SN: 104597517-SN49 (NUEVO)',
            quantity: 1,
            supportDocuments: [
              {
                groupName: 'Documentos de soporte',
                files: [pdfFileExample],
              },
            ],
          },
          {
            id: 3,
            description:
              'PROTECTOR: LSBSB-LT-RLOY-AFL-MAX-INC 718-ARZ-TT-HD-NTB/RTB SN: 3CN0A80680-SN204 (REPARADO)',
            quantity: 1,
            supportDocuments: [
              {
                groupName: 'Documentos de soporte',
                files: [pdfFileExample],
              },
            ],
          },
          {
            id: 4,
            description:
              'PUMP: RCXLF CR-CT-RLOY BTHD-INC718- AFLAS-ARZ-TT-MOD CR-FACT SHIM / 100 STG SN: 103339600-SN633 (REPARADO)',
            quantity: 1,
            supportDocuments: [
              {
                groupName: 'Documentos de soporte',
                files: [pdfFileExample],
              },
            ],
          },
          {
            id: 5,
            description:
              'PUMP: RCXLF CR-CT-RLOY BTHD-INC718- AFLAS-ARZ-TT-MOD CR-FACT SHIM / 100 STG SN: 103339600-SN634 (REPARADO)',
            quantity: 1,
            supportDocuments: [
              {
                groupName: 'Documentos de soporte',
                files: [pdfFileExample],
              },
            ],
          },
          {
            id: 6,
            description:
              'PUMP: RCXLF CR-CT-RLOY BTHD-INC718- AFLAS-ARZ-TT-MOD CR-FACT SHIM / 100 STG SN: 2FS7H8207146 (REPARADO)',
            quantity: 1,
            supportDocuments: [
              {
                groupName: 'Documentos de soporte',
                files: [pdfFileExample],
              },
            ],
          },
          {
            id: 7,
            description:
              'AGH RC D5-21 CR-CT-RLOY-BTHD-INC 718-ARZ-TT-FACT SHIM / 117 STG SN: 103389025-SN604 (NUEVO)',
            quantity: 1,
            supportDocuments: [
              {
                groupName: 'Documentos de soporte',
                files: [pdfFileExample],
              },
            ],
          },
          {
            id: 8,
            description:
              'VGSA D20-60 RLOY-INC-ES-TT-INC 718-EXTD HEAD-FACT SHIM SN: 101736912-SN419 (REPARADO)',
            quantity: 1,
            supportDocuments: [
              {
                groupName: 'Documentos de soporte',
                files: [pdfFileExample],
              },
            ],
          },
        ],
      },
    ];

    let pendingWellInformation = pendingWellsInformation.find(
      well => well.wellId.toString() === findWell,
    );

    res.status(200).json(pendingWellInformation);
  }

  public async rejectWellInformation(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    let { wellId } = req.query;
    let { wellInformation } = req.body;
    res.status(200).json(`Información de pozo ${wellId} rechazada`);
  }

  public async approveWellInformation(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    let { wellId } = req.query;
    let { wellInformation } = req.body;
    res.status(200).json(`Información de pozo ${wellId} aprobado`);
  }

  public async fileToJson(file: File) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return {
      name: file.name,
      size: file.size,
      buffer: buffer.toString('base64'),
      extension: file.type,
    };
  }

  //Post para 'cambiar o actualizar' el estado de un Elemento en la tabla ReleaseStateHistory.
  // Validdado pasa a PEC 
  // No validado pasa a editing
  public async onChangeElementReleaseStatus( 
    req: Request,
    res: Response,
    next: NextFunction): Promise<void> {
      let { wellId } = req.query;
      let { wellInformation } = req.body;
      res.status(200).json(wellInformation);
    }
}



export default new ApprovalInformation();
