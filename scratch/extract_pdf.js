const fs = require('fs');
const pdf = require('pdf-parse');

async function extract() {
    try {
        const dataBuffer = fs.readFileSync('d:/Tai_Lieu_Hoc_Tap/KLTN/KL_09_05/Event-Management-Portal/CSDL.pdf');
        const data = await pdf(dataBuffer);
        console.log("---START---");
        console.log(data.text);
        console.log("---END---");
    } catch (e) {
        console.error(e);
    }
}

extract();
