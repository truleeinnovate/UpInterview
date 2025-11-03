# Configured Unique ID Patterns

## All Configured Entity Types

All unique ID generation is now centralized through the `uniqueIdGeneratorService.js`. Below are all configured entity types with their patterns:

### Financial/Billing IDs (Starting from 50001)
| Prefix | Entity | Field Name | Format | Example |
|--------|--------|------------|--------|---------|
| INVC | Invoice | invoiceCode | INVC-XXXXX | INVC-50001 |
| WLT | Wallet | walletCode | WLT-XXXXX | WLT-50001 |
| WDL | Withdrawal | withdrawalCode | WDL-XXXXX | WDL-00001 |
| RCP | Receipt | receiptCode | RCP-XXXXX | RCP-50001 |
| PMT | Payment | paymentCode | PMT-XXXXX | PMT-50001 |
| SPT | Support Ticket | ticketCode | SPT-XXXXX | SPT-50001 |
| MINT | Mock Interview | mockInterviewCode | MINT-XXXXX | MINT-50001 |
| ORG | Organization Request | organizationRequestCode | ORG-XXXXX | ORG-00001 |
| OINT | Outsource Interviewer | outsourceRequestCode | OINT-XXXXX | OINT-00001 |

### Organization Level IDs (Starting from 00001)
| Prefix | Entity | Field Name | Format | Example |
|--------|--------|------------|--------|---------|
| INT | Interview | interviewCode | INT-XXXXX | INT-00001 |
| INT-RQST | Interview Request | interviewRequestCode | INT-RQST-XXXXX | INT-RQST-00001 |
| POS | Position | positionCode | POS-XXXXX | POS-00001 |
| TSK | Task | taskCode | TSK-XXXXX | TSK-00001 |
| ASMT-TPL | Assessment Template | AssessmentCode | ASMT-TPL-XXXXX | ASMT-TPL-00001 |
| INT-TPL | Interview Template | interviewTemplateCode | INT-TPL-XXXXX | INT-TPL-00001 |

## Configuration in uniqueIdGeneratorService.js

```javascript
const ENTITY_CONFIG = {
  // Financial/Billing (50001 start)
  'INVC': { startNumber: 50001, padLength: 5, fieldName: 'invoiceCode', maxRetries: 5 },
  'WLT': { startNumber: 50001, padLength: 5, fieldName: 'walletCode', maxRetries: 5 },
  'WDL': { startNumber: 50001, padLength: 5, fieldName: 'withdrawalCode', maxRetries: 5 },
  'RCP': { startNumber: 50001, padLength: 5, fieldName: 'receiptCode', maxRetries: 10 },
  'PMT': { startNumber: 50001, padLength: 5, fieldName: 'paymentCode', maxRetries: 5 },
  'SPT': { startNumber: 50001, padLength: 5, fieldName: 'ticketCode', maxRetries: 5 },
  'MINT': { startNumber: 50001, padLength: 5, fieldName: 'mockInterviewCode', maxRetries: 5 },
  
  // Organization Level (00001 start)
  'ORG': { startNumber: 1, padLength: 5, fieldName: 'organizationRequestCode', maxRetries: 5 },
  'OINT': { startNumber: 1, padLength: 5, fieldName: 'outsourceRequestCode', maxRetries: 5 },
  'INT': { startNumber: 1, padLength: 5, fieldName: 'interviewCode', maxRetries: 5 },
  'INT-RQST': { startNumber: 1, padLength: 5, fieldName: 'interviewRequestCode', maxRetries: 5 },
  'POS': { startNumber: 1, padLength: 5, fieldName: 'positionCode', maxRetries: 5 },
  'TSK': { startNumber: 1, padLength: 5, fieldName: 'taskCode', maxRetries: 5 },
  'ASMT-TPL': { startNumber: 1, padLength: 5, fieldName: 'assessmentTemplateCode', maxRetries: 5 },
  'INT-TPL': { startNumber: 1, padLength: 5, fieldName: 'interviewTemplateCode', maxRetries: 5 }
};
```

## Usage Example

```javascript
const { generateUniqueId } = require('../services/uniqueIdGeneratorService');

// For any entity type
const code = await generateUniqueId('PREFIX', Model, 'fieldName');

// Specific examples
const invoiceCode = await generateUniqueId('INVC', InvoiceModel, 'invoiceCode');
const positionCode = await generateUniqueId('POS', Position, 'positionCode');
const ticketCode = await generateUniqueId('SPT', SupportUser, 'ticketCode');
```

## Updated Files

### Controllers Updated to Use Centralized Service:
1. **WalletControllers.js** - Uses for wallet and withdrawal codes
2. **RazorpayController.js** - Uses for payment and receipt codes
3. **CustomerSubscriptionControllers.js** - Uses for wallet codes
4. **CustomerSubscriptionInvoiceControllers.js** - Uses for invoice and receipt codes
5. **FreePlanRenewalController.js** - Uses for invoice codes
6. **InvoiceControllers.js** - Uses for invoice codes
7. **mockInterviewController.js** - Uses for mock interview codes
8. **interviewTemplateController.js** - Uses for interview template codes
9. **assessmentController.js** - Uses for assessment template codes
10. **positionController.js** - Uses for position codes
11. **InterviewRequestController.js** - Uses for interview request codes
12. **organizationLoginController.js** - Uses for organization request codes
13. **supportUserController.js** - Uses for support ticket codes

### Models Updated:
1. **OutsourceInterviewerRequest.js** - Pre-save hook uses centralized service for OINT codes

## Key Features

### 1. Automatic Retry Logic
- Handles race conditions automatically
- Default 5 retries (10 for receipts due to frequent conflicts)
- Adds attempt offset to reduce collision probability

### 2. Proper Sorting
- Sorts by actual code field, not by creation date (_id)
- Finds the true highest number regardless of creation order
- Uses regex to match only properly formatted codes

### 3. Error Handling
- Returns meaningful error messages
- Falls back gracefully when service fails
- Logs all generation attempts for debugging

### 4. Consistency
- All codes follow the same pattern
- Single source of truth for ID generation
- Easy to add new entity types

## Testing

To test any unique ID generation:

```javascript
// Test in your controller or model
const testCode = await generateUniqueId('SPT', SupportUser, 'ticketCode');
console.log('Generated code:', testCode); // SPT-50001
```

## Adding New Entity Types

To add a new entity type:

1. Add configuration to `ENTITY_CONFIG` in `uniqueIdGeneratorService.js`:
```javascript
'NEW': { 
  startNumber: 1,      // or 50001 for financial
  padLength: 5,         // Number of digits
  fieldName: 'newCode', // Field name in model
  maxRetries: 5         // Retry attempts
}
```

2. Use in your controller:
```javascript
const newCode = await generateUniqueId('NEW', NewModel, 'newCode');
```

## Notes
- Financial/billing related IDs start from 50001
- Organization level IDs start from 00001
- All IDs are zero-padded to 5 digits
- The service handles all race conditions and duplicates automatically
- No need for manual retry loops or duplicate checking in controllers
