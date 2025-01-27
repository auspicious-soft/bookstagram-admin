"use client";
import React, { useState } from "react";
import SearchBar from "./SearchBar";
import Button from "@/app/components/Button";
import TablePagination from "./TablePagination";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { getAllAuthors } from "@/services/admin-services";
import ReactLoading from "react-loading";
import { ViewIcon } from "@/utils/svgicons";
import TableRowImage from "@/app/components/TableRowImage";
import { getImageClientS3URL } from "@/utils/get-image-ClientS3URL";
import profile from '@/assets/images/preview.png';

const AllAuthorsTable = () => {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const [query, setQuery] = useState(`page=${page}&limit=${itemsPerPage}`);
  const [searchParams, setsearchParams] = useState("");
  const { data, error, isLoading, mutate } = useSWR(searchParams !== ""? `/admin/authors?description=${searchParams}`
      : `/admin/authors?${query}`,
    getAllAuthors
  );
  const authorsData = data?.data?.data;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    setQuery(`page=${newPage}&limit=${itemsPerPage}`);
  };

  const addNewAuthor = () => {
    router.push(`/admin/authors/add-author`);
  };

  const authorProfile = (id: string) => {
    router.push(`/admin/authors/profile/${id}`);
  };

  return (
    <div>
      <div className="flex gap-2.5 justify-end mb-5 ">
        <SearchBar setQuery={setsearchParams} query={searchParams} />
        <div>
          <Button text="Add A New Author" onClick={addNewAuthor} />
        </div>
      </div>

      <div className="table-common overflo-custom">
        <h3>Authors</h3>
        <table className="">
          <thead className="">
            <tr>
              <th>Name of Author</th>
              <th>Profession</th>
              <th>Date of Birth</th>
              <th>Country</th>
              <th>Genres</th>
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
            ) : authorsData?.length > 0 ? (
              authorsData?.map((row: any) => (
                <tr key={row?._id}>
                  <td><div className="flex items-center gap-2.5 capitalize">
                  <TableRowImage image={row?.image ? getImageClientS3URL(row?.image) : profile}/> {row?.name.eng} 
                    </div></td>
                  <td className="capitalize"> {row?.profession.join(", ")}</td>
                  <td>{row?.dob}</td>
                  <td>{row?.country}</td>
                  <td className="space-x-2">
                    {row?.genres.map((item, index) => (
                      <span key={index} className="bg-[#EDEDED] rounded-[22px] py-1 px-2.5 text-[10px] capitalize ">{item}</span>
                    ))}
                  </td>
                  <td className="space-x-1">
                    <button onClick={() => authorProfile(row?._id)} className="p-[10px]"><ViewIcon/></button>
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

export default AllAuthorsTable;
