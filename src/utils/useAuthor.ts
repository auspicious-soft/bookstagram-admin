import { getAllAuthors } from '@/services/admin-services';
import useSWR from 'swr'; 

const UseAuthors = () => {
    const { data, error, isLoading } = useSWR(`/admin/authors`, getAllAuthors);

    const authors = data?.data?.data?.map((row: any) => ({
        label: `${row?.name.eng}`,
        value: row._id,
    })) || []; 

    return {
        authors,
        isLoading: isLoading,
        error: error,
    };
};


export default UseAuthors;
