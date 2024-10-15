import React, { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { useLocation } from 'react-router-dom';

const AppLoyout = ({ children }) => {
    const location = useLocation();

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }, [location.pathname]);
    return (
        <div className='min-h-screen bg-white text-black relative overflow-hidden'>
            <div className='absolute inset-0 overflow-hidden'>
                <div className='absolute inset-0'>
                    <div className='absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-white' />
                </div>
            </div>

            <div className='relative z-20 pt-20'>
                {children}
            </div>
            <Toaster />
        </div>

    )
}

export default AppLoyout