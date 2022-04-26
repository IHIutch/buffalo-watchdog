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

const Allegations = ({ allegations }) => {
  const columns = useMemo(
    () => [
      {
        Header: 'Officer',
        accessor: 'officers',
        Cell: ({ value }) => (
          <Box
            as="span"
            whiteSpace="nowrap"
          >{`${value.first_name} ${value.last_name}`}</Box>
        ),
      },
      {
        Header: 'Open Date',
        accessor: 'open_date',
        Cell: ({ value }) => (
          <Box as="span" whiteSpace="nowrap">
            {value ? dayjs(value).format('MMM. DD, YYYY') : 'Unknown'}
          </Box>
        ),
      },
      {
        Header: 'Complaints',
        accessor: 'complaints',
        Cell: ({ value }) => (
          <Wrap>
            {value &&
              value.map((v, idx) => (
                <WrapItem key={idx}>
                  <NextLink href={`/complaints/${v.slug}`} passHref>
                    <Tag whiteSpace="nowrap" as={Link}>
                      {v.label}
                    </Tag>
                  </NextLink>
                </WrapItem>
              ))}
          </Wrap>
        ),
      },
      {
        Header: 'Disposition Date',
        accessor: 'disposition_date',
        Cell: ({ value }) => (
          <Box as="span" whiteSpace="nowrap">
            {value ? dayjs(value).format('MMM. DD, YYYY') : 'Unknown'}
          </Box>
        ),
      },
      {
        Header: 'Dispositions',
        accessor: 'dispositions',
        Cell: ({ value }) => (
          <Wrap spacing="2">
            {value &&
              value.map((v, idx) => (
                <WrapItem key={idx}>
                  <NextLink href={`/dispositions/${v.slug}`} passHref>
                    <Tag whiteSpace="nowrap" as={Link}>
                      {v.label}
                    </Tag>
                  </NextLink>
                </WrapItem>
              ))}
          </Wrap>
        ),
      },
    ],
    []
  )

  const data = useMemo(() => allegations, [allegations])

  return (
    <>
      <Head>
        <title>Allegations</title>
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
                    Overview
                  </Text>
                  <Heading
                    as="h1"
                    fontSize={{ base: '6xl', md: '8xl' }}
                    fontWeight="800"
                    letterSpacing="-0.1rem"
                    mb="4"
                    lineHeight="1"
                  >
                    Allegations
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
              id: 'open_date',
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

export async function getStaticProps() {
  const data = await prisma.allegations.findMany({
    include: {
      officers: true,
      allegation_to_complaint: {
        include: {
          complaint: true,
        },
      },
      allegation_to_disposition: {
        include: {
          disposition: true,
        },
      },
    },
  })

  if (!data) {
    return {
      notFound: true,
    }
  }

  const allegations = data.map((a) => {
    const complaints =
      a?.allegation_to_complaint?.map((ac) => ({
        label: ac?.complaint?.label || null,
        slug: ac?.complaint?.slug || null,
      })) || null

    const dispositions =
      a?.allegation_to_disposition?.map((ad) => ({
        label: ad?.disposition?.label || null,
        slug: ad?.disposition?.slug || null,
      })) || null

    delete a.allegation_to_complaint
    delete a.allegation_to_disposition
    return {
      ...a,
      open_date: a?.open_date?.toISOString() || null,
      disposition_date: a?.disposition_date?.toISOString() || null,
      createdAt: a?.createdAt?.toISOString() || null,
      updatedAt: a?.updatedAt?.toISOString() || null,
      officers: {
        ...a?.officers,
        dob: a?.officers?.dob?.toISOString() || null,
        doa: a?.officers?.doa?.toISOString() || null,
        createdAt: a?.officers?.createdAt?.toISOString() || null,
        updatedAt: a?.officers?.updatedAt?.toISOString() || null,
      },
      complaints,
      dispositions,
    }
  })

  return {
    props: {
      allegations,
    },
  }
}

export default Allegations
