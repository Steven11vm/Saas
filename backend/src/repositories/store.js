/**
 * Store en memoria para demo/portafolio.
 * Simula una base de datos; los datos se pierden al reiniciar el servidor.
 */

const users = new Map();
const inventory = new Map();
const orders = new Map();

export const userRepository = {
  findByEmail(email) {
    return Array.from(users.values()).find((u) => u.email === email) ?? null;
  },
  findById(id) {
    return users.get(id) ?? null;
  },
  create(user) {
    users.set(user.id, user);
    return user;
  },
  getAll() {
    return Array.from(users.values());
  },
  update(id, data) {
    const u = users.get(id);
    if (!u) return null;
    const updated = { ...u, ...data };
    users.set(id, updated);
    return updated;
  },
};

export const inventoryRepository = {
  create(item) {
    inventory.set(item.id, item);
    return item;
  },
  findById(id) {
    return inventory.get(id) ?? null;
  },
  getAll() {
    return Array.from(inventory.values());
  },
  update(id, data) {
    const i = inventory.get(id);
    if (!i) return null;
    const updated = { ...i, ...data };
    inventory.set(id, updated);
    return updated;
  },
  delete(id) {
    return inventory.delete(id);
  },
};

export const orderRepository = {
  create(order) {
    orders.set(order.id, order);
    return order;
  },
  findById(id) {
    return orders.get(id) ?? null;
  },
  getAll() {
    return Array.from(orders.values());
  },
  update(id, data) {
    const o = orders.get(id);
    if (!o) return null;
    const updated = { ...o, ...data };
    orders.set(id, updated);
    return updated;
  },
  delete(id) {
    return orders.delete(id);
  },
};
