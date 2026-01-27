import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Copy, CircleCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardContent } from "@/components/ui/card";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { useUser } from "@/contexts/UserContext";
import { toast } from "sonner";

const EmailForwardingPage = () => {
    const navigate = useNavigate();
    const { user } = useUser();
    const [copied, setCopied] = useState(false);

    const forwardingEmail = user?.id
        ? `transaction+${user.id}@nest.shuenwei.dev`
        : "Loading...";

    const copyToClipboard = async () => {
        if (!user?.id) return;

        try {
            await navigator.clipboard.writeText(forwardingEmail);
            handleCopySuccess();
        } catch (err) {
            try {
                const textArea = document.createElement("textarea");
                textArea.value = forwardingEmail;

                textArea.style.position = "fixed";
                textArea.style.left = "-9999px";
                textArea.style.top = "0";
                document.body.appendChild(textArea);

                textArea.focus();
                textArea.select();

                const successful = document.execCommand('copy');
                document.body.removeChild(textArea);

                if (successful) {
                    handleCopySuccess();
                } else {
                    toast.error("Failed to copy email address");
                }
            } catch (fallbackErr) {
                console.error("Copy failed", fallbackErr);
                toast.error("Failed to copy email address");
            }
        }
    };

    const handleCopySuccess = () => {
        setCopied(true);
        toast.success("Email address copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-[#F8F8F8] font-outfit flex justify-center px-4">
            <div className="w-full max-w-sm pt-5 pb-24">
                <Button
                    variant="ghost"
                    className="flex items-center gap-2 px-0 has-[>svg]:pr-0 mb-8"
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft className="size-5" />
                    <span className="text-base font-medium">Back</span>
                </Button>

                <div className="mb-6">
                    <h1 className="text-2xl font-bold">Email Forwarding</h1>
                    <p className="text-muted-foreground text-sm text-justify">
                        Forward your bank transaction emails to the email address below and they will automatically be added to Nest.
                    </p>
                </div>

                {/* Email Display Card */}
                <Card className="shadow-none mb-8 gap-0">
                    <CardTitle className="px-6">
                        Nest Email Address
                    </CardTitle>
                    <CardContent className="px-6 mt-2">
                        <div className="flex items-center gap-2 bg-muted/50 p-3 rounded-md border">
                            <code className="text-sm break-all flex-1 text-primary">
                                {forwardingEmail}
                            </code>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
                                onClick={copyToClipboard}
                            >
                                {copied ? (
                                    <CircleCheck className="h-4 w-4 text-green-600" />
                                ) : (
                                    <Copy className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            Note: This email address is unique to you. DO NOT share it with others.
                        </p>
                    </CardContent>
                </Card>

                <h2 className="text-lg font-semibold mb-4">Setup Guides</h2>
                <Accordion type="single" collapsible className="w-full space-y-4">
                    <AccordionItem value="gmail" className="border rounded-lg bg-white px-4 shadow-none">
                        <AccordionTrigger className="hover:no-underline py-4">
                            <span className="font-medium">Gmail Setup</span>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4 text-sm text-muted-foreground space-y-3">
                            <p>1. Go to Gmail settings on desktop (gear icon) &gt; "See all settings" &gt; "Forwarding and POP/IMAP".</p>
                            <p>2. Click "Add a forwarding address" and enter your Nest email address (above).</p>
                            <p>3. Verify the address (a verification link will be sent to your Nest telegram bot chat).</p>
                            <p><strong>Important: To protect your privacy, set up a filter to forward only bank transaction emails!</strong></p>
                            <p>4. Go to the "Filters and Blocked Addresses" tab.</p>
                            <p>5. Click "Create a new filter".</p>
                            <p>6. In the "From" field, enter your bank's email address.</p>
                            <p>7. In the "Subject" field, enter keywords that can be found in all your bank's transactions email subject line, such as "transaction was successful". Doing this helps to filter out OTP emails for your privacy.</p>
                            <p>8. Click "Create filter".</p>
                            <p>9. Check "Forward it to:" and select your Nest email address.</p>
                            <p>10. Click "Create filter".</p>
                            <p className="italic mt-2 text-xs">Note: Do not use the general "Forwarding" tab as it will forward all emails.</p>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="outlook" className="border rounded-lg bg-white px-4 shadow-none">
                        <AccordionTrigger className="hover:no-underline py-4">
                            <span className="font-medium">Outlook Setup</span>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4 text-sm text-muted-foreground space-y-3">
                            <p>1. Go to Outlook Settings on desktop (gear icon) &gt; "Mail" &gt; "Rules".</p>
                            <p>2. Click "Add new rule".</p>
                            <p><strong>Important: To protect your privacy, set up a filter to forward only bank transaction emails!</strong></p>
                            <p>3. Name it appropriately, such as "Forward Bank Emails".</p>
                            <p>4. Add a condition: "From" &gt; [Your Bank's Email Address].</p>
                            <p>5. Add a second condition: "Subject Includes" &gt; [Enter keywords that can be found in all your bank's transactions email subject line, such as "transaction was successful"]. Doing this helps to filter out OTP emails for your privacy.</p>
                            <p>6. Add an action: "Forward to" &gt; [Your Nest Email Address].</p>
                            <p>7. Click "Save".</p>
                            <p className="italic mt-2 text-xs">Note: Do not use the general "Forwarding" tab as it will forward all emails.</p>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="manual" className="border rounded-lg bg-white px-4 shadow-none">
                        <AccordionTrigger className="hover:no-underline py-4">
                            <span className="font-medium">Manual Forwarding</span>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4 text-sm text-muted-foreground space-y-3">
                            <p>You can also manually forward any bank transaction email to your Nest email address.</p>
                            <p>Just click "Forward" in your email client and send it to the email address above.</p>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </div>
    );
};

export default EmailForwardingPage;
