import { GoogleGenerativeAI } from "@google/generative-ai";

// Local fallback engines for API quota limits

/**
 * Returns simulated mock analysis when Gemini API is rate-limited or key is missing.
 */
const getMockContractAnalysis = () => {
    return {
        contractType: "Lease",
        year: 2023,
        make: "Toyota",
        model: "RAV4",
        vehicleName: "2023 Toyota RAV4",
        interestRateOrAPR: 6.2,
        leaseTermMonths: 36,
        monthlyPayment: 489.00,
        downPayment: 3000.00,
        residualValue: 22400.00,
        mileageAllowanceYearly: 12000,
        mileageOverageFeePerMile: 0.25,
        earlyTerminationFee: "Standard early termination rules apply. Subject to paying remaining lease payments.",
        purchaseOptionPrice: 23000.00,
        dispositionFee: 395.00,
        maintenanceResponsibility: "Lessee is fully responsible for all regular service and maintenance.",
        warrantyAndInsuranceRequirements: "Minimum 100k/300k liability limits required, vehicle under manufacturer warranty.",
        redFlags: [
            "⚠️ High Document Fee of $695 observed in dealer charges.",
            "⚠️ Dealer added aftermarket protection package ($995) which is negotiable.",
            "⚠️ Interest rate (Money Factor) is slightly marked up above base rate."
        ],
        fairnessScore: 68,
        fairnessExplanation: "⚠️ [API LIMIT FALLBACK] This is simulated expert analysis because your Gemini API quota has been exceeded. Standard crossover SUV numbers are used. Please check your billing details or wait a minute to try with the live AI."
    };
};

/**
 * Returns keyword-based negotiation scripts and coach advice when Gemini API is rate-limited.
 */
const getFallbackCoachResponse = (message, contractAnalysis) => {
    const msg = message.toLowerCase();
    
    let intro = "⚠️ [API RATE-LIMIT FALLBACK MODE]\nIt looks like your Gemini API quota is temporarily exceeded. Here is local expert negotiation coaching based on your prompt:\n\n";
    
    if (msg.includes('doc') || msg.includes('fee') || msg.includes('fees')) {
        return intro + `**Dealership Document Fees (Doc Fees):**
• **What it is:** Pure profit markup charged by dealers for processing paperwork.
• **Negotiation Rule:** In most states, the fee itself is non-negotiable. Instead, negotiate the **selling price of the vehicle** down to offset it.
• **Limit Check:** If it exceeds **$150**, ask for a direct discount on the car.
• **Action Script:** *"I see your doc fee is $X. I am willing to sign if we offset this by reducing the selling price of the car by that amount."*`;
    }
    
    if (msg.includes('money factor') || msg.includes('interest') || msg.includes('apr') || msg.includes('rate')) {
        return intro + `**Money Factor / Lease Interest:**
• **What it is:** Interest rate expressed as a decimal (e.g., 0.0025). Multiply it by **2400** to get the APR (6.0%).
• **Negotiation Rule:** Dealers often markup the "Buy Rate" set by the bank.
• **Action Script:** Ask the dealer: *"Is this the baseline tier-1 buy rate from the manufacturer's bank, or is there a dealer interest markup?"*`;
    }
    
    if (msg.includes('residual') || msg.includes('value')) {
        return intro + `**Residual Value:**
• **What it is:** The pre-determined value of the vehicle at lease-end.
• **Negotiation Rule:** Residual values are set by the finance company and are **non-negotiable**.
• **Action Script:** Do not waste negotiation energy here. Focus on the vehicle's selling price (Gross Capitalized Cost) to reduce your payments.`;
    }
    
    if (msg.includes('email') || msg.includes('template') || msg.includes('script') || msg.includes('write')) {
        const vehicle = contractAnalysis ? `${contractAnalysis.year || ''} ${contractAnalysis.make || ''} ${contractAnalysis.model || ''}` : '[Vehicle Details]';
        return intro + `Here is a professional negotiation script you can use to send to the salesperson:
        
\`\`\`
Subject: Offer structure for the ${vehicle}

Hi [Salesperson Name],

Thanks for sending over the quote worksheet. I am ready to close this deal today, but I would like to structure the offer with the dealer-added protection packages ($[Price]) removed.

Please let me know if you can send over a revised worksheet with those items removed and using the tier-1 buy rate.

Best regards,
[Your Name]
\`\`\``;
    }
    
    if (msg.includes('add-on') || msg.includes('addon') || msg.includes('warranty') || msg.includes('etch')) {
        return intro + `**Dealer Add-ons (Etching, Security Systems, Fabric Sprays):**
• **Negotiation Rule:** These are **always optional**.
• **Action Script:** *"I want a clean sheet with all aftermarket dealer add-ons removed. I will not pay for window etching, fabric protection, or nitrogen seals."*`;
    }

    if (contractAnalysis) {
        return intro + `**Local review of your ${contractAnalysis.year} ${contractAnalysis.make} ${contractAnalysis.model} offer:**
• **Current Payments:** $${contractAnalysis.monthlyPayment}/month with $${contractAnalysis.downPayment} down.
• **Red Flags:** ${contractAnalysis.redFlags.join(', ')}
• **Action Plan:** Ask for the dealer add-ons to be removed, and verify if the money factor is marked up. Try to negotiate down to $0 down payment.`;
    }
    
    return intro + `**Lease Negotiation Blueprint:**
1. **Cap Cost First:** Always negotiate the selling price of the car (Capitalized Cost) before discussing monthly payments.
2. **Zero Down:** Avoid down payments on leases. If the vehicle is totaled, you lose that money.
3. **Say No to Add-ons:** Reject paint sealants, security systems, and warranty upgrades.

*Try asking about "email templates", "doc fees", "money factor", or "dealer add-ons" to get specific scripts!*`;
};

// Main wrapper methods with fallbacks

export const analyseContractText = async (contractText) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.warn('GEMINI_API_KEY is not defined in backend env. Using local simulated analysis fallback.');
            return getMockContractAnalysis();
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            generationConfig: {
                responseMimeType: 'application/json'
            }
        });

        const prompt = `You are an expert financial analyst and contract attorney specializing in car lease and auto loan agreements.
        Analyze the following car lease/loan contract text and extract key financial parameters, identify potential hidden fees (red flags), and evaluate the contract's overall fairness.
        Return a JSON object conforming EXACTLY to the following structure:
        {
            "contractType": "Lease" or "Loan" or "Unknown",
            "year": number (e.g., 2024) or null,
            "make": "string (e.g., Toyota)" or null,
            "model": "string (e.g., RAV4)" or null,
            "vehicleName": "string (e.g., 2024 Toyota RAV4)" or null,
            "interestRateOrAPR": number (percentage, e.g., 5.9) or null,
            "leaseTermMonths": number (months, e.g., 36) or null,
            "monthlyPayment": number (dollars, e.g., 420.50) or null,
            "downPayment": number (dollars, e.g., 2500.00) or null,
            "residualValue": number (dollars, e.g., 19500.00) or null,
            "mileageAllowanceYearly": number (miles, e.g., 10000) or null,
            "mileageOverageFeePerMile": number (dollars, e.g., 0.20) or null,
            "earlyTerminationFee": "string explaining early termination fees/conditions" or null,
            "purchaseOptionPrice": number (dollars, e.g., 20000.00) or null,
            "dispositionFee": number (dollars, e.g., 395.00) or null,
            "maintenanceResponsibility": "string explaining who is responsible for maintenance (lessee/dealer)" or null,
            "warrantyAndInsuranceRequirements": "string explaining warranty/insurance requirements" or null,
            "redFlags": ["list", "of", "hidden fees", "or", "unfavorable clauses", "found"],
            "fairnessScore": number (0 to 100, where 100 is highly customer-friendly and 0 is predatory),
            "fairnessExplanation": "brief detailed explanation for the score"
        }
        Only return raw JSON. Here is the contract text to analyze:
        
        ---
        ${contractText}
        ---`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        return JSON.parse(responseText);
    } catch (error) {
        console.error('Error in analyseContractText service. Falling back to simulated analysis:', error);
        return getMockContractAnalysis();
    }
};

export const chatWithCoach = async (message, history = [], contractAnalysis = null) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.warn('GEMINI_API_KEY is not defined in backend env. Using local simulated coach response.');
            return getFallbackCoachResponse(message, contractAnalysis);
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        let systemInstruction = `
        You are an expert car buying and lease negotiation coach. Your goal is to guide the user in getting the absolute best deal on their car purchase, lease, or loan.
        Be strategic, professional, friendly, and practical. 
        - Recommend specific questions they should ask the dealer.
        - Point out terms they should negotiate (e.g., money factor/APR, document fees, cap cost reduction).
        - Help draft emails or text messages to send to dealers.
        `;

        if (contractAnalysis) {
            systemInstruction += `\n
            Here is the details of the vehical contract/offer they are currently trying to negotiate : 
            -Contract Type : ${contractAnalysis.contractType}
            -Interest Rate / APR : ${contractAnalysis.interestRateOrAPR}%
            -Monthly Payment : ${contractAnalysis.monthlyPayment}
            -DownPayment : ${contractAnalysis.downPayment}
            -Residual Value : ${contractAnalysis.residualValue}
            -Mileage Allowance : ${contractAnalysis.mileageAllowanceYearly} miles/year
            -Overage Fee : ${contractAnalysis.mileageOverageFeePerMile}/mile
            -Disposition Fee : ${contractAnalysis.dispositionFee}
            - Red Flags: ${JSON.stringify(contractAnalysis.redFlags)}
            - Fairness Score: ${contractAnalysis.fairnessScore}/100
            - Summary: ${contractAnalysis.fairnessExplanation}

            Provide advice tailored to negotiate these specific numbers with their dealer.
            `;
        }

        const model = genAI.getGenerativeModel({
            model : 'gemini-2.5-flash',
            systemInstruction : systemInstruction
        });

        const chat = model.startChat({
            history : history
        });

        const result = await chat.sendMessage(message);
        return result.response.text();
    } catch (error) {
        console.error('Error in chatWithCoach service. Falling back to local coach rules:', error);
        return getFallbackCoachResponse(message, contractAnalysis);
    }
};

export default analyseContractText;