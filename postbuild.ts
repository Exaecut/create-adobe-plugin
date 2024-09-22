import { readFile, writeFile } from "fs/promises";

import path from "path";

// Path to the compiled output file
const outputFilePath = path.join(import.meta.dir, 'dist', 'index.js');

// Add the shebang at the top
const shebang = '';

(async () => {
  const fileContent = await readFile(outputFilePath, 'utf-8');
  const updatedContent = shebang + fileContent;
  await writeFile(outputFilePath, updatedContent);
  console.log('Shebang added to dist/index.js');
})();
