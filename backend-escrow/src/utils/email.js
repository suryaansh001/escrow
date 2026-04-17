import emailjs from '@emailjs/nodejs';

emailjs.init({
    publicKey: process.env.EMAILJS_PUBLIC_KEY,
    privateKey: process.env.EMAILJS_PRIVATE_KEY,
});

const sendTransactionNotification = async (email, transactionDetails) => {
    try {
        const response = await emailjs.send(
            process.env.EMAILJS_SERVICE_ID,
            process.env.EMAILJS_TRANSACTION_TEMPLATE_ID || process.env.EMAILJS_TEMPLATE_ID,
            {
                email: email,
                transaction_id: transactionDetails.id,
                amount: transactionDetails.amount,
                counterparty: transactionDetails.counterparty,
                status: transactionDetails.status,
                type: transactionDetails.type || 'Escrow Created'
            }
        );
        console.log(`✓ Transaction notification sent to ${email}`);
        return response;
    } catch (error) {
        console.error(`Error sending transaction notification:`, error.message);
        throw new Error('Failed to send email');
    }
};

export { sendTransactionNotification };