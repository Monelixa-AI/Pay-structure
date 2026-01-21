const faqs = [
  {
    question: 'Stripe ve PayTR aynı anda kullanılabilir mi?',
    answer:
      'Evet. Admin panelden iki sağlayıcıyı da aktif edip varsayılanı seçebilirsiniz.',
  },
  {
    question: 'Abonelik iptali nasıl çalışır?',
    answer:
      'İptal dönem sonunda veya anında olacak şekilde ayarlanabilir. Stripe üzerinden otomatik güncellenir.',
  },
  {
    question: 'Fatura ve email bildirimleri var mı?',
    answer:
      'Evet. Başarılı ödeme, abonelik ve iletişim e-postaları otomatik gönderilir.',
  },
  {
    question: 'Kurulum ne kadar sürer?',
    answer:
      'Supabase ve ödeme anahtarlarını girdikten sonra dakikalar içinde hazır olur.',
  },
];

export default function FAQ() {
  return (
    <section className="py-16 border-t border-dark-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white">Sık sorulanlar</h2>
          <p className="text-gray-400 mt-3">
            Kısa yanıtlarla en çok sorulan konular.
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
