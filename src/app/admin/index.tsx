import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import Routers from './Routers';

export default function Admin() {
  React.useEffect(() => {
    document.title = 'admin';
  }, []);

  return (
    <BrowserRouter>
      <Routers />
    </BrowserRouter>
  );
}
