import { ShieldCheck, Lock, Server, FileText } from 'lucide-react';


interface SecureModeIntroModalProps {
    onClose: () => void;
}

export function SecureModeIntroModal({ onClose }: SecureModeIntroModalProps) {
    // Hardcoded English for now since I can't easily add keys to language files without bigger context, 
    // but using the structure to fit in.
    // Ideally we would add these keys to the i18n system.

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div
                className="bg-card w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-primary/20"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-primary/10 p-6 flex flex-col items-center justify-center text-center border-b border-primary/10">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4 ring-4 ring-primary/10">
                        <ShieldCheck className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">Welcome to Secure Workspace</h2>
                    <p className="text-muted-foreground mt-2">Your dedicated environment for sensitive data</p>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="bg-secondary/50 p-2.5 rounded-lg h-fit">
                                <Lock className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground">Data Privacy First</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Your conversations and files are processed in a secure environment. No data is used for training public models.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="bg-secondary/50 p-2.5 rounded-lg h-fit">
                                <Server className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground">Company-Hosted Models</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Access powerful internal LLMs like the "Secure Assistant" that run on our private infrastructure.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="bg-secondary/50 p-2.5 rounded-lg h-fit">
                                <FileText className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground">Safe for Confidential Info</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Correct environment for handling internal documents, PII, and trade secrets.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 pt-2 bg-secondary/20">
                    <button
                        onClick={onClose}
                        className="w-full btn-primary btn-lg flex items-center justify-center gap-2 group"
                    >
                        <span>Understood, Enter Secure Mode</span>
                        <ShieldCheck className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
}
