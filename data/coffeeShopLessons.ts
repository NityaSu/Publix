import type { ShopJoinKind } from '~/data/coffeeShop';

export type ShopLessonId =
  | 'select'
  | 'shopjoin'
  | 'shopgroup'
  | 'subquery'
  | 'shopindex'
  | 'tx';

export type MasteryPhase = 'explain' | 'practice' | 'master';

export interface GroupStory {
  title: string;
  text: string;
  sql: string;
  rule: string;
  world: string;
  mistake: string;
  hint: string;
}

export interface QuizQuestion {
  id: string;
  kind: 'predict' | 'choice' | 'blank' | 'fix' | 'boss';
  prompt: string;
  options?: string[];
  answer: string | string[];
  why: string;
  fragments?: string[];
}

export interface ShopLessonDef {
  id: ShopLessonId;
  explain: GroupStory[];
  practice: GroupStory;
  master: GroupStory;
  questions: QuizQuestion[];
}

export const PRACTICE_NEED = 3;

export const shopLessonDefs: Record<ShopLessonId, ShopLessonDef> = {
  select: {
    id: 'select',
    explain: [
      {
        title: 'The list is the whole shop',
        text: 'The owner wants a January NYC promo. Here is every customer. Five rows. Nobody is hiding. Before SQL, this is just a list.',
        sql: 'SELECT *\nFROM customers;',
        rule: 'A table is rows. SELECT does not change the table. It asks for a copy.',
        world: 'A promo email list is a filtered copy of customers, not a new table.',
        mistake: 'Reading the whole list by eye does not scale. That is why WHERE exists.',
        hint: 'Alice and Dave are NYC. Only they joined in January.',
      },
      {
        title: 'SELECT picks columns',
        text: 'You do not need every column for a promo. Name and email are enough. SELECT is the shopping list of columns.',
        sql: 'SELECT name, email\nFROM customers;',
        rule: 'SELECT chooses columns. The number of rows does not change yet.',
        world: 'Marketing asked for emails, not join dates. Send less, leak less.',
        mistake: 'SELECT * is fine at the register. In production it drags columns you never show.',
        hint: 'Watch the table. Rows stay. Columns can drop.',
      },
      {
        title: 'WHERE keeps some rows',
        text: 'City = NYC lights Alice and Dave. Bob, Carol, Eve fade. WHERE is a yes/no per row. The faded rows are not deleted from the table. They just miss this answer.',
        sql: 'SELECT name, email, city\nFROM customers\nWHERE city = \'NYC\';',
        rule: 'WHERE filters rows. Matching rows stay. The rest sit out.',
        world: 'Same list, different question tomorrow: everyone in LA.',
        mistake: 'WHERE city = NYC without quotes is not SQL. Strings need quotes.',
        hint: 'Green is a match. Gray is filtered out. Count the green ones: 2.',
      },
      {
        title: 'AND makes the net tighter',
        text: 'NYC AND joined before Feb 1. Alice 2024-01-15. Dave 2024-01-28. Both stay. Eve is LA. Bob joined in February. OR would let LA through. LIMIT and ORDER BY tidy the page, they do not change who matched.',
        sql: 'SELECT name, email\nFROM customers\nWHERE city = \'NYC\'\n  AND joined_at < \'2024-02-01\'\nORDER BY joined_at\nLIMIT 10;',
        rule: 'AND means every condition. OR means any condition. ORDER BY sorts. LIMIT caps.',
        world: 'January NYC promo: Alice and Dave. That is the email blast.',
        mistake: 'OR instead of AND here emails Bob and Eve too if you also opened LA — or everyone NYC plus everyone early. Too wide.',
        hint: 'LIKE \'%a%\' is pattern matching. Alice, Carol, Dave match. Bob and Eve do not.',
      },
    ],
    practice: {
      title: 'Toggle the net',
      text: 'Check NYC, January, LA, LIKE, AND vs OR. Sort and LIMIT. The live table is the lesson. Nothing is scored.',
      sql: '',
      rule: 'Change one box. Count the green rows.',
      world: 'This is every admin filter bar you have ever used.',
      mistake: 'NYC AND LA with AND is an empty set. Nobody lives in two cities.',
      hint: 'Promo query: NYC on, before Feb on, AND, order by joined_at.',
    },
    master: {
      title: 'Prove you can filter',
      text: 'Three questions. Count, write, then say what OR does. 80% is mastered — here that is 3/3, so miss none.',
      sql: 'SELECT name\nFROM customers\nWHERE city = \'NYC\'\n  AND joined_at < \'2024-02-01\';',
      rule: 'SELECT columns. WHERE rows. AND is both. OR is either.',
      world: 'If you can pull January NYC, you can pull any promo list.',
      mistake: 'Counting in your head from memory instead of the table.',
      hint: 'LA is Bob and Eve. January NYC is Alice and Dave.',
    },
    questions: [
      {
        id: 'q1',
        kind: 'predict',
        prompt: 'How many customers are from LA?',
        options: ['1', '2', '3', '5'],
        answer: '2',
        why: 'Bob and Eve. Carol is Chicago. Alice and Dave are NYC.',
      },
      {
        id: 'q2',
        kind: 'choice',
        prompt: 'Customers who joined before Feb 1 AND are from NYC. Who?',
        options: ['Alice only', 'Alice and Dave', 'Alice, Dave, and Bob', 'Everyone'],
        answer: 'Alice and Dave',
        why: 'Alice 2024-01-15, Dave 2024-01-28. Bob joined Feb 20 in LA.',
      },
      {
        id: 'q3',
        kind: 'choice',
        prompt: 'WHERE city = \'NYC\' AND city = \'LA\' returns nobody. What if you use OR instead of AND?',
        options: [
          'Still nobody',
          'Alice, Bob, Dave, and Eve',
          'Only Alice and Dave',
          'Only Bob and Eve',
        ],
        answer: 'Alice, Bob, Dave, and Eve',
        why: 'AND needs both cities on one row — impossible. OR keeps NYC people and LA people: Alice, Dave, Bob, Eve. Carol stays out (Chicago).',
      },
    ],
  },
  shopjoin: {
    id: 'shopjoin',
    explain: [
      {
        title: 'Two lists, one question',
        text: 'The owner wants every customer and their orders — even people who never ordered. Customers on the left. Orders on the right. Bob and Eve have no tickets.',
        sql: 'SELECT *\nFROM customers;\n\nSELECT *\nFROM orders;',
        rule: 'A JOIN is a handshake on a shared number: customers.id = orders.customer_id.',
        world: 'A CRM screen: user on the left, purchases on the right.',
        mistake: 'Copying Alice’s name onto every coffee. Then she moves city and you hunt receipts.',
        hint: 'Alice ordered three times. Carol once. Dave once. Bob and Eve: silence.',
      },
      {
        title: 'INNER keeps handshakes only',
        text: 'Draw the lines: Alice→Coffee, Bagel, Tea. Carol→Muffin. Dave→Coffee. Inner join drops Bob and Eve. Five result rows. Repeats are allowed: Alice is three rows.',
        sql: 'SELECT customers.name, orders.item\nFROM customers\nINNER JOIN orders\n  ON customers.id = orders.customer_id;',
        rule: 'INNER JOIN: a row survives only if both sides found each other.',
        world: '“Who bought something?” is inner. Silent customers vanish.',
        mistake: 'Thinking Alice should appear once. The result is order-shaped.',
        hint: 'Five orders, all have a customer. Inner result length = 5.',
      },
      {
        title: 'LEFT keeps the left list',
        text: 'LEFT JOIN keeps Bob and Eve with NULL orders. Seven rows: five matches plus two empty seats. NULL means we looked; nobody was home.',
        sql: 'SELECT customers.name, orders.item\nFROM customers\nLEFT JOIN orders\n  ON customers.id = orders.customer_id;',
        rule: 'Left table rows always stay. Right rows stay only if they matched.',
        world: '“All users, and their orders if any.” That sentence is LEFT JOIN.',
        mistake: 'WHERE orders.item = \'Coffee\' after LEFT JOIN deletes Bob. NULL is not Coffee.',
        hint: 'Count: 3 Alice + 1 Carol + 1 Dave + Bob NULL + Eve NULL = 7.',
      },
      {
        title: 'RIGHT, FULL, same idea',
        text: 'RIGHT keeps every order. Here every order has a customer, so RIGHT looks like INNER. FULL keeps lonely left and lonely right. Here that is the same as LEFT: Bob and Eve still get chairs.',
        sql: 'SELECT customers.name, orders.item\nFROM customers\nFULL OUTER JOIN orders\n  ON customers.id = orders.customer_id;',
        rule: 'RIGHT is LEFT with the tables swapped. FULL is both lonely sides.',
        world: 'You almost never write RIGHT. Swap the tables and write LEFT.',
        mistake: 'A missing ON turns into a CROSS JOIN: every customer holds every muffin.',
        hint: 'Toggle INNER vs LEFT in Practice. Bob is the tell.',
      },
    ],
    practice: {
      title: 'Switch the join',
      text: 'INNER / LEFT / RIGHT / FULL. Hover a result row to see the source. Click a customer to see their orders. No score.',
      sql: '',
      rule: 'One toggle. Who vanishes? Who gets NULL?',
      world: 'This is how you debug “why is Bob missing from the report.”',
      mistake: 'Counting people instead of rows. Alice is one person and three rows.',
      hint: 'LEFT JOIN has 7 rows. INNER has 5. Bob and Eve are the gap.',
    },
    master: {
      title: 'Prove you can join',
      text: 'Predict the count. Name who vanishes. Fill LEFT. Then build all customers plus order counts including zero.',
      sql: 'SELECT customers.name, COUNT(orders.id) AS n\nFROM customers\nLEFT JOIN orders\n  ON customers.id = orders.customer_id\nGROUP BY customers.name;',
      rule: 'Need every customer, even silent ones: LEFT. Need only buyers: INNER.',
      world: 'The activity screen is LEFT JOIN plus a count. You will write that in the next lesson too — here just know who stays.',
      mistake: 'INNER JOIN when the owner said “even the ones who never ordered.”',
      hint: 'Q1 is 7. Q2 is Bob and Eve.',
    },
    questions: [
      {
        id: 'q1',
        kind: 'predict',
        prompt: 'LEFT JOIN customers to orders on customer_id. How many result rows?',
        options: ['5', '6', '7', '8'],
        answer: '7',
        why: 'Five matched order rows, plus Bob and Eve with NULL. Alice is three of those five.',
      },
      {
        id: 'q2',
        kind: 'choice',
        prompt: 'Who disappears in INNER JOIN?',
        options: ['Alice', 'Carol', 'Bob and Eve', 'Dave'],
        answer: 'Bob and Eve',
        why: 'They have no orders. Inner keeps only handshakes.',
      },
      {
        id: 'q3',
        kind: 'blank',
        prompt: 'Keep every customer: SELECT * FROM customers ____ JOIN orders ON customers.id = orders.customer_id',
        options: ['INNER', 'LEFT', 'RIGHT', 'FULL'],
        answer: 'LEFT',
        why: 'LEFT means the left list cannot be deleted.',
      },
      {
        id: 'q4',
        kind: 'boss',
        prompt: 'Boss: assemble ALL customers and their order count, including zero.',
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
        why: 'Left list stays. Count order ids (NULL → 0). Fold by name so Alice is one row.',
      },
    ],
  },
  shopgroup: {
    id: 'shopgroup',
    explain: [
      {
        title: 'Receipts, not a guest list',
        text: 'Five tickets: Alice’s coffee, bagel, tea, Carol’s muffin, Dave’s coffee. The owner asks how much each city spent. Five tickets are the wrong shape. You need one number per city.',
        sql: 'SELECT item, price\nFROM orders;',
        rule: 'GROUP BY folds many rows into one row per bucket.',
        world: 'A dashboard titled “spend per city” cannot list Alice three times.',
        mistake: 'Summing in your head from the join pile and calling it a query.',
        hint: 'NYC tickets: Alice 5+3.50+3 and Dave 5. LA has zero tickets. Chicago has Carol 4.',
      },
      {
        title: 'Buckets: city',
        text: 'Drop each ticket into NYC, LA, or Chicago. NYC gets four tickets, $16.50. Chicago one ticket, $4. LA’s bucket is empty — no orders from Bob or Eve, so LA does not appear unless you left-joined first. Today we fold the tickets we have.',
        sql: 'SELECT customers.city, COUNT(*) AS n, SUM(orders.price) AS spent\nFROM customers\nINNER JOIN orders\n  ON customers.id = orders.customer_id\nGROUP BY customers.city;',
        rule: 'COUNT, SUM, AVG, MAX, MIN are aggregations. They need GROUP BY when mixed with city.',
        world: 'NYC is the cash cow. Chicago is a blip. LA has customers and no spend yet.',
        mistake: 'SELECT city, item, SUM(price) without grouping item — the database errors or picks a random item.',
        hint: 'Watch the counters land: NYC 4 / $16.50, Chicago 1 / $4.00.',
      },
      {
        title: 'Same tickets, category buckets',
        text: 'Coffee and Tea are Beverage. Bagel and Muffin are Food. Croissant never sold. Toggle the grouping key: the tickets do not change. The buckets do.',
        sql: 'SELECT products.category, COUNT(*) AS n, AVG(orders.price) AS avg_price\nFROM orders\nINNER JOIN products\n  ON orders.item = products.name\nGROUP BY products.category;',
        rule: 'GROUP BY is the question. Aggregates are the numbers in each bucket.',
        world: '“Best-selling category” is this fold, not a new table.',
        mistake: 'Grouping by price. Then every $5 coffee is its own tiny bucket.',
        hint: 'Beverage: Coffee, Coffee, Tea. Food: Bagel, Muffin.',
      },
      {
        title: 'HAVING filters groups',
        text: 'WHERE filters tickets before they fall in. HAVING filters buckets after they exist. HAVING COUNT(*) > 2 would keep NYC and drop Chicago.',
        sql: 'SELECT customers.city, SUM(orders.price) AS spent\nFROM customers\nINNER JOIN orders\n  ON customers.id = orders.customer_id\nGROUP BY customers.city\nHAVING COUNT(*) > 2;',
        rule: 'WHERE is rows. HAVING is groups.',
        world: 'Hide noisy one-order cities from the exec chart.',
        mistake: 'Putting SUM(price) > 10 in WHERE. The sum does not exist until after the fold.',
        hint: 'Practice: drag the HAVING slider and watch Chicago vanish.',
      },
    ],
    practice: {
      title: 'Pour tickets into buckets',
      text: 'Group by city or category. Raise HAVING to hide small buckets. Auto GROUP BY fills the counters. Drag is just you doing the fold by hand.',
      sql: '',
      rule: 'One grouping key. One HAVING floor. Watch SUM and AVG move.',
      world: 'Every “by city” chart is this playground.',
      mistake: 'HAVING vs WHERE: if the number needs a group, it is HAVING.',
      hint: 'City + HAVING 2 keeps only NYC.',
    },
    master: {
      title: 'Prove you can fold',
      text: 'Spend per city. Highest average. WHERE vs HAVING. Then categories with more than 2 orders and average price over $4 — check the tickets first.',
      sql: 'SELECT products.category, COUNT(*) AS n, AVG(orders.price) AS avg_price\nFROM orders\nINNER JOIN products\n  ON orders.item = products.name\nGROUP BY products.category\nHAVING COUNT(*) > 2 AND AVG(orders.price) > 4;',
      rule: 'Fold, then filter groups with HAVING.',
      world: 'If you can answer the boss, you can ship a filtered category chart.',
      mistake: 'Using WHERE AVG(price) — illegal. Average is born after GROUP BY.',
      hint: 'NYC spent 16.50. Beverage has 3 orders. Food has 2.',
    },
    questions: [
      {
        id: 'q1',
        kind: 'choice',
        prompt: 'Total spend per city (from orders we have)?',
        options: ['NYC $16.50, Chicago $4.00', 'NYC $13.50, Chicago $4.00, LA $0', 'NYC $16.50, LA $8.00', 'Everyone $4'],
        answer: 'NYC $16.50, Chicago $4.00',
        why: 'Alice 5+3.50+3 = 11.50 plus Dave 5 = 16.50 in NYC. Carol 4 in Chicago. LA has no orders, so no group.',
      },
      {
        id: 'q2',
        kind: 'choice',
        prompt: 'Which city has the highest average order?',
        options: ['NYC', 'Chicago', 'LA', 'Tie'],
        answer: 'NYC',
        why: 'NYC average is $16.50 / 4 = $4.13. Chicago is one $4 muffin. LA has no orders so no average in this fold.',
      },
      {
        id: 'q3',
        kind: 'choice',
        prompt: 'WHERE vs HAVING?',
        options: [
          'Same thing',
          'WHERE filters rows before the fold; HAVING filters groups after',
          'HAVING is for SELECT *; WHERE is for JOIN',
          'WHERE is faster so always use WHERE',
        ],
        answer: 'WHERE filters rows before the fold; HAVING filters groups after',
        why: 'You cannot HAVING a single ticket. You cannot WHERE a SUM that does not exist yet.',
      },
      {
        id: 'q4',
        kind: 'choice',
        prompt: 'Boss: categories with more than 2 orders AND average price over $4. What comes back?',
        options: ['Food', 'Beverage', 'Both', 'Neither'],
        answer: 'Beverage',
        why: 'Beverage has 3 orders (two coffees + tea), average (5+5+3)/3 = $4.33. Food has only 2 orders, so it fails COUNT > 2.',
      },
    ],
  },
  subquery: {
    id: 'subquery',
    explain: [
      {
        title: 'Who are the top spenders?',
        text: 'The owner wants the top 3 customers by total spend. You cannot ORDER BY a number that is not a column yet. First build spend per person. That inner result is a table you can query.',
        sql: 'SELECT customer_id, SUM(price) AS spent\nFROM orders\nGROUP BY customer_id;',
        rule: 'A subquery is a query used as a value, a list, or a table.',
        world: 'Leaderboards are “compute, then rank,” not one magical SELECT.',
        mistake: 'ORDER BY SUM(price) in a query that also wants name — you still need the fold or a subquery.',
        hint: 'Alice 11.50, Dave 5.00, Carol 4.00. Bob and Eve are 0 and missing from orders.',
      },
      {
        title: 'Inner table, then outer rank',
        text: 'The inner query returns three rows of spend. The outer query joins names and takes LIMIT 3. You should see the intermediate table before the final one. That pause is the lesson.',
        sql: 'SELECT customers.name, totals.spent\nFROM customers\nINNER JOIN (\n  SELECT customer_id, SUM(price) AS spent\n  FROM orders\n  GROUP BY customer_id\n) totals\n  ON customers.id = totals.customer_id\nORDER BY totals.spent DESC\nLIMIT 3;',
        rule: 'Non-correlated: the inside runs once. Correlated: the inside runs per outer row.',
        world: '“Customers who spent more than average” is a subquery in WHERE.',
        mistake: 'Correlated subqueries that re-scan orders for every customer on a million-row table.',
        hint: 'Average spend among buyers is (11.50+5+4)/3 = 6.83. Only Alice is above.',
      },
      {
        title: 'Same idea as WITH',
        text: 'A CTE names the inner table. WITH totals AS (...). Then SELECT from totals. Same result as the subquery. Easier to read when the inside is long.',
        sql: 'WITH totals AS (\n  SELECT customer_id, SUM(price) AS spent\n  FROM orders\n  GROUP BY customer_id\n)\nSELECT customers.name, totals.spent\nFROM customers\nINNER JOIN totals\n  ON customers.id = totals.customer_id\nORDER BY totals.spent DESC\nLIMIT 3;',
        rule: 'A CTE is a named subquery. WITH is the nametag.',
        world: 'Reviewers will bless a CTE before a three-level nested FROM.',
        mistake: 'Thinking WITH is faster. It is spelling, not an index.',
        hint: 'Practice toggles subquery vs CTE. The result table must not change.',
      },
      {
        title: 'WHERE subquery',
        text: 'Find customers who spent more than the average of buyer totals. The average is one number from a subquery. Then the outer WHERE compares each person’s spend to that number.',
        sql: 'SELECT customer_id, SUM(price) AS spent\nFROM orders\nGROUP BY customer_id\nHAVING SUM(price) > (\n  SELECT AVG(spent) FROM (\n    SELECT SUM(price) AS spent FROM orders GROUP BY customer_id\n  ) t\n);',
        rule: 'Subquery in WHERE/HAVING = a value or a list. In FROM = a table.',
        world: '“Above average” emails are this pattern.',
        mistake: 'Comparing to AVG(price) per ticket, not AVG of totals. Different question.',
        hint: 'Only Alice clears 6.83.',
      },
    ],
    practice: {
      title: 'Nest it, then name it',
      text: 'Build spend first. Then rank. Toggle subquery vs CTE. Add the “above average” filter. Same numbers both spellings.',
      sql: '',
      rule: 'Inside runs. Outside reads. Name it WITH if the inside is messy.',
      world: 'This is every “top N” widget.',
      mistake: 'LIMIT 3 without ORDER BY. Then top 3 is random.',
      hint: 'Top 3: Alice, Dave, Carol.',
    },
    master: {
      title: 'Prove you can nest',
      text: 'Above average. Rewrite as CTE. Then top 2 products by average rating with at least 2 reviews.',
      sql: 'WITH stats AS (\n  SELECT product_id, AVG(rating) AS avg_rating, COUNT(*) AS n\n  FROM reviews\n  GROUP BY product_id\n)\nSELECT products.name, stats.avg_rating\nFROM products\nINNER JOIN stats ON products.id = stats.product_id\nWHERE stats.n >= 2\nORDER BY stats.avg_rating DESC\nLIMIT 2;',
      rule: 'Intermediate table in the middle. Always.',
      world: 'Coffee has two reviews (5 and 4). Bagel has one. Muffin has zero.',
      mistake: 'Averaging products with one lonely review and calling it a ranking.',
      hint: 'Coffee avg 4.5 with 2 reviews. Bagel avg 3 with 1 review — dropped by n >= 2.',
    },
    questions: [
      {
        id: 'q1',
        kind: 'choice',
        prompt: 'Customers who spent more than the average of buyer totals. Who?',
        options: ['Alice', 'Alice and Dave', 'Everyone who ordered', 'Bob'],
        answer: 'Alice',
        why: 'Buyer totals 11.50, 5, 4. Average ≈ 6.83. Only Alice is over.',
      },
      {
        id: 'q2',
        kind: 'choice',
        prompt: 'Rewrite the inner spend table as a CTE. What is the first word?',
        options: ['SELECT', 'WITH', 'FROM', 'HAVING'],
        answer: 'WITH',
        why: 'WITH totals AS ( ... ) names the subquery. Then you SELECT from totals.',
      },
      {
        id: 'q3',
        kind: 'choice',
        prompt: 'Boss: top 2 products by average rating, only products with at least 2 reviews. What comes back?',
        options: ['Coffee then Bagel', 'Coffee only', 'Bagel then Coffee', 'Croissant then Coffee'],
        answer: 'Coffee only',
        why: 'Only Coffee has 2 reviews (5 and 4, avg 4.5). Bagel has 1. Limit 2 cannot invent a second product.',
      },
    ],
  },
  shopindex: {
    id: 'shopindex',
    explain: [
      {
        title: 'The search page is late',
        text: 'The owner types customer id 5 (Eve). Without an index the engine walks Alice, Bob, Carol, Dave, Eve. That is a table scan. Five rows feels fine. Five million does not. The CEO is angry about the million-row version of this.',
        sql: 'SELECT *\nFROM customers\nWHERE id = 5;',
        rule: 'No index: read rows until you find the one. That is a scan.',
        world: 'An 8-second search box is this walk, on a bigger table.',
        mistake: '“It is fast on my laptop with 5 rows” as a production plan.',
        hint: 'Blue crawls. Count the checks. Worst case is the last row.',
      },
      {
        title: 'A B-tree is a sorted map',
        text: 'Root: 1-2 | 3-4 | 5. Branches, then a leaf that holds Eve. Three jumps. That is an index seek. The tree is extra paper CREATE INDEX builds and keeps sorted.',
        sql: 'CREATE INDEX idx_customers_id ON customers(id);',
        rule: 'Seek walks a few nodes. Scan walks the heap.',
        world: 'A phone book: you do not start at A when you want Eve.',
        mistake: 'Indexing every column. Writes now update five trees.',
        hint: 'Seek checks stay at 3 even if you pick Alice or Eve.',
      },
      {
        title: 'Composite and covering',
        text: 'WHERE city = \'NYC\' AND joined_at < \'2024-02-01\' wants (city, joined_at) in that order. A covering index also includes the SELECT columns so the engine never visits the heap.',
        sql: 'CREATE INDEX idx_customers_city_joined\n  ON customers(city, joined_at);',
        rule: 'Leftmost column of a composite index must be in the lookup.',
        world: 'The January NYC promo query from lesson 10 is this index.',
        mistake: 'Index on (joined_at, city) then filter only city — the tree cannot start.',
        hint: 'Practice: turn the index off and the blue crawl comes back.',
      },
      {
        title: 'When NOT to index',
        text: 'Tiny tables. Columns that change every write. Queries that already return most rows. An index that is never used is a tax.',
        sql: '-- do not: CREATE INDEX idx_orders_price ON orders(price);\n-- if every report already reads the whole orders table',
        rule: 'Indexes speed reads and slow writes. Index what you search.',
        world: 'The CEO wanted speed. The intern indexed price, notes, and email. Checkouts got slower.',
        mistake: 'Adding an index, rewriting the query, adding a cache, and sharding all at once. Pick one.',
        hint: 'Boss: the WHERE is on id and id has no index. Add the index. Do not shard a 5-row table.',
      },
    ],
    practice: {
      title: 'Race scan vs seek',
      text: 'Pick an id. Toggle the index. Race. Composite mode shows a two-column lookup for the NYC January promo. Seek should still win.',
      sql: '',
      rule: 'Index on: 3 checks. Index off: up to 5.',
      world: 'This is EXPLAIN, with legs.',
      mistake: 'Declaring seek slower because the animation is prettier.',
      hint: 'Target 5 with index off is the slowest honest scan.',
    },
    master: {
      title: 'Prove you can choose',
      text: 'Scan vs seek. When not to index. Covering. Then pick the fix for a slow id lookup.',
      sql: 'CREATE INDEX idx_customers_id ON customers(id);',
      rule: 'Measure. Then index the column in WHERE. Then stop.',
      world: 'Most “8 second page” tickets die here, not in Kubernetes.',
      mistake: 'Sharding before you have an index.',
      hint: 'Covering = the index leaf has every column the SELECT needs.',
    },
    questions: [
      {
        id: 'q1',
        kind: 'choice',
        prompt: 'Which is faster for WHERE id = 5?',
        options: ['Table scan', 'Index seek', 'They are equal', 'FULL JOIN'],
        answer: 'Index seek',
        why: 'Seek jumps three nodes. Scan may read every row.',
      },
      {
        id: 'q2',
        kind: 'choice',
        prompt: 'When should you NOT add an index?',
        options: [
          'The column is in every WHERE',
          'The table is tiny, or you write far more than you search that column',
          'The CEO is angry',
          'The column is unique',
        ],
        answer: 'The table is tiny, or you write far more than you search that column',
        why: 'Indexes are extra writes. A 5-row table already fits in one page.',
      },
      {
        id: 'q3',
        kind: 'choice',
        prompt: 'What is a covering index?',
        options: [
          'An index on every column',
          'An index that contains all columns the query needs, so it never hits the heap',
          'A PRIMARY KEY',
          'A view',
        ],
        answer: 'An index that contains all columns the query needs, so it never hits the heap',
        why: 'The leaf answers SELECT without looking up the row.',
      },
      {
        id: 'q4',
        kind: 'fix',
        prompt: 'SELECT * FROM customers WHERE id = 5 is slow on a million rows. Best first fix?',
        options: [
          'Add an index on customers(id)',
          'Rewrite as a CROSS JOIN',
          'Add a cache and also shard',
          'Delete Eve',
        ],
        answer: 'Add an index on customers(id)',
        why: 'The lookup is a single id. That is a B-tree. Do not shard first.',
      },
    ],
  },
  tx: {
    id: 'tx',
    explain: [
      {
        title: 'Two tabs, one transfer',
        text: 'Alice’s store credit $100. Bob’s $30. The owner wants to move $50 from Alice to Bob. Two writes. If the app crashes after Alice is down and before Bob is up, $50 vanished. A transaction is a seatbelt around both writes.',
        sql: 'BEGIN;\n-- Alice 100 → 50\n-- Bob  30 → 80',
        rule: 'A transaction is a bundle of writes that all happen, or none do.',
        world: 'Checkout: deduct stock, create order, charge card. Same seatbelt.',
        mistake: 'Two naked UPDATEs and hoping the server stays up.',
        hint: 'Pending means the bundle is not finished. Other cashiers should not spend that $50 yet.',
      },
      {
        title: 'COMMIT keeps it',
        text: 'Click transfer. Money flies. Pending badge. COMMIT: Alice $50, Bob $80, log says done. The bundle became the truth.',
        sql: 'BEGIN;\nUPDATE tabs SET credit = credit - 50 WHERE name = \'Alice\';\nUPDATE tabs SET credit = credit + 50 WHERE name = \'Bob\';\nCOMMIT;',
        rule: 'COMMIT makes the bundle permanent.',
        world: 'The receipt printer fires after COMMIT, not before.',
        mistake: 'Showing “Paid!” on the screen before COMMIT. The crash still rolls back.',
        hint: 'Watch the log: BEGIN, two writes, COMMIT.',
      },
      {
        title: 'ROLLBACK undoes it',
        text: 'Transfer again. Then ROLLBACK. Money flies home. Alice $100, Bob $30. As if the click never happened. Use this when the card charge fails, or the cashier fat-fingers.',
        sql: 'BEGIN;\nUPDATE tabs SET credit = credit - 50 WHERE name = \'Alice\';\nROLLBACK;',
        rule: 'ROLLBACK throws the bundle away.',
        world: 'Payment gateway 500s: rollback stock and order, or you gave away muffins.',
        mistake: 'Rollback after you already emailed “you are charged.” The customer now has a ghost receipt.',
        hint: 'Practice: commit one transfer, rollback the next. Read the log.',
      },
      {
        title: 'ACID and dirty reads',
        text: 'Atomic, Consistent, Isolated, Durable. Isolation is about what another cashier sees while you are pending. A dirty read is seeing Alice at $50 before you COMMIT — money that might fly back. Toggle isolation in practice.',
        sql: '-- isolation: don\'t let cashier 2 see uncommitted Alice=50',
        rule: 'Dirty read = seeing a write that might still ROLLBACK.',
        world: 'Two cashiers, one gift card. Isolation is who is allowed to peek.',
        mistake: 'READ UNCOMMITTED in a ledger. You will double-spend.',
        hint: 'Boss: deduct stock, insert order, charge. One BEGIN. One COMMIT. Any fail → ROLLBACK.',
      },
    ],
    practice: {
      title: 'Move money. Keep it or take it back.',
      text: 'Transfer $50. COMMIT or ROLLBACK. Watch the log. Toggle dirty reads to see cashier 2’s view during pending.',
      sql: '',
      rule: 'Pending is not truth. COMMIT is. ROLLBACK is the undo.',
      world: 'This is every checkout you trust.',
      mistake: 'Starting a second transfer while the first is pending. Wait, then commit or roll back.',
      hint: 'If dirty reads are on, cashier 2 sees the in-flight balances.',
    },
    master: {
      title: 'Prove you can keep money safe',
      text: 'ACID. When to rollback. Dirty reads. Then design checkout: stock, order, charge — all or nothing.',
      sql: 'BEGIN;\n-- deduct stock\n-- create order\n-- charge card\nCOMMIT;\n-- if any step fails: ROLLBACK;',
      rule: 'All succeed or all fail. That is atomic.',
      world: 'If charge fails after stock deducted, rollback or you have a ghost inventory hole.',
      mistake: 'Three scripts, no transaction, a cron “to fix leftovers.”',
      hint: 'ACID: Atomic Consistent Isolated Durable.',
    },
    questions: [
      {
        id: 'q1',
        kind: 'choice',
        prompt: 'What does ACID stand for?',
        options: [
          'Atomic, Consistent, Isolated, Durable',
          'Add, Copy, Index, Delete',
          'Alice, Carol, Inner, Dave',
          'Always Commit If Done',
        ],
        answer: 'Atomic, Consistent, Isolated, Durable',
        why: 'The four promises a real database makes around a transaction.',
      },
      {
        id: 'q2',
        kind: 'choice',
        prompt: 'When would you ROLLBACK instead of COMMIT?',
        options: [
          'The transfer looks good',
          'The second write failed, or you changed your mind before the bundle is truth',
          'Every night at midnight',
          'When SELECT is slow',
        ],
        answer: 'The second write failed, or you changed your mind before the bundle is truth',
        why: 'Rollback is the undo for an unfinished bundle. After COMMIT there is nothing to roll back but a new opposite transaction.',
      },
      {
        id: 'q3',
        kind: 'choice',
        prompt: 'What is a dirty read?',
        options: [
          'Reading NULL',
          'Seeing another transaction’s uncommitted write, which might still roll back',
          'A table scan',
          'OR instead of AND',
        ],
        answer: 'Seeing another transaction’s uncommitted write, which might still roll back',
        why: 'You saw Alice at $50. Then she rolled back. You just made a decision on ghost money.',
      },
      {
        id: 'q4',
        kind: 'choice',
        prompt: 'Boss: checkout must deduct stock, create the order, and charge the card. All succeed or all fail. How?',
        options: [
          'Three separate scripts',
          'BEGIN, three writes, COMMIT — ROLLBACK if any step fails',
          'Charge first, hope stock exists',
          'Only index the products table',
        ],
        answer: 'BEGIN, three writes, COMMIT — ROLLBACK if any step fails',
        why: 'That is atomic. Any hole in the middle leaves money, muffins, or receipts wrong.',
      },
    ],
  },
};

export function joinSql(kind: ShopJoinKind) {
  const join =
    kind === 'inner'
      ? 'INNER JOIN'
      : kind === 'right'
        ? 'RIGHT JOIN'
        : kind === 'full'
          ? 'FULL OUTER JOIN'
          : 'LEFT JOIN';
  return `SELECT customers.name, orders.item, orders.price\nFROM customers\n${join} orders\n  ON customers.id = orders.customer_id;`;
}

export function groupSql(key: 'city' | 'category', having: number) {
  if (key === 'city') {
    return `SELECT customers.city, COUNT(*) AS n, SUM(orders.price) AS spent\nFROM customers\nINNER JOIN orders\n  ON customers.id = orders.customer_id\nGROUP BY customers.city\nHAVING COUNT(*) >= ${having};`;
  }
  return `SELECT products.category, COUNT(*) AS n, AVG(orders.price) AS avg_price\nFROM orders\nINNER JOIN products\n  ON orders.item = products.name\nGROUP BY products.category\nHAVING COUNT(*) >= ${having};`;
}

export function subquerySql(asCte: boolean, aboveAvg: boolean) {
  const inner = `SELECT customer_id, SUM(price) AS spent\n  FROM orders\n  GROUP BY customer_id`;
  const having = aboveAvg
    ? `\nHAVING SUM(price) > (\n  SELECT AVG(spent) FROM (\n    ${inner}\n  ) t\n)`
    : '';
  if (asCte) {
    return `WITH totals AS (\n  ${inner}${having}\n)\nSELECT customers.name, totals.spent\nFROM customers\nINNER JOIN totals\n  ON customers.id = totals.customer_id\nORDER BY totals.spent DESC\nLIMIT 3;`;
  }
  return `SELECT customers.name, totals.spent\nFROM customers\nINNER JOIN (\n  ${inner}${having}\n) totals\n  ON customers.id = totals.customer_id\nORDER BY totals.spent DESC\nLIMIT 3;`;
}
