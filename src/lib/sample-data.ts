import { Supplier, Product, Order, ProductVariant } from '@/types';
import { generateId } from './utils';

export const sampleSuppliers: Supplier[] = [
  {
    id: generateId(),
    name: 'Tessuti Milano S.r.l.',
    email: 'ordini@tessutimilano.it',
    phone: '+39 02 1234567',
    address: {
      street: 'Via della Moda 15',
      city: 'Milano',
      country: 'Italia',
      zipCode: '20121',
      latitude: 45.4642,
      longitude: 9.1900
    },
    specializations: ['Abbigliamento uomo', 'Giacche', 'Pantaloni'],
    leadTimesDays: 30,
    qualityRating: 4.5,
    paymentTerms: '30 giorni fine mese',
    contracts: [
      {
        id: generateId(),
        type: 'preferenziale',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        termsAndConditions: 'Contratto annuale con condizioni preferenziali per ordini di volume elevato',
        minimumOrderValue: 10000,
        discountTiers: [
          { minimumQuantity: 100, discountPercentage: 5 },
          { minimumQuantity: 500, discountPercentage: 10 },
          { minimumQuantity: 1000, discountPercentage: 15 }
        ],
        penaltyTerms: 'Penale del 2% per ordini cancellati con meno di 7 giorni di preavviso',
        qualityStandards: 'Standard ISO 9001:2015 - Controllo qualità certificato',
        deliveryTerms: 'Franco fabbrica - Lead time massimo 30 giorni',
        isActive: true,
        renewalDate: new Date('2024-11-01'),
        createdAt: new Date('2024-01-01')
      }
    ],
    ratingHistory: [
      {
        id: generateId(),
        orderId: 'ORD-001',
        ratingDate: new Date('2024-08-15'),
        overallRating: 4.5,
        qualityScore: 5,
        deliveryScore: 4,
        communicationScore: 4,
        priceScore: 5,
        comments: 'Eccellente qualità dei tessuti, consegna leggermente in ritardo',
        ratedBy: 'admin'
      }
    ],
    certifications: ['ISO 9001:2015', 'OEKO-TEX Standard 100', 'GOTS Certified'],
    notes: 'Specializzato in abbigliamento formale di alta qualità',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: generateId(),
    name: 'Accessori Luxury Ltd.',
    email: 'info@accessoriluxury.com',
    phone: '+39 055 9876543',
    address: {
      street: 'Borgo Santi Apostoli 8',
      city: 'Firenze',
      country: 'Italia',
      zipCode: '50123',
      latitude: 43.7696,
      longitude: 11.2558
    },
    specializations: ['Accessori', 'Cinture', 'Borse', 'Portafogli'],
    leadTimesDays: 21,
    qualityRating: 4.8,
    paymentTerms: '15 giorni data fattura',
    contracts: [
      {
        id: generateId(),
        type: 'esclusivo',
        startDate: new Date('2024-03-01'),
        endDate: new Date('2025-02-28'),
        termsAndConditions: 'Contratto esclusivo per produzione accessori premium',
        minimumOrderValue: 5000,
        discountTiers: [
          { minimumQuantity: 50, discountPercentage: 8 },
          { minimumQuantity: 200, discountPercentage: 12 }
        ],
        qualityStandards: 'Controllo qualità artigianale - Standard luxury goods',
        deliveryTerms: 'Consegna express - Lead time massimo 21 giorni',
        isActive: true,
        createdAt: new Date('2024-03-01')
      }
    ],
    ratingHistory: [
      {
        id: generateId(),
        orderId: 'ORD-002',
        ratingDate: new Date('2024-09-01'),
        overallRating: 4.8,
        qualityScore: 5,
        deliveryScore: 5,
        communicationScore: 4,
        priceScore: 4,
        comments: 'Qualità eccezionale degli accessori, rispetto perfetto dei tempi',
        ratedBy: 'admin'
      }
    ],
    certifications: ['Made in Italy', 'Leather Working Group Certified', 'Artisan Crafted'],
    notes: 'Produzione artigianale di accessori in pelle',
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date('2024-02-20')
  },
  {
    id: generateId(),
    name: 'Fashion Forward S.p.A.',
    email: 'production@fashionforward.it',
    phone: '+39 081 5555555',
    address: {
      street: 'Via Nazionale 100',
      city: 'Napoli',
      country: 'Italia',
      zipCode: '80139',
      latitude: 40.8518,
      longitude: 14.2681
    },
    specializations: ['Abbigliamento casual', 'T-shirt', 'Felpe', 'Jeans'],
    leadTimesDays: 25,
    qualityRating: 4.2,
    paymentTerms: '45 giorni fine mese',
    contracts: [
      {
        id: generateId(),
        type: 'volume',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        termsAndConditions: 'Contratto volume per produzione abbigliamento casual',
        minimumOrderValue: 15000,
        discountTiers: [
          { minimumQuantity: 500, discountPercentage: 6 },
          { minimumQuantity: 1500, discountPercentage: 12 },
          { minimumQuantity: 3000, discountPercentage: 18 }
        ],
        penaltyTerms: 'Penale del 3% per ordini sotto il minimo contrattuale',
        qualityStandards: 'Standard industriale - Controlli a campione',
        deliveryTerms: 'Franco destino - Lead time standard 25 giorni',
        isActive: true,
        renewalDate: new Date('2024-10-01'),
        createdAt: new Date('2024-01-01')
      }
    ],
    ratingHistory: [
      {
        id: generateId(),
        orderId: 'ORD-003',
        ratingDate: new Date('2024-08-20'),
        overallRating: 4.2,
        qualityScore: 4,
        deliveryScore: 4,
        communicationScore: 5,
        priceScore: 4,
        comments: 'Buona qualità generale, ottima comunicazione e prezzi competitivi',
        ratedBy: 'admin'
      }
    ],
    certifications: ['ISO 14001', 'OEKO-TEX Standard 100'],
    notes: 'Grande capacità produttiva per ordini volume',
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date('2024-03-10')
  }
];

export const sampleProducts: Product[] = [
  {
    id: generateId(),
    name: 'Giacca Blazer Uomo Elegante',
    code: 'GBU001',
    category: 'abbigliamento',
    subcategory: 'Giacche',
    description: 'Giacca blazer elegante in lana vergine per uomo, perfetta per occasioni formali',
    season: 'autunno-inverno',
    collection: 'Formal 2024',
    collectionYear: 2024,
    variants: [
      {
        id: generateId(),
        sku: 'GBU001-BLU-48',
        color: 'Blu Navy',
        colorHex: '#1e3a8a',
        size: '48',
        material: 'Lana vergine 100%',
        price: 299.99,
        costPrice: 120.00,
        minimumOrderQuantity: 10,
        stockQuantity: 45,
        weight: 850,
        images: [
          {
            id: generateId(),
            url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop',
            alt: 'Giacca Blazer Blu Navy - Vista frontale',
            isPrimary: true,
            sortOrder: 1,
            variantId: 'variant-1',
            imageType: 'principale'
          },
          {
            id: generateId(),
            url: 'https://images.unsplash.com/photo-1506629905607-676e10b31d33?w=500&h=500&fit=crop',
            alt: 'Giacca Blazer Blu Navy - Dettaglio tessuto',
            isPrimary: false,
            sortOrder: 2,
            variantId: 'variant-1',
            imageType: 'dettaglio'
          }
        ],
        supplierPrices: [
          {
            supplierId: 'supplier-1',
            price: 120.00,
            currency: 'EUR',
            minimumQuantity: 10,
            leadTime: 30
          }
        ]
      },
      {
        id: generateId(),
        sku: 'GBU001-BLU-50',
        color: 'Blu Navy',
        colorHex: '#1e3a8a',
        size: '50',
        material: 'Lana vergine 100%',
        price: 299.99,
        costPrice: 120.00,
        minimumOrderQuantity: 10,
        stockQuantity: 32,
        weight: 870,
        images: [],
        supplierPrices: [
          {
            supplierId: 'supplier-1',
            price: 120.00,
            currency: 'EUR',
            minimumQuantity: 10,
            leadTime: 30
          }
        ]
      },
      {
        id: generateId(),
        sku: 'GBU001-GRI-48',
        color: 'Grigio Antracite',
        colorHex: '#374151',
        size: '48',
        material: 'Lana vergine 100%',
        price: 299.99,
        costPrice: 120.00,
        minimumOrderQuantity: 10,
        stockQuantity: 28,
        weight: 850,
        images: [],
        supplierPrices: [
          {
            supplierId: 'supplier-1',
            price: 120.00,
            currency: 'EUR',
            minimumQuantity: 10,
            leadTime: 30
          }
        ]
      }
    ],
    materials: [
      {
        name: 'Lana Vergine',
        percentage: 95,
        origin: 'Australia',
        certification: 'Responsible Wool Standard',
        properties: ['Traspirante', 'Termoregolante', 'Anallergico']
      },
      {
        name: 'Elastan',
        percentage: 5,
        origin: 'Germania',
        properties: ['Elasticizzante', 'Resistente']
      }
    ],
    careInstructions: [
      {
        icon: 'dry-clean',
        description: 'Lavaggio a secco professionale',
        warning: false
      },
      {
        icon: 'iron-low',
        description: 'Stiratura a bassa temperatura',
        temperature: '110°C',
        warning: true
      },
      {
        icon: 'no-bleach',
        description: 'Non candeggiare',
        warning: true
      }
    ],
    targetPrice: 299.99,
    images: [
      {
        id: generateId(),
        url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=800&fit=crop',
        alt: 'Giacca Blazer Elegante - Immagine principale',
        isPrimary: true,
        sortOrder: 1,
        imageType: 'principale'
      },
      {
        id: generateId(),
        url: 'https://images.unsplash.com/photo-1506629905607-676e10b31d33?w=800&h=800&fit=crop',
        alt: 'Giacca Blazer Elegante - Dettaglio bottoni',
        isPrimary: false,
        sortOrder: 2,
        imageType: 'dettaglio'
      },
      {
        id: generateId(),
        url: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?w=800&h=800&fit=crop',
        alt: 'Giacca Blazer Elegante - Indossata',
        isPrimary: false,
        sortOrder: 3,
        imageType: 'indossato'
      }
    ],
    technicalSheet: {
      id: generateId(),
      version: '1.2',
      specifications: [
        {
          category: 'Costruzione',
          specifications: {
            'Tipo di cucitura': 'Cucitura inglese',
            'Numero bottoni': '2',
            'Chiusura': 'Doppio petto',
            'Tasche': '3 esterne + 2 interne',
            'Fodera': 'Viscosa 100%'
          }
        },
        {
          category: 'Dettagli',
          specifications: {
            'Bottoni': 'Madreperla naturale',
            'Asole': 'Cucite a mano',
            'Spalle': 'Imbottite leggere',
            'Risvolti': 'Lavorazione artigianale'
          }
        }
      ],
      measurements: {
        sizeChart: [
          {
            size: '46',
            measurements: { 'Torace': 96, 'Vita': 88, 'Spalle': 44, 'Manica': 62 }
          },
          {
            size: '48',
            measurements: { 'Torace': 100, 'Vita': 92, 'Spalle': 45, 'Manica': 63 }
          },
          {
            size: '50',
            measurements: { 'Torace': 104, 'Vita': 96, 'Spalle': 46, 'Manica': 64 }
          }
        ],
        grading: [
          {
            fromSize: '46',
            toSize: '48',
            adjustments: { 'Torace': 4, 'Vita': 4, 'Spalle': 1, 'Manica': 1 }
          }
        ],
        fit: 'regular',
        notes: 'Vestibilità classica italiana, consigliata la prova in negozio'
      },
      qualityStandards: ['ISO 9001:2015', 'Made in Italy'],
      certifications: ['Tessuto Responsabile', 'Lana Certificata'],
      attachments: ['Scheda_Tecnica_GBU001.pdf', 'Certificato_Lana.pdf'],
      notes: 'Prodotto artigianale, leggere variazioni sono normali',
      lastUpdated: new Date('2024-09-01')
    },
    supplierPriceLists: [
      {
        supplierId: 'supplier-1',
        supplierName: 'Tessuti Milano S.r.l.',
        basePrice: 120.00,
        currency: 'EUR',
        minimumOrderQuantity: 10,
        leadTimeDays: 30,
        discountTiers: [
          { minimumQuantity: 50, discountPercentage: 5, unitPrice: 114.00 },
          { minimumQuantity: 100, discountPercentage: 10, unitPrice: 108.00 },
          { minimumQuantity: 200, discountPercentage: 15, unitPrice: 102.00 }
        ],
        validFrom: new Date('2024-01-01'),
        validTo: new Date('2024-12-31'),
        isActive: true
      },
      {
        supplierId: 'supplier-2',
        supplierName: 'Fashion Forward S.p.A.',
        basePrice: 135.00,
        currency: 'EUR',
        minimumOrderQuantity: 25,
        leadTimeDays: 25,
        discountTiers: [
          { minimumQuantity: 100, discountPercentage: 8, unitPrice: 124.20 },
          { minimumQuantity: 250, discountPercentage: 12, unitPrice: 118.80 }
        ],
        validFrom: new Date('2024-02-01'),
        validTo: new Date('2024-11-30'),
        isActive: true
      }
    ],
    sustainability: {
      ecoFriendly: true,
      certifications: ['Responsible Wool Standard', 'OEKO-TEX Standard 100'],
      carbonFootprint: 2.1,
      recyclable: true,
      ethicalProduction: true,
      sustainabilityScore: 8.5
    },
    measurements: {
      sizeChart: [
        {
          size: '46',
          measurements: { 'Torace': 96, 'Vita': 88, 'Spalle': 44, 'Manica': 62 }
        },
        {
          size: '48',
          measurements: { 'Torace': 100, 'Vita': 92, 'Spalle': 45, 'Manica': 63 }
        },
        {
          size: '50',
          measurements: { 'Torace': 104, 'Vita': 96, 'Spalle': 46, 'Manica': 64 }
        }
      ],
      grading: [
        {
          fromSize: '46',
          toSize: '48',
          adjustments: { 'Torace': 4, 'Vita': 4, 'Spalle': 1, 'Manica': 1 }
        }
      ],
      fit: 'regular',
      notes: 'Vestibilità classica italiana'
    },
    tags: ['formale', 'business', 'cerimonia', 'elegante', 'lana'],
    status: 'attivo',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-09-01')
  },
  {
    id: generateId(),
    name: 'Cintura Pelle Premium',
    code: 'CPP001',
    category: 'accessori',
    subcategory: 'Cinture',
    description: 'Cintura in pelle italiana di alta qualità con fibbia in metallo satinato',
    season: 'cruise',
    collection: 'Accessori Luxury 2024',
    variants: [
      {
        id: generateId(),
        sku: 'CPP001-NER-85',
        color: 'Nero',
        size: '85cm',
        material: 'Pelle italiana',
        price: 89.99,
        costPrice: 35.00,
        minimumOrderQuantity: 20
      },
      {
        id: generateId(),
        sku: 'CPP001-MAR-85',
        color: 'Marrone',
        size: '85cm',
        material: 'Pelle italiana',
        price: 89.99,
        costPrice: 35.00,
        minimumOrderQuantity: 20
      }
    ],
    materials: ['Pelle italiana', 'Metallo satinato'],
    careInstructions: ['Pulire con panno umido', 'Utilizzare crema per pelle'],
    targetPrice: 89.99,
    images: [],
    createdAt: new Date('2024-02-25'),
    updatedAt: new Date('2024-02-25')
  },
  {
    id: generateId(),
    name: 'T-Shirt Basic Cotton',
    code: 'TBC001',
    category: 'abbigliamento',
    subcategory: 'T-shirt',
    description: 'T-shirt basic in cotone 100% organico, fit regular',
    season: 'primavera-estate',
    collection: 'Casual 2024',
    variants: [
      {
        id: generateId(),
        sku: 'TBC001-BIA-M',
        color: 'Bianco',
        size: 'M',
        material: 'Cotone organico 100%',
        price: 24.99,
        costPrice: 8.50,
        minimumOrderQuantity: 50
      },
      {
        id: generateId(),
        sku: 'TBC001-NER-M',
        color: 'Nero',
        size: 'M',
        material: 'Cotone organico 100%',
        price: 24.99,
        costPrice: 8.50,
        minimumOrderQuantity: 50
      },
      {
        id: generateId(),
        sku: 'TBC001-BIA-L',
        color: 'Bianco',
        size: 'L',
        material: 'Cotone organico 100%',
        price: 24.99,
        costPrice: 8.50,
        minimumOrderQuantity: 50
      }
    ],
    materials: ['Cotone organico'],
    careInstructions: ['Lavaggio 30°C', 'Non candeggiare', 'Stirare a bassa temperatura'],
    targetPrice: 24.99,
    images: [],
    createdAt: new Date('2024-03-15'),
    updatedAt: new Date('2024-03-15')
  }
];

export const sampleOrders: Order[] = [
  {
    id: generateId(),
    orderNumber: 'ORD-2024-001',
    supplierId: sampleSuppliers[0].id,
    status: 'in-produzione',
    items: [
      {
        id: generateId(),
        productId: sampleProducts[0].id,
        variantId: sampleProducts[0].variants[0].id,
        quantity: 50,
        unitPrice: 120.00,
        totalPrice: 6000.00,
        qualityGrade: 'A'
      },
      {
        id: generateId(),
        productId: sampleProducts[0].id,
        variantId: sampleProducts[0].variants[1].id,
        quantity: 30,
        unitPrice: 120.00,
        totalPrice: 3600.00,
        qualityGrade: 'A'
      },
      {
        id: generateId(),
        productId: sampleProducts[0].id,
        variantId: sampleProducts[0].variants[2].id,
        quantity: 25,
        unitPrice: 120.00,
        totalPrice: 3000.00,
        qualityGrade: 'A'
      },
      {
        id: generateId(),
        productId: sampleProducts[1].id,
        variantId: sampleProducts[1].variants[0].id,
        quantity: 75,
        unitPrice: 35.00,
        totalPrice: 2625.00,
        qualityGrade: 'A'
      },
      {
        id: generateId(),
        productId: sampleProducts[1].id,
        variantId: sampleProducts[1].variants[1].id,
        quantity: 60,
        unitPrice: 35.00,
        totalPrice: 2100.00,
        qualityGrade: 'A'
      },
      {
        id: generateId(),
        productId: sampleProducts[2].id,
        variantId: sampleProducts[2].variants[0].id,
        quantity: 100,
        unitPrice: 8.50,
        totalPrice: 850.00,
        qualityGrade: 'B'
      },
      {
        id: generateId(),
        productId: sampleProducts[2].id,
        variantId: sampleProducts[2].variants[1].id,
        quantity: 100,
        unitPrice: 8.50,
        totalPrice: 850.00,
        qualityGrade: 'B'
      },
      {
        id: generateId(),
        productId: sampleProducts[2].id,
        variantId: sampleProducts[2].variants[2].id,
        quantity: 80,
        unitPrice: 8.50,
        totalPrice: 680.00,
        qualityGrade: 'B'
      },
      {
        id: generateId(),
        productId: sampleProducts[0].id,
        variantId: sampleProducts[0].variants[0].id,
        quantity: 40,
        unitPrice: 120.00,
        totalPrice: 4800.00,
        qualityGrade: 'A'
      },
      {
        id: generateId(),
        productId: sampleProducts[0].id,
        variantId: sampleProducts[0].variants[1].id,
        quantity: 35,
        unitPrice: 120.00,
        totalPrice: 4200.00,
        qualityGrade: 'A'
      },
      {
        id: generateId(),
        productId: sampleProducts[0].id,
        variantId: sampleProducts[0].variants[2].id,
        quantity: 30,
        unitPrice: 120.00,
        totalPrice: 3600.00,
        qualityGrade: 'A'
      },
      {
        id: generateId(),
        productId: sampleProducts[1].id,
        variantId: sampleProducts[1].variants[0].id,
        quantity: 50,
        unitPrice: 35.00,
        totalPrice: 1750.00,
        qualityGrade: 'A'
      },
      {
        id: generateId(),
        productId: sampleProducts[1].id,
        variantId: sampleProducts[1].variants[1].id,
        quantity: 45,
        unitPrice: 35.00,
        totalPrice: 1575.00,
        qualityGrade: 'B'
      },
      {
        id: generateId(),
        productId: sampleProducts[2].id,
        variantId: sampleProducts[2].variants[0].id,
        quantity: 120,
        unitPrice: 8.50,
        totalPrice: 1020.00,
        qualityGrade: 'A'
      },
      {
        id: generateId(),
        productId: sampleProducts[2].id,
        variantId: sampleProducts[2].variants[1].id,
        quantity: 110,
        unitPrice: 8.50,
        totalPrice: 935.00,
        qualityGrade: 'A'
      },
      {
        id: generateId(),
        productId: sampleProducts[2].id,
        variantId: sampleProducts[2].variants[2].id,
        quantity: 90,
        unitPrice: 8.50,
        totalPrice: 765.00,
        qualityGrade: 'B'
      },
      {
        id: generateId(),
        productId: sampleProducts[0].id,
        variantId: sampleProducts[0].variants[0].id,
        quantity: 20,
        unitPrice: 120.00,
        totalPrice: 2400.00,
        qualityGrade: 'A'
      },
      {
        id: generateId(),
        productId: sampleProducts[0].id,
        variantId: sampleProducts[0].variants[1].id,
        quantity: 18,
        unitPrice: 120.00,
        totalPrice: 2160.00,
        qualityGrade: 'A'
      },
      {
        id: generateId(),
        productId: sampleProducts[1].id,
        variantId: sampleProducts[1].variants[0].id,
        quantity: 40,
        unitPrice: 35.00,
        totalPrice: 1400.00,
        qualityGrade: 'A'
      },
      {
        id: generateId(),
        productId: sampleProducts[1].id,
        variantId: sampleProducts[1].variants[1].id,
        quantity: 35,
        unitPrice: 35.00,
        totalPrice: 1225.00,
        qualityGrade: 'A'
      }
    ],
    totalAmount: 48585.00,
    orderDate: new Date('2024-08-15'),
    expectedDeliveryDate: new Date('2024-09-30'),
    notes: 'Ordine prioritario per collezione autunno',
    productionMilestones: [
      {
        id: generateId(),
        name: 'Approvazione campioni',
        description: 'Verifica e approvazione dei campioni di produzione',
        expectedDate: new Date('2024-08-22'),
        actualDate: new Date('2024-08-21'),
        status: 'completato',
        notes: 'Campioni approvati senza modifiche'
      },
      {
        id: generateId(),
        name: 'Inizio produzione',
        description: 'Avvio della produzione in serie',
        expectedDate: new Date('2024-08-25'),
        actualDate: new Date('2024-08-26'),
        status: 'completato',
        notes: 'Produzione iniziata con un giorno di ritardo'
      },
      {
        id: generateId(),
        name: 'Controllo qualità',
        description: 'Controllo qualità sui primi pezzi prodotti',
        expectedDate: new Date('2024-09-15'),
        status: 'in-corso'
      },
      {
        id: generateId(),
        name: 'Spedizione',
        description: 'Spedizione del lotto completo',
        expectedDate: new Date('2024-09-30'),
        status: 'programmato'
      }
    ],
    createdAt: new Date('2024-08-15'),
    updatedAt: new Date('2024-09-10')
  },
  {
    id: generateId(),
    orderNumber: 'ORD-2024-002',
    supplierId: sampleSuppliers[1].id,
    status: 'completato',
    items: [
      {
        id: generateId(),
        productId: sampleProducts[1].id,
        variantId: sampleProducts[1].variants[0].id,
        quantity: 100,
        unitPrice: 35.00,
        totalPrice: 3500.00,
        receivedQuantity: 100,
        qualityGrade: 'A'
      }
    ],
    totalAmount: 3500.00,
    orderDate: new Date('2024-07-10'),
    expectedDeliveryDate: new Date('2024-08-05'),
    actualDeliveryDate: new Date('2024-08-03'),
    notes: 'Ordine completato con anticipo',
    productionMilestones: [
      {
        id: generateId(),
        name: 'Preparazione materiali',
        description: 'Preparazione pelli e materiali',
        expectedDate: new Date('2024-07-15'),
        actualDate: new Date('2024-07-14'),
        status: 'completato'
      },
      {
        id: generateId(),
        name: 'Lavorazione',
        description: 'Lavorazione artigianale delle cinture',
        expectedDate: new Date('2024-07-25'),
        actualDate: new Date('2024-07-23'),
        status: 'completato'
      },
      {
        id: generateId(),
        name: 'Controllo finale',
        description: 'Controllo finale e confezionamento',
        expectedDate: new Date('2024-08-01'),
        actualDate: new Date('2024-07-30'),
        status: 'completato'
      },
      {
        id: generateId(),
        name: 'Spedizione',
        description: 'Spedizione completata',
        expectedDate: new Date('2024-08-05'),
        actualDate: new Date('2024-08-03'),
        status: 'completato'
      }
    ],
    createdAt: new Date('2024-07-10'),
    updatedAt: new Date('2024-08-03')
  }
];

export function initializeSampleData() {
  if (typeof window === 'undefined') return;

  const { storage } = require('./storage');

  // Only initialize if no data exists
  const existingSuppliers = storage.getSuppliers();
  if (existingSuppliers.length === 0) {
    sampleSuppliers.forEach(supplier => storage.saveSupplier(supplier));
    sampleProducts.forEach(product => storage.saveProduct(product));
    sampleOrders.forEach(order => storage.saveOrder(order));

    console.log('Sample data initialized');
  }
}