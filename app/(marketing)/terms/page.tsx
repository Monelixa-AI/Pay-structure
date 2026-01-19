import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kullanim Sartlari | Monelixa',
  description: 'Monelixa kullanim sartlari ve kosullari.',
};

export default function TermsPage() {
  return (
    <div className="pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Kullanim Sartlari
          </h1>
          <p className="text-gray-400">
            Son guncelleme: {new Date().toLocaleDateString('tr-TR')}
          </p>
        </div>
        <div className="prose prose-invert prose-lg max-w-none">
          <div className="space-y-8 text-gray-300">
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">
                1. Genel Sartlar
              </h2>
              <p>
                Bu web sitesini kullanarak, bu kullanim sartlarini kabul etmis
                olursunuz. Bu sartlari kabul etmiyorsaniz, lutfen sitemizi
                kullanmayin.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">
                2. Hesap Olusturma
              </h2>
              <p>
                Hizmetlerimizi kullanmak icin bir hesap olusturmaniz gerekebilir.
                Hesap bilgilerinizin dogrulugundan ve guvenliginden siz
                sorumlusunuz.
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2">
                <li>Dogru ve guncel bilgiler saglamalisiniz</li>
                <li>Sifrenizi gizli tutmalisiniz</li>
                <li>Hesabinizdaki tum aktivitelerden sorumlusunuz</li>
              </ul>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">
                3. Odeme ve Iade
              </h2>
              <p>
                Odemeler Stripe ve PayTR uzerinden guvenli bir sekilde islenir.
                Iade politikamiz:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2">
                <li>7 gun icinde tam iade garantisi</li>
                <li>Dijital urunlerde indirilmeden once iade mumkundur</li>
                <li>Abonelikler donem sonunda iptal edilebilir</li>
              </ul>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">
                4. Fikri Mulkiyet
              </h2>
              <p>
                Sitedeki tum icerik, tasarim ve materyaller Monelixa'nin
                mulkiyetindedir. Izinsiz kullanim yasaktir.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">
                5. Sorumluluk Sinirlamasi
              </h2>
              <p>
                Monelixa, hizmetlerin kesintisiz veya hatasiz olacagini garanti
                etmez. Hizmetlerin kullanimindan dogan dogrudan veya dolayli
                zararlardan sorumlu tutulamaz.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">
                6. Degisiklikler
              </h2>
              <p>
                Bu sartlari herhangi bir zamanda degistirme hakkimiz saklidir.
                Degisiklikler sitede yayinlandigi anda yururluge girer.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">
                7. Iletisim
              </h2>
              <p>
                Sorulariniz icin{' '}
                <a
                  href="mailto:info@monelixa.com"
                  className="text-brand-400 hover:underline"
                >
                  info@monelixa.com
                </a>{' '}
                adresinden bize ulasabilirsiniz.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
