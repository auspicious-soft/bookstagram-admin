import React from 'react';
import Stack from '@mui/material/Stack';
import Pagination from '@mui/material/Pagination';
import PaginationItem from '@mui/material/PaginationItem';
import { DropIcon } from '@/utils/svgicons';

const TablePagination = () => {
    return (
        <Stack spacing={2}>
        <Pagination
          count={10}
          shape="rounded"
        //   color='var(--tw-bg-orange)'
          renderItem={(item) => (
            <PaginationItem
              slots={{ 
                previous: (props) => (
                    <button {...props} className='text-xs bg-white'>
                     Prev
                    </button>
                  ),
                  next: (props) => (
                    <button {...props} className='text-xs bg-white'>
                     Next
                    </button>
                  ),
                }}
              {...item}
              sx={{
                backgroundColor: item.selected ? 'var(--tw-bg-orange) !important' : '#fff',
                color: item.selected ? '#fff' : '#333333', 
                fontFamily: 'var(--font-AeoniK-Regular)',
                fontSize: '12px',
                '&:hover': {
                    backgroundColor: 'var(--tw-bg-orange)', // Active: Darker Green, Rest: Darker Gray  backgroundColor: item.selected ? 'var(--tw-bg-orange)' : '#fff',
                    color: '#fff',
                },
                borderRadius: '6px',  
                padding: '6px 10px',
                margin: '0 4px',
                height: '28px' 
              }}
            />
          )}
        />
      </Stack>
    );
}

export default TablePagination;
