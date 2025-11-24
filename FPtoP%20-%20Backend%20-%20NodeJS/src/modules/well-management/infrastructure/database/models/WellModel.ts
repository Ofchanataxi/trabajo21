// infrastructure/database/models/WellModel.ts
import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../sequelize';

class WellModel extends Model {
  public itemName!: string;
  public campo!: string;
  public product!: string;
  public status!: string;
  public x!: number;
  public y!: number;
  public plataforma!: string;
  public joblogStartDate!: Date;
  public engJoblogStartDate!: Date;
  public joblogEndDate!: Date;
  public engJoblogEndDate!: Date;
  public joblogType!: string;
  public joblogWoNumber!: number;
  public joblogActivity!: string;
  public joblogWoEquip!: string;
  public longWellName!: string;
  public minId!: string;
  public chActivity!: string;
  public chRig!: string;
  public joblogStartSuspen!: Date;
  public joblogEndSuspen!: Date;
  public commentsDrilling!: string;
  public joblogStartRigMov!: Date;
  public joblogEndRigMov!: Date;
  public nextWellMov!: string;
  public targetWellMov!: string;
  public rigStarttime!: Date;
  public rigEndtime!: Date;
  public rig!: string;
  public rigDestiny!: string;
  public rigActivity!: string;
  public rigObs!: string;
  public xDestiny!: number;
  public yDestiny!: number;
}

WellModel.init(
  {
    itemName: {
      type: DataTypes.STRING(200),
      allowNull: true,
      field: 'ITEM_NAME',
    },
    campo: { type: DataTypes.STRING(200), allowNull: true, field: 'CAMPO' },
    product: { type: DataTypes.STRING(200), allowNull: true, field: 'PRODUCT' },
    status: { type: DataTypes.STRING(200), allowNull: true, field: 'STATUS' },
    x: { type: DataTypes.FLOAT, allowNull: true, field: 'X' },
    y: { type: DataTypes.FLOAT, allowNull: true, field: 'Y' },
    plataforma: {
      type: DataTypes.STRING(200),
      allowNull: true,
      field: 'PLATAFORMA',
    },
    joblogStartDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'JOBLOG_START_DATE',
    },
    engJoblogStartDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'ENG_JOBLOG_START_DATE',
    },
    joblogEndDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'JOBLOG_END_DATE',
    },
    engJoblogEndDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'ENG_JOBLOG_END_DATE',
    },
    joblogType: {
      type: DataTypes.STRING(56),
      allowNull: true,
      field: 'JOBLOG_TYPE',
    },
    joblogWoNumber: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
      field: 'JOBLOG_WO_NUMBER',
    },
    joblogActivity: {
      type: DataTypes.STRING(300),
      allowNull: true,
      field: 'JOBLOG_ACTIVITY',
    },
    joblogWoEquip: {
      type: DataTypes.STRING(256),
      allowNull: true,
      field: 'JOBLOG_WO_EQUIP',
    },
    longWellName: {
      type: DataTypes.STRING(200),
      allowNull: true,
      field: 'LONG_WELL_NAME',
    },
    minId: { type: DataTypes.STRING(200), allowNull: true, field: 'MIN_ID' },
    chActivity: {
      type: DataTypes.STRING(56),
      allowNull: true,
      field: 'CH_ACTIVITY',
    },
    chRig: { type: DataTypes.STRING(56), allowNull: true, field: 'CH_RIG' },
    joblogStartSuspen: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'JOBLOG_START_SUSPEN',
    },
    joblogEndSuspen: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'JOBLOG_END_SUSPEN',
    },
    commentsDrilling: {
      type: DataTypes.STRING(1000),
      allowNull: true,
      field: 'COMMENTS_DRILLING',
    },
    joblogStartRigMov: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'JOBLOG_START_RIG_MOV',
    },
    joblogEndRigMov: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'JOBLOG_END_RIG_MOV',
    },
    nextWellMov: {
      type: DataTypes.STRING(56),
      allowNull: true,
      field: 'NEXT_WELL_MOV',
    },
    targetWellMov: {
      type: DataTypes.STRING(56),
      allowNull: true,
      field: 'TARGET_WELL_MOV',
    },
    rigStarttime: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'RIG_STARTTIME',
    },
    rigEndtime: { type: DataTypes.DATE, allowNull: true, field: 'RIG_ENDTIME' },
    rig: { type: DataTypes.STRING(256), allowNull: true, field: 'RIG' },
    rigDestiny: {
      type: DataTypes.STRING(256),
      allowNull: true,
      field: 'RIG_DESTINY',
    },
    rigActivity: {
      type: DataTypes.STRING(256),
      allowNull: true,
      field: 'RIG_ACTIVITY',
    },
    rigObs: { type: DataTypes.STRING(1000), allowNull: true, field: 'RIG_OBS' },
    xDestiny: { type: DataTypes.FLOAT, allowNull: true, field: 'X_DESTINY' },
    yDestiny: { type: DataTypes.FLOAT, allowNull: true, field: 'Y_DESTINY' },
  },
  {
    tableName: 'V_AIS_ARS_CC_LDC_BY_WELL',
    sequelize,
    timestamps: false,
  },
);
WellModel.removeAttribute('id');
export { WellModel };
