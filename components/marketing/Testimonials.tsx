const testimonials = [
  {
    name: 'Deniz K.',
    role: 'SaaS Kurucusu',
    quote:
      'Ödeme altyapısını 1 günde kurduk. Abonelik takibi ve raporlar çok net.',
  },
  {
    name: 'Emre T.',
    role: 'Dijital Üretici',
    quote:
      'Tek seferlik ürünlerde iade ve bildirimleri sorunsuz yönetiyoruz.',
  },
  {
    name: 'Buse S.',
    role: 'Eğitim Platformu',
    quote:
      'Stripe + PayTR ikilisini tek panelden yönetmek büyük rahatlık.',
  },
];

export default function Testimonials() {
  return (
    <section className="py-16 border-t border-dark-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-white">
            Kullanıcılarımız ne diyor?
          </h2>
          <p className="text-gray-400 mt-3">
            Gerçek müşteri deneyimleri ile güveninizi kazanıyoruz.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((item) => (
            <div
              key={item.name}
              className="p-6 bg-dark-900 border border-dark-700 rounded-2xl"
            >
              <p className="text-sm text-gray-300 leading-relaxed">
                "{item.quote}"
              </p>
              <div className="mt-4">
                <p className="text-white font-semibold">{item.name}</p>
                <p className="text-xs text-gray-500">{item.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
