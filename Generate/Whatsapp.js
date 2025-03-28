import { createCanvas, loadImage } from "canvas";
import fs from "fs";
import path from "path";

const generatedDir = path.join(process.cwd(), "Generated");
if (!fs.existsSync(generatedDir)) fs.mkdirSync(generatedDir);

const MOCKUP_WIDTH = 375;
const MOCKUP_HEIGHT = 812;
const COLOR_CHAT_BG_NEW = '#F8F8F0';
const COLOR_BAR_BG_NEW = '#FAFAFA';
const COLOR_TEXT_BLACK = '#000000';
const COLOR_TIMESTAMP_GREY = '#808080';
const COLOR_BUBBLE_INPUT_WHITE = '#FFFFFF';
const COLOR_PROFILE_RED = '#FF0000';
const STATUS_BAR_HEIGHT_NEW = 44;
const HEADER_HEIGHT_NEW = 56;
const INPUT_BAR_HEIGHT_NEW = 50;
const HOME_INDICATOR_AREA_HEIGHT = 34;
const INPUT_BAR_Y_POSITION = MOCKUP_HEIGHT - HOME_INDICATOR_AREA_HEIGHT - INPUT_BAR_HEIGHT_NEW;
const CHAT_AREA_Y_START = STATUS_BAR_HEIGHT_NEW + HEADER_HEIGHT_NEW;
const CHAT_AREA_HEIGHT = INPUT_BAR_Y_POSITION - CHAT_AREA_Y_START;
const PADDING_NEW = 15;
const FONT_FAMILY_NEW = 'Arial Rounded MT Bold, sans-serif';

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

async function drawStatusBarNew(ctx) {
  const V_CENTER = STATUS_BAR_HEIGHT_NEW / 2 + 2;
  drawText(ctx, getCurrentTime(), PADDING_NEW, V_CENTER, `15px ${FONT_FAMILY_NEW}`, COLOR_TEXT_BLACK, 'left');
  const desiredIconHeight = 18;
  const topIcons = await loadImage(path.join(process.cwd(), "topicons.png"));
  const iconsDrawWidth = desiredIconHeight * (topIcons.width / topIcons.height);
  const iconsX = MOCKUP_WIDTH - PADDING_NEW - iconsDrawWidth;
  ctx.drawImage(topIcons, iconsX, V_CENTER - desiredIconHeight / 2, iconsDrawWidth, desiredIconHeight);
}

async function drawHeaderNew(ctx, name, profile) {
  const startY = STATUS_BAR_HEIGHT_NEW;
  const V_CENTER = startY + HEADER_HEIGHT_NEW / 2;
  const iconSize = 22;
  ctx.strokeStyle = COLOR_TEXT_BLACK;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(PADDING_NEW + 7, V_CENTER - 7);
  ctx.lineTo(PADDING_NEW, V_CENTER);
  ctx.lineTo(PADDING_NEW + 7, V_CENTER + 7);
  ctx.stroke();
  
  const xOffset = 10;
  let currentX = PADDING_NEW + 15;
  const circleRadius = iconSize * 0.8;
  try {
    const profilePic = await loadImage(profile);
    ctx.save();
    ctx.beginPath();
    ctx.arc(currentX + circleRadius + xOffset, V_CENTER, circleRadius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(profilePic, currentX + xOffset, V_CENTER - circleRadius, circleRadius * 2, circleRadius * 2);
    ctx.restore();
  } catch (error) {
    ctx.fillStyle = COLOR_PROFILE_RED;
    ctx.beginPath();
    ctx.arc(currentX + circleRadius + xOffset, V_CENTER, circleRadius, 0, Math.PI * 2);
    ctx.fill();
  }
  
  currentX += circleRadius * 2 + 10;
  const usernameOffset = 10;
  drawText(ctx, name, currentX + usernameOffset, V_CENTER, `bold 17px ${FONT_FAMILY_NEW}`, COLOR_TEXT_BLACK, 'left');
  
  currentX = MOCKUP_WIDTH - PADDING_NEW;
  const iconSpacing = 20;
  const facetimeIcon = await loadImage(path.join(process.cwd(), "callicon.png"));
  const facetimeDrawHeight = iconSize;
  const facetimeDrawWidth = facetimeDrawHeight * (facetimeIcon.width / facetimeIcon.height);
  ctx.drawImage(facetimeIcon, currentX - facetimeDrawWidth, V_CENTER - facetimeDrawHeight / 2, facetimeDrawWidth, facetimeDrawHeight);
  currentX -= (facetimeDrawWidth + iconSpacing);
  const callIcon = await loadImage(path.join(process.cwd(), "callicon2.png"));
  const callDrawHeight = iconSize;
  const callDrawWidth = callDrawHeight * (callIcon.width / callIcon.height);
  ctx.drawImage(callIcon, currentX - callDrawWidth, V_CENTER - callDrawHeight / 2, callDrawWidth, callDrawHeight);
}

function drawChatAreaNew(ctx, messageContent) {
  const startY = CHAT_AREA_Y_START;
  ctx.fillStyle = COLOR_CHAT_BG_NEW;
  ctx.fillRect(0, startY, MOCKUP_WIDTH, CHAT_AREA_HEIGHT);
  
  const bubbleX = PADDING_NEW;
  const bubbleY = startY + PADDING_NEW;
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
  drawRoundedRect(ctx, bubbleX, bubbleY, bubbleWidth, bubbleHeight, bubbleRadius, COLOR_BUBBLE_INPUT_WHITE);
  ctx.beginPath();
  ctx.moveTo(bubbleX, bubbleY + bubbleHeight - bubbleRadius);
  ctx.lineTo(bubbleX - tailSize / 1.5, bubbleY + bubbleHeight + tailSize / 2);
  ctx.lineTo(bubbleX + bubbleRadius, bubbleY + bubbleHeight);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = COLOR_TEXT_BLACK;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  lines.forEach((line, index) => {
    ctx.fillText(line, bubbleX + textPadding, bubbleY + textPadding + index * lineHeight);
  });
  drawText(ctx, getCurrentTime(), bubbleX + bubbleWidth - textPadding, bubbleY + bubbleHeight - textPadding + 5, `11px ${FONT_FAMILY_NEW}`, COLOR_TIMESTAMP_GREY, 'right', 'bottom');
}

async function drawInputBarNew(ctx) {
  const startY = INPUT_BAR_Y_POSITION;
  const V_CENTER = startY + INPUT_BAR_HEIGHT_NEW / 2;
  const iconSize = 24;
  let currentX = PADDING_NEW;
  
  ctx.strokeStyle = COLOR_TEXT_BLACK;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(currentX + iconSize / 2, V_CENTER - (iconSize / 2 * 0.6));
  ctx.lineTo(currentX + iconSize / 2, V_CENTER + (iconSize / 2 * 0.6));
  ctx.moveTo(currentX + iconSize / 2 * 0.4, V_CENTER);
  ctx.lineTo(currentX + iconSize / 2 * 1.6, V_CENTER);
  ctx.stroke();
  currentX += iconSize + 10;
  
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  let rightIconX = MOCKUP_WIDTH - PADDING_NEW;
  const iconSpacing = 18;
  const micIcon = await loadImage(path.join(process.cwd(), "mic.png"));
  const micDrawHeight = iconSize;
  const micDrawWidth = micDrawHeight * (micIcon.width / micIcon.height);
  ctx.drawImage(micIcon, rightIconX - micDrawWidth, V_CENTER - micDrawHeight / 2, micDrawWidth, micDrawHeight);
  rightIconX -= (micDrawWidth + iconSpacing);
  const cameraIcon = await loadImage(path.join(process.cwd(), "camera.png"));
  const camDrawHeight = iconSize;
  const camDrawWidth = camDrawHeight * (cameraIcon.width / cameraIcon.height);
  ctx.drawImage(cameraIcon, rightIconX - camDrawWidth, V_CENTER - camDrawHeight / 2, camDrawWidth, camDrawHeight);
  rightIconX -= (camDrawWidth + iconSpacing);
  const stickerIcon = await loadImage(path.join(process.cwd(), "sticker.png"));
  const stickerDrawHeight = iconSize;
  const stickerDrawWidth = stickerDrawHeight * (stickerIcon.width / stickerIcon.height);
  ctx.drawImage(stickerIcon, rightIconX - stickerDrawWidth, V_CENTER - stickerDrawHeight / 2, stickerDrawWidth, stickerDrawHeight);
  
  const inputFieldX = currentX;
  const extraWidth = 20;
  const inputFieldWidth = (rightIconX - iconSpacing) - inputFieldX + extraWidth;
  const inputFieldHeight = INPUT_BAR_HEIGHT_NEW - 14;
  const inputFieldY = V_CENTER - inputFieldHeight / 2;
  drawRoundedRect(ctx, inputFieldX, inputFieldY, inputFieldWidth, inputFieldHeight, inputFieldHeight / 2, COLOR_BUBBLE_INPUT_WHITE);
}

function drawHomeIndicatorNew(ctx) {
  const indicatorY = MOCKUP_HEIGHT - HOME_INDICATOR_AREA_HEIGHT / 2 - 2;
  const indicatorWidth = 134;
  const indicatorHeight = 5;
  drawRoundedRect(ctx, (MOCKUP_WIDTH - indicatorWidth) / 2, indicatorY, indicatorWidth, indicatorHeight, indicatorHeight / 2, COLOR_TEXT_BLACK);
}

export async function generateImageWithText(name, profile, message) {
  const scale = 2;
  const canvas = createCanvas(MOCKUP_WIDTH * scale, MOCKUP_HEIGHT * scale);
  const ctx = canvas.getContext("2d");
  ctx.scale(scale, scale);
  ctx.fillStyle = COLOR_BAR_BG_NEW;
  ctx.fillRect(0, 0, MOCKUP_WIDTH, MOCKUP_HEIGHT);
  drawChatAreaNew(ctx, message);
  await drawStatusBarNew(ctx);
  await drawHeaderNew(ctx, name, profile);
  await drawInputBarNew(ctx);
  drawHomeIndicatorNew(ctx);
  const buffer = canvas.toBuffer("image/png");
  const filename = `image-${Date.now()}.png`;
  fs.writeFileSync(path.join(generatedDir, filename), buffer);
  return `Generated/${filename}`;
}