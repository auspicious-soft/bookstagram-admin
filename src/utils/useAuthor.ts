import { getAllAuthors } from '@/services/admin-services';
import useSWR from 'swr'; 

const UseAuthors = (type?:string) => {
    const { data, error, isLoading } = useSWR(`/admin/authors?category=${type}`, getAllAuthors, {
        revalidateOnFocus: false,
      });

    const authors = data?.data?.data?.map((row: any) => ({
        label: `${row?.name.eng || row?.name.kaz || row?.name.rus }`,
        value: row._id,
    })) || []; 

    return {
        authors,
        isLoading: isLoading,
        error: error,
    };
};


export default UseAuthors;
