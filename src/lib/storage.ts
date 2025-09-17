import { Supplier, Product, Order, QualityControl, Return } from '@/types';

const STORAGE_KEYS = {
  SUPPLIERS: 'fashion_suppliers',
  PRODUCTS: 'fashion_products',
  ORDERS: 'fashion_orders',
  QUALITY_CONTROLS: 'fashion_quality_controls',
  RETURNS: 'fashion_returns',
} as const;

class LocalStorage {
  private isClient = typeof window !== 'undefined';

  private get<T>(key: string): T[] {
    if (!this.isClient) return [];
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error reading from localStorage (${key}):`, error);
      return [];
    }
  }

  private set<T>(key: string, data: T[]): void {
    if (!this.isClient) return;
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error writing to localStorage (${key}):`, error);
    }
  }

  // Suppliers
  getSuppliers(): Supplier[] {
    return this.get<Supplier>(STORAGE_KEYS.SUPPLIERS).map(supplier => ({
      ...supplier,
      createdAt: new Date(supplier.createdAt),
      updatedAt: new Date(supplier.updatedAt)
    }));
  }

  saveSupplier(supplier: Supplier): void {
    const suppliers = this.getSuppliers();
    const existingIndex = suppliers.findIndex(s => s.id === supplier.id);

    if (existingIndex >= 0) {
      suppliers[existingIndex] = { ...supplier, updatedAt: new Date() };
    } else {
      suppliers.push(supplier);
    }

    this.set(STORAGE_KEYS.SUPPLIERS, suppliers);
  }

  deleteSupplier(id: string): void {
    const suppliers = this.getSuppliers().filter(s => s.id !== id);
    this.set(STORAGE_KEYS.SUPPLIERS, suppliers);
  }

  // Products
  getProducts(): Product[] {
    return this.get<Product>(STORAGE_KEYS.PRODUCTS).map(product => ({
      ...product,
      createdAt: new Date(product.createdAt),
      updatedAt: new Date(product.updatedAt)
    }));
  }

  saveProduct(product: Product): void {
    const products = this.getProducts();
    const existingIndex = products.findIndex(p => p.id === product.id);

    if (existingIndex >= 0) {
      products[existingIndex] = { ...product, updatedAt: new Date() };
    } else {
      products.push(product);
    }

    this.set(STORAGE_KEYS.PRODUCTS, products);
  }

  deleteProduct(id: string): void {
    const products = this.getProducts().filter(p => p.id !== id);
    this.set(STORAGE_KEYS.PRODUCTS, products);
  }

  // Orders
  getOrders(): Order[] {
    return this.get<Order>(STORAGE_KEYS.ORDERS).map(order => ({
      ...order,
      orderDate: new Date(order.orderDate),
      expectedDeliveryDate: new Date(order.expectedDeliveryDate),
      actualDeliveryDate: order.actualDeliveryDate ? new Date(order.actualDeliveryDate) : undefined,
      createdAt: new Date(order.createdAt),
      updatedAt: new Date(order.updatedAt),
      productionMilestones: order.productionMilestones.map(milestone => ({
        ...milestone,
        expectedDate: new Date(milestone.expectedDate),
        actualDate: milestone.actualDate ? new Date(milestone.actualDate) : undefined
      }))
    }));
  }

  saveOrder(order: Order): void {
    const orders = this.getOrders();
    const existingIndex = orders.findIndex(o => o.id === order.id);

    if (existingIndex >= 0) {
      orders[existingIndex] = { ...order, updatedAt: new Date() };
    } else {
      orders.push(order);
    }

    this.set(STORAGE_KEYS.ORDERS, orders);
  }

  deleteOrder(id: string): void {
    const orders = this.getOrders().filter(o => o.id !== id);
    this.set(STORAGE_KEYS.ORDERS, orders);
  }

  // Quality Controls
  getQualityControls(): QualityControl[] {
    return this.get<QualityControl>(STORAGE_KEYS.QUALITY_CONTROLS).map(qc => ({
      ...qc,
      inspectionDate: new Date(qc.inspectionDate)
    }));
  }

  saveQualityControl(qualityControl: QualityControl): void {
    const qualityControls = this.getQualityControls();
    const existingIndex = qualityControls.findIndex(qc => qc.id === qualityControl.id);

    if (existingIndex >= 0) {
      qualityControls[existingIndex] = qualityControl;
    } else {
      qualityControls.push(qualityControl);
    }

    this.set(STORAGE_KEYS.QUALITY_CONTROLS, qualityControls);
  }

  deleteQualityControl(id: string): void {
    const qualityControls = this.getQualityControls().filter(qc => qc.id !== id);
    this.set(STORAGE_KEYS.QUALITY_CONTROLS, qualityControls);
  }

  // Returns
  getReturns(): Return[] {
    return this.get<Return>(STORAGE_KEYS.RETURNS).map(returnItem => ({
      ...returnItem,
      returnDate: new Date(returnItem.returnDate),
      createdAt: new Date(returnItem.createdAt)
    }));
  }

  saveReturn(returnItem: Return): void {
    const returns = this.getReturns();
    const existingIndex = returns.findIndex(r => r.id === returnItem.id);

    if (existingIndex >= 0) {
      returns[existingIndex] = returnItem;
    } else {
      returns.push(returnItem);
    }

    this.set(STORAGE_KEYS.RETURNS, returns);
  }

  deleteReturn(id: string): void {
    const returns = this.getReturns().filter(r => r.id !== id);
    this.set(STORAGE_KEYS.RETURNS, returns);
  }

  // Utility
  clearAll(): void {
    if (!this.isClient) return;
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  exportData() {
    return {
      suppliers: this.getSuppliers(),
      products: this.getProducts(),
      orders: this.getOrders(),
      qualityControls: this.getQualityControls(),
      returns: this.getReturns(),
      exportDate: new Date().toISOString()
    };
  }

  importData(data: any): void {
    if (data.suppliers) this.set(STORAGE_KEYS.SUPPLIERS, data.suppliers);
    if (data.products) this.set(STORAGE_KEYS.PRODUCTS, data.products);
    if (data.orders) this.set(STORAGE_KEYS.ORDERS, data.orders);
    if (data.qualityControls) this.set(STORAGE_KEYS.QUALITY_CONTROLS, data.qualityControls);
    if (data.returns) this.set(STORAGE_KEYS.RETURNS, data.returns);
  }
}

export const storage = new LocalStorage();