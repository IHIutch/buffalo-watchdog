import Head from "next/head";
import supabase from "../util/supabase";
import { useTable, useSortBy } from "react-table";
import Container from "../components/common/container";
import {
  Box,
  Grid,
  GridItem,
  Heading,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { useMemo } from "react";
import dayjs from "dayjs";

const Allegations = ({ allegations }) => {
  const columns = useMemo(() => [
    {
      Header: "Open Date",
      accessor: "open_date",
      Cell: ({ cell: { value } }) =>
        value ? dayjs(value).format("MMM. DD, YYYY") : "Unknown",
    },
    {
      Header: "Disposition Date",
      accessor: "disposition_date",
      Cell: ({ cell: { value } }) =>
        value ? dayjs(value).format("MMM. DD, YYYY") : "Unknown",
    },
    {
      Header: "Officer",
      accessor: "officers",
      Cell: ({ cell: { value } }) => `${value.first_name} ${value.last_name}`,
    },
    {
      Header: "Complaints",
      accessor: "complaints",
      Cell: ({ cell: { value } }) => (
        <>{value && value.map((v) => <span>{v.complaint_types.name},</span>)}</>
      ),
    },
  ]);

  const data = useMemo(() => allegations, allegations);

  return (
    <div>
      <Head>
        <title>Allegations</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Container>
        <Box>
          <Grid templateColumns="repeat(12, 1fr)" gap="6">
            <GridItem colSpan="8">
              <Box pt="32" pb="24">
                <Text
                  fontWeight="semibold"
                  fontSize="2xl"
                  textTransform="uppercase"
                  color="gray.400"
                  letterSpacing="0.125rem"
                  lineHeight="0.5rem"
                >
                  Overview
                </Text>
                <Heading
                  as="h1"
                  fontSize="8xl"
                  fontWeight="800"
                  letterSpacing="-0.1rem"
                  mb="4"
                >
                  Allegations
                </Heading>
                <Text color="gray.700" fontSize="2xl">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </Text>
              </Box>
            </GridItem>
          </Grid>
          <DataTable columns={columns} data={data} />
        </Box>
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
      initialState: {
        sortBy: [
          {
            id: "open_date",
            desc: false,
          },
        ],
      },
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

export async function getStaticProps() {
  const { data, error } = await supabase.from("allegations").select(`*, 
      officers(*),
      complaints: allegation_to_complaint(*, complaint_types(*))`);

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

export default Allegations;
