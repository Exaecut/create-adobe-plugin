import { readFile, writeFile } from "fs/promises";

import fs from "fs";
import path from "path";

// Path to the compiled output file
const outputFilePath = path.join(import.meta.dir, 'dist', 'index.js');

// Add the shebang at the top
const shebang = '';

(async () => {
  const fileContent = await readFile(outputFilePath, 'utf-8');
  const updatedContent = shebang + fileContent;
  await writeFile(outputFilePath, updatedContent);
  
  await fs.rmdirSync(path.join(import.meta.dir, 'dist', 'template'), { recursive: true });
  await fs.cp(path.join(import.meta.dir, 'template'), path.join(import.meta.dir, 'dist', 'template'), { recursive: true }, (error) => {
    if (error) {
      throw error;
    }
  });
  console.log('Copied template folder to dist/template');
  
  await fs.rmdirSync(path.join(import.meta.dir, 'dist', 'scripts'), { recursive: true });
  await fs.cp(path.join(import.meta.dir, 'scripts'), path.join(import.meta.dir, 'dist', 'scripts'), { recursive: true }, (error) => {
    if (error) {
      throw error;
    }
  });
  console.log('Copied scripts folder to dist/scripts');

})();
