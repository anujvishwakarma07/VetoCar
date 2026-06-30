import Razorpay from 'razorpay';
import crypto from 'crypto';
import User from '../models/User.js';

const isSimulatorMode = () => {
    const keyId = process.env.RAZORPAY_KEY_ID;
    return !keyId || keyId.includes('placeholder');
};

export const createRazorpayOrder = async (req, res) => {
    try {
        const { amount } = req.body;

        if (!amount) {
            return res.status(400).json({
                error: 'Amount is required'
            });
        }

        const amountInPiase = amount * 100;
        if (isSimulatorMode()) {
            return res.status(200).json({
                id: `order_mock_${Date.now()}`,
                amount: amountInPiase,
                currency: 'INR',
                isMock: true,
                key: 'rzp_test_mock_id'

            });
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const options = {
            amount: amountInPiase,
            currency: 'INR',
            receipt: `receipt_order_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);

        return res.status(200).json({
            id: order.id,
            amount: order.amount,
            currency: order.currency,
            isMock: false,
        })
    } catch (error) {
        console.error('Error creating Razorpay order : ', error);
        return res.status(500).json({
            error: 'Failed to create payment order'
        });

    }
};

export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;

        let creditsToBuy = 0;
        if (amount === 499) creditsToBuy = 10;
        else if (amount === 999) creditsToBuy = 25;
        else creditsToBuy = 1;

        if (isSimulatorMode()) {
            if (razorpay_signature === 'mock_signature') {
                const user = await User.findByIdAndUpdate(
                    req.user.id,
                    { $inc: { credits: creditsToBuy } },
                    { new: true }
                );

                return res.status(200).json({
                    message: 'Mock Payment verified successfully',
                    credits: user.credits
                });
            } else {
                return res.status(400).json({
                    error: 'Invalid mock signature'
                });

            }
        }

        // for real : 
        const text = `${razorpay_order_id}|${razorpay_payment_id}`;
        const generated_signature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(text)
            .digest('hex');
        if (generated_signature === razorpay_signature) {
            // Update user credits in MongoDB
            const user = await User.findByIdAndUpdate(
                req.user.id,
                { $inc: { credits: creditsToBuy } },
                { new: true }
            );
            return res.status(200).json({
                message: 'Payment verified and credits added successfully!',
                credits: user.credits
            });
        } else {
            return res.status(400).json({ error: 'Cryptographic signature mismatch. Payment unverified.' });
        }

    } catch (error) {
        console.error('Error verifying payment:', error);
        return res.status(500).json({
            error: 'Failed to verify payment signature'
        });
    }
}