import { assertNoteSlug, getViewCount, viewPayload } from '../../utils/views';

export default defineEventHandler(async (event) => {
  const slug = assertNoteSlug(getRouterParam(event, 'slug') ?? '');
  const views = await getViewCount(slug);
  return viewPayload(slug, views);
});
