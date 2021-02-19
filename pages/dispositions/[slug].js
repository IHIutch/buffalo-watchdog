import Head from "next/head";
import supabase from "@/util/supabase";
import { useTable, useSortBy } from "react-table";
import Container from "@/components/common/container";
import NextLink from "next/link";
import {
  Box,
  Grid,
  GridItem,
  Heading,
  HStack,
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
import dayjs from "dayjs";

const DispositionType = ({ disposition }) => {
  const columns = useMemo(() => [
    {
      Header: "Open Date",
      accessor: "allegation.open_date",
      Cell: ({ value }) =>
        dayjs(value) ? dayjs(value).format("MMM. DD, YYYY") : "Unknown",
    },
    {
      Header: "Officer",
      accessor: "allegation.officer",
      Cell: ({ value }) => `${value.first_name} ${value.last_name}`,
    },
    {
      Header: "Disposition Date",
      accessor: "allegation.disposition_date",
      Cell: ({ value }) =>
        dayjs(value) ? dayjs(value).format("MMM. DD, YYYY") : "Unknown",
    },
    {
      Header: "Complaint",
      accessor: "allegation.complaints",
      Cell: ({ value }) => (
        <HStack>
          {value &&
            value.map((v, idx) => (
              <NextLink
                key={idx}
                href={`/complaints/${v.complaint_type.slug}`}
                passHref
              >
                <Tag as={Link}>{v.complaint_type.name}</Tag>
              </NextLink>
            ))}
        </HStack>
      ),
    },
  ]);
  const dispositions = disposition.dispositions;
  const data = useMemo(() => dispositions, dispositions);

  return (
    <div>
      <Head>
        <title>{disposition.name}</title>
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
                  Disposition
                </Text>
                <Heading
                  as="h1"
                  fontSize="8xl"
                  fontWeight="800"
                  letterSpacing="-0.1rem"
                  mb="4"
                >
                  {disposition.name}
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

export async function getStaticPaths() {
  const { data } = await supabase.from("disposition_types").select("*");

  const paths = data.map((c) => ({
    params: { slug: c.slug },
  }));

  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const { data, error } = await supabase
    .from("disposition_types")
    .select(
      `*, 
      dispositions: allegation_to_disposition(*, allegation: allegations(*, officer: officers(*), complaints: allegation_to_complaint(*, complaint_type: complaint_types(*))))
      `
    )
    .eq("slug", params.slug);

  if (error) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      disposition: data[0],
    },
  };
}

export default DispositionType;
