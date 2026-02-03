import { X, ChevronDown, HelpCircle } from 'lucide-react';
import { useState } from 'react';

interface FAQItem {
    question: string;
    answer: string | React.ReactNode;
}

const FAQS: FAQItem[] = [
    {
        question: "What is MUCGPT?",
        answer: "MUCGPT is an AI-powered assistant designed specifically for the City of Munich administration. It provides a secure and data-compliant way to use Large Language Models (LLMs) for daily tasks, such as drafting text, summarising documents, and researching information."
    },
    {
        question: "What is the basis of MUCGPT and how does it differ from ChatGPT?",
        answer: "MUCGPT is based on similar underlying technology to ChatGPT (LLMs) but is hosted within the City of Munich's secure infrastructure or trusted partner environments. Unlike the public ChatGPT, MUCGPT ensures that your internal data remains confidential and is not used to train public models."
    },
    {
        question: "How does it differ from search engines such as Ecosia or Google?",
        answer: "Search engines allow you to find existing web pages based on keywords. MUCGPT, on the other hand, generates new text and answers based on its training data and context you provide. It 'understands' instruction and can create content, whereas search engines only index existing content."
    },
    {
        question: "Who is allowed to use MUCGPT?",
        answer: "MUCGPT is available to all employees of the City of Munich. Access permissions may vary depending on the specific department and data classification levels required for your role."
    },
    {
        question: "What are the objectives of MUCGPT?",
        answer: "The primary objectives are to increase efficiency in administrative processes, promote digital sovereignty by reducing reliance on external providers for sensitive tasks, and foster innovation within the city administration."
    },
    {
        question: "What functions does MUCGPT have and how can I use them?",
        answer: "MUCGPT offers chat functionality, document summarization, text drafting, rephrasing, and code generation. You can use it via the web interface by selecting different specialized assistants or starting a general chat."
    },
    {
        question: "How up-to-date are the sources that MUCGPT uses to find answers?",
        answer: "The knowledge cutoff depends on the specific model selected (e.g., GPT-4, Llama 3). However, if 'Web Search' capability is enabled for an assistant, MUCGPT can search the internet for the most current information."
    },
    {
        question: "What needs to be considered when reviewing the results?",
        answer: "LLMs can hallucinate (invent facts). Always verify important information, especially legal or administrative details, against official city documents or trusted sources. You remain responsible for the final output."
    },
    {
        question: "What do I need to bear in mind regarding the further use of the results?",
        answer: "Results should be treated as drafts. Ensure you do not violate any copyright or data protection regulations when sharing the output. Label AI-generated content where appropriate."
    },
    {
        question: "Formulation aids & Citation styles",
        answer: "You can ask MUCGPT to format text in specific styles (e.g., 'formal administrative German', 'easy language', or specific citation formats). Be specific in your prompt about the desired output format."
    },
    {
        question: "What do I need to bear in mind with regard to information security and data protection?",
        answer: (
            <div className="space-y-2">
                <p><strong>Public Models (e.g., GPT-4):</strong> Do NOT enter personal data (Personenbezogene Daten) or restricted internal data (VS-NfD).</p>
                <p><strong>Secure Models (e.g., MUC-GPT Secure):</strong> Can be used for internal data (VS-NfD), but always adhere to your department's specific data handling guidelines.</p>
            </div>
        )
    },
    {
        question: "Are my entries stored anywhere? Who has access to the data?",
        answer: "Chat history is stored locally in your browser for convenience and encrypted on the server side for audit logs where legally required. System administrators have access only for technical maintenance and security auditing, subject to strict works council agreements."
    },
    {
        question: "Where are the chats in the chat history stored?",
        answer: "Your active chat list is stored in your browser's local storage. If you clear your browser cache, your history on this device may be cleared unless synced with the server."
    },
    {
        question: "Will my entries be used for training purposes for the software?",
        answer: "No. The City of Munich has strict agreements ensuring that your inputs are NOT used to train the model provider's fundamental models (e.g., OpenAI or Microsoft do not train on MUCGPT data)."
    },
    {
        question: "Will my entries be used for any other purpose?",
        answer: "Entries are used solely to generate the response and for necessary system logging/security monitoring. They are not sold or shared with third parties for marketing purposes."
    }
];

interface FAQModalProps {
    onClose: () => void;
}

export function FAQModal({ onClose }: FAQModalProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const toggleIndex = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div
                className="bg-card w-full max-w-4xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-8 py-6 border-b border-border bg-card flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <HelpCircle className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-foreground">FAQs</h2>
                            <p className="text-sm text-muted-foreground">Frequently Asked Questions about MUCGPT</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-muted-foreground hover:bg-accent hover:text-foreground rounded-full transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-secondary/20">
                    <div className="space-y-3 max-w-3xl mx-auto">
                        {FAQS.map((faq, index) => {
                            const isOpen = openIndex === index;
                            return (
                                <div
                                    key={index}
                                    className={`border rounded-xl bg-card overflow-hidden transition-all duration-200 ${isOpen ? 'border-primary/50 shadow-md ring-1 ring-primary/20' : 'border-border/60 hover:border-border'
                                        }`}
                                >
                                    <button
                                        onClick={() => toggleIndex(index)}
                                        className="w-full flex items-center justify-between px-6 py-4 text-left group"
                                    >
                                        <span className={`font-medium text-lg pr-4 transition-colors ${isOpen ? 'text-primary' : 'text-foreground group-hover:text-primary/80'}`}>
                                            {faq.question}
                                        </span>
                                        <span className={`flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                                            <ChevronDown className={`w-5 h-5 ${isOpen ? 'text-primary' : 'text-muted-foreground'}`} />
                                        </span>
                                    </button>
                                    <div
                                        className={`transition-[max-height,opacity] duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                            }`}
                                    >
                                        <div className="px-6 pb-6 pt-0 text-muted-foreground leading-relaxed border-t border-dashed border-border/50 mt-2 mx-6 pt-4">
                                            {faq.answer}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-4 bg-card border-t border-border shrink-0 flex justify-between items-center text-xs text-muted-foreground">
                    <p>Last updated: October 2025</p>
                    <p>Contact IT-Referat for specific inquiries.</p>
                </div>
            </div>
        </div>
    );
}
