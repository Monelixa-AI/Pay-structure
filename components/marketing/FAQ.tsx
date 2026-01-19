const faqs = [
  {
    question: 'Stripe ve PayTR ayni anda kullanilabilir mi?',
    answer:
      'Evet. Admin panelden iki saglayiciyi da aktif edip varsayilani secebilirsiniz.',
  },
  {
    question: 'Abonelik iptali nasil calisir?',
    answer:
      'Iptal donem sonunda veya aninda olacak sekilde ayarlanabilir. Stripe uzerinden otomatik guncellenir.',
  },
  {
    question: 'Fatura ve email bildirimleri var mi?',
    answer:
      'Evet. Basarili odeme, abonelik ve iletisim e-postalari otomatik gonderilir.',
  },
  {
    question: 'Kurulum ne kadar surer?',
    answer:
      'Supabase ve odeme anahtarlarini girdikten sonra dakikalar icinde hazir olur.',
  },
];

export default function FAQ() {
  return (
    <section className="py-16 border-t border-dark-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white">Sik sorulanlar</h2>
          <p className="text-gray-400 mt-3">
            Kisa yanitlarla en cok sorulan konular.
          </p>
        </div>
        <div className="space-y-4">
          {faqs.map((item) => (
            <details
              key={item.question}
              className="bg-dark-900 border border-dark-700 rounded-xl p-4"
            >
              <summary className="cursor-pointer text-white font-medium">
                {item.question}
              </summary>
              <p className="text-gray-400 mt-3 text-sm">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
