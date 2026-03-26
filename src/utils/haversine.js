/**
 * Haversine formula – calculates great-circle distance in km
 */
export function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // km
}

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

/**
 * Bounding box to pre-filter rows before Haversine (SQL optimisation)
 * @param {number} lat - centre latitude
 * @param {number} lng - centre longitude
 * @param {number} radiusKm - radius in km
 * @returns {{ minLat, maxLat, minLng, maxLng }}
 */
export function getBoundingBox(lat, lng, radiusKm) {
  const latDelta = radiusKm / 111; // 1° lat ≈ 111 km
  const lngDelta = radiusKm / (111 * Math.cos(toRad(lat)));
  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLng: lng - lngDelta,
    maxLng: lng + lngDelta,
  };
}
