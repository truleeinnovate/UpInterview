// v1.0.0 - mansoor - removed unnecessary comments
// v1.0.1 - mansoor - removed old ui and added new ui
// v1.0.2 - Ashok - changed logo url from local to cloud storage url
// v1.0.3 - Venkatesh - Added subscription status checks in login flow to redirect subscribed users directly to home

import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";
import Slideshow from "./Slideshow";
import InputField from "../../Components/FormFields/InputField";
// import logo from "../../Pages/Dashboard-Part/Images/upinterviewLogo.webp";
// <------------------- v1.0.0
import {
    setAuthCookies,
    clearAllAuth,
} from "../../utils/AuthCookieManager/AuthCookieManager";
// v1.0.0 ---------------------->
import { config } from "../../config";
import { validateWorkEmail } from "../../utils/workEmailValidation.js";
import toast from "react-hot-toast";
import { usePermissions } from "../../Context/PermissionsContext";

import { Link } from "react-router-dom";
import { notify } from "../../services/toastService.js";
// import Layout from './Layout.jsx';

const OrganizationLogin = () => {
    const { refreshPermissions } = usePermissions();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({ email: "", password: "" });
    const [isLoading, setIsLoading] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(true);
    const [isResending, setIsResending] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Refs for input fields
    const emailRef = useRef(null);
    const passwordRef = useRef(null);

    // Handle verification success and returnUrl
    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const verified = query.get("verified");
        if (verified === "true") {
            notify.success("Email verified successfully!");
            navigate("/organization-login");
            window.location.reload();
        }
    }, [location, navigate]);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const validateEmail = (email) => {
        if (!email) return "Email is required";
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) return "Please enter a valid email address";
        return "";
    };

    const validatePassword = (password) => {
        if (!password) return "Password is required";
        if (password.length < 6)
            return "Password must be at least 6 characters long";
        return "";
    };

    const validateLogin = () => {
        const emailError = validateWorkEmail(email);
        const passwordError = validatePassword(password);
        setErrors({ email: emailError, password: passwordError });
        return !emailError && !passwordError;
    };

    const handleBlur = (field, value) => {
        if (field === "email" && value) {
            setErrors((prev) => ({ ...prev, email: validateEmail(value) }));
        } else if (field === "password" && value) {
            setErrors((prev) => ({ ...prev, password: validatePassword(value) }));
        }
    };

    const handleResendVerification = async () => {
        if (isResending) return;
        setIsResending(true);
        try {
            const response = await axios.post(
                `${config.REACT_APP_API_URL}/emails/resend-verification`,
                { email }
            );
            if (response.data.success) {
                notify.success("Verification email resent!");
                setCountdown(60);
            } else {
                notify.error(
                    response.data.message || "Failed to resend verification email"
                );
            }
        } catch (error) {
            notify.error(
                error.response?.data?.message || "Failed to resend verification email"
            );
        } finally {
            setIsResending(false);
        }
    };

    const [countdown, setCountdown] = useState(0);

    // Countdown timer logic
    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    // <------------------- v1.0.0 - removed consoles in this total function
    const handleLogin = async (e) => {
        e.preventDefault();
        if (!validateLogin()) return;

        setIsLoading(true);
        const loginStartTime = new Date().toISOString();

        try {
            // Clear existing cookies
            await clearAllAuth();

            // Authenticate user
            const loginURL = `${config.REACT_APP_API_URL}/Organization/Login`;
            // console.log('Sending login request to:', loginURL);
            const response = await axios.post(
                loginURL,
                {
                    email: email.trim().toLowerCase(),
                    password,
                },
                { withCredentials: true }
            );
            // console.log('Login response received:', {
            //     status: response.status,
            //     data: {
            //         ...response.data,
            //         // Hide sensitive data in logs
            //         authToken: response.data.authToken ? '***TOKEN_RECEIVED***' : 'NO_TOKEN',
            //         impersonationToken: response.data.impersonationToken ? '***TOKEN_RECEIVED***' : 'NO_TOKEN'
            //     }
            // });

            const {
                authToken,
                impersonationToken,
                impersonatedUserId,
                ownerId,
                tenantId,
                isEmailVerified,
                status,
                isProfileCompleted,
                isSkipped,
                roleName,
                contactEmailFromOrg,
                roleType,
                subdomain,
                subdomainStatus,
            } = response.data;
            // console.log('Login successful, processing response...');
            // console.log('Role Type:', roleType);
            // console.log('Is Email Verified:', isEmailVerified);

            // console.log('Login successful, processing response...');
            // console.log('Role Type:', roleType);
            // console.log('Is Email Verified:', isEmailVerified);
            // console.log('User Status:', status);
            // console.log('Is Profile Completed:', isProfileCompleted);

            // Handle internal users
            if (roleType === "internal") {
                setAuthCookies({ impersonationToken, impersonatedUserId });
                await refreshPermissions();
                navigate("/admin-dashboard");
                return;
            }

            // Set authentication cookies
            await setAuthCookies({
                authToken,
                userId: ownerId,
                tenantId,
                organization: true,
            });

            // Handle email verification
            if (!isEmailVerified) {
                setIsEmailVerified(false);
                await handleResendVerification();
                setCountdown(60);
                return;
            }

            // Handle returnUrl
            const query = new URLSearchParams(location.search);
            const returnUrl = query.get("returnUrl");
            if (returnUrl) {
                // Redirect to the returnUrl as-is without parsing/decoding
                await new Promise((resolve) => setTimeout(resolve, 2000));
                window.location.href = returnUrl;
                return;
            }

            // console.log('Checking subdomain redirection...');
            // console.log('Subdomain:', subdomain);
            // console.log('Subdomain Status:', subdomainStatus);
            // console.log('User Status for redirection:', status);

            // Handle subdomain redirection if applicable
            if (subdomain && subdomainStatus === 'active' && status === 'active') {
                // console.log('Subdomain redirection applicable...');
                const currentDomain = window.location.hostname;
                const targetDomain = `${subdomain}.${config.REACT_APP_API_URL_FRONTEND}`;

                if (!currentDomain.includes(subdomain)) {
                    // console.log('Redirecting to subdomain...');
                    const protocol = window.location.protocol;
                    let targetPath = "/";
                    if (status === "active" && (isProfileCompleted !== false || isSkipped)) {
                        targetPath = "/home";
                    } else if (status === "submitted" || status === "payment_pending") {
                        // Check if user already has an active subscription
                        try {
                            const subRes = await axios.get(
                                `${config.REACT_APP_API_URL}/subscription-plans/user/${response.data.ownerId}`,
                                { headers: { Authorization: `Bearer ${response.data.token}` } }
                            );
                            const subscription = subRes?.data?.customerSubscription?.[0];

                            if (subscription && subscription.status === "active") {
                                targetPath = "/home";
                            } else {
                                targetPath = "/subscription-plans";
                            }
                        } catch (error) {
                            console.error("Error checking subscription:", error);
                            targetPath = "/subscription-plans"; // Fallback to subscription plans
                        }
                    } else if (isProfileCompleted === false && roleName && !isSkipped) {
                        targetPath = "/create-profile";
                    }

                    const targetUrl = `${protocol}//${targetDomain}${targetPath}`;
                    await new Promise((resolve) => setTimeout(resolve, 4000));
                    window.location.href = targetUrl;
                    return;
                }
            }

            // Refresh permissions for non-subdomain cases
            await refreshPermissions();

            // Default navigation based on user status and organization request status
            // console.log('User status:', status);

            // Get user data from the login response
            const userData = response?.data;

            switch (status) {
                case "submitted":
                    const requestResponse = await axios.get(`${config.REACT_APP_API_URL}/Organization/organization-request/${userData.tenantId}/${userData.ownerId}`);
                    const requestStatus = requestResponse.data.data.status;
                    // console.log('requestStatus:- ', requestStatus);
                    if (requestStatus === 'pending_review') {
                        navigate("/pending-approval");
                    } else if (requestStatus === 'in_contact' || requestStatus === 'rejected') {
                        navigate("/pending-approval");
                    } else if (requestStatus === 'approved') {
                        if (status === "payment_pending" || status === "submitted") {
                            // Check if user already has an active subscription
                            try {
                                const subRes = await axios.get(
                                    `${config.REACT_APP_API_URL}/subscription-plans/user/${userData.ownerId}`,
                                    { headers: { Authorization: `Bearer ${response.data.token}` } }
                                );
                                const subscription = subRes?.data?.customerSubscription?.[0];

                                if (subscription && subscription.status === 'active') {
                                    navigate("/home");
                                } else {
                                    navigate("/subscription-plans");
                                }
                            } catch (error) {
                                console.error("Error checking subscription:", error);
                                navigate("/subscription-plans"); // Fallback to subscription plans
                            }
                        } else {
                            navigate("/organization-login");
                        }
                    }
                    break;
                case "payment_pending":
                    // Check if user already has an active subscription
                    try {
                        const subRes = await axios.get(
                            `${config.REACT_APP_API_URL}/subscription-plans/user/${userData.ownerId}`,
                            { headers: { Authorization: `Bearer ${response.data.token}` } }
                        );
                        const subscription = subRes?.data?.customerSubscription?.[0];

                        if (subscription && subscription.status === 'active') {
                            navigate("/home");
                        } else {
                            navigate("/subscription-plans");
                        }
                    } catch (error) {
                        console.error("Error checking subscription:", error);
                        navigate("/subscription-plans"); // Fallback to subscription plans
                    }
                    break;
                case "active":
                    if (isProfileCompleted === false && roleName && !isSkipped) {
                        navigate("/create-profile", {
                            state: {
                                isProfileCompleteStateOrg: true,
                                roleName,
                                contactEmailFromOrg,
                            },
                        });
                    } else {
                        await new Promise((resolve) => setTimeout(resolve, 4000));
                        navigate("/home");
                    }
                    break;
                default:
                    navigate("/");
            }
        } catch (error) {
            setIsLoading(false);
            setErrors({ email: "", password: "" });

            if (error.response) {
                const { status, data } = error.response;
                if (status === 400) {
                    if (data.fields) {
                        setErrors(data.fields);
                    } else if (data.message === "No account found") {
                        setErrors({
                            email: "No account found",
                            password: "",
                        });
                    } else if (data.message === "Incorrect password") {
                        setErrors({
                            email: "",
                            password: "Incorrect password",
                        });
                    } else {
                        notify.error(data.message || "Something went wrong. Please refresh the screen or contact customer support.");
                    }
                } else if (status === 403) {
                    if (data.isEmailVerified === false) {
                        setIsEmailVerified(false);
                        await handleResendVerification();
                        setCountdown(60);
                    } else {
                        notify.error(data.message || "Access denied");
                    }
                } else if (status >= 500) {
                    notify.error("Something went wrong. Please refresh the screen or contact customer support.");
                } else {
                    notify.error(data.message || "Something went wrong. Please refresh the screen or contact customer support.");
                }
            } else {
                notify.error("Something went wrong. Please refresh the screen or contact customer support.");
            }
        } finally {
            setIsLoading(false);
        }
    };
    // v1.0.0 ----------------------->

    return (
        <div>
            {/* <----------------- v1.0.1 */}
            {/* <div showBackButton={true} backPath="/"> */}
            <div className="min-h-screen flex">
                {/* Left side - Hero Image and Content */}
                <div className="hidden lg:flex lg:w-1/2 xl:flex xl:w-1/2 2xl:flex 2xl:w-1/2 bg-gradient-to-br from-custom-blue/80 via-custom-blue/90 to-custom-blue relative overflow-hidden rounded-r-3xl">
                    <div className="absolute inset-0">
                        <img
                            src="https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=1200"
                            alt="Modern office meeting room"
                            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-custom-blue/85 via-custom-blue/90 to-custom-blue/95"></div>
                    </div>

                    <div className="relative z-10 flex flex-col justify-center px-4 lg:px-8 py-8 lg:py-12 text-white animate-fade-in mt-1">
                        <div className="mb-8">
                            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                                <span className="text-sm font-medium">
                                    200+ Companies Already Using
                                </span>
                            </div>
                            <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                                Accelerate Your
                                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white to-white/80">
                                    Hiring Process
                                </span>
                            </h1>
                            <p className="text-xl text-white/90 leading-relaxed mb-2">
                                Access 500+ expert interviewers instantly. Schedule technical
                                interviews without waiting for your team's availability.
                            </p>
                            <div className="flex items-center text-white/70 text-sm">
                                <svg
                                    className="w-4 h-4 mr-2"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                Reduce time-to-hire by 60% on average
                            </div>
                        </div>

                        {/* Key Benefits */}
                        <div className="space-y-4 mb-6">
                            <div className="flex items-start group">
                                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4 mt-1 group-hover:bg-white/30 transition-all duration-300">
                                    <svg
                                        className="w-6 h-6"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9.5 9.293 10.793a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-lg mb-2">
                                        ⚡ Instant Interview Scheduling
                                    </h4>
                                    <p className="text-white/80">
                                        No more waiting for your technical team's availability.
                                        Schedule interviews immediately with our expert network.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start group">
                                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4 mt-1 group-hover:bg-white/30 transition-all duration-300">
                                    <svg
                                        className="w-6 h-6"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-lg mb-2">
                                        👥 Hybrid Team Management
                                    </h4>
                                    <p className="text-white/80">
                                        Seamlessly manage both external expert interviewers and your
                                        internal team in one platform.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start group">
                                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4 mt-1 group-hover:bg-white/30 transition-all duration-300">
                                    <svg
                                        className="w-6 h-6"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-lg mb-2">
                                        ✅ Quality Assurance
                                    </h4>
                                    <p className="text-white/80">
                                        All interviewers are vetted professionals from top tech
                                        companies with proven track records.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Additional Features */}
                        <div className="space-y-4 mb-6">
                            <div className="flex items-start group">
                                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4 mt-1 group-hover:bg-white/30 transition-all duration-300">
                                    <svg
                                        className="w-6 h-6"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-lg mb-2">
                                        📝 Smart Assessments
                                    </h4>
                                    <p className="text-white/80">
                                        Pre-built technical assessments and coding challenges
                                        tailored to specific roles and skill levels.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start group">
                                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4 mt-1 group-hover:bg-white/30 transition-all duration-300">
                                    <svg
                                        className="w-6 h-6"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-lg mb-2">
                                        💬 Detailed Feedback
                                    </h4>
                                    <p className="text-white/80">
                                        Comprehensive interview reports with scoring, strengths,
                                        weaknesses, and hiring recommendations.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start group">
                                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4 mt-1 group-hover:bg-white/30 transition-all duration-300">
                                    <svg
                                        className="w-6 h-6"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-lg mb-2">
                                        🏦 Question Bank
                                    </h4>
                                    <p className="text-white/80">
                                        Access to 1000+ curated interview questions across different
                                        technologies and difficulty levels.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start group">
                                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4 mt-1 group-hover:bg-white/30 transition-all duration-300">
                                    <svg
                                        className="w-6 h-6"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"
                                            clipRule="evenodd"
                                        />
                                        <path
                                            fillRule="evenodd"
                                            d="M4 5a2 2 0 012-2h8a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 2a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-lg mb-2">
                                        📊 Analytics Dashboard
                                    </h4>
                                    <p className="text-white/80">
                                        Track hiring metrics, interviewer performance, and candidate
                                        pipeline analytics in real-time.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/15 transition-all duration-300 group">
                                <div className="text-2xl font-bold group-hover:scale-110 transition-transform duration-300">
                                    60%
                                </div>
                                <div className="text-sm text-white/80">Faster Hiring</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/15 transition-all duration-300 group">
                                <div className="text-2xl font-bold group-hover:scale-110 transition-transform duration-300">
                                    500+
                                </div>
                                <div className="text-sm text-white/80">Expert Interviewers</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/15 transition-all duration-300 group">
                                <div className="text-2xl font-bold group-hover:scale-110 transition-transform duration-300">
                                    10k+
                                </div>
                                <div className="text-sm text-white/80">Interviews Done</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/15 transition-all duration-300 group">
                                <div className="text-2xl font-bold group-hover:scale-110 transition-transform duration-300">
                                    200+
                                </div>
                                <div className="text-sm text-white/80">Companies</div>
                            </div>
                        </div>

                        {/* Platform Features */}
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4">
                            <h4 className="font-semibold text-lg mb-4 text-center">
                                🚀 Complete Hiring Platform
                            </h4>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="flex items-center">
                                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                                    <span>Video Interviews</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                                    <span>Code Collaboration</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                                    <span>AI-Powered Matching</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                                    <span>Calendar Integration</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                                    <span>Custom Workflows</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                                    <span>Team Collaboration</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right side - Login Form */}
                <div className="w-full lg:w-1/2 xl:w-1/2 2xl:w-1/2 flex items-start justify-center p-6 lg:p-12 bg-gradient-to-br from-gray-50 to-white">
                    <div className="max-w-lg lg:max-w-[90%] xl:max-w-[85%] 2xl:max-w-[60%] w-full py-4">
                        <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-100 hover:shadow-3xl transition-all duration-300">
                            <div className="text-center mb-8">
                                {/* v1.0.2 <-------------------------------------------------------------------------------------------------------------------------------- */}
                                {/* <img src={logo} alt="Upinterview Logo" className="w-32 object-contain mx-auto mb-3 hover:scale-110 transition-transform duration-300" /> */}
                                <img
                                    src="https://res.cloudinary.com/dnlrzixy8/image/upload/v1756099243/upinterviewLogo_ng1wit.webp"
                                    alt="Upinterview Logo"
                                    className="w-32 object-contain mx-auto mb-3 hover:scale-110 transition-transform duration-300"
                                />
                                {/* v1.0.2 --------------------------------------------------------------------------------------------------------------------------------> */}
                                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                                    {(() => {
                                        const query = new URLSearchParams(location.search);
                                        const returnUrl = query.get("returnUrl");
                                        if (returnUrl) {
                                            try {
                                                const decodedReturnUrl = decodeURIComponent(returnUrl);
                                                const returnUrlObj = new URL(decodedReturnUrl);
                                                if (returnUrlObj.pathname === "/join-meeting") {
                                                    return "Join Your Meeting! 🎯";
                                                }
                                            } catch (error) {
                                                console.error("Error processing returnUrl:", error);
                                            }
                                        }
                                        return "Welcome Back!";
                                    })()}
                                </h2>
                                <p className="text-gray-600 mb-4">
                                    {(() => {
                                        const query = new URLSearchParams(location.search);
                                        const returnUrl = query.get("returnUrl");
                                        if (returnUrl) {
                                            try {
                                                const decodedReturnUrl = decodeURIComponent(returnUrl);
                                                const returnUrlObj = new URL(decodedReturnUrl);
                                                if (returnUrlObj.pathname === "/join-meeting") {
                                                    return "Sign in to access your scheduled interview meeting";
                                                }
                                            } catch (error) {
                                                console.error("Error processing returnUrl:", error);
                                            }
                                        }
                                        return "Sign in to your organization dashboard";
                                    })()}
                                </p>
                                {/* Return URL indicator */}
                                {(() => {
                                    const query = new URLSearchParams(location.search);
                                    const returnUrl = query.get("returnUrl");
                                    if (returnUrl) {
                                        try {
                                            const decodedReturnUrl = decodeURIComponent(returnUrl);
                                            const returnUrlObj = new URL(decodedReturnUrl);
                                            if (returnUrlObj.pathname === "/join-meeting") {
                                                return (
                                                    <div className="inline-flex items-center bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm mt-2">
                                                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                                                        Redirecting back to meeting after login
                                                    </div>
                                                );
                                            }
                                        } catch (error) {
                                            console.error("Error processing returnUrl:", error);
                                        }
                                    }
                                    return null;
                                })()}
                            </div>

                            <div className="bg-gradient-to-r from-custom-blue/5 to-custom-blue/10 rounded-xl p-4 mb-6 border border-custom-blue/20">
                                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                                    <svg
                                        className="w-5 h-5 text-custom-blue mr-2"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    {(() => {
                                        const query = new URLSearchParams(location.search);
                                        const returnUrl = query.get("returnUrl");
                                        if (returnUrl) {
                                            try {
                                                const decodedReturnUrl = decodeURIComponent(returnUrl);
                                                const returnUrlObj = new URL(decodedReturnUrl);
                                                if (returnUrlObj.pathname === "/join-meeting") {
                                                    return "🎯 Meeting Access:";
                                                }
                                            } catch (error) {
                                                console.error("Error processing returnUrl:", error);
                                            }
                                        }
                                        return "Dashboard Access:";
                                    })()}
                                </h3>
                                <ul className="space-y-2 text-sm text-gray-700">
                                    {(() => {
                                        const query = new URLSearchParams(location.search);
                                        const returnUrl = query.get("returnUrl");
                                        if (returnUrl) {
                                            try {
                                                const decodedReturnUrl = decodeURIComponent(returnUrl);
                                                const returnUrlObj = new URL(decodedReturnUrl);
                                                if (returnUrlObj.pathname === "/join-meeting") {
                                                    return (
                                                        <>
                                                            <li className="flex items-center">
                                                                <div className="w-2 h-2 bg-custom-blue rounded-full mr-3 animate-pulse"></div>
                                                                Join your scheduled interview meeting
                                                            </li>
                                                            <li className="flex items-center">
                                                                <div className="w-2 h-2 bg-custom-blue rounded-full mr-3 animate-pulse"></div>
                                                                Access meeting details and candidate info
                                                            </li>
                                                            <li className="flex items-center">
                                                                <div className="w-2 h-2 bg-custom-blue rounded-full mr-3 animate-pulse"></div>
                                                                View interview feedback and assessments
                                                            </li>
                                                            <li className="flex items-center">
                                                                <div className="w-2 h-2 bg-custom-blue rounded-full mr-3 animate-pulse"></div>
                                                                Manage interview scheduling and availability
                                                            </li>
                                                        </>
                                                    );
                                                }
                                            } catch (error) {
                                                console.error("Error processing returnUrl:", error);
                                            }
                                        }
                                        return (
                                            <>
                                                <li className="flex items-center">
                                                    <div className="w-2 h-2 bg-primary-500 rounded-full mr-3 animate-pulse"></div>
                                                    Schedule interviews with expert interviewers
                                                </li>
                                                <li className="flex items-center">
                                                    <div className="w-2 h-2 bg-primary-500 rounded-full mr-3 animate-pulse"></div>
                                                    Manage your internal team availability
                                                </li>
                                                <li className="flex items-center">
                                                    <div className="w-2 h-2 bg-primary-500 rounded-full mr-3 animate-pulse"></div>
                                                    Track interview progress and feedback
                                                </li>
                                                <li className="flex items-center">
                                                    <div className="w-2 h-2 bg-primary-500 rounded-full mr-3 animate-pulse"></div>
                                                    Access detailed candidate assessments
                                                </li>
                                            </>
                                        );
                                    })()}
                                </ul>
                            </div>

                            {isEmailVerified ? (
                                <form onSubmit={handleLogin} className="space-y-6">
                                    <div>
                                        <InputField
                                            label="Work Email Address 📧"
                                            type="email"
                                            name="email"
                                            value={email}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/\s/g, "").toLowerCase();
                                                setEmail(value);
                                                setErrors((prev) => ({ ...prev, email: "" }));
                                            }}
                                            onBlur={(e) => handleBlur("email", e.target.value)}
                                            error={errors.email}
                                            placeholder="your@company.com"
                                            autoComplete="email"
                                            inputRef={emailRef}
                                            className="focus:ring-custom-blue focus:border-custom-blue"
                                        />
                                    </div>

                                    <div>

                                        <div className="relative">
                                            <InputField
                                                label="Password 🔐"
                                                type={showPassword ? "text" : "password"}
                                                name="password"
                                                value={password}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/\s/g, "");
                                                    setPassword(value);
                                                    setErrors((prev) => ({ ...prev, password: "" }));
                                                }}
                                                onBlur={(e) => handleBlur("password", e.target.value)}
                                                error={errors.password}
                                                placeholder="••••••••"
                                                autoComplete="current-password"
                                                inputRef={passwordRef}
                                                className="password-input pr-12 focus:ring-custom-blue focus:border-custom-blue"
                                            />
                                            <button
                                                type="button"
                                                onClick={togglePasswordVisibility}
                                                className="absolute right-3 top-[43px] transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200 z-10"
                                                aria-label={showPassword ? "Hide password" : "Show password"}
                                            >
                                                {showPassword ? (
                                                    <EyeOff size={20} />
                                                ) : (
                                                    <Eye size={20} />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            {/* <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                        Keep me signed in
                      </label> */}
                                        </div>

                                        <Link
                                            to="/forgot-password"
                                            className="text-sm text-custom-blue hover:text-custom-blue/80 font-medium hover:underline transition-all duration-200"
                                        >
                                            Forgot password?
                                        </Link>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className={`w-full text-lg font-medium rounded-lg py-3 transition-all duration-300 flex items-center justify-center ${isLoading
                                            ? "bg-gray-400 cursor-not-allowed transform scale-95"
                                            : "bg-custom-blue hover:bg-custom-blue/90 text-white transform hover:scale-105 shadow-md"
                                            }`}
                                    >
                                        {isLoading ? (
                                            <>
                                                <svg
                                                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <circle
                                                        className="opacity-25"
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                    ></circle>
                                                    <path
                                                        className="opacity-75"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                    ></path>
                                                </svg>
                                                Authenticating...
                                            </>
                                        ) : (
                                            (() => {
                                                const query = new URLSearchParams(location.search);
                                                const returnUrl = query.get("returnUrl");
                                                if (returnUrl) {
                                                    try {
                                                        const decodedReturnUrl =
                                                            decodeURIComponent(returnUrl);
                                                        const returnUrlObj = new URL(decodedReturnUrl);
                                                        if (returnUrlObj.pathname === "/join-meeting") {
                                                            return "Sign In & Join Meeting ✨";
                                                        }
                                                    } catch (error) {
                                                        console.error("Error processing returnUrl:", error);
                                                    }
                                                }
                                                return "Sign In to Dashboard ✨";
                                            })()
                                        )}
                                    </button>
                                </form>
                            ) : (
                                <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-custom-blue/20">
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg
                                                className="w-8 h-8 text-blue-600"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                                />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                            Email Verification Required 📧
                                        </h3>
                                        <p className="text-gray-600 mb-4">
                                            We've sent a verification email to{" "}
                                            <span className="font-semibold text-blue-600">
                                                {email}
                                            </span>
                                        </p>
                                        <p className="text-sm text-gray-500 mb-6">
                                            Please check your inbox and click the verification link to
                                            continue.
                                        </p>

                                        <div className="space-y-3">
                                            <button
                                                onClick={handleResendVerification}
                                                disabled={isResending || countdown > 0}
                                                className={`w-full px-4 py-3 rounded-lg font-medium transition-all duration-300 ${isResending || countdown > 0
                                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                    : "bg-custom-blue hover:bg-custom-blue/90 text-white transform hover:scale-105 shadow-md"
                                                    }`}
                                            >
                                                {isResending ? (
                                                    <span className="flex items-center justify-center">
                                                        <svg
                                                            className="animate-spin -ml-1 mr-2 h-4 w-4"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <circle
                                                                className="opacity-25"
                                                                cx="12"
                                                                cy="12"
                                                                r="10"
                                                                stroke="currentColor"
                                                                strokeWidth="4"
                                                            ></circle>
                                                            <path
                                                                className="opacity-75"
                                                                fill="currentColor"
                                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                            ></path>
                                                        </svg>
                                                        Resending...
                                                    </span>
                                                ) : countdown > 0 ? (
                                                    `Resend in ${countdown}s`
                                                ) : (
                                                    "Resend Verification Email"
                                                )}
                                            </button>

                                            <button
                                                onClick={() => window.location.reload()}
                                                className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all duration-300 transform hover:scale-105"
                                            >
                                                Back to Login
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="mt-8 text-center">
                                <p className="text-sm text-gray-600 mb-4">
                                    Don't have an account?{" "}
                                    <Link
                                        to="/organization/signup"
                                        className="text-custom-blue hover:text-custom-blue/80 font-medium"
                                    >
                                        Create your organization account
                                    </Link>
                                </p>
                                {/* <p className="text-xs text-gray-500">
                  🎉 Join 200+ companies already using UpInterview
                </p> */}
                            </div>
                        </div>

                        {/* Trust Indicators */}
                        <div className="mt-8 text-center">
                            <p className="text-sm text-gray-500 mb-4">
                                Trusted by leading companies:
                            </p>
                            <div className="flex justify-center space-x-3 mb-4">
                                <div className="bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
                                    <span className="text-xs font-medium text-gray-700">
                                        Stripe
                                    </span>
                                </div>
                                <div className="bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
                                    <span className="text-xs font-medium text-gray-700">
                                        Airbnb
                                    </span>
                                </div>
                                <div className="bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
                                    <span className="text-xs font-medium text-gray-700">
                                        Uber
                                    </span>
                                </div>
                            </div>
                            <div className="inline-flex items-center bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
                                <svg
                                    className="w-4 h-4 text-green-500 mr-2"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <span className="text-xs text-gray-600 font-medium">
                                    🛡️ Enterprise-grade security
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* </div> */}
            {/* v1.0.1 ----------------> */}
        </div>
    );
};

export default OrganizationLogin;
