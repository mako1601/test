import * as React from 'react';
import { Stack, Button, Typography } from '@mui/material';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';

const buttonStyles = {
  borderRadius: '50px',
  width: '40px',
  minWidth: '28px',
  color: 'text.primary',
};

const Pagination = ({ currentPage, totalPages, onPageChange }: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  if (totalPages <= 1) return null;

  const maxVisiblePages = 5;
  const firstPage = 1;
  const lastPage = totalPages;

  const getPageNumbers = React.useCallback(() => {
    const pages: (number | '...')[] = [];
    const leftBound = Math.max(firstPage + 1, currentPage - Math.floor(maxVisiblePages / 2));
    const rightBound = Math.min(lastPage - 1, currentPage + Math.floor(maxVisiblePages / 2));

    if (leftBound > firstPage + 1) {
      pages.push(firstPage, '...');
    } else {
      pages.push(firstPage);
    }

    for (let i = leftBound; i <= rightBound; i++) {
      pages.push(i);
    }

    if (rightBound < lastPage - 1) {
      pages.push('...', lastPage);
    } else if (rightBound === lastPage - 1) {
      pages.push(lastPage);
    }

    return pages;
  }, [currentPage, totalPages]);

  const pageNumbers = React.useMemo(getPageNumbers, [getPageNumbers]);
  const handlePageChange = (page: number) => { onPageChange(page); };

  return (
    <Stack display="flex" flexDirection="row" justifyContent="center">
      {currentPage > 1 && (
        <Button variant="text" onClick={() => handlePageChange(currentPage - 1)} sx={buttonStyles}>
          <NavigateNextRoundedIcon sx={{ transform: 'rotate(180deg)', fontSize: '2rem' }} />
        </Button>
      )}
      {pageNumbers.map((page, index) =>
        page === "..." ? (
          <Button key={`ellipsis-${index}`} disabled variant="text" sx={buttonStyles}>
            <MoreHorizRoundedIcon />
          </Button>
        ) : (
          <Button
            key={page}
            variant={page === currentPage ? 'outlined' : 'text'}
            onClick={() => handlePageChange(page)}
            sx={buttonStyles}
          >
            <Typography variant="h6">{page}</Typography>
          </Button>
        )
      )}
      {currentPage < totalPages && (
        <Button variant="text" onClick={() => handlePageChange(currentPage + 1)} sx={buttonStyles}>
          <NavigateNextRoundedIcon sx={{ fontSize: '2rem' }} />
        </Button>
      )}
    </Stack>
  );
};

export default Pagination;