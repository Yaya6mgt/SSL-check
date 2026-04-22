import { Router } from 'express';
import { Domain } from '@/models/Domain';
import { SslCheck } from '@/models/SslCheck';
import { Server } from '@/models/Server';

const router = Router();

router.get('/', async (req, res) => {
    try {
        const domains = await Domain.findAll({
            include: [
                { model: Server },
                {
                    model: SslCheck,
                    limit: 1,
                    order: [['lastCheck', 'DESC']]
                }
            ]
        });
        res.json(domains);
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la récupération des domaines" });
    }
});

export default router;