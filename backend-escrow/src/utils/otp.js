import emailjs from '@emailjs/nodejs';

emailjs.init({
    publicKey: process.env.EMAILJS_PUBLIC_KEY,
    privateKey: process.env.EMAILJS_PRIVATE_KEY,
});

const sendOtp = async (email, subject, message) => {
    try {
        const response = await emailjs.send('service_escrow', 'template_escrow', {
            to_email: email,
            subject: subject,
            message: message
        });
        console.log(`✓ ${subject} sent to ${email}`);
        return response;
    } catch (error) {
        console.error(`Error sending ${subject}:`, error.message);
        throw new Error('Failed to send email');
    }
};

export { sendOtp };
