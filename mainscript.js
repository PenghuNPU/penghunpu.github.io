// ==========================================
// 全域變數設定
// ==========================================
window.db = null; 
window.fileHandle = null; 

// 1. 左側選單結構設定
const menuData = [
    { 
        id: 'A', 
        title: 'A. 基本資料', 
        icon: 'icon/a.png',
        isExpanded: false,
        children: [
            { 
                id: 'A-A', 
                title: 'A. 客戶及供應商管理',
                children: [
                    { id: 'A-A-A', title: 'A. 旅客資料管理' },
                    { id: 'A-A-B', title: 'B. 同業資料管理' },
                    { id: 'A-A-C', title: 'C. 機關行號客戶管理' },
                    { id: 'A-A-D', title: 'D. 航空公司資料管理' },
                    { id: 'A-A-E', title: 'E. 國外local資料管理' },
                    { id: 'A-A-F', title: 'F. 辦證管理' },
                    { id: 'A-A-G', title: 'G. 餐廳管理' },
                    { id: 'A-A-H', title: 'H. 廠商管理' },
                    { id: 'A-A-I', title: 'I. 輪船公司管理' },
                    { id: 'A-A-J', title: 'J. 租車公司管理' },
                    { id: 'A-A-K', title: 'K. 旅遊景點管理' },
                    { id: 'A-A-L', title: 'L. 網路會員管理' },
                    { id: 'A-A-M', title: 'M. 網路類別檔' }
                ]
            },
            { id: 'A-B', title: 'B. 公司部門員工管理' },
            { id: 'A-C', title: 'C. 旅遊資訊管理' },
            { id: 'A-D', title: 'D. 個人密碼修改' },
            { id: 'A-E', title: 'E. 員工差假狀況表' },
            { id: 'A-F', title: 'F. 員工刷卡狀況表' },
            { id: 'A-Y', title: 'Y. 業務員替換處理' }
        ]
    },
    { id: 'B', title: 'B. 訂單管理', icon: 'icon/b.icon' },
    { id: 'C', title: 'C. 商品管理', icon: 'icon/c.icon' },
    { 
        id: 'D', 
        title: 'D. 團銷管理', 
        icon: 'icon/d.icon',
        isExpanded: false,
        children: [
            { id: 'D-A', title: 'A. 團體銷售控管' },
            { id: 'D-B', title: 'B. 團體安排' },
            { id: 'D-C', title: 'C. 團體報表列印' }, 
            { id: 'D-D', title: 'D. 團體分房表' },
            { id: 'D-E', title: 'E. 團體派車單' },
            { id: 'D-F', title: 'F. 團體訂單異動紀錄' }
        ]
    },
    { id: 'E', title: 'E. 票務管理', icon: 'icon/e.icon' },
    { 
        id: 'F', 
        title: 'F. 證照管理', 
        icon: 'icon/f.icon',
        isExpanded: false, 
        children: [
            { id: 'F-A', title: 'A. 旅客辦證紀錄' },
            { id: 'F-B', title: 'B. 旅客交辦處理明細紀...' }, 
            { id: 'F-C', title: 'C. ED卡/海關單' },
            { id: 'F-Y', title: 'Y. 證照到期名單' }, 
            { id: 'F-Z', title: 'Z. 證照報表列印' }
        ]
    },
    { id: 'G', title: 'G. 網站管理', icon: 'icon/g.icon' },
    { id: 'H', title: 'H. 系統設定', icon: 'icon/h.icon' },
    { id: 'I', title: 'I. 電子報管理', icon: 'icon/i.icon' },
    { id: 'K', title: 'K. 帳務管理', icon: 'icon/k.icon' },
    { id: 'M', title: 'M. 操作手冊', icon: 'icon/m.icon' },
    { id: 'N', title: 'N. 訊息管理', icon: 'icon/n.icon' },
    { id: 'P', title: 'P. 商品發布管理', icon: 'icon/p.icon' },
    { id: 'S', title: 'S. 銷售管理', icon: 'icon/s.icon' } 
];

// 2. 初始化載入
document.addEventListener("DOMContentLoaded", () => {
    const userAccount = localStorage.getItem('userAccount');
    if (!userAccount) {
        alert("請先登入系統！");
        window.location.href = "index.html"; 
        return;
    }

    const userNameSpan = document.querySelector('.user-name');
    const authTemplateSpan = document.querySelector('.auth-template');
    
    // 🟢 判斷如果是老師 (0099)，顯示「切換檔案」按鈕
    if (userNameSpan && authTemplateSpan) {
        if (userAccount === "0099") {
            userNameSpan.textContent = "老師";
            userNameSpan.style.color = "blue";
            authTemplateSpan.textContent = "系統管理員權限 (批改模式)";
            
            const switchBtn = document.getElementById('btn-switch-db');
            if(switchBtn) switchBtn.style.display = 'inline-block';
        } else {
            userNameSpan.textContent = "學生 (" + userAccount + ")";
            authTemplateSpan.textContent = "一般練習操作權限";
        }
    }

    const targetFilenameSpan = document.getElementById('target-filename');
    if (targetFilenameSpan) {
        if (userAccount === "0099") {
            targetFilenameSpan.textContent = "請選取任何學生的 .sqlite 檔案";
            targetFilenameSpan.style.fontSize = "20px";
        } else {
            targetFilenameSpan.textContent = userAccount + "tourdata.sqlite";
        }
    }

    updateTime(); 
    setInterval(updateTime, 1000); 
});

async function openAndBindDatabase() {
    try {
        if (typeof initSqlJs === 'undefined') {
            throw new Error("sql.js 套件未載入，請確認 HTML 標籤！");
        }

        [window.fileHandle] = await window.showOpenFilePicker({
            types: [{
                description: 'SQLite Database',
                accept: { 'application/octet-stream': ['.sqlite', '.db'] }
            }],
            multiple: false
        });

        const file = await window.fileHandle.getFile();
        const fileName = file.name;
        const userAccount = localStorage.getItem('userAccount');

        // 🟢 檔名安全防護邏輯 (老師 0099 可以開啟任何檔案)
        if (userAccount !== "0099") {
            const expectedFileName = userAccount + "tourdata.sqlite";
            if (fileName !== expectedFileName) {
                alert(`❌ 錯誤！您只能開啟屬於您的資料庫檔案：\n👉 ${expectedFileName}\n\n您目前選取的是：${fileName}\n請重新點擊按鈕選取正確的檔案。`);
                window.fileHandle = null; 
                return; 
            }
        }

        const buffer = await file.arrayBuffer();

        const SQL = await initSqlJs({
            locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
        });

        window.db = new SQL.Database(new Uint8Array(buffer));
        console.log("✅ 成功綁定並載入資料庫！");

        const currentFileSpan = document.getElementById('current-file');
        if (currentFileSpan) {
            currentFileSpan.textContent = `[本機] ${fileName}`;
            currentFileSpan.style.color = '#1a237e'; 
        }

        document.getElementById('file-overlay').style.display = 'none';
        renderMenu();
        
        window.loadBulletin();

    } catch (error) {
        console.error("選取檔案失敗或取消：", error);
        if (error.name !== 'AbortError') {
            alert("檔案載入發生錯誤，請確認您使用的是 Chrome 或 Edge 瀏覽器！");
        }
    }
}

// 🟢 老師專用：系統內動態切換學生資料庫檔案
window.switchStudentDatabase = async function() {
    if (!confirm("確定要切換資料庫檔案嗎？\n系統將會重新載入並返回首頁。")) return;
    
    try {
        [window.fileHandle] = await window.showOpenFilePicker({
            types: [{
                description: 'SQLite Database',
                accept: { 'application/octet-stream': ['.sqlite', '.db'] }
            }],
            multiple: false
        });

        const file = await window.fileHandle.getFile();
        const fileName = file.name;
        const buffer = await file.arrayBuffer();

        // 重新初始化 DB 實例
        const SQL = await initSqlJs({
            locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
        });
        window.db = new SQL.Database(new Uint8Array(buffer));
        
        // 更新左下角檔案名稱
        const currentFileSpan = document.getElementById('current-file');
        if (currentFileSpan) {
            currentFileSpan.textContent = `[本機] ${fileName}`;
            currentFileSpan.style.color = '#1a237e'; 
        }

        alert(`✅ 已成功切換至學生檔案：${fileName}`);
        
        // 切換檔案後，自動回到首頁（佈告欄）確保畫面資料重置
        window.loadBulletin();

    } catch (error) {
        if (error.name !== 'AbortError') {
            alert("切換檔案發生錯誤！");
            console.error(error);
        }
    }
};

// ==========================================
// 4. 全域函數：執行 SQL 並自動覆蓋存檔
// ==========================================
window.executeAndSave = async function(sqlString) {
    if (!window.db || !window.fileHandle) {
        alert("資料庫未綁定！"); 
        return false;
    }
    
    try {
        window.db.exec(sqlString);
        
        const data = window.db.export();
        
        const writable = await window.fileHandle.createWritable();
        await writable.write(data);
        await writable.close();
        
        console.log("💾 檔案已自動儲存更新！");

        const currentFileSpan = document.getElementById('current-file');
        if (currentFileSpan) {
            const originalText = currentFileSpan.textContent.replace(' (已存檔✓)', '');
            currentFileSpan.textContent = originalText + ' (已存檔✓)';
            currentFileSpan.style.color = '#2e7d32'; 
            
            setTimeout(() => {
                currentFileSpan.textContent = originalText;
                currentFileSpan.style.color = '#1a237e'; 
            }, 3000);
        }

        return true; 
        
    } catch (err) {
        console.error("執行或存檔失敗：", err);
        alert("SQL 語法錯誤或存檔失敗：\n" + err.message);
        return false; 
    }
}

// ==========================================
// 5. 系統 UI 輔助功能
// ==========================================
function updateTime() {
    const timeElement = document.getElementById('current-time');
    if (!timeElement) return;
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    timeElement.textContent = `${year}/${month}/${day} ${hours}:${minutes}`;
}

function renderMenu() {
    const menuContainer = document.getElementById('menu-list');
    if (!menuContainer) return;
    menuContainer.innerHTML = ''; 

    menuData.forEach(menu => {
        const menuItem = document.createElement('div');
        menuItem.className = 'menu-item';
        
        const iconSpan = document.createElement('span');
        iconSpan.className = 'menu-icon';
        if (menu.icon) {
            iconSpan.style.backgroundImage = `url(${menu.icon})`;
            iconSpan.style.backgroundSize = 'contain';
            iconSpan.style.backgroundRepeat = 'no-repeat';
            iconSpan.style.backgroundPosition = 'center';
        } else {
            iconSpan.classList.add('default-icon');
        }
        
        menuItem.appendChild(iconSpan);
        menuItem.appendChild(document.createTextNode(menu.title));
        
        menuItem.onclick = () => {
            if (menu.children) {
                toggleSubMenu(`submenu-${menu.id}`);
            } else {
                loadPage(menu.id);
            }
        };
        menuContainer.appendChild(menuItem);

        if (menu.children) {
            const submenu = document.createElement('div');
            submenu.className = 'submenu';
            submenu.id = `submenu-${menu.id}`;
            submenu.style.display = menu.isExpanded ? 'flex' : 'none';

            menu.children.forEach(sub => {
                const subItem = document.createElement('a');
                subItem.href = "#";
                subItem.className = 'sub-item';
                subItem.innerText = sub.children ? sub.title + " ▸" : sub.title;
                
                subItem.onclick = (e) => {
                    e.preventDefault(); 
                    if (sub.children) {
                        toggleSubMenu(`submenu-${sub.id}`);
                    } else {
                        document.querySelectorAll('.sub-item').forEach(el => el.classList.remove('active'));
                        subItem.classList.add('active');
                        loadPage(sub.id); 
                    }
                };
                submenu.appendChild(subItem);

                if (sub.children) {
                    const subSubmenu = document.createElement('div');
                    subSubmenu.className = 'submenu';
                    subSubmenu.id = `submenu-${sub.id}`;
                    subSubmenu.style.display = 'none'; 
                    subSubmenu.style.backgroundColor = '#fdf8e4'; 
                    subSubmenu.style.borderTop = 'none';

                    sub.children.forEach(sub3 => {
                        const sub3Item = document.createElement('a');
                        sub3Item.href = "#";
                        sub3Item.className = 'sub-item';
                        sub3Item.innerText = sub3.title;
                        sub3Item.style.paddingLeft = '45px'; 

                        sub3Item.onclick = (e) => {
                            e.preventDefault(); 
                            document.querySelectorAll('.sub-item').forEach(el => el.classList.remove('active'));
                            sub3Item.classList.add('active');
                            loadPage(sub3.id); 
                        };
                        subSubmenu.appendChild(sub3Item);
                    });
                    submenu.appendChild(subSubmenu);
                }
            });
            menuContainer.appendChild(submenu);
        }
    });
}

function toggleSubMenu(submenuId) {
    const submenu = document.getElementById(submenuId);
    if (submenu) submenu.style.display = submenu.style.display === 'none' ? 'flex' : 'none';
}

function loadPage(pageId) {
    const contentArea = document.getElementById('content-area');
    const parts = pageId.split('-');
    const folderName = parts[0].toLowerCase(); 
    const fileNameBase = pageId.replace(/-/g, '_').toLowerCase(); 
    const filePath = `${folderName}/${fileNameBase}.html`; 

    fetch(filePath)
        .then(response => {
            if (!response.ok) throw new Error('找不到檔案');
            return response.text();
        })
        .then(html => {
            contentArea.innerHTML = html; 
            
            const scripts = contentArea.querySelectorAll('script');
            scripts.forEach(oldScript => {
                const newScript = document.createElement('script');
                Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
                newScript.appendChild(document.createTextNode(oldScript.innerHTML));
                oldScript.parentNode.replaceChild(newScript, oldScript);
            });
        })
        .catch(error => {
            contentArea.innerHTML = `
                <div class="content-header"><span class="icon-folder">📁</span> 系統提示</div>
                <div style="padding: 20px;">
                    請從左側選擇功能項目。<br><br>
                    <span style="color:red; font-weight:bold;">檔案尚未建置，嘗試載入路徑：${filePath}</span><br>
                    請在您的資料夾中建立此檔案即可顯示內容。
                </div>
            `;
        });
}

function logout() {
    if(confirm("確定要登出系統嗎？")) {
        localStorage.removeItem('userAccount');
        window.location.href = "index.html"; 
    }
}

window.closeModal = function() {
    const modal = document.getElementById('print-modal');
    if (modal) modal.style.display = 'none';
}

window.loadBulletin = function() {
    const contentArea = document.getElementById('content-area');
    fetch('bulletin.html')
        .then(response => {
            if (!response.ok) throw new Error('找不到 bulletin.html');
            return response.text();
        })
        .then(html => {
            contentArea.innerHTML = html; 
            
            const scripts = contentArea.querySelectorAll('script');
            scripts.forEach(oldScript => {
                const newScript = document.createElement('script');
                Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
                newScript.appendChild(document.createTextNode(oldScript.innerHTML));
                oldScript.parentNode.replaceChild(newScript, oldScript);
            });
        })
        .catch(error => {
            contentArea.innerHTML = `<div style="padding: 20px; color: red; font-weight: bold;">無法載入佈告欄，請確認 bulletin.html 檔案是否存在。</div>`;
        });
};