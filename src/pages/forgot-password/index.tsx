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


export default function index() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ identifier: "" });
    const [showModal, setShowModal] = useState(false);

    const headers = {
        "Accept": "application/json",
        "Content-Type": "application/json"
    }

    const handleFormChange = function (e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    async function handleForgotPassword() {
        setLoading(true);

        try {
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/forgot-password`, {
                method: 'POST', headers,
                body: JSON.stringify({ ...formData })
            });


            const data = await res.json();
            if (res.status !== 200 || !data?.success) {
                setTimeout(function () {
                    localStorage.setItem("otp_identifier", formData.identifier);
                    navigate("/otp-verification")
                }, 1000);
                throw new Error(data?.error?.message);
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
                        <div className="auth--form">
                            <span className='form--top'>
						        <img className="auth--logo" src={Logo} alt="logo" />
                                <h2 className="form--heading">Forgot Password</h2>
                                <p className="form--text">Enter the email you used during sign up</p>
                            </span>
                            <div className="form--item">
                                <label htmlFor="email" className="form--label">Email <Asterisk /></label>
                                <input type="email" className="form--input" placeholder='taiwo@gmail.com' required onChange={handleFormChange} name="identifier" id='identifier' value={formData.identifier} />
                            </div>

                            <button type="submit" className='form--submit' onClick={handleForgotPassword}>Reset Password</button>

                            <div className="form--info" style={{ textAlign: "center" }}>
                                <p>I remember my password <Link to='/login'>Login</Link></p>
                            </div>
                        </div>
                    </div>

                    <div className="auth--image">
						<img src={AuthImg} alt="authentication" />
					</div>
				</div>
			</section>
		</React.Fragment>
    )
}