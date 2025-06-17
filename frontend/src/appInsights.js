// src/appInsights.js
import { ApplicationInsights } from '@microsoft/applicationinsights-web';

const appInsights = new ApplicationInsights({
  config: {
    instrumentationKey: 'YOUR_INSTRUMENTATION_KEY',
    enableAutoRouteTracking: true, // Automatically track route changes
  },
});

appInsights.loadAppInsights();

export default appInsights;
