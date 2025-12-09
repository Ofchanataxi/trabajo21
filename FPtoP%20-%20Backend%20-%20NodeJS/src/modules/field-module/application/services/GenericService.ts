import { GenericRepository } from '../../domain/repositories/GenericRepository';
import { ModelStatic, Model } from 'sequelize';
import { createModel } from '../../infrastructure/database/models/dynamicModel';

export class GenericService<T extends object> {
    private repository: GenericRepository<T>;

    constructor(repository: GenericRepository<T>) {
        this.repository = repository;
    }

    async getAll() {
        return this.repository.findAll();
    }

    async getOne(id: number) {
        return this.repository.findById(id);
    }

    async create(data: T) {
        return this.repository.create(data);
    }

    async update(id: number, data: Partial<T>) {
        return this.repository.update(id, data);
    }

    async delete(id: number) {
        return this.repository.delete(id);
    }

    async getWithJoins(includeModels: ModelStatic<Model<any>>[]) {
        return this.repository.findWithJoins(includeModels);
    }

    async createDynamicRecord(data: Record<string, any>, fieldMapping: Record<string, any>) {
        const tableData: Record<string, any[]> = {};

        Object.entries(data).forEach(([field, value]) => {
            const { table, column } = fieldMapping[field];
            if (!tableData[table]) {
                tableData[table] = [];
            }
            tableData[table].push({ column, value });
        });

        for (const [tableName, columns] of Object.entries(tableData)) {
            //const tableModel = await createModel(tableName);
            ///const repository = new GenericRepository(tableModel);

            const tableModel = await createModel(tableName);
            const repository = new GenericRepository(tableModel.model);


            const recordData = columns.reduce((acc, { column, value }) => {
                acc[column] = value;
                return acc;
            }, {});

            await repository.create(recordData);
        }
    }
}
