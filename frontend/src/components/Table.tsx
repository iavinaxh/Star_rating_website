import React from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  onSort?: (key: string, order: 'ASC' | 'DESC') => void;
  isLoading?: boolean;
  emptyMessage?: string;
}

export function Table<T extends { id?: number | string }>({
  columns,
  data,
  sortBy,
  sortOrder,
  onSort,
  isLoading = false,
  emptyMessage = 'No records found.',
}: TableProps<T>) {
  const handleHeaderClick = (column: Column<T>) => {
    if (!column.sortable || !onSort) return;

    let nextOrder: 'ASC' | 'DESC' = 'ASC';
    if (sortBy === column.key) {
      nextOrder = sortOrder === 'ASC' ? 'DESC' : 'ASC';
    }
    onSort(column.key, nextOrder);
  };

  const renderSortIcon = (column: Column<T>) => {
    if (!column.sortable) return null;
    if (sortBy !== column.key) {
      return <ChevronsUpDown size={14} className="sort-icon" />;
    }
    return sortOrder === 'ASC' ? (
      <ChevronUp size={14} className="sort-icon" style={{ color: 'var(--accent)' }} />
    ) : (
      <ChevronDown size={14} className="sort-icon" style={{ color: 'var(--accent)' }} />
    );
  };

  return (
    <div className="table-container">
      <table className="premium-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={column.sortable ? 'sortable' : ''}
                onClick={() => handleHeaderClick(column)}
              >
                <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                  {column.label}
                  {renderSortIcon(column)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                Loading data...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr key={row.id || index}>
                {columns.map((column) => (
                  <td key={column.key}>
                    {column.render ? column.render(row) : (row as any)[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
