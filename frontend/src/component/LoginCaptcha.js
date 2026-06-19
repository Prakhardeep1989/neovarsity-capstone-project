import { useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { isCaptchaEnabled } from "../utility/authApi";

const LoginCaptcha = ({ onChange, captchaRef }) => {
  const internalRef = useRef(null);
  const ref = captchaRef || internalRef;
  const siteKey = process.env.REACT_APP_RECAPTCHA_SITE_KEY;

  if (!isCaptchaEnabled()) {
    return null;
  }

  return (
    <div className="flex justify-center my-2">
      <ReCAPTCHA ref={ref} sitekey={siteKey} onChange={onChange} />
    </div>
  );
};

export default LoginCaptcha;
