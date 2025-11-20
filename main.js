const { app, BrowserWindow, ipcMain } = require('electron'); 
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');
const { receiveMessageOnPort } = require('worker_threads');

const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = crypto.scryptSync('tua-password-segreta', 'salt', 32); 
const IV_LENGTH = 16;

function encrypt(text) {
    let iv = crypto.randomBytes(IV_LENGTH);
    let cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
    
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
    try {
        let textParts = text.split(':');
        let iv = Buffer.from(textParts.shift(), 'hex');
        let encryptedText = Buffer.from(textParts.join(':'), 'hex');
        let decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (error) {
        console.error("Errore decifratura:", error);
        return "Errore";
    }
}

const userDataPath = app.getPath('userData'); 
const dbPath = path.join(userDataPath, 'passwords.db'); 
const db = new sqlite3.Database(dbPath);

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
        width: 900,
        height: 700,
        show: false,
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });

    win.maximize();
    win.show();
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
                    password: decrypt(rows.password)
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



