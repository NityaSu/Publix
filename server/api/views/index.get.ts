import { getViewCounts } from '../../utils/views';
import { formatViewCount } from '~/utils/views';

export default defineEventHandler(async () => {
  const views = await getViewCounts();
  const formatted = Object.fromEntries(
    Object.entries(views).map(([slug, count]) => [slug, formatViewCount(count)]),
  );
  return { views, formatted };
});
