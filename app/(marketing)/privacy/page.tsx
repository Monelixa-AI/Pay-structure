import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gizlilik Politikasi | Monelixa',
  description: 'Monelixa gizlilik politikasi ve veri koruma uygulamalari.',
};

export default function PrivacyPage() {
  return (
    <div className="pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Gizlilik Politikasi
          </h1>
          <p className="text-gray-400">
            Son guncelleme: {new Date().toLocaleDateString('tr-TR')}
          </p>
        </div>
        <div className="prose prose-invert prose-lg max-w-none">
          <div className="space-y-8 text-gray-300">
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">
                1. Topladigimiz Bilgiler
              </h2>
              <p>
                Hizmetlerimizi saglamak icin asagidaki bilgileri toplariz:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2">
                <li>Ad, e-posta adresi gibi kimlik bilgileri</li>
                <li>Odeme bilgileri (kart bilgileri saklanmaz)</li>
                <li>Kullanim verileri ve cerezler</li>
                <li>Cihaz ve tarayici bilgileri</li>
              </ul>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">
                2. Bilgilerin Kullanimi
              </h2>
              <p>Topladigimiz bilgileri su amaclarla kullaniriz:</p>
              <ul className="list-disc list-inside mt-4 space-y-2">
                <li>Hizmetlerimizi saglamak ve gelistirmek</li>
                <li>Odemeleri islemek</li>
                <li>Musteri destegi sunmak</li>
                <li>Pazarlama iletisimleri (izninizle)</li>
                <li>Guvenlik ve dolandiricilik onleme</li>
              </ul>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">
                3. Bilgi Paylasimi
              </h2>
              <p>
                Kisisel bilgilerinizi ucuncu taraflarla satmayiz. Yalnizca su
                durumlar icin paylasiriz:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2">
                <li>Odeme isleyicileri (Stripe, PayTR)</li>
                <li>Yasal yukumlulukler</li>
                <li>Izniniz oldugunda</li>
              </ul>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">
                4. Veri Guvenligi
              </h2>
              <p>
                Verilerinizi korumak icin endustri standardi guvenlik onlemleri
                uyguluyoruz:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2">
                <li>256-bit SSL sifreleme</li>
                <li>Guvenli veri merkezleri</li>
                <li>Duzenli guvenlik denetimleri</li>
                <li>Erisim kontrolu</li>
              </ul>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">5. Cerezler</h2>
              <p>
                Sitemiz islevsellik ve analitik icin cerezler kullanir. Tarayici
                ayarlarinizdan cerezleri yonetebilirsiniz.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">
                6. KVKK Haklari
              </h2>
              <p>
                6698 sayili KVKK kapsaminda asagidaki haklara sahipsiniz:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2">
                <li>Verilerinize erisim hakki</li>
                <li>Duzeltme talep etme hakki</li>
                <li>Silme talep etme hakki</li>
                <li>Islemeye itiraz hakki</li>
                <li>Veri tasinabilirligi hakki</li>
              </ul>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">7. Iletisim</h2>
              <p>
                Gizlilik ile ilgili sorulariniz icin{' '}
                <a
                  href="mailto:privacy@monelixa.com"
                  className="text-brand-400 hover:underline"
                >
                  privacy@monelixa.com
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
