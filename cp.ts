import cpFile from 'cp-file'
 
(async () => {
    await cpFile('src/type.d.ts', 'dist/types/type.d.ts');
    console.log('File copied: type.d.ts');
})();