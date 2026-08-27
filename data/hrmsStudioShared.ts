/** Shared block types for HRMS deep studios. */

export type HrmsStudioBlock =
  | { type: 'h3'; text: string }
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'pre'; lines: string; caption?: string }
  | { type: 'kid'; text?: string; items?: string[] }
  | { type: 'callout'; lines: string[] }
  | { type: 'table'; columns: string[]; rows: string[][] }
  | {
      type: 'compare';
      title?: string;
      columns: string[];
      rows: string[][];
    }
  | {
      type: 'route';
      method: string;
      path: string;
      gate: string;
      purpose: string;
      notes?: string[];
    };

export interface HrmsStudioChapter {
  id: string;
  label: string;
  title: string;
  lead: string;
  files?: string[];
  blocks: HrmsStudioBlock[];
}

export interface HrmsStudioMeta {
  id: string;
  brand: string;
  title: string;
  subtitle: string;
  mapPath: string;
  noteSlug: string;
  chapters: HrmsStudioChapter[];
}
