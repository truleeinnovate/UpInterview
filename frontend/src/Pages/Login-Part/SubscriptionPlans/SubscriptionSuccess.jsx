import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, Paper, } from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { motion } from 'framer-motion';

const SubscriptionSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { paymentId, subscriptionId, isUpgrading, planName, membershipType, nextRoute } = location.state || {};

    useEffect(() => {
        if (!paymentId || !subscriptionId) {
            navigate('/home');
        }

        const timer = setTimeout(() => {
            navigate(nextRoute || '/home');
        }, 5000);

        return () => clearTimeout(timer);
    }, [paymentId, subscriptionId, navigate, nextRoute]);

    if (!paymentId || !subscriptionId) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(to right, #e0f7fa, #e8f5e9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 2
            }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
            >
                <Paper elevation={6} sx={{ padding: 4, borderRadius: 4, textAlign: 'center', maxWidth: 500 }}>
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}
                    >
                        <CheckCircleRoundedIcon sx={{ fontSize: 60, color: 'success.main' }} />
                    </motion.div>

                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Payment Successful!
                    </Typography>

                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                        Your subscription has been {isUpgrading ? 'upgraded' + planName + ' ' + membershipType + ' successfully.' : 'activated ' + planName + ' ' + membershipType + ' successfully.'}
                    </Typography>

                    <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                            <strong>Payment ID:</strong> {paymentId}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            <strong>Subscription ID:</strong> {subscriptionId}
                        </Typography>
                    </Box>

                    <Typography variant="body2" color="text.secondary">
                        You will be redirected in <strong>5 seconds...</strong>
                    </Typography>

                    {/* Uncomment if you want a manual "Continue" button
                    <Button
                        variant="contained"
                        color="primary"
                        sx={{ mt: 3 }}
                        onClick={() => navigate(nextRoute || '/home')}
                    >
                        Continue Now
                    </Button> */}
                </Paper>
            </motion.div>
        </Box>
    );
};

export default SubscriptionSuccess;
