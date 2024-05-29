import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import ChatWindow from "./components/ChatWindow/chat-window";
import {Provider} from "react-redux";
import {Store} from "./Redux/store";
import Login from "./components/Login/login";

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
      <Provider store={Store}>
          <Router>
              <Routes>
                  <Route path="/" element={<Login/>} />
                  <Route path="chat" element={<ChatWindow />} />
              </Routes>
          </Router>
          <App/>
      </Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
