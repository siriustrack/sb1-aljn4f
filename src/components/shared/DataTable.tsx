import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import GroupingFilter from './GroupingFilter';

interface DataTableProps {
  data: any[];
  columns: {
    key: string;
    header: string;
    render?: (value: any) => React.ReactNode;
  }[];
  groupBy?: {
    value: 'day' | 'week' | 'month';
    onChange: (value: 'day' | 'week' | 'month') => void;
  };
}

export default function DataTable({ data, columns, groupBy }: DataTableProps) {
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentData = data.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  return (
    <div>
      {groupBy && (
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">Histórico</h2>
            <GroupingFilter value={groupBy.value} onChange={groupBy.onChange} />
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentData.map((row, index) => (
              <tr key={index}>
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                    {column.render ? column.render(row[column.key]) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 flex justify-between items-center border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <select
            value={rowsPerPage}
            onChange={(e) => setRowsPerPage(Number(e.target.value))}
            className="rounded-lg border-gray-300 shadow-sm focus:border-[#FF66B2] focus:ring-[#FF66B2]"
          >
            <option value={10}>10 linhas</option>
            <option value={25}>25 linhas</option>
            <option value={50}>50 linhas</option>
            <option value={100}>100 linhas</option>
          </select>
          <span className="text-sm text-gray-700">
            Mostrando {startIndex + 1} até {Math.min(endIndex, data.length)} de {data.length} registros
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm text-gray-700">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}