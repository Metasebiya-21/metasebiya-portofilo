import { revalidatePath, revalidateTag } from "next/cache";
import { getCacheClient } from "@/lib/cache";
import { PORTFOLIO_CACHE_TAG } from "@/lib/portfolio-store";

const PROFILE_CACHE_KEY = "portfolio:profile";
const EXPERIENCES_CACHE_KEY = "portfolio:experiences";
const PROJECTS_CACHE_KEY = "portfolio:projects";
const SKILLS_CACHE_KEY = "portfolio:skills";
const SKILL_DETAILS_CACHE_KEY = "portfolio:skill-details";

export async function invalidatePortfolioCache(options?: { profile?: boolean; experiences?: boolean; projects?: boolean; skills?: boolean }) {
  const profile = options?.profile ?? false;
  const experiences = options?.experiences ?? false;
  const projects = options?.projects ?? false;
  const skills = options?.skills ?? false;

  const cache = getCacheClient();
  if (cache) {
    const keys: string[] = [];
    if (profile) keys.push(PROFILE_CACHE_KEY);
    if (experiences) keys.push(EXPERIENCES_CACHE_KEY);
    if (projects) keys.push(PROJECTS_CACHE_KEY);
    if (skills) keys.push(SKILLS_CACHE_KEY);
    if (skills) keys.push(SKILL_DETAILS_CACHE_KEY);
    if (keys.length) {
      try {
        await cache.del(...keys);
      } catch {
        // Ignore cache deletion errors.
      }
    }
  }

  // Portfolio data feeds every public page (detail pages, resume, chat context),
  // so expire all unstable_cache entries and re-render the whole site.
  if (profile || projects || experiences || skills) {
    revalidateTag(PORTFOLIO_CACHE_TAG, { expire: 0 });
    revalidatePath("/", "layout");
  }
}
