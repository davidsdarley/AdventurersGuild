// AI-assisted: see AI-ATTRIBUTION.md
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString()
}

export function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err)
}
