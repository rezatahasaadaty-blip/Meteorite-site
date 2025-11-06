// داده‌های نمونه برای محصولات
const productsData = [
    {
        id: 1,
        name: "شهاب‌سنگ آهنی Seymchan",
        type: "آهنی",
        price: 1850000,
        weight: 156,
        location: "روسیه",
        year: 1967,
        certificate: "IMCA",
        image: "images/meteorite1.jpg",
        specs: {
            composition: "آهن-نیکل",
            classification: "IIAB",
            density: "7.9 g/cm³"
        },
        featured: true,
        stock: 3
    },
    {
        id: 2,
        name: "کندریت معمولی NWA",
        type: "سنگی",
        price: 890000,
        weight: 89,
        location: "شمال آفریقا",
        year: 2001,
        certificate: "IMCA",
        image: "images/meteorite2.jpg",
        specs: {
            composition: "سیلیکات",
            classification: "L5",
            density: "3.4 g/cm³"
        },
        featured: true,
        stock: 5
    },
    {
        id: 3,
        name: "پالاسیت Brenham",
        type: "آهنی-سنگی",
        price: 3250000,
        weight: 210,
        location: "کانزاس، آمریکا",
        year: 1882,
        certificate: "NASA",
        image: "images/meteorite3.jpg",
        specs: {
            composition: "آهن-اولیوین",
            classification: "Pallasite",
            density: "4.8 g/cm³"
        },
        featured: true,
        stock: 1
    }
];

// داده‌های دوره‌های آموزشی
const coursesData = [
    {
        id: 1,
        title: "مبانی شهاب‌سنگ‌شناسی",
        description: "آشنایی با اصول اولیه شناسایی و طبقه‌بندی شهاب‌سنگ‌ها",
        price: 290000,
        duration: "8 ساعت",
        students: 45,
        level: "مبتدی",
        instructor: "دکتر محمدی",
        image: "images/course1.jpg"
    },
    {
        id: 2,
        title: "تشخیص شهاب‌سنگ اصل",
        description: "آموزش تکنیک‌های پیشرفته تشخیص شهاب‌سنگ‌های اصل از نمونه‌های تقلبی",
        price: 450000,
        duration: "12 ساعت",
        students: 28,
        level: "پیشرفته",
        instructor: "دکتر رضوی",
        image: "images/course2.jpg"
    }
];

// مدیریت سبد خرید
let cart = JSON.parse(localStorage.getItem('meteorite-cart')) || [];

// نمایش محصولات ویژه در صفحه اصلی
function displayFeaturedProducts() {
    const container = document.getElementById('featured-products');
    if (!container) return;

    const featuredProducts = productsData.filter(product => product.featured);
    
    container.innerHTML = featuredProducts.map(product => `
        <div class="product-card" data-id="${product.id}">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
                ${product.stock < 2 ? '<span class="product-badge">نزدیک به اتمام</span>' : ''}
                <div class="product-price">${product.price.toLocaleString()} تومان</div>
            </div>
            <div class="product-content">
                <h3>${product.name}</h3>
                <span class="product-type">${product.type}</span>
                <ul class="product-specs">
                    <li>وزن: <span>${product.weight} گرم</span></li>
                    <li>محل کشف: <span>${product.location}</span></li>
                    <li>سال کشف: <span>${product.year}</span></li>
                    <li>گواهی: <span>${product.certificate}</span></li>
                </ul>
                <button class="add-to-cart" onclick="addToCart(${product.id})" 
                    ${product.stock === 0 ? 'disabled' : ''}>
                    ${product.stock === 0 ? 'اتمام موجودی' : 'افزودن به سبد خرید'}
                </button>
            </div>
        </div>
    `).join('');
}

// افزودن به سبد خرید
function addToCart(productId) {
    const product = productsData.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        if (existingItem.quantity >= product.stock) {
            alert('موجودی این محصول به پایان رسیده است!');
            return;
        }
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }

    updateCart();
    showNotification('محصول به سبد خرید اضافه شد!', 'success');
}

// به‌روزرسانی سبد خرید
function updateCart() {
    localStorage.setItem('meteorite-cart', JSON.stringify(cart));
    
    // به‌روزرسانی شمارنده سبد خرید
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
    
    // به‌روزرسانی نمایش سبد خرید
    updateCartDisplay();
}

// نمایش سبد خرید
function updateCartDisplay() {
    const cartItems = document.getElementById('cart-items');
    const totalPrice = document.querySelector('.total-price');
    
    if (!cartItems || !totalPrice) return;
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">سبد خرید خالی است</p>';
        totalPrice.textContent = '۰ تومان';
        return;
    }
    
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">${item.price.toLocaleString()} تومان</div>
                <div class="cart-item-quantity">تعداد: ${item.quantity}</div>
            </div>
            <button class="cart-item-remove" onclick="removeFromCart(${item.id})">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    totalPrice.textContent = `${total.toLocaleString()} تومان`;
}

// حذف از سبد خرید
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
    showNotification('محصول از سبد خرید حذف شد!', 'warning');
}

// نمایش/پنهان کردن سبد خرید
function toggleCart() {
    const cartSidebar = document.getElementById('cart-sidebar');
    if (cartSidebar) {
        cartSidebar.classList.toggle('active');
    }
}

// نمایش نوتیفیکیشن
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;
    
    // استایل نوتیفیکیشن
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        left: 20px;
        background: ${type === 'success' ? '#27ae60' : type === 'warning' ? '#e74c3c' : '#3498db'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 5px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 3000;
        display: flex;
        align-items: center;
        gap: 1rem;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 3000);
}

// اسکرول نرم
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

// مقداردهی اولیه هنگام لود صفحه
document.addEventListener('DOMContentLoaded', function() {
    displayFeaturedProducts();
    updateCart();
    
    // بستن سبد خرید با کلیک خارج
    document.addEventListener('click', function(e) {
        const cartSidebar = document.getElementById('cart-sidebar');
        if (cartSidebar && !cartSidebar.contains(e.target) && 
            !e.target.closest('.cart-btn')) {
            cartSidebar.classList.remove('active');
        }
    });
});

// انیمیشن‌های CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(-100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .empty-cart {
        text-align: center;
        color: #666;
        padding: 2rem;
    }
    
    .notification button {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        font-size: 1.2rem;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
`;
document.head.appendChild(style);