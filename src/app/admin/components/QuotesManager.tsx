'use client';

import React, { useEffect, useState } from 'react';
import { useFieldArray, useForm, FormProvider } from "react-hook-form";
import { Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { addQuotation, DeleteQuotation, getQuotation } from '@/services/admin-services';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { toast } from "sonner";
import useSWR from 'swr';

type Language = "eng" | "kaz" | "rus";

interface FormValues {
    quoteTranslations: {
        id: string;
        language: Language;
        content: string;
    }[];
}

interface Quote {
    eng: string;
    kaz: string;
    rus: string | null;
    _id?: string;
}

interface QuoteItem {
    _id: string;
    quote: Quote;
    createdAt: string;
    updatedAt: string;
}

const QuotesManager: React.FC = () => {
    const [quotes, setQuotes] = useState<QuoteItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [usedLanguages, setUsedLanguages] = useState<Set<Language>>(new Set(["eng"]));
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<QuoteItem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [currentLanguages, setCurrentLanguages] = useState<{ [key: string]: Language }>({});

    const methods = useForm<FormValues>({
        defaultValues: {
            quoteTranslations: [
                { id: "1", language: "eng" as Language, content: "" }
            ],
        }
    });

    const { control, handleSubmit, register, reset } = methods;

    const {
        fields: quoteFields,
        append: appendQuote,
        remove: removeQuote
    } = useFieldArray({
        control,
        name: "quoteTranslations"
    });

    // Fetch all quotes
    const fetchQuotes = async () => {
        try {
            // Mock API call - replace with actual: 
            const response = await getQuotation('/admin/quotes');

            setQuotes(response.data.data);
        } catch (error) {
            console.error('Error fetching quotes:', error);
        }
    };

    useEffect(() => {
        fetchQuotes();
    }, []);

    const onSubmit = async (data: FormValues) => {
        try {
            setLoading(true);
            const allLanguages: Language[] = ["eng", "kaz", "rus"];
            const quoteTransforms = allLanguages.reduce((acc, lang) => {
                const translation = data.quoteTranslations.find(t => t.language === lang);
                acc[lang] = translation?.content?.trim() || '';
                return acc;
            }, {} as Record<Language, string>);
            
            console.log('quoteTransforms: ', quoteTransforms);
            const missingLanguages = allLanguages.filter(lang => !quoteTransforms[lang]);
            console.log('missingLanguages: ', missingLanguages);
            
            if (missingLanguages.length > 0) {
                toast.error(`Please add quotes in all languages. Missing: ${missingLanguages.map(l => l.toUpperCase()).join(', ')}`);
                setLoading(false);
                return;
            }
            const payload = { quote: quoteTransforms };
            // Mock API call - replace with actual: 
            const response = await addQuotation('/admin/quotes', payload);
            if (response.status === 201) {
                toast.success(response?.data?.message || "Quotation is created successfully");
            }
            else {
                toast.error("Failed creating quote")
            }
            reset();
            setUsedLanguages(new Set(["eng"]));
            fetchQuotes(); // Refresh list
        } catch (error) {
            console.error('Error submitting quote:', error);
            toast.error(error.response.data.message || "Failed creating quote")
        } finally {
            setLoading(false);
        }
    };

    const openDeleteModal = (quote: QuoteItem) => {
        setItemToDelete(quote);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setItemToDelete(null);
    };

    const handleDelete = async () => {
        if (!itemToDelete) return;

        try {
            setIsDeleting(true);
            // Mock API call - replace with actual: 
            const response = await DeleteQuotation(`/admin/quotes/${itemToDelete._id}`);
            if (response.status === 200) {
                toast.success(response?.data?.message || "Quotation is deleted successfully");
            }
            else {
                toast.error("Failed to delete quote")
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
            setQuotes(prev => prev.filter(quote => quote._id !== itemToDelete._id));
            closeDeleteModal();
        } catch (error) {
            console.error('Error deleting quote:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    const cycleLanguage = (quoteId: string, direction: 'prev' | 'next') => {
        const languages: Language[] = ['eng', 'kaz', 'rus'];
        const currentLang = currentLanguages[quoteId] || 'eng';
        const currentIndex = languages.indexOf(currentLang);

        let newIndex;
        if (direction === 'next') {
            newIndex = (currentIndex + 1) % languages.length;
        } else {
            newIndex = (currentIndex - 1 + languages.length) % languages.length;
        }

        setCurrentLanguages(prev => ({
            ...prev,
            [quoteId]: languages[newIndex]
        }));
    };

    return (
        <FormProvider {...methods}>
            <div className="min-h-screen bg-[#E8DDD3]">
                <div className="">

                    <div className="bg-white p-8 rounded-[20px] mb-8">
                        <div className="space-y-5">
                            {quoteFields.map((field, index) => (
                                <div key={field.id}>
                                    <p className="mb-1 text-sm text-gray-700">Quote</p>
                                    <div className="flex items-start gap-[5px] w-full">
                                        <label className="flex items-start bg-[#F5F5F5] rounded-[10px] w-full">
                                            <select
                                                {...register(`quoteTranslations.${index}.language`)}
                                                className="mt-0 max-w-[80px] bg-[#D9D9D9] border-0 rounded-l-[10px] px-3 py-3"
                                            >
                                                <option value="eng">Eng</option>
                                                <option value="kaz">Kaz</option>
                                                <option value="rus">Rus</option>
                                            </select>
                                            <textarea
                                                {...register(`quoteTranslations.${index}.content`)}
                                                rows={4}
                                                placeholder="Lorem ipsum description for this book will go here"
                                                className="mt-0 flex-1 border-0 bg-transparent px-4 py-3 rounded-r-[10px] focus:outline-none resize-none"
                                            />
                                        </label>
                                        {index === 0 ? (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const unusedLanguage = ["eng", "kaz", "rus"].find(
                                                        (lang) => !usedLanguages.has(lang as Language)
                                                    );
                                                    if (unusedLanguage) {
                                                        appendQuote({
                                                            id: String(quoteFields.length + 1),
                                                            language: unusedLanguage as Language,
                                                            content: "",
                                                        });
                                                        setUsedLanguages(
                                                            (prev) => new Set([...prev, unusedLanguage as Language])
                                                        );
                                                    }
                                                }}
                                                disabled={usedLanguages.size >= 3}
                                                className="bg-[#70A1E5] text-white px-5 py-3 rounded-[10px] text-sm whitespace-nowrap disabled:opacity-50"
                                            >
                                                Add
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const languageToRemove = field.language;
                                                    removeQuote(index);
                                                    setUsedLanguages((prev) => {
                                                        const updated = new Set(prev);
                                                        updated.delete(languageToRemove);
                                                        return updated;
                                                    });
                                                }}
                                                className="bg-[#FF0004] text-white px-5 py-3 rounded-[10px] text-sm whitespace-nowrap"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end mt-6">
                            <button
                                type="button"
                                onClick={handleSubmit(onSubmit)}
                                disabled={loading}
                                className="bg-[#FF6B35] text-white text-sm px-8 py-3 rounded-full hover:bg-[#ff5722] transition-colors w-full disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold mb-4">Saved Quotes</h2>
                        <div className="grid md:grid-cols-3 gap-4">
                            {quotes.map((quoteItem, index) => {
                                const displayLang = currentLanguages[quoteItem._id] || 'eng';
                                return (
                                    <div key={quoteItem._id} className="bg-white p-6 rounded-[20px] shadow-sm">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-sm text-gray-500">{index + 1}.</span>
                                            <button
                                                onClick={() => openDeleteModal(quoteItem)}
                                                className="text-[#FF6B35] text-sm flex items-center gap-1 hover:text-[#ff5722]"
                                            >
                                                <Trash2 size={16} />
                                                Delete
                                            </button>
                                        </div>

                                        <p className="text-sm mb-6 min-h-[80px]">
                                            &quot;{quoteItem.quote[displayLang] || quoteItem.quote.eng}&quot;
                                        </p>

                                        <div className="flex items-center justify-between">
                                            <button
                                                onClick={() => cycleLanguage(quoteItem._id, 'prev')}
                                                className="p-1 hover:bg-gray-100 rounded"
                                            >
                                                <ChevronLeft size={20} />
                                            </button>
                                            <span className="font-semibold uppercase">{displayLang}</span>
                                            <button
                                                onClick={() => cycleLanguage(quoteItem._id, 'next')}
                                                className="p-1 hover:bg-gray-100 rounded"
                                            >
                                                <ChevronRight size={20} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <DeleteConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={closeDeleteModal}
                    onConfirm={handleDelete}
                    isDeleting={isDeleting}
                    title="Delete Quote?"
                    message="Are you sure you really want to delete this quote?"
                />
            </div>
        </FormProvider>
    );
};

export default QuotesManager;