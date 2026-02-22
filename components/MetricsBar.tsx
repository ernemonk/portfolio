const metrics = [
  { label: "Owned Ventures", value: "6+" },
  { label: "Projects Built", value: "10+" },
  { label: "Systems in Production", value: "Active" },
  { label: "Years Building", value: "5+" },
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
