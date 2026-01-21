import { CreditCard, BarChart3, ShieldCheck, Zap } from 'lucide-react';

const features = [
  {
    title: 'Stripe + PayTR',
    description:
      'Global ve yerel ödemeleri tek panelden yönetin. Hemen aktif edin.',
    icon: CreditCard,
  },
  {
    title: 'Gerçek zamanlı raporlar',
    description: 'Gelir, sipariş ve abonelikleri anlık takip edin.',
    icon: BarChart3,
  },
  {
    title: 'Güvenlik odaklı',
    description: 'PCI DSS, SSL ve Cloudflare ile güvenli altyapı.',
    icon: ShieldCheck,
  },
  {
    title: 'Hızlı kurulum',
    description: 'Saatler değil dakikalar içinde yayınlayın.',
    icon: Zap,
  },
];

export default function Features() {
  return (
    <section className="py-16 border-t border-dark-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-white">Neden Monelixa?</h2>
          <p className="text-gray-400 mt-3">
            Satın alma deneyimini hızlandıran ve güveni artıran araçlar.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="p-6 bg-dark-900 border border-dark-700 rounded-2xl hover:border-dark-600 transition-colors"
              >
                <div className="p-3 bg-brand-500/10 rounded-xl inline-flex mb-4">
                  <Icon className="w-6 h-6 text-brand-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-400">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
