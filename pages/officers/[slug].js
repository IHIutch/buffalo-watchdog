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
  Link,
  Table,
  Tag,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { useMemo } from "react";
import dayjs from "dayjs";
import Navbar from "@/components/common/navbar";

const Officer = ({ officer }) => {
  const columns = useMemo(() => [
    {
      Header: "Open Date",
      accessor: "open_date",
      Cell: ({ value }) => (
        <Box as="span" whiteSpace="nowrap">
          {value ? dayjs(value).format("MMM. DD, YYYY") : "Unknown"}
        </Box>
      ),
    },
    {
      Header: "Complaints",
      accessor: "complaints",
      Cell: ({ value }) => (
        <Wrap>
          {value &&
            value.map((v, idx) => (
              <WrapItem key={idx}>
                <NextLink
                  href={`/complaints/${v.complaint_type.slug}`}
                  passHref
                >
                  <Tag whiteSpace="nowrap" as={Link}>
                    {v.complaint_type.name}
                  </Tag>
                </NextLink>
              </WrapItem>
            ))}
        </Wrap>
      ),
    },
    {
      Header: "Disposition Date",
      accessor: "disposition_date",
      Cell: ({ value }) => (
        <Box as="span" whiteSpace="nowrap">
          {value ? dayjs(value).format("MMM. DD, YYYY") : "Unknown"}
        </Box>
      ),
    },
    {
      Header: "Dispositions",
      accessor: "dispositions",
      Cell: ({ value }) => (
        <Wrap spacing="2">
          {value &&
            value.map((v, idx) => (
              <WrapItem key={idx}>
                <NextLink
                  href={`/dispositions/${v.disposition_type.slug}`}
                  passHref
                >
                  <Tag whiteSpace="nowrap" as={Link}>
                    {v.disposition_type.name}
                  </Tag>
                </NextLink>
              </WrapItem>
            ))}
        </Wrap>
      ),
    },
  ]);
  const data = useMemo(() => officer.allegations, officer.allegations);

  return (
    <>
      <Head>
        <title>{`${officer.first_name} ${officer.last_name}`}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box>
        <Navbar />
        <Container>
          <Box pt="24" pb="12">
            <Grid templateColumns="repeat(12, 1fr)" gap="6">
              <GridItem colSpan={{ base: "12", md: "8" }}>
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
                    Officer
                  </Text>
                  <Heading
                    as="h1"
                    fontSize={{ base: "6xl", md: "8xl" }}
                    fontWeight="800"
                    letterSpacing="-0.1rem"
                    mb="4"
                    lineHeight="1"
                  >
                    {`${officer.first_name} ${officer.last_name}`}
                  </Heading>
                  <Text color="gray.700" fontSize="2xl">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                    do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua.
                  </Text>
                </Box>
              </GridItem>
            </Grid>
            <Box overflowX="auto" mx="-4">
              <Box px="4">
                <DataTable columns={columns} data={data} />
              </Box>
            </Box>
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
                whiteSpace="nowrap"
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
  const { data } = await supabase.from("officers").select("*");

  const paths = data.map((o) => ({
    params: { slug: o.slug },
  }));

  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const { data, error } = await supabase
    .from("officers")
    .select(
      `*, 
      allegations(*, 
        complaints: allegation_to_complaint(*, complaint_type: complaint_types(*)),
        dispositions: allegation_to_disposition(*, disposition_type: disposition_types(*)))`
    )
    .eq("slug", params.slug)
    .single();

  if (error) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      officer: data,
    },
  };
}

export default Officer;
