import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, Paper, } from '@mui/material';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

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
        }, 40000);

        return () => clearTimeout(timer);
    }, [paymentId, subscriptionId, navigate, nextRoute]);


    useEffect(() => {
        const duration = 5 * 1000;
        let end = Date.now() + duration;

        (function frame() {
            confetti({
                particleCount: 5,
                startVelocity: 30,
                spread: 360,
                ticks: 60,
                origin: {
                    x: Math.random(),
                    y: Math.random() - 0.2
                }
            });
            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        })();
    }, []);

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
                background: 'linear-gradient(to top right, #eef2f3, #8ec5fc)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 2,
                overflow: 'hidden',
                position: 'relative'
            }}
        >
            {/* Background Particles */}
            <Box
                sx={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    zIndex: 0,
                    overflow: 'hidden'
                }}
            >
                {[...Array(20)].map((_, i) => (
                    <motion.span
                        key={i}
                        style={{
                            position: 'absolute',
                            width: 6 + Math.random() * 4,
                            height: 6 + Math.random() * 4,
                            borderRadius: '50%',
                            backgroundColor: '#ffffff',
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            opacity: 0.15
                        }}
                        animate={{ y: [-20, 20, -20] }}
                        transition={{
                            duration: 6 + Math.random() * 3,
                            repeat: Infinity,
                            delay: Math.random() * 3
                        }}
                    />
                ))}
            </Box>

            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                style={{ zIndex: 1 }}
            >
                <Paper
                    elevation={0}
                    sx={{
                        backdropFilter: 'blur(16px)',
                        background: 'rgba(255, 255, 255, 0.65)',
                        borderRadius: 4,
                        px: 5,
                        py: 6,
                        textAlign: 'center',
                        maxWidth: 500,
                        boxShadow: '0 10px 60px rgba(0,0,0,0.1)',
                        position: 'relative'
                    }}
                >
                    {/* Custom Animated SVG Checkmark */}
                    <motion.svg
                        width="120"
                        height="120"
                        viewBox="0 0 120 120"
                        style={{ margin: '0 auto', display: 'block', marginBottom: 24 }}
                    >
                        <motion.circle
                            cx="60"
                            cy="60"
                            r="54"
                            fill="none"
                            stroke="#4caf50"
                            strokeWidth="6"
                            strokeLinecap="round"
                            strokeDasharray="340"
                            strokeDashoffset="0"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1.5, ease: 'easeInOut' }}
                        />
                        <motion.path
                            d="M40 65L55 80L85 50"
                            fill="none"
                            stroke="#4caf50"
                            strokeWidth="6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                        />
                    </motion.svg>

                    {/* Animated Text */}
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={{
                            hidden: {},
                            visible: {
                                transition: {
                                    staggerChildren: 0.2
                                }
                            }
                        }}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <Typography
                                variant="h4"
                                sx={{
                                    fontWeight: 'bold',
                                    mb: 1,
                                    background: 'linear-gradient(to right, #4caf50, #1b5e20)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent'
                                }}
                            >
                                Payment Successful!
                            </Typography>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <Typography variant="body1" sx={{ mb: 3, color: '#2e7d32' }}>
                                Your subscription has been {isUpgrading ? 'upgraded' + planName + ' ' + membershipType + ' successfully.' : 'activated ' + planName + ' ' + membershipType + ' successfully.'} Welcome aboard!
                            </Typography>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                        >
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>Payment ID:</strong> {paymentId}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>Subscription ID:</strong> {subscriptionId}
                                </Typography>
                            </Box>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.6 }}
                        >
                            <Typography variant="body2" color="text.secondary">
                                Redirecting you in <strong>5 seconds...</strong>
                            </Typography>
                        </motion.div>
                    </motion.div>
                </Paper>
            </motion.div>
        </Box>
    );
};

export default SubscriptionSuccess;
