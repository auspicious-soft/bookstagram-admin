"use client";
import Button from "@/app/components/Button";
import React, { useState } from "react";
import SearchBar from "../components/SearchBar";
import { useRouter } from "next-nprogress-bar";  
import AllVouchers from "../components/AllVouchers";
import GenerateVoucher from "../components/GenerateVoucher";
import DiscountBooks from "../components/DiscountBooks";
import useSWR from "swr";
import { getAllDiscountBooks, getAllVouchers } from "@/services/admin-services";
import TablePagination from "../components/TablePagination";

const Page = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Vouchers");
  const [bookSearch, setBookSearch] = useState("");
  const [voucherSearch, setVoucherSearch] = useState("");
  const [isVoucher, setisVoucher] = useState(false);
  const [page, setPage] = useState(1); 
  const itemsPerPage = 10;
  const [query, setQuery] = useState(`page=${page}&limit=${itemsPerPage}`);
  const {data: discountData, isLoading: bookIsLoading}= useSWR(bookSearch?`/admin/discounted-books?description=${bookSearch}$${query}&isDiscounted=true`:`/admin/discounted-books?${query}&isDiscounted=true`, getAllDiscountBooks)
  const bookData= discountData?.data?.data;
  const {data, error, isLoading, mutate} = useSWR(voucherSearch? `/admin/vouchers?description=${voucherSearch}&${query}` : `/admin/vouchers?${query}`, getAllVouchers)
  const vouchersData = data?.data?.data;
  const total = data?.data?.total


  const renderTabContent = () => {
    switch (activeTab) {
      case "Discounted Books":
        return <DiscountBooks data={bookData} />;
      case "Vouchers":
        return <AllVouchers handlePageChange={handlePageChange} vouchers ={vouchersData} error={error} isLoading={isLoading} mutate={mutate} total={total} page={page} itemsPerPage={itemsPerPage} />;
      default:
        return null;
    }
  };

  const handleButtonAction = () => {
    switch (activeTab) {
      case "Discounted Books":
        router.push("/admin/vouchers/create-voucher");
        break;
        case "Vouchers":
          setisVoucher(true);
        break;
    }
  };
  
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    setQuery(`page=${newPage}&limit=${itemsPerPage}`);
    };


  return (
    <div>
      <div className="flex justify-between">
        <div className="tabs flex gap-[5px] bg-darkBlack p-1 rounded-[47px] mb-10 ">
          {["Discounted Books", "Vouchers"].map((tab) => (
            <button 
              key={tab} 
              className={`tab-button ${activeTab === tab ? "active text-orange bg-white" : "text-white"} rounded-[34px] px-[16px] py-[9px]`}
              onClick={() => setActiveTab(tab)}>{tab}</button>
          ))}
        </div>
        <div className="flex gap-2.5 justify-end mb-5 ">
         {activeTab=== "Discounted Books" ? (
           <SearchBar setQuery={setBookSearch} query={bookSearch} />
          ) : (
            <SearchBar setQuery={setVoucherSearch} query={voucherSearch} />
          )
        }
          <div>
            <Button 
              text={activeTab === "Discounted Books" ? "Add to Discounts" : "Generate a Voucher"} 
              onClick={handleButtonAction}/>
          </div>
        </div>
      </div>
      <div className="tab-content">{renderTabContent()}</div>

      <div className="mt-10 flex justify-end">
      {activeTab === "Discounted Books"?
      (<TablePagination
        setPage={handlePageChange}
        page={page}
        totalData={discountData?.data?.total}
        itemsPerPage={itemsPerPage}
        />
      ) : (
      <TablePagination
        setPage={handlePageChange}
        page={page}
        totalData={total}
        itemsPerPage={itemsPerPage}
        />
        )}
      </div>
      <GenerateVoucher
      mutate= {mutate}
      open={isVoucher}
      onClose={()=>setisVoucher(false)}
      />

    </div>
  );
};

export default Page;