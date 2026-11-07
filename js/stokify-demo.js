(function () {
    "use strict";

    const storageKey = "stokify-demo-data";
    const initialData = {
        stock: [
            { id: "beras", name: "Beras", quantity: 2, unit: "kg", minimum: 5, category: "Bahan Makanan", note: "" },
            { id: "minyak", name: "Minyak Goreng", quantity: 3, unit: "liter", minimum: 2, category: "Bahan Makanan", note: "" },
            { id: "sabun-cuci", name: "Sabun Cuci Piring", quantity: 1, unit: "botol", minimum: 2, category: "Kebersihan", note: "" },
            { id: "gula", name: "Gula Pasir", quantity: 5, unit: "kg", minimum: 3, category: "Bahan Makanan", note: "" },
            { id: "mie", name: "Mie Instan", quantity: 8, unit: "bungkus", minimum: 10, category: "Bahan Makanan", note: "" },
            { id: "telur", name: "Telur Ayam", quantity: 25, unit: "butir", minimum: 20, category: "Bahan Makanan", note: "" }
        ],
        shopping: [
            { id: "beras", name: "Beras", quantity: "5 kg", price: 75000, category: "Bahan Makanan", checked: false },
            { id: "sabun-piring", name: "Sabun Cuci Piring", quantity: "2 botol", price: 24000, category: "Kebersihan", checked: false },
            { id: "telur-belanja", name: "Telur", quantity: "1 kg", price: 30000, category: "Bahan Makanan", checked: false },
            { id: "sabun-mandi", name: "Sabun Mandi", quantity: "3 pcs", price: 15000, category: "Perlengkapan Mandi", checked: false },
            { id: "bumbu", name: "Bumbu Instan", quantity: "3 pcs", price: 15000, category: "Bahan Makanan", checked: false },
            { id: "garam", name: "Garam", quantity: "1 bungkus", price: 6000, category: "Bahan Makanan", checked: false },
            { id: "mie-belanja", name: "Mie Instan", quantity: "5 bungkus", price: 15000, category: "Bahan Makanan", checked: false },
            { id: "gula-belanja", name: "Gula", quantity: "1 kg", price: 21000, category: "Bahan Makanan", checked: false }
        ],
        unreadNotifications: 3
    };

    function readData() {
        const saved = localStorage.getItem(storageKey);
        const data = saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(initialData));

        if (!Array.isArray(data.stock) || !Array.isArray(data.shopping)) {
            throw new Error("Data demo Stokify di browser tidak valid.");
        }
        return data;
    }

    let data = readData();

    function saveData() {
        localStorage.setItem(storageKey, JSON.stringify(data));
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, function (character) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            }[character];
        });
    }

    function rupiah(value) {
        return "Rp " + new Intl.NumberFormat("id-ID").format(value);
    }

    function makeId() {
        return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    }

    function renderStock() {
        const body = document.querySelector(".wrap table tbody");
        if (!body || !document.querySelector("h2")?.textContent.includes("Daftar Stok")) return;

        body.innerHTML = data.stock.map(function (item) {
            const low = Number(item.quantity) <= Number(item.minimum);
            return `<tr>
                <td class="nama">${escapeHtml(item.name)}</td>
                <td>${escapeHtml(item.quantity)} ${escapeHtml(item.unit)}</td>
                <td>${escapeHtml(item.minimum)} ${escapeHtml(item.unit)}</td>
                <td><span class="badge ${low ? "menipis" : "cukup"}">${low ? "Menipis" : "Cukup"}</span></td>
                <td><button type="button" class="ubah" data-action="edit-stock" data-id="${escapeHtml(item.id)}">Ubah</button>
                <button type="button" class="hapus" data-action="delete-stock" data-id="${escapeHtml(item.id)}">Hapus</button></td>
            </tr>`;
        }).join("");
    }

    function renderShopping() {
        const body = document.querySelector(".wrap table tbody");
        const heading = document.querySelector("h2");
        if (!body || !heading?.textContent.includes("Daftar Belanja")) return;

        const search = document.querySelector(".toolbar input[type='search']");
        const category = document.querySelector("#kategori");
        const query = search ? search.value.trim().toLocaleLowerCase("id") : "";
        const selectedCategory = category ? category.value : "Semua";
        if (category) {
            const categories = new Set(data.shopping.map(function (item) {
                return item.category;
            }));
            categories.forEach(function (name) {
                if (![...category.options].some(function (option) { return option.value === name; })) {
                    category.add(new Option(name, name));
                }
            });
        }
        const visibleItems = data.shopping.filter(function (item) {
            const matchesName = item.name.toLocaleLowerCase("id").includes(query);
            const matchesCategory = selectedCategory === "Semua" || item.category === selectedCategory;
            return matchesName && matchesCategory;
        });

        body.innerHTML = visibleItems.map(function (item) {
            return `<tr>
                <td><input type="checkbox" aria-label="Tandai ${escapeHtml(item.name)} sudah dibeli"
                    data-action="toggle-shopping" data-id="${escapeHtml(item.id)}" ${item.checked ? "checked" : ""}></td>
                <td class="nama">${escapeHtml(item.name)}</td>
                <td>${escapeHtml(item.quantity)}</td>
                <td>${rupiah(Number(item.price) || 0)}</td>
            </tr>`;
        }).join("");
    }

    function renderEstimate() {
        const totalElement = document.querySelector(".total strong");
        if (!totalElement) return;

        const totals = new Map();
        let total = 0;
        data.shopping.forEach(function (item) {
            const price = Number(item.price) || 0;
            total += price;
            totals.set(item.category, (totals.get(item.category) || 0) + price);
        });
        totalElement.textContent = rupiah(total);

        const details = document.querySelector(".kanan");
        if (!details) return;
        const entries = Array.from(totals.entries());
        details.innerHTML = `<h3>Rincian per kategori</h3>` + entries.map(function (entry) {
            const percentage = total ? Math.round(entry[1] / total * 100) : 0;
            return `<div class="item">
                <div class="baris"><span>${escapeHtml(entry[0])}</span><b>${rupiah(entry[1])}</b></div>
                <div class="bar"><span style="width: ${percentage}%"></span></div>
            </div>`;
        }).join("");
    }

    function bindStockPage() {
        if (!document.querySelector("h2")?.textContent.includes("Daftar Stok")) return;
        renderStock();

        const searchForm = document.querySelector("main form[role='search']");
        const searchInput = searchForm?.querySelector("input[type='search']");
        searchInput?.addEventListener("input", function () {
            const query = searchInput.value.trim().toLocaleLowerCase("id");
            document.querySelectorAll(".wrap table tbody tr").forEach(function (row) {
                row.hidden = !row.textContent.toLocaleLowerCase("id").includes(query);
            });
        });
        searchForm?.addEventListener("submit", function (event) {
            event.preventDefault();
        });

        document.querySelector(".tambah")?.addEventListener("click", function () {
            const lowStock = data.stock.filter(function (item) {
                return Number(item.quantity) <= Number(item.minimum);
            });
            let added = 0;
            lowStock.forEach(function (stockItem) {
                const exists = data.shopping.some(function (item) {
                    return item.name.toLocaleLowerCase("id") === stockItem.name.toLocaleLowerCase("id");
                });
                if (!exists) {
                    data.shopping.push({
                        id: makeId(),
                        name: stockItem.name,
                        quantity: `${stockItem.minimum} ${stockItem.unit}`,
                        price: 0,
                        category: stockItem.category,
                        checked: false
                    });
                    added += 1;
                }
            });
            saveData();
            window.alert(added ? `${added} barang stok menipis ditambahkan ke daftar belanja.` : "Semua barang stok menipis sudah ada di daftar belanja.");
        });

        document.querySelector(".wrap table tbody")?.addEventListener("click", function (event) {
            const button = event.target.closest("button[data-action]");
            if (!button) return;
            const item = data.stock.find(function (stockItem) {
                return stockItem.id === button.dataset.id;
            });
            if (!item) return;

            if (button.dataset.action === "delete-stock") {
                if (!window.confirm(`Hapus stok ${item.name}?`)) return;
                data.stock = data.stock.filter(function (stockItem) {
                    return stockItem.id !== item.id;
                });
            } else {
                const quantity = window.prompt("Jumlah stok:", item.quantity);
                if (quantity === null) return;
                const minimum = window.prompt("Stok minimum:", item.minimum);
                if (minimum === null) return;
                if (quantity.trim() === "" || minimum.trim() === "" ||
                    !Number.isFinite(Number(quantity)) || !Number.isFinite(Number(minimum)) ||
                    Number(quantity) < 0 || Number(minimum) < 0) {
                    window.alert("Jumlah dan stok minimum harus berupa angka nol atau lebih.");
                    return;
                }
                item.quantity = Number(quantity);
                item.minimum = Number(minimum);
            }
            saveData();
            renderStock();
        });
    }

    function bindNoteForm() {
        const form = document.querySelector(".form-barang");
        if (!form) return;

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            const name = form.querySelector("#nama").value.trim();
            const quantity = Number(form.querySelector("#jumlah").value);
            const minimumInput = form.querySelector("#minimum").value;
            const minimum = minimumInput === "" ? 0 : Number(minimumInput);
            if (!name || !Number.isFinite(quantity) || !Number.isFinite(minimum) || quantity < 0 || minimum < 0) {
                window.alert("Lengkapi nama barang dan masukkan jumlah stok yang valid.");
                return;
            }

            data.stock.push({
                id: makeId(),
                name: name,
                quantity: quantity,
                unit: form.querySelector("#satuan").value,
                minimum: minimum,
                category: form.querySelector("#kategori").value,
                note: form.querySelector("#catatan").value.trim()
            });
            saveData();
            form.reset();
            window.alert("Barang berhasil disimpan ke daftar stok.");
        });
    }

    function bindShoppingPage() {
        const heading = document.querySelector("h2");
        if (!heading?.textContent.includes("Daftar Belanja")) return;
        renderShopping();
        document.querySelector(".toolbar input[type='search']")?.addEventListener("input", renderShopping);
        document.querySelector("#kategori")?.addEventListener("change", renderShopping);

        document.querySelector(".tambah")?.addEventListener("click", function () {
            const name = window.prompt("Nama barang:");
            if (name === null) return;
            const quantity = window.prompt("Jumlah dan satuan (contoh: 2 kg):");
            if (quantity === null) return;
            const priceInput = window.prompt("Perkiraan harga (angka, tanpa Rp):", "0");
            if (priceInput === null) return;
            const price = Number(priceInput);
            if (!name.trim() || !quantity.trim() || !Number.isFinite(price) || price < 0) {
                window.alert("Nama, jumlah, dan harga harus diisi dengan benar.");
                return;
            }

            data.shopping.push({
                id: makeId(),
                name: name.trim(),
                quantity: quantity.trim(),
                price: price,
                category: window.prompt("Kategori barang:", "Bahan Makanan") || "Lainnya",
                checked: false
            });
            saveData();
            renderShopping();
        });

        document.querySelector(".wrap table tbody")?.addEventListener("change", function (event) {
            const checkbox = event.target.closest("input[data-action='toggle-shopping']");
            if (!checkbox) return;
            const item = data.shopping.find(function (shoppingItem) {
                return shoppingItem.id === checkbox.dataset.id;
            });
            if (item) {
                item.checked = checkbox.checked;
                saveData();
            }
        });
    }

    function bindNotifications() {
        const card = document.querySelector(".card.shadow-sm");
        if (!card || !document.querySelector("h1")?.textContent.includes("Notifikasi")) return;

        const header = card.querySelector(".card-header");
        const countBadge = header?.querySelector(".badge");
        const markButton = document.createElement("button");
        markButton.type = "button";
        markButton.className = "btn btn-sm btn-outline-primary";
        markButton.textContent = "Tandai semua dibaca";
        header?.appendChild(markButton);

        function updateCount() {
            const unreadItems = card.querySelectorAll(".notification-item.unread");
            data.unreadNotifications = unreadItems.length;
            if (countBadge) countBadge.textContent = `${unreadItems.length} belum dibaca`;
            markButton.disabled = unreadItems.length === 0;
            saveData();
        }

        card.querySelectorAll(".notification-item").forEach(function (item, index) {
            if (index >= data.unreadNotifications) item.classList.remove("unread");
        });
        updateCount();
        markButton.addEventListener("click", function () {
            card.querySelectorAll(".notification-item.unread").forEach(function (item) {
                item.classList.remove("unread");
                item.querySelector(".badge.text-bg-primary")?.remove();
            });
            updateCount();
        });
    }

    function bindGlobalSearch() {
        const form = document.querySelector("nav form[role='search']");
        const input = form?.querySelector("input[type='search']");
        if (!form || !input) return;
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            const query = input.value.trim().toLocaleLowerCase("id");
            const cards = document.querySelectorAll(".card");
            if (cards.length) {
                cards.forEach(function (card) {
                    card.hidden = !card.textContent.toLocaleLowerCase("id").includes(query);
                });
            } else if (query) {
                window.alert("Gunakan kolom pencarian pada halaman untuk mencari barang.");
            }
        });
    }

    bindGlobalSearch();
    bindStockPage();
    bindNoteForm();
    bindShoppingPage();
    renderEstimate();
    bindNotifications();
})();
