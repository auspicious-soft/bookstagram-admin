import { getAllPublishers } from "@/services/admin-services";
import useSWR from "swr";


const UsePublisher = () => {
  const { data, error, isLoading } = useSWR(`/admin/publishers`, getAllPublishers);
 
  const publishers = data?.data?.data?.map((row: any) => ({
      label: `${row?.publisher?.name?.eng}`,
      value: row?.publisher?._id,
  })) || []; 

  return {
    publishers,
      isLoading: isLoading,
      error: error,
  };
};

export default UsePublisher;
