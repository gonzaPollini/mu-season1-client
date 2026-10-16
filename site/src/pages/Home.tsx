import { Logo, PlatformButtons, Reveal } from '../components/ui';
import { useT } from '../i18n';
import { NewsWidget, StatsBar, TopHours, TopResets } from '../components/Widgets';

/** Home compacta: casi todo entra en el primer pantallazo de escritorio. */
export function Home() {
  const { t } = useT();
  return (
    <div className="wrap home">
      <section className="hero">
        <Logo size="lg" />
        <h1>{t('hero.title1')} <em>{t('hero.title2')}</em></h1>
        <PlatformButtons />
      </section>

      <StatsBar />

      <section className="grid g3 dense">
        <Reveal><TopResets /></Reveal>
        <Reveal delay={80}><TopHours /></Reveal>
        <Reveal delay={160}><NewsWidget /></Reveal>
      </section>
    </div>
  );
}
