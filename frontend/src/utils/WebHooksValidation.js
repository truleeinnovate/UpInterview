//Webhook Form Validation
export const validateWebhookFormData = (formData) => {
    const errors = {};
  
    if (!formData.callbackUrl.trim()) {
      errors.callbackUrl = 'Callback URL is required';
    }
  
    if (!formData.event) {
      errors.event = 'Please select an event';
    }
  
    return errors;
  };