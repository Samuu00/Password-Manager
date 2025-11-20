var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var PasswordManager = /** @class */ (function () {
    function PasswordManager() {
        this.entries = [];
        this.listElement = document.getElementById('password-list');
        this.formElement = document.getElementById('password-form');
        this.initializeEventListeners();
        this.loadEntries();
    }
    PasswordManager.prototype.initializeEventListeners = function () {
        var _this = this;
        this.formElement.addEventListener('submit', function (e) { return _this.handleSubmit(e); });
        var generateBtn = document.getElementById('generate-btn');
        if (generateBtn) {
            generateBtn.addEventListener('click', function () { return _this.fillRandomPassword(); });
        }
    };
    PasswordManager.prototype.loadEntries = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        _a = this;
                        return [4 /*yield*/, window.electronAPI.getPasswords()];
                    case 1:
                        _a.entries = _b.sent();
                        this.render();
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _b.sent();
                        console.error("Errore caricamento DB:", error_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    PasswordManager.prototype.handleSubmit = function (e) {
        return __awaiter(this, void 0, void 0, function () {
            var serviceInput, usernameInput, passwordInput, newEntry;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        e.preventDefault();
                        serviceInput = document.getElementById('service');
                        usernameInput = document.getElementById('username');
                        passwordInput = document.getElementById('password');
                        newEntry = {
                            id: crypto.randomUUID(),
                            service: serviceInput.value,
                            username: usernameInput.value,
                            password: passwordInput.value
                        };
                        return [4 /*yield*/, window.electronAPI.addPassword(newEntry)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.loadEntries()];
                    case 2:
                        _a.sent();
                        this.formElement.reset();
                        return [2 /*return*/];
                }
            });
        });
    };
    PasswordManager.prototype.deleteEntry = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, window.electronAPI.deletePassword(id)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.loadEntries()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    PasswordManager.prototype.passwordGenerator = function (length) {
        if (length === void 0) { length = 16; }
        var charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
        var retVal = "";
        var array = new Uint32Array(length);
        window.crypto.getRandomValues(array);
        for (var i = 0; i < length; i++) {
            retVal += charset.charAt(array[i] % charset.length);
        }
        return retVal;
    };
    PasswordManager.prototype.fillRandomPassword = function () {
        var passwordInput = document.getElementById('password');
        passwordInput.value = this.passwordGenerator();
    };
    PasswordManager.prototype.toggleVisibility = function (id) {
        var passSpan = document.getElementById("pass-".concat(id));
        if (passSpan) {
            var isVisible = passSpan.getAttribute('data-visible') === 'true';
            if (isVisible) {
                passSpan.textContent = '••••••••';
                passSpan.setAttribute('data-visible', 'false');
            }
            else {
                var entry = this.entries.find(function (e) { return e.id === id; });
                if (entry) {
                    passSpan.textContent = entry.password;
                    passSpan.setAttribute('data-visible', 'true');
                }
            }
        }
    };
    PasswordManager.prototype.render = function () {
        var _this = this;
        this.listElement.innerHTML = '';
        this.entries.forEach(function (entry) {
            var li = document.createElement('li');
            li.className = 'password-item';
            li.innerHTML = "\n                <div class=\"item-details\">\n                    <strong>".concat(entry.service, "</strong>\n                    <span>").concat(entry.username, "</span><br>\n                    <span id=\"pass-").concat(entry.id, "\" class=\"password-display\" data-visible=\"false\">\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022</span>\n                </div>\n                <div class=\"actions\">\n                    <button class=\"btn-toggle\" data-id=\"").concat(entry.id, "\"><i class=\"fa-solid fa-eye\"></i></button>\n                    <button class=\"btn-delete\" data-id=\"").concat(entry.id, "\"><i class=\"fa-solid fa-trash\"></i></button>\n                </div>\n            ");
            var deleteBtn = li.querySelector('.btn-delete');
            deleteBtn.addEventListener('click', function () { return _this.deleteEntry(entry.id); });
            var toggleBtn = li.querySelector('.btn-toggle');
            toggleBtn.addEventListener('click', function () { return _this.toggleVisibility(entry.id); });
            _this.listElement.appendChild(li);
        });
    };
    return PasswordManager;
}());
new PasswordManager();
