import "~/styles/globals.css";
import type { AppProps } from "next/app";
import { ThemeProvider } from "~/components/shared/theme-provider";
import Navigation from "~/components/shared/Navigation";
import { Toaster } from "~/components/ui/toaster";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <Navigation />
        <Toaster />
        <Component {...pageProps} />
      </ThemeProvider>
    </>
  );
}
