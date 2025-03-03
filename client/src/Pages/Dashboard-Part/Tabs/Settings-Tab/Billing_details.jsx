import React from 'react'

const Billing_details = () => {
    return (
        <div className='ml-64'>
            <div className='mx-10'>
                <div className="text-2xl text-gray-500 mb-5">Account Details</div>
                <div className="text-2xl font-bold mb-3">Billing Details</div>
                <div className="text-lg mb-5 font-medium">Choose a paln that fits</div>
                <div className="text-lg border rounded p-4 border-green-300 mb-5 px-8">You're on the free plan.Your trail ended on 19 April 2024.</div>

                <section className="bg-white dark:bg-gray-900 mt-10 mb-10">
                    <div>
                        <div className="space-y-8 lg:grid lg:grid-cols-3 sm:gap-6 xl:gap-5 lg:space-y-0">
                            {/* Pricing Card */}
                            <div className="flex flex-col p-2 mx-auto max-w-lg text-gray-900 bg-white rounded-lg border border-gray-100 shadow dark:border-gray-600 dark:bg-gray-800 dark:text-white">
                                <h3 className="text-2xl font-semibold">Standard</h3>
                                <div className="flex items-baseline">
                                    <span className="mr-2 text-xl font-extrabold">$29</span>
                                    <span className="text-gray-500 dark:text-gray-400">/month</span>
                                </div>
                                <p className='mt-3 mb-3'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Nobis, laborum nihil voluptatum corrupti, officia cum id esse incidunt mollitia qui voluptate!</p>
                                <p className="bg-blue-400 px-3 py-1 rounded-xl text-white text-center mx-2 my-1">
                                    Select
                                </p>
                            </div>
                            {/* Pricing Card */}
                            <div className="flex flex-col p-2 mx-auto max-w-lg text-gray-900 bg-white rounded-lg border border-gray-100 shadow dark:border-gray-600 dark:bg-gray-800 dark:text-white">
                                <h3 className="text-2xl font-semibold">Teams</h3>
                                <div className="flex items-baseline">
                                    <span className="mr-2 text-xl font-extrabold">$99</span>
                                    <span className="text-gray-500 dark:text-gray-400">/month</span>
                                </div>
                                <p className='mt-3 mb-3'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Nobis, laborum nihil voluptatum corrupti, officia cum id esse incidunt mollitia qui voluptate!</p>

                                <p className="bg-blue-400 px-3 py-1 rounded-xl text-white text-center mx-2 my-1">
                                    Select
                                </p>
                            </div>
                            {/* Pricing Card */}
                            <div className="flex flex-col p-2 mx-auto max-w-lg text-gray-900 bg-white rounded-lg border border-gray-100 shadow dark:border-gray-600 dark:bg-gray-800 dark:text-white">
                                <h3 className="text-2xl font-semibold">Enterprise</h3>
                                <div className="flex items-baseline">
                                    <span className="mr-2 text-xl font-extrabold">$499</span>
                                    <span className="text-gray-500 dark:text-gray-400">/month</span>
                                </div>
                                <p className='mt-3 mb-3'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Nobis, laborum nihil voluptatum corrupti, officia cum id esse incidunt mollitia qui voluptate!</p>

                                <p className="bg-blue-400 text-white px-3 py-1 rounded-xl text-center mx-2 my-1">
                                    Select
                                </p>
                            </div>
                        </div>
                        <div className='mt-5 shadow'>
                            <div className='p-3 bg-gray border'>
                                <p className='text-center font-semibold'>
                                    Compare features by category
                                </p>
                                <ul className='flex justify-between mt-3'>
                                    <li>View All</li>
                                    <li>Core features</li>
                                    <li>Customizations</li>
                                    <li>Team tools</li>
                                    <li>Integration</li>
                                    <li>Security and control</li>
                                    <li>Support</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}

export default Billing_details