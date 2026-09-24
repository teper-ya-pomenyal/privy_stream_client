import { Logo } from '../ui';
import s from './screens.module.css';

/** Веб-версия без узла в config.json: подключаться некуда. */
export function ConfigError({ reason }: { reason: string }) {
  return (
    <div className={s.configError}>
      <Logo />
      <div className={s.configErrorBody}>
        <div className="t-eyebrow">ВЕБ-ВЕРСИЯ НЕ НАСТРОЕНА</div>
        <h1 className={s.configErrorTitle}>Узел не указан</h1>
        <p className={s.pitchText}>
          Эта копия privy_stream не знает, к какому узлу подключаться. Администратору: задайте переменную окружения
          контейнера <code className={s.code}>PRIVY_NODE_URL</code> и перезапустите его.
        </p>
        <div className={s.techLine}>config.json · {reason}</div>
      </div>
    </div>
  );
}
