import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import * as orderController from '../controllers/orderController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

router.get('/', orderController.list);
router.get('/metrics', orderController.metrics);
router.get('/:id', param('id').notEmpty(), validate, orderController.getById);
router.post(
  '/',
  [body('items').isArray(), body('total').isFloat({ min: 0 })],
  validate,
  orderController.create
);
router.patch(
  '/:id/status',
  requireAdmin,
  [param('id').notEmpty(), body('status').isIn(['pendiente', 'completada', 'cancelada', 'expirada'])],
  validate,
  orderController.updateStatus
);

export default router;
