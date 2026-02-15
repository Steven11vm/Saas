import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import * as inventoryController from '../controllers/inventoryController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();
router.use(authenticate);

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

router.get('/', inventoryController.list);
router.get('/:id', param('id').notEmpty(), validate, inventoryController.getById);
router.post(
  '/',
  requireAdmin,
  upload.single('image'),
  [
    body('name').trim().notEmpty(),
    body('sku').optional().trim(),
    body('quantity').optional().isInt({ min: 0 }),
    body('minQuantity').optional().isInt({ min: 0 }),
    body('price').optional().isFloat({ min: 0 }),
    body('description').optional().trim(),
  ],
  validate,
  inventoryController.create
);
router.put(
  '/:id',
  requireAdmin,
  upload.single('image'),
  [
    param('id').notEmpty(),
    body('name').optional().trim().notEmpty(),
    body('quantity').optional().isInt({ min: 0 }),
    body('minQuantity').optional().isInt({ min: 0 }),
    body('price').optional().isFloat({ min: 0 }),
  ],
  validate,
  inventoryController.update
);
router.delete('/:id', requireAdmin, param('id').notEmpty(), validate, inventoryController.remove);

export default router;
