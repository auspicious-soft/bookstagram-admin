import { getAllUsers } from '@/services/admin-services';
import useSWR from 'swr'; 

const UseUsers = () => {
    const { data, error, isLoading } = useSWR(`/admin/users`, getAllUsers);

    const users = data?.data?.data?.map((row: any) => ({
        label: `${row?.fullName?.eng}`,
        value: row._id,
    })) || []; 

    return {
        users,
        isLoading: isLoading,
        error: error,
    };
};

export default UseUsers;
