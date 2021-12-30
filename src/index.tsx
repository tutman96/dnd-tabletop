import ReactDOM from 'react-dom';

import App from './App';
import { migrate } from './scene/migrate';

migrate().then(() => {
  ReactDOM.render(<App/>, document.getElementById('root'));
})