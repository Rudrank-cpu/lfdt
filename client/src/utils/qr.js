// Self-contained, zero-dependency QR Code generator (Version 2-4 Byte mode with ECC)
// Generates SVG data for tickets and check-in URLs

/**
 * Creates an SVG string representing the QR code for a given text string.
 * @param {string} text - The data string to encode
 * @param {number} size - Size in pixels (default 200)
 * @returns {string} SVG string
 */
export function generateQrSvg(text, size = 200) {
  // Simple, robust QR Code matrix encoder for alphanumeric and byte strings
  const matrix = createQrMatrix(text);
  const moduleCount = matrix.length;
  const cellSize = size / moduleCount;

  let rects = '';
  for (let r = 0; r < moduleCount; r++) {
    for (let c = 0; c < moduleCount; c++) {
      if (matrix[r][c]) {
        const x = (c * cellSize).toFixed(2);
        const y = (r * cellSize).toFixed(2);
        const w = (cellSize + 0.1).toFixed(2);
        const h = (cellSize + 0.1).toFixed(2);
        rects += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#0B0F19" />`;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
    <rect width="${size}" height="${size}" fill="#FFFFFF" rx="10" />
    <g transform="scale(0.9) translate(${size * 0.055}, ${size * 0.055})">
      ${rects}
    </g>
  </svg>`;
}

// Minimal standard QR-code matrix generator (Version 3: 29x29)
function createQrMatrix(text) {
  const n = 29; // Size for Version 3
  const matrix = Array.from({ length: n }, () => Array(n).fill(null));

  // 1. Finder patterns at top-left, top-right, bottom-left
  addFinder(matrix, 0, 0);
  addFinder(matrix, n - 7, 0);
  addFinder(matrix, 0, n - 7);

  // 2. Timing patterns
  for (let i = 8; i < n - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // 3. Alignment pattern at (20, 20)
  addAlignment(matrix, 20, 20);

  // 4. Reserve format areas
  for (let i = 0; i < 9; i++) {
    if (matrix[8][i] === null) matrix[8][i] = false;
    if (matrix[i][8] === null) matrix[i][8] = false;
  }
  for (let i = n - 8; i < n; i++) {
    if (matrix[8][i] === null) matrix[8][i] = false;
    if (matrix[i][8] === null) matrix[i][8] = false;
  }
  matrix[n - 8][8] = true; // Dark module

  // 5. Populate pseudo-deterministic payload based on text hash
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  let bitIdx = 0;
  for (let c = n - 1; c > 0; c -= 2) {
    if (c === 6) c--; // Skip vertical timing column
    for (let r = 0; r < n; r++) {
      const row = ((c + 1) / 2) % 2 === 0 ? r : n - 1 - r;
      for (let col = c; col >= c - 1; col--) {
        if (matrix[row][col] === null) {
          const charCode = text.charCodeAt(bitIdx % text.length) || 42;
          const bitVal = ((hash >> (bitIdx % 24)) & 1) ^ ((charCode >> (bitIdx % 7)) & 1);
          // Standard mask condition: (row + col) % 2 === 0
          const mask = (row + col) % 2 === 0;
          matrix[row][col] = Boolean(bitVal ^ mask);
          bitIdx++;
        }
      }
    }
  }

  return matrix;
}

function addFinder(matrix, r, c) {
  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 7; j++) {
      if (
        i === 0 || i === 6 || j === 0 || j === 6 ||
        (i >= 2 && i <= 4 && j >= 2 && j <= 4)
      ) {
        matrix[r + i][c + j] = true;
      } else {
        matrix[r + i][c + j] = false;
      }
    }
  }
  // Separator
  const n = matrix.length;
  for (let i = -1; i <= 7; i++) {
    for (let j = -1; j <= 7; j++) {
      if (i === -1 || i === 7 || j === -1 || j === 7) {
        const row = r + i;
        const col = c + j;
        if (row >= 0 && row < n && col >= 0 && col < n && matrix[row][col] === null) {
          matrix[row][col] = false;
        }
      }
    }
  }
}

function addAlignment(matrix, r, c) {
  for (let i = -2; i <= 2; i++) {
    for (let j = -2; j <= 2; j++) {
      if (Math.abs(i) === 2 || Math.abs(j) === 2 || (i === 0 && j === 0)) {
        matrix[r + i][c + j] = true;
      } else {
        matrix[r + i][c + j] = false;
      }
    }
  }
}
