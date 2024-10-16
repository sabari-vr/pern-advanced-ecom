import { motion } from "framer-motion";
import Input from "../components/Input";
import { Loader, Lock, Mail, User, UserPlus } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import PasswordStrengthMeter from "../components/PasswordStrengthMeter";
import { useAuth } from "../hooks";

const SignUpPage = () => {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const { registerMutation } = useAuth()
	const { isPending } = registerMutation

	const handleSignUp = async (e) => {
		e.preventDefault();

		try {
			registerMutation.mutate({ email, password, name });
		} catch (error) {
			console.log(error);
		}
	};
	return (
		<div className='flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
			<motion.div
				className='sm:mx-auto sm:w-full sm:max-w-md'
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8 }}
			>
				<h2 className='mt-6 text-center text-3xl font-extrabold text-gray-800'>Create your account</h2>
			</motion.div>

			<motion.div
				className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8, delay: 0.2 }}
			>
				<div className='bg-gray-100 py-8 px-4 shadow sm:rounded-lg sm:px-10'>

					<form onSubmit={handleSignUp} className='space-y-6'>
						<div>
							<label htmlFor='name' className='block text-sm font-medium text-gray-700'>
								Full name
							</label>
							<div className='mt-1 relative rounded-md shadow-sm'>
								<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
									<User className='h-5 w-5 text-gray-700' aria-hidden='true' />
								</div>
								<input
									id='name'
									type='text'
									required
									value={name}
									onChange={(e) => setName(e.target.value)}
									className=' block w-full px-3 py-2 pl-10 bg-gray-100 border border-gray-600 
									rounded-md shadow-sm
									 placeholder-gray-400 focus:outline-none focus:ring-gray-700 
									 focus:border-gray-700 sm:text-sm'
									placeholder='Your full-name'
								/>
							</div>
						</div>
						<div>
							<label htmlFor='email' className='block text-sm font-medium text-gray-700'>
								Email address
							</label>
							<div className='mt-1 relative rounded-md shadow-sm'>
								<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
									<Mail className='h-5 w-5 text-gray-400' aria-hidden='true' />
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
									<Lock className='h-5 w-5 text-gray-400' aria-hidden='true' />
								</div>
								<input
									id='password'
									type='password'
									required
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className=' block w-full px-3 py-2 pl-10 bg-gray-100 border border-gray-600 
									rounded-md shadow-sm
									 placeholder-gray-400 focus:outline-none focus:ring-gray-700 
									 focus:border-gray-700 sm:text-sm'
									placeholder='••••••••'
								/>
							</div>
						</div>

						{/* {error && <p className='text-red-500 font-semibold mt-2'>{error}</p>} */}
						<PasswordStrengthMeter password={password} />

						<button
							type='submit'
							className='w-full flex justify-center py-2 px-4 border border-transparent 
							rounded-md shadow-sm text-sm font-medium text-white bg-gray-700
							 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2
							  focus:ring-gray-900 transition duration-150 ease-in-out disabled:opacity-50'
							disabled={isPending}
						>
							{isPending ? <Loader className=' animate-spin mx-auto' size={24} /> : <>
								<UserPlus className='mr-2 h-5 w-5' aria-hidden='true' />
								Sign up
							</>}
						</button>
					</form>
				</div>
				<div className='px-8 py-4  flex justify-center'>
					<p className='text-sm text-gray-400'>
						Already have an account?{" "}
						<Link to={"/login"} className='font-medium text-gray-800 hover:text-gray-500 hover:underline'>
							Login
						</Link>
					</p>
				</div>
			</motion.div>
		</div>
	);
};
export default SignUpPage;
