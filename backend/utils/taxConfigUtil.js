const Tenant = require("../models/Tenant");
const { RegionalTaxConfig } = require("../models/RegionalTaxConfig");

// Helper to normalize percentage-like values from config.
// Accepts either 0.18 (fraction) or 18 (percent) and always returns "percent" units.
function normalizePercentage(value) {
  const num = Number(value || 0);
  if (!isFinite(num) || num <= 0) return 0;
  // Treat values <= 1 as fractions (e.g. 0.18 => 18%)
  return num <= 1 ? num * 100 : num;
}

// Common helper to compute GST amount and gross amount from a base amount and GST rate.
// All rates are expected in percent units (e.g. 18 = 18%).
function computeBaseGstGross(baseAmount, gstRatePercent) {
  const base = Number(baseAmount || 0);
  const rate = typeof gstRatePercent === "number" ? gstRatePercent : 0;

  if (!isFinite(base) || base <= 0) {
    return { baseAmount: 0, gstAmount: 0, grossAmount: 0 };
  }

  if (!isFinite(rate) || rate <= 0) {
    return { baseAmount: base, gstAmount: 0, grossAmount: base };
  }

  const gstAmount = Math.round(((base * rate) / 100) * 100) / 100;
  const grossAmount = Math.round((base + gstAmount) * 100) / 100;

  return { baseAmount: base, gstAmount, grossAmount };
}

/**
 * Resolve regionCode and currencyCode for a tenant.
 *
 * This helper centralizes how we derive geographic and currency context for
 * pricing/tax lookups based on the Tenant document.
 */
async function resolveTenantRegionAndCurrency(
  tenantId,
  defaultRegionCode = "IN",
  defaultCurrencyCode = "INR"
) {
  let regionCode = defaultRegionCode;
  let currencyCode = defaultCurrencyCode;

  if (!tenantId) {
    return { regionCode, currencyCode };
  }

  try {
    const tenantDoc = await Tenant.findById(tenantId).lean();
    if (tenantDoc) {
      if (tenantDoc.regionCode) {
        regionCode = tenantDoc.regionCode;
      } else if (tenantDoc.country) {
        // Fallback: use country as region code if explicit regionCode not set
        regionCode = tenantDoc.country;
      }

      if (tenantDoc.currency && tenantDoc.currency.code) {
        currencyCode = tenantDoc.currency.code;
      }
    }
  } catch (err) {
    console.warn(
      "[taxConfigUtil] Failed to load Tenant for tax config:",
      err && err.message ? err.message : err
    );
  }

  return { regionCode, currencyCode };
}

/**
 * Find the most appropriate RegionalTaxConfig document for a region/currency.
 *
 * Priority:
 *  1) Active document matching regionCode + currency.code
 *  2) Active default for same currency
 *  3) Any active default
 */
async function findActiveRegionalTaxConfig(regionCode, currencyCode) {
  let pricing = await RegionalTaxConfig.findOne({
    status: "Active",
    regionCode,
    "currency.code": currencyCode,
  })
    .sort({ _id: -1 })
    .lean();

  if (!pricing) {
    pricing = await RegionalTaxConfig.findOne({
      status: "Active",
      isDefault: true,
      "currency.code": currencyCode,
    })
      .sort({ _id: -1 })
      .lean();
  }

  if (!pricing) {
    pricing = await RegionalTaxConfig.findOne({
      status: "Active",
      isDefault: true,
    })
      .sort({ _id: -1 })
      .lean();
  }

  return pricing;
}

/**
 * High-level helper to get GST and service charge percentages for a tenant.
 *
 * @param {Object} options
 * @param {string} [options.tenantId] - Tenant ID used to derive region/currency
 * @param {string} [options.defaultRegionCode='IN'] - Fallback region code
 * @param {string} [options.defaultCurrencyCode='INR'] - Fallback currency code
 *
 * @returns {Promise<{
 *   serviceChargePercent: number,
 *   gstRate: number,
 *   pricing: any,
 *   regionCode: string,
 *   currencyCode: string,
 * }>} Aggregated tax/pricing info for the tenant context.
 */
async function getTaxConfigForTenant({
  tenantId,
  defaultRegionCode = "IN",
  defaultCurrencyCode = "INR",
} = {}) {
  const { regionCode, currencyCode } = await resolveTenantRegionAndCurrency(
    tenantId,
    defaultRegionCode,
    defaultCurrencyCode
  );

  let serviceChargePercent = 0;
  let gstRate = 0;
  let pricing = null;

  try {
    pricing = await findActiveRegionalTaxConfig(regionCode, currencyCode);

    if (
      pricing &&
      pricing.serviceCharge &&
      pricing.serviceCharge.enabled &&
      typeof pricing.serviceCharge.percentage === "number"
    ) {
      serviceChargePercent = normalizePercentage(
        pricing.serviceCharge.percentage
      );
    }

    if (
      pricing &&
      pricing.gst &&
      pricing.gst.enabled &&
      typeof pricing.gst.percentage === "number"
    ) {
      gstRate = normalizePercentage(pricing.gst.percentage);
    }
  } catch (err) {
    console.warn(
      "[taxConfigUtil] Failed to load RegionalTaxConfig:",
      err && err.message ? err.message : err
    );
    serviceChargePercent = 0;
    gstRate = 0;
    pricing = null;
  }

  return {
    serviceChargePercent,
    gstRate,
    pricing,
    regionCode,
    currencyCode,
  };
}

module.exports = {
  resolveTenantRegionAndCurrency,
  findActiveRegionalTaxConfig,
  normalizePercentage,
   computeBaseGstGross,
  getTaxConfigForTenant,
};
