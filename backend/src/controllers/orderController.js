import * as orderService from '../services/orderService.js';

export function list(req, res) {
  try {
    const orders = orderService.list();
    res.json(orders);
  } catch (e) {
    res.status(500).json({ error: e.message || 'Error al listar órdenes' });
  }
}

export function getById(req, res) {
  try {
    const order = orderService.getById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Orden no encontrada' });
    res.json(order);
  } catch (e) {
    res.status(500).json({ error: e.message || 'Error' });
  }
}

export function create(req, res) {
  try {
    const order = orderService.create(req.body, req.user.id);
    res.status(201).json(order);
  } catch (e) {
    res.status(500).json({ error: e.message || 'Error al crear orden' });
  }
}

export function updateStatus(req, res) {
  try {
    const { status } = req.body;
    const order = orderService.updateStatus(req.params.id, status);
    if (!order) return res.status(404).json({ error: 'Orden no encontrada' });
    res.json(order);
  } catch (e) {
    res.status(500).json({ error: e.message || 'Error al actualizar' });
  }
}

export function metrics(req, res) {
  try {
    const metrics = orderService.getMetrics();
    res.json(metrics);
  } catch (e) {
    res.status(500).json({ error: e.message || 'Error al obtener métricas' });
  }
}
