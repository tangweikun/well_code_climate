import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import 'normalize.css';
import '../index.scss';
import Routers from './Routers';
import GlobalProvider from '../GlobalProvider';
import OptionsProvider from '../OptionsProvider';

export default function WellcomSchool() {
  return (
    <BrowserRouter>
      <GlobalProvider>
        <OptionsProvider>
          <Routers />
        </OptionsProvider>
      </GlobalProvider>
    </BrowserRouter>
  );
}
