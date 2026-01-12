export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center animated-gradient noise">
      <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-chart-2/5" />
      {children}
    </div>
  );
}
