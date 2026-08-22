export interface ShopCustomer {
  id: number;
  name: string;
  email: string;
  city: string;
  joined_at: string;
}

export interface ShopOrder {
  id: number;
  customer_id: number;
  item: string;
  price: number;
  ordered_at: string;
}

export interface ShopProduct {
  id: number;
  name: string;
  category: string;
  price: number;
}

export interface ShopReview {
  id: number;
  product_id: number;
  customer_id: number;
  rating: number;
}

export const shopCustomers: ShopCustomer[] = [
  { id: 1, name: 'Alice', email: 'alice@email.com', city: 'NYC', joined_at: '2024-01-15' },
  { id: 2, name: 'Bob', email: 'bob@email.com', city: 'LA', joined_at: '2024-02-20' },
  { id: 3, name: 'Carol', email: 'carol@email.com', city: 'Chicago', joined_at: '2024-03-10' },
  { id: 4, name: 'Dave', email: 'dave@email.com', city: 'NYC', joined_at: '2024-01-28' },
  { id: 5, name: 'Eve', email: 'eve@email.com', city: 'LA', joined_at: '2024-04-05' },
];

export const shopOrders: ShopOrder[] = [
  { id: 101, customer_id: 1, item: 'Coffee', price: 5, ordered_at: '2024-06-01' },
  { id: 102, customer_id: 1, item: 'Bagel', price: 3.5, ordered_at: '2024-06-02' },
  { id: 103, customer_id: 3, item: 'Muffin', price: 4, ordered_at: '2024-06-03' },
  { id: 104, customer_id: 4, item: 'Coffee', price: 5, ordered_at: '2024-06-04' },
  { id: 105, customer_id: 1, item: 'Tea', price: 3, ordered_at: '2024-06-05' },
];

export const shopProducts: ShopProduct[] = [
  { id: 1, name: 'Coffee', category: 'Beverage', price: 5 },
  { id: 2, name: 'Bagel', category: 'Food', price: 3.5 },
  { id: 3, name: 'Muffin', category: 'Food', price: 4 },
  { id: 4, name: 'Tea', category: 'Beverage', price: 3 },
  { id: 5, name: 'Croissant', category: 'Food', price: 4.5 },
];

export const shopReviews: ShopReview[] = [
  { id: 1, product_id: 1, customer_id: 1, rating: 5 },
  { id: 2, product_id: 1, customer_id: 3, rating: 4 },
  { id: 3, product_id: 2, customer_id: 1, rating: 3 },
];

export type ShopJoinKind = 'inner' | 'left' | 'right' | 'full';

export interface ShopJoinRow {
  id: string;
  customer: ShopCustomer | null;
  order: ShopOrder | null;
  matched: boolean;
}

export interface ShopSale {
  order: ShopOrder;
  customer: ShopCustomer;
  product: ShopProduct;
}

export const shopSales: ShopSale[] = shopOrders.map((order) => {
  const customer = shopCustomers.find((row) => row.id === order.customer_id)!;
  const product = shopProducts.find((row) => row.name === order.item)!;
  return { order, customer, product };
});

export function customerSpend(id: number) {
  return shopOrders
    .filter((order) => order.customer_id === id)
    .reduce((sum, order) => sum + order.price, 0);
}

export function shopJoinRows(kind: ShopJoinKind): ShopJoinRow[] {
  const left: ShopJoinRow[] = [];
  for (const customer of shopCustomers) {
    const matches = shopOrders.filter((order) => order.customer_id === customer.id);
    if (matches.length) {
      for (const order of matches) {
        left.push({
          id: `m-${customer.id}-${order.id}`,
          customer,
          order,
          matched: true,
        });
      }
    } else if (kind === 'left' || kind === 'full') {
      left.push({
        id: `l-${customer.id}`,
        customer,
        order: null,
        matched: false,
      });
    }
  }
  if (kind === 'inner') return left.filter((row) => row.matched);
  if (kind === 'left') return left;

  const extra: ShopJoinRow[] = [];
  if (kind === 'right') {
    for (const order of shopOrders) {
      const customer = shopCustomers.find((row) => row.id === order.customer_id) ?? null;
      extra.push({
        id: `r-${order.id}`,
        customer,
        order,
        matched: Boolean(customer),
      });
    }
    return extra;
  }
  const matchedOrderIds = new Set(left.filter((row) => row.order).map((row) => row.order!.id));
  for (const order of shopOrders) {
    if (matchedOrderIds.has(order.id)) continue;
    extra.push({
      id: `o-${order.id}`,
      customer: null,
      order,
      matched: false,
    });
  }
  return [...left, ...extra];
}

export type SelectOrderBy = 'name' | 'city' | 'joined_at';

export interface SelectFilters {
  cityNyc: boolean;
  beforeFeb: boolean;
  cityLa: boolean;
  useOr: boolean;
  likeA: boolean;
  orderBy: SelectOrderBy;
  limit: number;
}

export function filterCustomers(filters: SelectFilters) {
  const rows = shopCustomers.filter((row) => {
    const nyc = row.city === 'NYC';
    const la = row.city === 'LA';
    const jan = row.joined_at < '2024-02-01';
    const like = row.name.toLowerCase().includes('a');
    const cityOk = filters.cityNyc || filters.cityLa
      ? filters.useOr
        ? (filters.cityNyc && nyc) || (filters.cityLa && la)
        : (!filters.cityNyc || nyc) && (!filters.cityLa || la)
      : true;
    const dateOk = !filters.beforeFeb || jan;
    const likeOk = !filters.likeA || like;
    return cityOk && dateOk && likeOk;
  });
  const sorted = [...rows].sort((a, b) => {
    const key = filters.orderBy;
    return String(a[key]).localeCompare(String(b[key]));
  });
  return sorted.slice(0, filters.limit);
}

export function selectSql(filters: SelectFilters) {
  const where: string[] = [];
  if (filters.cityNyc && filters.cityLa) {
    where.push(
      filters.useOr
        ? `(city = 'NYC' OR city = 'LA')`
        : `(city = 'NYC' AND city = 'LA')`,
    );
  } else if (filters.cityNyc) {
    where.push(`city = 'NYC'`);
  } else if (filters.cityLa) {
    where.push(`city = 'LA'`);
  }
  if (filters.beforeFeb) where.push(`joined_at < '2024-02-01'`);
  if (filters.likeA) where.push(`name LIKE '%a%'`);
  const whereSql = where.length ? `\nWHERE ${where.join('\n  AND ')}` : '';
  return `SELECT id, name, email, city, joined_at\nFROM customers${whereSql}\nORDER BY ${filters.orderBy}\nLIMIT ${filters.limit};`;
}

export type GroupKey = 'city' | 'category';

export function groupSales(key: GroupKey, havingCount: number) {
  const map = new Map<string, ShopSale[]>();
  for (const sale of shopSales) {
    const bucket = key === 'city' ? sale.customer.city : sale.product.category;
    const list = map.get(bucket) ?? [];
    list.push(sale);
    map.set(bucket, list);
  }
  return [...map.entries()]
    .map(([name, sales]) => ({
      name,
      count: sales.length,
      sum: sales.reduce((total, sale) => total + sale.order.price, 0),
      avg: sales.reduce((total, sale) => total + sale.order.price, 0) / sales.length,
      sales,
    }))
    .filter((group) => group.count >= havingCount);
}

export function spendByCustomer() {
  return shopCustomers
    .map((customer) => ({
      customer,
      spend: customerSpend(customer.id),
    }))
    .sort((a, b) => b.spend - a.spend);
}

export function productRatings() {
  return shopProducts.map((product) => {
    const rows = shopReviews.filter((review) => review.product_id === product.id);
    const avg = rows.length
      ? rows.reduce((sum, review) => sum + review.rating, 0) / rows.length
      : 0;
    return { product, count: rows.length, avg };
  });
}

export function money(value: number) {
  return `$${value.toFixed(2)}`;
}
