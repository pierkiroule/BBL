import React, { useMemo } from 'react';

export default function SessionSettingsSummary({ settings, id, title = 'Réglages de la boucle' }) {
  const items = useMemo(() => {
    if (!settings) return [];
    return [
      { label: 'Durée', value: settings.duration ? `${Math.round(settings.duration / 1000)} s` : 'Non définie' },
      { label: 'Vitesse', value: typeof settings.speed === 'number' ? `${settings.speed.toFixed(2)}x` : '1.00x' },
      { label: 'Ping-pong', value: settings.pingPong ? 'Activé' : 'Désactivé' },
      {
        label: 'Présence',
        value: typeof settings.presence === 'number' ? `${Math.round(settings.presence * 100)}%` : '—',
      },
    ];
  }, [settings]);

  if (!items.length) return null;

  return (
    <section className="session-summary" aria-labelledby={id ? `${id}-title` : undefined} id={id}>
      <div className="session-summary__heading">
        <p className="badge" id={id ? `${id}-title` : undefined}>
          {title}
        </p>
      </div>
      <dl className="session-summary__grid">
        {items.map((item) => (
          <div key={item.label} className="session-summary__item">
            <dt>{item.label}</dt>
            <dd>{item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
