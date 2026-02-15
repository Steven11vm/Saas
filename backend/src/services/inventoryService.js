import { v4 as uuidv4 } from 'uuid';
import { inventoryRepository } from '../repositories/store.js';

export function list() {
  return inventoryRepository.getAll();
}

export function getById(id) {
  return inventoryRepository.findById(id);
}

export function create(data) {
  const item = {
    id: uuidv4(),
    name: data.name,
    sku: data.sku || `SKU-${Date.now()}`,
    quantity: Number(data.quantity) || 0,
    minQuantity: Number(data.minQuantity) || 0,
    price: Number(data.price) || 0,
    imageUrl: data.imageUrl || null,
    description: data.description || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return inventoryRepository.create(item);
}

export function update(id, data) {
  const item = inventoryRepository.findById(id);
  if (!item) return null;
  const updated = {
    ...item,
    ...data,
    updatedAt: new Date().toISOString(),
  };
  return inventoryRepository.update(id, updated);
}

export function remove(id) {
  return inventoryRepository.delete(id);
}
