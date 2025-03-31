import { createCanvas, loadImage } from "canvas";
import fs from "fs";
import path from "path";

const generatedDir = path.join(process.cwd(), "Generated");
if (!fs.existsSync(generatedDir)) fs.mkdirSync(generatedDir);

// Keep original dimensions to match your screenshot
const MOCKUP_WIDTH = 375;
const MOCKUP_HEIGHT = 812;
const COLOR_TEXT_BLACK = '#000000';
const COLOR_TIMESTAMP_GREY = '#808080';
const COLOR_BUBBLE_INPUT_WHITE = '#FFFFFF';
const COLOR_PROFILE_RED = '#FF0000';
const PADDING_NEW = 15;
const FONT_FAMILY_NEW = 'Arial Rounded MT Bold, sans-serif';
const HEADER_Y_POSITION = 44 + 28; // Middle of the header area
const PROFILE_CIRCLE_X = 50; // Profile circle position
const PROFILE_CIRCLE_RADIUS = 18;
const USERNAME_X = PROFILE_CIRCLE_X + PROFILE_CIRCLE_RADIUS + 5; // Reduced offset from profile

// Change these constants to position time in top left - move more left and further down
const STATUS_BAR_TIME_X = 22; // Decreased from 25 to move a tiny bit more to the left
const STATUS_BAR_TIME_Y = 27; // Increased from 26 to move a tiny bit more down

function drawText(ctx, text, x, y, font, color, align = 'left', baseline = 'middle') {
  ctx.fillStyle = color;
  ctx.font = font;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  ctx.fillText(text, x, y);
}

function drawRoundedRect(ctx, x, y, width, height, radius, fill) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function wrapText(ctx, text, maxWidth) {
  let words = text.split(' ');
  let lines = [];
  let currentLine = words[0];
  for (let i = 1; i < words.length; i++) {
    const testLine = currentLine + " " + words[i];
    if (ctx.measureText(testLine).width < maxWidth) {
      currentLine = testLine;
    } else {
      lines.push(currentLine);
      currentLine = words[i];
    }
  }
  lines.push(currentLine);
  return lines;
}

function getCurrentTime() {
  let now = new Date();
  let hours = now.getHours();
  let minutes = now.getMinutes().toString().padStart(2, '0');
  let suffix = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${suffix}`;
}

async function drawChatMessage(ctx, messageContent) {
  const bubbleX = PADDING_NEW;
  const bubbleY = 120; // Position the bubble below the header
  const bubbleWidth = MOCKUP_WIDTH * 0.50;
  const bubbleMinHeight = 50;
  const textPadding = 10;
  
  ctx.font = `16px "Arial Rounded MT"`;
  const availableTextWidth = bubbleWidth - 2 * textPadding;
  const lines = wrapText(ctx, messageContent, availableTextWidth);
  const lineHeight = 20;
  const textHeight = lines.length * lineHeight;
  const bubbleHeight = Math.max(bubbleMinHeight, textHeight + 2 * textPadding + 15);
  const bubbleRadius = 15;
  const tailSize = 10;
  
  // Draw message bubble
  drawRoundedRect(ctx, bubbleX, bubbleY, bubbleWidth, bubbleHeight, bubbleRadius, COLOR_BUBBLE_INPUT_WHITE);
  
  // Draw bubble tail
  ctx.beginPath();
  ctx.moveTo(bubbleX, bubbleY + bubbleHeight - bubbleRadius);
  ctx.lineTo(bubbleX - tailSize / 1.5, bubbleY + bubbleHeight + tailSize / 2);
  ctx.lineTo(bubbleX + bubbleRadius, bubbleY + bubbleHeight);
  ctx.closePath();
  ctx.fillStyle = COLOR_BUBBLE_INPUT_WHITE;
  ctx.fill();
  
  // Draw message text
  ctx.fillStyle = COLOR_TEXT_BLACK;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  lines.forEach((line, index) => {
    ctx.fillText(line, bubbleX + textPadding, bubbleY + textPadding + index * lineHeight);
  });
  
  // Draw timestamp
  drawText(ctx, getCurrentTime(), bubbleX + bubbleWidth - textPadding, bubbleY + bubbleHeight - textPadding + 5, 
    `11px ${FONT_FAMILY_NEW}`, COLOR_TIMESTAMP_GREY, 'right', 'bottom');
}

async function drawProfileAndName(ctx, name, profile) {
  // Draw profile picture
  try {
    const profilePic = await loadImage(profile);
    ctx.save();
    ctx.beginPath();
    ctx.arc(PROFILE_CIRCLE_X, HEADER_Y_POSITION, PROFILE_CIRCLE_RADIUS, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(profilePic, 
      PROFILE_CIRCLE_X - PROFILE_CIRCLE_RADIUS, 
      HEADER_Y_POSITION - PROFILE_CIRCLE_RADIUS, 
      PROFILE_CIRCLE_RADIUS * 2, 
      PROFILE_CIRCLE_RADIUS * 2);
    ctx.restore();
  } catch (error) {
    // Fallback to red circle if profile image fails to load
    ctx.fillStyle = COLOR_PROFILE_RED;
    ctx.beginPath();
    ctx.arc(PROFILE_CIRCLE_X, HEADER_Y_POSITION, PROFILE_CIRCLE_RADIUS, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Draw username
  drawText(ctx, name, USERNAME_X, HEADER_Y_POSITION, `bold 17px ${FONT_FAMILY_NEW}`, COLOR_TEXT_BLACK, 'left');
}

// Update the drawStatusBarTime function to use left alignment
async function drawStatusBarTime(ctx) {
  const currentTime = getCurrentTime();
  drawText(
    ctx, 
    currentTime, 
    STATUS_BAR_TIME_X, 
    STATUS_BAR_TIME_Y, 
    `bold 14px ${FONT_FAMILY_NEW}`, 
    COLOR_TEXT_BLACK,
    'left' // Changed from 'center' to 'left'
  );
}

export async function generateImageWithText(name, profile, message) {
  // Increase the scale factor for a higher resolution output
  const scale = 3;
  const canvas = createCanvas(MOCKUP_WIDTH * scale, MOCKUP_HEIGHT * scale);
  const ctx = canvas.getContext("2d");
  ctx.scale(scale, scale);
  
  // Enable high quality image smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  
  try {
    // Load the high resolution WhatsApp screenshot as background
    const background = await loadImage(path.join(process.cwd(), "Images/whatsapp.png"));
    ctx.drawImage(background, 0, 0, MOCKUP_WIDTH, MOCKUP_HEIGHT);
  } catch (error) {
    console.error("Could not load WhatsApp background:", error);
    // White fallback if image can't be loaded
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, MOCKUP_WIDTH, MOCKUP_HEIGHT);
  }
  
  // Draw all the custom elements
  await drawStatusBarTime(ctx); 
  await drawProfileAndName(ctx, name, profile);
  await drawChatMessage(ctx, message);
  
  const buffer = canvas.toBuffer("image/png");
  const filename = `image-${Date.now()}.png`;
  fs.writeFileSync(path.join(generatedDir, filename), buffer);
  return `Generated/${filename}`;
}