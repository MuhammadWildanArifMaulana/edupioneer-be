import { Response } from 'express';
import { AuthRequest } from '@middlewares/authMiddleware';
import * as MapelService from '@services/MapelService';
import { sendSuccess, sendError, sendPaginated } from '@utils/response';

export const getAll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const { data, total } = await MapelService.getAllMapel(page, limit);
    sendPaginated(res, data, total, page, limit, 'Mapel fetched successfully');
  } catch (error) {
    sendError(res, 'Failed to fetch mapel', 500, error);
  }
};

export const getById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const mapel = await MapelService.getMapelById(id);
    sendSuccess(res, mapel, 'Mapel fetched successfully');
  } catch (error) {
    sendError(res, 'Mapel not found', 404, error);
  }
};

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { nama } = req.body;

    if (!nama) {
      sendError(res, 'Nama is required', 400);
      return;
    }

    const mapel = await MapelService.createMapel({ nama });
    sendSuccess(res, mapel, 'Mapel created successfully', 201);
  } catch (error) {
    sendError(res, 'Failed to create mapel', 400, error);
  }
};

export const update = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const mapel = await MapelService.updateMapel(id, req.body);
    sendSuccess(res, mapel, 'Mapel updated successfully');
  } catch (error) {
    sendError(res, 'Failed to update mapel', 400, error);
  }
};

export const delete_ = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await MapelService.deleteMapel(id);
    sendSuccess(res, null, 'Mapel deleted successfully');
  } catch (error) {
    sendError(res, 'Failed to delete mapel', 400, error);
  }
};
