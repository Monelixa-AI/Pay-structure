import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kullanım Şartları | Monelixa',
  description: 'Monelixa kullanım şartları ve koşulları.',
};

export default function TermsPage() {
  return (
    <div className="pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Kullanım Şartları
          </h1>
          <p className="text-gray-400">
            Son güncelleme: {new Date().toLocaleDateString('tr-TR')}
          </p>
        </div>
        <div className="prose prose-invert prose-lg max-w-none">
          <div className="space-y-8 text-gray-300">
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">
                1. Genel Şartlar
              </h2>
              <p>
                Bu web sitesini kullanarak, bu kullanım şartlarını kabul etmiş
                olursunuz. Bu şartları kabul etmiyorsanız, lütfen sitemizi
                kullanmayın.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">
                2. Hesap Oluşturma
              </h2>
              <p>
                Hizmetlerimizi kullanmak için bir hesap oluşturmanız gerekebilir.
                Hesap bilgilerinizin doğruluğundan ve güvenliğinden siz
                sorumlusunuz.
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2">
                <li>Doğru ve güncel bilgiler sağlamalısınız</li>
                <li>Şifrenizi gizli tutmalısınız</li>
                <li>Hesabınızdaki tüm aktivitelerden sorumlusunuz</li>
              </ul>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">
                3. Ödeme ve İade
              </h2>
              <p>
                Ödemeler Stripe ve PayTR üzerinden güvenli bir şekilde işlenir.
                İade politikamız:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2">
                <li>7 gün içinde tam iade garantisi</li>
                <li>Dijital ürünlerde indirilmeden önce iade mümkündür</li>
                <li>Abonelikler dönem sonunda iptal edilebilir</li>
              </ul>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">
                4. Fikri Mülkiyet
              </h2>
              <p>
                Sitedeki tüm içerik, tasarım ve materyaller Monelixa'nın
                mülkiyetindedir. İzinsiz kullanım yasaktır.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">
                5. Sorumluluk Sınırlaması
              </h2>
              <p>
                Monelixa, hizmetlerin kesintisiz veya hatasız olacağını garanti
                etmez. Hizmetlerin kullanımından doğan doğrudan veya dolaylı
                zararlardan sorumlu tutulamaz.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">
                6. Değişiklikler
              </h2>
              <p>
                Bu şartları herhangi bir zamanda değiştirme hakkımız saklıdır.
                Değişiklikler sitede yayınlandığı anda yürürlüğe girer.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">
                7. İletişim
              </h2>
              <p>
                Sorularınız için{' '}
                <a
                  href="mailto:info@monelixa.com"
                  className="text-brand-400 hover:underline"
                >
                  info@monelixa.com
                </a>{' '}
                adresinden bize ulaşabilirsiniz.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
