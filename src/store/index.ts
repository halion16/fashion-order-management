import { create } from 'zustand';
import { Supplier, Product, Order, QualityControl, Return, DashboardKPI } from '@/types';
import { storage } from '@/lib/storage';

interface AppState {
  // Data
  suppliers: Supplier[];
  products: Product[];
  orders: Order[];
  qualityControls: QualityControl[];
  returns: Return[];

  // UI State
  isLoading: boolean;
  selectedOrderId: string | null;

  // Actions
  loadData: () => void;

  // Suppliers
  addSupplier: (supplier: Supplier) => void;
  updateSupplier: (supplier: Supplier) => void;
  deleteSupplier: (id: string) => void;

  // Products
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;

  // Orders
  addOrder: (order: Order) => void;
  updateOrder: (order: Order) => void;
  deleteOrder: (id: string) => void;
  setSelectedOrderId: (id: string | null) => void;

  // Quality Controls
  addQualityControl: (qualityControl: QualityControl) => void;
  updateQualityControl: (qualityControl: QualityControl) => void;
  deleteQualityControl: (id: string) => void;

  // Returns
  addReturn: (returnItem: Return) => void;
  updateReturn: (returnItem: Return) => void;
  deleteReturn: (id: string) => void;

  // Analytics
  getDashboardKPI: () => DashboardKPI;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  suppliers: [],
  products: [],
  orders: [],
  qualityControls: [],
  returns: [],
  isLoading: false,
  selectedOrderId: null,

  // Load data from localStorage
  loadData: () => {
    set({ isLoading: true });
    try {
      const suppliers = storage.getSuppliers();
      const products = storage.getProducts();
      const orders = storage.getOrders();
      const qualityControls = storage.getQualityControls();
      const returns = storage.getReturns();

      set({
        suppliers,
        products,
        orders,
        qualityControls,
        returns,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error loading data:', error);
      set({ isLoading: false });
    }
  },

  // Suppliers
  addSupplier: (supplier) => {
    storage.saveSupplier(supplier);
    set((state) => ({
      suppliers: [...state.suppliers, supplier],
    }));
  },

  updateSupplier: (supplier) => {
    storage.saveSupplier(supplier);
    set((state) => ({
      suppliers: state.suppliers.map((s) =>
        s.id === supplier.id ? supplier : s
      ),
    }));
  },

  deleteSupplier: (id) => {
    storage.deleteSupplier(id);
    set((state) => ({
      suppliers: state.suppliers.filter((s) => s.id !== id),
    }));
  },

  // Products
  addProduct: (product) => {
    storage.saveProduct(product);
    set((state) => ({
      products: [...state.products, product],
    }));
  },

  updateProduct: (product) => {
    storage.saveProduct(product);
    set((state) => ({
      products: state.products.map((p) =>
        p.id === product.id ? product : p
      ),
    }));
  },

  deleteProduct: (id) => {
    storage.deleteProduct(id);
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
    }));
  },

  // Orders
  addOrder: (order) => {
    storage.saveOrder(order);
    set((state) => ({
      orders: [...state.orders, order],
    }));
  },

  updateOrder: (order) => {
    storage.saveOrder(order);
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === order.id ? order : o
      ),
    }));
  },

  deleteOrder: (id) => {
    storage.deleteOrder(id);
    set((state) => ({
      orders: state.orders.filter((o) => o.id !== id),
    }));
  },

  setSelectedOrderId: (id) => {
    set({ selectedOrderId: id });
  },

  // Quality Controls
  addQualityControl: (qualityControl) => {
    storage.saveQualityControl(qualityControl);
    set((state) => ({
      qualityControls: [...state.qualityControls, qualityControl],
    }));
  },

  updateQualityControl: (qualityControl) => {
    storage.saveQualityControl(qualityControl);
    set((state) => ({
      qualityControls: state.qualityControls.map((qc) =>
        qc.id === qualityControl.id ? qualityControl : qc
      ),
    }));
  },

  deleteQualityControl: (id) => {
    storage.deleteQualityControl(id);
    set((state) => ({
      qualityControls: state.qualityControls.filter((qc) => qc.id !== id),
    }));
  },

  // Returns
  addReturn: (returnItem) => {
    storage.saveReturn(returnItem);
    set((state) => ({
      returns: [...state.returns, returnItem],
    }));
  },

  updateReturn: (returnItem) => {
    storage.saveReturn(returnItem);
    set((state) => ({
      returns: state.returns.map((r) =>
        r.id === returnItem.id ? returnItem : r
      ),
    }));
  },

  deleteReturn: (id) => {
    storage.deleteReturn(id);
    set((state) => ({
      returns: state.returns.filter((r) => r.id !== id),
    }));
  },

  // Analytics
  getDashboardKPI: (): DashboardKPI => {
    const { orders, suppliers } = get();

    const ordersInProgress = orders.filter(o =>
      ['confermato', 'in-produzione', 'controllo-qualita', 'spedito'].includes(o.status)
    ).length;

    const totalOrderValue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    const deliveredOrders = orders.filter(o => o.actualDeliveryDate);
    const averageLeadTime = deliveredOrders.length > 0
      ? deliveredOrders.reduce((sum, order) => {
          const leadTime = Math.ceil(
            (order.actualDeliveryDate!.getTime() - order.orderDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          return sum + leadTime;
        }, 0) / deliveredOrders.length
      : 0;

    const completedOrders = orders.filter(o => o.status === 'completato');
    const qualityRate = completedOrders.length > 0
      ? (completedOrders.filter(o =>
          o.items.every(item => item.qualityGrade === 'A' || item.qualityGrade === 'B')
        ).length / completedOrders.length) * 100
      : 0;

    const onTimeOrders = orders.filter(o =>
      o.actualDeliveryDate && o.actualDeliveryDate <= o.expectedDeliveryDate
    );
    const onTimeDeliveryRate = deliveredOrders.length > 0
      ? (onTimeOrders.length / deliveredOrders.length) * 100
      : 0;

    const { returns } = get();
    const returnRate = orders.length > 0
      ? (returns.length / orders.length) * 100
      : 0;

    const supplierStats = suppliers.map(supplier => {
      const supplierOrders = orders.filter(o => o.supplierId === supplier.id);
      return {
        id: supplier.id,
        name: supplier.name,
        ordersCount: supplierOrders.length,
        totalValue: supplierOrders.reduce((sum, order) => sum + order.totalAmount, 0),
      };
    }).sort((a, b) => b.totalValue - a.totalValue).slice(0, 5);

    const statusCounts = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const productionStatus = Object.entries(statusCounts).map(([status, count]) => ({
      status: status as any,
      count,
    }));

    return {
      ordersInProgress,
      totalOrderValue,
      averageLeadTime,
      qualityRate,
      onTimeDeliveryRate,
      returnRate,
      topSuppliers: supplierStats,
      productionStatus,
    };
  },
}));