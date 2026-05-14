export const ACCEPTED_IMPORT_FILE_TYPES = ["application/pdf", "text/plain"];
export const MAX_IMPORT_FILE_SIZE_MB = 20;
export const MAX_IMPORT_FILE_SIZE_BYTES = MAX_IMPORT_FILE_SIZE_MB * 1024 * 1024;

export function isSupportedStudyFile(candidate: File) {
  const fileName = candidate.name.toLowerCase();
  return (
    fileName.endsWith(".pdf") ||
    fileName.endsWith(".txt") ||
    ACCEPTED_IMPORT_FILE_TYPES.includes(candidate.type)
  );
}

export function isWithinImportSizeLimit(candidate: File) {
  return candidate.size <= MAX_IMPORT_FILE_SIZE_BYTES;
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const kilobytes = bytes / 1024;
  if (kilobytes < 1024) return `${kilobytes.toFixed(1)} KB`;
  return `${(kilobytes / 1024).toFixed(1)} MB`;
}

export function getDefaultDeckTitle(filename: string) {
  return filename
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .trim();
}
