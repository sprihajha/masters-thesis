import "@/styles/globals.css";
import { fontSans } from "@/config/fonts";
import { Providers } from "./providers";
import { Navbar } from "@/components/navbar";
import clsx from "clsx";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={clsx(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <Providers>
          <div className="relative flex flex-col h-full w-full bg-gradient-to-r from-indigo-100">
            <Navbar />
            <main className="container mx-auto h-full flex-grow">
              {children}
            </main>
            {/* TODO: Footer */}
            {/* <footer className="w-full flex items-center justify-center py-3">
							<Link
								isExternal
								className="flex items-center gap-1 text-current"
								href="https://nextui-docs-v2.vercel.app?utm_source=next-app-template"
								title="nextui.org homepage"
							>
								<span className="text-default-600">Powered by</span>
								<p className="text-primary">NextUI</p>
							</Link>
						</footer> */}
          </div>
        </Providers>
      </body>
    </html>
  );
}
