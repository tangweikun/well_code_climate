import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import Routers from './Routers';

export default function Admin() {
  return (
    <BrowserRouter>
      <Routers />
    </BrowserRouter>
  );
}
