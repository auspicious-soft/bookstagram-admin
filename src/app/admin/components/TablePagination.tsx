import React from 'react';
import Stack from '@mui/material/Stack';
import Pagination from '@mui/material/Pagination';
import PaginationItem from '@mui/material/PaginationItem';

interface TablePaginationProps {
  setPage: (page: number) => void; // Function to update the current page
  page: number; // Current page number
  totalData: number; // Total number of data items
  itemsPerPage: number; // Items per page
}

const TablePagination: React.FC<TablePaginationProps> = ({ setPage, page, totalData, itemsPerPage }) => {
  // Calculate the total number of pages
  const totalPages = Math.ceil(totalData / itemsPerPage);

  return (
    <Stack spacing={2}>
      <Pagination
        count={totalPages} // Set total pages dynamically
        shape="rounded"
        page={page} // Bind the page prop here
        onChange={(_, newPage) => setPage(newPage)} // Handle page change
        renderItem={(item) => (
          <PaginationItem
            slots={{
              previous: () => ("Prev"),
              next: () => ("Next"),
            }}
            {...item}
            sx={{
              backgroundColor: item.selected ? 'var(--tw-bg-orange) !important' : '#fff',
              color: item.selected ? '#fff' : '#333333',
              fontFamily: 'var(--font-AeoniK-Regular)',
              fontSize: '12px',
              '&:hover': {
                backgroundColor: 'var(--tw-bg-orange)',
                color: '#fff',
              },
              borderRadius: '6px',
              padding: '6px 10px',
              margin: '0 4px',
              height: '28px',
            }}
          />
        )}
      />
    </Stack>
  );
};

export default TablePagination;
