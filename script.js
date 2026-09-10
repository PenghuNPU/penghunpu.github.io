// 1. 左側選單結構設定 
// 修改：將 icon 路徑指到 /icon/a.icon 等 (假設附檔名為 .icon，若為圖片通常是 .png 或 .gif)
// 注意：實際應用中，瀏覽器不一定能直接渲染 .icon，通常會是 .png 或 .gif。這裡先按照要求設定路徑字串。
// 修改：id 設定維持原本，但在 loadPage 中動態組合目錄路徑 (e.g., id 'D-C' -> /d/d_c.html)
const menuData = [
    { id: 'A', title: 'A. 基本資料', icon: '/icon/a.png' },
    { id: 'B', title: 'B. 訂單管理', icon: '/icon/b.icon' },
    { id: 'C', title: 'C. 商品管理', icon: '/icon/c.icon' },
       { 
        id: 'D', 
        title: 'D. 團銷管理', 
        icon: '/icon/d.icon',
        isExpanded: true,
        children: [
            { id: 'D-A', title: 'A. 團體銷售控管' },
            { id: 'D-B', title: 'B. 團體安排' },
            { id: 'D-C', title: 'C. 團體報表列印' }, // 將對應 /d/d_c.html
            { id: 'D-D', title: 'D. 團體分房表' },
            { id: 'D-E', title: 'E. 團體派車單' },
            { id: 'D-F', title: 'F. 團體訂單異動紀錄' }
        ]
    },
    { id: 'E', title: 'E. 票務管理', icon: '/icon/e.icon' },
    { 
        id: 'F', 
        title: 'F. 證照管理', 
        icon: '/icon/f.icon',
        isExpanded: true,
        children: [
            { id: 'F-A', title: 'A. 旅客辦證紀錄' },
            { id: 'F-B', title: 'B. 旅客交辦處理明細紀...' }, 
            { id: 'F-C', title: 'C. ED卡/海關單' },
            { id: 'F-Y', title: 'Y. 證照到期名單' }, // 將對應 /f/f_y.html
            { id: 'F-Z', title: 'Z. 證照報表列印' }
        ]
    },
    { id: 'G', title: 'G. 網站管理', icon: '/icon/g.icon' },
    { id: 'H', title: 'H. 系統設定', icon: '/icon/h.icon' },
    { id: 'I', title: 'I. 電子報管理', icon: '/icon/i.icon' },
    { id: 'K', title: 'K. 帳務管理', icon: '/icon/k.icon' },
    { id: 'M', title: 'M. 操作手冊', icon: '/icon/m.icon' },
    { id: 'N', title: 'N. 訊息管理', icon: '/icon/n.icon' },
    { id: 'P', title: 'P. 商品發布管理', icon: '/icon/p.icon' },
    { id: 'S', title: 'S. 銷售管理', icon: '/icon/s.icon' } 
];

// 初始化載入
document.addEventListener("DOMContentLoaded", () => {
    updateTime(); // 啟動時鐘
    setInterval(updateTime, 1000); // 每秒更新一次
    renderMenu();
    loadPage('F-Y'); 
});

// 更新系統時間
function updateTime() {
    const timeElement = document.getElementById('current-time');
    if (!timeElement) return;

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    // 格式：YYYY/MM/DD HH:MM
    const timeString = `${year}/${month}/${day} ${hours}:${minutes}`;
    timeElement.textContent = timeString;
}

// 渲染左側選單
function renderMenu() {
    const menuContainer = document.getElementById('menu-list');
    menuContainer.innerHTML = ''; 

    menuData.forEach(menu => {
        const menuItem = document.createElement('div');
        menuItem.className = 'menu-item';
        
        const iconSpan = document.createElement('span');
        iconSpan.className = 'menu-icon';
        if (menu.icon) {
            iconSpan.style.backgroundImage = `url(${menu.icon})`;
            iconSpan.style.backgroundSize = 'cover';
        } else {
            iconSpan.classList.add('default-icon');
        }
        
        const textNode = document.createTextNode(menu.title);

        menuItem.appendChild(iconSpan);
        menuItem.appendChild(textNode);
        
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

// ==========================================
// 核心更新：使用 Fetch API 載入外部 HTML 檔案
// 修改：依據功能編號分資料夾路徑 (例如: id 'D-A' -> /d/d_a.html, id 'A' -> /a/a.html)
// ==========================================
function loadPage(pageId) {
    const contentArea = document.getElementById('content-area');
    
    // 解析 id，例如 'D-A' 會被拆分為 'D' 和 'A'，'A' 則只有 'A'
    const parts = pageId.split('-');
    const folderName = parts[0].toLowerCase(); // 資料夾名稱取第一段，轉小寫 (e.g., 'd', 'a')
    const fileNameBase = pageId.replace('-', '_').toLowerCase(); // 檔名把 '-' 換成 '_' (e.g., 'd_a', 'a')
    
    // 組合最終路徑：/folder/filename.html
    // 如果是單一字母 (如 'A')，則路徑為 /a/a.html
    const filePath = `/${folderName}/${fileNameBase}.html`; 

    fetch(filePath)
        .then(response => {
            if (!response.ok) throw new Error('找不到檔案');
            return response.text();
        })
        .then(html => {
            contentArea.innerHTML = html; 
        })
        .catch(error => {
            // 當檔案尚未建立時，顯示預設提示畫面並顯示預期路徑
            contentArea.innerHTML = `
                <div class="content-header"><span class="icon-folder">📁</span> 系統提示</div>
                <div style="padding: 20px;">
                    請從左側選擇功能項目。<br><br>
                    <span style="color:red; font-weight:bold;">檔案尚未建置，嘗試載入路徑：${filePath}</span><br>
                    請在資料夾中建立此檔案即可顯示內容。
                </div>
            `;
        });
}

// 關閉彈出視窗 (定義在全域層級，供載入的 HTML 呼叫)
window.closeModal = function() {
    const modal = document.getElementById('print-modal');
    if (modal) modal.style.display = 'none';
}
