import React, { useEffect, useState, type ChangeEvent, type FormEvent } from "react";

import Asterisk from "../../components/elements/Asterisk";
import { ImEye, ImEyeBlocked } from "react-icons/im";
import { FaCheck } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import Spinner from "../../components/elements/Spinner";
import { toast } from "sonner";
import AuthImg from "../../assets/pngs/auth.png";
import Logo from "../../assets/logo/logo.png";
import { validateAuthForm } from "../../utils/validationHelper";


type FormDataType = {
    identifier: string;
    password: string
}

export default function index() {
	const navigate = useNavigate();
	const { auth, handleChange } = useAuthContext();

	const [formData, setFormData] = useState({
		identifier: "",
		password: "",
	});
    const [formErrors, setFormErrors] = useState<FormDataType>({ identifier: "", password: "" });

	const [showPassword, setShowPassword] = useState(false);
	const [isChecked, setIsChecked] = useState(false);
	// const [response, setResponse] = useState({ status: "", message: "" });
	const [loading, setLoading] = useState(false);

	const headers = {
		Accept: "application/json",
		"Content-Type": "application/json",
	};

	const handleFormChange = function (e: ChangeEvent<HTMLInputElement>) {
		const { name, value } = e.target;
		setFormData({
			...formData,
			[name]: value,
		});
	};

	async function handleSubmit(e: FormEvent) {
		e.preventDefault();
        const newErrors = validateAuthForm(formData);
        setFormErrors(newErrors);
        if (Object.keys(newErrors).length >= 1) return;

		setLoading(true);

		const device_name = navigator.userAgent?.split(")")?.[0] + ")"
		try {
			const { password, identifier } = formData;
			const res = await fetch(`${import.meta.env.VITE_BASE_URL}/admin/login`, {
				method: "POST",
				headers,
				body: JSON.stringify({ identifier, password, remember_me: isChecked, device_name }),
			});

			const data = await res.json();
			if (res.status !== 200 || !data?.success) {
                throw new Error(data?.error?.validation_errors?.email?.[0] || data?.error?.message);
            }
			console.log(data)
			toast.success("Login Successful!");

			setTimeout(function () {
				handleChange(data?.data?.user, data?.data?.token);
			}, 1000);
		} catch (err: any) {
			const message = err?.message == "Failed to fetch" ? "Server or Connection Error!!" : err?.message;
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
						<form className="auth--form" onSubmit={handleSubmit}>
                            <div className="form--top">
						        <img className="auth--logo" src={Logo} alt="logo" />
							    <h2 className="form--heading">Welcome Back Admin</h2>
                                <p className="form--text">Please enter your credentials to access your account</p>
                            </div>

							<div className="form--item">
								<label htmlFor="identifier" className="form--label">
									identifier <Asterisk />
								</label>
								<input type="identifier" className="form--input" placeholder="taiwo@gmail.com" onChange={handleFormChange} name="identifier" id="identifier" value={formData.identifier} />
                                <span className="form--error-message">
                                    {formErrors.identifier && formErrors.identifier}
                                </span>
							</div>
							<div className="form--item">
								<label htmlFor="Password" className="form--label">
									Password <Asterisk />
								</label>

								<div className="form--input-box">
									<input type={showPassword ? "text" : "password"} name="password" id="password" className="form--input" placeholder="&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;" value={formData.password} onChange={handleFormChange} />
									<div className="form--input-icon" onClick={() => setShowPassword(!showPassword)}>
										{showPassword ? <ImEye /> : <ImEyeBlocked />}
									</div>
								</div>
                                <span className="form--error-message">
                                    {formErrors.password && formErrors.password}
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
