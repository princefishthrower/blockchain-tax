import React from 'react';
import ReactDOM from 'react-dom';
import './normalize.css';
import './index.css';
import 'semantic-ui-css/semantic.min.css';
import 'font-awesome/css/font-awesome.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
