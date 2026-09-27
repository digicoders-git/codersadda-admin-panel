/**
 * Resolves media URLs (images, videos, thumbnails) to full accessible URLs.
 */
export const getMediaUrl = (url) => {
  if (!url || typeof url !== "string") return "";

  const trimmed = url.trim();
  if (!trimmed) return "";

  // Already a full external URL
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    // Fix any localhost:3900 URLs saved during local dev
    if (trimmed.includes("localhost:3900") || trimmed.includes("127.0.0.1:3900")) {
      return trimmed.replace(/http:\/\/(localhost|127\.0\.0\.1):3900/, "https://api.codersadda.com");
    }
    return trimmed;
  }

  // Relative path (e.g. /uploads/courses/thumbnails/...)
  const baseUrl = "https://api.codersadda.com";
  return trimmed.startsWith("/") ? `${baseUrl}${trimmed}` : `${baseUrl}/${trimmed}`;
};

export default getMediaUrl;
