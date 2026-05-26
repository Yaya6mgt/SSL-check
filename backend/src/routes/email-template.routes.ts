import { Router } from 'express';
import { adminMiddleware } from '@/middleware/admin.middleware';
import { EmailTemplateService } from '@/services/email-template.service';

const router = Router();

router.get('/', adminMiddleware, async (_req, res) => {
  try {
    const settings = await EmailTemplateService.getCurrentSettings();
    res.json(settings);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erreur lors de la récupération du template.' });
  }
});

router.put('/', adminMiddleware, async (req, res) => {
  try {
    const settings = await EmailTemplateService.updateSettings(req.body);
    res.json(settings);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Erreur lors de la mise à jour du template.' });
  }
});

router.post('/preview', adminMiddleware, async (req, res) => {
  try {
    const html = await EmailTemplateService.renderPreviewHtml(req.body);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Erreur lors de la génération de la preview.' });
  }
});

export default router;