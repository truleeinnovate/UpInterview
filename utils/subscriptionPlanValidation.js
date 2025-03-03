// const Joi = require('joi');

// const validateSubscriptionPlan = (data) => {
//     const schema = Joi.object({
//         name: Joi.string().required(),
//         description: Joi.string().optional(),
//         pricing: Joi.array().items(
//             Joi.object({
//                 billingCycle: Joi.string().valid('monthly', 'quarterly', 'annual').required(),
//                 price: Joi.number().required(),
//                 discount: Joi.number().min(0).optional(),
//                 discountType: Joi.string().valid('percentage', 'flat').optional(),
//                 currency: Joi.string().default('USD').optional()
//             })
//         ),
//         features: Joi.array().items(
//             Joi.object({
//                 name: Joi.string().required(),
//                 limit: Joi.alternatives().try(Joi.number(), Joi.allow(null)),
//                 description: Joi.string().optional()
//             })
//         ),
//         maxUsers: Joi.number().min(1).optional(),
//         subscriptionType: Joi.string().required(),
//         trialPeriod: Joi.number().min(0).optional(),
//         active: Joi.boolean().optional(),
//         isCustomizable: Joi.boolean().optional(),
//         createdBy:Joi.string().required(),
//         modifiedBy:Joi.string(),
//         createdAt: Joi.date().optional(),
//         updatedAt: Joi.date().optional()
//     });

//     return schema.validate(data);
// };

// module.exports = { validateSubscriptionPlan };
