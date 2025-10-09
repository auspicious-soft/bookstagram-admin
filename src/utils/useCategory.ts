import { getAllCategories } from "@/services/admin-services";
import useSWR from "swr";

const UseCategory = (type?: string) => {
	const { data, error, isLoading } = useSWR(type !== undefined ? `/admin/categories?module=${type}` : `/admin/categories`, getAllCategories, {
		revalidateOnFocus: false,
	});
	console.log("data: ", data);

	const category =
		data?.data?.data?.map((row: any) => ({
			label: `${row?.name.eng || row?.name.kaz || row?.name.rus}`,
			value: row._id,
		})) || [];

	return {
		category,
		isLoading: isLoading,
		error: error,
	};
};

export default UseCategory;
