'use client';

import React, { useState, useTransition } from 'react';
import BookCard from './BookCard';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { deleteBook } from '@/services/admin-services';
import { toast } from 'sonner';
import { StaticImageData } from 'next/image';

interface DeletableBookCardProps {
  id: string;
  title: string;
  author: string;
  price: string;
  imgSrc?: string | StaticImageData;
  discount?: string | number;
  handleClick?: React.MouseEventHandler;
  onDeleteSuccess?: () => void;
}

const DeletableBookCard: React.FC<DeletableBookCardProps> = ({
  id,
  title,
  author,
  price,
  imgSrc,
  discount,
  handleClick,
  onDeleteSuccess
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleOpenModal = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the card click event from firing
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    setIsDeleting(true);
    startTransition(async () => {
      try {
        const response = await deleteBook(`/admin/books/${id}`);
        console.log('response: ', response);
        if (response.status === 200) {
          toast.success('Book deleted successfully');
          if (onDeleteSuccess) {
            onDeleteSuccess();
          }
        } else {
          toast.error('Failed to delete book');
        }
      } catch (error) {
        console.error('Error deleting book:', error);
        toast.error('An error occurred while deleting the book');
      } finally {
        setIsDeleting(false);
        setIsModalOpen(false);
      }
    });
  };

  return (
    <>
      <BookCard
        title={title}
        author={author}
        price={price}
        imgSrc={imgSrc}
        discount={discount}
        handleClick={handleClick}
        handleDelete={handleOpenModal}
      />

      <DeleteConfirmationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        title="Delete Book?"
        message={`Are you sure you really want to delete "${title}"?`}
      />
    </>
  );
};

export default DeletableBookCard;
