'use client';

import React from 'react';
import styles from './page.module.css';
import QRCodeGenerator from '@/components/QRCodeGenerator';

export default function Home() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={`${styles.title} gradient-text`}>QR Code Generator</h1>
        <p className={styles.subtitle}>
          Create customized QR codes for text, links, and contact info instantly. Completely free and highly customizable.
        </p>
      </header>

      <main className={styles.main}>
        <QRCodeGenerator />
      </main>

      <footer className={styles.footer}>
        <p>&copy; {new Date().getFullYear()} QR Code Generator. Built with ❤️ by Priyansh Patel.</p>
      </footer>
    </div>
  );
}
