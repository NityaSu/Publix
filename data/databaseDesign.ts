export type DbPhaseVisual =
  | 'entities'
  | 'relationships'
  | 'keys'
  | 'indexes';

export interface DbTableCol {
  name: string;
  type: string;
  pk?: boolean;
  fk?: string;
  unique?: boolean;
  indexed?: boolean;
  highlight?: boolean;
}

export interface DbTable {
  id: string;
  name: string;
  color: string;
  cols: DbTableCol[];
}

export interface DbStep {
  label: string;
  title: string;
  text: string;
  sql: string;
  insight: string;
  hint: string;
  nextLabel: string;
  visual: DbPhaseVisual;
  /** Which tables are visible this step */
  tables: string[];
  /** Which FK edges to draw: fromTable.col → toTable */
  edges: { from: string; to: string; label: string }[];
}

export interface DbPracticeTask {
  id: string;
  prompt: string;
  /** column key table.col */
  options: { id: string; label: string }[];
  answer: string;
  explain: string;
}

export interface DbQuiz {
  q: string;
  options: string[];
  answer: string;
  explain: string;
}

export const DB_COLORS = {
  users: '#4A9EFF',
  events: '#8b7cff',
  tickets: '#e6a817',
  payments: '#7B2D8E',
} as const;

export const dbTables: DbTable[] = [
  {
    id: 'users',
    name: 'users',
    color: DB_COLORS.users,
    cols: [
      { name: 'id', type: 'uuid', pk: true },
      { name: 'email', type: 'text', unique: true, indexed: true },
      { name: 'name', type: 'text' },
      { name: 'created_at', type: 'timestamptz' },
    ],
  },
  {
    id: 'events',
    name: 'events',
    color: DB_COLORS.events,
    cols: [
      { name: 'id', type: 'uuid', pk: true },
      { name: 'title', type: 'text' },
      { name: 'venue', type: 'text' },
      { name: 'starts_at', type: 'timestamptz', indexed: true },
    ],
  },
  {
    id: 'tickets',
    name: 'tickets',
    color: DB_COLORS.tickets,
    cols: [
      { name: 'id', type: 'uuid', pk: true },
      { name: 'user_id', type: 'uuid', fk: 'users', indexed: true },
      { name: 'event_id', type: 'uuid', fk: 'events', indexed: true },
      { name: 'seat', type: 'text' },
      { name: 'status', type: 'text', indexed: true },
    ],
  },
  {
    id: 'payments',
    name: 'payments',
    color: DB_COLORS.payments,
    cols: [
      { name: 'id', type: 'uuid', pk: true },
      { name: 'ticket_id', type: 'uuid', fk: 'tickets', unique: true },
      { name: 'amount_cents', type: 'int' },
      { name: 'provider_ref', type: 'text', unique: true },
    ],
  },
];

export const dbSteps: DbStep[] = [
  {
    label: 'Step 1: Start from the product questions',
    title: 'Entities = nouns you must remember',
    text: 'Database design starts with product questions, not SQL. For a ticket shop: Who buys? What shows exist? Which seat did they get? Did money clear? Those nouns become tables: users, events, tickets, payments.',
    sql: `<span class="sql-kw">-- questions first</span>
<span class="sql-kw">--</span> Who bought seat A12 for Jazz Night?
<span class="sql-kw">--</span> Can the same email register twice?
<span class="sql-kw">--</span> Did payment for this ticket succeed once?`,
    insight:
      '<strong>Backend reality:</strong> Companies rarely hand you “design the DB” as a blank page. They hand you a feature. Your job is to turn the feature into durable tables + constraints.',
    hint: 'If you cannot name the questions, you are guessing columns. Write 5 questions the app must answer before you draw a table.',
    nextLabel: 'Add relationships',
    visual: 'entities',
    tables: ['users', 'events', 'tickets', 'payments'],
    edges: [],
  },
  {
    label: 'Step 2: Relationships are foreign keys',
    title: 'One row points at another row',
    text: 'A ticket belongs to one user and one event. That is two foreign keys on tickets. A payment belongs to one ticket. Draw the arrows first — the SQL follows the picture.',
    sql: `<span class="sql-kw">CREATE TABLE</span> tickets (
  id uuid <span class="sql-kw">PRIMARY KEY</span>,
  user_id uuid <span class="sql-kw">REFERENCES</span> users(id),
  event_id uuid <span class="sql-kw">REFERENCES</span> events(id),
  seat text,
  status text
);`,
    insight:
      '<strong>Cardinality:</strong> one user → many tickets. one event → many tickets. one ticket → one payment. Wrong cardinality is the #1 schema bug juniors ship.',
    hint: 'Ask “how many?” both ways. If both sides say many, you usually need a join table.',
    nextLabel: 'Lock the rules',
    visual: 'relationships',
    tables: ['users', 'events', 'tickets', 'payments'],
    edges: [
      { from: 'tickets', to: 'users', label: 'user_id' },
      { from: 'tickets', to: 'events', label: 'event_id' },
      { from: 'payments', to: 'tickets', label: 'ticket_id' },
    ],
  },
  {
    label: 'Step 3: Constraints encode business rules',
    title: 'Keys and uniqueness are product laws',
    text: 'PRIMARY KEY = this row’s identity. UNIQUE email = no duplicate accounts. UNIQUE ticket_id on payments = one charge per ticket. UNIQUE provider_ref = idempotent webhooks. Constraints catch bugs before your code does.',
    sql: `<span class="sql-kw">ALTER TABLE</span> users
  <span class="sql-kw">ADD CONSTRAINT</span> users_email_unique <span class="sql-kw">UNIQUE</span> (email);

<span class="sql-kw">ALTER TABLE</span> payments
  <span class="sql-kw">ADD CONSTRAINT</span> one_payment_per_ticket <span class="sql-kw">UNIQUE</span> (ticket_id);`,
    insight:
      '<strong>Strong developer move:</strong> put the rule in the database when it must never be broken — even if two API servers race.',
    hint: 'If a bug would lose money or corrupt identity, prefer a constraint over “we’ll check in the handler.”',
    nextLabel: 'Make it fast',
    visual: 'keys',
    tables: ['users', 'events', 'tickets', 'payments'],
    edges: [
      { from: 'tickets', to: 'users', label: 'user_id' },
      { from: 'tickets', to: 'events', label: 'event_id' },
      { from: 'payments', to: 'tickets', label: 'ticket_id' },
    ],
  },
  {
    label: 'Step 4: Indexes for the queries you run',
    title: 'Index the WHERE / JOIN / ORDER BY paths',
    text: 'Indexes are not decoration. Index foreign keys you join on, and columns you filter often (email login, event starts_at, ticket status). Skip indexes on columns you never search — every write pays for them.',
    sql: `<span class="sql-kw">CREATE INDEX</span> tickets_user_id_idx <span class="sql-kw">ON</span> tickets (user_id);
<span class="sql-kw">CREATE INDEX</span> tickets_event_status_idx <span class="sql-kw">ON</span> tickets (event_id, status);
<span class="sql-kw">CREATE INDEX</span> events_starts_at_idx <span class="sql-kw">ON</span> events (starts_at);`,
    insight:
      '<strong>Rule of thumb:</strong> write the query first, then index what it touches. Blind indexing slows inserts and helps nothing.',
    hint: 'In Practice, match each query to the index that makes it cheap.',
    nextLabel: 'Go to Practice',
    visual: 'indexes',
    tables: ['users', 'events', 'tickets', 'payments'],
    edges: [
      { from: 'tickets', to: 'users', label: 'user_id' },
      { from: 'tickets', to: 'events', label: 'event_id' },
      { from: 'payments', to: 'tickets', label: 'ticket_id' },
    ],
  },
];

export const dbPracticeTasks: DbPracticeTask[] = [
  {
    id: 'p1',
    prompt: 'Login looks up a user by email. Which constraint/index belongs on users.email?',
    options: [
      { id: 'a', label: 'PRIMARY KEY only' },
      { id: 'b', label: 'UNIQUE + index (or UNIQUE which indexes)' },
      { id: 'c', label: 'FOREIGN KEY to tickets' },
      { id: 'd', label: 'No constraint — check in app only' },
    ],
    answer: 'b',
    explain: 'Email must be unique for accounts, and login filters by it — UNIQUE (and its index) is the right tool.',
  },
  {
    id: 'p2',
    prompt: 'A webhook may retry. How do you prevent double-charging the same ticket?',
    options: [
      { id: 'a', label: 'UNIQUE(payments.ticket_id) + UNIQUE(provider_ref)' },
      { id: 'b', label: 'Store amount as text' },
      { id: 'c', label: 'Delete old payments on retry' },
      { id: 'd', label: 'Put user email on payments and skip tickets' },
    ],
    answer: 'a',
    explain: 'One payment row per ticket, and a unique provider reference, make retries idempotent at the DB layer.',
  },
  {
    id: 'p3',
    prompt: 'Query: tickets for one event with status = sold. Best index shape?',
    options: [
      { id: 'a', label: 'Index on tickets.seat only' },
      { id: 'b', label: 'Composite index on (event_id, status)' },
      { id: 'c', label: 'Index on payments.amount_cents' },
      { id: 'd', label: 'Full table scan is fine forever' },
    ],
    answer: 'b',
    explain: 'The filter uses event_id and status together — a composite index matches the WHERE clause.',
  },
  {
    id: 'p4',
    prompt: 'Someone proposes one mega-table: email, event_title, seat, amount. Why refuse?',
    options: [
      { id: 'a', label: 'It uses too many colors' },
      { id: 'b', label: 'Update anomalies + duplicated data when titles/emails change' },
      { id: 'c', label: 'SQL cannot join four columns' },
      { id: 'd', label: 'Primary keys are illegal on wide tables' },
    ],
    answer: 'b',
    explain: 'Denormalized blobs duplicate facts. Change a title once and you must rewrite every ticket row — or ship stale data.',
  },
];

export const dbQuizzes: DbQuiz[] = [
  {
    q: 'Who usually owns day-to-day schema design at a product company?',
    options: ['Only the DBA', 'Backend engineers on the feature', 'Frontend only', 'Designers'],
    answer: 'Backend engineers on the feature',
    explain: 'You design tables for the feature you ship. Dedicated DBAs appear later, at scale.',
  },
  {
    q: 'A foreign key on tickets.user_id means…',
    options: [
      'Every user must have a ticket',
      'Each ticket points at one existing user',
      'Emails must be unique',
      'Payments are optional',
    ],
    answer: 'Each ticket points at one existing user',
    explain: 'FK enforces that the referenced parent row exists (unless you allow NULL).',
  },
  {
    q: 'Why put UNIQUE(ticket_id) on payments?',
    options: [
      'To make the UI purple',
      'So one ticket cannot be charged twice',
      'To speed up SELECT *',
      'Because Postgres requires it',
    ],
    answer: 'So one ticket cannot be charged twice',
    explain: 'Uniqueness is a business law: one successful payment identity per ticket.',
  },
  {
    q: 'When should you add an index?',
    options: [
      'On every column by default',
      'When a real query filters/joins/sorts on it and is hot',
      'Only on PRIMARY KEY columns',
      'Never — constraints are enough',
    ],
    answer: 'When a real query filters/joins/sorts on it and is hot',
    explain: 'Indexes speed reads you actually run; unused indexes tax every write.',
  },
];

export function dbTableById(id: string) {
  return dbTables.find((t) => t.id === id);
}
