import { createCanvas } from "canvas";
import fs from "fs";
import path from "path";
import sharp from "sharp";

const generatedDir = path.join(process.cwd(), "Generated");

if (!fs.existsSync(generatedDir)) {
    fs.mkdirSync(generatedDir);
}

// --- Constanten & Variabelen voor Mockup ---
const MOCKUP_WIDTH = 375;
const MOCKUP_HEIGHT = 812;

// Kleuren
const COLOR_IOS_BLUE = '#007AFF';
const COLOR_RED_CIRCLE = '#FF3B30';
const COLOR_WHITE = '#FFFFFF';
const COLOR_BLACK_TEXT = '#333333';
const COLOR_GREY_TEXT_LIGHT = '#8E8E93';
const COLOR_GREY_TEXT_PLACEHOLDER = '#C7C7CD';
const COLOR_GREY_LINE = '#D1D1D6';
const COLOR_GREY_ICON_BG = '#D1D1D6';
const COLOR_CHAT_BG = '#FDF7E4';
const COLOR_CHAT_BG_PATTERN = '#E0D8C8';
const COLOR_STATUS_BAR_BG = '#FFFFFF';
const COLOR_INPUT_BAR_BG = '#F8F8F8';

// Placeholders (standaardwaarden)
const DEFAULT_USERNAME = 'LingoUser'; // Gebruikt als ${USERNAME}
const DEFAULT_TIMESTAMP = new Date().toLocaleTimeString('en-US', { hour12: false }); // Gebruikt als ${TIMESTAMP}

// Afmetingen
const STATUS_BAR_HEIGHT = 44;
const HEADER_HEIGHT = 56;
const INPUT_BAR_HEIGHT = 50;
const PADDING = 15;
const FONT_FAMILY = 'Arial, sans-serif'; // Veilige fallback voor node-canvas

// --- Helper Functies (accept ctx) ---

function drawText(ctx, text, x, y, font, color, align = 'left', baseline = 'top') {
    ctx.fillStyle = color;
    ctx.font = font;
    ctx.textAlign = align;
    ctx.textBaseline = baseline;
    ctx.fillText(text, x, y);
}

function drawRoundedRect(ctx, x, y, width, height, radius, fill, stroke) {
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
    if (fill) {
        ctx.fillStyle = fill;
        ctx.fill();
    }
    if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 1;
        ctx.stroke();
    }
}

function drawChatBackgroundPattern(ctx, startY, endY) {
    ctx.strokeStyle = COLOR_CHAT_BG_PATTERN;
    ctx.lineWidth = 0.5;
    ctx.save();
    ctx.globalAlpha = 0.2;
    const patternSize = 40;
    const iconSize = 10;

    for (let y = startY; y < endY; y += patternSize) {
        for (let x = 0; x < MOCKUP_WIDTH; x += patternSize) {
            const drawX = x + Math.random() * (patternSize - iconSize);
            const drawY = y + Math.random() * (patternSize - iconSize);
            const rand = Math.random();
            ctx.beginPath();
            if (rand < 0.2) { 
                ctx.arc(drawX + iconSize / 2, drawY + iconSize / 2, iconSize / 2, 0, Math.PI * 2); 
            } else if (rand < 0.4) { 
                ctx.rect(drawX, drawY, iconSize, iconSize); 
            } else if (rand < 0.6) { 
                ctx.moveTo(drawX, drawY); 
                ctx.lineTo(drawX + iconSize, drawY + iconSize); 
            } else if (rand < 0.8) { 
                ctx.moveTo(drawX, drawY + iconSize); 
                ctx.lineTo(drawX + iconSize / 2, drawY); 
                ctx.lineTo(drawX + iconSize, drawY + iconSize); 
                ctx.closePath(); 
            } else { 
                ctx.moveTo(drawX, drawY); 
                ctx.lineTo(drawX + iconSize, drawY + iconSize); 
                ctx.moveTo(drawX + iconSize, drawY); 
                ctx.lineTo(drawX, drawY + iconSize); 
            }
            ctx.stroke();
        }
    }
    ctx.restore();
    ctx.lineWidth = 1;
}

// Nieuwe helper: wrap tekst als deze te lang is (ongeveer 18 karakters per regel)
function drawWrappedText(ctx, text, x, y, maxChars = 18, lineHeight = 20, font = `16px ${FONT_FAMILY}`, color = COLOR_BLACK_TEXT, align = 'left', baseline = 'top') {
    ctx.font = font;
    ctx.fillStyle = color;
    // Simpele aanpak: splits de tekst elke maxChars karakters
    const lines = [];
    for (let i = 0; i < text.length; i += maxChars) {
        lines.push(text.substr(i, maxChars));
    }
    lines.forEach((line, index) => {
        ctx.fillText(line, x, y + index * lineHeight);
    });
}

// Helper function to wrap text and return an array of lines
function wrapText(text, maxChars = 25) {
    const lines = [];
    for (let i = 0; i < text.length; i += maxChars) {
        lines.push(text.substr(i, maxChars));
    }
    return lines;
}

// --- Teken Functies per Sectie (accept ctx) ---

function drawStatusBar(ctx) {
    ctx.fillStyle = COLOR_STATUS_BAR_BG;
    ctx.fillRect(0, 0, MOCKUP_WIDTH, STATUS_BAR_HEIGHT);
    const V_CENTER = STATUS_BAR_HEIGHT / 2 + 5;
    let currentX = PADDING;
    const dotRadius = 2;
    const dotSpacing = 5;
    ctx.fillStyle = COLOR_BLACK_TEXT;
    ctx.strokeStyle = COLOR_BLACK_TEXT;
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(currentX + i * dotSpacing, V_CENTER - dotRadius, dotRadius, 0, Math.PI * 2);
        if (i < 3) ctx.fill(); else ctx.stroke();
    }
    currentX += 5 * dotSpacing + 5;
    drawText(ctx, 'LingoLens', currentX, V_CENTER, `12px ${FONT_FAMILY}`, COLOR_BLACK_TEXT, 'left', 'middle');
    currentX += ctx.measureText('LingoLens').width + 10;
    const wifiY = V_CENTER - 6;
    ctx.strokeStyle = COLOR_BLACK_TEXT;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(currentX, wifiY + 6, 8, -Math.PI * 0.4, -Math.PI * 0.1);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(currentX, wifiY + 6, 5, -Math.PI * 0.5, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(currentX, wifiY + 6, 2, -Math.PI * 0.6, -Math.PI * 0.05);
    ctx.stroke();
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const currentTime = `${hours}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}`;
    drawText(ctx, currentTime, MOCKUP_WIDTH / 2, V_CENTER, `bold 14px ${FONT_FAMILY}`, COLOR_BLACK_TEXT, 'center', 'middle');
    currentX = MOCKUP_WIDTH - PADDING;
    const batteryWidth = 22;
    const batteryHeight = 11;
    const batteryY = V_CENTER - batteryHeight / 2;
    ctx.strokeStyle = COLOR_BLACK_TEXT;
    ctx.lineWidth = 1;
    ctx.strokeRect(currentX - batteryWidth - 5, batteryY, batteryWidth, batteryHeight);
    ctx.fillStyle = COLOR_BLACK_TEXT;
    ctx.fillRect(currentX - 5, batteryY + batteryHeight / 4, 2, batteryHeight / 2);
    const fillWidth = batteryWidth * 0.69;
    ctx.fillRect(currentX - batteryWidth - 5 + (batteryWidth - fillWidth) + 1, batteryY + 1.5, fillWidth - 2, batteryHeight - 3);
    drawText(ctx, '69%', currentX - batteryWidth - 10, V_CENTER, `12px ${FONT_FAMILY}`, COLOR_BLACK_TEXT, 'right', 'middle');
}

function drawHeader(ctx, username) {
    const startY = STATUS_BAR_HEIGHT;
    ctx.fillStyle = COLOR_WHITE;
    ctx.fillRect(0, startY, MOCKUP_WIDTH, HEADER_HEIGHT);
    const V_CENTER = startY + HEADER_HEIGHT / 2;
    const chevronSize = 20;
    ctx.strokeStyle = COLOR_IOS_BLUE;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(PADDING + chevronSize / 3, V_CENTER - chevronSize / 3);
    ctx.lineTo(PADDING, V_CENTER);
    ctx.lineTo(PADDING + chevronSize / 3, V_CENTER + chevronSize / 3);
    ctx.stroke();
    drawText(ctx, 'Chats', PADDING + chevronSize / 2 + 5, V_CENTER, `16px ${FONT_FAMILY}`, COLOR_IOS_BLUE, 'left', 'middle');
    // Gebruik de meegegeven username of DEFAULT_USERNAME
    drawText(ctx, username || DEFAULT_USERNAME, MOCKUP_WIDTH / 2, V_CENTER - 7, `bold 17px ${FONT_FAMILY}`, COLOR_BLACK_TEXT, 'center', 'middle');
    drawText(ctx, 'online', MOCKUP_WIDTH / 2, V_CENTER + 10, `12px ${FONT_FAMILY}`, COLOR_GREY_TEXT_LIGHT, 'center', 'middle');
    const circleRadius = HEADER_HEIGHT / 2 - 8;
    ctx.fillStyle = COLOR_RED_CIRCLE;
    ctx.beginPath();
    ctx.arc(MOCKUP_WIDTH - PADDING - circleRadius, V_CENTER, circleRadius, 0, Math.PI * 2);
    ctx.fill();
}

function drawChatArea(ctx, messageContent) {
    const startY = STATUS_BAR_HEIGHT + HEADER_HEIGHT;
    const chatHeight = MOCKUP_HEIGHT - startY - INPUT_BAR_HEIGHT;
    ctx.fillStyle = COLOR_CHAT_BG;
    ctx.fillRect(0, startY, MOCKUP_WIDTH, chatHeight);
    drawChatBackgroundPattern(ctx, startY, startY + chatHeight);
    
    const bubbleX = PADDING;
    const bubbleY = startY + PADDING;
    const bubbleWidth = MOCKUP_WIDTH * 0.7;
    const bubbleRadius = 15;
    const tailSize = 10;
    
    const textPadding = 10;
    const extraTextOffset = 5; // Additional offset for text positioning
    const maxChars = 30; // Allows more text per line
    const lineHeight = 20;
    
    // Wrap the message to calculate necessary bubble height
    const lines = wrapText(messageContent, maxChars);
    const bubbleHeight = (lines.length * lineHeight) + (2 * textPadding) + extraTextOffset;
    
    // Draw the bubble background with dynamic height
    drawRoundedRect(ctx, bubbleX, bubbleY, bubbleWidth, bubbleHeight, bubbleRadius, COLOR_WHITE, null);
    ctx.fillStyle = COLOR_WHITE;
    ctx.beginPath();
    ctx.moveTo(bubbleX, bubbleY + bubbleHeight - bubbleRadius);
    ctx.lineTo(bubbleX - tailSize / 2, bubbleY + bubbleHeight + tailSize / 2);
    ctx.lineTo(bubbleX + bubbleRadius, bubbleY + bubbleHeight);
    ctx.closePath();
    ctx.fill();
    
    // Draw the wrapped text (text placement remains as before)
    drawWrappedText(
        ctx,
        messageContent,
        bubbleX + textPadding,
        bubbleY + textPadding + extraTextOffset + 5, // 5 pixels lower
        maxChars,
        lineHeight,
        `16px ${FONT_FAMILY}`,
        COLOR_BLACK_TEXT,
        'left',
        'top'
    );
    
    // Draw the timestamp at the bottom right of the bubble
    drawText(
        ctx,
        DEFAULT_TIMESTAMP,
        bubbleX + bubbleWidth - textPadding,
        bubbleY + bubbleHeight - textPadding,
        `11px ${FONT_FAMILY}`,
        COLOR_GREY_TEXT_LIGHT,
        'right',
        'bottom'
    );
}

function drawInputBar(ctx) {
    const startY = MOCKUP_HEIGHT - INPUT_BAR_HEIGHT;
    ctx.strokeStyle = COLOR_GREY_LINE;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, startY);
    ctx.lineTo(MOCKUP_WIDTH, startY);
    ctx.stroke();
    ctx.fillStyle = COLOR_INPUT_BAR_BG;
    ctx.fillRect(0, startY, MOCKUP_WIDTH, INPUT_BAR_HEIGHT);
    const V_CENTER = startY + INPUT_BAR_HEIGHT / 2;
    const iconRadius = INPUT_BAR_HEIGHT / 2 - 12;
    const iconX = PADDING + iconRadius;
    ctx.strokeStyle = COLOR_GREY_ICON_BG;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(iconX, V_CENTER, iconRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = COLOR_IOS_BLUE;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(iconX, V_CENTER - iconRadius * 0.4);
    ctx.lineTo(iconX, V_CENTER + iconRadius * 0.4);
    ctx.moveTo(iconX - iconRadius * 0.4, V_CENTER);
    ctx.lineTo(iconX, V_CENTER - iconRadius * 0.4);
    ctx.lineTo(iconX + iconRadius * 0.4, V_CENTER);
    ctx.stroke();
    const inputFieldX = iconX + iconRadius + 10;
    const micIconSize = 25;
    const inputFieldWidth = MOCKUP_WIDTH - inputFieldX - PADDING - micIconSize - 10;
    const inputFieldHeight = INPUT_BAR_HEIGHT - 16;
    const inputFieldY = V_CENTER - inputFieldHeight / 2;
    drawRoundedRect(ctx, inputFieldX, inputFieldY, inputFieldWidth, inputFieldHeight, inputFieldHeight / 2, COLOR_WHITE, COLOR_GREY_LINE);
    drawText(ctx, 'Message', inputFieldX + 12, V_CENTER, `16px ${FONT_FAMILY}`, COLOR_GREY_TEXT_PLACEHOLDER, 'left', 'middle');
    const micX = MOCKUP_WIDTH - PADDING - micIconSize / 2;
    ctx.strokeStyle = COLOR_IOS_BLUE;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(micX, V_CENTER - 3, micIconSize * 0.3, 0, Math.PI * 2);
    ctx.moveTo(micX, V_CENTER - 3 + micIconSize * 0.3);
    ctx.lineTo(micX, V_CENTER + 4);
    ctx.moveTo(micX - micIconSize * 0.2, V_CENTER + 6);
    ctx.lineTo(micX + micIconSize * 0.2, V_CENTER + 6);
    ctx.stroke();
}

// --- Hoofd Functie (aangepast) ---

export async function generateImageWithText(username, message) {
    const scale = 3; // Increased scale factor for a sharper image
    const canvas = createCanvas(MOCKUP_WIDTH * scale, MOCKUP_HEIGHT * scale);
    const ctx = canvas.getContext("2d");

    // Scale the drawing context for higher resolution
    ctx.scale(scale, scale);

    // --- Draw the Chat Mockup ---
    ctx.fillStyle = COLOR_WHITE;
    ctx.fillRect(0, 0, MOCKUP_WIDTH, MOCKUP_HEIGHT);

    drawChatArea(ctx, message); // Use message for the bubble content
    drawStatusBar(ctx);
    drawHeader(ctx, username); // Pass the username
    drawInputBar(ctx);
    // --- End Chat Mockup Drawing ---

    // First, generate a PNG buffer with high compression
    const buffer = canvas.toBuffer("image/png", { compressionLevel: 9 });
    
    // Use sharp to further compress the PNG by converting it to a paletted image
    const optimizedBuffer = await sharp(buffer)
        .png({ compressionLevel: 9, palette: true })  // Enable palette mode for smaller file size
        .toBuffer();

    const timestamp = Date.now();
    const filename = `image-${timestamp}.png`; // Keep .png extension
    const filepath = path.join(generatedDir, filename);
    fs.writeFileSync(filepath, optimizedBuffer);
    console.log(`File created at ${new Date(timestamp).toLocaleTimeString('en-US', { hour12: false })}: ${filename}`);

    return `Generated/${filename}`;
}
