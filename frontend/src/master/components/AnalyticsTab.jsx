import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Users, Package, ShoppingCart, DollarSign } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useDashBoard } from "../hooks";

const AnalyticsTab = () => {
    const [analyticsData, setAnalyticsData] = useState({
        totalUsers: 0,
        totalProducts: 0,
        totalSales: 0,
        totalRevenue: 0,
    });
    const [dailySalesData, setDailySalesData] = useState([]);

    const { getAnalyticsDataQuery } = useDashBoard({ load: true })

    const { data, isLoading } = getAnalyticsDataQuery

    useEffect(() => {
        if (!!data && !isLoading) {
            setAnalyticsData(data.analyticsData)
            setDailySalesData(data.dailySalesData)
        }
    }, [data]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
                <AnalyticsCard
                    title='Total Users'
                    value={analyticsData.totalUsers.toLocaleString()}
                    icon={Users}
                    color='from-emerald-500 to-teal-700'
                />
                <AnalyticsCard
                    title='Total Products'
                    value={analyticsData.totalProducts.toLocaleString()}
                    icon={Package}
                    color='from-emerald-500 to-green-700'
                />
                <AnalyticsCard
                    title='Total Sales'
                    value={analyticsData.totalSales.toLocaleString()}
                    icon={ShoppingCart}
                    color='from-emerald-500 to-cyan-700'
                />
                <AnalyticsCard
                    title='Total Revenue'
                    value={`₹ ${analyticsData.totalRevenue.toLocaleString()}`}
                    icon={DollarSign}
                    color='from-emerald-500 to-lime-700'
                />
            </div>
            <motion.div
                className="bg-white rounded-lg p-6 shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
            >
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={dailySalesData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" /> {/* Light grid */}
                        <XAxis dataKey="name" stroke="#374151" /> {/* Darker text */}
                        <YAxis yAxisId="left" stroke="#374151" />
                        <YAxis yAxisId="right" orientation="right" stroke="#374151" />
                        <Tooltip />
                        <Legend />
                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="sales"
                            stroke="#34D399"
                            activeDot={{ r: 8 }}
                            name="Sales"
                        />
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="revenue"
                            stroke="#60A5FA"
                            activeDot={{ r: 8 }}
                            name="Revenue"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </motion.div>
        </div>
    );
};
export default AnalyticsTab;

const AnalyticsCard = ({ title, value, icon: Icon, color }) => (
    <motion.div
        className={`bg-gray-100 rounded-lg p-6 shadow-lg overflow-hidden relative ${color}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
    >
        <div className='flex justify-between items-center'>
            <div className='z-10'>
                <p className='text-gray-700 text-sm mb-1 font-semibold'>{title}</p>
                <h3 className='text-white text-3xl font-bold'>{value}</h3>
            </div>
        </div>
        <div className='absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-900 opacity-30' />
        <div className='absolute -bottom-4 -right-4 text-gray-800 opacity-50'>
            <Icon className='h-32 w-32' />
        </div>
    </motion.div>
);