import { chatWithCoach } from "../services/geminiServices.js";
import Contract from "../models/Contract.js";

export const handleChat = async (req, res) => {
    try {
        const { message, history, contractId } = req.body;

        if (!message) {
            return res.status(400).json({
                error: 'Message is required',
            });
        }

        console.log('Incoming Chat Request:', { message, contractId });
        let contractAnalysis = null;
        if (contractId) {
            const contract = await Contract.findById(contractId);
            if (contract) {
                console.log('Found contract for chat context:', contract.fileName);
                contractAnalysis = contract.analysis;
            } else {
                console.warn('Contract ID provided but not found in DB:', contractId);
            }
        } else {
            console.log('No contractId provided in chat payload.');
        }

        const responseText = await chatWithCoach(message, history || [], contractAnalysis);

        res.status(200).json({
            reply: responseText
        });
    } catch (error) {
        console.error('Error in chatController :', error);
        res.status(500).json({
            error : error.message || 'Failed to generate chatbot reply'
        });
        
    }

};

