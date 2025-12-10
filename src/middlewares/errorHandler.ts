import { Request, Response, NextFunction } from 'express';
import { sendError } from '@utils/response';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  try {
    console.error('[ERROR] Caught exception:', {
      message: err.message,
      name: err.name,
      path: req.path,
      method: req.method,
    });

    // Avoid double-response if response already sent
    if (res.headersSent) {
      console.error('[ERROR] Headers already sent, cannot respond');
      return;
    }

    const statusCode = (err as any).statusCode || 500;
    const message = err.message || 'Internal Server Error';

    sendError(res, message, statusCode, err);
  } catch (handlerError) {
    console.error(
      '[FATAL] Error handler crashed:',
      handlerError instanceof Error ? handlerError.message : String(handlerError),
    );
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: 'Fatal error in error handler',
        statusCode: 500,
      });
    }
  }
};
