import { v4 as uuidv4 } from 'uuid';
import { orderRepository, inventoryRepository } from '../repositories/store.js';
import { ORDER_STATUS, ORDER_EXPIRY_MINUTES } from '../config/constants.js';

function isExpired(createdAt) {
  const created = new Date(createdAt).getTime();
  const now = Date.now();
  return now - created > ORDER_EXPIRY_MINUTES * 60 * 1000;
}

function expireOldOrders() {
  const all = orderRepository.getAll();
  all.forEach((o) => {
    if (o.status === ORDER_STATUS.PENDIENTE && isExpired(o.createdAt)) {
      orderRepository.update(o.id, { status: ORDER_STATUS.EXPIRADA, updatedAt: new Date().toISOString() });
    }
  });
}

export function list() {
  expireOldOrders();
  return orderRepository.getAll();
}

export function getById(id) {
  expireOldOrders();
  const order = orderRepository.findById(id);
  if (order && order.status === ORDER_STATUS.PENDIENTE && isExpired(order.createdAt)) {
    orderRepository.update(id, { status: ORDER_STATUS.EXPIRADA, updatedAt: new Date().toISOString() });
    return orderRepository.findById(id);
  }
  return order;
}

export function create(data, userId) {
  expireOldOrders();
  const order = {
    id: uuidv4(),
    userId,
    items: data.items || [],
    total: Number(data.total) || 0,
    status: ORDER_STATUS.PENDIENTE,
    expiresAt: new Date(Date.now() + ORDER_EXPIRY_MINUTES * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return orderRepository.create(order);
}

export function updateStatus(id, status) {
  const order = orderRepository.findById(id);
  if (!order) return null;
  if (order.status !== ORDER_STATUS.PENDIENTE) return order;
  return orderRepository.update(id, { status, updatedAt: new Date().toISOString() });
}

export function getMetrics() {
  expireOldOrders();
  const orders = orderRepository.getAll();
  const pendientes = orders.filter((o) => o.status === ORDER_STATUS.PENDIENTE).length;
  const completadas = orders.filter((o) => o.status === ORDER_STATUS.COMPLETADA).length;
  const expiradas = orders.filter((o) => o.status === ORDER_STATUS.EXPIRADA).length;
  const totalRevenue = orders.filter((o) => o.status === ORDER_STATUS.COMPLETADA).reduce((s, o) => s + (o.total || 0), 0);
  const inventory = inventoryRepository.getAll();
  const lowStock = inventory.filter((i) => i.minQuantity > 0 && i.quantity <= i.minQuantity).length;
  return {
    orders: { pendientes, completadas, expiradas, total: orders.length },
    totalRevenue,
    inventoryTotal: inventory.length,
    lowStockCount: lowStock,
  };
}
