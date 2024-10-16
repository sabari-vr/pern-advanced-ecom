import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Input from "../components/Input";
import { ArrowLeft, Loader, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks";

const ForgotPasswordPage = () => {
	const [email, setEmail] = useState("");
	const [isSubmitted, setIsSubmitted] = useState(false);

	const { forgotPasswordMutation } = useAuth()

	const handleSubmit = async (e) => {
		e.preventDefault();
		forgotPasswordMutation.mutate(email);
	};

	useEffect(() => {
		if (forgotPasswordMutation.isSuccess) {
			setIsSubmitted(true);
		}
	}, [forgotPasswordMutation.isSuccess])

	return (
		<div className='flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
			<motion.div
				className='sm:mx-auto sm:w-full sm:max-w-md'
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8 }}
			>
				<h2 className='mt-6 text-center text-3xl font-extrabold text-gray-800'>Forgot Password</h2>
			</motion.div>

			<motion.div
				className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8, delay: 0.2 }}
			>
				<div className='bg-gray-100 py-8 px-4 shadow sm:rounded-lg sm:px-10'>

					{!isSubmitted ? (
						<form onSubmit={handleSubmit} className='space-y-6'>
							<p className='text-gray-700 mb-6 text-center'>
								Enter your email address and we'll send you a link to reset your password.
							</p>
							<div>
								<label htmlFor='email' className='block text-sm font-medium text-gray-300'>
									Email address
								</label>
								<div className='mt-1 relative rounded-md shadow-sm'>
									<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
										<Mail className='h-5 w-5 text-gray-700' aria-hidden='true' />
									</div>
									<input
										id='email'
										type='email'
										required
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										className=' block w-full px-3 py-2 pl-10 bg-gray-100 border border-gray-600 
										rounded-md shadow-sm
										 placeholder-gray-400 focus:outline-none focus:ring-gray-700 
										 focus:border-gray-700 sm:text-sm'
										placeholder='you@example.com'
									/>
								</div>
							</div>

							<motion.button
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
								className='w-full flex justify-center py-2 px-4 border border-transparent 
							rounded-md shadow-sm text-sm font-medium text-white bg-gray-700
							 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2
							  focus:ring-gray-900 transition duration-150 ease-in-out disabled:opacity-50'
								type='submit'
							>
								{forgotPasswordMutation.isPending ? <Loader className='size-6 animate-spin mx-auto' /> : "Send Reset Link"}
							</motion.button>
						</form>
					) : (
						<div className='text-center'>
							<motion.div
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								transition={{ type: "spring", stiffness: 500, damping: 30 }}
								className='w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4'
							>
								<Mail className='h-8 w-8 text-white' />
							</motion.div>
							<p className='text-gray-700 mb-6'>
								If an account exists for {email}, you will receive a password reset link shortly.
							</p>
						</div>
					)}
				</div>

				<p className='mt-8 text-center text-sm text-gray-400'>
					<Link to='/login' className='font-medium text-gray-800 hover:text-gray-500 hover:underline'>
						Back to Login
					</Link>
				</p>

			</motion.div>
		</div>
	);
};
export default ForgotPasswordPage;
