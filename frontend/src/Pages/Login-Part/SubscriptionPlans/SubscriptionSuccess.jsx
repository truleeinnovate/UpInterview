import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress } from '@mui/material';

const SubscriptionSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { paymentId, subscriptionId, isUpgrading, nextRoute } = location.state || {};

    useEffect(() => {
        // If no payment details, redirect to home
        if (!paymentId || !subscriptionId) {
            navigate('/home');
        }

        // Auto-redirect after 5 seconds
        const timer = setTimeout(() => {
            navigate(nextRoute || '/home');
        }, 5000);

        return () => clearTimeout(timer);
    }, [paymentId, subscriptionId, navigate, nextRoute]);

    // const handleContinue = () => {
    //     navigate(nextRoute || '/home');
    // };

    if (!paymentId || !subscriptionId) {
        return <CircularProgress />;
    }

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '80vh',
                padding: 3,
                textAlign: 'center'
            }}
        >
            <div style={{ marginBottom: '16px' }}>
                <svg
                    width="80"
                    height="80"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#4caf50"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
            </div>
            <Typography variant="h4" gutterBottom>
                Payment Successful!
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
                Your subscription has been {isUpgrading ? 'upgraded' : 'activated'} successfully.
            </Typography>
            <Box sx={{ marginTop: 2 }}>
                <Typography variant="body2" color="text.secondary">
                    Payment ID: {paymentId}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Subscription ID: {subscriptionId}
                </Typography>
                {/* <Typography variant="body2" color="text.secondary">
                    Order ID: {orderId}
                </Typography> */}
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ marginTop: 2 }}>
                You will be automatically redirected in 5 seconds...
            </Typography>
            {/* <Button
                variant="contained"
                color="primary"
                onClick={handleContinue}
                sx={{ marginTop: 3 }}
            >
                Continue Now
            </Button> */}
        </Box>
    );
};

export default SubscriptionSuccess;
