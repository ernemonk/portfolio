const metrics = [
  { label: "Years Experience", value: "10+" },
  { label: "Enterprise Clients", value: "7+" },
  { label: "Tech Stack", value: "Full" },
  { label: "Currently", value: "AssetMark" },
];

export default function MetricsBar() {
  return (
    <section className="border-y border-white/10 py-12">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
        {metrics.map((m) => (
          <div key={m.label} className="text-center">
            <p className="text-4xl font-bold text-white">{m.value}</p>
            <p className="text-xs text-white/30 mt-2 uppercase tracking-widest font-mono">{m.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
