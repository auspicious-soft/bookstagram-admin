// "use client";
// import React, { useState } from "react";
// import { useFieldArray, useForm } from "react-hook-form";
// import { DeleteIcon, CrossIcon, FileIcon } from "@/utils/svgicons";

// const CourseForm = () => {
//   const { register, control, handleSubmit, watch, setValue } = useForm({
//     defaultValues: {
//       courseName: "",
//       languages: [
//         {
//           language: "",
//           lessons: [
//             {
//               srNo: "1",
//               name: "",
//               subLessons: [
//                 {
//                   srNo: "1.1",
//                   name: "",
//                   description: "",
//                   file: null,
//                   additionalFiles: [],
//                   links: [],
//                 },
//               ],
//               description: "",
//               file: null,
//               additionalFiles: [],
//               links: [],
//             },
//           ],
//         },
//       ],
//     },
//   });

//   const {
//     fields: languageFields,
//     append: appendLanguage,
//     remove: removeLanguage,
//   } = useFieldArray({
//     control,
//     name: "languages",
//   });

//   const [selectedLanguages, setSelectedLanguages] = useState([]);

//   const onSubmit = (data) => {
//     console.log(data);
//   };

//   const handleLanguageSelect = (language: string) => {
//     setSelectedLanguages((prev) => [...prev, language]);
//   };

//   const handleAddLanguage = () => {
//     if (languageFields.length < 3) {
//       appendLanguage({
//         language: "",
//         lessons: [
//           {
//             srNo: "1",
//             name: "",
//             subLessons: [
//               {
//                 srNo: "1.1",
//                 name: "",
//                 description: "",
//                 file: null,
//                 additionalFiles: [],
//                 links: [],
//               },
//             ],
//             description: "",
//             file: null,
//             additionalFiles: [],
//             links: [],
//           },
//         ],
//       });
//     } else {
//       alert("You can add a maximum of 3 languages.");
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit(onSubmit)} className="bg-[#FFF] p-8 rounded-[20px] shadow-md">
//       <div className="space-y-4">
//         <div className="h-10 flex justify-between items-center">
//           <h2 className="text-lg font-medium">Name of the Course</h2>
//           <button type="button" onClick={handleAddLanguage} className="text-white text-sm font-normal px-5 py-3 bg-[#f96815] rounded-[28px] justify-center items-center gap-2.5 inline-flex">
//             Add New Language
//           </button>
//         </div>

//         {languageFields.map((languageField, languageIndex) => (
//           <div key={languageField.id} className="bg-[#fef7f3] p-6 rounded-xl shadow-md mb-6">
//             <div className="flex items-center gap-2 mb-4">
//               <select {...register(`languages.${languageIndex}.language`)} onChange={(e) => handleLanguageSelect(e.target.value)} className="w-full p-3 border rounded-lg">
//                 <option value="" disabled>
//                   Select Language
//                 </option>
//                 {["eng", "kaz", "rus"].map((lang) => (
//                   <option key={lang} value={lang} disabled={selectedLanguages.includes(lang)}>
//                     {lang.toUpperCase()}
//                   </option>
//                 ))}
//               </select>
//               {languageIndex > 0 && (
//                 <button type="button" onClick={() => removeLanguage(languageIndex)} className="bg-red-500 text-white px-4 py-2 rounded">
//                   Remove
//                 </button>
//               )}
//             </div>

//             <LessonFieldArray nestIndex={languageIndex} control={control} register={register} watch={watch} />
//           </div>
//         ))}

//         <div className="flex justify-end gap-4 mt-6">
//           <button type="button" className="px-6 py-2 border rounded-full">
//             Cancel
//           </button>
//           <button type="submit" className="bg-orange text-white px-5 py-2 rounded-[28px]">
//             Save Lesson
//           </button>
//         </div>
//       </div>
//     </form>
//   );
// };

// const LessonFieldArray = ({ nestIndex, control, register, watch }) => {
//   const { fields, append, remove } = useFieldArray({
//     control,
//     name: `languages.${nestIndex}.lessons`,
//   });

//   const handleAddLesson = () => {
//     const currentLessons = watch(`languages.${nestIndex}.lessons`);
//     const nextSrNo = currentLessons.length + 1;
//     append({
//       srNo: nextSrNo.toString(),
//       name: "",
//       subLessons: [
//         {
//           srNo: `${nextSrNo}.1`,
//           name: "",
//           description: "",
//           file: null,
//           additionalFiles: [],
//           links: [],
//         },
//       ],
//       description: "",
//       file: null,
//       additionalFiles: [],
//       links: [],
//     });
//   };

//   return (
//     <div className="space-y-4">
//       {fields.map((field, index) => (
//         <div key={field.id} className="space-y-4 border-b pb-4 bg-white p-6 rounded-xl mb-6">
//           <div className="flex items-center gap-2 justify-between">
//             <span className="font-medium">Lesson {index + 1}</span>
//             <button type="button" onClick={() => remove(index)} className="bg-red-500 text-white px-3 py-1 rounded text-sm bg-red-500 text-white px-5 py-2 rounded-[28px] flex items-center gap-2">
//               <DeleteIcon stroke="#FFF" />
//             </button>
//           </div>

//           <div className="flex gap-4">
//             <input {...register(`languages.${nestIndex}.lessons.${index}.srNo`)} placeholder="Sr.No" className="w-[80px] p-2 bg-gray-50 rounded border-none" value={index + 1} disabled />
//             <input {...register(`languages.${nestIndex}.lessons.${index}.name`)} placeholder="Name of lesson" className="w-full p-2 bg-gray-50 rounded border-none" />
//           </div>

//           <SubLessonFieldArray control={control} register={register} nestIndex={nestIndex} lessonIndex={index} />
//         </div>
//       ))}

//       <button type="button" onClick={handleAddLesson} className="bg-blue-500 text-white px-6 py-2 rounded-full w-auto">
//         Add More Video Lessons
//       </button>
//     </div>
//   );
// };

// const SubLessonFieldArray = ({ control, register, nestIndex, lessonIndex }) => {
//   const { fields, append, remove } = useFieldArray({
//     control,
//     name: `languages.${nestIndex}.lessons.${lessonIndex}.subLessons`,
//   });

//   const handleAddSubLesson = () => {
//     append({
//       srNo: `${lessonIndex + 1}.${fields.length + 1}`,
//       name: "",
//       description: "",
//       file: null,
//       additionalFiles: [],
//       links: [],
//     });
//   };

//   return (
//     <div className="ml-8 space-y-4 mt-4 border-[#EEE]">
//       {fields.map((subField, subIndex) => (
//         <div key={subField.id} className="rounded-[10px] border-2 border-[#EEE] p-4 space-y-3">
//           {/* <div className="flex items-center justify-between"> */}
//           {/* <span className="text-sm text-gray-600">Sub-Lesson {lessonIndex + 1}.{subIndex + 1}</span> */}

//           {/* </div> */}

//           <div className="flex gap-4">
//             <input
//               {...register(`languages.${nestIndex}.lessons.${lessonIndex}.subLessons.${subIndex}.srNo`)}
//               value={`${lessonIndex + 1}.${subIndex + 1}`}
//               className="w-[80px] p-2 bg-gray-50 rounded border-none"
//               disabled
//             />
//             <input {...register(`languages.${nestIndex}.lessons.${lessonIndex}.subLessons.${subIndex}.name`)} placeholder="Sub-lesson name" className="flex-grow p-2 border rounded" />
//             <input type="file" {...register(`languages.${nestIndex}.lessons.${lessonIndex}.subLessons.${subIndex}.file`)} className="hidden" id={`file-${nestIndex}-${lessonIndex}-${subIndex}`} />
//             <label htmlFor={`file-${nestIndex}-${lessonIndex}-${subIndex}`} className="cursor-pointer bg-white border px-4 py-2 rounded">
//               Select File
//             </label>
//             {/* <label className="block mb-1 text-sm font-medium">Select File</label> */}
//             <button type="button" onClick={() => remove(subIndex)} className="text-red-500 text-sm border-[#989898] border-[1px] text-white px-2 py-2 rounded-[28px]">
//               <CrossIcon />
//             </button>
    
//           </div>

//           <textarea {...register(`languages.${nestIndex}.lessons.${lessonIndex}.subLessons.${subIndex}.description`)} placeholder="Description" className="w-full p-2 border rounded" rows={3} />

//           {/* Additional Files and Links for Sub-Lesson */}
//           <div className="mt-4">
//             <div className="flex gap-4 mb-2">
//               <label className="font-medium">Additional Files</label>
//               <input type="file" {...register(`languages.${nestIndex}.lessons.${lessonIndex}.subLessons.${subIndex}.additionalFiles[]`)} className="p-2 border rounded" multiple />
//             </div>

//             <div className="flex gap-4">
//               <label className="font-medium">Links</label>
//               <input type="url" {...register(`languages.${nestIndex}.lessons.${lessonIndex}.subLessons.${subIndex}.links[]`)} placeholder="Add a link" className="p-2 border rounded w-full" />
//             </div>
//           </div>
//         </div>
//       ))}

//       <button type="button" onClick={handleAddSubLesson} className="mt-2 text-blue-500 flex items-center gap-1">
//         + Add Sub-Lesson
//       </button>
//     </div>
//   );
// };

// export default CourseForm;


"use client";
import React, { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { DeleteIcon, CrossIcon, FileIcon } from "@/utils/svgicons";

const CourseForm = () => {
  const { register, control, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      courseName: "",
      languages: [
        {
          language: "",
          lessons: [
            {
              srNo: "1",
              name: "",
              subLessons: [
                {
                  srNo: "1.1",
                  name: "",
                  description: "",
                  file: null,
                  additionalFiles: [],
                  links: [],
                },
              ],
              description: "",
              file: null,
              additionalFiles: [],
              links: [],
            },
          ],
        },
      ],
    },
  });

  const {
    fields: languageFields,
    append: appendLanguage,
    remove: removeLanguage,
  } = useFieldArray({
    control,
    name: "languages",
  });

  const [selectedLanguages, setSelectedLanguages] = useState([]);

  const onSubmit = (data) => {
    console.log(data);
  };

  const handleLanguageSelect = (language: string) => {
    setSelectedLanguages((prev) => [...prev, language]);
  };

  const handleAddLanguage = () => {
    if (languageFields.length < 3) {
      appendLanguage({
        language: "",
        lessons: [
          {
            srNo: "1",
            name: "",
            subLessons: [
              {
                srNo: "1.1",
                name: "",
                description: "",
                file: null,
                additionalFiles: [],
                links: [],
              },
            ],
            description: "",
            file: null,
            additionalFiles: [],
            links: [],
          },
        ],
      });
    } else {
      alert("You can add a maximum of 3 languages.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-[#FFF] p-8 rounded-[20px] shadow-md">
      <div className="space-y-4">
        <div className="h-10 flex justify-between items-center">
          <h2 className="text-lg font-medium">Name of the Course</h2>
          <button
            type="button"
            onClick={handleAddLanguage}
            className="text-white text-sm font-normal px-5 py-3 bg-[#f96815] rounded-[28px] justify-center items-center gap-2.5 inline-flex"
          >
            Add New Language
          </button>
        </div>

        {languageFields.map((languageField, languageIndex) => (
          <div key={languageField.id} className="bg-[#fef7f3] p-6 rounded-xl shadow-md mb-6">
            <div className="flex items-center gap-2 mb-4">
              <select
                {...register(`languages.${languageIndex}.language`)}
                onChange={(e) => handleLanguageSelect(e.target.value)}
                className="w-full p-3 border rounded-lg"
              >
                <option value="" disabled>
                  Select Language
                </option>
                {["eng", "kaz", "rus"].map((lang) => (
                  <option key={lang} value={lang} disabled={selectedLanguages.includes(lang)}>
                    {lang.toUpperCase()}
                  </option>
                ))}
              </select>
              {languageIndex > 0 && (
                <button
                  type="button"
                  onClick={() => removeLanguage(languageIndex)}
                  className="bg-red-500 text-white px-4 py-2 rounded"
                >
                  Remove
                </button>
              )}
            </div>

            <LessonFieldArray nestIndex={languageIndex} control={control} register={register} watch={watch} />
          </div>
        ))}

        <div className="flex justify-end gap-4 mt-6">
          <button type="button" className="px-6 py-2 border rounded-full">
            Cancel
          </button>
          <button type="submit" className="bg-orange text-white px-5 py-2 rounded-[28px]">
            Save Lesson
          </button>
        </div>
      </div>
    </form>
  );
};

const LessonFieldArray = ({ nestIndex, control, register, watch }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `languages.${nestIndex}.lessons`,
  });

  const handleAddLesson = () => {
    const currentLessons = watch(`languages.${nestIndex}.lessons`);
    const nextSrNo = currentLessons.length + 1;
    append({
      srNo: nextSrNo.toString(),
      name: "",
      subLessons: [
        {
          srNo: `${nextSrNo}.1`,
          name: "",
          description: "",
          file: null,
          additionalFiles: [],
          links: [],
        },
      ],
      description: "",
      file: null,
      additionalFiles: [],
      links: [],
    });
  };

  return (
    <div className="space-y-4">
      {fields.map((field, index) => (
        <div key={field.id} className="space-y-4 border-b pb-4 bg-white p-6 rounded-xl mb-6">
          <div className="flex items-center gap-2 justify-between">
            <span className="font-medium">Lesson {index + 1}</span>
            <button
              type="button"
              onClick={() => remove(index)}
              className="bg-red-500 text-white px-3 py-1 rounded text-sm bg-red-500 text-white px-5 py-2 rounded-[28px] flex items-center gap-2"
            >
              <DeleteIcon stroke="#FFF" />
            </button>
          </div>

          <div className="flex gap-4">
            <input
              {...register(`languages.${nestIndex}.lessons.${index}.srNo`)}
              placeholder="Sr.No"
              className="w-[80px] p-2 bg-gray-50 rounded border-none"
              value={index + 1}
              disabled
            />
            <input
              {...register(`languages.${nestIndex}.lessons.${index}.name`)}
              placeholder="Name of lesson"
              className="w-full p-2 bg-gray-50 rounded border-none"
            />
          </div>

          <SubLessonFieldArray control={control} register={register} nestIndex={nestIndex} lessonIndex={index} />
        </div>
      ))}

      <button type="button" onClick={handleAddLesson} className="bg-blue-500 text-white px-6 py-2 rounded-full w-auto">
        Add More Video Lessons
      </button>
    </div>
  );
};

const SubLessonFieldArray = ({ control, register, nestIndex, lessonIndex }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `languages.${nestIndex}.lessons.${lessonIndex}.subLessons`,
  });

  const handleAddSubLesson = () => {
    append({
      srNo: `${lessonIndex + 1}.${fields.length + 1}`,
      name: "",
      description: "",
      file: null,
      additionalFiles: [],
      links: [],
    });
  };

  return (
    <div className="ml-8 space-y-4 mt-4 border-[#EEE]">
      {fields.map((subField, subIndex) => (
        <div key={subField.id} className="rounded-[10px] border-2 border-[#EEE] p-4 space-y-3 w-full">
          <div className="flex gap-4">
            
            <input
              {...register(`languages.${nestIndex}.lessons.${lessonIndex}.subLessons.${subIndex}.srNo`)}
              value={`${lessonIndex + 1}.${subIndex + 1}`}
              className="w-[80px] p-2 bg-gray-50 rounded border-none"
              disabled
            />

            <input
              {...register(`languages.${nestIndex}.lessons.${lessonIndex}.subLessons.${subIndex}.name`)}
              placeholder="Sub-lesson name"
              className="flex-grow p-2 border rounded w-[100px]"
            />
          <CustomFileUpload register={register} langIndex={nestIndex} />

            <button
              type="button"
              onClick={() => remove(subIndex)}
              className=" text-sm border-[#989898] border-[1px] text-white px-2 py-2 rounded-[28px]"
            >
              <CrossIcon />
            </button>
          </div>

          <textarea
            {...register(`languages.${nestIndex}.lessons.${lessonIndex}.subLessons.${subIndex}.description`)}
            placeholder="Description"
            className="w-full p-2 border rounded"
            rows={3}
          />

          <div className="mt-4">
            <div className="flex gap-4 mb-2">
              <label className="font-medium">Additional Files</label>
              <input
                type="file"
                {...register(`languages.${nestIndex}.lessons.${lessonIndex}.subLessons.${subIndex}.additionalFiles[]`)}
                className="p-2 border rounded"
                multiple
              />
            </div>

            <div className="flex gap-4">
              <label className="font-medium">Links</label>
              <input
                type="url"
                {...register(`languages.${nestIndex}.lessons.${lessonIndex}.subLessons.${subIndex}.links[]`)}
                placeholder="Add a link"
                className="p-2 border rounded w-full"
              />
            </div>
          </div>

          {/* Custom File Upload */}
        </div>
      ))}

      <button type="button" onClick={handleAddSubLesson} className="mt-2 text-blue-500 flex items-center gap-1">
        + Add Sub-Lesson
      </button>
    </div>
  );
};

const CustomFileUpload = ({ register, langIndex }) => {
  const [fileName, setFileName] = useState("");

  return (
    <div className="mb-4">
      {/* <label className="block mb-1 text-sm font-medium">Select File</label> */}
      <div className="relative border rounded-lg p-3 flex items-center bg-white cursor-pointer">
        <input
          type="file"
          {...register(`languages.${langIndex}.file`)}
          className="absolute inset-0 opacity-0 cursor-pointer h-11"
          onChange={(e) => {
            const selectedFile = e.target.files?.[0]?.name || "Select File";
            setFileName(selectedFile);
          }}
        />
        <span className="text-gray-500 flex-1">{fileName || "Select File"}</span>
        <span className="text-gray-400">
          <FileIcon />
        </span>
      </div>
    </div>
  );
};

export default CourseForm;
