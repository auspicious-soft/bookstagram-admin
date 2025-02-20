
"use client";
import React, { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { DeleteIcon, CrossIcon, FileIcon, DustbinIcon,AddIcon } from "@/utils/svgicons";

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
          <button type="button" onClick={handleAddLanguage} className="text-white text-sm font-normal px-5 py-3 bg-[#f96815] rounded-[28px] justify-center items-center gap-2.5 inline-flex">
            Add New Language
          </button>
        </div>

        {languageFields.map((languageField, languageIndex) => (
          <div key={languageField.id} className="bg-[#fef7f3] p-6 rounded-xl shadow-md mb-6">
            <div className="flex items-center gap-2 mb-4">
              <select {...register(`languages.${languageIndex}.language`)} onChange={(e) => handleLanguageSelect(e.target.value)} className="w-full p-3 border rounded-lg">
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
                  className="text-white text-sm font-normal h-11 px-5 py-3 bg-[#f91515] rounded-[28px] justify-center items-center gap-2.5 inline-flex"
                >
                  <DeleteIcon stroke="#FFF" /> Remove
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
          {/* <div className="flex items-center gap-2 justify-between"> */}
          {/* <span className="font-medium">Lesson {index + 1}</span> */}

          {/* </div> */}

          <div className="flex w-full gap-[20px]">
            <div className="flex  flex-col  gap-[5px]">
              <span className="text-[#060606] text-sm font-normal">Lesson No.</span>
              <input
                {...register(`languages.${nestIndex}.lessons.${index}.srNo`)}
                placeholder="Sr.No"
                className="w-[100px] px-[14px] py-[15px] rounded-[10px] bg-[#f5f5f5] text-[#6e6e6e] border-none"
                value={index + 1}
                disabled
              />
            </div>
            <div className="flex  flex-col w-[90%] gap-[5px]">
              <span className="text-[#060606] text-sm font-normal">Name of lesson</span>
              <input
                {...register(`languages.${nestIndex}.lessons.${index}.name`)}
                placeholder="Enter Name of the course"
                className="w-full px-[14px] py-[15px] rounded-[10px] bg-[#f5f5f5]  border-none"
              />
            </div>
            <div className="flex items-end">
              <button type="button" onClick={() => remove(index)} className="  text-sm text-white rounded-[28px] flex items-center gap-2">
                <DustbinIcon />
              </button>
            </div>
          </div>

          <SubLessonFieldArray control={control} register={register} nestIndex={nestIndex} lessonIndex={index} />
        </div>
      ))}

      <button type="button" onClick={handleAddLesson} className="h-11 px-5 py-3 bg-[#157ff9] rounded-[28px] text-white  text-sm font-normal w-auto">
        + Add New Lesson
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
    <div className=" space-y-4 mt-4 border-[#EEE]">
      {fields.map((subField, subIndex) => (
        <div key={subField.id} className="rounded-[10px] border-2 border-[#EEE] p-4 space-y-3 w-full mb-1">
          <div className="h-11 flex gap-[10px] w-full">
            <input
              {...register(`languages.${nestIndex}.lessons.${lessonIndex}.subLessons.${subIndex}.srNo`)}
              value={`${lessonIndex + 1}.${subIndex + 1}`}
              className="w-[50px] py-[14px] px-[15px]  text-[#6e6e6e] text-sm font-normal rounded-[10px] border border-[#eaeaea] flex-col justify-center items-center  "
              disabled
            />

            <input
              {...register(`languages.${nestIndex}.lessons.${lessonIndex}.subLessons.${subIndex}.name`)}
              placeholder="Sub-lesson name"
              className="text-[#6e6e6e] w-[50%] h-[46px] px-[15px] py-[14px] text-sm font-normal rounded-[10px] border border-[#eaeaea]"
            />
            <CustomFileUpload aditionalFile={false} register={register} langIndex={`languages.${nestIndex}.lessons.${lessonIndex}.subLessons.${subIndex}.file`} />
            <div className="flex items-center">
              <button type="button" onClick={() => remove(subIndex)} className=" text-sm border-[#989898] border-[1px] text-white px-2 py-2 rounded-[28px]">
                <CrossIcon />
              </button>
            </div>
          </div>
          <div className="pl-[60px] pr-[34px]">
            <textarea
              {...register(`languages.${nestIndex}.lessons.${lessonIndex}.subLessons.${subIndex}.description`)}
              placeholder="Description"
              className="w-full  px-[15px] py-3.5 text-[#6e6e6e] text-sm font-normal rounded-[10px] border border-[#eaeaea]"
              rows={3}
            />

            <div className="mt-4 ">
              <div className="flex flex-col gap-4 mb-2">
                <label className="font-medium">Additional Files</label>
                <div className="flex gap-[10px]">
                  <CustomFileUpload aditionalFile={true} register={register} langIndex={`languages.${nestIndex}.lessons.${lessonIndex}.subLessons.${subIndex}.additionalFiles[]`} />
                  <input
                    {...register(`languages.${nestIndex}.lessons.${lessonIndex}.subLessons.${subIndex}.additionalFile.name`)}
                    placeholder="Sub-lesson name"
                    className="text-[#6e6e6e] w-[100%] px-[15px] py-[14px] text-sm font-normal rounded-[10px] border border-[#eaeaea] h-[48px]"
                  />
                  <AddIcon/>
                </div>
                {/* <input type="file" {...register(`languages.${nestIndex}.lessons.${lessonIndex}.subLessons.${subIndex}.additionalFiles[]`)} className="p-2 border rounded" multiple /> */}
              </div>

              <div className="flex flex-col gap-4">
                <label className="font-medium">Links</label>
                <div className="flex gap-[10px] w-full ">
                  <input
                    type="url"
                    {...register(`languages.${nestIndex}.lessons.${lessonIndex}.subLessons.${subIndex}.links[]`)}
                    placeholder="Link"
                    className="text-[#6e6e6e] w-[50%] h-[46px] px-[15px] py-[14px] text-sm font-normal rounded-[10px] border border-[#eaeaea]"
                  />
                  <input
                    {...register(`languages.${nestIndex}.lessons.${lessonIndex}.subLessons.${subIndex}.links[].name`)}
                    placeholder="Name of Link"
                    className=" text-[#6e6e6e] w-[50%] h-[46px] px-[15px] py-[14px] text-sm font-normal rounded-[10px] border border-[#eaeaea]"
                  />
                  <AddIcon/>
                </div>
              </div>
            </div>
          </div>
          {/* Custom File Upload */}
        </div>
      ))}

      <button type="button" onClick={handleAddSubLesson} className="px-5 py-3 rounded-[28px] border border-[#157ff9] mt-2  flex items-center gap-1 text-[#157ff9] text-sm font-normal">
      Add More Video Lessons
      </button>
    </div>
  );
};

const CustomFileUpload = ({ register, langIndex, aditionalFile }) => {
  const [fileName, setFileName] = useState("");

  return (
    <div className="mb-4 w-[50%]">
      {/* <label className="block mb-1 text-sm font-medium">Select File</label> */}
      <div className="relative border rounded-lg p-3 flex items-center bg-white cursor-pointer">
        <input
          type="file"
          {...register(`${langIndex}`)}
          className="absolute inset-0 opacity-0 cursor-pointer h-11 text-[#6e6e6e]"
          onChange={(e) => {
            const selectedFile = e.target.files?.[0]?.name || "Select File";
            setFileName(selectedFile);
          }}
        />
        <span className="flex-1 text-[#6e6e6e] opacity-0.5 text-sm font-normal">{fileName ? fileName : aditionalFile == true ? "Additional files" : "Select File"}</span>
        <span className="text-gray-400">
          <FileIcon />
        </span>
      </div>
    </div>
  );
};

export default CourseForm;
