export const getClerkErrorMessage = (err: any): string => {
  if (err?.errors && Array.isArray(err.errors)) {
    return err.errors.map((e: any) => e.longMessage || e.message).join("\n");
  }
  return err?.message || "An unexpected error occurred.";
};
