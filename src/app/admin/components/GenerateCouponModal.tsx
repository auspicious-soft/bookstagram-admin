import React, { useState, useTransition } from 'react';
import Modal from '@mui/material/Modal';
import CourseCard from './CourseCard';
import { PlusIcon } from '@/utils/svgicons';
import CouponCode from './CouponCode';
import { useFieldArray, useForm, FormProvider } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import useSWR from 'swr';
import { addToBookSchool, getAllPublishers } from '@/services/admin-services';
import { getImageClientS3URL } from '@/utils/get-image-ClientS3URL';
import { toast } from 'sonner';

type Language = "eng" | "kaz" | "rus";

interface ModalProp {
  open: boolean;
  onClose: () => void;
  mutateCoupons: () => void;
}

interface TranslationField {
  language: Language;
  name: string;
}

interface FormData {
  translations: TranslationField[];
  allowedActivation: number;
  publisherId: string[];
}

const schema = yup.object().shape({
  translations: yup.array().of(
    yup.object().shape({
      language: yup.string().required('Language is required'),
      name: yup.string().required('Name is required')
    })
  ),
  allowedActivation: yup
    .number()
    .required('Number of activations is required')
    .positive('Must be a positive number')
    .integer('Must be an integer'),
  publisherId: yup
    .array()
    .of(yup.string())
    .min(1, 'Select at least one publisher')
});

const generateCouponCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 15; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const GenerateCouponModal: React.FC<ModalProp> = ({ open, onClose, mutateCoupons }) => {
  const [isPending, startTransition] = useTransition();
  const [couponModal, setCouponModal] = useState(false);
  const [searchParams, setSearchParams] = useState("");
  const [couponCode, setCouponCode] = useState('');
  const [usedLanguages, setUsedLanguages] = useState<Set<Language>>(new Set(["eng"]));
  const url = `/admin/publishers${searchParams ? `?description=${searchParams}` : ""}`;
  const { data } = useSWR(url, getAllPublishers, {
    revalidateOnFocus: false
  });

  const allPublishers = data?.data?.data;
  const methods = useForm<FormData>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      translations: [{ language: 'eng', name: '' }],
      allowedActivation: 100,
      publisherId: []
    }
  });

  const {
    control,
    handleSubmit,
    register,
    formState: { errors },
    setValue,
    watch
  } = methods;

  const { fields: nameFields, append: appendName, remove: removeName } = useFieldArray({
    control,
    name: "translations"
  });

  const selectedPublishers = watch('publisherId');

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    const trimmedStartValue = value.replace(/^\s+/, '');
    setSearchParams(trimmedStartValue);

  };

  const handleSelect = (id: string) => {
    const current = watch('publisherId');
    const updated = current.includes(id)
      ? current.filter(publisherId => publisherId !== id)
      : [...current, id];
    setValue('publisherId', updated);
  };

  const onSubmit = async (data: FormData) => {
    const generatedCode = generateCouponCode();
    setCouponCode(generatedCode);
    try {
      const payload = {
        couponCode: generatedCode,
        name: data.translations.reduce((acc, curr) => ({
          ...acc,
          [curr.language]: curr.name
        }), {}),
        allowedActivation: data.allowedActivation,
        publisherId: data.publisherId
      };

      startTransition(async () => {
        const response = await addToBookSchool('/admin/book-schools', payload);
        if (response.status === 201) {
          setCouponModal(true)
          mutateCoupons();
          toast.success("Books added to discount successfully")
        } else {
          toast.error("Failed To add books to discount");
        }
      });
    } catch (error) {
      console.error('Error adding books to discount:', error);
      toast.error("An error occurred while adding books to discount");
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="child-modal-title"
      className="grid place-items-center"
    >
      <div className="modal bg-white pt-8 px-5 max-w-[950px] mx-auto rounded-[20px] w-full h-full">
        <div className="max-h-[80vh] overflow-auto overflow-custom relative">
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <h2 className="text-3xl text-darkBlack mb-5">Generate A Coupon Code</h2>

              <div className="grid grid-cols-[2fr_1fr] gap-5 mb-5">
                {nameFields.map((field, index) => (
                  <div key={field.id} className="mb-4">
                    <p className="mb-2 text-sm font-medium text-gray-700">Name of School</p>
                    <div className="flex items-center gap-2 w-full">
                      <div className="flex bg-gray-100 rounded-md overflow-hidden w-full shadow-sm">
                        <select
                          {...register(`translations.${index}.language`)}
                          className="px-3 py-2 bg-gray-200 text-gray-700 focus:outline-none"
                        >
                          <option value="eng">Eng</option>
                          <option value="kaz">Kaz</option>
                          <option value="rus">Rus</option>
                        </select>
                        <input
                          required
                          type="text"
                          {...register(`translations.${index}.name`)}
                          placeholder="Enter name"
                          className="flex-1 px-4 py-2 focus:outline-none text-gray-700"
                        />
                      </div>
                      {index === 0 ? (
                        <button
                          type="button"
                          onClick={() => {
                            const unusedLanguage = ["eng", "kaz", "rus"].find(
                              (lang) => !usedLanguages.has(lang as Language)
                            );
                            if (unusedLanguage) {
                              appendName({
                                language: unusedLanguage as Language,
                                name: "",
                              });
                              setUsedLanguages(new Set([...usedLanguages, unusedLanguage as Language]));
                            }
                          }}
                          disabled={usedLanguages.size >= 3}
                          className="bg-[#ef6a00] hover:bg-[#faa259] text-white px-4 py-2 rounded-md text-sm focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                        >
                          Add
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            const languageToRemove = watch(`translations.${index}.language`);
                            removeName(index);
                            setUsedLanguages(prev => {
                              const updated = new Set(prev);
                              updated.delete(languageToRemove as Language);
                              return updated;
                            });
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm focus:outline-none shadow-md"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    {errors.translations?.[index]?.name && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.translations[index]?.name?.message}
                      </p>
                    )}
                  </div>
                ))}

                <label className="block">
                  <span className="block mb-2 text-sm font-medium text-gray-700">Number of activations allowed</span>
                  <input
                    type="number"
                    {...register('allowedActivation')}
                    placeholder="100"
                    className="w-full mt-1 px-4 py-2 rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 shadow-sm"
                  />
                  {errors.allowedActivation && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.allowedActivation.message}
                    </p>
                  )}
                </label>
              </div>

              <h2 className="text-3xl text-darkBlack mb-5">Select Publishers</h2>
              <label className="w-full block mb-5">
                Search
                <input
                  type="search"
                  value={searchParams}
                  onChange={handleInputChange}
                  placeholder="Enter Name of the course"
                  className="w-full mt-1"
                />
              </label>

              <div className="mt-5 pt-5 grid grid-cols-4 gap-5 border-t border-dashed border-[#D0D0D0]">
                {allPublishers?.map((data) => (
                  <CourseCard
                    key={data?.publisher?._id}
                    title={data?.publisher?.name?.eng}
                    image={getImageClientS3URL(data?.publisher?.image)}
                    selected={selectedPublishers.includes(data?.publisher?._id)}
                    onSelect={() => handleSelect(data?.publisher?._id)}
                  />
                ))}
              </div>

              {errors.publisherId && (
                <p className="text-red-500 text-sm mt-1">{errors.publisherId.message}</p>
              )}

              <div className="mt-8 flex gap-2.5 justify-end sticky bottom-0 bg-white pt-4 px-5 border-t border-gray-200">
                <button
                  type="submit"
                  className="flex items-center gap-2.5 bg-orange text-white text-sm px-5 py-2.5 text-center rounded-[28px]"
                >
                  <PlusIcon /> Generate A Coupon
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-[28px] border border-darkBlack py-2 px-5 text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </FormProvider>
        </div>
        <CouponCode
          couponCode={couponCode}
          open={couponModal}
          onClose={() => setCouponModal(false)}
          close={onClose}
        />
        {/* <CouponCode open={couponModal} onClose={() => setCouponModal(false)} /> */}
      </div>
    </Modal>
  );
};

export default GenerateCouponModal;