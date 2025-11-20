interface Window {
    electronAPI: {
        getPasswords: () => Promise<PasswordEntry[]>;
        addPassword: (entry: PasswordEntry) => Promise<boolean>;
        deletePassword: (id: string) => Promise<boolean>;
    }
}

interface PasswordEntry {
    id: string;
    service: string;
    username: string;
    password: string;
}

class PasswordManager {
    private listElement: HTMLUListElement;
    private formElement: HTMLFormElement;
    private entries: PasswordEntry[] = [];

    constructor() {
        this.listElement = document.getElementById('password-list') as HTMLUListElement;
        this.formElement = document.getElementById('password-form') as HTMLFormElement;
        
        this.initializeEventListeners();
        this.loadEntries();
    }

    private initializeEventListeners(): void {
        this.formElement.addEventListener('submit', (e) => this.handleSubmit(e));

        const generateBtn = document.getElementById('generate-btn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.fillRandomPassword());
        }
    }

    private async loadEntries(): Promise<void> {
        try {
            this.entries = await window.electronAPI.getPasswords();
            this.render();
        } catch (error) {
            console.error("Errore caricamento DB:", error);
        }
    }

    private async handleSubmit(e: Event): Promise<void> {
        e.preventDefault();

        const serviceInput = document.getElementById('service') as HTMLInputElement;
        const usernameInput = document.getElementById('username') as HTMLInputElement;
        const passwordInput = document.getElementById('password') as HTMLInputElement;

        const newEntry: PasswordEntry = {
            id: crypto.randomUUID(), 
            service: serviceInput.value,
            username: usernameInput.value,
            password: passwordInput.value
        };
            
        await window.electronAPI.addPassword(newEntry);
        
        await this.loadEntries();
        this.formElement.reset();
    }

    private async deleteEntry(id: string): Promise<void> {
        await window.electronAPI.deletePassword(id);
        await this.loadEntries();
    }

    private passwordGenerator(length: number = 16): string {
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
        let retVal = "";
        const array = new Uint32Array(length);
        window.crypto.getRandomValues(array); 
        
        for (let i = 0; i < length; i++) {
            retVal += charset.charAt(array[i] % charset.length);
        }
        return retVal;
    }

    private fillRandomPassword(): void {
        const passwordInput = document.getElementById('password') as HTMLInputElement;
        passwordInput.value = this.passwordGenerator();
    }

    private toggleVisibility(id: string): void {
        const passSpan = document.getElementById(`pass-${id}`);
        if (passSpan) {
            const isVisible = passSpan.getAttribute('data-visible') === 'true';
            
            if (isVisible) {
                passSpan.textContent = '••••••••';
                passSpan.setAttribute('data-visible', 'false');
            } else {
                const entry = this.entries.find(e => e.id === id);
                if (entry) {
                    passSpan.textContent = entry.password; 
                    passSpan.setAttribute('data-visible', 'true');
                }
            }
        }
    }

    private render(): void {
        this.listElement.innerHTML = '';

        this.entries.forEach(entry => {
            const li = document.createElement('li');
            li.className = 'password-item'; 

            li.innerHTML = `
                <div class="item-details">
                    <strong>${entry.service}</strong>
                    <span>${entry.username}</span><br>
                    <span id="pass-${entry.id}" class="password-display" data-visible="false">••••••••</span>
                </div>
                <div class="actions">
                    <button class="btn-toggle" data-id="${entry.id}"><i class="fa-solid fa-eye"></i></button>
                    <button class="btn-delete" data-id="${entry.id}"><i class="fa-solid fa-trash"></i></button>
                </div>
            `;

            const deleteBtn = li.querySelector('.btn-delete') as HTMLButtonElement;
            deleteBtn.addEventListener('click', () => this.deleteEntry(entry.id));

            const toggleBtn = li.querySelector('.btn-toggle') as HTMLButtonElement;
            toggleBtn.addEventListener('click', () => this.toggleVisibility(entry.id));

            this.listElement.appendChild(li);
        });
    }
}

new PasswordManager();