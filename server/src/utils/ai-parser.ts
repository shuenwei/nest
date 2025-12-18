import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const AZURE_AI_ENDPOINT = process.env.AZURE_AI_ENDPOINT;
const AZURE_AI_API_KEY = process.env.AZURE_AI_API_KEY;
const DEPLOYMENT_NAME = process.env.AZURE_AI_DEPLOYMENT_NAME || "gpt-5-mini";

export type AIParsedResult =
    | { type: "purchase"; merchant: string; amount: number; currency: string; date: string }
    | { type: "transfer"; amount: number; currency: string; date: string }
    | { type: "irrelevant"; reason?: string };

export const parseEmailWithAI = async (
    emailText: string
): Promise<AIParsedResult> => {
    if (!AZURE_AI_ENDPOINT || !AZURE_AI_API_KEY) {
        console.warn("Missing Azure AI credentials. Returning mock data.");
        // Default to PURCHASE for mock
        return {
            type: "purchase",
            merchant: "Unknown Merchant",
            amount: 0.0,
            currency: "SGD",
            date: new Date().toISOString(),
        };
    }

    try {
        const prompt = `
      You are a specialized financial transaction parser.
      Analyze the following email text (which may be raw MIME or HTML) and categorize it.

      1. CLASSIFY the email into one of these types:
         - "purchase": A standard purchase (e.g. Grab, credit card alert, receipt).
         - "transfer": A money transfer (e.g. PayNow, bank transfer).
         - "irrelevant": Not a financial transaction (e.g. newsletter, login alert, spam).

      2. EXTRACT data based on the type.

      Return strictly VALID JSON matching one of these structures:

      [TYPE: purchase]
      {
        "type": "purchase",
        "merchant": string,
        "amount": number,
        "currency": string (3-letter code),
        "date": string (ISO 8601 YYYY-MM-DDTHH:mm:ss.sssZ)
      }

      [TYPE: transfer]
      {
        "type": "transfer",
        "amount": number,
        "currency": string,
        "date": string (ISO 8601)
      }

      [TYPE: irrelevant]
      {
        "type": "irrelevant",
        "reason": string (short reason)
      }

      IMPORTANT: 
      - If the email contains a time but NO timezone, assume it is Singapore Time (SGT), which is UTC+8. Convert to UTC ISO string accordingly.
      - Ignore MIME headers, boundaries, and HTML tags.

      Email Text/Raw Data:
      "${emailText}"
    `;

        // Use the "Responses API" endpoint as verified by the user
        const response = await axios.post(
            `${AZURE_AI_ENDPOINT}/openai/responses?api-version=2025-04-01-preview`,
            {
                model: DEPLOYMENT_NAME,
                input: prompt,
            },
            { headers: { "Content-Type": "application/json", "api-key": AZURE_AI_API_KEY } }
        );

        let content: string | null = null;

        // Parse structure: data.output[] -> find type="message" -> content[] -> find type="output_text" -> text
        if (Array.isArray(response.data.output)) {
            const messageItem = response.data.output.find((item: any) => item.type === "message" && item.role === "assistant");
            if (messageItem && Array.isArray(messageItem.content)) {
                const textItem = messageItem.content.find((c: any) => c.type === "output_text");
                if (textItem && textItem.text) {
                    content = textItem.text;
                }
            }
        }

        // Fallback for legacy keys if the above didn't find anything
        if (!content) {
            if (response.data.choices && response.data.choices[0]) {
                content = response.data.choices[0].message.content;
            } else if (response.data.message && response.data.message.content) {
                content = response.data.message.content;
            }
        }

        if (!content) {
            console.error("Unknown Response Structure:", JSON.stringify(response.data, null, 2));
            throw new Error("Could not extract content from Azure AI response");
        }

        // Ensure content is string before parsing
        if (typeof content !== 'string') {
            content = JSON.stringify(content);
        }

        // Sanitize markdown code blocks if present
        const jsonContent = content.replace(/^```json\n|\n```$/g, "").trim();

        const parsed = JSON.parse(jsonContent);
        return parsed as AIParsedResult;
    } catch (error: any) {
        console.error("AI Parsing Failed:");
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.error("Error Message:", error.message);
        }
        throw new Error(`Failed to parse email with AI: ${error.message}`);
    }
};
