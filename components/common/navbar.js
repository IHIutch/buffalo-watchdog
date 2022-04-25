import {
  Box,
  Flex,
  Heading,
  Link,
  useDisclosure,
  CloseButton,
  Icon,
  background,
} from "@chakra-ui/react";

import NextLink from "next/link";
import { Menu, X } from "react-feather";
import { useRouter } from "next/router";

const Navbar = ({ sx }) => {
  const { pathname } = useRouter();
  const { isOpen, onToggle } = useDisclosure();

  const isPathMatch = (path) => {
    return pathname.includes(path);
  };

  const menuItems = [
    // {
    //   name: "Officers",
    //   path: "/officers",
    // },
    {
      name: "Allegations",
      path: "/allegations",
    },
    {
      name: "Complaints",
      path: "/complaints",
    },
    {
      name: "Dispositions",
      path: "/dispositions",
    },
  ];

  return (
    <Box mt="16">
      <Box
        style={{ backdropFilter: "blur(8px)" }}
        as="nav"
        bg="whiteAlpha.800"
        shadow="sm"
        position="fixed"
        top="0"
        left="0"
        right="0"
        sx={sx}
      >
        <Container maxW="container.lg" mx="auto">
          <Flex wrap="wrap" align="center">
            <Box mr="12">
              <NextLink href="/" passHref>
                <Link
                  d="flex"
                  alignItems="center"
                  px="4"
                  mx="-4"
                  h="16"
                  _hover=""
                  fontSize="lg"
                  fontWeight="bold"
                >
                  Buffalo Watchdog
                </Link>
              </NextLink>
            </Box>
            <CloseButton
              ml="auto"
              d="flex"
              d={{ base: "block", md: "none" }}
              onClick={onToggle}
            >
              <Icon as={isOpen ? X : Menu} h="6" w="6" />
            </CloseButton>
            <Box
              alignItems="stretch"
              h="100%"
              d={{ base: isOpen ? "block" : "none", md: "flex" }}
              w={{ base: "full", md: "auto" }}
            >
              {menuItems.map((link, idx) => (
                <NextLink key={idx} href={link.path} passHref>
                  <Link
                    h="16"
                    d={{ base: "flex", md: "inline-flex" }}
                    sx={
                      isPathMatch(link.path)
                        ? {
                            bg: { base: "black", md: "transparent" },
                            boxShadow: { md: "inset 0 -3px black" },
                            color: { base: "white", md: "black" },
                          }
                        : { color: "gray.500" }
                    }
                    _hover={{ color: { md: "black" } }}
                    rounded={{ base: "md", md: "none" }}
                    fontWeight="medium"
                    alignItems="center"
                    px="4"
                  >
                    {link.name}
                  </Link>
                </NextLink>
              ))}
            </Box>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
};

export default Navbar;
