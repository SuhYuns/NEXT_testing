
export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-white rounded-lg py-10 shadow">
        {children}
    </div>
  );
}
