import { getSubCategory } from '@/services/admin-services';
import useSWR from 'swr';

const UseSubCategory = () => {
  const { data, error, isLoading } = useSWR(`/admin/sub-categories`, getSubCategory, {
    revalidateOnFocus: false,
  });

  const subCategory = data?.data?.data?.map((row: any) => ({
    label: row?.name?.eng ?? row?.name?.kaz ?? row?.name?.rus ?? '',
    value: row._id,
  })) || []; 

  return {
    subCategory,
    isLoading: isLoading,
    error: error,
  };
};

export default UseSubCategory;
