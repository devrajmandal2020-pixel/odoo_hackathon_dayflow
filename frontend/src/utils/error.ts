export function getErrorMessage(error: any, fallback: string = 'An error occurred'): string {
  const detail = error.response?.data?.detail;
  if (typeof detail === 'string') {
    return detail;
  }
  if (Array.isArray(detail)) {
    return detail[0]?.msg || fallback;
  }
  if (detail && typeof detail === 'object') {
    return (detail as any).message || fallback;
  }
  return error.message || fallback;
}
