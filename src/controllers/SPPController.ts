import { Response } from 'express';
import { AuthRequest } from '@middlewares/authMiddleware';
import * as SPPService from '@services/SPPService';
import { sendSuccess, sendError, sendPaginated } from '@utils/response';

export const getAll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const { data, total } = await SPPService.getAllSPP(page, limit);
    sendPaginated(res, data, total, page, limit, 'SPP payments fetched successfully');
  } catch (error) {
    sendError(res, 'Failed to fetch SPP payments', 500, error);
  }
};

export const getById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const spp = await SPPService.getSPPById(id);
    sendSuccess(res, spp, 'SPP payment fetched successfully');
  } catch (error) {
    sendError(res, 'SPP payment not found', 404, error);
  }
};

export const getBySiswa = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const siswa_id = req.query.siswa_id as string | undefined;
    const tahun = req.query.tahun ? parseInt(req.query.tahun as string) : undefined;

    if (!siswa_id) {
      sendError(res, 'siswa_id query parameter is required', 400);
      return;
    }

    const spp = await SPPService.getSPPBySiswa(siswa_id, tahun);
    sendSuccess(res, spp, 'Siswa SPP payments fetched successfully');
  } catch (error) {
    sendError(res, 'Failed to fetch siswa SPP payments', 500, error);
  }
};

export const pay = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { siswa_id, bulan, tahun, jumlah, metode_pembayaran } = req.body;

    if (!siswa_id || !bulan || !tahun || !jumlah || !metode_pembayaran) {
      sendError(res, 'Missing required fields', 400);
      return;
    }

    const payment = await SPPService.createPaymentSPP({
      siswa_id,
      bulan,
      tahun,
      jumlah,
      metode_pembayaran,
    });
    sendSuccess(res, payment, 'SPP payment created successfully', 201);
  } catch (error) {
    sendError(res, 'Failed to create SPP payment', 400, error);
  }
};

export const updateStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      sendError(res, 'Status is required', 400);
      return;
    }

    const payment = await SPPService.updateSPPStatus(id, status);
    sendSuccess(res, payment, 'SPP payment status updated successfully');
  } catch (error) {
    sendError(res, 'Failed to update SPP payment status', 400, error);
  }
};
