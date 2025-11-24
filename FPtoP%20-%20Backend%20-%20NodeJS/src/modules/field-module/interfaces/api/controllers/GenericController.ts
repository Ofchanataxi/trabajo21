import { Request, Response } from 'express';
import { GenericService } from '../../../application/services/GenericService';

export function createGenericController<T extends object>(service: GenericService<T>) {
    return {
        async getAll(req: Request, res: Response) {
            const data = await service.getAll();
            return res.json(data);
        },

        async getOne(req: Request, res: Response) {
            const id = +req.params.id;
            const data = await service.getOne(id);
            return res.json(data);
        },

        async create(req: Request, res: Response) {
            const data = await service.create(req.body);
            return res.json(data);
        },

        async update(req: Request, res: Response) {
            const id = +req.params.id;
            const data = await service.update(id, req.body);
            return res.json(data);
        },

        async delete(req: Request, res: Response) {
            const id = +req.params.id;
            const data = await service.delete(id);
            return res.json(data);
        },
        async getWithJoins(req: Request, res: Response) {
            const { includeModels } = req.body;  // Models to join
            const data = await service.getWithJoins(includeModels);
            return res.json(data);
        }
    };
}
