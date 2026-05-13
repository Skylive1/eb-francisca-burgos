import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

interface MainLayoutProps {
  children: React.ReactNode;
  isScrolled: boolean;
}

const MainLayout = ({ children, isScrolled }: MainLayoutProps) => (
  <div className="flex flex-col min-h-screen">
    <Navbar isScrolled={isScrolled} />
    <main className="flex-grow">
      {children}
    </main>
    <Footer />
  </div>
);

export default MainLayout;
