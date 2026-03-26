/**
 * Validate that required fields are present in a body/object.
 * Returns an array of missing field names.
 */
export function requireFields(obj, fields) {
  return fields.filter(
    (f) => obj[f] === undefined || obj[f] === null || String(obj[f]).trim() === ""
  );
}

/**
 * Validate latitude/longitude values
 */
export function isValidLatLng(lat, lng) {
  const la = parseFloat(lat);
  const lo = parseFloat(lng);
  return !isNaN(la) && !isNaN(lo) && la >= -90 && la <= 90 && lo >= -180 && lo <= 180;
}

/**
 * Validate that a date string is a valid ISO datetime
 */
export function isValidDate(dateStr) {
  const d = new Date(dateStr);
  return !isNaN(d.getTime());
}

/**
 * Parse pagination params with sane defaults
 */
export function parsePagination(query) {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}
