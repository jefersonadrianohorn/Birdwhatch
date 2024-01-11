const express = require('express');
const multer = require('multer');
const fs = require('fs');
const { google } = require('googleapis');
const moment = require('moment-timezone');

const app = express();
const port = 3000;

const GOOGLE_API_FOLDER_ID = '1L2DS4Z5g_RCZlcO_xNFRfbQ8qFHcXc2j';

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const fileId = await uploadFile(req.file.path);
        res.send(`File uploaded successfully. Google Drive File ID: ${fileId}`);
    } catch (err) {
        console.error('Error uploading file', err);
        res.status(500).send('Error uploading file');
    }
});

async function uploadFile(filePath) {
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: './googlekey.json',
            scopes: ['https://www.googleapis.com/auth/drive']
        });

        const driveService = google.drive({
            version: 'v3',
            auth
        });

        const currentDate = moment.tz(new Date(), 'America/Sao_Paulo');
        const formattedDate = currentDate.format('DD/MM/YYYY_HH:mm');
        const fileName = `Registro${formattedDate}.jpg`;

        const fileMetaData = {
            'name': fileName,
            'parents': [GOOGLE_API_FOLDER_ID]
        };

        const media = {
            mimeType: 'image/jpg',
            body: fs.createReadStream(filePath)
        };

        const response = await driveService.files.create({
            resource: fileMetaData,
            media: media,
            fields: 'id'
        });

        return response.data.id;
    } catch (err) {
        console.log('Upload file error', err);
        throw err;
    }
}

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
