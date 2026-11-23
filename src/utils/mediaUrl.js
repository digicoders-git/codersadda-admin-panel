/**
 * Resolves media URLs (images, videos, thumbnails) to full accessible URLs.
 */
export const getMediaUrl = (url) => {
  if (!url) return "";
  if (typeof url === "object") {
    url = url.url || url.localUrl || "";
  }
  if (typeof url !== "string") return "";

  let trimmed = url.trim();
  if (!trimmed) return "";

  // Fix old or dev hostnames
  if (
    trimmed.includes("localhost") ||
    trimmed.includes("127.0.0.1") ||
    trimmed.includes("onrender.com")
  ) {
    trimmed = trimmed.replace(
      /https?:\/\/[^\/]+/,
      "https://api.codersadda.com"
    );
  }

  // Ensure HTTPS for api.codersadda.com
  if (trimmed.startsWith("http://api.codersadda.com")) {
    trimmed = trimmed.replace("http://", "https://");
  }

  // Already a full external URL
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  // Relative path (e.g. /uploads/courses/thumbnails/...)
  const baseUrl = "https://api.codersadda.com";
  return trimmed.startsWith("/") ? `${baseUrl}${trimmed}` : `${baseUrl}/${trimmed}`;
};

export default getMediaUrl;
