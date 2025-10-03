"use client";
import React, { useState, useTransition } from "react";
import Button from "@/app/components/Button";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { addToBookMasters, deleteBookMasters, getAllBookMasters } from "@/services/admin-services";
import ReactLoading from "react-loading";
import { DeleteIcon, ViewIcon } from "@/utils/svgicons";
import TableRowImage from "@/app/components/TableRowImage";
import { getImageClientS3URL } from "@/utils/get-image-ClientS3URL";
import profile from '@/assets/images/preview.png';
import SearchBar from "../SearchBar";
import TablePagination from "../TablePagination";
import { toast } from "sonner";
import AddToBookCommon from "../AddToBookCommon";
import DeleteConfirmationModal from "../DeleteConfirmationModal";
import { getProfileImageUrl } from "@/utils/getImageUrl";

const BookMasters = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [openModal, setOpenModal] = useState(false)
  const [selectedBooks, setSelectedBooks] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;
  const [query, setQuery] = useState(`page=${page}&limit=${itemsPerPage}`);
  const [searchParams, setsearchParams] = useState("");
  const { data, error, isLoading, mutate } = useSWR(searchParams !== ""? `/admin/book-masters?description=${searchParams}`
      : `/admin/book-masters?${query}`,
      getAllBookMasters
  );
  const masters = data?.data?.data;
  const getName = (name) => name?.eng || name?.kaz || name?.rus;

  // Delete confirmation modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    setQuery(`page=${newPage}&limit=${itemsPerPage}`);
  };


  const openDeleteModal = (id: string, name: string) => {
    setItemToDelete({ id, name });
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    setIsDeleting(true);
    try {
      startTransition(async () => {
        const response = await deleteBookMasters(`/admin/book-masters/${itemToDelete.id}`);
        if (response.status === 200) {
          toast.success("Deleted successfully");
          mutate();
        } else {
          toast.error("Failed To Delete");
        }
        setIsDeleting(false);
        closeDeleteModal();
      });
    } catch (error) {
      toast.error("An error occurred while deleting");
      setIsDeleting(false);
      closeDeleteModal();
    }
  }
  const openBookProfile = (id: string, name: string) => {
    localStorage.setItem("getbookName", name);
    router.push(`/admin/books/${id}`);
  };
  
  const addBookToBookMaster = async() => {
    if (selectedBooks.length === 0) {
      toast.error("Please select at least one book.");
      return;
    }
    try {
      const payload = {
        productsId: selectedBooks
      };

     startTransition(async () => {
        const response = await addToBookMasters('/admin/book-masters', payload);

        if (response.status===201 ) {
          toast.success("Books added to Book Masters successfully");
          mutate();
          setOpenModal(false);
          setSelectedBooks([]);
        } else {
          toast.error("Failed To add books");
        }
      });
    } catch (error) {
      console.error('Error adding books:', error);
      toast.error("An error occurred while adding books");
    }
  }

  return (
    <div>
      <div className="flex gap-2.5 justify-end mb-5 ">
        <SearchBar setQuery={setsearchParams} query={searchParams} />
        <div>
          <Button text="Add To Masters" onClick={() => router.push("/admin/add-new?type=video-lecture&module=bookMaster")} />
        </div>
      </div>

      <div className="table-common overflo-custom">
        <h3>Videos</h3>
        <table className="">
          <thead className="">
            <tr>
              <th>Name of Video</th>
              <th>Author Name</th>
              {/* <th>Language</th> */}
              <th>Categories</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody className="">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="">Loading...</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={6} className="text-center text-red-500 ">Error loading data.</td>
              </tr>
            ) : masters?.length > 0 ? (
              masters?.map((row: any) => (
                <tr key={row?._id}>
                  <td><div className="flex items-center gap-2.5 capitalize">
                  <TableRowImage image={row?.productsId?.image ? getProfileImageUrl(row?.productsId?.image) : profile}/> {row?.productsId?.name?.eng ?? row?.productsId?.name?.kaz ?? row?.productsId?.name?.rus}
                    </div></td>
                  <td>
                    {row?.productsId?.authorId?.map((item) => (
                    <p key={item?._id}>{item?.name?.eng || item?.name?.kaz || item?.name?.rus}</p>
                    ))}</td>
                  {/* <td>
                  {row?.productsId?.file &&Object.entries(row?.productsId?.file).slice(0, 1).map(([key, value]: [string, string], index) => (
                    <p key={index}>
                    {key === "eng" ? "English" : key === "rus" ? "Russian" : key ==="kaz" ? "Kazakh": key}
                    </p>))}
                  </td> */}
                  <td>
                  <div className="flex flex-wrap gap-2">
                  {(row?.productsId?.categoryId)?.slice(0, 3)?.map((item) => (
                      <span key={item?._id} className="bg-[#EDEDED] px-2.5 py-1 rounded-full capitalize" >
                        {item?.name.rus  ?? item?.name?.kaz ?? item?.name?.eng}
                        {/* {getName(item?.name)} */}
                      </span>
                    ))}
                  {(row?.productsId?.categoryId)?.length > 3 && (
                    <span className="bg-[#EDEDED] px-2.5 py-1 rounded-full">...</span>
                  )}
                </div>
                  </td>
                  <td className="space-x-1">
                    <button
                      onClick={() => openDeleteModal(
                        row?._id,
                        row?.productsId?.name?.eng ?? row?.productsId?.name?.kaz ?? row?.productsId?.name?.rus ?? 'this course'
                      )}
                      className="p-[10px]"
                    >
                      <DeleteIcon/>
                    </button>
                     <button
                      onClick={() => openBookProfile(
                        row?.productsId?._id,
                        row?.productsId?.name?.eng ?? row?.productsId?.name?.kaz ?? row?.productsId?.name?.rus ?? 'this course'
                  )}
                      className="p-[10px]"
                    >
                      <ViewIcon />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6}>{isLoading ? (<ReactLoading
                      type={"spin"}
                      color={"#26395e"}
                      height={"20px"}
                      width={"20px"}
                    />
                  ) : (
                    <p>No data found</p>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-10 flex justify-end">
        <TablePagination
          setPage={handlePageChange}
          page={page}
          totalData={data?.data?.total}
          itemsPerPage={itemsPerPage}
        />
      </div>
      <AddToBookCommon
        open={openModal}
        onClose={() => setOpenModal(false)}
        title="Add To Book Master"
        selectedBooks={selectedBooks}
        onSelectBooks={setSelectedBooks}
        handleSubmit={addBookToBookMaster}
        isPending={isPending}
        type="video-lecture"
        route="/admin/book-masters/books"
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        title="Delete Course?"
        message={itemToDelete ? `Are you sure you really want to delete "${itemToDelete.name}"?` : "Are you sure you want to delete this course?"}
      />
    </div>
  );
};

export default BookMasters;
