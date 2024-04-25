export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col items-center text-center justify-start h-full">
      {children}
    </section>
  );
}
