export type LessonId =
  | 'table'
  | 'split'
  | 'key'
  | 'inner'
  | 'left'
  | 'trap'
  | 'family';

export type JoinKind = 'inner' | 'left' | 'right' | 'full' | 'cross';

export type TrapMode = 'off' | 'on' | 'where';

export type VennMode = 'none' | 'left' | 'both';

export interface Customer {
  id: number;
  name: string;
}

export interface Order {
  id: number;
  customerId: number;
  item: string;
}

export interface JoinRow {
  id: string;
  customer: Customer | null;
  order: Order | null;
  matched: boolean;
}

export interface StepVisual {
  showRight?: boolean;
  matches?: boolean;
  result?: boolean;
  nulls?: boolean;
  nullBadge?: boolean;
  fadeUnmatchedRight?: boolean;
  fadeUnmatchedLeft?: boolean;
  hideUnmatchedLeft?: boolean;
  join?: JoinKind;
  trap?: TrapMode;
  keys?: 'left' | 'right' | 'both';
  venn?: VennMode;
  orphan?: boolean;
}

export interface LessonStep {
  label: string;
  title: string;
  text: string;
  sql: string;
  insight: string;
  nextLabel: string;
  visual: StepVisual;
}

export interface Lesson {
  id: LessonId;
  n: number;
  tag: string;
  label: string;
  title: string;
  steps: LessonStep[];
}

export const customers: Customer[] = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 3, name: 'Carol' },
  { id: 4, name: 'Dave' },
];

export const orders: Order[] = [
  { id: 101, customerId: 1, item: 'Coffee' },
  { id: 102, customerId: 1, item: 'Bagel' },
  { id: 103, customerId: 3, item: 'Muffin' },
];

export const orphanOrder: Order = { id: 104, customerId: 9, item: 'Tea' };

export const TRAP_ITEM = 'Coffee';

export function ordersFor(includeOrphan: boolean) {
  return includeOrphan ? [...orders, orphanOrder] : orders;
}

export const lessons: Lesson[] = [
  {
    id: 'table',
    n: 1,
    tag: 'Lesson 01 • Tables',
    label: 'Table',
    title: 'A table is a list of facts',
    steps: [
      {
        label: 'Step 1: One list',
        title: 'A database starts as a table',
        text: 'This is a table of customers. Four rows. Two columns. Nothing is hiding underneath. If you can read a guest list, you can read a table.',
        sql: 'SELECT *\nFROM customers;',
        insight:
          '**Row = one thing. Column = one kind of fact.** Alice is a row. `name` is a column. A database is tables you can ask questions of.',
        nextLabel: 'Look closer',
        visual: { showRight: false, venn: 'none' },
      },
      {
        label: 'Step 2: Columns are questions',
        title: 'Columns are the questions',
        text: '`id` asks “which person?” `name` asks “what are they called?” Every row answers the same questions. That is why tables are boring on purpose — same shape, every time.',
        sql: 'SELECT id, name\nFROM customers;',
        insight:
          'Highlight Alice. She is still just one row. The power comes later, when this list talks to another list.',
        nextLabel: 'Next lesson',
        visual: { showRight: false, keys: 'left', venn: 'none' },
      },
    ],
  },
  {
    id: 'split',
    n: 2,
    tag: 'Lesson 02 • Tables',
    label: 'Two tables',
    title: 'Write Alice once',
    steps: [
      {
        label: 'Step 1: A second list arrives',
        title: 'Orders live in another table',
        text: 'Customers on the left. Orders on the right. Alice’s name is not written on the coffee. The coffee only stores her number.',
        sql: 'SELECT *\nFROM customers;\n\nSELECT *\nFROM orders;',
        insight:
          'If every coffee also stored Alice’s email, we would copy Alice a hundred times. When she changes it, we hunt every coffee. **One fact, one place.**',
        nextLabel: 'Alice ordered twice',
        visual: { showRight: true, venn: 'none' },
      },
      {
        label: 'Step 2: One person, many orders',
        title: 'Alice ordered twice. We do not clone her.',
        text: 'Coffee and bagel both point at customer 1. Alice is still one row on the left. Two receipts on the right. That is allowed. That is the point.',
        sql: 'SELECT *\nFROM orders\nWHERE customer_id = 1;',
        insight:
          'Hover Alice. Both of her orders light up. Hover Bob — nothing on the right. He is still a customer. He just has not ordered yet.',
        nextLabel: 'Next lesson',
        visual: { showRight: true, keys: 'both', venn: 'none' },
      },
    ],
  },
  {
    id: 'key',
    n: 3,
    tag: 'Lesson 03 • Keys',
    label: 'Keys',
    title: 'The shared number is the handshake',
    steps: [
      {
        label: 'Step 1: Primary key',
        title: 'A primary key is a nametag',
        text: '`customers.id` is unique. Nobody else may wear 1. That number is how the rest of the database points at Alice without copying her.',
        sql: 'SELECT id, name\nFROM customers;',
        insight:
          '**Primary key:** this row’s nametag. Unique. Stable. The thing other tables hold onto.',
        nextLabel: 'The copy on the receipt',
        visual: { showRight: true, keys: 'left', venn: 'none' },
      },
      {
        label: 'Step 2: Foreign key',
        title: 'A foreign key is a pointer',
        text: '`orders.customer_id` is not a second Alice. It is a copy of her nametag on the receipt. Coffee says 1, so it belongs to Alice.',
        sql: 'SELECT id, customer_id, item\nFROM orders;',
        insight:
          '**Foreign key:** a copy of someone else’s nametag. It must match a primary key, or it points at nobody.',
        nextLabel: 'Line them up',
        visual: { showRight: true, keys: 'right', venn: 'none' },
      },
      {
        label: 'Step 3: The handshake',
        title: 'Same number means same person',
        text: 'A join is not a Venn diagram. It walks rows and asks: does this number match that number? Where yes, draw a line. Alice matches twice. Carol once. Bob and Dave — no line.',
        sql: 'customers.id = orders.customer_id',
        insight:
          'Those lines are the `ON` clause. Everything after this lesson is only: **what do we do with rows that have no line?**',
        nextLabel: 'Next lesson',
        visual: { showRight: true, matches: true, keys: 'both', venn: 'none' },
      },
    ],
  },
  {
    id: 'inner',
    n: 4,
    tag: 'Lesson 04 • The Joins',
    label: 'INNER',
    title: 'Inner join: only the handshakes',
    steps: [
      {
        label: 'Step 1: Two tables side by side',
        title: 'Start from both lists',
        text: 'Inner join keeps a row only if both sides found each other. Think of it as the overlap. Bob and Dave have no orders. They will not survive.',
        sql: 'SELECT *\nFROM customers\nINNER JOIN orders\n  ON customers.id = orders.customer_id;',
        insight:
          'Inner is the default join in SQL. If you write `JOIN` with no word in front, you mean INNER. It is strict.',
        nextLabel: 'Show matches',
        visual: { showRight: true, join: 'inner', venn: 'both' },
      },
      {
        label: 'Step 2: Find the matches',
        title: 'Find the matches first',
        text: 'Alice (id 1) matches coffee and bagel. Carol (id 3) matches muffin. Bob and Dave have no lines. They are about to disappear.',
        sql: 'SELECT *\nFROM customers\nINNER JOIN orders\n  ON customers.id = orders.customer_id;',
        insight:
          'Pairing socks: only pairs leave the laundry. Inner join is the paired socks. The lonely ones stay in the drawer — out of the result.',
        nextLabel: 'Build the result',
        visual: {
          showRight: true,
          matches: true,
          join: 'inner',
          venn: 'both',
        },
      },
      {
        label: 'Step 3: Only pairs survive',
        title: 'Bob and Dave are gone',
        text: 'The result is pairs, not people. Alice appears twice because she ordered twice. Carol once. Bob and Dave are not in the table at all. Inner join dropped them.',
        sql: 'SELECT *\nFROM customers\nINNER JOIN orders\n  ON customers.id = orders.customer_id;',
        insight:
          'This surprises everyone once: **Alice is one person. She is two rows.** The result is order-shaped now. If you needed every customer, this was the wrong join.',
        nextLabel: 'Next lesson',
        visual: {
          showRight: true,
          matches: true,
          result: true,
          hideUnmatchedLeft: true,
          fadeUnmatchedLeft: true,
          join: 'inner',
          venn: 'both',
        },
      },
    ],
  },
  {
    id: 'left',
    n: 5,
    tag: 'Lesson 05 • The Joins',
    label: 'LEFT',
    title: 'Left join: keep everyone on the left',
    steps: [
      {
        label: 'Step 1: Two tables side by side',
        title: 'What is a LEFT JOIN?',
        text: 'Imagine you have a list of customers and a list of orders. A LEFT JOIN says: “Show me every customer. If they have orders, show those too. If not, fill the order fields with NULL.”',
        sql: 'SELECT *\nFROM customers\nLEFT JOIN orders\n  ON customers.id = orders.customer_id;',
        insight:
          '**The rule:** Every row from the **left** table stays. Matched rows from the right table come along. Unmatched rows from the right? They do not appear. Bob has no orders, but he does not disappear — he gets empty order fields.',
        nextLabel: 'Show matches',
        visual: { showRight: true, join: 'left', venn: 'left' },
      },
      {
        label: 'Step 2: Find the matches',
        title: 'Find the matches first',
        text: 'The database looks at the ON condition: `customers.id = orders.customer_id`. Where the keys match, rows are connected. Alice (id 1) matches two orders. Carol (id 3) matches one. Bob and Dave have no matches.',
        sql: 'SELECT *\nFROM customers\nLEFT JOIN orders\n  ON customers.id = orders.customer_id;',
        insight:
          'Think of it like pairing socks. Some socks have a match in the other pile. Some do not. LEFT JOIN keeps ALL socks from the left pile, matched or not.',
        nextLabel: 'Build the result',
        visual: {
          showRight: true,
          matches: true,
          join: 'left',
          venn: 'left',
        },
      },
      {
        label: 'Step 3: Build the result',
        title: 'Build the result row by row',
        text: 'For every customer on the left, it creates a result row. Multiple matching orders → multiple rows. Zero matches → still one row, with NULL for every order column.',
        sql: 'SELECT *\nFROM customers\nLEFT JOIN orders\n  ON customers.id = orders.customer_id;',
        insight:
          'This is why LEFT JOIN is the most common join in real apps. You almost always want the user record, even if they have not done the action yet. A user with zero orders is still a user.',
        nextLabel: 'Show NULLs',
        visual: {
          showRight: true,
          matches: true,
          result: true,
          fadeUnmatchedRight: true,
          join: 'left',
          venn: 'left',
        },
      },
      {
        label: 'Step 4: The NULL padding',
        title: 'The NULL padding',
        text: 'Here is the trick. Bob and Dave have no orders, but they are still in the result. The database invents empty cells — NULL — for every column that would have come from orders. NULL means “we looked, but there was nothing there.”',
        sql: 'SELECT *\nFROM customers\nLEFT JOIN orders\n  ON customers.id = orders.customer_id;',
        insight:
          'NULL is not zero. NULL is not empty string. NULL is “unknown / does not exist.” In app code, always check for NULL before using a joined column, or you will crash with “Cannot read property of null.”',
        nextLabel: 'Next lesson',
        visual: {
          showRight: true,
          matches: true,
          result: true,
          nulls: true,
          nullBadge: true,
          fadeUnmatchedRight: true,
          join: 'left',
          venn: 'both',
        },
      },
    ],
  },
  {
    id: 'trap',
    n: 6,
    tag: 'Lesson 06 • The trap',
    label: 'Trap',
    title: 'WHERE can undo LEFT',
    steps: [
      {
        label: 'Step 1: A normal LEFT JOIN',
        title: 'A normal LEFT JOIN',
        text: 'Everyone is here: Alice twice, Carol once, Bob and Dave with NULL. Now you want only coffee — but you still want every customer listed.',
        sql: 'SELECT *\nFROM customers\nLEFT JOIN orders\n  ON customers.id = orders.customer_id;',
        insight:
          'Hold this picture. Next we add a coffee filter in two places. Same word. Different who stays.',
        nextLabel: 'Filter in WHERE',
        visual: {
          showRight: true,
          matches: true,
          result: true,
          nulls: true,
          join: 'left',
          venn: 'left',
        },
      },
      {
        label: 'Step 2: Filter in WHERE',
        title: 'WHERE happens too late',
        text: 'LEFT JOIN first. Then `WHERE orders.item = \'Coffee\'`. Bob’s item is NULL. NULL is not Coffee. He is deleted. Dave too. Carol’s muffin is not coffee. Deleted. You are left with Alice’s coffee. That is inner join wearing a left-join costume.',
        sql: 'SELECT *\nFROM customers\nLEFT JOIN orders\n  ON customers.id = orders.customer_id\nWHERE orders.item = \'Coffee\';',
        insight:
          '**WHERE runs after the join.** `NULL = Coffee` is false, so lonely rows die. This is the trap that fools everyone.',
        nextLabel: 'Filter in ON',
        visual: {
          showRight: true,
          matches: true,
          result: true,
          hideUnmatchedLeft: true,
          join: 'left',
          trap: 'where',
          venn: 'both',
        },
      },
      {
        label: 'Step 3: Filter in ON',
        title: 'ON happens during the handshake',
        text: 'Put the extra rule in ON: match only if it is coffee. Alice clips onto coffee. Bob, Carol, and Dave still walk out, with empty order halves. Carol’s muffin never attached — and she still stays.',
        sql: 'SELECT *\nFROM customers\nLEFT JOIN orders\n  ON customers.id = orders.customer_id\n AND orders.item = \'Coffee\';',
        insight:
          'Extra rules about the **right** table belong in `ON` when you still want every left row. Use WHERE only when you want to throw rows away after the join.',
        nextLabel: 'Next lesson',
        visual: {
          showRight: true,
          matches: true,
          result: true,
          nulls: true,
          nullBadge: true,
          join: 'left',
          trap: 'on',
          venn: 'left',
        },
      },
    ],
  },
  {
    id: 'family',
    n: 7,
    tag: 'Lesson 07 • The family',
    label: 'Family',
    title: 'RIGHT, FULL, and the mess',
    steps: [
      {
        label: 'Step 1: INNER again',
        title: 'INNER: only overlap',
        text: 'Same two lists. Inner keeps pairs. A new order appears on the right: Tea, customer_id 9. Nobody is 9. Inner drops Tea, Bob, and Dave.',
        sql: 'SELECT *\nFROM customers\nINNER JOIN orders\n  ON customers.id = orders.customer_id;',
        insight:
          'Tea is an orphan receipt. Inner join has no use for it. Left join would also ignore it — orphans live on the right, and LEFT does not hunt the right for lonely rows.',
        nextLabel: 'LEFT',
        visual: {
          showRight: true,
          matches: true,
          result: true,
          hideUnmatchedLeft: true,
          fadeUnmatchedRight: true,
          join: 'inner',
          orphan: true,
          venn: 'both',
        },
      },
      {
        label: 'Step 2: LEFT',
        title: 'LEFT: keep the left list',
        text: 'Every customer stays. Tea still does not appear. It was never on the left. Bob and Dave get NULL.',
        sql: 'SELECT *\nFROM customers\nLEFT JOIN orders\n  ON customers.id = orders.customer_id;',
        insight:
          'Most app questions sound like: “all users, and their orders if they have any.” That is LEFT. The left table is the list you refuse to lose.',
        nextLabel: 'RIGHT',
        visual: {
          showRight: true,
          matches: true,
          result: true,
          nulls: true,
          fadeUnmatchedRight: true,
          join: 'left',
          orphan: true,
          venn: 'left',
        },
      },
      {
        label: 'Step 3: RIGHT',
        title: 'RIGHT: keep the right list',
        text: 'Now every order stays. Tea stays, with a blank customer. Bob and Dave are gone — they were only on the left. RIGHT is LEFT with the tables swapped.',
        sql: 'SELECT *\nFROM customers\nRIGHT JOIN orders\n  ON customers.id = orders.customer_id;',
        insight:
          'You almost never need the word RIGHT. Swap the tables and write LEFT. Same picture, easier to read.',
        nextLabel: 'FULL',
        visual: {
          showRight: true,
          matches: true,
          result: true,
          nulls: true,
          fadeUnmatchedLeft: true,
          join: 'right',
          orphan: true,
          venn: 'both',
        },
      },
      {
        label: 'Step 4: FULL OUTER',
        title: 'FULL: nobody dropped',
        text: 'Matching pairs clip together. Bob and Dave keep empty seats. Tea keeps an empty customer. Both lonely sides survive.',
        sql: 'SELECT *\nFROM customers\nFULL OUTER JOIN orders\n  ON customers.id = orders.customer_id;',
        insight:
          '**CROSS JOIN** (not shown): skip the handshake. Every customer with every order. Alice holds Tea she never bought. If a result explodes, look for a missing `ON`.',
        nextLabel: 'Play again',
        visual: {
          showRight: true,
          matches: true,
          result: true,
          nulls: true,
          join: 'full',
          orphan: true,
          venn: 'both',
        },
      },
    ],
  },
];

export function lessonById(id: string) {
  return lessons.find((lesson) => lesson.id === id);
}

export function neighborLessons(id: string) {
  const index = lessons.findIndex((lesson) => lesson.id === id);
  return {
    prev: index > 0 ? lessons[index - 1] : null,
    next: index >= 0 && index < lessons.length - 1 ? lessons[index + 1] : null,
  };
}

function customerById(id: number) {
  return customers.find((customer) => customer.id === id) ?? null;
}

export function joinRows(
  kind: JoinKind,
  trap: TrapMode = 'off',
  includeOrphan = false,
): JoinRow[] {
  const right = ordersFor(includeOrphan);

  if (kind === 'cross') {
    return customers.flatMap((customer) =>
      right.map((order) => ({
        id: `c-${customer.id}-${order.id}`,
        customer,
        order,
        matched: false,
      })),
    );
  }

  const orderMatches = (customer: Customer, order: Order) => {
    if (order.customerId !== customer.id) return false;
    if (trap === 'on' && order.item !== TRAP_ITEM) return false;
    return true;
  };

  const left: JoinRow[] = [];
  for (const customer of customers) {
    const matches = right.filter((order) => orderMatches(customer, order));
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

  if (kind === 'inner') {
    const rows = left.filter((row) => row.matched);
    if (trap === 'where') {
      return rows.filter((row) => row.order?.item === TRAP_ITEM);
    }
    return rows;
  }

  if (kind === 'left') {
    if (trap === 'where') {
      return left.filter((row) => row.order?.item === TRAP_ITEM);
    }
    return left;
  }

  const matchedOrderIds = new Set(
    left.filter((row) => row.order).map((row) => row.order!.id),
  );
  const extra: JoinRow[] = [];

  for (const order of right) {
    if (trap !== 'off' && order.item !== TRAP_ITEM) continue;
    const customer = customerById(order.customerId);
    if (kind === 'right') {
      extra.push({
        id: `r-${order.id}`,
        customer,
        order,
        matched: Boolean(customer),
      });
    } else if (kind === 'full' && !matchedOrderIds.has(order.id)) {
      extra.push({
        id: `o-${order.id}`,
        customer: null,
        order,
        matched: false,
      });
    }
  }

  if (kind === 'right') {
    if (trap === 'where') {
      return extra.filter((row) => row.order?.item === TRAP_ITEM);
    }
    return extra;
  }

  return [...left, ...extra];
}

const SQL_KEYWORDS = [
  'FULL OUTER JOIN',
  'LEFT JOIN',
  'RIGHT JOIN',
  'INNER JOIN',
  'CROSS JOIN',
  'SELECT',
  'FROM',
  'WHERE',
  'AND',
  'ON',
];

export function highlightSql(sql: string) {
  const escaped = sql
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  const parts = escaped.split(/(`[^`]+`)/g);
  return parts
    .map((part, index) => {
      if (index % 2 === 1) return part;
      let out = part.replace(
        /\b(customers|orders)\.(\w+)/g,
        '<span class="sql-table">$1</span>.<span class="sql-col">$2</span>',
      );
      out = out.replace(
        /\b(customers|orders)\b/g,
        '<span class="sql-table">$1</span>',
      );
      for (const keyword of SQL_KEYWORDS) {
        out = out.replaceAll(keyword, `<span class="sql-kw">${keyword}</span>`);
      }
      return out;
    })
    .join('');
}

export function md(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}
