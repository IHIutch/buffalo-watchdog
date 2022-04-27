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

const ComplaintType = ({ complaint }) => {
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
        Header: 'Dispositions',
        accessor: 'allegation.dispositions',
        Cell: ({ value }) => (
          <Wrap>
            {value?.map((v, idx) => (
              <WrapItem key={idx}>
                <NextLink href={`/dispositions/${v.slug}`} passHref>
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
  const data = useMemo(() => complaint.allegations, [complaint.allegations])

  return (
    <>
      <Head>
        <title>{complaint.label}</title>
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
                    Complaint
                  </Text>
                  <Heading
                    as="h1"
                    fontSize={{ base: '6xl', md: '8xl' }}
                    fontWeight="800"
                    letterSpacing="-0.1rem"
                    mb="4"
                    lineHeight="1"
                  >
                    {complaint.label}
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
  const data = await prisma.complaint_types.findMany()
  const paths = data.map((c) => ({
    params: { slug: c.slug },
  }))

  return { paths, fallback: false }
}

export async function getStaticProps({ params }) {
  const data = await prisma.complaint_types.findFirst({
    include: {
      allegation_to_complaint: {
        include: {
          allegation: {
            include: {
              officers: true,
              allegation_to_disposition: {
                include: {
                  disposition: true,
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

  const complaint = {
    slug: data.slug,
    label: data.label,
    createdAt: data.createdAt?.toISOString() || null,
    updatedAt: data.updatedAt?.toISOString() || null,
    allegations: data.allegation_to_complaint.map((ac) => {
      const dispositions =
        ac?.allegation?.allegation_to_disposition.map((ad) => ({
          label: ad?.disposition?.label || null,
          slug: ad?.disposition?.slug || null,
        })) || null

      delete ac?.allegation?.allegation_to_disposition

      return {
        ...ac,
        createdAt: ac?.createdAt?.toISOString() || null,
        updatedAt: ac?.updatedAt?.toISOString() || null,
        allegation: {
          ...ac?.allegation,
          dispositions,
          open_date: ac?.allegation?.open_date?.toISOString() || null,
          disposition_date:
            ac?.allegation?.disposition_date?.toISOString() || null,
          createdAt: ac?.allegation?.createdAt?.toISOString() || null,
          updatedAt: ac?.allegation?.updatedAt?.toISOString() || null,
          officers: {
            ...ac?.allegation?.officers,
            dob: ac?.allegation?.officers.dob?.toISOString() || null,
            doa: ac?.allegation?.officers.doa?.toISOString() || null,
            createdAt:
              ac?.allegation?.officers.createdAt?.toISOString() || null,
            updatedAt:
              ac?.allegation?.officers.updatedAt?.toISOString() || null,
          },
        },
      }
    }),
  }

  return {
    props: {
      complaint,
    },
  }
}

export default ComplaintType
