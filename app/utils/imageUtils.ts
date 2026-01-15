export function getImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
  const cleanApiUrl = apiUrl.endsWith("/") ? apiUrl.slice(0, -1) : apiUrl;
  let cleanPath = path.startsWith("/") ? path : `/${path}`;

  if (cleanPath.startsWith("/uploads")) {
    cleanPath = `/api${cleanPath}`;
  }

  return `${cleanApiUrl}${cleanPath}`;
}
