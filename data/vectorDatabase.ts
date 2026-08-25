export type VecCategory = 'food' | 'tech' | 'travel';

export interface VecDoc {
  id: number;
  text: string;
  category: VecCategory;
  /** Design coords on a 600×320 canvas — scaled at draw time. */
  x: number;
  y: number;
}

export interface VecStep {
  label: string;
  title: string;
  text: string;
  sql: string;
  insight: string;
  hint: string;
  nextLabel: string;
  searchTime: string;
}

export interface VecQuiz {
  q: string;
  options: string[];
  answer: string;
  explain: string;
}

/** Category colors aligned with Docker kids / State in Viz. */
export const VEC_CAT_COLORS: Record<VecCategory, string> = {
  food: '#4A9EFF',
  tech: '#8b7cff',
  travel: '#e6a817',
};

export const VEC_QUERY_COLOR = '#7B2D8E';
export const VEC_LINE = 'rgba(139, 124, 255, 0.35)';
export const VEC_NEAREST = '#8b7cff';

export const vecDocs: VecDoc[] = [
  { id: 1, text: 'Best pizza in Brooklyn', category: 'food', x: 120, y: 80 },
  { id: 2, text: 'Top-rated slice shop NYC', category: 'food', x: 140, y: 95 },
  { id: 3, text: 'Homemade pasta recipe', category: 'food', x: 100, y: 110 },
  { id: 4, text: 'Sushi guide for beginners', category: 'food', x: 160, y: 70 },
  { id: 5, text: 'Chocolate cake baking tips', category: 'food', x: 90, y: 90 },
  { id: 6, text: 'React hooks tutorial', category: 'tech', x: 420, y: 200 },
  { id: 7, text: 'Python data structures', category: 'tech', x: 450, y: 180 },
  { id: 8, text: 'Docker container basics', category: 'tech', x: 400, y: 220 },
  { id: 9, text: 'Machine learning intro', category: 'tech', x: 480, y: 190 },
  { id: 10, text: 'Git workflow best practices', category: 'tech', x: 430, y: 240 },
  { id: 11, text: 'Hidden beaches in Thailand', category: 'travel', x: 280, y: 50 },
  { id: 12, text: 'Budget travel Europe 2024', category: 'travel', x: 300, y: 70 },
  { id: 13, text: 'Tokyo cherry blossom guide', category: 'travel', x: 260, y: 40 },
  { id: 14, text: 'Solo backpacking tips', category: 'travel', x: 320, y: 60 },
  { id: 15, text: 'Weekend getaway ideas', category: 'travel', x: 290, y: 80 },
];

export const vecSteps: VecStep[] = [
  {
    label: 'Step 1: Documents live as points in space',
    title: 'What is a vector database?',
    text: 'Instead of searching by exact keywords, a vector database turns every document into a list of numbers — a vector — and finds the closest ones to your query. On the left, each dot is a document. Blue = food. Purple = tech. Gold = travel. Similar documents cluster together.',
    sql: `<span class="sql-kw">SELECT</span> id, text, <span class="sql-fn">cosine_distance</span>(embedding, <span class="sql-fn">query_embedding</span>()) <span class="sql-kw">AS</span> dist
<span class="sql-kw">FROM</span> documents
<span class="sql-kw">ORDER BY</span> dist <span class="sql-kw">ASC</span>
<span class="sql-kw">LIMIT</span> 5;`,
    insight:
      '<strong>The magic:</strong> "Best pizza in Brooklyn" and "Top-rated slice shop NYC" have zero words in common. But their vectors are neighbors in space. A vector database finds meaning, not just matches.',
    hint: 'Look at the clusters. Food docs are on the left. Tech docs on the right. Travel at the top. The database did not read the text — it only sees numbers.',
    nextLabel: 'Place a query',
    searchTime: '—',
  },
  {
    label: 'Step 2: Click anywhere to place your query',
    title: 'Your query becomes a vector too',
    text: 'When you search, your query text is also converted into a vector using the same model. The database then measures distance between your query vector and every document vector. Click anywhere on the canvas to place a query.',
    sql: `<span class="sql-kw">SELECT</span> id, text, <span class="sql-fn">cosine_distance</span>(embedding, <span class="sql-fn">query_embedding</span>(<span class="sql-str">'best pizza'</span>)) <span class="sql-kw">AS</span> dist
<span class="sql-kw">FROM</span> documents
<span class="sql-kw">ORDER BY</span> dist <span class="sql-kw">ASC</span>
<span class="sql-kw">LIMIT</span> 5;`,
    insight:
      'The query "best pizza" gets turned into a vector like [0.12, -0.05, 0.88, …]. The database never sees the word "pizza" — it only compares numbers.',
    hint: 'Click near the blue cluster (food) to see food results. Click near purple for tech. The closest dots will connect to your query with lines.',
    nextLabel: 'Next step',
    searchTime: '12ms',
  },
  {
    label: 'Step 3: Distance = similarity',
    title: 'How the database measures "closeness"',
    text: 'The database computes distance between your query vector and every document vector. Smaller distance = more similar. The most common metric is cosine similarity — it measures the angle between two vectors, ignoring their length.',
    sql: `<span class="sql-kw">SELECT</span> id, text, <span class="sql-fn">1 - cosine_similarity</span>(embedding, query_vec) <span class="sql-kw">AS</span> dist
<span class="sql-kw">FROM</span> documents
<span class="sql-kw">ORDER BY</span> dist <span class="sql-kw">ASC</span>
<span class="sql-kw">LIMIT</span> 5;`,
    insight:
      '<strong>Cosine similarity</strong> cares about direction, not magnitude. "Pizza" and "large pizza" point in the same direction even if one is longer. <strong>Euclidean distance</strong> cares about absolute position — better for image embeddings.',
    hint: 'Look at the line lengths. Shorter lines = closer = more similar. The top 5 results are ranked by distance in the list below.',
    nextLabel: 'Why this is hard',
    searchTime: '12ms',
  },
  {
    label: 'Step 4: Brute force vs. approximate search',
    title: 'Why vector databases need special indexes',
    text: 'With 15 documents, checking every distance is fast. But with 1 million documents, brute force takes forever. Vector databases use approximate indexes like HNSW or IVF to skip far-away vectors without checking them.',
    sql: `<span class="sql-kw">CREATE INDEX</span> <span class="sql-fn">hnsw_idx</span> <span class="sql-kw">ON</span> documents
<span class="sql-kw">USING</span> hnsw (embedding vector_cosine_ops);`,
    insight:
      'HNSW (Hierarchical Navigable Small World) builds a graph where each node connects to its nearest neighbors. Searching is like asking for directions: hop from node to node, getting closer each time. It is 100× faster with ~99% accuracy.',
    hint: 'In the Practice tab, you can toggle between "Brute force" and "HNSW approximate" to see how the index changes search time.',
    nextLabel: 'Go to Practice',
    searchTime: '0.3ms',
  },
];

export const vecQuizzes: VecQuiz[] = [
  {
    q: 'What does a vector database measure between documents?',
    options: ['Word count', 'Vector distance', 'Character length', 'File size'],
    answer: 'Vector distance',
    explain: 'It embeds text as vectors, then ranks by distance (or similarity) in that space.',
  },
  {
    q: 'Two documents with zero shared words can still be similar because...',
    options: [
      'They have the same font',
      'Their vectors point in similar directions',
      'They are the same file type',
      'They were created on the same day',
    ],
    answer: 'Their vectors point in similar directions',
    explain: 'Embeddings capture meaning. Neighbors in vector space can share almost no surface words.',
  },
  {
    q: 'Why do vector databases need special indexes like HNSW?',
    options: [
      'To store more colors',
      'Brute force is too slow at scale',
      'They compress images',
      'They encrypt the data',
    ],
    answer: 'Brute force is too slow at scale',
    explain: 'Comparing a query to every row is fine for dozens of docs — not for millions.',
  },
  {
    q: 'Cosine similarity measures the ___ between two vectors.',
    options: ['Length difference', 'Angle', 'Area', 'Volume'],
    answer: 'Angle',
    explain: 'Cosine ignores magnitude and cares about direction (the angle between vectors).',
  },
];
