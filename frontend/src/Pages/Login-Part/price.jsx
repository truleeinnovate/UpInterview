import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import { ReactComponent as FaCrown } from '../../icons/FaCrown.svg';
import { ReactComponent as IoIosPerson } from '../../icons/IoIosPerson.svg';
import { ReactComponent as MdPersonAdd } from '../../icons/MdPersonAdd.svg';
import { ReactComponent as AiTwotoneSchedule } from '../../icons/AiTwotoneSchedule.svg';
import { ReactComponent as MdOutlineSchedule } from '../../icons/MdOutlineSchedule.svg';
import { ReactComponent as RiFoldersFill } from '../../icons/RiFoldersFill.svg';
import { ReactComponent as MdOutlineLock } from '../../icons/MdOutlineLock.svg';
import { ReactComponent as FaRegAddressCard } from '../../icons/FaRegAddressCard.svg';

const Price = () => {

    const [selectedPlan, setSelectedPlan] = useState(null);
    const [billingCycle, setBillingCycle] = useState('monthly');
    const [paymentMethod, setPaymentMethod] = useState('creditCard');
    const [cardDetails, setCardDetails] = useState({
        cardType: 'creditCard',
        cardNumber: '',
        expiryDate: '',
        cvv: ''
    });

    const handlePaymentMethodChange = (event) => {
        setPaymentMethod(event.target.value);
        setCardDetails({ ...cardDetails, cardType: event.target.value });
    };

    const handleCardDetailsChange = (event) => {
        const { name, value } = event.target;
        setCardDetails({ ...cardDetails, [name]: value });
    };

    const handleSubmit = async () => {
        const invoice = {
            invoiceId: 'INV001',
            customerId: 'CUST123',
            invoiceDate: new Date(),
            dueDate: new Date(),
            status: 'issued',
            totalAmount: 1100.00,
            subtotal: 1000.00,
            taxAmount: 100.00,
            discount: 50.00,
            currency: 'USD',
            paymentStatus: 'partially_paid',
            paymentMethod: paymentMethod,
            notes: 'Payment due by end of the month.'
        };

        const invoiceLines = [
            { lineId: 'LINE001', description: 'Description 1', amount: 500.00 },
            { lineId: 'LINE002', description: 'Description 2', amount: 500.00 }
        ];

        const payment = {
            paymentId: 'PAY001',
            amount: 1000.00,
            date: new Date(),
            method: paymentMethod
        };

        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/organization/invoice`, {
                invoice,
                invoiceLines,
                payment,
                cardDetails
            });
            navigate('/home');
        } catch (error) {
            console.error('Error saving invoice and payment details:', error);
            alert('Error saving invoice and payment details');
        }
    };

    const [plans, setPlans] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/plans`);
                const contentType = response.headers['content-type'];

                if (contentType && contentType.includes('application/json')) {
                    console.log('Fetched plans:', response.data);
                    setPlans(response.data);
                } else {
                    console.error('Expected JSON response but received:', response);
                    throw new Error('Expected JSON response but received a different type');
                }
            } catch (error) {
                console.error('Error fetching plans:', error);
            }
        };
        fetchPlans();
    }, []);

    const handleBuyClick = async (plan) => {
        try {
            if (plan === 'free') {
                await axios.post(`${process.env.REACT_APP_API_URL}/organization/free`);
                navigate('/home');
            } else {
                setSelectedPlan(plan);
            }
        } catch (error) {
            console.error(`Error saving ${plan} plan:`, error);
        }
    };

    const handleBillingCycleChange = (event) => {
        setBillingCycle(event.target.value);
    };

    const handleSubscriptionBillingCycleChange = (event) => {
        setBillingCycle(event.target.value);
    };

    // const calculateTotal = (plan, billingCycle) => {
    //     if (billingCycle === 'yearly') {
    //         return plan === 'basic' ? 30 : 144;
    //     }
    //     return plan === 'basic' ? 9 : 12;
    // };

    const calculateTotal = (plan, billingCycle) => {
        const selectedPlan = plans.find(p => p.planName === plan);
        if (!selectedPlan) return 0;
        return billingCycle === 'yearly' ? selectedPlan.priceYearly : selectedPlan.priceMonthly;
    };

    return (
        <div className="container mx-auto">
            <div>
                <header className="flex justify-between items-center py-4">
                    <div className="text-2xl font-bold mx-5">LOGO</div>
                </header>
                <div className="w-full border-b border-gray-300 mb-6"></div>
            </div>

            <div className='mx-5 mb-5'>
                {!selectedPlan ? (
                    <main>
                        <div className="text-center mb-8">
                            <h1 className="text-4xl font-bold mb-2">Pricing plan</h1>
                            <p>
                                Choose the Organization plan for seamless management of multiple users, internal interviews, and outsourced interviewers.
                            </p>
                        </div>
                        <div className="flex justify-between mb-8">
                            <div className="ml-auto">
                                <select className="border p-2 rounded" value={billingCycle} onChange={handleBillingCycleChange}>
                                    <option value="monthly">Monthly</option>
                                    <option value="yearly">Yearly</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Free Plan */}
                            {/* <div className="border rounded-lg p-6 relative">
                                <h2 className="text-xl font-bold mb-2">Free</h2>
                                <p className="mb-4 text-sm">Manage interviews easily, without spending a cent.</p>
                                <div className="text-3xl font-bold mb-4">$ 0</div>
                                <button
                                    className="bg-blue-500 text-white py-2 px-4 rounded mb-4"
                                    onClick={() => handleBuyClick('free')}
                                >
                                    Get Started
                                </button>

                                <div className="absolute left-0 right-0 border-b border-gray-200  mb-4"></div>

                                <h3 className="font-bold mb-2">Free includes</h3>
                                <ul className="list-none space-y-2">
                                    <li className="flex items-center">
                                        <div className=" text-xl text-blue-500"><MdPerson />
                                        </div>
                                        <div className="ml-2">1 User</div>
                                    </li>
                                    <li className="flex items-center">
                                        <div className=" text-xl text-blue-500"><AiOutlineSchedule />
                                        </div>
                                        <div className="ml-2">5 Schedules</div>
                                    </li>
                                    <li className="flex items-center">
                                        <div className=" text-xl text-blue-500"><IoMdTime />
                                        </div>
                                        <div className="ml-2">1 Hour per session</div>
                                    </li>
                                    <li className="flex items-center">
                                        <div className=" text-xl text-blue-500"><MdPersonAdd />
                                        </div>
                                        <div className="ml-2">Unlimited Outsource Interviewers</div>
                                    </li>
                                    <li className="flex items-center">
                                        <div className=" text-xl text-blue-500"><RiFoldersFill />
                                        </div>
                                        <div className="ml-2">200 MB Bandwidth</div>
                                    </li>
                                </ul>
                            </div> */}
                            {/* Basic Plan */}
                            {/* <div className="border rounded-lg p-6 relative">
                                <div className="absolute top-0 right-0 mt-2 mr-2 text-2xl text-yellow-500">< FaCrown /> </div>
                                <h2 className="text-xl font-bold mb-2">Basic</h2>
                                <p className="mb-4 text-sm">Professional tools for outsourced interviewers to take interviews.</p>
                                <div className="text-3xl font-bold mb-4">
                                    {billingCycle === 'yearly' ? '$ 30' : '$ 9'} <span className="text-sm">/{billingCycle}</span>
                                </div>
                                <button className="bg-blue-500 text-white py-2 px-4 rounded mb-4" onClick={() => handleBuyClick('basic')}>Buy Basic</button>
                                <div className="absolute left-0 right-0 border-b border-gray-300 mb-4"></div>
                                <h3 className="font-bold mb-2">Basic includes</h3>
                                <ul className="list-none space-y-2">
                                    <li className="flex items-center">
                                        <div className=" text-xl text-blue-500"><MdPerson />
                                        </div>
                                        <div className="ml-2">5 User</div>
                                    </li>
                                    <li className="flex items-center">
                                        <div className=" text-xl text-blue-500"><AiOutlineSchedule />
                                        </div>
                                        <div className="ml-2">20 Schedules</div>
                                    </li>
                                    <li className="flex items-center">
                                        <div className=" text-xl text-blue-500"><IoMdTime />
                                        </div>
                                        <div className="ml-2">2 Hour per session</div>
                                    </li>
                                    <li className="flex items-center">
                                        <div className=" text-xl text-blue-500"><MdPersonAdd />
                                        </div>
                                        <div className="ml-2">Unlimited Outsource Interviewers</div>
                                    </li>
                                    <li className="flex items-center">
                                        <div className=" text-xl text-blue-500"><RiFoldersFill />
                                        </div>
                                        <div className="ml-2">400 MB Bandwidth</div>
                                    </li>
                                </ul>
                            </div> */}
                            {/* Advanced Plan */}
                            {/* <div className="border rounded-lg p-6 relative">
                                <div className="absolute top-0 right-0 mt-2 mr-2 text-2xl text-yellow-500">< FaCrown /> </div>

                                <h2 className="text-xl font-bold mb-2">Advanced</h2>
                                <p className="mb-4 text-sm">Manage users, internal interviews, and outsource interviewers with ease.</p>
                                <div className="text-3xl font-bold mb-4">
                                    {billingCycle === 'yearly' ? '$ 144' : '$ 12'} <span className="text-sm">/{billingCycle}</span>
                                </div>
                                <button className="bg-blue-500 text-white py-2 px-4 rounded mb-4" onClick={() => handleBuyClick('advanced')}>Buy Advanced</button>
                                <div className="absolute left-0 right-0 border-b border-gray-300 mb-4"></div>
                                <h3 className="font-bold mb-2">Advanced includes</h3>
                                <ul className="list-none space-y-2">
                                    <li className="flex items-center">
                                        <div className=" text-xl text-blue-500"><MdPerson />
                                        </div>
                                        <div className="ml-2">10 User</div>
                                    </li>
                                    <li className="flex items-center">
                                        <div className=" text-xl text-blue-500"><AiOutlineSchedule />
                                        </div>
                                        <div className="ml-2">50 Schedules</div>
                                    </li>
                                    <li className="flex items-center">
                                        <div className=" text-xl text-blue-500"><IoMdTime />
                                        </div>
                                        <div className="ml-2">2 Hour per session</div>
                                    </li>
                                    <li className="flex items-center">
                                        <div className=" text-xl text-blue-500"><MdPersonAdd />
                                        </div>
                                        <div className="ml-2">Unlimited Outsource Interviewers</div>
                                    </li>
                                    <li className="flex items-center">
                                        <div className=" text-xl text-blue-500"><RiFoldersFill />
                                        </div>
                                        <div className="ml-2">500 MB Bandwidth</div>
                                    </li>
                                </ul>
                            </div> */}


                            {/* {plans.map(plan => (
                                <div key={plan.planName} className="border rounded-lg p-6 relative">
                                    {plan.planName !== 'free' && <div className="absolute top-0 right-0 mt-2 mr-2 text-2xl text-yellow-500"><FaCrown /></div>}
                                    <h2 className="text-xl font-bold mb-2">{plan.planName.charAt(0).toUpperCase() + plan.planName.slice(1)}</h2>
                                    <p className="mb-4 text-sm">{plan.planName === 'free' ? 'Manage interviews easily, without spending a cent.' : 'Professional tools for outsourced interviewers to take interviews.'}</p>
                                    <div className="text-3xl font-bold mb-4">
                                        {billingCycle === 'yearly' ? `$ ${plan.priceYearly}` : `$ ${plan.priceMonthly}`} <span className="text-sm">/{billingCycle}</span>
                                    </div>
                                    <button className="bg-blue-500 text-white py-2 px-4 rounded mb-4" onClick={() => handleBuyClick(plan.planName)}>Buy {plan.planName.charAt(0).toUpperCase() + plan.planName.slice(1)}</button>
                                    <div className="absolute left-0 right-0 border-b border-gray-300 mb-4"></div>
                                    <h3 className="font-bold mb-2">{plan.planName.charAt(0).toUpperCase() + plan.planName.slice(1)} includes</h3>
                                    <ul className="list-none space-y-2">
                                        <li className="flex items-center">
                                            <div className="text-xl text-blue-500"><MdPerson /></div>
                                            <div className="ml-2">{plan.users} User{plan.users > 1 ? 's' : ''}</div>
                                        </li>
                                        <li className="flex items-center">
                                            <div className="text-xl text-blue-500"><AiOutlineSchedule /></div>
                                            <div className="ml-2">{plan.schedules} Schedules</div>
                                        </li>
                                        <li className="flex items-center">
                                            <div className="text-xl text-blue-500"><IoMdTime /></div>
                                            <div className="ml-2">{plan.hoursPerSession} Hour{plan.hoursPerSession > 1 ? 's' : ''} per session</div>
                                        </li>
                                        <li className="flex items-center">
                                            <div className="text-xl text-blue-500"><MdPersonAdd /></div>
                                            <div className="ml-2">{plan.outsourceInterviewers} Outsource Interviewers</div>
                                        </li>
                                        <li className="flex items-center">
                                            <div className="text-xl text-blue-500"><RiFoldersFill /></div>
                                            <div className="ml-2">{plan.bandwidth} Bandwidth</div>
                                        </li>
                                    </ul>
                                </div>
                            ))} */}

                            {Array.isArray(plans) && ['free', 'basic', 'advanced'].map(planName => {
                                const plan = plans.find(p => p.planName === planName);
                                if (!plan) return null;
                                return (
                                    <div key={plan.planName} className="border rounded-lg p-6 relative">
                                        {plan.planName !== 'free' && <div className="absolute top-0 right-0 mt-2 mr-2 text-2xl text-yellow-500"><FaCrown /></div>}
                                        <h2 className="text-xl font-bold mb-2">{plan.planName.charAt(0).toUpperCase() + plan.planName.slice(1)}</h2>
                                        <p className="mb-4 text-sm">{plan.planName === 'free' ? 'Manage interviews easily, without spending a cent.' : 'Professional tools for outsourced interviewers to take interviews.'}</p>
                                        <div className="text-3xl font-bold mb-4">
                                            {billingCycle === 'yearly' ? `$ ${plan.priceYearly}` : `$ ${plan.priceMonthly}`} <span className="text-sm">/{billingCycle}</span>
                                        </div>
                                        <button className="bg-blue-500 text-white py-2 px-4 rounded mb-4" onClick={() => handleBuyClick(plan.planName)}>Buy {plan.planName.charAt(0).toUpperCase() + plan.planName.slice(1)}</button>
                                        <div className="absolute left-0 right-0 border-b border-gray-300 mb-4"></div>
                                        <h3 className="font-bold mb-2">{plan.planName.charAt(0).toUpperCase() + plan.planName.slice(1)} includes</h3>
                                        <ul className="list-none space-y-2">
                                            <li className="flex items-center">
                                                <div className="text-xl text-blue-500"><IoIosPerson /></div>
                                                <div className="ml-2">{plan.users} User{plan.users > 1 ? 's' : ''}</div>
                                            </li>
                                            <li className="flex items-center">
                                                <div className="text-xl text-blue-500"><AiTwotoneSchedule /></div>
                                                <div className="ml-2">{plan.schedules} Schedules</div>
                                            </li>
                                            <li className="flex items-center">
                                                <div className="text-xl text-blue-500"><MdOutlineSchedule /></div>
                                                <div className="ml-2">{plan.hoursPerSession} Hour{plan.hoursPerSession > 1 ? 's' : ''} per session</div>
                                            </li>
                                            <li className="flex items-center">
                                                <div className="text-xl text-blue-500"><MdPersonAdd /></div>
                                                <div className="ml-2">{plan.outsourceInterviewers} Outsource Interviewers</div>
                                            </li>
                                            <li className="flex items-center">
                                                <div className="text-xl text-blue-500"><RiFoldersFill /></div>
                                                <div className="ml-2">{plan.bandwidth} Bandwidth</div>
                                            </li>
                                        </ul>
                                    </div>
                                );
                            })}

                        </div>
                    </main>
                ) : (
                    <div className="container mx-auto p-10 font-sans" style={{ fontFamily: 'Arial, sans-serif' }}>
                        <main>
                            <div className="text-left mb-8">
                                <h1 className="text-3xl font-bold mb-2">Buy {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)}</h1>
                            </div>
                            <div className="flex justify-between mb-8 space-x-6">
                                <div className="w-2/3 pr-4 border rounded-lg p-6">
                                    <h2 className="text-2xl font-bold mb-4">Your Subscription to the {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} Plan</h2>
                                    <div className="mb-4">
                                        <h3 className="text-sm font-bold mb-2">CHOOSE BILLING CYCLE</h3>
                                        <div className="flex space-x-4">
                                            <label className="relative flex items-center border p-4 rounded cursor-pointer w-1/2">
                                                <input
                                                    type="radio"
                                                    value="monthly"
                                                    checked={billingCycle === 'monthly'}
                                                    onChange={handleSubscriptionBillingCycleChange}
                                                    className="hidden"
                                                />
                                                <div className="flex items-center">
                                                    <div className={`w-4 h-4 rounded-full border-2 ${billingCycle === 'monthly' ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}></div>
                                                    <div className="ml-2">
                                                        <span className="block font-semibold">Monthly</span>
                                                        <span className="block"> ${selectedPlan === 'basic' ? 9 : 12} per / Monthly</span>
                                                    </div>
                                                </div>
                                            </label>
                                            <label className="relative flex items-center border p-4 rounded cursor-pointer w-1/2">
                                                <input
                                                    type="radio"
                                                    value="yearly"
                                                    checked={billingCycle === 'yearly'}
                                                    onChange={handleSubscriptionBillingCycleChange}
                                                    className="hidden"
                                                />
                                                <div className="flex items-center">
                                                    <div className={`w-4 h-4 rounded-full border-2 ${billingCycle === 'yearly' ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}></div>
                                                    <div className="ml-2">
                                                        <span className="block font-semibold">Yearly</span>
                                                        <span className="block"> ${selectedPlan === 'basic' ? 30 : 144} per / Yearly</span>
                                                    </div>
                                                </div>
                                                <span className="absolute top-1 right-1 bg-green-900 text-white font-bold px-2 py-1 rounded">Save ${selectedPlan === 'basic' ? 24 : 48}</span>
                                            </label>
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <h3 className="text-sm font-bold mb-2">ADD PAYMENT METHOD</h3>
                                        <div>
                                            <label className="flex flex-col border p-4 rounded cursor-pointer mb-2">
                                                <div className="flex items-center w-full">
                                                    <input
                                                        type="radio"
                                                        value="creditCard"
                                                        checked={paymentMethod === 'creditCard'}
                                                        onChange={handlePaymentMethodChange}
                                                        className="hidden"
                                                    />
                                                    <div className={`w-4 h-4 rounded-full border-2 ${paymentMethod === 'creditCard' ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}></div>
                                                    <span className="ml-2 flex items-center">
                                                        <FaRegAddressCard className="mr-1" />
                                                        Credit Card
                                                    </span>
                                                    <span className="ml-auto text-gray-500 flex items-center">
                                                        <MdOutlineLock className="mr-1" />
                                                        Secure Payment
                                                    </span>
                                                </div>
                                                {paymentMethod === 'creditCard' && (
                                                    <div className="mt-4 grid grid-cols-3 gap-4">
                                                        <div className="relative col-span-3">
                                                            <FaRegAddressCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                                            <input
                                                                type="text"
                                                                name="cardNumber"
                                                                placeholder="Card Number"
                                                                value={cardDetails.cardNumber}
                                                                onChange={handleCardDetailsChange}
                                                                className="pl-10 border p-1 rounded w-full"
                                                            />
                                                        </div>
                                                        <input
                                                            type="text"
                                                            name="expiryDate"
                                                            placeholder="MM/YY"
                                                            value={cardDetails.expiryDate}
                                                            onChange={handleCardDetailsChange}
                                                            className="border p-1 rounded col-span-1"
                                                        />
                                                        <input
                                                            type="text"
                                                            name="cvv"
                                                            placeholder="CVC"
                                                            value={cardDetails.cvv}
                                                            onChange={handleCardDetailsChange}
                                                            className="border p-1 rounded col-span-1"
                                                        />
                                                    </div>
                                                )}
                                            </label>
                                            <label className="flex items-center border p-4 rounded cursor-pointer">
                                                <input
                                                    type="radio"
                                                    value="upi"
                                                    checked={paymentMethod === 'upi'}
                                                    onChange={handlePaymentMethodChange}
                                                    className="hidden"
                                                />
                                                <div className="flex items-center">
                                                    <div className={`w-4 h-4 rounded-full border-2 ${paymentMethod === 'upi' ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}></div>
                                                    <span className="ml-2 flex items-center">
                                                        <FaRegAddressCard className="mr-1" />
                                                        UPI
                                                    </span>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-1/3 border rounded-lg p-6">
                                    <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
                                    <div className="mb-4 flex justify-between items-center border-b pb-2">
                                        <p className="text-sm font-bold">{selectedPlan.toUpperCase()} {billingCycle.toUpperCase()} SUBSCRIPTION</p>
                                    </div>
                                    <div className="mb-4 flex justify-between items-center border-b pb-2">
                                        <p>{billingCycle === 'yearly' ? `$${selectedPlan === 'basic' ? 30 : 144} x 1 year` : `$${selectedPlan === 'basic' ? 9 : 12} x 1 month`}</p>
                                        <p>${calculateTotal(selectedPlan, billingCycle)} USD</p>
                                    </div>
                                    <div className="mb-4 flex justify-between items-center border-b pb-2">
                                        <p>Sales Tax</p>
                                        <p>Not yet calculated</p>
                                    </div>
                                    <div className="mb-4 flex justify-between items-center border-b pb-2 mt-4">
                                        <p className="text-sm font-bold">TOTAL DUE TODAY</p>
                                        <p className="text-sm font-bold">${calculateTotal(selectedPlan, billingCycle)} USD</p>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-4">
                                        You'll be charged this amount every {billingCycle} unless you change or cancel your subscription.
                                    </p>
                                    <button onClick={handleSubmit} className="bg-blue-500 text-white py-2 px-4 rounded w-full">Payment</button>
                                </div>
                            </div>
                        </main>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Price;
