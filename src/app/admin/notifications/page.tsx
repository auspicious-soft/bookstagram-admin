"use client"
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import CustomSelect from '@/app/components/CustomSelect';
import UseUsers from '@/utils/useUsers';
import { postNotificationToAll, postNotificationToSpecific } from '@/services/admin-services';
import { useFieldArray, useForm, FormProvider } from "react-hook-form";

type Language = "eng" | "kaz" | "rus";

interface FormValues {
  titleTranslations: {
    id: string;
    language: Language;
    content: string;
  }[];
  descriptionTranslations: {
    id: string;
    language: Language;
    content: string;
  }[];
}

const Page = () => {
  const [sendToSpecific, setSendToSpecific] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { users } = UseUsers();
  const [usedTitleLanguages, setUsedTitleLanguages] = useState<Set<Language>>(new Set(["eng"]));
  const [usedDescLanguages, setUsedDescLanguages] = useState<Set<Language>>(new Set(["eng"]));
  const [selectedOptions, setSelectedOptions] = useState<any>([]);

  const methods = useForm<FormValues>({
    defaultValues: {
      titleTranslations: [
        { id: "1", language: "eng" as Language, content: "" }
      ],
      descriptionTranslations: [
        { id: "1", language: "eng" as Language, content: "" }
      ],
    }
  });

  const { control, handleSubmit, register } = methods;

  const {
    fields: titleFields,
    append: appendTitle,
    remove: removeTitle
  } = useFieldArray({
    control,
    name: "titleTranslations"
  });

  const {
    fields: descriptionFields,
    append: appendDescription,
    remove: removeDescription
  } = useFieldArray({
    control,
    name: "descriptionTranslations"
  });

  const handleSelectChange = (selected: any) => {
    setSelectedOptions(selected);
  };

  const onSubmit = async (data: FormValues) => {
    if (sendToSpecific && selectedOptions.length === 0) {
      return toast.warning('Please select at least one user');
    }

    // Include all languages, set missing or empty ones to null
    const allLanguages: Language[] = ["eng", "kaz", "rus"];
    const titleTransforms = allLanguages.reduce((acc, lang) => {
      const translation = data.titleTranslations.find(t => t.language === lang);
      acc[lang] = translation?.content?.trim() || null;
      return acc;
    }, {} as Record<Language, string | null>);

    const descriptionTransforms = allLanguages.reduce((acc, lang) => {
      const translation = data.descriptionTranslations.find(t => t.language === lang);
      acc[lang] = translation?.content?.trim() || null;
      return acc;
    }, {} as Record<Language, string | null>);

    const payload = {
      type:"admin",
      title: titleTransforms,
      description: descriptionTransforms,
      ...(sendToSpecific && { userIds: selectedOptions.map((selected: any) => selected?.value) })
    };

    startTransition(async () => {
      try {
        const response = !sendToSpecific
          ? await postNotificationToAll('/admin/send-notification', payload)
          : await postNotificationToSpecific('/admin/send-notification-to-specific-users', payload);

        if (response.status) {
          toast.success(response.data.message);
          methods.reset();
          setSelectedOptions([]);
        } else {
          toast.error('Failed to send notification');
        }
      } catch (error) {
        toast.error('An error occurred while sending the notification');
      }
    });
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className='main-form bg-white p-[30px] rounded-[20px]'>
          <div className="space-y-5">
            {titleFields.map((field, index) => (
              <div key={field.id}>
                <p className="mb-1 text-sm text-darkBlack">Title</p>
                <div className="flex items-center gap-[5px] w-full">
                  <label className="!flex bg-[#F5F5F5] rounded-[10px] w-full">
                    <select
                      {...register(`titleTranslations.${index}.language`)}
                      className="!mt-0 max-w-[80px] !bg-[#D9D9D9]"
                    >
                      <option value="eng">Eng</option>
                      <option value="kaz">Kaz</option>
                      <option value="rus">Rus</option>
                    </select>
                    <input
                      type="text"
                      {...register(`titleTranslations.${index}.content`)}
                      placeholder="Enter title"
                      className="!mt-0 flex-1"
                    />
                  </label>
                  {index === 0 ? (
                    <button
                      type="button"
                      onClick={() => {
                        const unusedLanguage = ["eng", "kaz", "rus"].find(
                          (lang) => !usedTitleLanguages.has(lang as Language)
                        );
                        if (unusedLanguage) {
                          appendTitle({
                            id: String(titleFields.length + 1),
                            language: unusedLanguage as Language,
                            content: "",
                          });
                          setUsedTitleLanguages(
                            (prev) => new Set([...prev, unusedLanguage as Language])
                          );
                        }
                      }}
                      disabled={usedTitleLanguages.size >= 3}
                      className="bg-[#70A1E5] text-white px-5 py-3 rounded-[10px] text-sm"
                    >
                      Add
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        const languageToRemove = field.language;
                        removeTitle(index);
                        setUsedTitleLanguages((prev) => {
                          const updated = new Set(prev);
                          updated.delete(languageToRemove);
                          return updated;
                        });
                      }}
                      className="bg-[#FF0004] text-white px-5 py-3 rounded-[10px] text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}

            {descriptionFields.map((field, index) => (
              <div key={field.id}>
                <p className="mb-1 text-sm text-darkBlack">Description</p>
                <div className="flex items-start gap-[5px] w-full">
                  <label className="!flex items-start bg-[#F5F5F5] rounded-[10px] w-full">
                    <select
                      {...register(`descriptionTranslations.${index}.language`)}
                      className="!mt-0 max-w-[80px] !bg-[#D9D9D9]"
                    >
                      <option value="eng">Eng</option>
                      <option value="kaz">Kaz</option>
                      <option value="rus">Rus</option>
                    </select>
                    <textarea
                      {...register(`descriptionTranslations.${index}.content`)}
                      rows={4}
                      placeholder="Enter message!"
                      className="!mt-0 flex-1"
                    />
                  </label>
                  {index === 0 ? (
                    <button
                      type="button"
                      onClick={() => {
                        const unusedLanguage = ["eng", "kaz", "rus"].find(
                          (lang) => !usedDescLanguages.has(lang as Language)
                        );
                        if (unusedLanguage) {
                          appendDescription({
                            id: String(descriptionFields.length + 1),
                            language: unusedLanguage as Language,
                            content: "",
                          });
                          setUsedDescLanguages(
                            (prev) => new Set([...prev, unusedLanguage as Language])
                          );
                        }
                      }}
                      disabled={usedDescLanguages.size >= 3}
                      className="bg-[#70A1E5] text-white px-5 py-3 rounded-[10px] text-sm"
                    >
                      Add
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        const languageToRemove = field.language;
                        removeDescription(index);
                        setUsedDescLanguages((prev) => {
                          const updated = new Set(prev);
                          updated.delete(languageToRemove);
                          return updated;
                        });
                      }}
                      className="bg-[#FF0004] text-white px-5 py-3 rounded-[10px] text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}

            <label className="custom-checkbox">
              <input
                type="checkbox"
                checked={sendToSpecific}
                onChange={() => setSendToSpecific(!sendToSpecific)}
                className="!w-auto"
              />
              <span className='pl-2 text-darkBlack text-sm'>Send to a specific person</span>
            </label>

            {sendToSpecific && (
              <div>
                <CustomSelect
                  name='Select People'
                  value={selectedOptions}
                  onChange={handleSelectChange}
                  required
                  options={users}
                  isMulti={true}
                />
              </div>
            )}
          </div>

          <div className='flex justify-end mt-10'>
            <button
              type='submit'
              disabled={isPending}
              className="bg-orange text-white text-sm px-4 py-[14px] text-center rounded-[28px] w-full"
            >
              {!isPending ? 'Send' : 'Sending...'}
            </button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export default Page;  