export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    /* Full-screen overlay sits above the public nav/footer */
    <div className="fixed inset-0 z-[200] bg-[#0a0a0a] overflow-hidden">
      {children}
    </div>
  );
}
