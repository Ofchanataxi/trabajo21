import { Model, ModelStatic, FindOptions } from 'sequelize';

export class GenericRepository<T extends object> {
    private model: ModelStatic<Model<T>>;

    constructor(model: ModelStatic<Model<T>>) {
        this.model = model;
    }

    async findAll(options?: FindOptions) {
        return this.model.findAll({
            ...options,
            attributes: options?.attributes || undefined,
            include: options?.include || []
        });
    }

    async findById(id: number, options?: FindOptions) {
        return this.model.findByPk(id, {
            ...options,
            include: options?.include || []
        });
    }

    async create(data: T) {
        return this.model.create(data as any);
    }

    async update(id: number, data: Partial<T>) {
        const record = await this.model.findByPk(id);
        if (record) {
            return record.update(data);
        }
        return null;
    }

    async delete(id: number) {
        const record = await this.model.findByPk(id);
        if (record) {
            return record.destroy();
        }
        return null;
    }

    private async buildNestedIncludes(
        models: ModelStatic<Model<any>>[],
        processedModels: Set<string>,
        depth: number = 0,
        maxDepth: number = 5
    ): Promise<any[]> {
        const includes: Array<{ model: ModelStatic<Model<any>>, include: any[] }> = [];


        if (depth >= maxDepth) {
            return includes;
        }

        for (const model of models) {
            let modelName = model.getTableName();

            if (typeof modelName !== 'string') {
                modelName = modelName.tableName;
            }

            if (processedModels.has(modelName)) {

                continue;
            }

            processedModels.add(modelName);

            const relatedAssociations = Object.values(model.associations).map(assoc => assoc.target);

            // Avoid duplicates in the same include array
            const nestedIncludes = [...new Set(relatedAssociations)].length
                ? await this.buildNestedIncludes([...new Set(relatedAssociations)], processedModels, depth + 1, maxDepth)
                : [];

            includes.push({
                model,
                include: nestedIncludes,
            });
        }

        return includes;
    }


    async findWithJoins(includeModels: ModelStatic<Model<any>>[], options?: FindOptions) {
        const processedModels = new Set<string>();
        processedModels.add(this.model.tableName);

        const include = await this.buildNestedIncludes(includeModels, processedModels);

        return this.model.findAll({

            include,
            ...options,
        });
    }
}