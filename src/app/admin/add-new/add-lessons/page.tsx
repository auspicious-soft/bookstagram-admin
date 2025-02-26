"use client";
import React, { useState, useEffect, useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { DeleteIcon, CrossIcon, FileIcon, DustbinIcon, AddIcon } from "@/utils/svgicons";
import { generateSignedUrlCoursesFiles,generateSignedUrlCourseAdditionalFiles } from "@/actions";
import { toast } from 'sonner';
import { addNewCourse } from "@/services/admin-services";

// Yup validation schema
const schema = yup.object().shape({
  languages: yup.array().of(
    yup.object().shape({
      language: yup.string().required("Language is required"),
      lessons: yup.array().of(
        yup.object().shape({
          srNo: yup.string(),
          name: yup.string().required("Lesson name is required"),
          subLessons: yup.array().of(
            yup.object().shape({
              srNo: yup.string(),
              name: yup.string().required("Sub-lesson name is required"),
              description: yup.string().required("Sub-lesson description is required"),
              file: yup.mixed().required("file is required"),
              additionalFiles: yup.array().of(
                yup.object().shape({
                  file: yup.mixed().nullable(),
                  name: yup.string(),
                })
              ),
              links: yup.array().of(
                yup.object().shape({
                  url: yup.string().nullable(),
                  name: yup.string(),
                })
              ),
            })
          ),
        })
      ),
    })
  ),
});

const CourseForm = () => {
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
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
                  additionalFiles: [{ file: null, name: "" }],
                  links: [{ url: "", name: "" }],
                },
              ],
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
  const [formData, setFormData] = useState(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const data = sessionStorage.getItem("courseData");
    if (data) {
      setFormData(JSON.parse(data));
    }
  }, []);

const onSubmit = async (data) => {
  startTransition(async () => {
    try {
    // Transform the languages array into the desired lessons format
    let transformedLessons = [];
    
    // Process each language
    for (const language of data.languages) {
      // Transform lessons for current language
      const languageLessons = language.lessons.map((lesson, lessonIndex) => ({
        name: lesson.name,
        lang: language.language,
        srNo: lessonIndex + 1,
        subLessons: lesson?.subLessons?.map((subLesson, subIndex) => {
          // Build the base subLesson object
          const transformedSubLesson = {
            name: subLesson.name,
            description: subLesson.description,
            srNo: subIndex + 1,
            file: null, // Will be updated after file upload
            additionalFiles: subLesson.additionalFiles
              .filter(af => af.file || af.name) // Filter out empty entries
              .map(af => ({
                file: null, // Will be updated after file upload
                name: af.name
              })),
            links: subLesson.links
              .filter(link => link.url || link.name) // Filter out empty entries
              .map(link => ({
                url: link.url,
                name: link.name
              }))
          };

          return transformedSubLesson;
        })
      }));

      transformedLessons = [...transformedLessons, ...languageLessons];
    }

    // Process file uploads
    for (const lesson of transformedLessons) {
      const languageData = data.languages.find(lang => lang.language === lesson.lang);
      if (!languageData) continue;

      for (const subLesson of lesson.subLessons) {
        // Find corresponding original data
        const originalLesson = languageData.lessons.find(l => l.name === lesson.name);
        const originalSubLesson = originalLesson?.subLessons.find(
          sl => sl.name === subLesson.name
        );

        if (!originalSubLesson) continue;

        // Process main file
        if (originalSubLesson.file?.[0]) {
          const file = originalSubLesson.file[0];
          const { signedUrl, key } = await generateSignedUrlCoursesFiles(
            file.name,
            file.type,
            subLesson.name,
            lesson.lang
          );
          await fetch(signedUrl, {
            method: "PUT",
            body: file,
            headers: { "Content-Type": file.type },
          });
          subLesson.file = key;
        }

        // Process additional files
        if (originalSubLesson.additionalFiles?.length > 0) {
          for (let i = 0; i < originalSubLesson.additionalFiles.length; i++) {
            const additionalFileObj = originalSubLesson.additionalFiles[i];
            if (additionalFileObj.file?.[0]) {
              const file = additionalFileObj.file[0];
              const { signedUrl, key } = await generateSignedUrlCourseAdditionalFiles(
                file.name,
                file.type,
                subLesson.name,
                lesson.lang
              );
              await fetch(signedUrl, {
                method: "PUT",
                body: file,
                headers: { "Content-Type": file.type },
              });
              // Update the corresponding transformed additional file
              if (subLesson.additionalFiles[i]) {
                subLesson.additionalFiles[i].file = key;
              }
            }
          }
        }
      }
    }

    // Prepare final payload
    const finalPayload = {
      bookDetails: formData,
      lessons: transformedLessons
    };
    
    // Submit the data
    const response = await addNewCourse("/admin/course-lessons", finalPayload);
    
    if (response?.status === 201) {
      toast.success("Book added successfully");
      sessionStorage.setItem("courseData", "");
      window.location.href = "/admin/book-hub";
    } else {
      toast.error("Failed to add Book");
    }
  } catch (error) {
    console.error("Error submitting form: ", error);
    toast.error("An error occurred while submitting the form");
  }
})
}

  const handleLanguageSelect = (language) => {
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
                additionalFiles: [{ file: null, name: "" }],
                links: [{ url: "", name: "" }],
              },
            ],
          },
        ],
      });
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
              <select required {...register(`languages.${languageIndex}.language`)} onChange={(e) => handleLanguageSelect(e.target.value)} className="w-full p-3 border rounded-lg">
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
            {/* {errors.languages?.[languageIndex]?.language && <p className="text-red-500">{errors.languages[languageIndex].language.message}</p>} */}
            <LessonFieldArray nestIndex={languageIndex} control={control} register={register} watch={watch} setValue={setValue} errors={errors} />
          </div>
        ))}

        <div className="flex justify-end gap-4 mt-6">
          <button type="button" className="px-6 py-2 border rounded-full" onClick={() => { window.location.href = "/admin/book-hub" }}>
            Cancel
          </button>
          <button type="submit"  disabled={isPending} className="bg-orange text-white px-5 py-2 rounded-[28px]">
             {isPending ? 'Saving...' : 'Save Lesson'}
          </button>
         
        </div>
      </div>
    </form>
  );
};

const LessonFieldArray = ({ nestIndex, control, register, watch, setValue, errors }) => {
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
          additionalFiles: [{ file: null, name: "" }],
          links: [{ url: "", name: "" }],
        },
      ],
    });
  };

  return (
    <div className="space-y-4">
      {fields.map((field, index) => (
        <div key={field.id} className="space-y-4 border-b pb-4 bg-white p-6 rounded-xl mb-6">
          <div className="flex w-full gap-[20px]">
            <div className="flex flex-col gap-[5px]">
              <span className="text-[#060606] text-sm font-normal">Lesson No.</span>
              <input
                {...register(`languages.${nestIndex}.lessons.${index}.srNo`)}
                placeholder="Sr.No"
                className="w-[100px] px-[14px] py-[15px] rounded-[10px] bg-[#f5f5f5] text-[#6e6e6e] border-none"
                value={index + 1}
                disabled
              />
            </div>
            <div className="flex flex-col w-[90%] gap-[5px]">
              <span className="text-[#060606] text-sm font-normal">Name of lesson</span>
              <input
                {...register(`languages.${nestIndex}.lessons.${index}.name`)}
                placeholder="Enter Name of the course"
                className="w-full px-[14px] py-[15px] rounded-[10px] bg-[#f5f5f5] border-none"
                required
              />
              {errors.languages?.[nestIndex]?.lessons?.[index]?.name && <p className="text-red-500">{errors.languages[nestIndex].lessons[index].name.message}</p>}
            </div>
            <div className="flex items-end">
              <button type="button" onClick={() => remove(index)} className="text-sm text-white rounded-[28px] flex items-center gap-2">
                <DustbinIcon />
              </button>
            </div>
          </div>

          <SubLessonFieldArray control={control} register={register} nestIndex={nestIndex} lessonIndex={index} watch={watch} setValue={setValue} errors={errors} />
          {/* <div className="mt-4">
            <span className="text-[#060606] text-sm font-normal">
              Lesson Description
            </span>
            <textarea
              {...register(`languages.${nestIndex}.lessons.${index}.description`)}
              placeholder="Lesson description"
              className="w-full px-[14px] py-3.5 text-[#6e6e6e] text-sm font-normal rounded-[10px] border border-[#eaeaea]"
              rows={3}
            />
            {errors.languages?.[nestIndex]?.lessons?.[index]?.description && (
              <p className="text-red-500">
                {
                  errors.languages[nestIndex].lessons[index].description
                    .message
                }
              </p>
            )}
          </div> */}
        </div>
      ))}

      <button type="button" onClick={handleAddLesson} className="h-11 px-5 py-3 bg-[#157ff9] rounded-[28px] text-white text-sm font-normal w-auto">
        + Add New Lesson
      </button>
    </div>
  );
};

const SubLessonFieldArray = ({ control, register, nestIndex, lessonIndex, watch, setValue, errors }) => {
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
      additionalFiles: [{ file: null, name: "" }],
      links: [{ url: "", name: "" }],
    });
  };

  const handleAddAdditionalFile = (subIndex) => {
    const currentFiles = watch(`languages.${nestIndex}.lessons.${lessonIndex}.subLessons.${subIndex}.additionalFiles`) || [];
    setValue(`languages.${nestIndex}.lessons.${lessonIndex}.subLessons.${subIndex}.additionalFiles`, [...currentFiles, { file: null, name: "" }]);
  };

  const handleAddLink = (subIndex) => {
    const currentLinks = watch(`languages.${nestIndex}.lessons.${lessonIndex}.subLessons.${subIndex}.links`) || [];
    setValue(`languages.${nestIndex}.lessons.${lessonIndex}.subLessons.${subIndex}.links`, [...currentLinks, { url: "", name: "" }]);
  };

  return (
    <div className="space-y-4 mt-4 border-[#EEE]">
      {fields.map((subField, subIndex) => (
        <div key={subField.id} className="rounded-[10px] border-2 border-[#EEE] p-4 space-y-3 w-full mb-5">
          <div className="h-11 flex gap-[10px] w-full">
            <input
              {...register(`languages.${nestIndex}.lessons.${lessonIndex}.subLessons.${subIndex}.srNo`)}
              value={`${lessonIndex + 1}.${subIndex + 1}`}
              className="w-[50px] py-[14px] px-[15px] text-[#6e6e6e] text-sm font-normal rounded-[10px] border border-[#eaeaea]"
              disabled
            />
            <div className="w-[50%] ">
              <input
                {...register(`languages.${nestIndex}.lessons.${lessonIndex}.subLessons.${subIndex}.name`)}
                placeholder="Sub-lesson name"
                className="text-[#6e6e6e] w-full  h-[46px] px-[15px] py-[14px] text-sm font-normal rounded-[10px] border border-[#eaeaea]"
                required
              />
             
            </div>
            <div className="flex flex-col w-[50%]">
              <div className="w-full">
                <CustomFileUpload isRequired="true" width="full" register={register} langIndex={`languages.${nestIndex}.lessons.${lessonIndex}.subLessons.${subIndex}.file`} aditionalFile={false} />
              </div>
              
            </div>
            <div className="flex items-center">
              <button type="button" onClick={() => remove(subIndex)} className="text-sm border-[#989898] border-[1px] text-white px-2 py-2 rounded-[28px]">
                <CrossIcon />
              </button>
            </div>
          </div>

          <div className="pl-[60px] pr-[34px]">
            <textarea
              {...register(`languages.${nestIndex}.lessons.${lessonIndex}.subLessons.${subIndex}.description`)}
              placeholder="Description"
              className="w-full px-[15px] py-3.5 text-[#6e6e6e] text-sm font-normal rounded-[10px] border border-[#eaeaea]"
              rows={3}
              required
            />
          

            <div className="mt-4">
              <div className="flex flex-col gap-[5px] ">
                <label className="text-[#060606] text-sm font-normal">Additional Files</label>
                {watch(`languages.${nestIndex}.lessons.${lessonIndex}.subLessons.${subIndex}.additionalFiles`)?.map((_, fileIndex) => (
                  <div key={fileIndex} className={`flex gap-[10px] ${fileIndex !== 0 ? "pr-[55px]" : ""}`}>
                    <CustomFileUpload
                      register={register}
                      langIndex={`languages.${nestIndex}.lessons.${lessonIndex}.subLessons.${subIndex}.additionalFiles.${fileIndex}.file`}
                      aditionalFile={true}
                      width="50%"
                      isRequired="false"
                    />
                    <input
                      {...register(`languages.${nestIndex}.lessons.${lessonIndex}.subLessons.${subIndex}.additionalFiles.${fileIndex}.name`)}
                      placeholder="Name of file"
                      className="text-[#6e6e6e] w-[100%] px-[15px] py-[14px] text-sm font-normal rounded-[10px] border border-[#eaeaea] h-[48px]"
                    />
                    {fileIndex === 0 && (
                      <button type="button" onClick={() => handleAddAdditionalFile(subIndex)} className="flex items-top">
                        <AddIcon />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-[5px]">
                <label className="text-[#060606] text-sm font-normal">Links</label>
                {watch(`languages.${nestIndex}.lessons.${lessonIndex}.subLessons.${subIndex}.links`)?.map((_, linkIndex) => (
                  <div key={linkIndex} className={`flex gap-[10px] w-full ${linkIndex !== 0 ? "pr-[55px]" : ""}`}>
                    <input
                      // type="url"
                      {...register(`languages.${nestIndex}.lessons.${lessonIndex}.subLessons.${subIndex}.links.${linkIndex}.url`)}
                      placeholder="Link"
                      className="text-[#6e6e6e] w-[50%] h-[46px] px-[15px] py-[14px] text-sm font-normal rounded-[10px] border border-[#eaeaea]"
                    />
                    <input
                      {...register(`languages.${nestIndex}.lessons.${lessonIndex}.subLessons.${subIndex}.links.${linkIndex}.name`)}
                      placeholder="Name of Link"
                      className="text-[#6e6e6e] w-[50%] h-[46px] px-[15px] py-[14px] text-sm font-normal rounded-[10px] border border-[#eaeaea]"
                    />
                    {linkIndex === 0 && (
                      <button type="button" onClick={() => handleAddLink(subIndex)} className="flex items-center">
                        <AddIcon />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}

      <button type="button" onClick={handleAddSubLesson} className="px-5 py-3 rounded-[28px] border border-[#157ff9] mt-2 flex items-center gap-1 text-[#157ff9] text-sm font-normal">
        Add More Video Lessons
      </button>
    </div>
  );
};

const CustomFileUpload = ({ register, langIndex, aditionalFile, width, isRequired }) => {
  const [fileName, setFileName] = useState("");

  return (
    <div className={`mb-4 w-[${width}]`}>
      <div className="relative border rounded-lg p-3 flex items-center bg-white cursor-pointer">
        <input
          type="file"
          {...register(`${langIndex}`)}
          required={isRequired ==="true"?true :false}
          className="absolute inset-0 opacity-0 cursor-pointer h-11 text-[#6e6e6e]"
          onChange={(e) => {
            const selectedFile = e.target.files?.[0]?.name || "Select File";
            setFileName(selectedFile);
          }}
        />
        <span className="flex-1 text-[#6e6e6e] opacity-0.5 text-sm font-normal">{fileName ? fileName : aditionalFile === true ? "Additional files" : "Select File"}</span>
        <span className="text-gray-400">
          <FileIcon />
        </span>
      </div>
    </div>
  );
};

export default CourseForm;
