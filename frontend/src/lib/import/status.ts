export const CARD_STYLE_OPTIONS = [
  { value: "concise", label: "Concise" },
  { value: "detailed", label: "Detailed" },
  { value: "simple", label: "Simple" },
  { value: "academic", label: "Academic" },
];

export const IMPORT_STATUS_COPY: Record<
  string,
  { label: string; description: string }
> = {
  pending: {
    label: "Queued",
    description: "The backend has accepted the file and is preparing it.",
  },
  processing: {
    label: "Generating",
    description: "Text is being extracted and converted into flashcards.",
  },
  completed: {
    label: "Deck ready",
    description: "Your flashcards and Anki package are ready.",
  },
  failed: {
    label: "Needs attention",
    description: "The import could not finish. Review the error below.",
  },
};

export function getImportStatusCopy(status: string) {
  return (
    IMPORT_STATUS_COPY[status] || {
      label: status,
      description: "The import status was updated by the backend.",
    }
  );
}
