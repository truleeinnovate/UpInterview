const mongoose = require('mongoose');

const SubscriptionPlanSchema = new mongoose.Schema({
    planId: { type: String, required: true, unique: true },
    name: { type: String, required: true }, 
    description: { type: String }, 
    pricing: [
        {
            billingCycle: { type: String, enum: ['monthly', 'quarterly', 'annual'], required: true },
            price: { type: Number, required: true },
            discount: { type: Number, default: 0 },
            discountType: { type: String, enum: ['percentage', 'flat'], required: false },
            currency: { type: String, default: 'USD' }
        }
    ],
    features: [
        {
            name: { type: String, required: true },
            limit: { type: Number, default: null },
            description: { type: String }
        }
    ],
    razorpayPlanIds:{
        monthly:{type:String},
        annual:{type:String}
    },
    // maxUsers: { type: Number, default: 1 },
    // trialPeriod: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    isCustomizable: { type: Boolean, default: false },
    subscriptionType: { type: String, enum: ['organization', 'individual'], required: true }, 
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
    createdBy:{type:String, required:true},
    updatedBy:{type:String},
}, { timestamps: true });

module.exports = mongoose.model('SubscriptionPlan', SubscriptionPlanSchema);




 //latest schema
//  const SubscriptionPlanSchema = new mongoose.Schema({ 
//     name: { type: String, required: true }, 
//     description: { type: String }, 
// // pricing details are not mention in ui
//     pricing: [
//         {
//             billingCycle: { type: String, enum: ['monthly', 'quarterly', 'annual'], required: true },
//             price: { type: Number, required: true },
//             discount: { type: Number, default: 0 },
//             discountType: { type: String, enum: ['percentage', 'flat'], required: false },
//             currency: { type: String, default: 'USD' }
//         }
//     ],
//     features: [
//         {
//             name: { type: String, required: true },
//             limit: { type: Number, default: null },
//             description: { type: String }
//         }
//     ],
//     maxUsers: { type: Number, default: 1 },
//     // maxLicenses: {type:Number,default:1},
//      //interviewSchedulesLimit: "",
//     //outsourcedInterviewAllowed: false,
//     //outsourcedInterviewLimit: "",
//     //recurringInterviews: false,
//     //interviewPanelSize: "",
//     //mockInterviewAccess: false,
//     //assessmentTestsAccess: false,
//     //feedbackReporting: false,
//     //analyticsDashboardAccess: false,
//     //bandwidth: "",
//     //apiAccess: false,
//     //videoQuality: "low",
//    // thirdPartyIntegrations: false,		

//     trialPeriod: { type: Number, default: 0 },
//     active: { type: Boolean, default: true },
//     isCustomizable: { type: Boolean, default: false },
//     subscriptionType: { type: String, enum: ['organization', 'individual'], required: true }, 
//     createdBy:{type:String, required:true},
//     modifiedBy:{type:String},
//     createdAt: { type: Date, default: Date.now },
//     updatedAt: { type: Date, default: Date.now }
// }, { timestamps: true });
