import Head from 'next/head'
import { useTable, useSortBy } from 'react-table'
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
} from '@chakra-ui/react'
import { useMemo } from 'react'
import NextLink from 'next/link'
import Navbar from '@/components/common/navbar'
import prisma from '@/lib/prisma'

const Complaints = ({ complaint_types }) => {
  const columns = useMemo(
    () => [
      {
        Header: 'Name',
        accessor: (originalRow) => ({
          label: originalRow.label,
          slug: originalRow.slug,
        }),
        Cell: ({ value }) => (
          <NextLink href={`/complaints/${value.slug}`} passHref>
            <Tag whiteSpace="nowrap" as={Link}>
              {value.label}
            </Tag>
          </NextLink>
        ),
      },
      {
        Header: 'Frequency',
        accessor: '_count.allegation_to_complaint',
        Cell: ({ value }) => value,
      },
    ],
    []
  )

  const data = useMemo(
    () =>
      complaint_types.sort(
        (a, b) =>
          (a._count.allegation_to_complaint -
            b._count.allegation_to_complaint) *
          -1
      ),
    [complaint_types]
  )

  return (
    <>
      <Head>
        <title>Complaints</title>
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
  const data = await prisma.complaint_types.findMany({
    select: {
      id: true,
      label: true,
      slug: true,
      _count: {
        select: {
          allegation_to_complaint: true,
        },
      },
    },
  })

  if (!data) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      complaint_types: data,
    },
  }
}

export default Complaints
