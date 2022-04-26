import { useMemo } from 'react'
import Head from 'next/head'
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
import { useTable, useSortBy } from 'react-table'
import NextLink from 'next/link'
import Navbar from '@/components/common/navbar'
import slugify from 'slugify'
import prisma from '@/lib/prisma'

const Home = ({ officers }) => {
  const columns = useMemo(
    () => [
      {
        Header: 'Name',
        accessor: (originalRow) => ({
          name: `${originalRow.first_name} ${originalRow.last_name}`,
          slug: slugify(`${originalRow.first_name} ${originalRow.last_name}`, {
            lower: true,
            strict: true,
          }),
        }),
        Cell: ({ value }) => (
          <NextLink href={`/officers/${value.slug}`} passHref>
            <Tag whiteSpace="nowrap" as={Link}>
              {value.name}
            </Tag>
          </NextLink>
        ),
      },
      {
        Header: 'Rank',
        accessor: 'rank',
      },
      {
        Header: 'Unit',
        accessor: 'unit',
      },
      {
        Header: 'Allegations',
        accessor: 'allegations_count',
        Cell: ({ value }) => (
          <Text as="span" fontWeight="bold">
            {value}
          </Text>
        ),
      },
    ],
    []
  )

  const formattedData = officers.map((o) => {
    return {
      ...o,
      allegations_count: o.allegations.length,
    }
  })

  const data = useMemo(() => formattedData, [formattedData])

  return (
    <>
      <Head>
        <title>Buffalo Watchdog</title>
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

const DataTable = ({ columns, data, sx }) => {
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable(
      {
        columns,
        data,
        initialState: {
          sortBy: [
            {
              id: 'allegations_count',
              desc: true,
            },
          ],
        },
      },
      useSortBy
    )
  return (
    <Table {...getTableProps()} size="sm" w="100%" sx={sx}>
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
  const data = await prisma.officers.findMany({
    include: {
      allegations: true,
    },
  })

  if (!data) {
    return {
      notFound: true,
    }
  }

  const officers = data.map((o) => {
    return {
      ...o,
      dob: o?.dob?.toISOString() || null,
      doa: o?.doa?.toISOString() || null,
      createdAt: o?.createdAt?.toISOString() || null,
      updatedAt: o?.updatedAt?.toISOString() || null,
      allegations: o?.allegations?.map((a) => {
        return {
          ...a,
          open_date: a?.open_date?.toISOString() || null,
          disposition_date: a?.disposition_date?.toISOString() || null,
          createdAt: a?.createdAt?.toISOString() || null,
          updatedAt: a?.updatedAt?.toISOString() || null,
        }
      }),
    }
  })

  return {
    props: {
      officers,
    },
  }
}

export default Home
