export function percent(a, b) {
    if (typeof a !== 'undefined' && Number.isFinite(a) && b) {
        return `${Number((a / b) * 100).toFixed(1)}%`;
    }
    return 'N/A';
}