"use client";
import React, { useState } from "react"; 
import Button from "@/app/components/Button"; 
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { getAllBookMasters } from "@/services/admin-services";
import ReactLoading from "react-loading";
import { DeleteIcon, ViewIcon } from "@/utils/svgicons";
import TableRowImage from "@/app/components/TableRowImage";
import { getImageClientS3URL } from "@/utils/get-image-ClientS3URL";
import profile from '@/assets/images/preview.png';
import SearchBar from "../SearchBar";
import TablePagination from "../TablePagination";

const BookMasters = () => {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const [query, setQuery] = useState(`page=${page}&limit=${itemsPerPage}`);
  const [searchParams, setsearchParams] = useState("");
  const { data, error, isLoading, mutate } = useSWR(searchParams !== ""? `/admin/book-masters?description=${searchParams}`
      : `/admin/book-masters?${query}`,
      getAllBookMasters
  );
  const masters = data?.data?.data;
  console.log('masters:', masters);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    setQuery(`page=${newPage}&limit=${itemsPerPage}`);
  };

  const addNewAuthor = () => {
    router.push(`/admin/authors/add-author`);
  };

  const handleDelete = (id: string) => {
    router.push(`/admin/authors/profile/${id}`);
  };

  return (
    <div>
      <div className="flex gap-2.5 justify-end mb-5 ">
        <SearchBar setQuery={setsearchParams} query={searchParams} />
        <div>
          <Button text="Add To Masters" onClick={addNewAuthor} />
        </div>
      </div>

      <div className="table-common overflo-custom">
        <h3>Courses</h3>
        <table className="">
          <thead className="">
            <tr>
              <th>Name of Course</th>
              <th>Author Name</th>
              <th>Language</th>
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
                  <TableRowImage image={row?.productsId?.image ? getImageClientS3URL(row?.productsId?.image) : profile}/> {row?.productsId?.name?.eng}
                    </div></td>
                  <td>
                    {row?.productsId?.authorId?.map((item) => (
                    <p key={item?._id}>{item?.name?.eng}</p>
                    ))}</td>
                  <td>
                  {row?.productsId?.file &&Object.entries(row?.productsId?.file).slice(0, 1).map(([key, value]: [string, string], index) => (
                    <p key={index}>
                    {key === "eng" ? "English" : key === "rus" ? "Russian" : key ==="kaz" ? "Kazakh": key}
                    </p>))}
                  </td>
                  <td className="space-x-2">
                  {row?.productsId?.categoryId?.map((item) => (
                    <p key={item?._id}>{item?.name?.eng}</p>
                    ))}
                  </td>
                  <td className="space-x-1">
                    <button onClick={() => handleDelete(row?._id)} className="p-[10px]"><DeleteIcon/></button>
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

    </div>
  );
};

export default BookMasters;
