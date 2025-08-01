/**
 * Subscription status constants for consistent status values across frontend and backend
 * These values match the CustomerSubscription schema enum
 */
const SUBSCRIPTION_STATUSES = {
    // Initial state when subscription is created but not yet active
    CREATED: 'created',
    
    // Subscription is active and paid
    ACTIVE: 'active',
    
    // Subscription is not currently active
    INACTIVE: 'inactive',
    
    // Subscription is temporarily paused
    PAUSED: 'paused',

    // Subscription is temporarily halted
    HALTED: 'halted',
    
    // User cancelled subscription
    CANCELLED: 'cancelled',
    
    // Initial state for subscriptions awaiting payment
    PENDING: 'pending',
    
    // Payment attempt failed
    FAILED: 'failed',
    
    // Subscription reached end date without renewal
    EXPIRED: 'expired'
};

module.exports = SUBSCRIPTION_STATUSES;
