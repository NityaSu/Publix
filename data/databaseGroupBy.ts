import {
  joinRows,
  type JoinKind,
  type JoinRow,
  type TrapMode,
} from '~/data/databaseLab';

export type MasteryPhase = 'explain' | 'practice' | 'master';

export type AggMode = 'raw' | 'orders' | 'star';

export interface GroupStory {
  title: string;
  text: string;
  sql: string;
  rule: string;
  world: string;
  mistake: string;
  hint: string;
}

export interface AggGroup {
  key: string;
  n: number;
  rows: JoinRow[];
}

export const EXPLAIN_STEPS = 4;
export const PRACTICE_NEED = 3;

export const explainStories: GroupStory[] = [
  {
    title: 'What is GROUP BY?',
    text: 'A join prints a row for every handshake. Alice ordered twice, so Alice appears twice. GROUP BY says: collapse those rows. One row per group. The number in that row is an aggregate — usually COUNT, SUM, or AVG.',
    sql: 'SELECT *\nFROM customers\nLEFT JOIN orders\n  ON customers.id = orders.customer_id;',
    rule: 'GROUP BY folds many rows into one row per group.',
    world: 'A dashboard titled “orders per customer” cannot list Alice twice. It needs Alice: 2.',
    mistake: 'SELECT name, item without GROUP BY either errors or picks a random item. The pile is still order-shaped.',
    hint: 'Look at the two tables. Same people you already know. The join pile is the input. GROUP BY is the fold.',
  },
  {
    title: 'Why the join pile is the wrong shape',
    text: 'Alice clips to coffee and bagel. Carol clips to muffin. Bob and Dave have no line. If you stop here, a report prints five rows. You asked “how many orders?” and got a guest list with repeats.',
    sql: 'SELECT customers.name, orders.item\nFROM customers\nLEFT JOIN orders\n  ON customers.id = orders.customer_id;',
    rule: 'Matches become extra rows. Lonely left rows stay, with NULL on the right.',
    world: 'Finance asks “orders per user this week.” Repeating Alice makes the total look like five people.',
    mistake: 'Counting rows in the join pile counts Alice twice. That inflates headcount.',
    hint: 'Blue is customers (left). Purple is orders (right). Lines are the ON clause.',
  },
  {
    title: 'Build the LEFT JOIN pile first',
    text: 'Five result rows: Alice-Coffee, Alice-Bagel, Carol-Muffin, Bob-NULL, Dave-NULL. This is the pile GROUP BY will fold. Bob is still here because this is LEFT, not INNER.',
    sql: 'SELECT customers.name, orders.item\nFROM customers\nLEFT JOIN orders\n  ON customers.id = orders.customer_id;',
    rule: 'Left table rows always stay. Right table rows stay only if they matched.',
    world: 'You still want users who bought nothing. They are the churn list.',
    mistake: 'INNER JOIN here would delete Bob and Dave before you can count them as zero.',
    hint: 'NULL is not zero yet. NULL means “no order row.” COUNT will turn that into 0 in the next step.',
  },
  {
    title: 'Fold. Then count.',
    text: 'GROUP BY customers.name makes four rows. COUNT(orders.id) skips NULL, so Alice 2, Carol 1, Bob 0, Dave 0. COUNT(*) would count Bob’s empty row as 1 — that is a different question.',
    sql: 'SELECT customers.name, COUNT(orders.id) AS n\nFROM customers\nLEFT JOIN orders\n  ON customers.id = orders.customer_id\nGROUP BY customers.name;',
    rule: 'COUNT(column) skips NULL. COUNT(*) counts rows. LEFT JOIN is how zeros survive.',
    world: 'This is the query behind “including users with zero orders” on every admin screen.',
    mistake: 'COUNT(*) after LEFT JOIN counts the NULL pad as a row. Bob becomes 1. He did not order.',
    hint: 'When you want “how many orders,” count the order id. When you want “how many join rows,” count *.',
  },
];

export const practiceStory: GroupStory = {
  title: 'Play with the fold',
  text: 'Switch the join. Switch the count. Add the orphan Tea receipt. Nothing is scored. Watch who survives, and whether zeros stay zeros.',
  sql: '',
  rule: 'Change one control. The result table is the lesson.',
  world: 'This is how you debug a dashboard number: toggle LEFT vs INNER and watch a user vanish.',
  mistake: 'WHERE on a right-table column after LEFT JOIN deletes the zeros. That is the trap from lesson 06.',
  hint: 'Try INNER, then LEFT, with COUNT(orders.id). Bob is the tell.',
};

export const masterStory: GroupStory = {
  title: 'Prove you can fold it',
  text: 'Five questions. Predict, pick, fill, fix, then build. Green is correct. Red comes with why. 4/5 is mastered.',
  sql: 'SELECT customers.name, COUNT(orders.id) AS n\nFROM customers\nLEFT JOIN orders\n  ON customers.id = orders.customer_id\nGROUP BY customers.name;',
  rule: 'All customers. Order counts. Zeros included. LEFT JOIN + COUNT(order id) + GROUP BY name.',
  world: 'If you can write this, you can ship the “users and activity” screen.',
  mistake: 'INNER JOIN, COUNT(*), or forgetting GROUP BY — each one lies in a different way.',
  hint: 'Q5 is the sentence you already saw: keep the left list, count the right ids, fold by name.',
};

export interface QuizQuestion {
  id: string;
  kind: 'predict' | 'choice' | 'blank' | 'fix' | 'boss';
  prompt: string;
  options?: string[];
  answer: string | string[];
  why: string;
  fragments?: string[];
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    kind: 'predict',
    prompt:
      'LEFT JOIN customers to orders, then GROUP BY name, COUNT(orders.id). How many rows in the result?',
    options: ['3', '4', '5', '6'],
    answer: '4',
    why: 'One row per customer. Alice’s two orders fold into one row. Bob and Dave stay, with 0.',
  },
  {
    id: 'q2',
    kind: 'choice',
    prompt: 'Same tables, INNER JOIN, no GROUP BY. Who disappears?',
    options: ['Alice', 'Bob and Dave', 'Carol', 'Nobody'],
    answer: 'Bob and Dave',
    why: 'Inner keeps only handshakes. They have no orders, so they never enter the pile.',
  },
  {
    id: 'q3',
    kind: 'blank',
    prompt:
      'Keep every customer even if they have no orders: SELECT * FROM customers ____ JOIN orders ON customers.id = orders.customer_id',
    options: ['INNER', 'LEFT', 'RIGHT', 'FULL'],
    answer: 'LEFT',
    why: 'LEFT means the left list cannot be deleted. That is the whole word.',
  },
  {
    id: 'q4',
    kind: 'fix',
    prompt:
      'This query drops users with zero orders. What is the fix?\nSELECT name, COUNT(orders.id)\nFROM customers\nINNER JOIN orders ON customers.id = orders.customer_id\nGROUP BY name;',
    options: [
      'Change INNER JOIN to LEFT JOIN',
      'Remove GROUP BY',
      'Use COUNT(*) instead',
      'Add WHERE orders.id IS NOT NULL',
    ],
    answer: 'Change INNER JOIN to LEFT JOIN',
    why: 'Inner deletes Bob before GROUP BY can count him. COUNT(*) still would not bring him back. WHERE would hide more.',
  },
  {
    id: 'q5',
    kind: 'boss',
    prompt:
      'Boss: assemble a query that shows ALL customers and their order count, including zeros.',
    fragments: [
      'GROUP BY customers.name',
      'ON customers.id = orders.customer_id',
      'SELECT customers.name, COUNT(orders.id) AS n',
      'LEFT JOIN orders',
      'FROM customers',
    ],
    answer: [
      'SELECT customers.name, COUNT(orders.id) AS n',
      'FROM customers',
      'LEFT JOIN orders',
      'ON customers.id = orders.customer_id',
      'GROUP BY customers.name',
    ],
    why: 'Left list stays. Count the order ids (NULL becomes 0). Fold by name so Alice is one row.',
  },
];

export function practiceSql(
  join: JoinKind,
  agg: AggMode,
  includeOrphan: boolean,
  coffeeWhere: boolean,
) {
  const joinSql =
    join === 'inner'
      ? 'INNER JOIN'
      : join === 'right'
        ? 'RIGHT JOIN'
        : join === 'full'
          ? 'FULL OUTER JOIN'
          : 'LEFT JOIN';
  const where = coffeeWhere ? `\nWHERE orders.item = 'Coffee'` : '';
  const orphanNote = includeOrphan ? '\n-- orphan Tea (customer_id 9) is in orders' : '';
  if (agg === 'raw') {
    return `SELECT *\nFROM customers\n${joinSql} orders\n  ON customers.id = orders.customer_id${where};${orphanNote}`;
  }
  const count = agg === 'star' ? 'COUNT(*)' : 'COUNT(orders.id)';
  return `SELECT customers.name, ${count} AS n\nFROM customers\n${joinSql} orders\n  ON customers.id = orders.customer_id${where}\nGROUP BY customers.name;${orphanNote}`;
}

export function joinPile(
  join: JoinKind,
  includeOrphan: boolean,
  coffeeWhere: boolean,
): JoinRow[] {
  const trap: TrapMode = coffeeWhere ? 'where' : 'off';
  return joinRows(join, trap, includeOrphan);
}

export function foldPile(rows: JoinRow[], agg: AggMode): AggGroup[] {
  if (agg === 'raw') {
    return rows.map((row) => ({
      key: `${row.customer?.name ?? 'NULL'} · ${row.order?.item ?? 'NULL'}`,
      n: row.order ? 1 : 0,
      rows: [row],
    }));
  }
  const map = new Map<string, JoinRow[]>();
  for (const row of rows) {
    const key = row.customer?.name ?? 'NULL customer';
    const list = map.get(key) ?? [];
    list.push(row);
    map.set(key, list);
  }
  return [...map.entries()].map(([key, groupRows]) => ({
    key,
    n:
      agg === 'star'
        ? groupRows.length
        : groupRows.filter((row) => row.order).length,
    rows: groupRows,
  }));
}
