import React from 'react';
import logo from './logo.svg';
import './App.css';
import { Routes, Route, useNavigate } from 'react-router-dom'
import Layout from './layout/layout';
import IsoClock from './apps/isoclock';
import SoftLight from './apps/softlight';
import InfographicGenerator from './apps/infographicsgenie';



type HomeCardProps = {
  link: string,
  title: string,
  description: string,
  image: string
}
let HomeCard = (props: HomeCardProps) => {
  return <a href={props.link} className="block bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
    <div className="flex flex-col md:flex-row">
      <div className="md:w-1/2 p-6">
        <h2 className="text-2xl font-semibold mb-2">{props.title}</h2>
        <p className="text-gray-600 dark:text-gray-400">{props.description}</p>
      </div>
      <div className="md:w-1/2 bg-gray-200 dark:bg-gray-700">
        <img src={props.image} alt={`${props.title} screenshot`} className="w-full h-full object-cover" />
      </div>
    </div>
  </a>

}

function Home() {

  const links: Array<HomeCardProps> = [
    {
      title: 'iso-clock',
      link: "./iso-clock",
      description: 'An isometric 3D-ish clock for distraction-free new tabs. Perfect for your browser\'s about://home page.',
      image: './img/iso-clock.jpg'
    },

    {
      title: 'monitor-softlight',
      link: "./softlight",
      description: 'Convert your second screen or mobile device into a temperature-controlled softlight',
      image: './img/softlight.jpg'
    },

    {
      title: 'infographics-genie',
      link: "./infographics-generator",
      description: 'Generate infographics quickly using SVG templates and JSON data. Perfect for blog images and social media sharing.',
      image: './img/softlight.jpg',
    }
  ]

  return (
    <Layout>
      <div className="space-y-8">
        {links.map(x => <HomeCard {...x} />)}
      </div>
    </Layout >
  )
}

function App() {
  return (
    <main>
      <Routes>
        <Route path="/iso-clock" element={<IsoClock />} />
        <Route path="/softlight" element={<SoftLight />} />
        <Route path="/infographics-generator" element={<InfographicGenerator />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </main >


  );
}

export default App;
