"use client";
import React, { useState, useEffect, useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { DeleteIcon, CrossIcon, FileIcon, DustbinIcon, AddIcon } from "@/utils/svgicons";
import { generateSignedUrlCoursesFiles, generateSignedUrlCourseAdditionalFiles } from "@/actions";
import { toast } from "sonner";
import { updateCourse, getSingleCourse } from "@/services/admin-services";
import useSWR from "swr";
import { useParams } from "next/navigation";
import { deleteSingleCourseLesson, deleteSingleCourseSubLesson, deleteSingleCourselanguage } from "@/services/admin-services";

// Yup validation schema
const schema = yup.object().shape({
  languages: yup.array().of(
    yup.object().shape({
      language: yup.string().required("Language is required"),
      lessons: yup.array().of(
        yup.object().shape({
          srNo: yup.string(),
          name: yup.string().required("Lesson name is required"),
          _id: yup.string(),
          subLessons: yup.array().of(
            yup.object().shape({
              srNo: yup.string(),
              name: yup.string().required("Sub-lesson name is required"),
              description: yup.string().required("Sub-lesson description is required"),
              file: yup.mixed().nullable(),
              existingFile: yup.string(),
              _id: yup.string(),
              additionalFiles: yup.array().of(
                yup.object().shape({
                  file: yup.mixed().nullable(),
                  name: yup.string(),
                  existingFile: yup.string(),
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
  const { id } = useParams();
  const productId = id;
  const [isPending, startTransition] = useTransition();
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [formData, setFormData] = useState(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const { data, isLoading } = useSWR(id ? `/admin/course-lessons/${id}` : null, getSingleCourse);
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
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
              _id: "",
              subLessons: [
                {
                  srNo: "1.1",
                  name: "",
                  description: "",
                  file: null,
                  existingFile: "",
                  _id: "",
                  additionalFiles: [
                    {
                      file: null,
                      name: "",
                      existingFile: "",
                    },
                  ],
                  links: [
                    {
                      url: "",
                      name: "",
                    },
                  ],
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
    replace: replaceLanguages,
  } = useFieldArray({
    control,
    name: "languages",
  });

  useEffect(() => {
    const courseData = sessionStorage.getItem("courseData");
    if (courseData) {
      setFormData(JSON.parse(courseData));
    }
  }, []);

  const mapDataToForm = (courseData) => {
    if (!courseData || !courseData.lessons || courseData.lessons.length === 0) return;

    const lessonsByLanguage = {};
    courseData.lessons.forEach((lesson) => {
      if (!lessonsByLanguage[lesson.lang]) {
        lessonsByLanguage[lesson.lang] = [];
      }
      lessonsByLanguage[lesson.lang].push(lesson);
    });

    const formLanguages = Object.keys(lessonsByLanguage).map((lang) => {
      const langLessons = lessonsByLanguage[lang].sort((a, b) => a.srNo - b.srNo);

      return {
        language: lang,
        lessons: langLessons.map((lesson) => {
          const formattedSubLessons = lesson.subLessons.map((subLesson) => {
            const additionalFiles =
              subLesson.additionalFiles?.length > 0
                ? subLesson.additionalFiles.map((af) => ({
                    file: null,
                    name: af.name || "",
                    existingFile: af.file || "",
                  }))
                : [
                    {
                      file: null,
                      name: "",
                      existingFile: "",
                    },
                  ];

            const links =
              subLesson.links?.length > 0
                ? subLesson.links.map((link) => ({
                    url: link.url || "",
                    name: link.name || "",
                  }))
                : [
                    {
                      url: "",
                      name: "",
                    },
                  ];

            return {
              srNo: `${lesson.srNo}.${subLesson.srNo}`,
              name: subLesson.name || "",
              description: subLesson.description || "",
              file: null,
              existingFile: subLesson.file || "",
              _id: subLesson._id || "",
              additionalFiles,
              links,
            };
          });

          return {
            srNo: lesson.srNo.toString(),
            name: lesson.name,
            _id: lesson._id || "",
            subLessons:
              formattedSubLessons.length > 0
                ? formattedSubLessons
                : [
                    {
                      srNo: `${lesson.srNo}.1`,
                      name: "",
                      description: "",
                      file: null,
                      existingFile: "",
                      additionalFiles: [
                        {
                          file: null,
                          name: "",
                          existingFile: "",
                        },
                      ],
                      links: [
                        {
                          url: "",
                          name: "",
                        },
                      ],
                    },
                  ],
          };
        }),
      };
    });

    const langs = Object.keys(lessonsByLanguage);
    setSelectedLanguages(langs);
    replaceLanguages(formLanguages);
  };

  useEffect(() => {
    if (data?.data?.data && !isDataLoaded) {
      mapDataToForm(data.data.data);
      setIsDataLoaded(true);
    }
  }, [data, isDataLoaded, productId]);

  const onSubmit = async (data) => {
    startTransition(async () => {
      try {
        let transformedLessons = [];

        for (const language of data.languages) {
          const languageLessons = language.lessons.map((lesson, lessonIndex) => {
            const lessonObj = {
              name: lesson.name,
              lang: language.language,
              srNo: lessonIndex + 1,
              productId: productId,
              _id: lesson._id || null,
              subLessons: [],
            };

            if (lesson._id) {
              lessonObj._id = lesson._id;
            }

            lessonObj.subLessons = lesson?.subLessons?.map((subLesson, subIndex) => {
              const transformedSubLesson = {
                name: subLesson.name,
                srNo: subIndex + 1,
                description: subLesson.description,
                file: subLesson.existingFile || null,
                additionalFiles: subLesson.additionalFiles
                  .filter((af) => af.file || af.name || af.existingFile)
                  .map((af) => ({
                    file: af.existingFile || null,
                    name: af.name,
                  })),
                links: subLesson.links
                  .filter((link) => link.url || link.name)
                  .map((link) => ({
                    url: link.url,
                    name: link.name,
                  })),
              };

              if (subLesson._id && subLesson._id !== "") {
                (transformedSubLesson as any)._id = subLesson._id;
              }

              return transformedSubLesson;
            });

            return lessonObj;
          });

          transformedLessons = [...transformedLessons, ...languageLessons];
        }

        for (const lesson of transformedLessons) {
          const languageData = data.languages.find((lang) => lang.language === lesson.lang);
          if (!languageData) continue;

          for (const subLesson of lesson.subLessons) {
            const originalLesson = languageData.lessons.find((l) => l.name === lesson.name);
            const originalSubLesson = originalLesson?.subLessons.find((sl) => sl.name === subLesson.name);

            if (!originalSubLesson) continue;

            if (originalSubLesson.file?.[0] && !originalSubLesson.existingFile) {
              const file = originalSubLesson.file[0];
              const { signedUrl, key } = await generateSignedUrlCoursesFiles(file.name, file.type, subLesson.name, lesson.lang);
              await fetch(signedUrl, {
                method: "PUT",
                body: file,
                headers: {
                  "Content-Type": file.type,
                },
              });
              subLesson.file = key;
            } else if (originalSubLesson.existingFile) {
              subLesson.file = originalSubLesson.existingFile;
            }

            if (originalSubLesson.additionalFiles?.length > 0) {
              for (let i = 0; i < originalSubLesson.additionalFiles.length; i++) {
                const additionalFileObj = originalSubLesson.additionalFiles[i];
                if (additionalFileObj.file?.[0] && !additionalFileObj.existingFile) {
                  const file = additionalFileObj.file[0];
                  const { signedUrl, key } = await generateSignedUrlCourseAdditionalFiles(file.name, file.type, subLesson.name, lesson.lang);
                  await fetch(signedUrl, {
                    method: "PUT",
                    body: file,
                    headers: {
                      "Content-Type": file.type,
                    },
                  });
                  subLesson.additionalFiles[i].file = key;
                } else if (additionalFileObj.existingFile) {
                  subLesson.additionalFiles[i].file = additionalFileObj.existingFile;
                }
              }
            }
          }
        }

        const response = await updateCourse("/admin/course-lessons", transformedLessons);

        if (response?.status === 200) {
          toast.success("Book added successfully");
          sessionStorage.removeItem("courseData");
          window.location.href = "/admin/book-hub";
        } else {
          toast.error("Failed to add Book");
        }
      } catch (error) {
        console.error("Error submitting form: ", error);
        toast.error("An error occurred while submitting the form");
      }
    });
  };

  const handleLanguageSelect = (language, index) => {
    const currentLanguages = watch("languages").map((l, i) => (i === index ? language : l.language));
    setSelectedLanguages(currentLanguages.filter(Boolean));
  };

  const handleRemoveLanguage = async (index) => {
    const languageToRemove = watch(`languages.${index}.language`);
    const lessonsToRemove = watch(`languages.${index}.lessons`) || [];

    // Check if there are any mapped lessons (with _id)
    const hasMappedLessons = lessonsToRemove.some((lesson) => lesson._id && lesson._id !== "");
    if (hasMappedLessons && languageToRemove && productId) {
      try {
        const response = await deleteSingleCourselanguage(`admin/course-lessons/${productId}/language?lang=${languageToRemove}`);
        console.log('response: ', response);
        if (response?.status === 200) {
          toast.success(`Lessons for language ${languageToRemove.toUpperCase()} removed successfully`);
        } else {
          throw new Error("Failed to delete language lessons");
        }
      } catch (error) {
        console.error("Error deleting language lessons:", error);
        toast.error("Failed to remove lessons for this language");
        return; // Stop removal if API call fails
      }
    }

    // Remove the language from the form
    removeLanguage(index);
    const updatedLanguages = watch("languages").map((l) => l.language).filter(Boolean);
    setSelectedLanguages(updatedLanguages);
  };

  const handleAddLanguage = () => {
    if (languageFields.length < 3) {
      appendLanguage({
        language: "",
        lessons: [
          {
            srNo: "1",
            name: "",
            _id: "",
            subLessons: [
              {
                srNo: "1.1",
                name: "",
                description: "",
                file: null,
                existingFile: "",
                _id: "",
                additionalFiles: [
                  {
                    file: null,
                    name: "",
                    existingFile: "",
                  },
                ],
                links: [
                  {
                    url: "",
                    name: "",
                  },
                ],
              },
            ],
          },
        ],
      });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center p-8">Loading course data...</div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-[#FFF] p-8 rounded-[20px] shadow-md">
      <div className="space-y-4">
        <div className="h-10 flex justify-between items-center">
          <h2 className="text-lg font-medium">{formData?.name?.eng || formData?.name?.kaz || formData?.name?.rus || ""}</h2>
          <button type="button" onClick={handleAddLanguage} className="text-white text-sm font-normal px-5 py-3 bg-[#f96815] rounded-[28px] justify-center items-center gap-2.5 inline-flex">
            Add New Language
          </button>
        </div>

        {languageFields.map((languageField, languageIndex) => {
          const currentLanguage = watch(`languages.${languageIndex}.language`);
          const otherSelectedLanguages = selectedLanguages.filter((lang, idx) => idx !== languageIndex && lang);

          return (
            <div key={languageField.id} className="bg-[#fef7f3] p-6 rounded-xl shadow-md mb-6">
              <div className="flex items-center gap-2 mb-4">
                <select
                  required
                  {...register(`languages.${languageIndex}.language`)}
                  onChange={(e) => handleLanguageSelect(e.target.value, languageIndex)}
                  className="w-full p-3 border rounded-lg text-[#6e6e6e] text-sm font-normal "
                >
                  <option value="" disabled>
                    Select Language
                  </option>
                  {["eng", "kaz", "rus"]
                    .filter((lang) => !otherSelectedLanguages.includes(lang) || lang === currentLanguage)
                    .map((lang) => (
                      <option key={lang} value={lang}>
                        {lang.toUpperCase()}
                      </option>
                    ))}
                </select>
                {languageFields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveLanguage(languageIndex)}
                    className="text-white text-sm font-normal h-11 px-5 py-3 bg-[#f91515] rounded-[28px] justify-center items-center gap-2.5 inline-flex"
                  >
                    <DeleteIcon stroke="#FFF" /> Remove
                  </button>
                )}
              </div>
              {errors.languages?.[languageIndex]?.language && (
                <p className="text-red-500">{errors.languages[languageIndex].language.message}</p>
              )}
              <LessonFieldArray nestIndex={languageIndex} control={control} register={register} watch={watch} setValue={setValue} errors={errors} />
            </div>
          );
        })}

        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            className="px-6 py-2 border rounded-full"
            onClick={() => {
              window.location.href = "/admin/book-hub";
            }}
          >
            Cancel
          </button>
          <button type="submit" disabled={isPending} className="bg-orange text-white px-5 py-2 rounded-[28px]">
            {isPending ? "Saving..." : "Save Lesson"}
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

  const handleDeleteLesson = async (id) => {
    if (id !== "") {
      const response = await deleteSingleCourseLesson(`admin/course-lessons/${id}`);
      console.log("response: ", response);
    }
  };

  const handleAddLesson = () => {
    const currentLessons = watch(`languages.${nestIndex}.lessons`);
    const nextSrNo = currentLessons.length + 1;
    append({
      srNo: nextSrNo.toString(),
      name: "",
      _id: "",
      subLessons: [
        {
          srNo: `${nextSrNo}.1`,
          name: "",
          description: "",
          file: null,
          existingFile: "",
          _id: "",
          additionalFiles: [
            {
              file: null,
              name: "",
              existingFile: "",
            },
          ],
          links: [
            {
              url: "",
              name: "",
            },
          ],
        },
      ],
    });
  };

  return (
    <div className="space-y-4">
      {fields.map((field, index) => {
        const lessonId = watch(`languages.${nestIndex}.lessons.${index}._id`);
        return (
          <div key={field.id} className="space-y-4 border-b pb-4 bg-white p-6 rounded-xl mb-6">
            <div className="flex w-full gap-[20px]">
              <div className="flex flex-col gap-[5px]">
                <span className="text-[#060606] text-sm font-normal">Lesson No.</span>
                <input
                  {...register(`languages.${nestIndex}.lessons.${index}.srNo`)}
                  placeholder="Sr.No"
                  className="w-[100px] px-[14px] py-[15px] rounded-[10px] bg-[#f5f5f5] text-[#6e6e6e] text-sm font-normal border-none"
                  value={index + 1}
                  disabled
                />
                <input type="hidden" {...register(`languages.${nestIndex}.lessons.${index}._id`)} />
              </div>
              <div className="flex flex-col w-[90%] gap-[5px]">
                <span className="text-[#060606] text-sm font-normal">Name of lesson</span>
                <input
                  {...register(`languages.${nestIndex}.lessons.${index}.name`)}
                  placeholder="Enter Name of the course"
                  className="w-full px-[14px] py-[15px] rounded-[10px] bg-[#f5f5f5] border-none text-[#6e6e6e] text-sm font-normal"
                  required
                />
                {errors.languages?.[nestIndex]?.lessons?.[index]?.name && (
                  <p className="text-red-500">{errors.languages[nestIndex].lessons[index].name.message}</p>
                )}
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => {
                    remove(index);
                    handleDeleteLesson(lessonId);
                  }}
                  className="text-sm text-white rounded-[28px] flex items-center gap-2"
                >
                  <DustbinIcon />
                </button>
              </div>
            </div>

            <SubLessonFieldArray
              control={control}
              register={register}
              nestIndex={nestIndex}
              lessonIndex={index}
              watch={watch}
              setValue={setValue}
              errors={errors}
            />
          </div>
        );
      })}

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

  const handleDeleteSubLesson = async ({ lessonId, subLessonId }) => {
    const response = await deleteSingleCourseSubLesson(`admin/course-lessons/${lessonId}/sub-lesson/${subLessonId}`);
    console.log("response: ", response);
  };

  const handleAddSubLesson = () => {
    append({
      srNo: `${lessonIndex + 1}.${fields.length + 1}`,
      name: "",
      description: "",
      file: null,
      existingFile: "",
      _id: "",
      additionalFiles: [
        {
          file: null,
          name: "",
          existingFile: "",
        },
      ],
      links: [
        {
          url: "",
          name: "",
        },
      ],
    });
  };

  const handleAddAdditionalFile = (subIndex) => {
    const currentFiles = watch(`languages.${nestIndex}.lessons.${lessonIndex}.subLessons.${subIndex}.additionalFiles`) || [];
    setValue(`languages.${nestIndex}.lessons.${lessonIndex}.subLessons.${subIndex}.additionalFiles`, [
      ...currentFiles,
      {
        file: null,
        name: "",
        existingFile: "",
      },
    ]);
  };

  const handleAddLink = (subIndex) => {
    const currentLinks = watch(`languages.${nestIndex}.lessons.${lessonIndex}.subLessons.${subIndex}.links`) || [];
    setValue(`languages.${nestIndex}.lessons.${lessonIndex}.subLessons.${subIndex}.links`, [
      ...currentLinks,
      {
        url: "",
        name: "",
      },
    ]);
  };

  return (
    <div className="space-y-4 mt-4 border-[#EEE]">
      {fields.map((subField, subIndex) => {
        const lessonId = watch(`languages.${nestIndex}.lessons.${lessonIndex}._id`);
        const subLessonId = watch(`languages.${nestIndex}.lessons.${lessonIndex}.subLessons.${subIndex}._id`);
        const existingFile = watch(`languages.${nestIndex}.lessons.${lessonIndex}.subLessons.${subIndex}.existingFile`);

        return (
          <div key={subField.id} className="rounded-[10px] border-2 border-[#EEE] p-4 space-y-3 w-full mb-5">
            <div className="h-11 flex gap-[10px] w-full">
              <input
                {...register(`languages.${nestIndex}.lessons.${lessonIndex}.subLessons.${subIndex}.srNo`)}
                value={`${lessonIndex + 1}.${subIndex + 1}`}
                className="w-[50px] py-[14px] px-[15px] text-[#6e6e6e] text-sm font-normal rounded-[10px] border border-[#eaeaea]"
                disabled
              />
              <input type="hidden" {...register(`languages.${nestIndex}.lessons.${lessonIndex}.subLessons.${subIndex}._id`)} />
              <div className="w-[50%]">
                <input
                  {...register(`languages.${nestIndex}.lessons.${lessonIndex}.subLessons.${subIndex}.name`)}
                  placeholder="Sub-lesson name"
                  className="text-[#6e6e6e] text-sm font-normal w-full h-[46px] px-[15px] py-[14px]  rounded-[10px] border border-[#eaeaea]"
                  required
                />
              </div>
              <div className="flex flex-col w-[50%]">
                <div className="w-full">
                  <CustomFileUpload
                    isRequired={!existingFile ? "true" : "false"}
                    width="full"
                    register={register}
                    langIndex={`languages.${nestIndex}.lessons.${lessonIndex}.subLessons.${subIndex}.file`}
                    aditionalFile={false}
                    existingFile={existingFile}
                  />
                </div>
              </div>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => {
                    remove(subIndex);
                    handleDeleteSubLesson({ lessonId, subLessonId });
                  }}
                  className="text-sm border-[#989898] border-[1px] text-white px-2 py-2 rounded-[28px]"
                >
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
                <div className="flex flex-col gap-[5px]">
                  <label className="text-[#060606] text-sm font-normal">Additional Files</label>
                  {watch(`languages.${nestIndex}.lessons.${lessonIndex}.subLessons.${subIndex}.additionalFiles`)?.map((additionalFile, fileIndex) => {
                    const existingAdditionalFile = watch(`languages.${nestIndex}.lessons.${lessonIndex}.subLessons.${subIndex}.additionalFiles.${fileIndex}.existingFile`);

                    return (
                      <div key={fileIndex} className={`flex gap-[10px] ${fileIndex !== 0 ? "pr-[55px]" : ""}`}>
                        <div className="w-[50%]">
                          <CustomFileUpload
                            register={register}
                            langIndex={`languages.${nestIndex}.lessons.${lessonIndex}.subLessons.${subIndex}.additionalFiles.${fileIndex}.file`}
                            aditionalFile={true}
                            width="100%"
                            isRequired="false"
                            existingFile={existingAdditionalFile}
                          />
                        </div>
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
                    );
                  })}
                </div>

                <div className="flex flex-col gap-[5px]">
                  <label className="text-[#060606] text-sm font-normal">Links</label>
                  {watch(`languages.${nestIndex}.lessons.${lessonIndex}.subLessons.${subIndex}.links`)?.map((_, linkIndex) => (
                    <div key={linkIndex} className={`flex gap-[10px] w-full ${linkIndex !== 0 ? "pr-[55px]" : ""}`}>
                      <input
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
        );
      })}

      <button type="button" onClick={handleAddSubLesson} className="px-5 py-3 rounded-[28px] border border-[#157ff9] mt-2 flex items-center gap-1 text-[#157ff9] text-sm font-normal">
        Add More Video Lessons
      </button>
    </div>
  );
};

const CustomFileUpload = ({ register, langIndex, aditionalFile, width, isRequired, existingFile }) => {
  const [fileName, setFileName] = useState(existingFile ? existingFile.split("/").pop() : "");

  return (
    <div className={`mb-4 w-[${width}]`}>
      <div className="relative border rounded-lg p-3 flex items-center bg-white cursor-pointer">
        <input
          type="file"
          {...register(`${langIndex}`)}
          className="absolute inset-0 opacity-0 cursor-pointer h-11  text-[#6e6e6e] text-sm font-normal"
          onChange={(e) => {
            const selectedFile = e.target.files?.[0]?.name || (existingFile ? existingFile.split("/").pop() : "Select File");
            setFileName(selectedFile);
          }}
        />
        <span className="flex-1 text-[#6e6e6e] opacity-0.5  text-sm font-normal">
          {fileName || (aditionalFile ? "Additional files" : "Select File")}
        </span>
        <span className="text-[#060606]">
          <FileIcon />
        </span>
      </div>
    </div>
  );
};

export default CourseForm;