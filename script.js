const canvas = document.getElementById('clockCanvas');
const ctx = canvas.getContext('2d');
const size = 800;
const centerX = size / 2;
const centerY = size / 2;

// Remove SPEED_MULTIPLIER and add custom time state
let customTime = new Date();
let isCustomTime = false;

// Function to set custom time
function setClockTime(hours, minutes, seconds, milliseconds = 0) {
  const now = new Date();
  customTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 
    hours, minutes, seconds, milliseconds);
  isCustomTime = true;
}

// For moving elements like second hand
const particles = [];
function createParticles(x, y) {
  particles.push({ x, y, alpha: 1 });
  particles.forEach(p => {
    ctx.fillStyle = `rgba(0, 255, 255, ${p.alpha})`;
    ctx.fillRect(p.x, p.y, 3, 3);
    p.alpha -= 0.1;
  });
}

// Change from easeInCubic to easeInOutCubic
const easeInOutCubic = x => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const TRANSITION_DURATION = 1100; // Increased from 800ms to 1100ms for smoother effect

function drawArc(fraction, radius, color, lineWidth, transition = 0) {
  // Draw the background stroke
  ctx.beginPath();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 2;
  ctx.arc(centerX, centerY, radius, -Math.PI / 2, 3 * Math.PI / 2, false);
  ctx.stroke();

  // Draw a small fixed stroke at 12 o'clock
  ctx.beginPath();
  ctx.strokeStyle = color + ', 1)';
  ctx.lineWidth = lineWidth;
  ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + 0.025, false); // Small 0.1 radian arc
  ctx.stroke();

  // Draw the colored progress stroke with transition effect
  ctx.beginPath();
  
  let startAngle = -Math.PI / 2;
  let endAngle = startAngle + fraction * 2 * Math.PI;
  
  if (transition > 0) {
    // Apply easeInOutCubic instead of easeInCubic
    const easedTransition = easeInOutCubic(transition);
    startAngle = -Math.PI / 2 + (1 - easedTransition) * 2 * Math.PI;
    endAngle = -Math.PI / 2 + 2 * Math.PI;
    const alpha = easedTransition;
    ctx.strokeStyle = color.replace(')', `, ${alpha})`);
  } else {
    ctx.strokeStyle = color + ', 1)'; // Full opacity when not transitioning
  }
  
  ctx.lineWidth = lineWidth;
  ctx.arc(centerX, centerY, radius, startAngle, endAngle, false);
  ctx.stroke();
}

function updateClock() {
  ctx.clearRect(0, 0, size, size);

  // Use either custom time or real time
  const now = isCustomTime ? customTime : new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  const millis = now.getMilliseconds();

  // If using custom time, increment it by animation frame
  if (isCustomTime) {
    customTime.setMilliseconds(customTime.getMilliseconds() + 16); // ~60fps
  }

  // Calculate transition effects for all three hands
  const secondsTransition = seconds === 59 ? Math.max(0, 1 - (millis / TRANSITION_DURATION)) : 0;
  const minutesTransition = (seconds === 59 && minutes === 59) ? Math.max(0, 1 - (millis / TRANSITION_DURATION)) : 0;
  const hoursTransition = (seconds === 59 && minutes === 59 && hours % 12 === 11) ? Math.max(0, 1 - (millis / TRANSITION_DURATION)) : 0;

  const hoursFraction   = ((hours % 12) + minutes / 60 + seconds / 3600) / 12;
  const minutesFraction = (minutes + seconds / 60 + millis / 60000) / 60;
  const secondsFraction = (seconds + millis / 1000) / 60;

  // Draw the arcs with transition effects
  drawArc(hoursFraction,   200, 'rgba(255, 204, 0', 10, hoursTransition);    // Hours arc
  drawArc(minutesFraction, 175, 'rgba(0, 173, 181', 7.5, minutesTransition); // Minutes arc
  drawArc(secondsFraction, 150, 'rgba(255, 46, 99', 5, secondsTransition);   // Seconds arc

  requestAnimationFrame(updateClock);
}

// Start the animation loop
updateClock();

// Example usage:
// setClockTime(11, 59, 57);