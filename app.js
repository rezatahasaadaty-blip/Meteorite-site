class MeteoriteApp {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('meteoriteCart')) || [];
        this.currentMeteorites = [];
        this.isLoading = false;
        this.init();
    }

    async init() {
        console.log('🚀 راه‌اندازی اپلیکیشن شهاب‌سنگ...');
        
        // بررسی وضعیت API
        const isAPIHealthy = await MeteoriteAPI.checkAPIHealth();
        if (!isAPIHealthy) {
            console.warn('⚠️ API در دسترس نیست - استفاده از حالت آفلاین');
        }

        // راه‌اندازی کامپوننت‌ها
        this.setupEventListeners();
        this.setupTabs();
        this.setupModal();
        
        // بارگذاری اولیه داده‌ها
        await this.loadMeteorites();
        
        // به‌روزرسانی سبد خرید
        this.updateCartDisplay();
        
        console.log('✅ اپلیکیشن با موفقیت راه‌اندازی شد');
    }

    // تنظیم event listeners
    setupEventListeners() {
        // جستجو
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');
        
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce(() => {
                this.handleSearch();
            }, 500));
            
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleSearch();
                }
            });
        }
        
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.handleSearch();
            });
        }

        // فیلترها
        const filters = ['typeFilter', 'locationFilter', 'minPrice', 'maxPrice'];
        filters.forEach(filterId => {
            const element = document.getElementById(filterId);
            if (element) {
                element.addEventListener('change', () => {
                    this.handleSearch();
                });
            }
        });

        // بازنشانی فیلترها
        const resetBtn = document.getElementById('resetFilters');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetFilters();
            });
        }

        // فرم‌ها
        this.setupForms();
        
        // اسکرول نرم برای لینک‌های داخلی
        this.setupSmoothScroll();
        
        // مدیریت سبد خرید
        this.setupCart();
    }

    // تنظیم تب‌ها
    setupTabs() {
        const tabs = document.querySelectorAll('.tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.getAttribute('data-tab');
                this.switchTab(tabId);
            });
        });
    }

    // تعویض تب
    switchTab(tabId) {
        // غیرفعال کردن همه تب‌ها
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        // فعال کردن تب انتخاب شده
        document.querySelector(`.tab[data-tab="${tabId}"]`).classList.add('active');
        document.getElementById(`${tabId}-tab`).classList.add('active');
        
        // بارگذاری داده‌های خاص تب اگر لازم باشد
        if (tabId === 'buy') {
            this.populateOrderForm();
        }
    }

    // تنظیم مودال
    setupModal() {
        const modal = document.getElementById('meteoriteModal');
        const closeBtn = document.querySelector('.close');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }
        
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    // تنظیم فرم‌ها
    setupForms() {
        // فرم سفارش
        const orderForm = document.getElementById('orderForm');
        if (orderForm) {
            orderForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleOrderSubmit(e);
            });
        }

        // فرم شناسایی
        const idForm = document.getElementById('identificationForm');
        if (idForm) {
            idForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleIdentificationSubmit(e);
            });
        }

        // فرم فروش
        const sellForm = document.getElementById('sellForm');
        if (sellForm) {
            sellForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSellSubmit(e);
            });
        }

        // فرم تماس
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleContactSubmit(e);
            });
        }

        // تغییرات در فرم سفارش
        const orderMeteorite = document.getElementById('orderMeteorite');
        const orderQuantity = document.getElementById('orderQuantity');
        
        if (orderMeteorite) {
            orderMeteorite.addEventListener('change', () => {
                this.updateOrderSummary();
            });
        }
        
        if (orderQuantity) {
            orderQuantity.addEventListener('input', () => {
                this.updateOrderSummary();
            });
        }
    }

    // تنظیم اسکرول نرم
    setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // تنظیم سبد خرید
    setupCart() {
        const cartIcon = document.querySelector('.cart-icon');
        if (cartIcon) {
            cartIcon.addEventListener('click', () => {
                this.showCart();
            });
        }
    }

    // بارگذاری شهاب‌سنگ‌ها
    async loadMeteorites(filters = {}) {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.showLoading(true);
        
        try {
            const meteorites = await MeteoriteAPI.getMeteorites(filters);
            this.currentMeteorites = meteorites;
            this.displayMeteorites(meteorites);
            
            if (meteorites.length === 0) {
                this.showNoResults(true);
            } else {
                this.showNoResults(false);
            }
            
        } catch (error) {
            console.error('خطا در بارگذاری داده‌ها:', error);
            MeteoriteAPI.showNotification('خطا در بارگذاری داده‌ها', 'error');
        } finally {
            this.isLoading = false;
            this.showLoading(false);
        }
    }

    // نمایش شهاب‌سنگ‌ها
    displayMeteorites(meteorites) {
        const container = document.getElementById('meteoriteResults');
        if (!container) return;

        container.innerHTML = '';

        meteorites.forEach(meteorite => {
            const card = this.createMeteoriteCard(meteorite);
            container.innerHTML += card;
        });
    }

    // ایجاد کارت شهاب‌سنگ
    createMeteoriteCard(meteorite) {
        const imageUrl = meteorite.image_url || '';
        const displayImage = imageUrl ? 
            `<img src="${imageUrl}" alt="${meteorite.name}" onerror="this.style.display='none'">` :
            `<i class="fas fa-meteor"></i>`;
        
        return `
            <div class="meteorite-card" data-id="${meteorite.id}">
                <div class="meteorite-img">
                    ${displayImage}
                </div>
                <div class="meteorite-info">
                    <h3>${meteorite.name}</h3>
                    <p><strong>نوع:</strong> ${meteorite.type}</p>
                    <p><strong>محل کشف:</strong> ${meteorite.location}</p>
                    <p><strong>وزن:</strong> ${meteorite.weight} گرم</p>
                    <p class="description">${meteorite.description}</p>
                    <div class="price">${MeteoriteAPI.formatPrice(meteorite.price)} تومان</div>
                    <div class="actions">
                        <button class="btn btn-primary" onclick="app.addToCart(${meteorite.id})">
                            <i class="fas fa-cart-plus"></i> افزودن به سبد
                        </button>
                        <button class="btn btn-outline" onclick="app.showMeteoriteDetails(${meteorite.id})">
                            <i class="fas fa-info-circle"></i> جزئیات
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // مدیریت جستجو
    async handleSearch() {
        const filters = {
            search: document.getElementById('searchInput')?.value,
            type: document.getElementById('typeFilter')?.value,
            location: document.getElementById('locationFilter')?.value,
            min_price: document.getElementById('minPrice')?.value,
            max_price: document.getElementById('maxPrice')?.value
        };

        await this.loadMeteorites(filters);
    }

    // بازنشانی فیلترها
    resetFilters() {
        document.getElementById('searchInput').value = '';
        document.getElementById('typeFilter').value = '';
        document.getElementById('locationFilter').value = '';
        
        if (document.getElementById('minPrice')) {
            document.getElementById('minPrice').value = '';
        }
        
        if (document.getElementById('maxPrice')) {
            document.getElementById('maxPrice').value = '';
        }
        
        this.loadMeteorites();
    }

    // نمایش جزئیات شهاب‌سنگ
    async showMeteoriteDetails(id) {
        try {
            const meteorite = await MeteoriteAPI.getMeteorite(id);
            if (!meteorite) return;

            const modal = document.getElementById('meteoriteModal');
            const modalContent = document.getElementById('modalContent');
            
            const imageUrl = meteorite.image_url || '';
            const displayImage = imageUrl ? 
                `<img src="${imageUrl}" alt="${meteorite.name}" style="width: 100%; border-radius: 8px;">` :
                `<div class="meteorite-img" style="margin-bottom: 1rem;">
                    <i class="fas fa-meteor"></i>
                 </div>`;
            
            modalContent.innerHTML = `
                <div style="padding: 2rem;">
                    ${displayImage}
                    <h2 style="color: var(--primary-color); margin-bottom: 1rem;">${meteorite.name}</h2>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
                        <div><strong>نوع:</strong> ${meteorite.type}</div>
                        <div><strong>محل کشف:</strong> ${meteorite.location}</div>
                        <div><strong>وزن:</strong> ${meteorite.weight} گرم</div>
                        <div><strong>قیمت:</strong> ${MeteoriteAPI.formatPrice(meteorite.price)} تومان</div>
                    </div>
                    
                    <div style="margin-bottom: 1.5rem;">
                        <strong>توضیحات:</strong>
                        <p style="margin-top: 0.5rem; line-height: 1.6;">${meteorite.description}</p>
                    </div>
                    
                    <button class="btn btn-primary" onclick="app.addToCart(${meteorite.id}); app.closeModal();" style="width: 100%;">
                        <i class="fas fa-cart-plus"></i> افزودن به سبد خرید
                    </button>
                </div>
            `;
            
            modal.style.display = 'block';
            
        } catch (error) {
            console.error('خطا در نمایش جزئیات:', error);
            MeteoriteAPI.showNotification('خطا در نمایش جزئیات', 'error');
        }
    }

    // بستن مودال
    closeModal() {
        const modal = document.getElementById('meteoriteModal');
        modal.style.display = 'none';
    }

    // افزودن به سبد خرید
    async addToCart(meteoriteId) {
        try {
            const meteorite = this.currentMeteorites.find(m => m.id === meteoriteId);
            if (!meteorite) {
                // اگر در لیست جاری نبود، از API بگیر
                const fetchedMeteorite = await MeteoriteAPI.getMeteorite(meteoriteId);
                if (!fetchedMeteorite) {
                    throw new Error('شهاب‌سنگ پیدا نشد');
                }
                meteorite = fetchedMeteorite;
            }

            const existingItem = this.cart.find(item => item.id === meteoriteId);
            
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                this.cart.push({
                    id: meteorite.id,
                    name: meteorite.name,
                    price: meteorite.price,
                    quantity: 1,
                    image: meteorite.image_url
                });
            }

            this.saveCart();
            this.updateCartDisplay();
            
            MeteoriteAPI.showNotification(`"${meteorite.name}" به سبد خرید اضافه شد`);
            
        } catch (error) {
            console.error('خطا در افزودن به سبد خرید:', error);
            MeteoriteAPI.showNotification('خطا در افزودن به سبد خرید', 'error');
        }
    }

    // ذخیره سبد خرید
    saveCart() {
        localStorage.setItem('meteoriteCart', JSON.stringify(this.cart));
    }

    // به‌روزرسانی نمایش سبد خرید
    updateCartDisplay() {
        const cartCount = document.getElementById('cartCount');
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        
        if (cartCount) {
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    }

    // نمایش سبد خرید
    showCart() {
        if (this.cart.length === 0) {
            MeteoriteAPI.showNotification('سبد خرید شما خالی است');
            return;
        }

        const modal = document.getElementById('meteoriteModal');
        const modalContent = document.getElementById('modalContent');
        
        let cartHTML = `
            <div style="padding: 2rem;">
                <h2 style="color: var(--primary-color); margin-bottom: 1.5rem;">سبد خرید</h2>
        `;
        
        let total = 0;
        
        this.cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            cartHTML += `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: var(--light-color); border-radius: 8px; margin-bottom: 1rem;">
                    <div>
                        <div style="font-weight: bold;">${item.name}</div>
                        <div style="font-size: 0.9rem; color: var(--text-light);">
                            ${MeteoriteAPI.formatPrice(item.price)} تومان × ${item.quantity}
                        </div>
                    </div>
                    <div style="font-weight: bold; color: var(--accent-color);">
                        ${MeteoriteAPI.formatPrice(itemTotal)} تومان
                    </div>
                    <button class="btn btn-outline" onclick="app.removeFromCart(${index})" style="padding: 0.5rem;">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
        });
        
        cartHTML += `
            <div style="border-top: 2px solid var(--border-color); padding-top: 1rem; margin-top: 1rem;">
                <div style="display: flex; justify-content: space-between; font-size: 1.2rem; font-weight: bold;">
                    <span>جمع کل:</span>
                    <span style="color: var(--accent-color);">${MeteoriteAPI.formatPrice(total)} تومان</span>
                </div>
            </div>
            
            <div style="display: flex; gap: 1rem; margin-top: 2rem;">
                <button class="btn btn-primary" onclick="app.checkout()" style="flex: 2;">
                    <i class="fas fa-credit-card"></i> پرداخت
                </button>
                <button class="btn btn-outline" onclick="app.clearCart()" style="flex: 1;">
                    <i class="fas fa-trash"></i> خالی کردن
                </button>
            </div>
        </div>
        `;
        
        modalContent.innerHTML = cartHTML;
        modal.style.display = 'block';
    }

    // حذف از سبد خرید
    removeFromCart(index) {
        this.cart.splice(index, 1);
        this.saveCart();
        this.updateCartDisplay();
        this.showCart(); // به‌روزرسانی نمایش سبد خرید
    }

    // خالی کردن سبد خرید
    clearCart() {
        this.cart = [];
        this.saveCart();
        this.updateCartDisplay();
        this.closeModal();
        MeteoriteAPI.showNotification('سبد خرید خالی شد');
    }

    // پرداخت
    checkout() {
        this.switchTab('buy');
        this.closeModal();
        MeteoriteAPI.showNotification('لطفاً اطلاعات سفارش را تکمیل کنید');
    }

    // پر کردن فرم سفارش
    populateOrderForm() {
        const select = document.getElementById('orderMeteorite');
        if (!select) return;

        // پاک کردن گزینه‌های قبلی (به جز اولین گزینه)
        while (select.children.length > 1) {
            select.removeChild(select.lastChild);
        }

        // اضافه کردن شهاب‌سنگ‌های موجود
        this.currentMeteorites.forEach(meteorite => {
            const option = document.createElement('option');
            option.value = meteorite.id;
            option.textContent = `${meteorite.name} - ${MeteoriteAPI.formatPrice(meteorite.price)} تومان`;
            select.appendChild(option);
        });

        this.updateOrderSummary();
    }

    // به‌روزرسانی خلاصه سفارش
    updateOrderSummary() {
        const meteoriteId = document.getElementById('orderMeteorite')?.value;
        const quantity = document.getElementById('orderQuantity')?.value || 1;
        
        if (!meteoriteId) {
            document.getElementById('unitPrice').textContent = '0';
            document.getElementById('summaryQuantity').textContent = '0';
            document.getElementById('totalPrice').textContent = '0';
            return;
        }

        const meteorite = this.currentMeteorites.find(m => m.id == meteoriteId);
        if (!meteorite) return;

        const unitPrice = meteorite.price;
        const totalPrice = unitPrice * quantity;

        document.getElementById('unitPrice').textContent = MeteoriteAPI.formatPrice(unitPrice);
        document.getElementById('summaryQuantity').textContent = quantity;
        document.getElementById('totalPrice').textContent = MeteoriteAPI.formatPrice(totalPrice);
    }

    // مدیریت ارسال فرم سفارش
    async handleOrderSubmit(e) {
        const form = e.target;
        const formData = new FormData(form);
        
        const orderData = {
            meteorite_id: document.getElementById('orderMeteorite').value,
            quantity: parseInt(document.getElementById('orderQuantity').value),
            customer_name: document.getElementById('customerName').value,
            customer_email: document.getElementById('customerEmail').value,
            customer_phone: document.getElementById('customerPhone').value,
            shipping_address: document.getElementById('shippingAddress').value
        };

        // اعتبارسنجی
        if (!this.validateOrderData(orderData)) {
            return;
        }

        try {
            const result = await MeteoriteAPI.createOrder(orderData);
            
            if (result.success) {
                MeteoriteAPI.showNotification(`سفارش شما با شماره ${result.order_id} ثبت شد`);
                form.reset();
                this.clearCart();
                
                // نمایش رسید
                this.showOrderReceipt(result, orderData);
            }
            
        } catch (error) {
            console.error('خطا در ثبت سفارش:', error);
        }
    }

    // اعتبارسنجی داده‌های سفارش
    validateOrderData(data) {
        if (!data.meteorite_id) {
            MeteoriteAPI.showNotification('لطفاً شهاب‌سنگ را انتخاب کنید', 'error');
            return false;
        }
        
        if (!data.customer_name || !data.customer_email) {
            MeteoriteAPI.showNotification('لطفاً اطلاعات تماس را کامل کنید', 'error');
            return false;
        }
        
        if (!Utils.validateEmail(data.customer_email)) {
            MeteoriteAPI.showNotification('لطفاً یک ایمیل معتبر وارد کنید', 'error');
            return false;
        }
        
        if (data.customer_phone && !Utils.validateIranianPhone(data.customer_phone)) {
            MeteoriteAPI.showNotification('لطفاً شماره تلفن معتبر وارد کنید', 'error');
            return false;
        }
        
        return true;
    }

    // نمایش رسید سفارش
    showOrderReceipt(result, orderData) {
        const meteorite = this.currentMeteorites.find(m => m.id == orderData.meteorite_id);
        
        const receiptHTML = `
            <div style="padding: 2rem; text-align: center;">
                <i class="fas fa-check-circle" style="font-size: 4rem; color: var(--success-color); margin-bottom: 1rem;"></i>
                <h2 style="color: var(--success-color); margin-bottom: 1rem;">سفارش با موفقیت ثبت شد</h2>
                
                <div style="background: var(--light-color); padding: 1.5rem; border-radius: 8px; margin: 1.5rem 0; text-align: right;">
                    <div><strong>شماره سفارش:</strong> ${result.order_id}</div>
                    <div><strong>نام مشتری:</strong> ${orderData.customer_name}</div>
                    <div><strong>شهاب‌سنگ:</strong> ${meteorite?.name}</div>
                    <div><strong>تعداد:</strong> ${orderData.quantity}</div>
                    <div><strong>مبلغ قابل پرداخت:</strong> ${MeteoriteAPI.formatPrice(result.total_price)} تومان</div>
                </div>
                
                <p style="color: var(--text-light); margin-bottom: 1.5rem;">
                    همکاران ما به زودی با شما تماس خواهند گرفت.
                </p>
                
                <button class="btn btn-primary" onclick="app.closeModal()">
                    <i class="fas fa-check"></i> متوجه شدم
                </button>
            </div>
        `;
        
        const modal = document.getElementById('meteoriteModal');
        const modalContent = document.getElementById('modalContent');
        modalContent.innerHTML = receiptHTML;
        modal.style.display = 'block';
    }

    // مدیریت ارسال فرم شناسایی
    async handleIdentificationSubmit(e) {
        const form = e.target;
        const formData = new FormData(form);
        
        // در اینجا می‌توانید داده‌ها را به سرور ارسال کنید
        // برای نسخه نمایشی، فقط یک پیغام نشان می‌دهیم
        
        MeteoriteAPI.showNotification('درخواست شناسایی شما ثبت شد. کارشناسان ما به زودی با شما تماس خواهند گرفت.');
        form.reset();
    }

    // مدیریت ارسال فرم فروش
    async handleSellSubmit(e) {
        const form = e.target;
        const formData = new FormData(form);
        
        MeteoriteAPI.showNotification('درخواست فروش شما ثبت شد. کارشناسان ما به زودی با شما تماس خواهند گرفت.');
        form.reset();
    }

    // مدیریت ارسال فرم تماس
    async handleContactSubmit(e) {
        const form = e.target;
        const formData = new FormData(form);
        
        const contactData = {
            name: document.getElementById('contactName').value,
            email: document.getElementById('contactEmail').value,
            subject: document.getElementById('contactSubject').value,
            message: document.getElementById('contactMessage').value
        };

        if (!contactData.name || !contactData.email || !contactData.message) {
            MeteoriteAPI.showNotification('لطفاً فیلدهای ضروری را پر کنید', 'error');
            return;
        }

        if (!Utils.validateEmail(contactData.email)) {
            MeteoriteAPI.showNotification('لطفاً یک ایمیل معتبر وارد کنید', 'error');
            return;
        }

        try {
            const result = await MeteoriteAPI.sendContact(contactData);
            
            if (result.success) {
                MeteoriteAPI.showNotification(result.message);
                form.reset();
            }
            
        } catch (error) {
            console.error('خطا در ارسال پیام:', error);
        }
    }

    // نمایش/مخفی کردن loading
    showLoading(show) {
        const loading = document.getElementById('loadingIndicator');
        if (loading) {
            loading.style.display = show ? 'flex' : 'none';
        }
    }

    // نمایش/مخفی کردن پیغام عدم وجود نتیجه
    showNoResults(show) {
        const noResults = document.getElementById('noResults');
        if (noResults) {
            noResults.style.display = show ? 'block' : 'none';
        }
    }
}

// توابع global برای استفاده در HTML
function processOnlinePayment() {
    MeteoriteAPI.showNotification('درگاه پرداخت در نسخه نمایشی فعال نیست');
}

// راه‌اندازی اپلیکیشن وقتی DOM کاملاً لود شد
document.addEventListener('DOMContentLoaded', function() {
    window.app = new MeteoriteApp();
});

// مدیریت خطاهای全局
window.addEventListener('error', function(e) {
    console.error('خطای全局:', e.error);
});

// نمایش پیغام خوش‌آمدگویی در کنسول
console.log(`
%c🚀 سامانه شهاب‌سنگ ایران %c
%cویژه علاقه‌مندان به نجوم و شهاب‌سنگ‌شناسی

📞 پشتیبانی: ۰۲۱-۶۶۱۶۶۱۶۶
📧 ایمیل: info@meteorite.ir

`, 'color: #e53e3e; font-size: 16px; font-weight: bold;', 
   'color: #1a365d; font-size: 12px;',
   'color: #718096; font-size: 11px;');