import * as inventoryService from '../services/inventoryService.js';

export function list(req, res) {
  try {
    const items = inventoryService.list();
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: e.message || 'Error al listar inventario' });
  }
}

export function getById(req, res) {
  try {
    const item = inventoryService.getById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(item);
  } catch (e) {
    res.status(500).json({ error: e.message || 'Error' });
  }
}

export function create(req, res) {
  try {
    const data = { ...req.body, imageUrl: req.file ? `/uploads/${req.file.filename}` : null };
    const item = inventoryService.create(data);
    res.status(201).json(item);
  } catch (e) {
    res.status(500).json({ error: e.message || 'Error al crear producto' });
  }
}

export function update(req, res) {
  try {
    const data = { ...req.body };
    if (req.file) data.imageUrl = `/uploads/${req.file.filename}`;
    const item = inventoryService.update(req.params.id, data);
    if (!item) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(item);
  } catch (e) {
    res.status(500).json({ error: e.message || 'Error al actualizar' });
  }
}

export function remove(req, res) {
  try {
    const ok = inventoryService.remove(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Producto no encontrado' });
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: e.message || 'Error al eliminar' });
  }
}
