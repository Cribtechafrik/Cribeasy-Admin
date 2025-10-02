import React, { useEffect, useState } from 'react'
import OTPInput from 'react-otp-input';
import { useNavigate } from 'react-router-dom';
import Spinner from '../../components/elements/Spinner';
import { toast } from 'sonner';
import AuthImg from "../../assets/pngs/auth.png";
import Logo from "../../assets/logo/logo.png";


export default function index() {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ otp: "", identifier: localStorage.getItem("otp_identifier") || /* temp */ "cribeasyemailssetups@gmail.com" });

    const navigate = useNavigate();

    const headers = {
        "Accept": "application/json",
        "Content-Type": "application/json"
    }

    const handleChangeData = function (value: string) {
        setFormData({ ...formData, otp: value });
    }

    useEffect(function (): any {
        document.title = "OTP Verification";

        if (!formData?.identifier) {
            return navigate('/login');
        }
    }, []);


    async function handleSubmitOtp() {
        setLoading(true);

        try {
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/verify-password-otp`, {
                method: 'POST', headers,
                body: JSON.stringify({ otp: +formData.otp, identifier: formData.identifier })
            });

            const data = await res.json();
            if (res.status !== 200 || !data?.success) {
                throw new Error(data?.error?.validation_errors?.otp?.[0] || data?.error?.message);
            }

			toast.error(data?.message);

            setTimeout(function () {
                localStorage.setItem("otp_code", formData.otp);
                navigate('/change-password');
            }, 1500);

        } catch (err: any) {
			toast.error(err?.message);
        } finally {
            setLoading(false);
        }
    }


    async function handleRequestOtp() {
        setLoading(true);
        // handleResetResponse();

        try {
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/resend-password-otp`, {
                method: 'POST', headers,
                body: JSON.stringify({ identifier: formData?.identifier }),
            });

            const data = await res.json();
            if (res.status !== 200 || !data?.success) {
                throw new Error(data?.error?.validation_errors?.password?.[0] || data?.error?.message);
            }

			toast.error(data?.message);
        } catch (err: any) {
            const message = err?.message == "Failed to fetch" ? "Server or Connection Error!!" : err?.message
			toast.error(message);
        } finally {
            setLoading(false);
        }
    }

    return (
       <React.Fragment>
            {loading && <Spinner />}

            <section className="auth--section">
                <div className="auth--container">
                    <div className="auth--form-box">
                        <div className="auth--form">
                            <span className='form--top'>
						        <img className="auth--logo" src={Logo} alt="logo" />
                                <h2 className="form--heading">Confirm Email</h2>
                                <p className="form--text">Please enter OTP sent to your email</p>
                            </span>


                            <div className="form--item otp--item">
                                <OTPInput
                                    value={formData.otp}
                                    onChange={handleChangeData}
                                    inputType="number"
                                    numInputs={6}
                                    renderSeparator={<span>{" "}</span>}
                                    renderInput={(props) => <input {...props} />}
                                    containerStyle={{ display: 'flex', alignItems: 'center', gap: '.24rem' }}
                                />
                            </div>

                            <button type="submit" className='form--submit' onClick={handleSubmitOtp}>Verify OTP</button>

                            <div className="form--info" style={{ textAlign: "center" }}>
                                <p>Verification code is valid only for 5 minutes</p>
                            </div>

                            <div className="form--info" style={{ textAlign: "center" }}>
                                <button onClick={handleRequestOtp}>Resend new OTP</button>
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
