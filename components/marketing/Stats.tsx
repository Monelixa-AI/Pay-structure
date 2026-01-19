const stats = [
  { label: 'Aktif magaza', value: '2.4K+' },
  { label: 'Toplam odeme', value: 'TRY 180M+' },
  { label: 'Uptime', value: '99.9%' },
  { label: 'Destek hizi', value: '< 2 dk' },
];

export default function Stats() {
  return (
    <section className="py-16 border-t border-dark-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="p-6 bg-dark-900 border border-dark-700 rounded-2xl text-center"
            >
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
