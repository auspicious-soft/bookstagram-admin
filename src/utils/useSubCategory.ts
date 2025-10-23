import { getSubCategory } from "@/services/admin-services";
import useSWR from "swr";

const UseSubCategory = (ids?: any) => {
	console.log('ids: ', ids);
	const { data, error, isLoading } = useSWR(Array.isArray(ids) && ids.length!==0? `/admin/sub-categories/${ids}/category` : null, getSubCategory, {
    revalidateOnFocus: false,
	});
	// `/admin/sub-categories`
  console.log('data-----: ', data?.data?.data);
  
	const subCategory =
		 data?.data?.data?.map((row: any) => ({
			// label: row?.name?.eng ?? row?.name?.kaz ?? row?.name?.rus ?? '',
			label: row?.name?.eng !== null ? row.name.eng : row?.name?.kaz !== null ? row.name.kaz : row?.name?.rus !== null ? row.name.rus : "",
			value: row._id,
		})) || [];

	return {
		subCategory,
		isLoading: isLoading,
		error: error,
	};
};

export default UseSubCategory;
