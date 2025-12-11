(function(){
    // Default order provided by the user
    const DEFAULT_ROLE_ORDER = [
        'Area Commander',
        'Corps Officer',
        'Area Executive Director',
        'Area Director',
        'Executive Director',
        'Center Director',
        'Program Manager',
        'Program Coordinator',
        'Youth Development Professional',
        'Administrative Clerk',
        'Membership Clerk',
        'Other'
    ];

    const STORAGE_KEY = 'rsycRoleOrder';

    // Ensure global namespace
    window.RSYC = window.RSYC || {};

    function loadRoleOrder(){
        try{
            const raw = localStorage.getItem(STORAGE_KEY);
            if(raw){
                const parsed = JSON.parse(raw);
                if(Array.isArray(parsed) && parsed.length>0) return parsed;
            }
        }catch(e){ /* ignore */ }
        return DEFAULT_ROLE_ORDER.slice();
    }

    function saveRoleOrder(order){
        try{
            localStorage.setItem(STORAGE_KEY, JSON.stringify(order));
            window.RSYC.roleOrder = order.slice();
            // notify listeners (templates will re-render when publisher triggers generation)
            const ev = new CustomEvent('rsyc:roleOrderChanged', { detail: { order } });
            window.dispatchEvent(ev);
        }catch(e){ console.error('Failed to save role order', e); }
    }

    // expose for other scripts
    window.RSYC.roleOrder = loadRoleOrder();
    window.RSYC.getRoleOrder = () => window.RSYC.roleOrder.slice();
    window.RSYC.setRoleOrder = order => { saveRoleOrder(order); };

    // UI wiring
    function createListItem(text){
        const li = document.createElement('li');
        li.draggable = true;
        li.className = 'role-order-item';
        li.style.padding = '8px 10px';
        li.style.border = '1px solid #e0e0e0';
        li.style.marginBottom = '6px';
        li.style.background = '#fff';
        li.style.cursor = 'grab';
        li.textContent = text;

        li.addEventListener('dragstart', (e)=>{
            e.dataTransfer.setData('text/plain', text);
            li.classList.add('dragging');
        });
        li.addEventListener('dragend', ()=> li.classList.remove('dragging'));
        return li;
    }

    function renderList(container, order){
        container.innerHTML = '';
        order.forEach(role => container.appendChild(createListItem(role)));

        // Add dragover handler on container for reordering
        let dragSrc = null;
        container.addEventListener('dragover', (e)=>{
            e.preventDefault();
            const dragging = container.querySelector('.dragging');
            const after = getDragAfterElement(container, e.clientY);
            if(!dragging) return;
            if(after == null) container.appendChild(dragging);
            else container.insertBefore(dragging, after);
        });
    }

    function getDragAfterElement(container, y){
        const items = [...container.querySelectorAll('.role-order-item:not(.dragging)')];
        return items.reduce((closest, child)=>{
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height/2;
            if(offset<0 && offset>closest.offset) return { offset, element: child };
            return closest;
        }, { offset: Number.NEGATIVE_INFINITY }).element || null;
    }

    function openModal(){
        const modal = document.getElementById('staffOrderModal');
        const list = document.getElementById('roleOrderList');
        if(!modal || !list) return;
        renderList(list, window.RSYC.getRoleOrder());
        modal.style.display = 'block';
    }
    function closeModal(){
        const modal = document.getElementById('staffOrderModal');
        if(modal) modal.style.display = 'none';
    }

    function getCurrentOrderFromUI(){
        const list = document.getElementById('roleOrderList');
        if(!list) return window.RSYC.getRoleOrder();
        return [...list.querySelectorAll('.role-order-item')].map(li => li.textContent.trim());
    }

    // Attach control handlers when DOM ready
    document.addEventListener('DOMContentLoaded', ()=>{
        const openBtn = document.getElementById('editStaffOrder');
        const closeBtn = document.getElementById('closeStaffOrderModal');
        const saveBtn = document.getElementById('saveRoleOrder');
        const resetBtn = document.getElementById('resetRoleOrder');
        const list = document.getElementById('roleOrderList');

        // Populate the read-only role order display (view-only requirement)
        const display = document.getElementById('roleOrderDisplay');
        function refreshDisplay(){
            if(!display) return;
            const order = window.RSYC.getRoleOrder();
            display.textContent = order.join(', ');
            display.title = 'Role order used for sorting staff. This is view-only at this time.';
        }
        // Initial populate
        refreshDisplay();
        // Update when order changes
        window.addEventListener('rsyc:roleOrderChanged', (e) => {
            try{ refreshDisplay(); }catch(e){ /* ignore */ }
        });

        if(openBtn) openBtn.addEventListener('click', openModal);
        if(closeBtn) closeBtn.addEventListener('click', closeModal);
        if(saveBtn) saveBtn.addEventListener('click', ()=>{
            const newOrder = getCurrentOrderFromUI();
            window.RSYC.setRoleOrder(newOrder);
            closeModal();
            // Trigger a manual generation event if app supports (some pages listen for this)
            const gen = new CustomEvent('rsyc:requestGeneratePreview');
            window.dispatchEvent(gen);
        });
        if(resetBtn) resetBtn.addEventListener('click', ()=>{
            window.RSYC.setRoleOrder(DEFAULT_ROLE_ORDER.slice());
            renderList(list, window.RSYC.getRoleOrder());
        });

        // Allow clicking an item to select and move up/down with keyboard (accessibility)
        if(list){
            list.addEventListener('click', (e)=>{
                const li = e.target.closest('.role-order-item');
                if(!li) return;
                // toggle a simple highlight
                [...list.querySelectorAll('.role-order-item')].forEach(i=>i.style.outline='');
                li.style.outline = '2px dashed #007bff';
            });
        }
    });
    // Also refresh display immediately in case script loaded after DOMContentLoaded
    try{ const dispImmediate = document.getElementById('roleOrderDisplay'); if(dispImmediate) dispImmediate.textContent = window.RSYC.getRoleOrder().join(', '); }catch(e){}
})();
