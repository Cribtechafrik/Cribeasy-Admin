import React, { useEffect, useState } from 'react'
import OTPInput from 'react-otp-input';
import { useNavigate } from 'react-router-dom';
import Spinner from '../../components/elements/Spinner';
import { toast } from 'sonner';
import AuthImg from "../../assets/pngs/auth.png";
import Logo from "../../assets/logo/logo.png";


export default function index() {
    // const [response, setResponse] = useState({ status: '', message: '' });
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ otp: "", email: JSON.parse(localStorage.getItem("otp_email")!)?.email || null });

    const navigate = useNavigate();

    const headers = {
        "Accept": "application/json",
        "Content-Type": "application/json"
    }

    const handleChangeData = function (value: string) {
        setFormData({ ...formData, otp: value });
    }

    // const handleResetResponse = function () {
    //     setResponse({ status: "", message: "" })
    // }

    useEffect(function () {
        document.title = "OTP Verification";

        // if (!formData?.email) return navigate('/');

        // handleRequestOtp()
    }, []);


    async function handleSubmitOtp() {
        setLoading(true);
        // handleResetResponse()

        try {
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/verify-otp`, {
                method: 'POST', headers,
                body: JSON.stringify({ ...formData })
            });

            const data = await res.json();
            if (res.status !== 200) {
                throw new Error(data?.message || data?.error);
            }

            // // UPDATE THE RESPONSE STATE WITH THE NEW VALUE
            // setResponse({ status: "success", message: data.message });
			toast.error(data?.message);

            setTimeout(function () {
                localStorage.removeItem("otp_user");
                navigate('/login');
            }, 1500);

        } catch (err: any) {
            // setResponse({ status: 'error', message: err.message })
			toast.error(err?.message);
        } finally {
            setLoading(false);
        }
    }


    async function handleRequestOtp() {
        setLoading(true);
        // handleResetResponse();

        try {
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/send-otp`, {
                method: 'POST', headers,
                body: JSON.stringify({ email: formData?.email }),
            });

            const data = await res.json();
            if (res.status !== 200) {
                throw new Error(data?.message || data?.error);
            }

            // UPDATE THE RESPONSE STATE WITH THE NEW VALUE
            // setResponse({ status: "success", message: data?.message });
			toast.error(data?.message);

        } catch (err: any) {
            const message = err?.message == "Failed to fetch" ? "Server or Connection Error!!" : err?.message
            // setResponse({ status: "error", message });
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
