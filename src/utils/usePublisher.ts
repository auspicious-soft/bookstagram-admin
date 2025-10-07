import { getAllPublishers } from "@/services/admin-services";
import useSWR from "swr";


const UsePublisher = () => {
  const { data, error, isLoading } = useSWR(`/admin/publishers`, getAllPublishers, {
    revalidateOnFocus: false,
  });

  const publishers = data?.data?.data?.map((row: any) => ({
    label: `${row?.name?.eng || row?.name?.kaz || row?.name?.rus}`,
    value: row?._id,
  })) || []; 
  
  return {
    publishers,
      isLoading: isLoading,
      error: error,
  };
};

export default UsePublisher;
