import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Loader, ArrowRight, LogIn } from "lucide-react";
import { Link } from "react-router-dom";
import Input from "../components/Input";
import { useAuth } from "../hooks";

const LoginPage = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const { loginMutation } = useAuth()
	const { isPending } = loginMutation

	const handleLogin = async (e) => {
		e.preventDefault();
		loginMutation.mutate({ email, password })
	};

	return (
		<div className='flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
			<motion.div
				className='sm:mx-auto sm:w-full sm:max-w-md'
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8 }}
			>
				<h2 className='mt-6 text-center text-3xl font-extrabold text-gray-800'>Login to your account</h2>
			</motion.div>

			<motion.div
				className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8, delay: 0.2 }}
			>
				<div className='bg-gray-100 border border-gray-200 shadow-lg  py-8 px-4  sm:rounded-lg sm:px-10'>

					<form onSubmit={handleLogin} className='space-y-6'>
						<div>
							<label htmlFor='email' className='block text-sm font-medium text-gray-700'>
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
						<div>
							<label htmlFor='password' className='block text-sm font-medium text-gray-700'>
								Password
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
						<button
							type='submit'
							className='w-full flex justify-center py-2 px-4 border border-transparent 
							rounded-md shadow-sm text-sm font-medium text-white bg-gray-700
							 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2
							  focus:ring-gray-900 transition duration-150 ease-in-out disabled:opacity-50'
							disabled={isPending}
						>
							{isPending ? (
								<>
									<Loader className='mr-2 h-5 w-5 animate-spin' aria-hidden='true' />
									Loading...
								</>
							) : (
								<>
									<LogIn className='mr-2 h-5 w-5' aria-hidden='true' />
									Login
								</>
							)}
						</button>
						<div className='flex items-center mb-6'>
							<Link to='/forgot-password' className='text-sm text-gray-800 hover:text-gray-500 hover:underline'>
								Forgot password?
							</Link>
						</div>
					</form>
				</div>

				<p className='mt-8 text-center text-sm text-gray-400'>
					Not a member?{" "}
					<Link to='/signup' className='font-medium text-gray-800 hover:text-gray-500 hover:underline'>
						Sign up now <ArrowRight className='inline h-4 w-4' />
					</Link>
				</p>
			</motion.div>
		</div>
	);
};
export default LoginPage;
