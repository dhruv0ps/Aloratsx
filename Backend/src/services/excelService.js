const fs = require('fs').promises;
const csv = require('csv-parser');
const xlsx = require('xlsx');

class ExcelService {
    parseExcel(filePath) {
        try {
            const workbook = xlsx.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            return xlsx.utils.sheet_to_json(worksheet);
        } catch (error) {
            throw new Error(`Error parsing Excel file: ${error.message}`);
        }
    }

    parseCSV(filePath) {
        return new Promise((resolve, reject) => {
            const results = [];
            fs.createReadStream(filePath)
                .pipe(csv())
                .on('data', (data) => results.push(data))
                .on('end', () => resolve(results))
                .on('error', (error) => reject(error));
        });
    }

    async cleanupFile(filePath) {
        try {
            await fs.unlink(filePath);
            console.log('Temporary file deleted successfully');
        } catch (error) {
            console.error('Error deleting temporary file:', error);
        }
    }
}

module.exports = new ExcelService();