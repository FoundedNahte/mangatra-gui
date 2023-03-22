import type { AppProps } from "next/app";

import "../styles/style.css";
import "../styles/App.css";
import "../styles/Test.css";
import { ChakraProvider } from "@chakra-ui/react";

// This default export is required in a new `pages/_app.js` file.
export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <Component {...pageProps} />
    </ChakraProvider>
  );
}
