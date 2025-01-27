"use client";
import React, { useState } from "react";
import SearchBar from "./SearchBar";
import Button from "@/app/components/Button";
import TablePagination from "./TablePagination";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { getAllPublishers } from "@/services/admin-services";
import ReactLoading from "react-loading";
import { ViewIcon } from "@/utils/svgicons";
import { getImageClientS3URL } from "@/utils/get-image-ClientS3URL";
import TableRowImage from "@/app/components/TableRowImage";
import profile from '@/assets/images/preview.png';
import { useSession } from "next-auth/react";
import UseCategory from "@/utils/useCategory";

const AllPublishersTable = () => {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const session = useSession()
  const role= (session as any)?.data?.user?.role
  const [query, setQuery] = useState(`page=${page}&limit=${itemsPerPage}`);
  const [searchParams, setsearchParams] = useState("");
  const {data, error, isLoading} = useSWR(`/admin/publishers?description=${searchParams}&${query}`, getAllPublishers)
  const publishersData = data?.data?.data;  
  
  const { category } = UseCategory(); 
  

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    setQuery(`page=${newPage}&limit=${itemsPerPage}`);
  };

  const addNewPublisher = () => {
    router.push(`/admin/publishers/add-publisher`);
  };

  const authorProfile = (id: string) => {
    router.push(`/admin/publishers/profile/${id}`);
  };
  const getCategoryNames = (categoryIds: string[]) => {
    if (!categoryIds || !category) return [];

    return categoryIds.map(catId => {
      const foundCategory = category.find(cat => cat.value === catId);
      return foundCategory ? foundCategory.label : null;
    }).filter(Boolean);
  };

  return (
    <div>
      <div className="flex gap-2.5 justify-end mb-5 ">
        <SearchBar setQuery={setsearchParams} query={searchParams} />
        {role === 'admin' && ( <div>
          <Button text="Add A New Publisher" onClick={addNewPublisher} />
        </div>)}
      </div>

      <div className="table-common overflo-custom">
        <h3>Publishers</h3>
        <table className="">
          <thead className="">
            <tr>
              <th>Name of Publisher</th>
              <th>Categories</th>
              <th>Country</th>
              <th>Number of books released</th> 
              <th>Action</th>
            </tr>
          </thead>
          <tbody className="">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="">Loading...</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={5} className="text-center text-red-500 ">Error loading data.</td>
              </tr>
            ) : publishersData?.length > 0 ? (
                publishersData?.map((row: any, index: number) => (
                <tr key={row?._id || `publisher-${index}`}>
                  <td><div className="flex items-center gap-2.5 capitalize">
                  <TableRowImage image={row?.publisher?.image ? getImageClientS3URL(row?.publisher?.image) : profile}/>  {row?.publisher?.name.eng} </div></td>
                  <td>
                  <div className="flex flex-wrap gap-2">
                  {getCategoryNames(row?.publisher?.categoryId).slice(0, 3).map((categoryName, index) => (
                      <span key={index} className="bg-[#EDEDED] px-2.5 py-1 rounded-full capitalize" >
                        {categoryName}
                      </span>
                    ))}
                  {getCategoryNames(row?.publisher?.categoryId).length > 3 && (
                    <span className="bg-[#EDEDED] px-2.5 py-1 rounded-full">...</span>
                  )}
                </div>  
                  </td>
                  <td>{row?.publisher?.country}</td> 
                  <td>{row?.publisher?.bookCount}</td>
                  <td className="space-x-1">
                    <button onClick={() => authorProfile(row?.publisher?._id)} className="p-[10px]"><ViewIcon/></button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5}>{isLoading ? (<ReactLoading
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

export default AllPublishersTable;
