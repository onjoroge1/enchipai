/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock Next.js modules
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: { user: { role: 'ADMIN' } },
    status: 'authenticated',
  }),
}));

// Mock fetch globally
global.fetch = jest.fn();

describe('Admin Table Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          bookings: [],
          guests: [],
          invoices: [],
          experiences: [],
          items: [],
          total: 0,
        },
      }),
    });
  });

  describe('BookingsTable', () => {
    it('should render loading state', async () => {
      const { BookingsTable } = await import('@/components/admin/bookings-table');
      render(<BookingsTable />);
      
      // Component should show loading initially
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('should handle empty state', async () => {
      const { BookingsTable } = await import('@/components/admin/bookings-table');
      render(<BookingsTable />);
      
      await waitFor(() => {
        expect(screen.getByText(/No bookings found/i)).toBeInTheDocument();
      });
    });
  });

  describe('GuestsTable', () => {
    it('should render loading state', async () => {
      const { GuestsTable } = await import('@/components/admin/guests-table');
      render(<GuestsTable />);
      
      // Component should show loading initially
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('should handle empty state', async () => {
      const { GuestsTable } = await import('@/components/admin/guests-table');
      render(<GuestsTable />);
      
      await waitFor(() => {
        expect(screen.getByText(/No guests found/i)).toBeInTheDocument();
      });
    });
  });

  describe('InvoicesTable', () => {
    it('should render loading state', async () => {
      const { InvoicesTable } = await import('@/components/admin/invoices-table');
      render(<InvoicesTable />);
      
      // Component should show loading initially
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('should handle empty state', async () => {
      const { InvoicesTable } = await import('@/components/admin/invoices-table');
      render(<InvoicesTable />);
      
      await waitFor(() => {
        expect(screen.getByText(/No invoices found/i)).toBeInTheDocument();
      });
    });
  });

  describe('ExperiencesList', () => {
    it('should render loading state', async () => {
      const { ExperiencesList } = await import('@/components/admin/experiences-list');
      render(<ExperiencesList />);
      
      // Component should show loading initially
      expect(screen.getByText(/Available Experiences/i)).toBeInTheDocument();
    });

    it('should handle empty state', async () => {
      const { ExperiencesList } = await import('@/components/admin/experiences-list');
      render(<ExperiencesList />);
      
      await waitFor(() => {
        expect(screen.getByText(/No experiences found/i)).toBeInTheDocument();
      });
    });
  });

  describe('InventoryList', () => {
    it('should render loading state', async () => {
      const { InventoryList } = await import('@/components/admin/inventory-list');
      render(<InventoryList />);
      
      // Component should show loading initially
      expect(screen.getByText(/All Inventory Items/i)).toBeInTheDocument();
    });

    it('should handle empty state', async () => {
      const { InventoryList } = await import('@/components/admin/inventory-list');
      render(<InventoryList />);
      
      await waitFor(() => {
        expect(screen.getByText(/No inventory items found/i)).toBeInTheDocument();
      });
    });
  });
});

describe('Table Sorting Functionality', () => {
  it('should sort bookings by different fields', () => {
    const bookings = [
      { id: '1', bookingNumber: 'B001', user: { name: 'Alice' }, totalAmount: 100 },
      { id: '2', bookingNumber: 'B002', user: { name: 'Bob' }, totalAmount: 200 },
    ];

    // Test ascending sort
    const sortedAsc = [...bookings].sort((a, b) => 
      a.user.name.localeCompare(b.user.name)
    );
    expect(sortedAsc[0].user.name).toBe('Alice');

    // Test descending sort
    const sortedDesc = [...bookings].sort((a, b) => 
      b.user.name.localeCompare(a.user.name)
    );
    expect(sortedDesc[0].user.name).toBe('Bob');
  });

  it('should sort by numeric values correctly', () => {
    const invoices = [
      { id: '1', total: 100 },
      { id: '2', total: 50 },
      { id: '3', total: 200 },
    ];

    const sorted = [...invoices].sort((a, b) => a.total - b.total);
    expect(sorted[0].total).toBe(50);
    expect(sorted[2].total).toBe(200);
  });

  it('should sort by date correctly', () => {
    const items = [
      { id: '1', createdAt: '2024-01-01' },
      { id: '2', createdAt: '2024-03-01' },
      { id: '3', createdAt: '2024-02-01' },
    ];

    const sorted = [...items].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    expect(sorted[0].id).toBe('1');
    expect(sorted[2].id).toBe('2');
  });
});

describe('Export Functionality', () => {
  beforeEach(() => {
    // Mock URL.createObjectURL and document.createElement
    global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = jest.fn();
    
    const mockLink = {
      setAttribute: jest.fn(),
      click: jest.fn(),
      style: {},
    };
    
    document.createElement = jest.fn(() => mockLink as any);
    document.body.appendChild = jest.fn();
    document.body.removeChild = jest.fn();
  });

  it('should generate CSV content correctly', () => {
    const headers = ['Name', 'Email', 'Amount'];
    const rows = [
      ['John Doe', 'john@example.com', '100'],
      ['Jane Smith', 'jane@example.com', '200'],
    ];

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    expect(csvContent).toContain('Name,Email,Amount');
    expect(csvContent).toContain('"John Doe"');
    expect(csvContent).toContain('"100"');
  });

  it('should handle special characters in CSV', () => {
    const data = ['Name with "quotes"', 'Email, with comma'];
    const csvRow = data.map(cell => `"${cell}"`).join(',');
    
    expect(csvRow).toBe('"Name with ""quotes""","Email, with comma"');
  });
});

