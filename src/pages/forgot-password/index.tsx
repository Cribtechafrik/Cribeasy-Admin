import React, { useState } from 'react'
import Asterisk from '../../components/elements/Asterisk';
import { Link, useNavigate } from 'react-router-dom';
// import { FiCheckCircle } from 'react-icons/fi';
// import { createPortal } from 'react-dom';
// import Modal from '../../components/modals/General';
import Spinner from '../../components/elements/Spinner';
import AuthImg from "../../assets/pngs/auth.png";
import { toast } from 'sonner';
import Logo from "../../assets/logo/logo.png";
import { useForm, type SubmitHandler } from 'react-hook-form';


type FormDataType = {
    identifier: string;
}

export default function index() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    // const [formData, setFormData] = useState({ identifier: "" });
    const [showModal, setShowModal] = useState(false);

    const headers = {
        "Accept": "application/json",
        "Content-Type": "application/json"
    }

    const { register, handleSubmit, formState } = useForm<FormDataType>();
    

    // const handleFormChange = function (e: React.ChangeEvent<HTMLInputElement>) {
    //     const { name, value } = e.target;
    //     setFormData({
    //         ...formData,
    //         [name]: value,
    //     });
    // };

    const handleForgotPassword: SubmitHandler<FormDataType> = async function(formData) {
        setLoading(true);

        try {
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/forgot-password`, {
                method: 'POST', headers,
                body: JSON.stringify({ ...formData })
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
            
            toast.error(data?.message);
            setShowModal(true)

            setTimeout(function () {
                localStorage.setItem("otp_identifier", formData.identifier);
				navigate("/otp-verification")
			}, 1000);

        } catch (err: any) {
            const message = err?.message == "Failed to fetch" ? "Check Internet Connection!" : err?.message || "Something went wrong!"
			toast.error(message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <React.Fragment>
            {showModal && (
                // createPortal(
                //     <Modal className="mini" handleClose={() => setShowModal(false)}>
                //         <div className="modal--details">
                //             <span className='modal--top'>
                //                 <FiCheckCircle />
                //                 <h3>Successful</h3>
                //             </span>

                //             <p style={{ fontSize: "1.5rem", lineHeight: "1.4", textAlign: "center" }}>A reset link has been sent to your email {formData.email}. Click the link and reset your password!</p>
                //         </div>
                //     </Modal>, document.body
                // )
                <p></p>
            )}
            {loading && <Spinner />}

            <section className="auth--section">
                <div className="auth--container">
                    <div className="auth--form-box">
                        <form className="auth--form" onSubmit={handleSubmit(handleForgotPassword)}>
                            <span className='form--top'>
						        <img className="auth--logo" src={Logo} alt="logo" />
                                <h2 className="form--heading">Forgot Password</h2>
                                <p className="form--text">Enter the email you used during sign up</p>
                            </span>
                            <div className="form--item">
                                <label htmlFor="email" className="form--label">Email <Asterisk /></label>
                                <input type="email" className="form--input" placeholder='taiwo@gmail.com' id='identifier' {...register("identifier", {
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

                            <button type="submit" className='form--submit'>Reset Password</button>

                            <div className="form--info" style={{ textAlign: "center" }}>
                                <p>I remember my password <Link to='/login'>Login</Link></p>
                            </div>
                        </form>
                    </div>

                    <div className="auth--image">
						<img src={AuthImg} alt="authentication" />
					</div>
				</div>
			</section>
		</React.Fragment>
    )
}