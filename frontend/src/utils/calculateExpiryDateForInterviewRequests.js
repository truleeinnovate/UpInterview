const SLA_CONFIG = require("../config");

function getSlaHours(timeLeftHours) {
  for (const rule of SLA_CONFIG.SCHEDULED_SLA_RULES) {
    if (timeLeftHours > rule.minHoursLeft) {
      return rule.acceptHours;
    }
  }
  return SLA_CONFIG.DEFAULT_ACCEPT_HOURS;
}

function calculateExpiryDate(interviewDateTime) {
  const now = new Date();
  const timeLeftMinutes = (interviewDateTime - now) / (1000 * 60);
  const timeLeftHours = timeLeftMinutes / 60;

  const isInstant = timeLeftMinutes <= 20 && timeLeftMinutes > 0;

  console.log("interviewDateTime", interviewDateTime);

  if (isInstant) {
    return new Date(
      interviewDateTime.getTime() -
        SLA_CONFIG.INSTANT_EXPIRE_BEFORE_MINUTES * 60 * 1000
    );
  }

  const slaHours = getSlaHours(timeLeftHours);
  return new Date(now.getTime() + slaHours * 60 * 60 * 1000);
}

module.exports = { calculateExpiryDate };
