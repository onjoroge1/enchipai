/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the pagination UI components
jest.mock('@/components/ui/pagination', () => ({
  Pagination: ({ children, ...props }: any) => <nav {...props}>{children}</nav>,
  PaginationContent: ({ children, ...props }: any) => <ul {...props}>{children}</ul>,
  PaginationItem: ({ children, ...props }: any) => <li {...props}>{children}</li>,
  PaginationLink: ({ children, onClick, ...props }: any) => (
    <a onClick={onClick} {...props}>{children}</a>
  ),
  PaginationPrevious: ({ onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>Previous</button>
  ),
  PaginationNext: ({ onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>Next</button>
  ),
  PaginationEllipsis: () => <span>...</span>,
}));

jest.mock('@/components/ui/select', () => ({
  Select: ({ children, value, onValueChange }: any) => (
    <select value={value} onChange={(e) => onValueChange(e.target.value)}>
      {children}
    </select>
  ),
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: () => <span>Select</span>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value }: any) => <option value={value}>{children}</option>,
}));

describe('DataTablePagination', () => {
  const defaultProps = {
    total: 100,
    limit: 25,
    offset: 0,
    onPageChange: jest.fn(),
    onLimitChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render pagination with correct info', () => {
    render(<DataTablePagination {...defaultProps} />);
    
    expect(screen.getByText(/Showing 1 to 25 of 100 results/i)).toBeInTheDocument();
  });

  it('should not render when total is 0', () => {
    const { container } = render(
      <DataTablePagination {...defaultProps} total={0} />
    );
    
    expect(container.firstChild).toBeNull();
  });

  it('should call onPageChange when clicking next', () => {
    render(<DataTablePagination {...defaultProps} />);
    
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);
    
    expect(defaultProps.onPageChange).toHaveBeenCalledWith(25);
  });

  it('should call onPageChange when clicking previous', () => {
    render(<DataTablePagination {...defaultProps} offset={25} />);
    
    const prevButton = screen.getByText('Previous');
    fireEvent.click(prevButton);
    
    expect(defaultProps.onPageChange).toHaveBeenCalledWith(0);
  });

  it('should disable previous button on first page', () => {
    render(<DataTablePagination {...defaultProps} offset={0} />);
    
    const prevButton = screen.getByText('Previous');
    expect(prevButton).toHaveAttribute('class', expect.stringContaining('opacity-50'));
  });

  it('should disable next button on last page', () => {
    render(<DataTablePagination {...defaultProps} offset={75} total={100} limit={25} />);
    
    const nextButton = screen.getByText('Next');
    expect(nextButton).toHaveAttribute('class', expect.stringContaining('opacity-50'));
  });

  it('should call onLimitChange when changing page size', () => {
    render(<DataTablePagination {...defaultProps} />);
    
    const select = screen.getByDisplayValue('25');
    fireEvent.change(select, { target: { value: '50' } });
    
    expect(defaultProps.onLimitChange).toHaveBeenCalledWith('50');
    expect(defaultProps.onPageChange).toHaveBeenCalledWith(0);
  });

  it('should show correct range for last page', () => {
    render(<DataTablePagination {...defaultProps} offset={75} total={100} limit={25} />);
    
    expect(screen.getByText(/Showing 76 to 100 of 100 results/i)).toBeInTheDocument();
  });

  it('should use custom page size options', () => {
    render(
      <DataTablePagination
        {...defaultProps}
        pageSizeOptions={[10, 20, 50]}
      />
    );
    
    // Should render with custom options
    expect(screen.getByText(/Showing 1 to 25 of 100 results/i)).toBeInTheDocument();
  });
});

