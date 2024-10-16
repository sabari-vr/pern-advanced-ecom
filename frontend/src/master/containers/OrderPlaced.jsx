import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Confetti from "react-confetti";
import { ArrowRight, CheckCircle, HandHeart } from 'lucide-react';

export const OrderPlaced = () => {
    const [searchParams] = useSearchParams()
    const orderId = searchParams.get('orderId')
    return (
        <div className='h-screen flex items-center justify-center px-4'>
            <Confetti
                width={window.innerWidth}
                height={window.innerHeight}
                gravity={0.1}
                style={{ zIndex: 99 }}
                numberOfPieces={700}
                recycle={false}
            />

            <div className='max-w-md w-full bg-gray-100 rounded-lg shadow-xl overflow-hidden relative z-10'>
                <div className='p-6 sm:p-8'>
                    <div className='flex justify-center'>
                        <CheckCircle className='text-emerald-600 w-16 h-16 mb-4' />
                    </div>
                    <h1 className='text-2xl sm:text-3xl font-bold text-center text-emerald-600 mb-2'>
                        Purchase Successful!
                    </h1>

                    <p className='text-gray-600 text-center mb-2'>
                        Thank you for your order. {"We're"} processing it now.
                    </p>
                    <p className='text-gray-600 text-center text-sm mb-6'>
                        Check your email for order details and updates.
                    </p>
                    <div className='bg-gray-200 rounded-lg p-4 mb-6'>
                        <div className='flex items-center justify-between mb-2'>
                            <span className='text-sm text-gray-900'>Order Id</span>
                            <span className='text-sm font-semibold text-gray-900'>{orderId ? orderId : ""}</span>
                        </div>
                        <div className='flex items-center justify-between'>
                            <span className='text-sm text-gray-900'>Estimated delivery</span>
                            <span className='text-sm font-semibold text-gray-900'>3-5 business days</span>
                        </div>
                    </div>

                    <div className='space-y-4'>
                        <button
                            className='w-full bg-gray-700 hover:bg-gray-900 text-white font-bold py-2 px-4
             rounded-lg transition duration-300 flex items-center justify-center'
                        >
                            <HandHeart className='mr-2' size={18} />
                            Thanks for trusting us!
                        </button>
                        <Link
                            to={"/"}
                            className='w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 
            rounded-lg transition duration-300 flex items-center justify-center'
                        >
                            Continue Shopping
                            <ArrowRight className='ml-2' size={18} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default OrderPlaced;
