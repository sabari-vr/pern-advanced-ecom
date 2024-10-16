import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import { Lock } from "lucide-react";
import { useAuth } from "../hooks";
import PasswordStrengthMeter from "../components/PasswordStrengthMeter";

const ResetPasswordPage = () => {
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState("")
	const { resetPasswordMutation } = useAuth()

	const { token } = useParams();

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (password !== confirmPassword) {
			return setError("Passwords do not match");
		}
		try {
			resetPasswordMutation.mutate({ token, password });
		} catch (error) {
			console.error(error);
		}
	};

	useEffect(() => {
		if (!!error) {
			if (password === confirmPassword) {
				return setError("");
			}
		}

	}, [password, confirmPassword])

	return (
		<div className='flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
			<motion.div
				className='sm:mx-auto sm:w-full sm:max-w-md'
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8 }}
			>
				<h2 className='mt-6 text-center text-3xl font-extrabold text-gray-800'>Reset Password</h2>
			</motion.div>

			<motion.div
				className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8, delay: 0.2 }}
			>
				<div className='bg-gray-100 py-8 px-4 shadow sm:rounded-lg sm:px-10'>
					{error && <p className='text-red-500 text-sm mb-4'>{error}</p>}
					{/* {message && <p className='text-green-500 text-sm mb-4'>{message}</p>} */}

					<form onSubmit={handleSubmit} className='space-y-6'>
						<div>
							<label htmlFor='password' className='block text-sm font-medium text-gray-700'>
								New Password
							</label>
							<div className='mt-1 relative rounded-md shadow-sm'>
								<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
									<Lock className='h-5 w-5 text-gray-700' aria-hidden='true' />
								</div>
								<input
									id='password'
									type='password'
									required
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className=' block w-full px-3 py-2 pl-10 bg-gray-100 border border-gray-600 
									rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-700 focus:border-gray-700 sm:text-sm'
									placeholder='••••••••'
								/>
							</div>
						</div>
						<div>
							<label htmlFor='password' className='block text-sm font-medium text-gray-700'>
								Confirm New Password
							</label>
							<div className='mt-1 relative rounded-md shadow-sm'>
								<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
									<Lock className='h-5 w-5 text-gray-700' aria-hidden='true' />
								</div>
								<input
									id='password'
									type='password'
									required
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									className=' block w-full px-3 py-2 pl-10 bg-gray-100 border border-gray-600 
									rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-700 focus:border-gray-700 sm:text-sm'
									placeholder='••••••••'
								/>
							</div>
						</div>

						<PasswordStrengthMeter password={password} />

						<motion.button
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
							className='w-full flex justify-center py-2 px-4 border border-transparent 
							rounded-md shadow-sm text-sm font-medium text-white bg-gray-700
							 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2
							  focus:ring-gray-900 transition duration-150 ease-in-out disabled:opacity-50'
							type='submit'
							disabled={resetPasswordMutation.isPending}
						>
							{resetPasswordMutation.isPending ? "Resetting..." : "Set New Password"}
						</motion.button>
					</form>
				</div>
			</motion.div>
		</div>
	);
};
export default ResetPasswordPage;
