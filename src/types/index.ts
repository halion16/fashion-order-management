export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    country: string;
    zipCode: string;
    latitude?: number;
    longitude?: number;
  };
  specializations: string[];
  leadTimesDays: number;
  qualityRating: number;
  paymentTerms: string;
  contracts: SupplierContract[];
  ratingHistory: QualityRating[];
  certifications: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SupplierContract {
  id: string;
  type: ContractType;
  startDate: Date;
  endDate: Date;
  termsAndConditions: string;
  minimumOrderValue?: number;
  discountTiers: DiscountTier[];
  penaltyTerms?: string;
  qualityStandards?: string;
  deliveryTerms: string;
  isActive: boolean;
  renewalDate?: Date;
  createdAt: Date;
}

export interface DiscountTier {
  minimumQuantity: number;
  discountPercentage: number;
}

export interface QualityRating {
  id: string;
  orderId: string;
  ratingDate: Date;
  overallRating: number;
  qualityScore: number;
  deliveryScore: number;
  communicationScore: number;
  priceScore: number;
  comments?: string;
  ratedBy: string;
}

export interface Product {
  id: string;
  name: string;
  code: string;
  category: ProductCategory;
  subcategory: string;
  description: string;
  season: Season;
  collection: string;
  collectionYear: number;
  variants: ProductVariant[];
  materials: MaterialSpec[];
  careInstructions: CareInstruction[];
  targetPrice: number;
  images: ProductImage[];
  technicalSheet?: TechnicalSheet;
  supplierPriceLists: SupplierPriceList[];
  sustainability: SustainabilityInfo;
  measurements: ProductMeasurements;
  tags: string[];
  status: ProductStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVariant {
  id: string;
  sku: string;
  color: string;
  colorHex?: string;
  size: string;
  material?: string;
  price: number;
  costPrice: number;
  minimumOrderQuantity: number;
  stockQuantity?: number;
  weight?: number;
  images: ProductImage[];
  supplierPrices: VariantSupplierPrice[];
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
  sortOrder: number;
  variantId?: string;
  imageType: ImageType;
}

export interface MaterialSpec {
  name: string;
  percentage: number;
  origin?: string;
  certification?: string;
  properties: string[];
}

export interface CareInstruction {
  icon: string;
  description: string;
  temperature?: string;
  warning?: boolean;
}

export interface TechnicalSheet {
  id: string;
  version: string;
  specifications: TechnicalSpec[];
  measurements: ProductMeasurements;
  qualityStandards: string[];
  certifications: string[];
  attachments: string[];
  notes?: string;
  lastUpdated: Date;
}

export interface TechnicalSpec {
  category: string;
  specifications: { [key: string]: string };
}

export interface ProductMeasurements {
  sizeChart: SizeChartEntry[];
  grading: GradingRule[];
  fit: FitType;
  notes?: string;
}

export interface SizeChartEntry {
  size: string;
  measurements: { [key: string]: number };
}

export interface GradingRule {
  fromSize: string;
  toSize: string;
  adjustments: { [key: string]: number };
}

export interface SupplierPriceList {
  supplierId: string;
  supplierName: string;
  basePrice: number;
  currency: string;
  minimumOrderQuantity: number;
  leadTimeDays: number;
  discountTiers: PriceDiscountTier[];
  validFrom: Date;
  validTo?: Date;
  isActive: boolean;
}

export interface VariantSupplierPrice {
  supplierId: string;
  price: number;
  currency: string;
  minimumQuantity: number;
  leadTime: number;
}

export interface PriceDiscountTier {
  minimumQuantity: number;
  discountPercentage: number;
  unitPrice: number;
}

export interface SustainabilityInfo {
  ecoFriendly: boolean;
  certifications: string[];
  carbonFootprint?: number;
  recyclable: boolean;
  ethicalProduction: boolean;
  sustainabilityScore: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  supplierId: string;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  orderDate: Date;
  expectedDeliveryDate: Date;
  actualDeliveryDate?: Date;
  notes?: string;
  qualityControlNotes?: string;
  productionMilestones: ProductionMilestone[];
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  productId: string;
  variantId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  receivedQuantity?: number;
  defectiveQuantity?: number;
  qualityGrade?: QualityGrade;
}

export interface ProductionMilestone {
  id: string;
  name: string;
  description: string;
  expectedDate: Date;
  actualDate?: Date;
  status: MilestoneStatus;
  notes?: string;
}

export interface QualityControl {
  id: string;
  orderId: string;
  orderItemId: string;
  inspectionDate: Date;
  inspector: string;
  grade: QualityGrade;
  defects: QualityDefect[];
  notes?: string;
  approved: boolean;
  images?: string[];
}

export interface QualityDefect {
  type: string;
  severity: 'minor' | 'major' | 'critical';
  quantity: number;
  description: string;
}

export interface Return {
  id: string;
  orderId: string;
  orderItemId: string;
  reason: ReturnReason;
  quantity: number;
  returnDate: Date;
  status: ReturnStatus;
  refundAmount?: number;
  notes?: string;
  createdAt: Date;
}

export type ProductCategory =
  | 'abbigliamento'
  | 'accessori'
  | 'calzature'
  | 'intimo';

export type Season =
  | 'primavera-estate'
  | 'autunno-inverno'
  | 'cruise'
  | 'pre-fall';

export type OrderStatus =
  | 'bozza'
  | 'inviato'
  | 'confermato'
  | 'in-produzione'
  | 'controllo-qualita'
  | 'spedito'
  | 'consegnato'
  | 'completato'
  | 'annullato';

export type MilestoneStatus =
  | 'programmato'
  | 'in-corso'
  | 'completato'
  | 'ritardato'
  | 'saltato';

export type QualityGrade =
  | 'A'
  | 'B'
  | 'C'
  | 'scarto';

export type ReturnReason =
  | 'difetto-qualita'
  | 'taglia-errata'
  | 'colore-errato'
  | 'materiale-errato'
  | 'ritardo-consegna'
  | 'non-conforme-campione'
  | 'altro';

export type ReturnStatus =
  | 'richiesto'
  | 'autorizzato'
  | 'in-transito'
  | 'ricevuto'
  | 'verificato'
  | 'rimborsato'
  | 'respinto';

export type ContractType =
  | 'standard'
  | 'preferenziale'
  | 'esclusivo'
  | 'temporaneo'
  | 'volume';

export type ProductStatus =
  | 'bozza'
  | 'attivo'
  | 'sospeso'
  | 'discontinuato'
  | 'esaurito';

export type ImageType =
  | 'principale'
  | 'dettaglio'
  | 'indossato'
  | 'tecnica'
  | 'packaging';

export type FitType =
  | 'slim'
  | 'regular'
  | 'loose'
  | 'oversize'
  | 'custom';

export interface DashboardKPI {
  ordersInProgress: number;
  totalOrderValue: number;
  averageLeadTime: number;
  qualityRate: number;
  onTimeDeliveryRate: number;
  returnRate: number;
  topSuppliers: Array<{
    id: string;
    name: string;
    ordersCount: number;
    totalValue: number;
  }>;
  productionStatus: Array<{
    status: OrderStatus;
    count: number;
  }>;
}