import { Router } from 'express';
import { adminMiddleware } from '@/middleware/admin.middleware';
import { AlertThresholdService } from '@/services/alert-threshold.service';

const router = Router();

router.get('/', adminMiddleware, async (_req, res) => {
  try {
    const thresholds = await AlertThresholdService.getCurrentThresholds();
    res.json(thresholds);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erreur lors de la récupération des seuils.' });
  }
});

router.put('/', adminMiddleware, async (req, res) => {
  try {
    const thresholds = await AlertThresholdService.updateThresholds(req.body);
    res.json(thresholds);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Erreur lors de la mise à jour des seuils.' });
  }
});

export default router;