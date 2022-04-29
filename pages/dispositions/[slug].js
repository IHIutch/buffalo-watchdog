import Head from 'next/head'
import { useTable, useSortBy } from 'react-table'
import NextLink from 'next/link'
import {
  Box,
  Container,
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
} from '@chakra-ui/react'
import { useMemo } from 'react'
import dayjs from 'dayjs'
import Navbar from '@/components/common/navbar'
import prisma from '@/lib/prisma'

const DispositionType = ({ disposition }) => {
  const columns = useMemo(
    () => [
      {
        Header: 'Open Date',
        accessor: 'allegation.open_date',
        Cell: ({ value }) =>
          dayjs(value) ? dayjs(value).format('MMM. DD, YYYY') : 'Unknown',
      },
      {
        Header: 'Officer',
        accessor: 'allegation.officers',
        Cell: ({ value }) => `${value.first_name} ${value.last_name}`,
      },
      {
        Header: 'Disposition Date',
        accessor: 'allegation.disposition_date',
        Cell: ({ value }) =>
          dayjs(value) ? dayjs(value).format('MMM. DD, YYYY') : 'Unknown',
      },
      {
        Header: 'Complaints',
        accessor: 'allegation.complaints',
        Cell: ({ value }) => (
          <Wrap>
            {value?.map((v, idx) => (
              <WrapItem key={idx}>
                <NextLink href={`/complaints/${v.slug}`} passHref>
                  <Tag whiteSpace="nowrap" as={Link}>
                    {v.label}
                  </Tag>
                </NextLink>
              </WrapItem>
            )) || 'None'}
          </Wrap>
        ),
      },
    ],
    []
  )
  const data = useMemo(() => disposition.allegations, [disposition.allegations])

  return (
    <>
      <Head>
        <title>{disposition.label}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box>
        <Navbar />
        <Container maxW="container.xl" mx="auto">
          <Box pt="24" pb="12">
            <Grid templateColumns="repeat(12, 1fr)" gap="6">
              <GridItem colSpan={{ base: '12', md: '8' }}>
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
                    Disposition
                  </Text>
                  <Heading
                    as="h1"
                    fontSize={{ base: '6xl', md: '8xl' }}
                    fontWeight="800"
                    letterSpacing="-0.1rem"
                    mb="4"
                    lineHeight="1"
                  >
                    {disposition.label}
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
  )
}

const DataTable = ({ columns, data }) => {
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable(
      {
        columns,
        data,
        initialState: {
          sortBy: [
            {
              id: 'allegation.open_date',
              desc: false,
            },
          ],
        },
      },
      useSortBy
    )
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
                {column.render('Header')}
                <span>
                  {column.isSorted ? (column.isSortedDesc ? '🔽' : '🔼') : ''}
                </span>
              </Th>
            ))}
          </Tr>
        ))}
      </Thead>
      <Tbody {...getTableBodyProps()}>
        {rows.map((row, rIdx) => {
          prepareRow(row)
          return (
            <Tr key={rIdx} {...row.getRowProps()}>
              {row.cells.map((cell, cIdx) => (
                <Td key={cIdx} {...cell.getCellProps()}>
                  {cell.render('Cell')}
                </Td>
              ))}
            </Tr>
          )
        })}
      </Tbody>
    </Table>
  )
}

export async function getStaticPaths() {
  const data = await prisma.disposition_types.findMany()
  const paths = data.map((c) => ({
    params: { slug: c.slug },
  }))

  return { paths, fallback: false }
}

export async function getStaticProps({ params }) {
  const data = await prisma.disposition_types.findFirst({
    select: {
      label: true,
      slug: true,
      allegation_to_disposition: {
        select: {
          allegation: {
            select: {
              open_date: true,
              disposition_date: true,
              officers: {
                select: {
                  first_name: true,
                  last_name: true,
                  slug: true,
                },
              },
              allegation_to_complaint: {
                select: {
                  complaint: {
                    select: {
                      label: true,
                      slug: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    where: { slug: params.slug },
  })

  if (!data) {
    return {
      notFound: true,
    }
  }

  const disposition = {
    slug: data.slug,
    label: data.label,
    allegations: data.allegation_to_disposition.map((ad) => {
      const complaints =
        ad?.allegation?.allegation_to_complaint.map((ac) => ({
          label: ac?.complaint?.label || null,
          slug: ac?.complaint?.slug || null,
        })) || null

      delete ad?.allegation?.allegation_to_complaint

      return {
        ...ad,
        allegation: {
          ...ad?.allegation,
          complaints,
          open_date: ad?.allegation?.open_date?.toISOString() || null,
          disposition_date:
            ad?.allegation?.disposition_date?.toISOString() || null,
        },
      }
    }),
  }

  return {
    props: {
      disposition,
    },
  }
}

export default DispositionType
