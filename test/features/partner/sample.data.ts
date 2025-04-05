import { ObjectId } from '@fastify/mongodb';

const getTodayWithHour = (hour: number, minute = 0, second = 0) => {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), today.getDate(), hour, minute, second);
};

export const hookWidgetPairs = [
  // Pair 1: Coffee Shop
  {
    widget: {
      _id: new ObjectId('67c6f1234b8a40bfa6836ee1'),
      code: '<script src="https://philadelphia-backend.onrender.com/api/public/widgets?widgetKey=111d5f62-22c5-408d-a464-77c570fdd6d1"></script>',
      createdAt: new Date('2025-03-05T10:12:13.178Z'),
      status: 'active',
      updatedAt: new Date('2025-03-30T11:23:45.655Z'),
      userId: 'user_3uBrxaXXl6n5HJRzWBlnYqpcLhc',
      widgetKey: '111d5f62-22c5-408d-a464-77c570fdd6d1',
      hookId: new ObjectId('67c6f4321b8a40bfa6836ee2'),
      color: '#4B5563',
      position: 'bottom-left',
    },
    hook: {
      _id: new ObjectId('67c6f4321b8a40bfa6836ee2'),
      category: 'food',
      createdAt: new Date('2025-03-05T10:15:23.360Z'),
      name: 'Seattle Coffee House',
      description: 'Artisanal coffee shop serving premium espresso drinks and freshly baked pastries in a cozy atmosphere.',
      status: 'active',
      updatedAt: new Date('2025-03-28T15:17:48.345Z'),
      userId: 'user_3uBrxaXXl6n5HJRzWBlnYqpcLhc',
      widgetId: new ObjectId('67c6f1234b8a40bfa6836ee1'),
      domain: 'https://www.seattlecoffeehouse.com',
      imageUrl:
        'https://czwh4ne6ibmhrjpf.public.blob.vercel-storage.com/hooks/67c6f4321b8a40bfa6836ee2/profile-image-4YwXnJmhODbmnavqxZCNZblm40j3lu.jpeg',
      promoMessage: 'Enjoy a 20% discount. Use code: SEATTLE20',
      widget: {
        position: 'top-right',
        color: '#059669',
      },
    },
  },

  // Pair 2: Tech Blog
  {
    widget: {
      _id: new ObjectId('67c6f5678b8a40bfa6836ee3'),
      code: '<script src="https://philadelphia-backend.onrender.com/api/public/widgets?widgetKey=222d5f62-33c5-408d-a464-77c570fdd6d2"></script>',
      createdAt: new Date('2025-03-07T14:22:33.178Z'),
      status: 'active',
      updatedAt: new Date('2025-03-29T09:45:19.655Z'),
      userId: 'user_4vCsyaYYl6n5HJRzWBlnYqpcMhc',
      widgetKey: '222d5f62-33c5-408d-a464-77c570fdd6d2',
      hookId: new ObjectId('67c6f8765b8a40bfa6836ee4'),
      color: '#1F2937',
      position: 'top-left',
    },
    hook: {
      _id: new ObjectId('67c6f8765b8a40bfa6836ee4'),
      category: 'technology',
      createdAt: new Date('2025-03-07T14:25:43.360Z'),
      name: 'Tech Insights Blog',
      description:
        'Leading technology blog covering the latest innovations, gadget reviews, and industry analysis from expert contributors.',
      status: 'active',
      updatedAt: new Date('2025-03-27T11:37:28.345Z'),
      userId: 'user_4vCsyaYYl6n5HJRzWBlnYqpcMhc',
      widgetId: new ObjectId('67c6f5678b8a40bfa6836ee3'),
      domain: 'https://www.techinsightsblog.com',
      imageUrl:
        'https://czwh4ne6ibmhrjpf.public.blob.vercel-storage.com/hooks/67c6f8765b8a40bfa6836ee4/profile-image-5ZwXnJmhODbmnavqxZCNZblm40j3lu.jpeg',
      promoMessage: 'Enjoy a 20% discount. Use code: SEATTLE20',
      widget: {
        position: 'bottom-right',
        color: '#2563EB',
      },
    },
  },

  // Pair 3: Fashion Store
  {
    widget: {
      _id: new ObjectId('67c6f9012b8a40bfa6836ee5'),
      code: '<script src="https://philadelphia-backend.onrender.com/api/public/widgets?widgetKey=333d5f62-44c5-408d-a464-77c570fdd6d3"></script>',
      createdAt: new Date('2025-03-10T09:11:13.178Z'),
      status: 'active',
      updatedAt: new Date('2025-03-28T13:48:59.655Z'),
      userId: 'user_5wDtzaZZl6n5HJRzWBlnYqpcNhc',
      widgetKey: '333d5f62-44c5-408d-a464-77c570fdd6d3',
      hookId: new ObjectId('67c6f2109b8a40bfa6836ee6'),
      color: '#6D28D9',
      position: 'bottom-left',
    },
    hook: {
      _id: new ObjectId('67c6f2109b8a40bfa6836ee6'),
      category: 'fashion',
      createdAt: new Date('2025-03-10T09:15:23.360Z'),
      name: 'Urban Fashion Store',
      description: 'Trendy fashion boutique offering contemporary clothing, accessories, and footwear for style-conscious urban shoppers.',
      status: 'active',
      updatedAt: new Date('2025-03-26T16:27:48.345Z'),
      userId: 'user_5wDtzaZZl6n5HJRzWBlnYqpcNhc',
      widgetId: new ObjectId('67c6f9012b8a40bfa6836ee5'),
      domain: 'https://www.urbanfashionstore.com',
      imageUrl:
        'https://czwh4ne6ibmhrjpf.public.blob.vercel-storage.com/hooks/67c6f2109b8a40bfa6836ee6/profile-image-6ZwXnJmhODbmnavqxZCNZblm40j3lu.jpeg',
      promoMessage: 'Enjoy a 20% discount. Use code: SEATTLE20',
      widget: {
        position: 'top-right',
        color: '#DB2777',
      },
    },
  },

  // Pair 4: Fitness Gym
  {
    widget: {
      _id: new ObjectId('67c6f3456b8a40bfa6836ee7'),
      code: '<script src="https://philadelphia-backend.onrender.com/api/public/widgets?widgetKey=444d5f62-55c5-408d-a464-77c570fdd6d4"></script>',
      createdAt: new Date('2025-03-12T11:42:13.178Z'),
      status: 'active',
      updatedAt: new Date('2025-03-27T10:18:59.655Z'),
      userId: 'user_6xEuzaBBl6n5HJRzWBlnYqpcOhc',
      widgetKey: '444d5f62-55c5-408d-a464-77c570fdd6d4',
      hookId: new ObjectId('67c6f6543b8a40bfa6836ee8'),
      color: '#10B981',
      position: 'top-right',
    },
    hook: {
      _id: new ObjectId('67c6f6543b8a40bfa6836ee8'),
      category: 'fitness',
      createdAt: new Date('2025-03-12T11:46:23.360Z'),
      name: 'PowerFit Gym',
      description:
        'Modern fitness center offering state-of-the-art equipment, personalized training programs, and group exercise classes for all fitness levels.',
      status: 'active',
      updatedAt: new Date('2025-03-25T14:37:48.345Z'),
      userId: 'user_6xEuzaBBl6n5HJRzWBlnYqpcOhc',
      widgetId: new ObjectId('67c6f3456b8a40bfa6836ee7'),
      domain: 'https://www.powerfitgym.com',
      imageUrl:
        'https://czwh4ne6ibmhrjpf.public.blob.vercel-storage.com/hooks/67c6f6543b8a40bfa6836ee8/profile-image-7ZwXnJmhODbmnavqxZCNZblm40j3lu.jpeg',
      promoMessage: 'Enjoy a 20% discount. Use code: SEATTLE20',
      widget: {
        position: 'bottom-left',
        color: '#16A34A',
      },
    },
  },

  // Pair 5: Travel Agency
  {
    widget: {
      _id: new ObjectId('67c6f7890b8a40bfa6836ee9'),
      code: '<script src="https://philadelphia-backend.onrender.com/api/public/widgets?widgetKey=555d5f62-66c5-408d-a464-77c570fdd6d5"></script>',
      createdAt: new Date('2025-03-15T16:32:13.178Z'),
      status: 'active',
      updatedAt: new Date('2025-03-26T18:28:59.655Z'),
      userId: 'user_7yFvzaCCl6n5HJRzWBlnYqpcPhc',
      widgetKey: '555d5f62-66c5-408d-a464-77c570fdd6d5',
      hookId: new ObjectId('67c6f0987b8a40bfa6836ef0'),
      color: '#3B82F6',
      position: 'bottom-right',
    },
    hook: {
      _id: new ObjectId('67c6f0987b8a40bfa6836ef0'),
      category: 'travel',
      createdAt: new Date('2025-03-15T16:36:23.360Z'),
      name: 'Wanderlust Travels',
      description:
        'Boutique travel agency specializing in curated adventure trips, luxury getaways, and unique cultural experiences around the world.',
      status: 'active',
      updatedAt: new Date('2025-03-24T12:47:48.345Z'),
      userId: 'user_7yFvzaCCl6n5HJRzWBlnYqpcPhc',
      widgetId: new ObjectId('67c6f7890b8a40bfa6836ee9'),
      domain: 'https://www.wanderlusttravels.com',
      imageUrl:
        'https://czwh4ne6ibmhrjpf.public.blob.vercel-storage.com/hooks/67c6f0987b8a40bfa6836ef0/profile-image-8ZwXnJmhODbmnavqxZCNZblm40j3lu.jpeg',
      promoMessage: 'Enjoy a 20% discount. Use code: SEATTLE20',
      widget: {
        position: 'top-left',
        color: '#1D4ED8',
      },
    },
  },

  // Pair 6: Restaurant
  {
    widget: {
      _id: new ObjectId('67c6fa123b8a40bfa6836ef1'),
      code: '<script src="https://philadelphia-backend.onrender.com/api/public/widgets?widgetKey=666d5f62-77c5-408d-a464-77c570fdd6d6"></script>',
      createdAt: new Date('2025-03-18T13:22:13.178Z'),
      status: 'active',
      updatedAt: new Date('2025-03-25T19:38:59.655Z'),
      userId: 'user_8zGwzaDDl6n5HJRzWBlnYqpcQhc',
      widgetKey: '666d5f62-77c5-408d-a464-77c570fdd6d6',
      hookId: new ObjectId('67c6fb321b8a40bfa6836ef2'),
      color: '#EF4444',
      position: 'top-left',
    },
    hook: {
      _id: new ObjectId('67c6fb321b8a40bfa6836ef2'),
      category: 'food',
      createdAt: new Date('2025-03-18T13:26:23.360Z'),
      name: 'Bella Italia Restaurant',
      description:
        'Family-owned Italian restaurant serving authentic regional cuisine, homemade pasta, and wood-fired pizzas in a warm, inviting atmosphere.',
      status: 'active',
      updatedAt: new Date('2025-03-23T11:57:48.345Z'),
      userId: 'user_8zGwzaDDl6n5HJRzWBlnYqpcQhc',
      widgetId: new ObjectId('67c6fa123b8a40bfa6836ef1'),
      domain: 'https://www.bellaitalia-restaurant.com',
      imageUrl:
        'https://czwh4ne6ibmhrjpf.public.blob.vercel-storage.com/hooks/67c6fb321b8a40bfa6836ef2/profile-image-9ZwXnJmhODbmnavqxZCNZblm40j3lu.jpeg',
      promoMessage: 'Enjoy a 20% discount. Use code: SEATTLE20',
      widget: {
        position: 'bottom-right',
        color: '#DC2626',
      },
    },
  },

  // Pair 7: Bookstore
  {
    widget: {
      _id: new ObjectId('67c6fc654b8a40bfa6836ef3'),
      code: '<script src="https://philadelphia-backend.onrender.com/api/public/widgets?widgetKey=777d5f62-88c5-408d-a464-77c570fdd6d7"></script>',
      createdAt: new Date('2025-03-20T10:12:13.178Z'),
      status: 'active',
      updatedAt: new Date('2025-03-24T15:48:59.655Z'),
      userId: 'user_9aHxzaEEl6n5HJRzWBlnYqpcRhc',
      widgetKey: '777d5f62-88c5-408d-a464-77c570fdd6d7',
      hookId: new ObjectId('67c6fd987b8a40bfa6836ef4'),
      color: '#F59E0B',
      position: 'bottom-left',
    },
    hook: {
      _id: new ObjectId('67c6fd987b8a40bfa6836ef4'),
      category: 'books',
      createdAt: new Date('2025-03-20T10:16:23.360Z'),
      name: 'Classic Books Store',
      description:
        'Charming independent bookstore specializing in classic literature, rare editions, and personalized book recommendations from knowledgeable staff.',
      status: 'active',
      updatedAt: new Date('2025-03-22T14:27:48.345Z'),
      userId: 'user_9aHxzaEEl6n5HJRzWBlnYqpcRhc',
      widgetId: new ObjectId('67c6fc654b8a40bfa6836ef3'),
      domain: 'https://www.classicbooksstore.com',
      imageUrl:
        'https://czwh4ne6ibmhrjpf.public.blob.vercel-storage.com/hooks/67c6fd987b8a40bfa6836ef4/profile-image-10ZwXnJmhODbmnavqxZCNZblm40j3lu.jpeg',
      promoMessage: 'Enjoy a 20% discount. Use code: SEATTLE20',
      widget: {
        position: 'top-right',
        color: '#D97706',
      },
    },
  },
];

export const generateTracesData = () => {
  return [
    // Traces for Pair 1: Seattle Coffee House (2-4 traces)
    [
      {
        _id: new ObjectId(),
        createdAt: getTodayWithHour(9, 15, 22),
        fingerprint: {
          fingerprintId: '14771fb472d8cfd2e0bb93bceca1c9e8',
        },
        hookId: new ObjectId('67c6f4321b8a40bfa6836ee2'),
        widgetId: new ObjectId('67c6f1234b8a40bfa6836ee1'),
        traceId: '367f6529-5cb1-4f56-b8d0-d5f0b2798ad0',
        type: 'visit',
        updatedAt: getTodayWithHour(9, 15, 22),
        widgetKey: '111d5f62-22c5-408d-a464-77c570fdd6d1',
      },
      {
        _id: new ObjectId(),
        createdAt: getTodayWithHour(10, 42, 18),
        fingerprint: {
          fingerprintId: '27a93bce17f52d34c8e9a01dfb54e3c2',
        },
        hookId: new ObjectId('67c6f4321b8a40bfa6836ee2'),
        widgetId: new ObjectId('67c6f1234b8a40bfa6836ee1'),
        traceId: '481f7631-6dc2-5f67-c9d1-e6g1c3709be1',
        type: 'visit',
        updatedAt: getTodayWithHour(10, 42, 18),
        widgetKey: '111d5f62-22c5-408d-a464-77c570fdd6d1',
      },
      {
        _id: new ObjectId(),
        createdAt: getTodayWithHour(14, 27, 55),
        fingerprint: {
          fingerprintId: 'a92c4fe69d782b13c0e4fd5698b2dc47',
        },
        hookId: new ObjectId('67c6f4321b8a40bfa6836ee2'),
        widgetId: new ObjectId('67c6f1234b8a40bfa6836ee1'),
        traceId: '592f8742-7ed3-6f78-d9e2-f7h2d4810cf2',
        type: 'visit',
        updatedAt: getTodayWithHour(14, 27, 55),
        widgetKey: '111d5f62-22c5-408d-a464-77c570fdd6d1',
      },
    ],

    // Traces for Pair 2: Tech Insights Blog (2-4 traces)
    [
      {
        _id: new ObjectId(),
        createdAt: getTodayWithHour(8, 12, 33),
        fingerprint: {
          fingerprintId: '5e87c2a16b3f94d0e7d25a9c8b31e6f5',
        },
        hookId: new ObjectId('67c6f8765b8a40bfa6836ee4'),
        widgetId: new ObjectId('67c6f5678b8a40bfa6836ee3'),
        traceId: '703g9853-8fe4-7g89-e0f3-g8i3e5921dg3',
        type: 'visit',
        updatedAt: getTodayWithHour(8, 12, 33),
        widgetKey: '222d5f62-33c5-408d-a464-77c570fdd6d2',
      },
      {
        _id: new ObjectId(),
        createdAt: getTodayWithHour(11, 35, 42),
        fingerprint: {
          fingerprintId: '9c41e3b872a56f0d19e8c7b42f5a9d0e',
        },
        hookId: new ObjectId('67c6f8765b8a40bfa6836ee4'),
        widgetId: new ObjectId('67c6f5678b8a40bfa6836ee3'),
        traceId: '814h0964-9gf5-8h90-f1g4-h9j4f6032eh4',
        type: 'visit',
        updatedAt: getTodayWithHour(11, 35, 42),
        widgetKey: '222d5f62-33c5-408d-a464-77c570fdd6d2',
      },
    ],

    // Traces for Pair 3: Urban Fashion Store (2-4 traces)
    [
      {
        _id: new ObjectId(),
        createdAt: getTodayWithHour(9, 45, 18),
        fingerprint: {
          fingerprintId: '7b39d4c28e05a1f6c94d2e8b31f5a9c0',
        },
        hookId: new ObjectId('67c6f2109b8a40bfa6836ee6'),
        widgetId: new ObjectId('67c6f9012b8a40bfa6836ee5'),
        traceId: '925i1075-0hg6-9i01-g2h5-i0k5g7143fi5',
        type: 'visit',
        updatedAt: getTodayWithHour(9, 45, 18),
        widgetKey: '333d5f62-44c5-408d-a464-77c570fdd6d3',
      },
      {
        _id: new ObjectId(),
        createdAt: getTodayWithHour(13, 22, 51),
        fingerprint: {
          fingerprintId: '1d82e5f3a7c04b9e6g3h2i1j0k9l8m7n',
        },
        hookId: new ObjectId('67c6f2109b8a40bfa6836ee6'),
        widgetId: new ObjectId('67c6f9012b8a40bfa6836ee5'),
        traceId: '036j2186-1ih7-0j12-h3i6-j1l6h8254gj6',
        type: 'visit',
        updatedAt: getTodayWithHour(13, 22, 51),
        widgetKey: '333d5f62-44c5-408d-a464-77c570fdd6d3',
      },
      {
        _id: new ObjectId(),
        createdAt: getTodayWithHour(16, 5, 39),
        fingerprint: {
          fingerprintId: '2e93f6g4b8d15c0f7h4i3j2k1l0m9n8o',
        },
        hookId: new ObjectId('67c6f2109b8a40bfa6836ee6'),
        widgetId: new ObjectId('67c6f9012b8a40bfa6836ee5'),
        traceId: '147k3297-2ji8-1k23-i4j7-k2m7i9365hk7',
        type: 'visit',
        updatedAt: getTodayWithHour(16, 5, 39),
        widgetKey: '333d5f62-44c5-408d-a464-77c570fdd6d3',
      },
      {
        _id: new ObjectId(),
        createdAt: getTodayWithHour(18, 47, 22),
        fingerprint: {
          fingerprintId: '3f04g7h5c9e16d1g5h4i3j2k1l0m9n8o',
        },
        hookId: new ObjectId('67c6f2109b8a40bfa6836ee6'),
        widgetId: new ObjectId('67c6f9012b8a40bfa6836ee5'),
        traceId: '258l4308-3kj9-2l34-j5k8-l3n8j0476il8',
        type: 'visit',
        updatedAt: getTodayWithHour(18, 47, 22),
        widgetKey: '333d5f62-44c5-408d-a464-77c570fdd6d3',
      },
    ],

    // Traces for Pair 4: PowerFit Gym
    [
      {
        _id: new ObjectId(),
        createdAt: getTodayWithHour(7, 30, 25),
        fingerprint: {
          fingerprintId: '4g15h8i6d0f27e2h6i5j4k3l2m1n0o9p',
        },
        hookId: new ObjectId('67c6f6543b8a40bfa6836ee8'),
        widgetId: new ObjectId('67c6f3456b8a40bfa6836ee7'),
        traceId: '369m5419-4lk0-3m45-k6l9-m4o9k1587jm9',
        type: 'visit',
        updatedAt: getTodayWithHour(7, 30, 25),
        widgetKey: '444d5f62-55c5-408d-a464-77c570fdd6d4',
      },
      {
        _id: new ObjectId(),
        createdAt: getTodayWithHour(12, 15, 47),
        fingerprint: {
          fingerprintId: '5h26i9j7e1g38f3i7j6k5l4m3n2o1p0q',
        },
        hookId: new ObjectId('67c6f6543b8a40bfa6836ee8'),
        widgetId: new ObjectId('67c6f3456b8a40bfa6836ee7'),
        traceId: '470n6520-5ml1-4n56-l7m0-n5p0l2698kn0',
        type: 'visit',
        updatedAt: getTodayWithHour(12, 15, 47),
        widgetKey: '444d5f62-55c5-408d-a464-77c570fdd6d4',
      },
      {
        _id: new ObjectId(),
        createdAt: getTodayWithHour(17, 40, 33),
        fingerprint: {
          fingerprintId: '6i37j0k8f2h49g4j8k7l6m5n4o3p2q1r',
        },
        hookId: new ObjectId('67c6f6543b8a40bfa6836ee8'),
        widgetId: new ObjectId('67c6f3456b8a40bfa6836ee7'),
        traceId: '581o7631-6nm2-5o67-m8n1-o6q1m3709lo1',
        type: 'visit',
        updatedAt: getTodayWithHour(17, 40, 33),
        widgetKey: '444d5f62-55c5-408d-a464-77c570fdd6d4',
      },
    ],

    // Traces for Pair 5: Wanderlust Travels
    [
      {
        _id: new ObjectId(),
        createdAt: getTodayWithHour(10, 5, 12),
        fingerprint: {
          fingerprintId: '7j48k1l9g3i50h5k9l8m7n6o5p4q3r2s',
        },
        hookId: new ObjectId('67c6f0987b8a40bfa6836ef0'),
        widgetId: new ObjectId('67c6f7890b8a40bfa6836ee9'),
        traceId: '692p8742-7on3-6p78-n9o2-p7r2n4810mp2',
        type: 'visit',
        updatedAt: getTodayWithHour(10, 5, 12),
        widgetKey: '555d5f62-66c5-408d-a464-77c570fdd6d5',
      },
      {
        _id: new ObjectId(),
        createdAt: getTodayWithHour(14, 50, 28),
        fingerprint: {
          fingerprintId: '8k59l2m0h4j61i6l0m9n8o7p6q5r4s3t',
        },
        hookId: new ObjectId('67c6f0987b8a40bfa6836ef0'),
        widgetId: new ObjectId('67c6f7890b8a40bfa6836ee9'),
        traceId: '703q9853-8po4-7q89-o0p3-q8s3o5921nq3',
        type: 'visit',
        updatedAt: getTodayWithHour(14, 50, 28),
        widgetKey: '555d5f62-66c5-408d-a464-77c570fdd6d5',
      },
    ],
    // Traces for Pair 6: Bella Italia Restaurant
    [
      {
        _id: new ObjectId(),
        createdAt: getTodayWithHour(11, 25, 42),
        fingerprint: {
          fingerprintId: '9l60m3n1i5k72j7m1n0o9p8q7r6s5t4u',
        },
        hookId: new ObjectId('67c6fb321b8a40bfa6836ef2'),
        widgetId: new ObjectId('67c6fa123b8a40bfa6836ef1'),
        traceId: '814r0964-9qp5-8r90-p1q4-r9t4p6032or4',
        type: 'visit',
        updatedAt: getTodayWithHour(11, 25, 42),
        widgetKey: '666d5f62-77c5-408d-a464-77c570fdd6d6',
      },
      {
        _id: new ObjectId(),
        createdAt: getTodayWithHour(13, 40, 15),
        fingerprint: {
          fingerprintId: '0m71n4o2j6l83k8n2o1p0q9r8s7t6u5v',
        },
        hookId: new ObjectId('67c6fb321b8a40bfa6836ef2'),
        widgetId: new ObjectId('67c6fa123b8a40bfa6836ef1'),
        traceId: '925s1075-0rq6-9s01-q2r5-s0t5q7143ps5',
        type: 'visit',
        updatedAt: getTodayWithHour(13, 40, 15),
        widgetKey: '666d5f62-77c5-408d-a464-77c570fdd6d6',
      },
      {
        _id: new ObjectId(),
        createdAt: getTodayWithHour(18, 15, 33),
        fingerprint: {
          fingerprintId: '1n82o5p3k7m94l9o3p2q1r0s9t8u7v6w',
        },
        hookId: new ObjectId('67c6fb321b8a40bfa6836ef2'),
        widgetId: new ObjectId('67c6fa123b8a40bfa6836ef1'),
        traceId: '036t2186-1sr7-0t12-r3s6-t1u6r8254qt6',
        type: 'visit',
        updatedAt: getTodayWithHour(18, 15, 33),
        widgetKey: '666d5f62-77c5-408d-a464-77c570fdd6d6',
      },
    ],

    // Traces for Pair 7: Classic Books Store
    [
      {
        _id: new ObjectId(),
        createdAt: getTodayWithHour(9, 30, 18),
        fingerprint: {
          fingerprintId: '2o93p6q4l8n05m0p4q3r2s1t0u9v8w7x',
        },
        hookId: new ObjectId('67c6fd987b8a40bfa6836ef4'),
        widgetId: new ObjectId('67c6fc654b8a40bfa6836ef3'),
        traceId: '147u3297-2ts8-1u23-s4t7-u2v7s9365ru7',
        type: 'visit',
        updatedAt: getTodayWithHour(9, 30, 18),
        widgetKey: '777d5f62-88c5-408d-a464-77c570fdd6d7',
      },
      {
        _id: new ObjectId(),
        createdAt: getTodayWithHour(15, 55, 47),
        fingerprint: {
          fingerprintId: '3p04q7r5m9o16n1q5r4s3t2u1v0w9x8y',
        },
        hookId: new ObjectId('67c6fd987b8a40bfa6836ef4'),
        widgetId: new ObjectId('67c6fc654b8a40bfa6836ef3'),
        traceId: '258v4308-3ut9-2v34-t5u8-v3w8t0476sv8',
        type: 'visit',
        updatedAt: getTodayWithHour(15, 55, 47),
        widgetKey: '777d5f62-88c5-408d-a464-77c570fdd6d7',
      },
      {
        _id: new ObjectId(),
        createdAt: getTodayWithHour(17, 25, 22),
        fingerprint: {
          fingerprintId: '4q15r8s6n0o27p2r6s5t4u3v2w1x0y9z',
        },
        hookId: new ObjectId('67c6fd987b8a40bfa6836ef4'),
        widgetId: new ObjectId('67c6fc654b8a40bfa6836ef3'),
        traceId: '369w5419-4vu0-3w45-u6v9-w4x9u1587tw9',
        type: 'visit',
        updatedAt: getTodayWithHour(17, 25, 22),
        widgetKey: '777d5f62-88c5-408d-a464-77c570fdd6d7',
      },
      {
        _id: new ObjectId(),
        createdAt: getTodayWithHour(19, 45, 33),
        fingerprint: {
          fingerprintId: '5r26s9t7o1p38q3s7t6u5v4w3x2y1z0a',
        },
        hookId: new ObjectId('67c6fd987b8a40bfa6836ef4'),
        widgetId: new ObjectId('67c6fc654b8a40bfa6836ef3'),
        traceId: '470x6520-5wv1-4x56-v7w0-x5y0v2698ux0',
        type: 'visit',
        updatedAt: getTodayWithHour(19, 45, 33),
        widgetKey: '777d5f62-88c5-408d-a464-77c570fdd6d7',
      },
    ],
  ];
};
