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

const Complaints = ({ complaints }) => {
  const columns = useMemo(() => [
    {
      Header: "Name",
      accessor: (originalRow) => ({
        name: originalRow.name,
        slug: originalRow.slug,
      }),
      Cell: ({ value }) => (
        <NextLink href={`/complaints/${value.slug}`} passHref>
          <Tag as={Link}>{value.name}</Tag>
        </NextLink>
      ),
    },
    {
      Header: "Frequency",
      accessor: "allegations",
      Cell: ({ value }) => value.length,
    },
  ]);

  const data = useMemo(
    () =>
      complaints.sort(
        (a, b) => (a.allegations.length - b.allegations.length) * -1
      ),
    complaints
  );

  return (
    <>
      <Head>
        <title>Complaints</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box>
        <Navbar />
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
                    Complaints
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
    .from("complaint_types")
    .select(`*, allegations: allegation_to_complaint(id)`);

  if (error) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      complaints: data,
    },
  };
}

export default Complaints;
