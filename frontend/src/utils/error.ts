export function getErrorMessage(error: any, fallback: string = 'An error occurred'): string {
  const detail = error.response?.data?.detail;
  if (typeof detail === 'string') {
    return detail;
  }
  if (Array.isArray(detail)) {
    const err = detail[0];
    const field = err?.loc ? err.loc[err.loc.length - 1] : '';
    const msg = err?.msg || '';
    if ((msg.toLowerCase() === 'field required' || err?.type === 'missing') && field) {
      return `Field required: ${field}`;
    }
    return msg || fallback;
  }
  if (detail && typeof detail === 'object') {
    return (detail as any).message || fallback;
  }
  return error.message || fallback;
}
