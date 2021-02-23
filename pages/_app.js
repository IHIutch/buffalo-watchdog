import { ChakraProvider } from "@chakra-ui/react";
import PlausibleProvider from "next-plausible";

const MyApp = ({ Component, pageProps }) => (
  <PlausibleProvider domain="buffalo-watchdog.vercel.app">
    <ChakraProvider>
      <Component {...pageProps} />
    </ChakraProvider>
  </PlausibleProvider>
);

export default MyApp;
