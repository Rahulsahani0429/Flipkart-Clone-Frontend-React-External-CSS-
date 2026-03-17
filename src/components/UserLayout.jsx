import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const UserLayout = () => {
  return (
    <>
      <Header />
      <main style={{ overflowX: 'hidden', maxWidth: '100vw', width: '100%', paddingTop: '115px' }}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default UserLayout;
