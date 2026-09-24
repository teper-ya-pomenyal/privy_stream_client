/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** app | web — переопределить режим клиента при разработке */
  readonly VITE_CLIENT_MODE?: string;
  /** Узел веб-версии, если config.json нет (только для разработки) */
  readonly VITE_WEB_NODE_URL?: string;
  readonly VITE_WEB_NODE_NAME?: string;
}
