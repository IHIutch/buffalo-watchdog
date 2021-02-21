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

const Dispositions = ({ dispositions }) => {
  const columns = useMemo(() => [
    {
      Header: "Name",
      accessor: (originalRow) => ({
        name: originalRow.name,
        slug: originalRow.slug,
      }),
      Cell: ({ value }) => (
        <NextLink href={`/dispositions/${value.slug}`} passHref>
          <Tag as={Link}>{value.name}</Tag>
        </NextLink>
      ),
    },
    {
      Header: "Frequency",
      accessor: "dispositions",
      Cell: ({ value }) => value.length,
    },
  ]);

  const data = useMemo(
    () =>
      dispositions.sort(
        (a, b) => (a.dispositions.length - b.dispositions.length) * -1
      ),
    dispositions
  );

  return (
    <>
      <Head>
        <title>Dispositions</title>
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
                    Dispositions
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
    .from("disposition_types")
    .select(`*, dispositions: allegation_to_disposition(id)`);

  if (error) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      dispositions: data,
    },
  };
}

export default Dispositions;
