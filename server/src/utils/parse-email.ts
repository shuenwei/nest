
import { simpleParser } from "mailparser";

export const extractEmailBody = async (rawEmail: string): Promise<string> => {
    try {
        const parsed = await simpleParser(rawEmail);
        
        // Check for nested message/rfc822 attachment (common in auto-forwards)
        const nestedMessage = parsed.attachments.find(att => att.contentType === 'message/rfc822');
        
        if (nestedMessage && nestedMessage.content) {
            try {
                // Parse the nested message
                const nestedParsed = await simpleParser(nestedMessage.content);
                // Prefer text, then html
                return nestedParsed.text || nestedParsed.html || nestedParsed.textAsHtml || rawEmail;
            } catch (nestedError) {
                console.warn("Failed to parse nested message/rfc822:", nestedError);
                // Fallback to top-level if nested parsing fails
            }
        }

        // Default behavior: Prefer text, fall back to html, then raw
        return parsed.text || parsed.html || parsed.textAsHtml || rawEmail;
    } catch (pError) {
        console.warn("Mailparser failed, falling back to raw.", pError);
        return rawEmail;
    }
};
