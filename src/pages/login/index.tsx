import React, { useEffect, useState } from "react";

import Asterisk from "../../components/elements/Asterisk";
import { ImEye, ImEyeBlocked } from "react-icons/im";
import { FaCheck } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import Spinner from "../../components/elements/Spinner";
import { toast } from "sonner";
import AuthImg from "../../assets/pngs/auth.png";
import Logo from "../../assets/logo/logo.png";
// import { validateAuthForm } from "../../utils/validationHelper";
import { useForm, type SubmitHandler } from 'react-hook-form';


type FormDataType = {
    identifier: string;
    password: string
}

export default function index() {
	const navigate = useNavigate();
	const { auth, handleChange } = useAuthContext();

	// const [formData, setFormData] = useState({
	// 	identifier: "",
	// 	password: "",
	// });
    // const [formErrors, setFormErrors] = useState<FormDataType>({ identifier: "", password: "" });

	const [showPassword, setShowPassword] = useState(false);
	const [isChecked, setIsChecked] = useState(false);
	// const [response, setResponse] = useState({ status: "", message: "" });
	const [loading, setLoading] = useState(false);

	const headers = {
		Accept: "application/json",
		"Content-Type": "application/json",
	};

	const { register, handleSubmit, formState } = useForm<FormDataType>();

	// const handleFormChange = function (e: ChangeEvent<HTMLInputElement>) {
	// 	const { name, value } = e.target;
	// 	setFormData({
	// 		...formData,
	// 		[name]: value,
	// 	});
	// };

	// async function handleSubmitLogin (e: FormEvent) {
	const handleSubmitLogin: SubmitHandler<FormDataType> = async function(data) {
		// e.preventDefault();
        // const newErrors = validateAuthForm(formData);
        // setFormErrors(newErrors);
        // if (Object.keys(newErrors).length >= 1) return;

		setLoading(true);

		const device_name = navigator.userAgent?.split(")")?.[0] + ")"
		const { password, identifier } = data;
		
		try {
			const res = await fetch(`${import.meta.env.VITE_BASE_URL}/admin/login`, {
				method: "POST",
				headers,
				body: JSON.stringify({ identifier, password, remember_me: isChecked, device_name }),
			});

			const data = await res.json();
			if (res.status !== 200 || !data?.success) {
                if(data?.error?.validation_errors) {
                    const message = Object.entries(data?.error?.validation_errors)?.[0]?.[1]
                    throw new Error((message ?? "Something went wrong!") as string);
                } else {
                    throw new Error(data?.error?.message);
                }
            }
			toast.success("Login Successful!");

			setTimeout(function () {
				handleChange(data?.data?.user, data?.data?.token);
			}, 1000);
		} catch (err: any) {
			const message = err?.message == "Failed to fetch" ? "Check Internet Connection!" : err?.message;
			toast.error(message);
		} finally {
			setLoading(false);
		}
	}

	useEffect(function () {
        if(auth) {
            navigate("/");
        }
    }, [auth]);

	return (
		<React.Fragment>
			{loading && <Spinner />}

			<section className="auth--section">
				<div className="auth--container">
					<div className="auth--form-box">
						<form className="auth--form" onSubmit={handleSubmit(handleSubmitLogin)}>
                            <div className="form--top">
						        <img className="auth--logo" src={Logo} alt="logo" />
							    <h2 className="form--heading">Welcome Back Admin</h2>
                                <p className="form--text">Please enter your credentials to access your account</p>
                            </div>

							<div className="form--item">
								<label htmlFor="email" className="form--label">
									Email <Asterisk />
								</label>
								{/* <input type="email" className="form--input" placeholder="taiwo@gmail.com" onChange={handleFormChange} name="identifier" id="identifier" value={formData.identifier} /> */}
								<input type="email" className="form--input" placeholder="taiwo@gmail.com" id="identifier" {...register('identifier', {
									required: 'Email is required',
									pattern: {
										value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
										message: 'Email is invalid',
									},
								})} />
                                <span className="form--error-message">
                                    {formState.errors.identifier && formState.errors.identifier.message}
                                </span>
							</div>
							<div className="form--item">
								<label htmlFor="Password" className="form--label">
									Password <Asterisk />
								</label>

								<div className="form--input-box">
									{/* <input type={showPassword ? "text" : "password"} name="password" id="password" className="form--input" placeholder="&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;" value={formData.password} onChange={handleFormChange} /> */}
									<input type={showPassword ? "text" : "password"} id="password" className="form--input" placeholder="&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;" {...register('password', {
										required: 'Password is required',
										minLength: {
											value: 8,
											message: 'Password must be at least 8 characters',
										},
									})} />
									<div className="form--input-icon" onClick={() => setShowPassword(!showPassword)}>
										{showPassword ? <ImEye /> : <ImEyeBlocked />}
									</div>
								</div>
                                <span className="form--error-message">
                                    {formState.errors.password && formState.errors.password.message}
                                </span>
							</div>

							<div className="form--flex">
								<div className="form--item-flex" onClick={() => setIsChecked(!isChecked)}>
									<div id="checkbox" className={isChecked ? "is-selected" : ""}>
										{isChecked && <FaCheck />}
									</div>
									<label className="form--text" htmlFor="checkbox">
										Keep me signed in
									</label>
								</div>

								<Link to="/forgot-password">Forgot Password?</Link>
							</div>

							<button type="submit" className="form--submit">
								Login
							</button>
						</form>
					</div>

                    <div className="auth--image">
						<img src={AuthImg} alt="authentication" />
					</div>
				</div>
			</section>
		</React.Fragment>
	);
}
