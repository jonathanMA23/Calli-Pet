-- Consultas de comprobación

SELECT status, COUNT(*) AS total
FROM bookings
GROUP BY status;

SELECT
  COALESCE(SUM(amount), 0) AS ingresos_brutos,
  COALESCE(SUM(commission_amount), 0) AS comisiones
FROM payments
WHERE status = 'pagado';

SELECT
  p.commercial_name,
  COUNT(b.id) AS reservas,
  ROUND(AVG(r.rating)::numeric, 2) AS calificacion
FROM providers p
LEFT JOIN bookings b ON b.provider_id = p.id
LEFT JOIN reviews r ON r.provider_id = p.id
GROUP BY p.id, p.commercial_name;
