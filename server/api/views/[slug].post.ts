import { assertNoteSlug, incrementViewCount, viewPayload } from '../../utils/views';

export default defineEventHandler(async (event) => {
  const slug = assertNoteSlug(getRouterParam(event, 'slug') ?? '');
  const views = await incrementViewCount(slug);
  return viewPayload(slug, views);
});
