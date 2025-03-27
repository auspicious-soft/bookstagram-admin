import React, { useState } from 'react';
import useSWR from 'swr';
import CourseCard from './CourseCard';
import { getImageClientS3URL } from '@/utils/get-image-ClientS3URL';
import { getAllBooks } from '@/services/admin-services';
import { Modal } from '@mui/material';
import { PlusIcon } from '@/utils/svgicons';

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  handleSubmit: () => void;
  isPending: any;
  selectedBooks: string[];  // Changed to string[] to match _id type
  onSelectBooks: (books: string[]) => void;
}

const AddToBookCommon = ({ open, onClose, title, handleSubmit, isPending, onSelectBooks, selectedBooks }: Props) => {
  const [searchParams, setSearchParams] = useState("");
  const { data, error, isLoading } = useSWR(`/admin/books?description=${searchParams}`, getAllBooks)
  const allBooks = data?.data?.data;

  const handleSelect = (id: string) => {
    onSelectBooks(
      selectedBooks.includes(id)
        ? selectedBooks.filter(bookId => bookId !== id)
        : [...selectedBooks, id]
    );
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams(event.target.value);
  };


  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="child-modal-title"
      className="grid place-items-center"
    >
      <div className="modal bg-white py-[30px] px-5 max-w-[950px] mx-auto rounded-[20px] w-full h-full relative">
        <div className="max-h-[80vh] flex flex-col">
          <h2 className="text-[32px] text-darkBlack mb-5">{title}</h2>
          <div className="main-form">
            <label className="w-full">Search
              <input type="search" name="" value={searchParams} onChange={handleInputChange} placeholder="Enter Name of the course" />
            </label>
          </div>
          <div className="flex-1 mt-5 pt-5 grid grid-cols-4 gap-5 border-t border-dashed border-[#D0D0D0] overflow-auto overflo-custom">
            {allBooks?.map((data: any) => (
              <CourseCard
                key={data?._id}
                title={data?.name?.eng}
                image={getImageClientS3URL(data?.image)}
                selected={selectedBooks.includes(data?._id)}
                onSelect={() => handleSelect(data?._id)}
              />
            ))}
          </div>
          <div className="mt-5 flex gap-2.5 justify-end border-t border-[#D0D0D0] pt-5">
            <button
              onClick={handleSubmit}
              type='submit'
              className="flex items-center gap-2.5 bg-orange text-white text-sm px-5 py-2.5 text-center rounded-[28px] hover:bg-opacity-90 transition-all disabled:opacity-50"
              disabled={isPending}
            >
              <PlusIcon />{title}
            </button>
            <button
              onClick={onClose}
              className="rounded-[28px] border border-darkBlack py-2 px-5 text-sm hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default AddToBookCommon;
