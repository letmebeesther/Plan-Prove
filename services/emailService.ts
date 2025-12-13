
// We use the CDN version imported in index.html via <script> tag
declare global {
  interface Window {
    emailjs: any;
  }
}

// Credentials provided in the prompt
const SERVICE_ID = "service_jjmpbtc";
const TEMPLATE_ID = "template_1it27ik";
const PUBLIC_KEY = "btJheEX8WkmX6yft8";

export const initEmailService = () => {
  if (window.emailjs) {
    try {
      window.emailjs.init(PUBLIC_KEY);
      console.log("EmailJS initialized");
    } catch (e) {
      console.error("EmailJS init failed:", e);
    }
  } else {
    console.error("EmailJS SDK not found on window object. Please check index.html");
  }
};

export const sendVerificationEmail = async (toEmail: string, code: string) => {
  if (!window.emailjs) {
    console.error("EmailJS SDK not loaded.");
    alert("이메일 서비스 연결에 실패했습니다. 페이지를 새로고침 해주세요.");
    return;
  }

  try {
    // Template params must match the variables defined in your EmailJS template
    // 'otp_code' matches the Python script
    const templateParams = {
      to_email: toEmail,
      otp_code: code, 
    };

    const response = await window.emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams);
    return response;
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
};
