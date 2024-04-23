export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col items-center text-center justify-center h-full">
      {children}
    </section>
  );
}
