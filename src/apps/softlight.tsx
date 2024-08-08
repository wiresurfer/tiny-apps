import { useState } from "react";

const clamp = (num: number, min: number, max: number) => num < min ? min : num > max ? max : num;

/** Given a temperature (in Kelvin), estimate an RGB equivalent
 * @param {number} tmpKelvin - Temperature (in Kelvin) between 1000 and 40000
 * @returns {{r:number, g:number, b:number}} - RGB channel intensities (0-255)
 * @description Ported from: http://www.tannerhelland.com/4435/convert-temperature-rgb-algorithm-code/
*/
let getRGBFromTemperature = (tmpKelvin: number) => {
  // All calculations require tmpKelvin \ 100, so only do the conversion once
  tmpKelvin = clamp(tmpKelvin, 1000, 40000) / 100;

  // Note: The R-squared values for each approximation follow each calculation
  return {
    r: tmpKelvin <= 66 ? 255 :
      clamp(329.698727446 * (Math.pow(tmpKelvin - 60, -0.1332047592)), 0, 255),  // .988

    g: tmpKelvin <= 66 ?
      clamp(99.4708025861 * Math.log(tmpKelvin) - 161.1195681661, 0, 255) :      // .996
      clamp(288.1221695283 * (Math.pow(tmpKelvin - 60, -0.0755148492)), 0, 255), // .987

    b: tmpKelvin >= 66 ? 255 :
      tmpKelvin <= 19 ? 0 :
        clamp(138.5177312231 * Math.log(tmpKelvin - 10) - 305.0447927307, 0, 255)  // .998
  };
};

{/* 
  // @ts-ignore */}
function rgbToColorStr(r: number, g: number, b: number) {
  return `rgb(${r},${g},${b})`;
}
function componentToHex(c: any) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r: number, g: number, b: number) {
  return "#" + componentToHex(Math.round(r)) + componentToHex(Math.round(g)) + componentToHex(Math.round(b));
}

let set_color_by_temperature = (temperature: number) => {
  let { r, g, b } = getRGBFromTemperature(temperature);
  let new_color = rgbToHex(r, g, b);
  console.log("Setting new RGB color: ${new_color}, based on temperature ${temperature}");
  // set_color(new_color);
  return new_color

}
const SoftLight = () => {
  const [temperature, setTemperature] = useState(5600);
  const [color, setColor] = useState(set_color_by_temperature(temperature));


  const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setColor(event.target.value);
  };

  const handleTemperatureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let temperature = Number(event.target.value)
    setTemperature(temperature);
    setColor(set_color_by_temperature(temperature))

  };

  /* Get the documentElement (<html>) to display the page in fullscreen */
  const [fullscreen, setFullScreen] = useState(false);
  /* View in fullscreen */
  function openFullscreen() {
    var elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
      setFullScreen(true);
      {/* 
  // @ts-ignore */}
    } else if (elem.webkitRequestFullscreen) { /* Safari */
      {/* 
  // @ts-ignore */}
      elem.webkitRequestFullscreen();
      setFullScreen(true);
      {/* 
  // @ts-ignore */}
    } else if (elem.msRequestFullscreen) { /* IE11 */
      {/* 
  // @ts-ignore */}
      elem.msRequestFullscreen();
      setFullScreen(true);
    }
  }

  /* Close fullscreen */
  function closeFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
      setFullScreen(false);
      {/* 
  // @ts-ignore */}
    } else if (document.webkitExitFullscreen) { /* Safari */
      {/* 
  // @ts-ignore */}
      document.webkitExitFullscreen();
      setFullScreen(false);
      {/* 
  // @ts-ignore */}
    } else if (document.msExitFullscreen) { /* IE11 */
      {/* 
  // @ts-ignore */}
      document.msExitFullscreen();
      setFullScreen(false);
    }
  }

  function toggleFullscreen() {
    fullscreen ? closeFullscreen() : openFullscreen();
  }
  return (
    <>
      <div id="contols" className="controls w-full dark container bg-gray-600 justify-evenly flex p-2 m-auto">
        <a href="/" >
          <svg className="h-10 w-10 text-white bg-gray-900 hover:bg-gray-800 hover:text-white rounded-lg p-1" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z" />  <polyline points="5 12 3 12 12 3 21 12 19 12" />  <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7" />  <path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6" /></svg>
        </a>
        <input type="color" id="color" onChange={handleColorChange} value={color} className="p-1 h-10 w-14 block bg-white border border-gray-200 cursor-pointer rounded-lg disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700" />
        <input type="number" id="temperature" value={temperature} onChange={handleTemperatureChange}
          step={25} placeholder="temperature (K)" min={1000} max={40000}
          className="shadow appearance-none border rounded  py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
        <button id="fullscreen" onClick={toggleFullscreen} className="bg-gray-900 hover:bg-gray-800 text-gray-200 font-bold py-2 px-4 rounded inline-flex items-center">Fullscreen</button>
      </div>
      <div className="softlight" id="softlight" style={{ backgroundColor: color }}> </div>
    </>
  )
}

export default SoftLight
