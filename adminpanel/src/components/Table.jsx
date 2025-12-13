function Table({ columns, data, loading }) {
  if (loading) {
    return (
      <div className="bg-gradient-to-br from-[#1a1a1a] to-[#141414] rounded-2xl p-12 border border-[#262626] text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin"></div>
          <div className="text-gray-400 font-medium">Loading data...</div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-gradient-to-br from-[#1a1a1a] to-[#141414] rounded-2xl p-12 border border-[#262626] text-center">
        <div className="text-gray-400 text-lg font-medium">
          No data available
        </div>
        <p className="text-gray-600 text-sm mt-2">
          Check back later for updates
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#1a1a1a] to-[#141414] rounded-2xl border border-[#262626] overflow-hidden shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#0f0f0f] border-b border-[#262626]">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#262626]">
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="hover:bg-[#1f1f1f] transition-colors duration-150 group"
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-300"
                  >
                    {column.render ? column.render(row) : row[column.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Table;
