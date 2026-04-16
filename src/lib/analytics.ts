type CopyEvent = {
  page: string;
  source: string;
  stringType: "counter-type" | "counter-team" | "meta" | "team" | "squad" | "league" | "ranker";
};

export function trackCopy(event: CopyEvent) {
  if (typeof window === "undefined") return;
  try {
    // Log locally for now — swap to PostHog/self-hosted when ready
    console.debug("[analytics:copy]", event);
    // Future: posthog.capture("copy_search_string", event);
  } catch {
    // Never block the UI for analytics
  }
}
