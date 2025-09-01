'use client';

import React, { useEffect, useState } from 'react';
import DeletableBookCard from './DeletableBookCard';
import { getAllBooks } from '@/services/admin-services';
import { getImageClientS3URL } from '@/utils/get-image-ClientS3URL';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';
import ReactLoading from 'react-loading';
import { getProfileImageUrl } from '@/utils/getImageUrl';

const DeleteBookDemo = () => {
  const router = useRouter();
  const [searchParams, setSearchParams] = useState('');
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [query, setQuery] = useState(`page=${page}&limit=${itemsPerPage}`);

  const { data, error, isLoading, mutate } = useSWR(
    `/admin/books?${query}${searchParams ? `&${searchParams}` : ''}`,
    getAllBooks
  );

  const booksData = data?.data?.data;

  const openBookProfile = (id: string, name: string) => {
    localStorage.setItem('getbookName', name);
    router.push(`/admin/books/${id}`);
  };

  const handleDeleteSuccess = () => {
    mutate(); // Refresh the data after successful deletion
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <ReactLoading type="spin" color="#26395e" height="40px" width="40px" />
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500">Error loading books.</p>;
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Books</h2>
      {booksData?.length === 0 ? (
        <p className="text-center text-gray-500">No books found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {booksData?.map((book: any) => (
            <DeletableBookCard
              key={book?._id}
              id={book?._id}
              title={
                book?.name?.eng ??
                book?.name?.kaz ??
                book?.name?.rus ??
                'Untitled'
              }
              author={
                book?.authorId?.[0]?.name?.eng ??
                book?.authorId?.[0]?.name?.kaz ??
                book?.authorId?.[0]?.name?.rus ??
                'Unknown Author'
              }
              price={`$${book?.price}`}
              imgSrc={getProfileImageUrl(book?.image)}
              discount={book?.discountPercentage}
              handleClick={() => openBookProfile(book?._id, book?.name?.eng)}
              onDeleteSuccess={handleDeleteSuccess}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DeleteBookDemo;
