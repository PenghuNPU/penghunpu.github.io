// ==========================================
// 全域變數設定
// ==========================================
window.db = null; // 宣告全域資料庫變數，讓右側載入的 HTML 可以直接使用 window.db 讀寫

// 1. 左側選單結構設定
const menuData = [
    { id: 'A', title: 'A. 基本資料', icon: 'icon/a.png' },
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
        isExpanded: true, // 預設展開方便測試
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
document.addEventListener("DOMContentLoaded", async () => {
    // 驗證登入狀態
    const userAccount = localStorage.getItem('userAccount');
    if (!userAccount) {
        alert("請先登入系統！");
        window.location.href = "index.html"; 
        return;
    }

    // 更新介面權限顯示
    const userNameSpan = document.querySelector('.user-name');
    const authTemplateSpan = document.querySelector('.auth-template');
    
    if (userNameSpan && authTemplateSpan) {
        if (userAccount === "0100") {
            userNameSpan.textContent = "老師";
            userNameSpan.style.color = "blue";
            authTemplateSpan.textContent = "系統管理員權限";
        } else {
            userNameSpan.textContent = "學生 (" + userAccount + ")";
            authTemplateSpan.textContent = "一般練習操作權限";
        }
    }

    // 依序執行初始化：先載入資料庫，再載入畫面
    await initDatabase();
    
    updateTime(); 
    setInterval(updateTime, 1000); 
    renderMenu();
    loadPage('F-Y'); 
});

// 3. 載入 SQLite 資料庫 (含錯誤防呆)
async function initDatabase() {
    try {
        if (typeof initSqlJs === 'undefined') {
            throw new Error("sql.js 套件未載入，請確認 HTML 標籤！");
        }

        const SQL = await initSqlJs({
            locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
        });

        const response = await fetch('tourdata.sqlite');
        if (!response.ok) throw new Error('找不到 tourdata.sqlite，將建立空白資料庫。');
        
        const buffer = await response.arrayBuffer();
        window.db = new SQL.Database(new Uint8Array(buffer));
        console.log("✅ 記憶體資料庫載入完成！");

    } catch (error) {
        console.warn("⚠️ 資料庫初始化提示：", error.message);
        if (typeof initSqlJs !== 'undefined') {
            const SQL = await initSqlJs({ locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}` });
            window.db = new SQL.Database();
            console.log("已建立空白虛擬資料庫。");
        } else {
            console.error("嚴重錯誤：無法建立資料庫引擎。");
        }
    }
}

// 4. 更新系統時間
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

// 5. 渲染左側選單
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
                if (sub.id === 'F-Y') {
                    subItem.classList.add('active');
                }
                subItem.innerText = sub.title;
                subItem.onclick = (e) => {
                    e.preventDefault(); 
                    document.querySelectorAll('.sub-item').forEach(el => el.classList.remove('active'));
                    subItem.classList.add('active');
                    loadPage(sub.id); 
                };
                submenu.appendChild(subItem);
            });
            menuContainer.appendChild(submenu);
        }
    });
}

function toggleSubMenu(submenuId) {
    const submenu = document.getElementById(submenuId);
    if (submenu) submenu.style.display = submenu.style.display === 'none' ? 'flex' : 'none';
}

// 6. 載入外部 HTML 檔案 (切換功能頁面)
function loadPage(pageId) {
    const contentArea = document.getElementById('content-area');
    
    const parts = pageId.split('-');
    const folderName = parts[0].toLowerCase(); 
    const fileNameBase = pageId.replace('-', '_').toLowerCase(); 
    
    const filePath = `${folderName}/${fileNameBase}.html`; 

    fetch(filePath)
        .then(response => {
            if (!response.ok) throw new Error('找不到檔案');
            return response.text();
        })
        .then(html => {
            contentArea.innerHTML = html; 
            
            // 手動重新執行載入 HTML 內的 <script> 標籤
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

// 7. 全域輔助功能 (登出與關閉彈出視窗)
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