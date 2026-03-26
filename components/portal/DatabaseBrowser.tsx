/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useState, useEffect } from "react";

interface TableInfo {
  table_name: string;
  row_count: number;
}

interface ColumnInfo {
  column_name: string;
  data_type: string;
  is_nullable: boolean;
  default_value: string | null;
}

interface TableData {
  table_name: string;
  total_rows: number;
  page: number;
  page_size: number;
  total_pages: number;
  columns: string[];
  data: Record<string, any>[];
}

interface DatabaseBrowserProps {
  baseUrl?: string; // Optional: defaults to config service (3007), can be set to data_ingestion (3009)
}

export default function DatabaseBrowser({ baseUrl = "http://localhost:3007" }: DatabaseBrowserProps) {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [schema, setSchema] = useState<ColumnInfo[]>([]);
  const [tableData, setTableData] = useState<TableData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination & filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchColumn, setSearchColumn] = useState("");

  // Load tables on mount
  useEffect(() => {
    loadTables();
  }, []);

  // Load table data when selection changes
  useEffect(() => {
    if (selectedTable) {
      loadTableSchema(selectedTable);
      loadTableData(selectedTable, 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTable]);

  // Reload data when search/filter changes
  useEffect(() => {
    if (selectedTable && searchTerm && searchColumn) {
      const timer = setTimeout(() => {
        loadTableData(selectedTable, 1);
      }, 500);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, searchColumn]);

  const loadTables = async () => {
    try {
      setError(null);
      const res = await fetch("http://localhost:3007/database/tables");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setTables(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tables");
    } finally {
      setLoading(false);
    }
  };

  const loadTableSchema = async (tableName: string) => {
    try {
      const res = await fetch(`http://localhost:3007/database/tables/${tableName}/schema`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setSchema(data);
      setSearchColumn(data[0]?.column_name || "");
    } catch (err) {
      console.error("Failed to load schema:", err);
    }
  };

  const loadTableData = async (tableName: string, page: number) => {
    setDataLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: "25",
      });
      
      if (searchTerm && searchColumn) {
        params.append("search", searchTerm);
        params.append("search_column", searchColumn);
      }

      const res = await fetch(
        `http://localhost:3007/database/tables/${tableName}/data?${params}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setTableData(data);
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load table data");
    } finally {
      setDataLoading(false);
    }
  };

  const handleTableSelect = (tableName: string) => {
    setSelectedTable(tableName);
    setSearchTerm("");
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (selectedTable && newPage > 0 && tableData && newPage <= tableData.total_pages) {
      loadTableData(selectedTable, newPage);
    }
  };

  const handleSearch = () => {
    if (selectedTable) {
      loadTableData(selectedTable, 1);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    if (selectedTable) {
      loadTableData(selectedTable, 1);
    }
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return "NULL";
    if (typeof value === "boolean") return value ? "true" : "false";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">🗄️ Database Browser</h2>
        <p className="text-white/60 mt-1">
          View and explore PostgreSQL tables with live data
        </p>
      </div>

      {error && (
        <div className="bg-red-400/10 border border-red-400/20 rounded-xl p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tables List */}
        <div className="lg:col-span-1">
          <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-white/5">
              <h3 className="font-semibold">Tables ({tables.length})</h3>
            </div>
            
            {loading ? (
              <div className="p-4 text-center text-white/40">Loading...</div>
            ) : tables.length === 0 ? (
              <div className="p-4 text-center text-white/40">No tables found</div>
            ) : (
              <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto">
                {tables.map((table) => (
                  <button
                    key={table.table_name}
                    onClick={() => handleTableSelect(table.table_name)}
                    className={`w-full p-4 text-left hover:bg-white/[0.02] transition-colors ${
                      selectedTable === table.table_name
                        ? "bg-purple-500/10 border-l-2 border-purple-400"
                        : ""
                    }`}
                  >
                    <div className="font-mono text-sm text-white/90">
                      {table.table_name}
                    </div>
                    <div className="text-xs text-white/40 mt-1">
                      {table.row_count.toLocaleString()} rows
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Table Data Viewer */}
        <div className="lg:col-span-3">
          {!selectedTable ? (
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-12 text-center">
              <div className="text-white/40 mb-2">No table selected</div>
              <div className="text-sm text-white/20">
                Select a table from the list to view its data
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Table Info & Search */}
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold font-mono">{selectedTable}</h3>
                    {tableData && (
                      <p className="text-sm text-white/60">
                        {tableData.total_rows.toLocaleString()} total rows
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedTable(null)}
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-colors"
                  >
                    Close
                  </button>
                </div>

                {/* Search/Filter */}
                <div className="flex gap-3">
                  <select
                    value={searchColumn}
                    onChange={(e) => setSearchColumn(e.target.value)}
                    className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-400/50"
                  >
                    <option value="">Select column</option>
                    {schema.map((col) => (
                      <option key={col.column_name} value={col.column_name}>
                        {col.column_name}
                      </option>
                    ))}
                  </select>
                  
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="Search..."
                    className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-purple-400/50"
                  />
                  
                  <button
                    onClick={handleSearch}
                    disabled={!searchColumn || !searchTerm}
                    className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Search
                  </button>
                  
                  {searchTerm && (
                    <button
                      onClick={handleClearSearch}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Schema Info */}
              <details className="bg-white/[0.02] border border-white/5 rounded-xl">
                <summary className="p-4 cursor-pointer hover:bg-white/[0.02] font-medium">
                  Schema ({schema.length} columns)
                </summary>
                <div className="border-t border-white/5 p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {schema.map((col) => (
                      <div key={col.column_name} className="flex items-center gap-2">
                        <span className="font-mono text-white/90">{col.column_name}</span>
                        <span className="text-white/40">:</span>
                        <span className="text-purple-400">{col.data_type}</span>
                        {!col.is_nullable && (
                          <span className="text-xs text-red-400">NOT NULL</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </details>

              {/* Data Table */}
              <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
                {dataLoading ? (
                  <div className="p-8 text-center text-white/40">Loading data...</div>
                ) : !tableData || tableData.data.length === 0 ? (
                  <div className="p-8 text-center text-white/40">No data found</div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-white/[0.02] border-b border-white/5">
                          <tr>
                            {tableData.columns.map((col) => (
                              <th
                                key={col}
                                className="px-4 py-3 text-left font-mono text-xs text-white/60 whitespace-nowrap"
                              >
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {tableData.data.map((row, idx) => (
                            <tr key={idx} className="hover:bg-white/[0.02]">
                              {tableData.columns.map((col) => (
                                <td
                                  key={col}
                                  className="px-4 py-3 font-mono text-xs text-white/80 whitespace-nowrap max-w-xs overflow-hidden text-ellipsis"
                                  title={formatValue(row[col])}
                                >
                                  {formatValue(row[col])}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    <div className="border-t border-white/5 p-4 flex items-center justify-between">
                      <div className="text-sm text-white/60">
                        Page {tableData.page} of {tableData.total_pages} • Showing{" "}
                        {tableData.data.length} of {tableData.total_rows.toLocaleString()}{" "}
                        rows
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handlePageChange(1)}
                          disabled={currentPage === 1}
                          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          First
                        </button>
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        <div className="px-4 py-1.5 bg-white/[0.02] rounded-lg text-sm">
                          {currentPage} / {tableData.total_pages}
                        </div>
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === tableData.total_pages}
                          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                        <button
                          onClick={() => handlePageChange(tableData.total_pages)}
                          disabled={currentPage === tableData.total_pages}
                          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Last
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
