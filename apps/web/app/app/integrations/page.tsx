import { IntegrationsView } from './view';
export default function Integrations() { return <IntegrationsView microsoft={!!process.env.MS_CLIENT_ID} />; }
