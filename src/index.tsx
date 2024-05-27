import {createRoot} from 'react-dom/client';

import App from './App';
import {migrate} from './scene/migrate';

migrate().then(() => {
  createRoot(document.getElementById('root')!).render(<App />);
});
