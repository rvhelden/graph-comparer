import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Input, Button, Space, Card, Alert, Spin, Select } from "antd";
import { SearchOutlined, ReloadOutlined } from "@ant-design/icons";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type PaginationState,
  flexRender,
} from "@tanstack/react-table";
import { useCustomers } from "../hooks/useCustomers";
import { useQueryClient } from "@tanstack/react-query";
import type { Customer } from "../schemas/customerSchemas";

export const Route = createFileRoute("/customers")({
  component: CustomersPage,
});

function CustomersPage() {
  const queryClient = useQueryClient();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [globalFilter, setGlobalFilter] = useState("");

  // Convert TanStack Table state to OData parameters
  const sortField = sorting[0]?.id;
  const sortOrder = sorting[0]?.desc ? "descend" : "ascend";

  const {
    data,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useCustomers({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    sortField,
    sortOrder: sorting.length > 0 ? sortOrder : undefined,
    search: globalFilter,
  });

  const customers = data?.value || [];
  const totalCount = data?.["@odata.count"] || 0;

  // Extract unique ring values for dropdown
  const ringOptions = useMemo(() => {
    const uniqueRings = Array.from(
      new Set(customers.map(customer => customer.RingName).filter(Boolean))
    ).sort();
    
    return [
      { label: "All Rings", value: "" },
      ...uniqueRings.map(ring => ({ label: ring, value: ring }))
    ];
  }, [customers]);

  const columns = useMemo<ColumnDef<Customer>[]>(
    () => [
      {
        accessorKey: "Name",
        header: ({ column }) => (
          <div>
            <div>Name</div>
            <Input
              placeholder="Filter names..."
              value={(column.getFilterValue() as string) ?? ""}
              onChange={(e) => column.setFilterValue(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              size="small"
              style={{ marginTop: 4, width: "100%" }}
            />
          </div>
        ),
        size: 200,
        enableColumnFilter: true,
      },
      {
        accessorKey: "TenantName",
        header: ({ column }) => (
          <div>
            <div>Tenant Name</div>
            <Input
              placeholder="Filter tenant names..."
              value={(column.getFilterValue() as string) ?? ""}
              onChange={(e) => column.setFilterValue(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              size="small"
              style={{ marginTop: 4, width: "100%" }}
            />
          </div>
        ),
        size: 180,
        enableColumnFilter: true,
      },
      {
        accessorKey: "TenantDomain",
        header: ({ column }) => (
          <div>
            <div>Tenant Domain</div>
            <Input
              placeholder="Filter domains..."
              value={(column.getFilterValue() as string) ?? ""}
              onChange={(e) => column.setFilterValue(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              size="small"
              style={{ marginTop: 4, width: "100%" }}
            />
          </div>
        ),
        size: 200,
        enableColumnFilter: true,
      },
      {
        accessorKey: "SharePointDomain",
        header: ({ column }) => (
          <div>
            <div>SharePoint Domain</div>
            <Input
              placeholder="Filter SP domains..."
              value={(column.getFilterValue() as string) ?? ""}
              onChange={(e) => column.setFilterValue(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              size="small"
              style={{ marginTop: 4, width: "100%" }}
            />
          </div>
        ),
        size: 200,
        enableColumnFilter: true,
      },
      {
        accessorKey: "RingName",
        header: ({ column }) => (
          <div>
            <div>Ring</div>
            <Select
              placeholder="Filter rings..."
              value={(column.getFilterValue() as string) ?? ""}
              onChange={(value) => column.setFilterValue(value === "" ? undefined : value)}
              onClick={(e) => e.stopPropagation()}
              size="small"
              style={{ marginTop: 4, width: "100%" }}
              options={ringOptions}
              allowClear
              dropdownStyle={{
                backgroundColor: "#1d1c1c",
                border: "1px solid #434343",
              }}
            />
          </div>
        ),
        size: 120,
        enableColumnFilter: true,
        cell: ({ getValue }) => getValue() || "—",
      },
      {
        accessorKey: "ClientId",
        header: ({ column }) => (
          <div>
            <div>Client ID</div>
            <Input
              placeholder="Filter client IDs..."
              value={(column.getFilterValue() as string) ?? ""}
              onChange={(e) => column.setFilterValue(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              size="small"
              style={{ marginTop: 4, width: "100%" }}
            />
          </div>
        ),
        size: 150,
        enableColumnFilter: true,
        cell: ({ getValue }) => {
          const value = getValue() as string;
          return value ? (
            <span title={value} style={{ fontFamily: "monospace", fontSize: "12px" }}>
              {value.substring(0, 8)}...
            </span>
          ) : "—";
        },
      },
      {
        accessorKey: "CreatedOn",
        header: "Created On",
        size: 120,
        enableColumnFilter: false,
        cell: ({ getValue }) => {
          const dateStr = getValue() as string;
          if (dateStr === "0001-01-01T00:00:00Z") return "—";
          return new Date(dateStr).toLocaleDateString();
        },
      },
      {
        accessorKey: "ModifiedOn",
        header: "Modified On",
        size: 120,
        enableColumnFilter: false,
        cell: ({ getValue }) => {
          const dateStr = getValue() as string;
          if (dateStr === "0001-01-01T00:00:00Z") return "—";
          return new Date(dateStr).toLocaleDateString();
        },
      },
      {
        accessorKey: "CreatedByName",
        header: ({ column }) => (
          <div>
            <div>Created By</div>
            <Input
              placeholder="Filter creators..."
              value={(column.getFilterValue() as string) ?? ""}
              onChange={(e) => column.setFilterValue(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              size="small"
              style={{ marginTop: 4, width: "100%" }}
            />
          </div>
        ),
        size: 150,
        enableColumnFilter: true,
        cell: ({ getValue }) => getValue() || "—",
      },
    ],
    [ringOptions]
  );

  const table = useReactTable({
    data: customers,
    columns,
    pageCount: Math.ceil(totalCount / pagination.pageSize),
    state: {
      sorting,
      columnFilters,
      pagination,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["customers"] });
    refetch();
  };

  const handleSearch = (value: string) => {
    setGlobalFilter(value);
    setPagination({ ...pagination, pageIndex: 0 });
  };

  if (error) {
    return (
      <Card title="Customers" style={{ margin: 0 }}>
        <Alert
          message="Error loading customers"
          description={error.message}
          type="error"
          showIcon
          action={
            <Button size="small" onClick={handleRefresh}>
              Retry
            </Button>
          }
        />
      </Card>
    );
  }

  return (
    <Card title="Customers" style={{ margin: 0 }}>
      <Space direction="vertical" size="middle" style={{ display: "flex" }}>
        {/* Search and Actions */}
        <Space>
          <Input.Search
            placeholder="Search customers by name, tenant name or domain"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            onSearch={handleSearch}
            onPressEnter={() => handleSearch(globalFilter)}
            style={{ width: 350 }}
            enterButton={<SearchOutlined />}
            loading={isFetching}
          />
          <Button 
            icon={<ReloadOutlined />} 
            onClick={handleRefresh}
            loading={isLoading || isFetching}
          >
            Refresh
          </Button>
        </Space>

        {/* Loading Spinner */}
        {isLoading && (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <Spin size="large" />
          </div>
        )}

        {/* Table */}
        {!isLoading && (
          <div style={{ overflow: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                border: "1px solid #434343",
                borderRadius: "6px",
                backgroundColor: "#1d1c1c",
              }}
            >
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} style={{ backgroundColor: "#1d1c1c" }}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        style={{
                          padding: "8px 12px",
                          textAlign: "left",
                          borderBottom: "1px solid #434343",
                          borderRight: "1px solid #434343",
                          cursor: header.column.getCanSort() ? "pointer" : "default",
                          userSelect: "none",
                          width: header.getSize(),
                          color: "#ffffff",
                          backgroundColor: "#1d1c1c",
                          fontWeight: "600",
                          verticalAlign: "top",
                          minHeight: "80px",
                        }}
                        onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && (
                            <span style={{ opacity: 0.7, color: "#326c39" }}>
                              {{
                                asc: " ↑",
                                desc: " ↓",
                              }[header.column.getIsSorted() as string] ?? " ↕"}
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {isFetching && (
                  <tr>
                    <td 
                      colSpan={columns.length} 
                      style={{ 
                        textAlign: "center", 
                        padding: "20px",
                        backgroundColor: "#1d1c1c",
                        color: "#ffffff"
                      }}
                    >
                      <Spin />
                    </td>
                  </tr>
                )}
                {!isFetching &&
                  table.getRowModel().rows.map((row, index) => (
                    <tr 
                      key={row.id} 
                      style={{ 
                        borderBottom: "1px solid #434343",
                        backgroundColor: index % 2 === 0 ? "#1d1c1c" : "#252424",
                        transition: "background-color 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#2d2c2c";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = index % 2 === 0 ? "#1d1c1c" : "#252424";
                      }}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          style={{
                            padding: "12px 16px",
                            borderRight: "1px solid #434343",
                            maxWidth: cell.column.getSize(),
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            color: "#ffffff",
                          }}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 0",
                borderTop: "1px solid #434343",
                backgroundColor: "#1d1c1c",
                color: "#ffffff",
              }}
            >
              <div style={{ color: "#ffffff" }}>
                Showing {pagination.pageIndex * pagination.pageSize + 1} to{" "}
                {Math.min((pagination.pageIndex + 1) * pagination.pageSize, totalCount)} of{" "}
                {totalCount} customers
              </div>
              <Space>
                <Button
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                  size="small"
                >
                  {"<<"}
                </Button>
                <Button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  size="small"
                >
                  {"<"}
                </Button>
                <span style={{ margin: "0 8px", color: "#ffffff" }}>
                  Page {pagination.pageIndex + 1} of {table.getPageCount()}
                </span>
                <Button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  size="small"
                >
                  {">"}
                </Button>
                <Button
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                  size="small"
                >
                  {">>"}
                </Button>
                <select
                  value={pagination.pageSize}
                  onChange={(e) => {
                    table.setPageSize(Number(e.target.value));
                  }}
                  style={{ 
                    marginLeft: "8px", 
                    padding: "4px 8px",
                    backgroundColor: "#1d1c1c",
                    color: "#ffffff",
                    border: "1px solid #434343",
                    borderRadius: "4px",
                  }}
                >
                  {[10, 20, 50, 100].map((pageSize) => (
                    <option key={pageSize} value={pageSize} style={{ backgroundColor: "#1d1c1c", color: "#ffffff" }}>
                      Show {pageSize}
                    </option>
                  ))}
                </select>
              </Space>
            </div>
          </div>
        )}
      </Space>
    </Card>
  );
}