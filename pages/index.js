import Head from "next/head";
import supabase from "../util/supabase";
import { useTable, useSortBy } from "react-table";
import Container from "../components/common/container";
import {
  Box,
  Grid,
  GridItem,
  Heading,
  Link,
  Table,
  Tag,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { useMemo } from "react";
import NextLink from "next/link";
import Navbar from "@/components/common/navbar";

const Home = ({ allegations }) => {
  const columns = useMemo(() => [
    {
      Header: "Name",
      accessor: (originalRow) => ({
        name: `${originalRow.first_name} ${originalRow.last_name}`,
        slug: originalRow.slug,
      }),
      Cell: ({ value }) => (
        <NextLink href={`/officers/${value.slug}`} passHref>
          <Tag as={Link}>{value.name}</Tag>
        </NextLink>
      ),
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
      Cell: ({ value }) => (
        <Text as="span" fontWeight="bold">
          {value}
        </Text>
      ),
    },
  ]);

  const formattedData = allegations.map((a) => {
    return {
      ...a,
      allegations_count: a.allegations.length,
    };
  });

  const data = useMemo(() => formattedData, formattedData);

  return (
    <>
      <Head>
        <title>Buffalo Watchdog</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box>
        <Navbar />
        <Container>
          <Box pt="24" pb="12">
            <Grid templateColumns="repeat(12, 1fr)" gap="6">
              <GridItem colSpan="8">
                <Box mb="24">
                  <Text
                    fontWeight="semibold"
                    fontSize="2xl"
                    textTransform="uppercase"
                    color="gray.400"
                    letterSpacing="0.125rem"
                    lineHeight="0.5"
                    mb="4"
                  >
                    Overview
                  </Text>
                  <Heading
                    as="h1"
                    fontSize="8xl"
                    fontWeight="800"
                    letterSpacing="-0.1rem"
                    mb="4"
                    lineHeight="1"
                  >
                    Buffalo Watchdog
                  </Heading>
                  <Text color="gray.700" fontSize="2xl">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                    do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua.
                  </Text>
                </Box>
              </GridItem>
            </Grid>
            <DataTable columns={columns} data={data} />
          </Box>
        </Container>
      </Box>
    </>
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
            id: "allegations_count",
            desc: true,
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
