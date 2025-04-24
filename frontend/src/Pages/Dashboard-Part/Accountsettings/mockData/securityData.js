export const securitySettings = {
  twoFactorAuth: {
    enabled: true,
    method: 'authenticator',
    lastUpdated: '2024-01-01T00:00:00Z',
    backupCodes: ['123456', '234567', '345678'],
    recoveryEmail: 'recovery@techcorp.com'
  },
  passwordPolicy: {
    minLength: 12,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    expiryDays: 90,
    preventReuse: 5
  },
  passwordLastChanged: '2023-12-15T00:00:00Z',
  sessionTimeout: 30, // minutes
  ipWhitelist: ['192.168.1.1', '10.0.0.1'],
  deviceTrust: {
    enabled: true,
    trustedDevices: [
      {
        id: 1,
        name: 'MacBook Pro',
        type: 'desktop',
        lastUsed: '2024-01-15T10:30:00Z',
        trusted: true
      },
      {
        id: 2,
        name: 'iPhone 13',
        type: 'mobile',
        lastUsed: '2024-01-15T09:15:00Z',
        trusted: true
      }
    ]
  },
  loginHistory: [
    {
      id: 1,
      timestamp: '2024-01-15T10:30:00Z',
      ip: '192.168.1.1',
      location: 'San Francisco, CA',
      device: 'Chrome on MacOS',
      status: 'success',
      actionType: 'login'
    },
    {
      id: 2,
      timestamp: '2024-01-14T15:45:00Z',
      ip: '192.168.1.1',
      location: 'San Francisco, CA',
      device: 'Safari on iOS',
      status: 'success',
      actionType: 'password_change'
    },
    {
      id: 3,
      timestamp: '2024-01-13T08:20:00Z',
      ip: '10.0.0.1',
      location: 'New York, NY',
      device: 'Firefox on Windows',
      status: 'failed',
      actionType: 'login_attempt'
    }
  ],
  securityAlerts: {
    unusualLoginAttempts: true,
    passwordBreachAlerts: true,
    newDeviceNotifications: true,
    locationChangeAlerts: true
  }
}