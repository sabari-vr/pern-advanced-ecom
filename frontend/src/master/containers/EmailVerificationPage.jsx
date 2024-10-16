import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../hooks";

const EmailVerificationPage = () => {
	const [code, setCode] = useState(["", "", "", "", "", ""]);
	const inputRefs = useRef([]);

	const { verifyEmailMutation } = useAuth()
	const { isPending } = verifyEmailMutation;

	const handleChange = (index, value) => {
		const newCode = [...code];

		// Handle pasted content
		if (value.length > 1) {
			const pastedCode = value.slice(0, 6).split("");
			for (let i = 0; i < 6; i++) {
				newCode[i] = pastedCode[i] || "";
			}
			setCode(newCode);

			// Focus on the last non-empty input or the first empty one
			const lastFilledIndex = newCode.findLastIndex((digit) => digit !== "");
			const focusIndex = lastFilledIndex < 5 ? lastFilledIndex + 1 : 5;
			inputRefs.current[focusIndex].focus();
		} else {
			newCode[index] = value;
			setCode(newCode);

			// Move focus to the next input field if value is entered
			if (value && index < 5) {
				inputRefs.current[index + 1].focus();
			}
		}
	};

	const handleKeyDown = (index, e) => {
		if (e.key === "Backspace" && !code[index] && index > 0) {
			inputRefs.current[index - 1].focus();
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		const verificationCode = code.join("");
		try {
			verifyEmailMutation.mutate(verificationCode);
		} catch (error) {
			console.log(error);
		}
	};

	// Auto submit when all fields are filled
	useEffect(() => {
		if (code.every((digit) => digit !== "") && !isPending) {
			handleSubmit(new Event("submit"));
		}
	}, [code]);

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
					<p className='text-center text-gray-700 mb-6'>Enter the 6-digit code sent to your email address.</p>

					<form onSubmit={handleSubmit} className='space-y-6'>
						<div className='flex justify-between'>
							{code.map((digit, index) => (
								<input
									key={index}
									ref={(el) => (inputRefs.current[index] = el)}
									type='text'
									maxLength='6'
									value={digit}
									onChange={(e) => handleChange(index, e.target.value)}
									onKeyDown={(e) => handleKeyDown(index, e)}
									className='w-12 h-12 text-center text-2xl font-bold bg-gray-200 text-black border-2 border-gray-100 rounded-lg focus:border-gray-200 focus:outline-none'
								/>
							))}
						</div>
						{/* {error && <p className='text-red-500 font-semibold mt-2'>{error}</p>} */}
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							type='submit'
							disabled={isPending || code.some((digit) => !digit)}
							className='w-full flex justify-center py-2 px-4 border border-transparent 
							rounded-md shadow-sm text-sm font-medium text-white bg-gray-900
							 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2
							  focus:ring-gray-900 transition duration-150 ease-in-out disabled:opacity-50'
						>
							{isPending ? "Verifying..." : "Verify Email"}
						</motion.button>
					</form>
				</div>
			</motion.div>
		</div>
	);
};
export default EmailVerificationPage;
