// Login.jsx
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setUser } from "../../../lib/userSlice";
import "react-toastify/dist/ReactToastify.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function Login() {
  const dispatch = useDispatch();
  const { user, loading: userLoader } = useSelector((state) => state.user);

  const [step, setStep] = useState("login");
  const [type, setType] = useState("phone"); // "phone" or "email"
  const [value, setValue] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(true);

  const navigate = useNavigate();
  const otpRefs = useRef([]);

  useEffect(() => {
    if (userLoader === false) {
      if (user) {
        navigate("/dashboard", { replace: true });
      } else {
        setRedirecting(false);
      }
    }
  }, [user, userLoader]);

  const handleApiCall = async (url, data, successMsg, errorMsg) => {
    try {
      setLoading(true);
      const res = await axios.post(url, data, { withCredentials: true });
      toast.success(successMsg);
      return res.data;
    } catch (err) {
      toast.error(errorMsg || "Something went wrong!");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async (e) => {
    e.preventDefault();
    if (!value) return toast.error(`Enter your ${type}!`);

    const data = await handleApiCall(
      `${API_BASE_URL}/api/send-otp`,
      { type, value },
      `OTP sent to your ${type}!`,
      `Failed to send OTP to ${type}`
    );

    if (data) setStep("verify");
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    if (otp.some((digit) => digit === "")) {
      return toast.error("Complete the 6-digit code!");
    }
    const code = otp.join("");
    const data = await handleApiCall(
      `${API_BASE_URL}/api/verify-otp`,
      { type, value, otp: code },
      "Login successful!",
      "Invalid OTP!"
    );

    if (data) {
      dispatch(setUser(data?.user));
      navigate("/dashboard", { replace: true });
    }
  };

  const handleOtpKeyDown = (e, index) => {
    const key = e.key;
    const newOtp = [...otp];

    if (key === "Backspace") {
      e.preventDefault();
      if (newOtp[index]) {
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        otpRefs.current[index - 1].focus();
        newOtp[index - 1] = "";
        setOtp(newOtp);
      }
    } else if (/^[0-9]$/.test(key)) {
      e.preventDefault();
      newOtp[index] = key;
      setOtp(newOtp);
      if (index < otp.length - 1) otpRefs.current[index + 1].focus();
    }
  };

  const backToLogin = () => {
    setStep("login");
    setValue("");
    setOtp(["", "", "", "", "", ""]);
  };

  if (redirecting) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div>
      {!user && <ToastContainer position="top-right" autoClose={3000} />}

      {step === "login" && (
        <main id="screen-login" className="screen active">
          <div className="min-h-screen grid place-items-center p-6">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="px-6 pt-6 pb-4">
                <h1 className="text-3xl font-bold text-black">Welcome back</h1>
                <p className="text-base text-black mt-1">
                  Sign in with your {type}.
                </p>
              </div>

              <form onSubmit={sendOtp} className="px-6 pb-6 space-y-4" noValidate>
                {/* Switch between phone or email */}
               {/* Select verification method */}
<div className="flex justify-center mb-6">
  <div className="relative flex bg-slate-100 rounded-full p-1 shadow-inner w-72">
    <button
      type="button"
      onClick={() => {
        setType("phone");
        setValue("");
      }}
      className={`flex-1 text-center py-2 text-base font-semibold rounded-full transition-all duration-200 
        ${type === "phone"
          ? "bg-brand-600 text-white shadow-md scale-105"
          : "text-slate-600 hover:text-brand-600"}`}
    >
      Phone
    </button>
    <button
      type="button"
      onClick={() => {
        setType("email");
        setValue("");
      }}
      className={`flex-1 text-center py-2 text-base font-semibold rounded-full transition-all duration-200 
        ${type === "email"
          ? "bg-brand-600 text-white shadow-md scale-105"
          : "text-slate-600 hover:text-brand-600"}`}
    >
      Email
    </button>
  </div>
</div>


                {/* Input field */}
                <div>
                  <label
                    htmlFor="value"
                    className="block text-black text-base font-medium mb-1"
                  >
                    {type === "phone" ? "Phone Number" : "Email Address"}
                  </label>
                  <input
                    id="value"
                    name="value"
                    type={type === "phone" ? "tel" : "email"}
                    required
                    placeholder={
                      type === "phone"
                        ? "+1 XXXX XXX XXX"
                        : "example@email.com"
                    }
                    value={value}
                    onChange={(e) => {
                      let val = e.target.value;
                      if (type === "phone") val = val.replace(/[^0-9]/g, "");
                      setValue(val);
                    }}
                    inputMode={type === "phone" ? "numeric" : undefined}
                    className="w-full rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-600 hover:bg-brand-700 border border-black text-white text-xl uppercase font-semibold rounded px-4 py-2.5 transition"
                >
                  {loading ? "Sending..." : "Send OTP"}
                </button>
              </form>
            </div>
          </div>
        </main>
      )}

      {step === "verify" && (
        <main id="screen-verify" className="screen">
          <div className="min-h-screen grid place-items-center p-6">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="px-6 pt-6 pb-2 text-center">
                <h2 className="text-2xl font-bold">Two-Step Verification</h2>
                <p className="text-sm text-slate-600 mt-1">
                  Enter the 6-digit code sent to your {type}: <b>{value}</b>
                </p>
              </div>

              <form onSubmit={verifyOtp} className="px-6 pb-6 space-y-5" noValidate>
                <div
                  className="flex justify-center gap-2 pt-3"
                  aria-label="One-time code fields"
                >
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (otpRefs.current[index] = el)}
                      className="otp w-10 h-10 text-center text-lg rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-600"
                      maxLength={1}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={digit}
                      onChange={() => {}}
                      onKeyDown={(e) => handleOtpKeyDown(e, index)}
                    />
                  ))}
                </div>

                <div className="flex flex-col items-center justify-between">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-4/5 bg-brand-600 hover:bg-brand-700 border border-black text-white text-xl uppercase font-semibold rounded px-4 py-2.5 transition"
                  >
                    {loading ? "Verifying..." : "Verify & Continue"}
                  </button>
                  <button
                    type="button"
                    onClick={backToLogin}
                    className="text-brand-600 hover:text-brand-700 uppercase mt-3"
                  >
                    Back
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
