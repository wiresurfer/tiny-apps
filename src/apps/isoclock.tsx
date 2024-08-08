import { useRef, useEffect } from "react";


{/* 
  // @ts-ignore */}
var { Shape, Point, Color, Prism } = window.Isomer

var middleX = 4;
var middleY = 6;

var colon = {
  faces: [
    [0, 0, 1, 1, 1, 1],
    [0, 0, 3, 1, 1, 1]
  ],
  color: new Color(251, 248, 204)
};
var numbers = {
  0: {
    faces: [
      [0, 0, 0, 1, 3, 1],
      [0, 2, 1, 1, 1, 3],
      [0, 0, 1, 1, 1, 3],
      [0, 0, 4, 1, 3, 1]
    ],
    color: new Color(0, 180, 216)
  },
  1: {
    faces: [
      [0, 1, 0, 1, 1, 5]
    ],
    color: new Color(10, 147, 150)
  },
  2: {
    faces: [
      [0, 0, 0, 1, 3, 1],
      [0, 2, 1, 1, 1, 1],
      [0, 0, 2, 1, 3, 1],
      [0, 0, 3, 1, 1, 1],
      [0, 0, 4, 1, 3, 1]
    ],
    color: new Color(148, 210, 189)
  },
  3: {
    faces: [
      [0, 0, 0, 1, 3, 1],
      [0, 1, 2, 1, 1, 1],
      [0, 0, 1, 1, 1, 3],
      [0, 0, 4, 1, 3, 1]
    ],
    color: new Color(233, 216, 166)
  },
  4: {
    faces: [
      [0, 2, 2, 1, 1, 3],
      [0, 1, 2, 1, 1, 1],
      [0, 0, 0, 1, 1, 5]
    ],
    color: new Color(238, 155, 0)
  },
  5: {
    faces: [
      [0, 0, 0, 1, 3, 1],
      [0, 0, 1, 1, 1, 1],
      [0, 0, 2, 1, 3, 1],
      [0, 2, 3, 1, 1, 1],
      [0, 0, 4, 1, 3, 1]
    ],
    color: new Color(202, 103, 2)
  },
  6: {
    faces: [
      [0, 0, 0, 1, 3, 1],
      [0, 0, 1, 1, 1, 1],
      [0, 2, 1, 1, 1, 3],
      [0, 0, 2, 1, 2, 1],
      [0, 0, 4, 1, 3, 1]
    ],
    color: new Color(187, 62, 3)
  },
  7: {
    faces: [
      [0, 1, 4, 1, 2, 1],
      [0, 1, 2, 1, 1, 1],
      [0, 0, 0, 1, 1, 5]
    ],
    color: new Color(174, 32, 18)
  },
  8: {
    faces: [
      [0, 0, 0, 1, 3, 1],
      [0, 2, 1, 1, 1, 3],
      [0, 1, 2, 1, 1, 1],
      [0, 0, 1, 1, 1, 3],
      [0, 0, 4, 1, 3, 1]
    ],
    color: new Color(154, 34, 38)
  },
  9: {
    faces: [
      [0, 0, 0, 1, 3, 1],
      [0, 2, 2, 1, 1, 2],
      [0, 1, 2, 1, 1, 1],
      [0, 0, 1, 1, 1, 3],
      [0, 0, 4, 1, 3, 1]
    ],
    color: new Color(185, 251, 192)
  },
};


{/* 
  // @ts-ignore */}
var drawPrism = function(prism, x: number, y: number, iso) {
  var faces = prism.faces;
  var shape = [];
  for (var i = 0; i < faces.length; i++) {
    var number = faces[i];
    shape.push(new Shape.Prism(new Point(number[0] + x, number[1] + y - middleY, number[2]), number[3], number[4], number[5]));
  }
  iso.add(shape, prism.color);
}
var drawNumber = function(iso: any, num: string, x: number, y: number) {
  {/* 
  // @ts-ignore */}
  drawPrism(numbers[num], x, y, iso);
};

var drawColon = function(iso: any) {
  colon.color = randomColor()
  drawPrism(colon, middleX, 10.5, iso);
};

var zeroPrefix = function(number: number) {
  return ('0' + number).slice(-2);
};


var randomSwing = (intensity: number) => {
  const randomSwing = (Math.random() * intensity) - intensity / 2
  return randomSwing
}
var randomColor = function() {
  let swingRed = randomSwing(50)
  const swingGreen = randomSwing(25)
  const swingBlue = randomSwing(50)
  return new Color(
    Math.floor(swingRed + 161),
    Math.floor(swingGreen + 184),
    Math.floor(swingBlue + 151)
  );
}


const IsoClock = () => {

  const canvasRef = useRef(null);


  useEffect(() => {
    const canvas = canvasRef.current;
    {/* 
  // @ts-ignore */}
    var iso = new window.Isomer(canvasRef.current);


    // Time
    const timeSegements = () => {
      var now = new Date();
      var hours = zeroPrefix(now.getHours());
      var minutes = zeroPrefix(now.getMinutes());
      var firstHourNumber = hours.substr(0, 1);
      var secondHourNumber = hours.substr(1, 1);
      var firstMinuteNumber = minutes.substr(0, 1);
      var secondMinuteNumber = minutes.substr(1, 1);

      return { firstHourNumber, secondHourNumber, firstMinuteNumber, secondMinuteNumber }
    }

    var drawTimer = function() {
      const { firstHourNumber, secondHourNumber, firstMinuteNumber, secondMinuteNumber } = timeSegements()
      drawNumber(iso, firstHourNumber, middleX, 16)
      drawNumber(iso, secondHourNumber, middleX, 12)
      drawColon(iso);
      drawNumber(iso, firstMinuteNumber, middleX, 6)
      drawNumber(iso, secondMinuteNumber, middleX, 2)
    };

    var drawScene = function() {
      iso.canvas.clear();
      drawTimer();
      console.log("Redwar")
      setTimeout(drawScene, 2000);
    }

    drawScene()

  }, []);

  // drawScene();
  return (
    <div className="flex h-screen">
      <div className="container m-auto ">
        <canvas ref={canvasRef} id="canvas" className="w-full aspect-video" width="1600" height="1200" ></canvas>
        <p className="text-right text-gray-700 sm:truncate sm:tracking-tight">
          isomer-clock by <a href="http://twitter.com/wiresurfer">@wiresurfer</a>
        </p>

      </div>
    </div>
  )
}

export default IsoClock
