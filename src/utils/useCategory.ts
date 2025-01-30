import { getAllCategories } from '@/services/admin-services';
import useSWR from 'swr'; 

const UseCategory = () => {
    const { data, error, isLoading } = useSWR(`/admin/categories`, getAllCategories);

    const category = data?.data?.data?.map((row: any) => ({
        label: `${row?.name.eng}`,
        value: row._id,
    })) || []; 

    return {
        category,
        isLoading: isLoading,
        error: error,
    };
};


export default UseCategory;
