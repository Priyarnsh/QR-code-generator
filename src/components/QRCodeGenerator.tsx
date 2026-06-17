'use client';

import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import QRCodeStyling, { DotType, CornerSquareType, CornerDotType } from 'qr-code-styling';
import { Type, Link as LinkIcon, Contact, Wifi, Download, Image as ImageIcon, Palette, Type as TypeIcon, Sliders, ImagePlus, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toPng } from 'html-to-image';
import styles from './QRCodeGenerator.module.css';

type Tab = 'text' | 'link' | 'vcard' | 'wifi';

const Accordion = ({ title, icon, id, expanded, onToggle, children }: any) => {
  const isOpen = expanded === id;
  return (
    <div className={styles.accordionWrapper}>
      <button className={styles.accordionHeader} onClick={() => onToggle(isOpen ? null : id)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {icon} {title}
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <ChevronDown size={18} />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
            style={{ overflow: 'hidden' }}
          >
            <div className={styles.accordionContent}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function QRCodeGenerator() {
  const [activeTab, setActiveTab] = useState<Tab>('link');
  const [expandedSection, setExpandedSection] = useState<string | null>('colors');
  
  // Data States
  const [textValue, setTextValue] = useState('');
  const [linkValue, setLinkValue] = useState('https://example.com');
  const [vcard, setVcard] = useState({ name: '', phone: '', email: '', company: '' });
  const [wifi, setWifi] = useState({ ssid: '', password: '', encryption: 'WPA' });

  // Customization States
  const [fgColor, setFgColor] = useState('#1e293b');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [dotsType, setDotsType] = useState<DotType>('rounded');
  const [cornersSquareType, setCornersSquareType] = useState<CornerSquareType>('extra-rounded');
  const [cornersDotType, setCornersDotType] = useState<CornerDotType>('dot');

  // Text Overlay States
  const [textAbove, setTextAbove] = useState('');
  const [textBelow, setTextBelow] = useState('');
  const [textColor, setTextColor] = useState('#1e293b');

  const qrRef = useRef<HTMLDivElement>(null);
  const qrWrapperRef = useRef<HTMLDivElement>(null);
  const qrCode = useRef<QRCodeStyling | null>(null);

  useEffect(() => {
    qrCode.current = new QRCodeStyling({
      width: 300,
      height: 300,
      imageOptions: {
        crossOrigin: "anonymous",
        margin: 10
      }
    });
    if (qrRef.current) {
      qrCode.current.append(qrRef.current);
    }
  }, []);

  const getQRValue = () => {
    switch (activeTab) {
      case 'text': return textValue || ' ';
      case 'link': return linkValue || 'https://';
      case 'vcard': return `BEGIN:VCARD\nVERSION:3.0\nN:${vcard.name}\nTEL:${vcard.phone}\nEMAIL:${vcard.email}\nORG:${vcard.company}\nEND:VCARD`;
      case 'wifi': return `WIFI:T:${wifi.encryption};S:${wifi.ssid};P:${wifi.password};;`;
      default: return ' ';
    }
  };

  useEffect(() => {
    if (qrCode.current) {
      qrCode.current.update({
        data: getQRValue(),
        dotsOptions: { color: fgColor, type: dotsType },
        cornersSquareOptions: { color: fgColor, type: cornersSquareType },
        cornersDotOptions: { color: fgColor, type: cornersDotType },
        backgroundOptions: { color: bgColor },
        image: logoImage || undefined
      });
    }
  }, [activeTab, textValue, linkValue, vcard, wifi, fgColor, bgColor, logoImage, dotsType, cornersSquareType, cornersDotType]);

  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setLogoImage(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = () => {
    if (qrWrapperRef.current) {
      toPng(qrWrapperRef.current, { cacheBust: true, pixelRatio: 3, backgroundColor: 'transparent' })
        .then((dataUrl) => {
          const link = document.createElement('a');
          link.download = 'glassqr-code.png';
          link.href = dataUrl;
          link.click();
        })
        .catch((err) => {
          console.error('Failed to download QR code', err);
        });
    }
  };

  return (
    <div className={`${styles.wrapper} glass-panel`}>
      <div className={styles.editorPanel}>
        <div className={styles.tabs}>
          {(['link', 'text', 'vcard', 'wifi'] as Tab[]).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button 
                key={tab} 
                className={`${styles.tabBtn} ${isActive ? styles.active : ''}`} 
                onClick={() => setActiveTab(tab)}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className={styles.activeTabBg}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {tab === 'link' && <LinkIcon size={18} />}
                  {tab === 'text' && <Type size={18} />}
                  {tab === 'vcard' && <Contact size={18} />}
                  {tab === 'wifi' && <Wifi size={18} />}
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </span>
              </button>
            );
          })}
        </div>

        <div className={styles.inputArea}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'link' && (
                <div className={styles.formGroup}>
                  <label>URL</label>
                  <input type="url" className={styles.inputField} value={linkValue} onChange={(e) => setLinkValue(e.target.value)} placeholder="https://example.com" />
                </div>
              )}
              {activeTab === 'text' && (
                <div className={styles.formGroup}>
                  <label>Text Content</label>
                  <textarea className={styles.inputField} value={textValue} onChange={(e) => setTextValue(e.target.value)} placeholder="Enter your message here..." />
                </div>
              )}
              {activeTab === 'vcard' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className={styles.formGroup}><label>Full Name</label><input className={styles.inputField} value={vcard.name} onChange={e => setVcard({...vcard, name: e.target.value})} placeholder="John Doe" /></div>
                  <div className={styles.formGroup}><label>Phone Number</label><input className={styles.inputField} value={vcard.phone} onChange={e => setVcard({...vcard, phone: e.target.value})} placeholder="+1 234 567 890" /></div>
                  <div className={styles.formGroup}><label>Email</label><input type="email" className={styles.inputField} value={vcard.email} onChange={e => setVcard({...vcard, email: e.target.value})} placeholder="john@example.com" /></div>
                  <div className={styles.formGroup}><label>Company</label><input className={styles.inputField} value={vcard.company} onChange={e => setVcard({...vcard, company: e.target.value})} placeholder="Acme Inc." /></div>
                </div>
              )}
              {activeTab === 'wifi' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className={styles.formGroup}><label>Network Name (SSID)</label><input className={styles.inputField} value={wifi.ssid} onChange={e => setWifi({...wifi, ssid: e.target.value})} placeholder="MyNetwork" /></div>
                  <div className={styles.formGroup}><label>Password</label><input type="password" className={styles.inputField} value={wifi.password} onChange={e => setWifi({...wifi, password: e.target.value})} placeholder="SecretPassword" /></div>
                  <div className={styles.formGroup}>
                    <label>Encryption</label>
                    <select className={styles.inputField} value={wifi.encryption} onChange={e => setWifi({...wifi, encryption: e.target.value})}>
                      <option value="WPA">WPA/WPA2</option>
                      <option value="WEP">WEP</option>
                      <option value="nopass">None</option>
                    </select>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <h3 className="font-label-caps" style={{ marginTop: '1rem', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)' }}>ADVANCED EDITOR</h3>
        
        <Accordion title="Colors" icon={<Palette size={20} color="var(--primary-accent)"/>} id="colors" expanded={expandedSection} onToggle={setExpandedSection}>
          <div className={styles.colorPickerGroup}>
            <label>QR Color</label>
            <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} />
          </div>
          <div className={styles.colorPickerGroup}>
            <label>Background</label>
            <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
          </div>
        </Accordion>

        <Accordion title="QR Styling" icon={<Sliders size={20} color="var(--primary-accent)"/>} id="styling" expanded={expandedSection} onToggle={setExpandedSection}>
          <div className={styles.selectGroup}>
            <label>Dots Style</label>
            <select className={styles.inputField} value={dotsType} onChange={(e) => setDotsType(e.target.value as DotType)}>
              <option value="rounded">Rounded</option>
              <option value="dots">Dots</option>
              <option value="classy">Classy</option>
              <option value="classy-rounded">Classy Rounded</option>
              <option value="square">Square</option>
              <option value="extra-rounded">Extra Rounded</option>
            </select>
          </div>
          <div className={styles.selectGroup}>
            <label>Corner Squares</label>
            <select className={styles.inputField} value={cornersSquareType} onChange={(e) => setCornersSquareType(e.target.value as CornerSquareType)}>
              <option value="extra-rounded">Extra Rounded</option>
              <option value="dot">Dot</option>
              <option value="square">Square</option>
            </select>
          </div>
          <div className={styles.selectGroup}>
            <label>Corner Dots</label>
            <select className={styles.inputField} value={cornersDotType} onChange={(e) => setCornersDotType(e.target.value as CornerDotType)}>
              <option value="dot">Dot</option>
              <option value="square">Square</option>
            </select>
          </div>
        </Accordion>

        <Accordion title="Add Logo" icon={<ImagePlus size={20} color="var(--primary-accent)"/>} id="logo" expanded={expandedSection} onToggle={setExpandedSection}>
          <div className={styles.logoUploadGroup}>
            <label className={styles.uploadLabel}>
              <ImageIcon size={20} />
              {logoImage ? 'Change Custom Logo' : 'Upload SVG/PNG Logo'}
              <input type="file" accept="image/*" className={styles.fileInput} onChange={handleLogoUpload} />
            </label>
            {logoImage && (
              <button className={styles.removeLogoBtn} onClick={() => setLogoImage(null)}>
                Remove Logo
              </button>
            )}
          </div>
        </Accordion>

        <Accordion title="Text Labels" icon={<TypeIcon size={20} color="var(--primary-accent)"/>} id="text" expanded={expandedSection} onToggle={setExpandedSection}>
          <div className={styles.formGroup}>
            <label>Text Above QR</label>
            <input type="text" className={styles.inputField} value={textAbove} onChange={(e) => setTextAbove(e.target.value)} placeholder="e.g. Scan Me!" />
          </div>
          <div className={styles.formGroup}>
            <label>Text Below QR</label>
            <input type="text" className={styles.inputField} value={textBelow} onChange={(e) => setTextBelow(e.target.value)} placeholder="e.g. www.website.com" />
          </div>
          <div className={styles.colorPickerGroup} style={{ gridColumn: '1 / -1' }}>
            <label>Text Color</label>
            <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} />
          </div>
        </Accordion>
      </div>

      <div className={styles.previewPanel}>
        <div className={styles.qrContainer} ref={qrWrapperRef} style={{ background: bgColor }}>
          {textAbove && <div className={styles.qrOverlayText} style={{ color: textColor }}>{textAbove}</div>}
          <div ref={qrRef} className={styles.qrInner} />
          {textBelow && <div className={styles.qrOverlayText} style={{ color: textColor }}>{textBelow}</div>}
        </div>
        <button className={styles.downloadBtn} onClick={handleDownload}>
          <Download size={22} /> Download High-Res
        </button>
      </div>
    </div>
  );
}
