type ParamType = string | number | string[] | number[]; 
// Define el tipo de una fila individual
type QueryResponse = {
  
  data: any[];
  totalRows: number;
};

export interface IDatabase {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  query(sql: string, params?: ParamType[]): Promise<QueryResponse>;
}
