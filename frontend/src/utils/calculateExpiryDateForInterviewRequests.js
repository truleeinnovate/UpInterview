const { config: SLA_CONFIG } = require("../config");


function getSlaHours(timeLeftHours) {
  // ✅ SAFETY: ensure iterable
  const rules = Array.isArray(SLA_CONFIG?.SCHEDULED_SLA_RULES)
    ? SLA_CONFIG.SCHEDULED_SLA_RULES
    : [];

  for (const rule of rules) {
    if (timeLeftHours > rule.minHoursLeft) {
      return rule.acceptHours;
    }
  }

  // ✅ SAFETY: fallback default
  return SLA_CONFIG?.DEFAULT_ACCEPT_HOURS ?? 24;
}

function calculateExpiryDate(interviewDateTime) {
  const now = new Date();
  const timeLeftMinutes = (interviewDateTime - now) / (1000 * 60);
  const timeLeftHours = timeLeftMinutes / 60;

  const isInstant = timeLeftMinutes <= 20 && timeLeftMinutes > 0;

  // ✅ Instant interview expiry logic (unchanged)
  if (isInstant) {
    return new Date(
      interviewDateTime.getTime() -
      (SLA_CONFIG?.INSTANT_EXPIRE_BEFORE_MINUTES ?? 10) * 60 * 1000
    );
  }

  const slaHours = getSlaHours(timeLeftHours);

  // ✅ Final expiry calculation
  const calculatedExpiry = new Date(now.getTime() + slaHours * 60 * 60 * 1000);

  // ✅ SAFETY: expiry must never exceed the interview start time
  // If the SLA accept window goes past the interview time, cap it
  if (calculatedExpiry >= interviewDateTime) {
    return new Date(interviewDateTime.getTime());
  }

  return calculatedExpiry;
}

module.exports = { calculateExpiryDate };
