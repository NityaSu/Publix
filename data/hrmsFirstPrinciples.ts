/**
 * HRMS First Principles — map nodes only.
 * Click a node → its Studio (deep dive from real hrms_api).
 * Visual pattern mirrors Backend From First Principles (force map, no notes panel).
 */

export type HrmsClusterId = 'gate' | 'contract' | 'speed' | 'data';

export interface HrmsCluster {
  id: HrmsClusterId;
  label: string;
  blurb: string;
}

export interface HrmsTopic {
  id: string;
  n: number;
  title: string;
  label: string;
  cluster: HrmsClusterId;
  gist: string;
  /** Studio route opened on node click. */
  studioPath: string;
}

export interface HrmsEdge {
  from: string;
  to: string;
}

export const hrmsClusters: HrmsCluster[] = [
  {
    id: 'gate',
    label: 'The gate',
    blurb: 'Who are you, and what are you allowed to do.',
  },
  {
    id: 'contract',
    label: 'The contract',
    blurb: 'How the API answers — status + envelope.',
  },
  {
    id: 'speed',
    label: 'The cache',
    blurb: 'Redis in front of expensive permission checks.',
  },
  {
    id: 'data',
    label: 'The data',
    blurb: 'Tables and FKs every feature hangs on.',
  },
];

export const hrmsTopics: HrmsTopic[] = [
  {
    id: 'authn',
    n: 1,
    title: 'AuthN — prove who you are',
    label: 'AuthN',
    cluster: 'gate',
    gist: 'JWT doors, secrets, claims, Bearer header — identity before permission.',
    studioPath: '/insights/notes/hrms/authn',
  },
  {
    id: 'guards',
    n: 3,
    title: 'Guards — route protection & middleware',
    label: 'Guards',
    cluster: 'gate',
    gist: 'Vue beforeEach, Axios Bearer, Gin AuthN/AuthZ. JWT in localStorage — not a cookie.',
    studioPath: '/insights/notes/hrms/guards',
  },
  {
    id: 'authz',
    n: 2,
    title: 'AuthZ — what you may do',
    label: 'AuthZ',
    cluster: 'gate',
    gist: 'Resource × action, RBAC joins, route gates across admin and client.',
    studioPath: '/insights/notes/hrms/authz',
  },
  {
    id: 'status',
    n: 4,
    title: 'Status & response envelope',
    label: 'Status',
    cluster: 'contract',
    gist: 'HTTP codes, ResponseDTO, RespOK / RespErr — every vein of the reply.',
    studioPath: '/insights/notes/hrms/status',
  },
  {
    id: 'redis',
    n: 5,
    title: 'Redis — permission cache & sessions',
    label: 'Redis',
    cluster: 'speed',
    gist: 'Keys, TTL, cache miss → DB, session helpers that login does not use.',
    studioPath: '/insights/notes/hrms/redis',
  },
  {
    id: 'schema',
    n: 6,
    title: 'Schema Studio',
    label: 'Schema',
    cluster: 'data',
    gist: 'Interactive ERD from real hrms_api models.',
    studioPath: '/insights/notes/hrms/schema',
  },
];

/** Extra relates edges (sequential THEN edges come from topic order). */
export const hrmsGraphEdges: HrmsEdge[] = [
  { from: 'authn', to: 'authz' },
  { from: 'authn', to: 'guards' },
  { from: 'authz', to: 'guards' },
  { from: 'guards', to: 'status' },
  { from: 'authz', to: 'redis' },
  { from: 'authn', to: 'status' },
  { from: 'authz', to: 'status' },
  { from: 'authz', to: 'schema' },
  { from: 'redis', to: 'schema' },
];

export const hrmsTopicsInOrder = [...hrmsTopics].sort((a, b) => a.n - b.n);

export function hrmsTopicById(id: string) {
  return hrmsTopics.find((t) => t.id === id);
}

export function hrmsNeighborTopics(id: string) {
  const i = hrmsTopicsInOrder.findIndex((t) => t.id === id);
  if (i < 0) return { prev: null, next: null };
  return {
    prev: i > 0 ? hrmsTopicsInOrder[i - 1]! : null,
    next: i < hrmsTopicsInOrder.length - 1 ? hrmsTopicsInOrder[i + 1]! : null,
  };
}
