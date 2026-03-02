import { useState, useRef } from 'react';
import { X, Upload, FileJson, Info } from 'lucide-react';
import { Assistant } from '../types';
import { useTranslation } from '../contexts/LanguageContext';

interface ImportAssistantModalProps {
    onClose: () => void;
    onImport: (assistantData: Assistant) => void;
}

export function ImportAssistantModal({ onClose, onImport }: ImportAssistantModalProps) {
    const { t } = useTranslation();
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Provide safe fallbacks for translations since nested keys might not be fully supported by the simplified t() yet
    const title = t('import_assistant.title' as any) !== 'import_assistant.title' ? t('import_assistant.title' as any) : 'Import Assistant';
    const description = t('import_assistant.description' as any) !== 'import_assistant.description' ? t('import_assistant.description' as any) : 'Upload an assistant configuration file (.json) to add it to your collection.';
    const dragDrop = t('import_assistant.dragDrop' as any) !== 'import_assistant.dragDrop' ? t('import_assistant.dragDrop' as any) : 'Drag and drop your JSON file here';
    const clickToBrowse = t('import_assistant.clickToBrowse' as any) !== 'import_assistant.clickToBrowse' ? t('import_assistant.clickToBrowse' as any) : 'or click to browse';
    const info = t('import_assistant.info' as any) !== 'import_assistant.info' ? t('import_assistant.info' as any) : "The file should be a valid JSON exported from MUCGPT containing the assistant's configuration. It will be added to your personal workspace.";
    const cancel = t('import_assistant.cancel' as any) !== 'import_assistant.cancel' ? t('import_assistant.cancel' as any) : 'Cancel';

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const processFile = (file: File) => {
        setError(null);
        if (!file.name.endsWith('.json')) {
            setError('Please upload a valid .json file.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importedData = JSON.parse(event.target?.result as string);

                // Basic validation
                if (!importedData || typeof importedData !== 'object' || Array.isArray(importedData)) {
                    throw new Error("Invalid format: Not a JSON object");
                }
                if (!importedData.name || typeof importedData.name !== 'string') {
                    throw new Error("Invalid format: Missing or invalid 'name' property");
                }

                onImport(importedData as Assistant);
            } catch (err: any) {
                setError(`Failed to parse file: ${err.message || 'Unknown error'}`);
            }
        };
        reader.onerror = () => {
            setError('Failed to read the file.');
        };
        reader.readAsText(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div
                className="bg-card w-full max-w-lg rounded-2xl shadow-2xl flex flex-col border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-5 border-b border-border bg-card flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-foreground">{title}</h2>
                        <p className="text-sm text-muted-foreground mt-1">{description}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-muted-foreground hover:bg-accent hover:text-foreground rounded-full transition-colors self-start -mt-2 -mr-2"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`
                            border-2 border-dashed rounded-xl p-8 mb-6
                            flex flex-col items-center justify-center text-center cursor-pointer
                            transition-all duration-200
                            ${isDragging
                                ? 'border-primary bg-primary/5 shadow-inner'
                                : 'border-border/60 hover:border-primary/50 hover:bg-accent/30'
                            }
                            ${error ? 'border-red-500/50 bg-red-500/5' : ''}
                        `}
                    >
                        <input
                            type="file"
                            accept=".json"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                        />
                        <div className={`p-4 rounded-full mb-4 ${isDragging ? 'bg-primary/20' : 'bg-secondary'}`}>
                            {isDragging ? (
                                <Upload className={`w-8 h-8 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
                            ) : (
                                <FileJson className="w-8 h-8 text-muted-foreground" />
                            )}
                        </div>
                        <p className="text-base font-medium text-foreground mb-1">
                            {dragDrop}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {clickToBrowse}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-600 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    <div className="flex items-start gap-3 p-4 bg-secondary/30 rounded-lg text-sm text-muted-foreground">
                        <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <p className="leading-relaxed">
                            {info}
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-border bg-card/50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="btn-ghost"
                    >
                        {cancel}
                    </button>
                </div>
            </div>
        </div>
    );
}
