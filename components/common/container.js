import React from "react";
import { Box } from "@chakra-ui/react";

const Sontainer = ({ children, sx }) => {
  const containerWidths = ["100%", "640px", "768px", "1024px", "1280px"];
  return (
    <Box sx={sx} maxW={[...containerWidths]} mx="auto" px="4">
      {children}
    </Box>
  );
};

export default Sontainer;
