const sendEmail = require("../../utils/sendEmail");

module.exports = (agenda) => {
    agenda.define(
        "send-email",
        { lockLifetime: 60000, priority: "high" }, // Lock for 60s, high priority
        async (job) => {
            const { toEmail, subject, messageBody, ccEmail } = job.attrs.data;

            console.log(`\n[Email-Job] 📧 Processing email for: ${toEmail}`);

            try {
                const result = await sendEmail(toEmail, subject, messageBody, ccEmail);

                if (result.success) {
                    console.log(`[Email-Job] ✅ Successfully sent email to ${toEmail}`);
                } else {
                    // If SMTP returns rejection or failure, we throw to trigger Agenda's built-in retry
                    throw new Error(result.message || "Unknown SMTP error");
                }
            } catch (error) {
                console.error(`[Email-Job] ❌ Error sending email to ${toEmail}:`, error.message);

                // Calculate retry delay based on attempt count
                const failCount = (job.attrs.failCount || 0) + 1;

                if (failCount < 3) {
                    const nextRetryMinutes = failCount === 1 ? 5 : 15;
                    console.log(`[Email-Job] 🔄 Will retry in ${nextRetryMinutes} minutes (Attempt ${failCount}/3)`);

                    job.attrs.nextRunAt = new Date(Date.now() + nextRetryMinutes * 60000);
                    await job.save();
                } else {
                    console.error(`[Email-Job] 🚫 Max retries reached for ${toEmail}. Giving up.`);
                    job.fail(`Failed after ${failCount} attempts: ${error.message}`);
                    await job.save();
                }

                // Throwing ensures Agenda marks it as failed in the DB
                throw error;
            }
        }
    );
};
