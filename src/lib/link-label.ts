// Project links point at GitHub repos, app stores, or live sites; label them by destination.
export function getProjectLinkLabel(link: string) {
  try {
    const host = new URL(link).hostname.replace(/^www\./, "");
    if (host === "github.com") return "View on GitHub";
    if (host === "play.google.com") return "View on Google Play";
    if (host === "apps.apple.com") return "View on the App Store";
  } catch {
    // Fall through to the generic label.
  }
  return "Visit project";
}
