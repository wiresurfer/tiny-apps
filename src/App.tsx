import React from 'react';
import './App.css';
import './theme.css';
import './apps/home.css';
import { Routes, Route } from 'react-router-dom'
import IsoClock from './apps/isoclock';
import SoftLight from './apps/softlight';
import InfographicGenerator from './apps/infographicsgenie';
import FilterToolkit from './apps/filter-toolkit';
import ThemeToggle from './components/ThemeToggle';

type HomeCardProps = {
  link: string,
  badge: string,
  badgeBg: string,
  badgeColor: string,
  title: string,
  description: string,
  image: string,
  external?: boolean,
  beta?: boolean,
}
let HomeCard = (props: HomeCardProps) => {
  return <a
    href={props.link}
    className="home-card"
    title={props.description}
    {...(props.external ? { target: '_blank', rel: 'noreferrer' } : {})}
  >
    {props.beta && <span className="home-ribbon">BETA</span>}
    <img src={props.image} alt={`${props.title} preview`} />
    <div className="home-card-scrim">
      <div className="home-card-top">
        <span className="home-badge" style={{ background: props.badgeBg, color: props.badgeColor }}>{props.badge}</span>
        <h2>{props.title}</h2>
      </div>
      <p className="home-card-line">{props.description}</p>
      <span className="home-card-cta">{props.external ? 'Open site ↗' : 'Open tool →'}</span>
    </div>
  </a>
}

const GRID_SIZE = 16;

function Home() {

  const links: Array<HomeCardProps> = [
    {
      title: 'iso-clock',
      link: "#/iso-clock",
      badge: 'CLK',
      badgeBg: '#E6F1FB',
      badgeColor: '#185FA5',
      description: 'An isometric 3D-ish clock for distraction-free new tabs. Perfect for your browser\'s about://home page.',
      image: './img/iso-clock.jpg',
    },

    {
      title: 'monitor-softlight',
      link: "#/softlight",
      badge: 'LGT',
      badgeBg: '#FAEEDA',
      badgeColor: '#854F0B',
      description: 'Convert your second screen or mobile device into a temperature-controlled softlight.',
      image: './img/softlight.jpg',
    },

    {
      title: 'infographics-genie',
      link: "#/infographics-generator",
      badge: 'GEN',
      badgeBg: '#F1E6FB',
      badgeColor: '#6B3FA0',
      description: 'Generate infographics quickly using SVG templates and JSON data. Perfect for blog images and social sharing.',
      image: './img/infographics-generator.jpg',
    },

    {
      title: 'filter-toolkit',
      link: "#/filter-toolkit",
      badge: 'RF',
      badgeBg: '#E6FBF1',
      badgeColor: '#1D9E75',
      description: 'Design RF Butterworth filters — low-pass, high-pass, band-pass, band-stop — with live S21 response and a PCB layout.',
      image: './img/filter-toolkit.svg',
    },

    {
      title: 'zpl-designer',
      link: "https://zpl-designer.shaishav.kr",
      badge: 'ZPL',
      badgeBg: '#FDEFE0',
      badgeColor: '#BA7517',
      description: 'A browser-based canvas for designing Zebra ZPL labels — text, shapes, barcodes, QR codes — compiled to real ZPL and printed over CUPS.',
      image: './img/zpl-designer.svg',
      external: true,
      beta: true,
    },

    {
      title: 'trailhead',
      link: "https://wiresurfer.github.io/trailhead/",
      badge: 'PBK',
      badgeBg: '#1f2023',
      badgeColor: '#28d194',
      description: 'Capture terminal work as a rendered playbook, with zero note-taking while you work.',
      image: './img/trailhead.svg',
      external: true,
      beta: true,
    }
  ]

  return (
    <div className="home">
      <div className="home-bar">
        <div className="home-brand">
          <b>🏄 wiresurfer's tiny-apps</b>
          <span className="home-tag">fun & useful tools</span>
        </div>
        <div className="home-links">
          <a href="https://twitter.com/wiresurfer">Twitter</a>
          <a href="https://blog.shaishav.kr">Blog</a>
          <a href="https://www.buymeacoffee.com/wiresurfer">Buy me a coffee</a>
        </div>
        <ThemeToggle />
      </div>
      <div className="home-grid">
        {links.map(x => <div className="home-cell" key={x.link}><HomeCard {...x} /></div>)}
        {Array.from({ length: GRID_SIZE - links.length }).map((_, i) => (
          <div className="home-cell" key={`placeholder-${i}`}>
            <div className="home-placeholder">+</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function App() {
  return (
    <main>
      <Routes>
        <Route path="/iso-clock" element={<IsoClock />} />
        <Route path="/softlight" element={<SoftLight />} />
        <Route path="/infographics-generator" element={<InfographicGenerator />} />
        <Route path="/filter-toolkit" element={<FilterToolkit />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </main >


  );
}

export default App;
