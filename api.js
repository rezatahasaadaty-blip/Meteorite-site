// API Base URL - در production به طور خودکار از همان domain استفاده می‌کند
const API_BASE_URL = '';

class MeteoriteAPI {
    
    // دریافت تمام شهاب‌سنگ‌ها با فیلتر
    static async getMeteorites(filters = {}) {
        try {
            const queryParams = new URLSearchParams();
            
            // اضافه کردن فیلترها به پارامترهای query
            Object.keys(filters).forEach(key => {
                if (filters[key] !== undefined && filters[key] !== '' && filters[key] !== null) {
                    queryParams.append(key, filters[key]);
                }
            });

            const response = await fetch(`${API_BASE_URL}/api/meteorites?${queryParams}`);
            
            if (!response.ok) {
                throw new Error(`خطا در دریافت داده‌ها: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'خطای ناشناخته');
            }
            
            return data.meteorites || [];
            
        } catch (error) {
            console.error('خطا در دریافت داده‌ها:', error);
            this.showNotification('خطا در دریافت داده‌ها', 'error');
            return [];
        }
    }

    // دریافت یک شهاب‌سنگ خاص
    static async getMeteorite(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/meteorites/${id}`);
            
            if (!response.ok) {
                throw new Error(`خطا در دریافت داده: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'خطای ناشناخته');
            }
            
            return data.meteorite;
            
        } catch (error) {
            console.error('خطا در دریافت داده:', error);
            this.showNotification('خطا در دریافت اطلاعات شهاب‌سنگ', 'error');
            return null;
        }
    }

    // ثبت سفارش
    static async createOrder(orderData) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData)
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'خطا در ثبت سفارش');
            }
            
            if (!data.success) {
                throw new Error(data.error || 'خطا در ثبت سفارش');
            }
            
            return data;
            
        } catch (error) {
            console.error('خطا در ثبت سفارش:', error);
            this.showNotification(error.message || 'خطا در ثبت سفارش', 'error');
            return { success: false, error: error.message };
        }
    }

    // ارسال پیام تماس
    static async sendContact(contactData) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(contactData)
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'خطا در ارسال پیام');
            }
            
            if (!data.success) {
                throw new Error(data.error || 'خطا در ارسال پیام');
            }
            
            return data;
            
        } catch (error) {
            console.error('خطا در ارسال پیام:', error);
            this.showNotification(error.message || 'خطا در ارسال پیام', 'error');
            return { success: false, error: error.message };
        }
    }

    // نمایش نوتیفیکیشن
    static showNotification(message, type = 'success') {
        // ایجاد عنصر نوتیفیکیشن
        const notification = document.getElementById('notification');
        if (!notification) return;

        notification.textContent = message;
        notification.className = `notification ${type} show`;
        
        // مخفی کردن خودکار پس از 5 ثانیه
        setTimeout(() => {
            notification.classList.remove('show');
        }, 5000);
    }

    // فرمت قیمت به صورت فارسی
    static formatPrice(price) {
        return new Intl.NumberFormat('fa-IR').format(price);
    }

    // بررسی اینکه آیا API در دسترس است
    static async checkAPIHealth() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/meteorites?limit=1`);
            return response.ok;
        } catch (error) {
            return false;
        }
    }
}

// توابع کمکی
const Utils = {
    // ایجاد تاخیر برای جستجو
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // بررسی ایمیل
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    // بررسی شماره تلفن ایرانی
    validateIranianPhone(phone) {
        const re = /^09[0-9]{9}$/;
        return re.test(phone);
    },

    // پاک کردن فرم
    clearForm(formId) {
        const form = document.getElementById(formId);
        if (form) {
            form.reset();
        }
    },

    // نمایش/مخفی کردن المان
    toggleElement(elementId, show) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.display = show ? 'block' : 'none';
        }
    },

    // اضافه کردن گزینه به select
    addOptionToSelect(selectId, value, text) {
        const select = document.getElementById(selectId);
        if (select) {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = text;
            select.appendChild(option);
        }
    }
};

// صادر کردن برای استفاده در فایل‌های دیگر
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MeteoriteAPI, Utils };
}