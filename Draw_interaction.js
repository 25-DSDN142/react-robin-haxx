

let wordToDisplay = "";
let numberToDisplay = "";

// Helper function for touch detection
function touching(x1, y1, x2, y2, threshold = 50) {
  return dist(x1, y1, x2, y2) < threshold;
}


// ----=  HANDS  =----
function prepareInteraction() {
  //bgImage = loadImage('/images/background.png');
}

function drawInteraction(faces, hands) {
  // Reset displays
  wordToDisplay = "";
  numberToDisplay = "";
  
  // Create scaling factors based on canvas size
  const scaleX = CaptureWidth / 640;
  const scaleY = CaptureHeight / 480;
  const scale = (scaleX + scaleY) / 2;
  
  // Count total fingers across all hands
  let totalFingerCount = countAllFingers(hands);
  if (totalFingerCount > 0) {
    numberToDisplay = getMaoriNumber(totalFingerCount);
  }
  
  // Process hands first and always draw them if showKeypoints is true
  for (let j = 0; j < hands.length; j++) {
    let hand = hands[j];
    
    // Always draw hand keypoints if showing keypoints
    if (showKeypoints) {
      drawPoints(hand);
      drawConnections(hand);
    }
  }
  
  // Process faces
  for (let i = 0; i < faces.length; i++) {
    let face = faces[i];
    let touchedPart = null; // Track which part is being touched
    
    // Always draw all face points in debug mode first
    if (showKeypoints) {
      drawPoints(face);
      // Draw individual face features in debug mode
      drawPoints(face.leftEye);
      drawPoints(face.leftEyebrow);
      drawPoints(face.lips);
      drawPoints(face.rightEye);
      drawPoints(face.rightEyebrow);
    }
    
    // Get face part coordinates
    let rightEyeCenterX = face.rightEye.centerX;
    let rightEyeCenterY = face.rightEye.centerY;
    let leftEyeCenterX = face.leftEye.centerX;
    let leftEyeCenterY = face.leftEye.centerY;
    let lipsCenterX = face.lips.centerX;
    let lipsCenterY = face.lips.centerY;
    let leftEyebrowCenterX = face.leftEyebrow.centerX;
    let leftEyebrowCenterY = face.leftEyebrow.centerY;
    let rightEyebrowCenterX = face.rightEyebrow.centerX;
    let rightEyebrowCenterY = face.rightEyebrow.centerY;
    
    // Face dimensions for reference
    let faceWidth = face.faceOval.width;
    let faceHeight = face.faceOval.height;
    let faceCenterX = face.faceOval.centerX;
    let faceCenterY = face.faceOval.centerY;
    
    // Adjust eye positions outward slightly
    leftEyeCenterX -= 10 * scaleX;
    rightEyeCenterX += 10 * scaleX;
    
    // Nose area - extended from bridge to tip
    let noseBridgeX = (face.leftEye.centerX + face.rightEye.centerX) / 2;
    let noseBridgeY = (face.leftEye.centerY + face.rightEye.centerY) / 2 + (15 * scaleY);
    let noseTipX = noseBridgeX;
    let noseTipY = noseBridgeY + (35 * scaleY);
    
    // Forehead - larger area above eyebrows
    let foreheadCenterX = (leftEyebrowCenterX + rightEyebrowCenterX) / 2;
    let foreheadCenterY = (leftEyebrowCenterY + rightEyebrowCenterY) / 2 - (50 * scaleY);
    
    // Chin - larger area below mouth
    let chinCenterX = lipsCenterX;
    let chinCenterY = lipsCenterY + (60 * scaleY);
    
    // Cheeks - multiple detection points for larger coverage
    let leftCheekPoints = [
      {x: leftEyeCenterX - (40 * scaleX), y: (leftEyeCenterY + lipsCenterY) / 2},
      {x: leftEyeCenterX - (60 * scaleX), y: noseTipY},
      {x: faceCenterX - faceWidth/4, y: faceCenterY}
    ];
    
    let rightCheekPoints = [
      {x: rightEyeCenterX + (40 * scaleX), y: (rightEyeCenterY + lipsCenterY) / 2},
      {x: rightEyeCenterX + (60 * scaleX), y: noseTipY},
      {x: faceCenterX + faceWidth/4, y: faceCenterY}
    ];
    
    // Ears - far out from face
    let leftEarX = faceCenterX - faceWidth/2 - (50 * scaleX);
    let leftEarY = faceCenterY - (10 * scaleY);
    let rightEarX = faceCenterX + faceWidth/2 + (50 * scaleX);
    let rightEarY = faceCenterY - (10 * scaleY);
    
    // Check hand interactions
    for (let j = 0; j < hands.length; j++) {
      let hand = hands[j];
      
      let indexFingerTipX = hand.index_finger_tip.x;
      let indexFingerTipY = hand.index_finger_tip.y;
      
      // Check for face part touches - ORDER MATTERS!
      
      // Ears - check first since they're furthest out
      if (touching(indexFingerTipX, indexFingerTipY, leftEarX, leftEarY, 70 * scale) ||
          touching(indexFingerTipX, indexFingerTipY, rightEarX, rightEarY, 70 * scale)) {
        wordToDisplay = 'taringa'; // ear
        touchedPart = 'ear';
      }
      // Forehead - larger detection area
      else if (touching(indexFingerTipX, indexFingerTipY, foreheadCenterX, foreheadCenterY, 80 * scale) ||
               (indexFingerTipY < leftEyebrowCenterY - (20 * scaleY) && 
                indexFingerTipX > leftEyebrowCenterX - (40 * scaleX) && 
                indexFingerTipX < rightEyebrowCenterX + (40 * scaleX))) {
        wordToDisplay = 'rae'; // forehead
        touchedPart = 'forehead';
      }
      // Eyebrows
      else if ((touching(indexFingerTipX, indexFingerTipY, leftEyebrowCenterX, leftEyebrowCenterY, 40 * scale) &&
                indexFingerTipY < leftEyebrowCenterY + (20 * scaleY))) {
        wordToDisplay = 'kape'; // eyebrow
        touchedPart = 'leftEyebrow';
      }
      else if ((touching(indexFingerTipX, indexFingerTipY, rightEyebrowCenterX, rightEyebrowCenterY, 40 * scale) &&
                indexFingerTipY < rightEyebrowCenterY + (20 * scaleY))) {
        wordToDisplay = 'kape'; // eyebrow
        touchedPart = 'rightEyebrow';
      }
      // Eyes
      else if (touching(indexFingerTipX, indexFingerTipY, leftEyeCenterX, leftEyeCenterY, 35 * scale)) {
        wordToDisplay = 'kanohi'; // eye
        touchedPart = 'leftEye';
      }
      else if (touching(indexFingerTipX, indexFingerTipY, rightEyeCenterX, rightEyeCenterY, 35 * scale)) {
        wordToDisplay = 'kanohi'; // eye
        touchedPart = 'rightEye';
      }
      // Nose - check both bridge and tip area
      else if (touching(indexFingerTipX, indexFingerTipY, noseBridgeX, noseBridgeY, 40 * scale) ||
               touching(indexFingerTipX, indexFingerTipY, noseTipX, noseTipY, 40 * scale) ||
               (indexFingerTipX > noseBridgeX - (30 * scaleX) && 
                indexFingerTipX < noseBridgeX + (30 * scaleX) &&
                indexFingerTipY > noseBridgeY - (10 * scaleY) && 
                indexFingerTipY < noseTipY + (20 * scaleY))) {
        wordToDisplay = 'ihu'; // nose
        touchedPart = 'nose';
      }
      // Mouth/lips
      else if (touching(indexFingerTipX, indexFingerTipY, lipsCenterX, lipsCenterY, 40 * scale)) {
        wordToDisplay = 'waha'; // mouth
        touchedPart = 'lips';
      }
      // Chin - larger area
      else if (touching(indexFingerTipX, indexFingerTipY, chinCenterX, chinCenterY, 60 * scale) ||
               (indexFingerTipY > lipsCenterY + (30 * scaleY) && 
                indexFingerTipX > chinCenterX - (50 * scaleX) && 
                indexFingerTipX < chinCenterX + (50 * scaleX))) {
        wordToDisplay = 'kauae'; // chin
        touchedPart = 'chin';
      }
      // Cheeks - check multiple points for larger coverage
      else if (checkMultiplePoints(indexFingerTipX, indexFingerTipY, leftCheekPoints, 50 * scale) ||
               checkMultiplePoints(indexFingerTipX, indexFingerTipY, rightCheekPoints, 50 * scale)) {
        wordToDisplay = 'paparinga'; // cheek
        touchedPart = 'cheek';
      }
    }
    
    // If NOT in debug mode and something is touched, only show those points
    if (!showKeypoints && touchedPart) {
      switch(touchedPart) {
        case 'leftEye':
          drawPoints(face.leftEye);
          break;
        case 'rightEye':
          drawPoints(face.rightEye);
          break;
        case 'leftEyebrow':
          drawPoints(face.leftEyebrow);
          break;
        case 'rightEyebrow':
          drawPoints(face.rightEyebrow);
          break;
        case 'lips':
          drawPoints(face.lips);
          break;
        case 'nose':
          drawNosePoints(noseBridgeX, noseBridgeY, noseTipX, noseTipY, scale);
          break;
        case 'forehead':
          drawForeheadPoints(foreheadCenterX, foreheadCenterY, scale);
          break;
        case 'chin':
          drawChinPoints(chinCenterX, chinCenterY, scale);
          break;
        case 'cheek':
          drawCheekPoints(leftCheekPoints, rightCheekPoints, scale);
          break;
        case 'ear':
          drawEarPoints(leftEarX, leftEarY, rightEarX, rightEarY, scale);
          break;
      }
    }
  }
  
  // Display the words
  displayMaoriWords();
}

// Helper functions to draw points for areas that don't have direct keypoints
function drawNosePoints(bridgeX, bridgeY, tipX, tipY, scale) {
  push();
  //noStroke();
  fill(0, 255, 0);
  circle(bridgeX, bridgeY, 5 * scale);
  circle(tipX, tipY, 5 * scale);
  circle(bridgeX, (bridgeY + tipY) / 2, 5 * scale);
  pop();
}

function drawForeheadPoints(centerX, centerY, scale) {
  push();
  //noStroke();
  fill(0, 255, 0);
  for (let i = -2; i <= 2; i++) {
    circle(centerX + (i * 20 * scale), centerY, 5 * scale);
  }
  pop();
}

function drawChinPoints(centerX, centerY, scale) {
  push();
  //noStroke();
  fill(0, 255, 0);
  circle(centerX, centerY, 5 * scale);
  circle(centerX - (20 * scale), centerY, 5 * scale);
  circle(centerX + (20 * scale), centerY, 5 * scale);
  pop();
}

function drawCheekPoints(leftPoints, rightPoints, scale) {
  push();
  //noStroke();
  fill(0, 255, 0);
  for (let point of leftPoints) {
    circle(point.x, point.y, 5 * scale);
  }
  for (let point of rightPoints) {
    circle(point.x, point.y, 5 * scale);
  }
  pop();
}

function drawEarPoints(leftX, leftY, rightX, rightY, scale) {
  push();
  noStroke();
  fill(0, 255, 0);
  // Draw a few points in ear shape
  for (let angle = 0; angle < TWO_PI; angle += PI/4) {
    circle(leftX + cos(angle) * 30 * scale, leftY + sin(angle) * 40 * scale, 5 * scale);
    circle(rightX + cos(angle) * 30 * scale, rightY + sin(angle) * 40 * scale, 5 * scale);
  }
  pop();
}

function countAllFingers(hands) {
  let totalCount = 0;
  
  // Count fingers on each hand and sum them up
  for (let hand of hands) {
    totalCount += countFingers(hand);
  }
  
  return Math.min(totalCount, 10); // Cap at 10 just in case
}


function countFingers(hand) {
  if (!hand || hand.confidence < 0.7) return 0;
  
  let count = 0;
  const scale = (CaptureWidth / 640 + CaptureHeight / 480) / 2;
  
  // Check thumb - more robust detection with scaling
  let thumbTip = hand.thumb_tip;
  let thumbMcp = hand.thumb_mcp;
  let indexMcp = hand.index_finger_mcp;
  
  // Calculate if thumb is extended by checking distance from palm
  let thumbExtended = dist(thumbTip.x, thumbTip.y, indexMcp.x, indexMcp.y) > 
                      dist(thumbMcp.x, thumbMcp.y, indexMcp.x, indexMcp.y) * 1.3;
  
  // Also check vertical position for additional verification
  let thumbUp = thumbTip.y < thumbMcp.y - (20 * scale);
  
  // Additional check: thumb should be away from index finger when extended
  let thumbToIndexDist = dist(thumbTip.x, thumbTip.y, hand.index_finger_mcp.x, hand.index_finger_mcp.y);
  let thumbFolded = thumbToIndexDist < (40 * scale);
  
  if (thumbExtended && thumbUp && !thumbFolded) count++;
  
  // Check other fingers with scaled thresholds
  if (isFingerExtended(hand.index_finger_tip, hand.index_finger_pip, hand.index_finger_dip, scale)) count++;
  if (isFingerExtended(hand.middle_finger_tip, hand.middle_finger_pip, hand.middle_finger_dip, scale)) count++;
  if (isFingerExtended(hand.ring_finger_tip, hand.ring_finger_pip, hand.ring_finger_dip, scale)) count++;
  if (isFingerExtended(hand.pinky_finger_tip, hand.pinky_finger_pip, hand.pinky_finger_dip, scale)) count++;
  
  return count;
}

function isFingerExtended(tip, pip, dip, scale) {
  // A finger is extended if the tip is significantly above the PIP joint
  // and the DIP is also above PIP (finger is straight)
  let tipAbovePip = tip.y < pip.y - (20 * scale);
  let dipAbovePip = dip.y < pip.y - (10 * scale);
  
  return tipAbovePip && dipAbovePip;
}

// Helper function to check multiple points
function checkMultiplePoints(x, y, points, threshold) {
  for (let point of points) {
    if (touching(x, y, point.x, point.y, threshold)) {
      return true;
    }
  }
  return false;
}

// Update the touching function to ensure it exists
function touching(x1, y1, x2, y2, threshold = 50) {
  return dist(x1, y1, x2, y2) < threshold;
}

// Update the displayMaoriWords function to scale text size too
function displayMaoriWords() {
  push();
  textAlign(CENTER, CENTER);
  const scale = (CaptureWidth / 640 + CaptureHeight / 480) / 2;
  
  textSize(48 * scale);
  fill(255);
  stroke(0);
  strokeWeight(3);
  
  // Display face part word
  if (wordToDisplay) {
    text(wordToDisplay, CaptureWidth/2, CaptureHeight - (100 * scale));
  }
  
  // Display number
  if (numberToDisplay) {
    textSize(64 * scale);
    text(numberToDisplay, CaptureWidth/2, 100 * scale);
    
    // Also show the numeral for learning
    textSize(32 * scale);
    let num = Object.keys(getMaoriNumbers()).find(key => getMaoriNumbers()[key] === numberToDisplay);
    text("(" + num + ")", CaptureWidth/2, 150 * scale);
  }
  pop();
}

// Helper function to check multiple points
function checkMultiplePoints(x, y, points, threshold) {
  for (let point of points) {
    if (touching(x, y, point.x, point.y, threshold)) {
      return true;
    }
  }
  return false;
}


function drawConnections(hand) {
  // Draw the skeletal connections
  push()
  for (let j = 0; j < connections.length; j++) {
    let pointAIndex = connections[j][0];
    let pointBIndex = connections[j][1];
    let pointA = hand.keypoints[pointAIndex];
    let pointB = hand.keypoints[pointBIndex];
    stroke(255, 0, 0);
    strokeWeight(2);
    line(pointA.x, pointA.y, pointB.x, pointB.y);
  }
  pop()
}

function pinchCircle(hand) { // adapted from https://editor.p5js.org/ml5/sketches/DNbSiIYKB
  // Find the index finger tip and thumb tip
  let finger = hand.index_finger_tip;
  //let finger = hand.pinky_finger_tip;
  let thumb = hand.thumb_tip;

  // Draw circles at finger positions
  let centerX = (finger.x + thumb.x) / 2;
  let centerY = (finger.y + thumb.y) / 2;
  // Calculate the pinch "distance" between finger and thumb
  let pinch = dist(finger.x, finger.y, thumb.x, thumb.y);

  // This circle's size is controlled by a "pinch" gesture
  fill(0, 255, 0, 200);
  stroke(0);
  strokeWeight(2);
  circle(centerX, centerY, pinch);

}


// This function draw's a dot on all the keypoints. It can be passed a whole face, or part of one. 
function drawPoints(feature) {

  push()
  for (let i = 0; i < feature.keypoints.length; i++) {
    let element = feature.keypoints[i];
    noStroke();
    fill(0, 255, 0);
    circle(element.x, element.y, 5);
  }
  pop()

}

// Function to display the Māori words on screen
// Update the displayMaoriWords function to handle two-digit numbers
function displayMaoriWords() {
  push();
  textAlign(CENTER, CENTER);
  const scale = (CaptureWidth / 640 + CaptureHeight / 480) / 2;
  
  textSize(48 * scale);
  fill(255);
  stroke(0);
  strokeWeight(3);
  
  // Display face part word
  if (wordToDisplay) {
    text(wordToDisplay, CaptureWidth/2, CaptureHeight - (100 * scale));
  }
  
  // Display number
  if (numberToDisplay) {
    textSize(64 * scale);
    text(numberToDisplay, CaptureWidth/2, 100 * scale);
    
    // Also show the numeral for learning
    textSize(32 * scale);
    let num = Object.keys(getMaoriNumbers()).find(key => getMaoriNumbers()[key] === numberToDisplay);
    text("(" + num + ")", CaptureWidth/2, 150 * scale);
  }
  pop();
}

// Helper function to get all Māori numbers
function getMaoriNumbers() {
  return {
    0: "kore",
    1: "tahi",
    2: "rua",
    3: "toru",
    4: "whā",
    5: "rima",
    6: "ono",
    7: "whitu",
    8: "waru",
    9: "iwa",
    10: "tekau"
  };
}