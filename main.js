const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');
const { receiveMessageOnPort } = require('worker_threads');

const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = crypto.scryptSync('tua-password-segreta', 'salt', 32); 

function encrypt(text){
    let iv = crypto.randomBytes(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = Buffer.from(textParts.join(':'), 'hex');
    let decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted.toString();
}

const db = new sqlite3.Database('password.db');

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS entries (
        id TEXT PRIMARY KEY,
        service TEXT,
        username TEXT,
        password TEXT
    )`);
});

function createWindow(){
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });

    win.loadFile('index.html');
}

app.whenReady().then(() => {
    createWindow();

    ipcMain.handle('get-passwords', async () => {

        return new Promise((resolve, reject) => {

            db.all("SELECT * FROM entries", [], (err, rows) => {

                if(err) reject(rows);

                const decryptedRows = rows.map(rows => ({
                    ...rows,
                    password: decrypt(row.password)
                }));

                resolve(decryptedRows);
            });
        });
    });

    ipcMain.handle('add-password', async (event, entry) => {

        const encryptedPass = encrypt(entry.password);
        return new Promise((resolve, reject) => {

            db.run(`INSERT INTO entries (id, service, username, password) VALUES (?, ?, ?, ?)`,
                [entry.id, entry.service, entry.username, encryptedPass],

                function(err){
                    if(err) reject(err);
                    else resolve(true);
                }
            ); 
        });
    });

    ipcMain.handle('delete-password', async (event, id) => {
        return new Promise((resolve, reject) => {
            db.run(`DELETE FROM entries WHERE id = ?`, [id], (err) => {
                if (err) reject(err);
                else resolve(true);
            });
        });
    });
}); 

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});



