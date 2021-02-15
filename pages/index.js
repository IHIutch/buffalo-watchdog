import Head from "next/head";
import supabase from "../util/supabase";
import { useTable, useSortBy } from "react-table";
import Container from "../components/common/container";
import { Table, Tbody, Td, Text, Th, Thead, Tr } from "@chakra-ui/react";
import { useMemo } from "react";

const Home = ({ allegations }) => {
  const columns = useMemo(() => [
    {
      Header: "ID",
      accessor: "id",
    },
    {
      Header: "First Name",
      accessor: "first_name",
    },
    {
      Header: "Last Name",
      accessor: "last_name",
    },
    {
      Header: "Rank",
      accessor: "rank",
    },
    {
      Header: "Unit",
      accessor: "unit",
    },
    {
      Header: "Allegations",
      accessor: "allegations_count",
      Cell: ({ cell: { value } }) => <Text fontWeight="bold">{value}</Text>,
    },
  ]);

  const formattedData = allegations.map((a) => {
    return {
      ...a,
      allegations_count: a.allegations.length,
    };
  });

  const data = useMemo(() => formattedData, formattedData);

  console.log(allegations);

  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Container>
        <div>
          <DataTable columns={columns} data={data} />
        </div>
      </Container>
    </div>
  );
};

const DataTable = ({ columns, data }) => {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable(
    {
      columns,
      data,
    },
    useSortBy
  );
  return (
    <Table {...getTableProps()} size="sm">
      <Thead>
        {headerGroups.map((headerGroup, rIdx) => (
          <Tr key={rIdx} {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column, cIdx) => (
              <Th
                key={cIdx}
                {...column.getHeaderProps(column.getSortByToggleProps())}
              >
                {column.render("Header")}
                <span>
                  {column.isSorted ? (column.isSortedDesc ? "🔽" : "🔼") : ""}
                </span>
              </Th>
            ))}
          </Tr>
        ))}
      </Thead>
      <Tbody {...getTableBodyProps()}>
        {rows.map((row, rIdx) => {
          prepareRow(row);
          return (
            <Tr key={rIdx} {...row.getRowProps()}>
              {row.cells.map((cell, cIdx) => (
                <Td key={cIdx} {...cell.getCellProps()}>
                  {cell.render("Cell")}
                </Td>
              ))}
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
};

export async function getStaticProps(context) {
  const { data, error } = await supabase
    .from("officers")
    .select("*, allegations(*)");

  if (error) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      allegations: data,
    },
  };
}

export default Home;
