import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import CartItem from "../components/CartItem";
import PeopleAlsoBought from "../components/PeopleAlsoBought";
import OrderSummary from "../components/OrderSummary";
import GiftCouponCard from "../components/GiftCouponCard";
import { useCartScope } from "../context";
import { useCart, useUser } from "../hooks";
import LoadingSpinner from "../components/LoadingSpinner";
import BackdropLoadingSpinner from "../components/BackdropLoadingSpinner";
import { useImmer } from "use-immer";

const CartPage = () => {
    const { CartState: { cart }, isLoading } = useCartScope()
    const { updateQuantityCartMutation,
        removeAllFromCartMutation } = useCart({ load: false })
    const [isPaymentProcessing, setIsPaymentProcessing] = useImmer(false)
    const { addresses, isLoading: addressLoading } = useUser({ load: true })

    if (isLoading || addressLoading) {
        return < LoadingSpinner />
    }

    return (
        <div className='py-8 md:py-16'>
            <BackdropLoadingSpinner isLoading={isPaymentProcessing} text="We are processing your payment. Please&nbsp;wait..." />
            <div className='mx-auto max-w-screen-xl px-4 2xl:px-0'>
                <div className='mt-6 sm:mt-8 md:gap-6 lg:flex lg:items-start xl:gap-8'>
                    <motion.div
                        className='mx-auto w-full flex-none lg:max-w-2xl xl:max-w-4xl'
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        {cart.length === 0 ? (
                            <EmptyCartUI />
                        ) : (
                            <div className='space-y-6'>
                                {cart.map((item, index) => (
                                    <CartItem key={item.id + 'cartitem' + index} item={item} updateQuantityM={updateQuantityCartMutation} removeAllFromCartM={removeAllFromCartMutation} />
                                ))}
                            </div>
                        )}
                        {cart.length > 0 && <PeopleAlsoBought />}
                    </motion.div>

                    {cart.length > 0 && (
                        <motion.div
                            className='mx-auto mt-6 max-w-4xl flex-1 space-y-6 lg:mt-0 lg:w-full'
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                        >
                            <OrderSummary data={addresses} setLoading={setIsPaymentProcessing} />
                            <GiftCouponCard />
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};
export default CartPage;

const EmptyCartUI = () => (
    <motion.div
        className='flex flex-col items-center justify-center space-y-4 py-8'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
    >
        <ShoppingCart className='h-24 w-24 text-gray-700' />
        <h3 className='text-2xl font-semibold '>Your cart is empty</h3>
        <p className='text-gray-600'>Looks like you {"haven't"} added anything to your cart yet.</p>
        <Link
            className='mt-4 rounded-md bg-gray-700 px-6 py-2 text-white transition-colors hover:bg-gray-900'
            to='/'
        >
            Start Shopping
        </Link>
    </motion.div>
);