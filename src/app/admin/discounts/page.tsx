'use client'
import Button from '@/app/components/Button';
import React, { useState } from 'react';
import SearchBar from '../components/SearchBar';
import { useRouter } from 'next-nprogress-bar';

const Page = () => {
    const [activeTab, setActiveTab] = useState('Discounted Books');
    const router = useRouter();
    const [page, setPage] = useState(1);
    const itemsPerPage = 10;
    const [query, setQuery] = useState(`page=${page}&limit=${itemsPerPage}`);
    const [searchParams, setsearchParams] = useState("");
    //const { data, error, isLoading } = useSWR(`/admin/collections?description=${searchParams}&${query}`, getAllCollection);
    //const category = data?.data?.data



    const renderTabContent = () => {
        switch (activeTab) {
            case "Discounted Books":
                return <div>Hiiiiiiiii </div>;
            case "Vouchers":
                return <div>Byeeeeeeeeeee</div>;
            default:
                return null;
        }
    }
    const addDiscount = () => {
        // Add logic to add discount here
        console.log('Adding Discount');

    }

    return (
        <div>
            <div>
                <div className="tabs flex gap-[5px] bg-darkBlack p-1 rounded-[47px] mb-10 ">
                    {["Discounted Books", "Vouchers"].map((tab) => (
                        <button
                            key={tab}
                            className={`tab-button ${activeTab === tab ? 'active text-orange bg-white ' : 'text-white   '} rounded-[34px] px-[16px] py-[10px]  `}
                            onClick={() => setActiveTab(tab)}
                        >{tab}</button>
                    ))}
                </div>
                <div className="flex gap-2.5 justify-end mb-5 ">
                    <SearchBar setQuery={setsearchParams} query={searchParams} />
                    <div><Button text="Add to Discounts" onClick={addDiscount} /></div>
                </div>
            </div>
            <div className="tab-content">
                {renderTabContent()}
            </div>
        </div>
    );
}

export default Page;
