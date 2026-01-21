import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui';
import {
  Target,
  Heart,
  Users,
  Rocket,
  Shield,
  Zap,
  ArrowRight,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Hakkımızda | Monelixa',
  description: 'Monelixa hakkında bilgi edinin. Misyonumuz ve vizyonumuz.',
};

const values = [
  {
    icon: Target,
    title: 'Misyonumuz',
    description:
      'Dijital girişimcilerin ürünlerini kolayca satabilmesi için modern ve güvenli çözümler sunmak.',
  },
  {
    icon: Heart,
    title: 'Değerlerimiz',
    description:
      'Şeffaflık, güvenilirlik ve müşteri memnuniyeti en önemli değerlerimizdir.',
  },
  {
    icon: Rocket,
    title: 'Vizyonumuz',
    description: "Türkiye'nin en güvenilir dijital ürün satış platformu olmak.",
  },
];

const team = [
  {
    name: 'Ahmet Yılmaz',
    role: 'Kurucu & CEO',
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    name: 'Zeynep Kaya',
    role: 'CTO',
    image: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  {
    name: 'Mehmet Demir',
    role: 'Ürün Müdürü',
    image: 'https://randomuser.me/api/portraits/men/67.jpg',
  },
  {
    name: 'Ayşe Özkan',
    role: 'Müşteri Başarısı',
    image: 'https://randomuser.me/api/portraits/women/68.jpg',
  },
];

export default function AboutPage() {
  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="inline-block px-4 py-1 rounded-full bg-brand-500/10 text-brand-400 text-sm font-medium mb-4">
            Hakkımızda
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Dijital Dönüşümün
            <span className="text-brand-500"> Ortağınız</span>
          </h1>
          <p className="text-xl text-gray-400">
            2024'te kurulan Monelixa, dijital girişimcilerin ürünlerini güvenle
            satabilmeleri için modern çözümler sunar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <div
                key={index}
                className="p-8 bg-dark-900 border border-dark-700 rounded-2xl text-center"
              >
                <div className="inline-flex p-4 bg-brand-500/10 rounded-2xl mb-6">
                  <Icon className="w-8 h-8 text-brand-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-400">{value.description}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-3xl font-bold text-white mb-6">Hikayemiz</h2>
            <div className="space-y-4 text-gray-400">
              <p>
                Monelixa, dijital ürün satışının karmaşıklığından bıkan bir grup
                girişimci tarafından kuruldu. Mevcut çözümlerin ya çok karmaşık
                ya da çok pahalı olduğunu gördük.
              </p>
              <p>
                Amacımız basitti: Herkesin kolayca kullanabileceği, güvenli ve
                uygun fiyatlı bir platform yaratmak. Bugün binlerce girişimci
                Monelixa ile dijital ürünlerini satıyor.
              </p>
              <p>
                Stripe ve PayTR entegrasyonları ile hem global hem de yerel
                pazarlara hitap ediyoruz. 7/24 destek ekibimiz her zaman
                yanınızda.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-8">
              <div>
                <p className="text-4xl font-bold text-brand-500">10K+</p>
                <p className="text-gray-500">Aktif Kullanıcı</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-brand-500">TRY 50M+</p>
                <p className="text-gray-500">İşlenen Ödeme</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-brand-500">99.9%</p>
                <p className="text-gray-500">Uptime</p>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square bg-dark-800 rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-500/20 to-purple-500/20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-9xl font-bold text-dark-700">M</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Ekibimiz</h2>
            <p className="text-gray-400">
              Tutkulu ve yetenekli ekibimizle tanışın.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-4 overflow-hidden rounded-2xl">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-950/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="text-lg font-semibold text-white">{member.name}</h3>
                <p className="text-gray-500 text-sm">{member.role}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center p-12 bg-dark-900 border border-dark-700 rounded-2xl">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Bizimle Çalışmak İster misiniz?
          </h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Ekibimize katılın veya ürünlerinizi Monelixa ile satmaya başlayın.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg">
                Hemen Başla
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="secondary" size="lg">
                İletişime Geç
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
