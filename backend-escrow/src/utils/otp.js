import emailjs from '@emailjs/nodejs';

emailjs.init({
    publicKey: process.env.EMAILJS_PUBLIC_KEY,
    privateKey: process.env.EMAILJS_PRIVATE_KEY,
});

const sendOtp = async (email, otp) => {
    try {
        const response = await emailjs.send(
            process.env.EMAILJS_SERVICE_ID, 
            process.env.EMAILJS_TEMPLATE_ID, 
            {
                email: email,
                passcode: otp
            }
        );
        console.log(`✓ OTP sent to ${email}`);
        return response;
    } catch (error) {
        console.error(`Error sending OTP:`, error.message);
        throw new Error('Failed to send email');
    }
};

export { sendOtp };
