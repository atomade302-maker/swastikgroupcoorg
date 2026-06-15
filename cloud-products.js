/**
 * Swastik Cloud Products Loader
 * Reads products stored by admin and renders them into the website.
 */
(function () {
    const STORAGE_KEY = 'swastik_cloud_products';

    function getProducts() {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    }

    function buildProductCard(p) {
        return `
        <div class="product-card cloud-product" data-category="${p.category}">
            <div class="product-img">
                <img src="${p.url}" alt="${p.name}" loading="lazy">
                <div class="cloud-badge"><i class="fa-solid fa-cloud"></i> New</div>
            </div>
            <div class="product-details">
                <div class="product-cat-tag">${p.category}</div>
                <h4>${p.name}</h4>
                <button class="btn btn-outline-primary full-width enquire-btn"
                    onclick="openEnquiry('${p.name.replace(/'/g,"\\'")}')">
                    ENQUIRE NOW <i class="fa-solid fa-arrow-right"></i>
                </button>
            </div>
        </div>`;
    }

    function buildCategoryCard(p) {
        return `
        <div class="category-card cloud-cat" data-category="${p.category}">
            <img src="${p.url}" alt="${p.name}">
            <div class="category-info">
                <h3>${p.category.toUpperCase()}</h3>
                <div class="cat-arrow"><i class="fa-solid fa-arrow-right"></i></div>
            </div>
        </div>`;
    }

    function openEnquiry(name) {
        // Open WhatsApp quote modal pre-filled with product name
        const modal = document.getElementById('quoteModal');
        const needField = document.getElementById('quoteNeed');
        if (modal) {
            modal.style.display = 'flex';
            if (needField) needField.value = 'I am interested in: ' + name;
        }
    }
    window.openEnquiry = openEnquiry;

    function injectCloudProducts() {
        const products = getProducts();
        if (products.length === 0) return;

        // ── BEST SELLERS GRID ──
        const grid = document.querySelector('.products-grid');
        if (grid) {
            // Remove placeholder "View More" items if cloud products exist
            const frag = products.map(buildProductCard).join('');
            grid.insertAdjacentHTML('beforeend', frag);
        }

        // ── CATEGORIES GRID ──
        // Add unique categories not already present
        const catGrid = document.querySelector('.categories-grid');
        if (catGrid) {
            const existingCats = new Set(
                [...catGrid.querySelectorAll('.category-card h3')].map(h => h.textContent.trim())
            );
            const seen = new Set();
            products.forEach(p => {
                const key = p.category.toUpperCase();
                if (!existingCats.has(key) && !seen.has(key)) {
                    seen.add(key);
                    catGrid.insertAdjacentHTML('beforeend', buildCategoryCard(p));
                }
            });
        }

        // ── FILTER BAR (if present) ──
        injectFilterBar(products);
    }

    function injectFilterBar(products) {
        const bestSection = document.querySelector('.best-sellers');
        if (!bestSection) return;

        const existingBar = bestSection.querySelector('.cloud-filter-bar');
        if (existingBar) existingBar.remove();

        const cats = ['All', ...new Set(products.map(p => p.category))];
        const bar = document.createElement('div');
        bar.className = 'cloud-filter-bar';
        bar.innerHTML = cats.map(c =>
            `<button class="cloud-filter-btn ${c === 'All' ? 'active' : ''}" data-cat="${c}">${c}</button>`
        ).join('');

        const heading = bestSection.querySelector('.section-header');
        if (heading) heading.after(bar);

        bar.addEventListener('click', e => {
            if (!e.target.matches('.cloud-filter-btn')) return;
            bar.querySelectorAll('.cloud-filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            const cat = e.target.dataset.cat;
            document.querySelectorAll('.product-card.cloud-product').forEach(card => {
                card.style.display = (cat === 'All' || card.dataset.category === cat) ? '' : 'none';
            });
        });
    }

    // Run after DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectCloudProducts);
    } else {
        injectCloudProducts();
    }

    // Listen for storage changes (cross-tab sync)
    window.addEventListener('storage', e => {
        if (e.key === STORAGE_KEY) injectCloudProducts();
    });
})();
