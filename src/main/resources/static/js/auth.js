// 用户认证管理

// 检查用户是否已登录
function checkUserSession() {
    return axios.get(`${API_BASE_URL}/users/profile`, {
        withCredentials: true
    }).then(response => {
        return response.data;
    }).catch(error => {
        return null;
    });
}

// 登录
function login(username, password) {
    return axios.post(`${API_BASE_URL}/users/login`, {
        username: username,
        password: password
    }, {
        withCredentials: true
    });
}

// 注册
function register(username, email, password) {
    return axios.post(`${API_BASE_URL}/users/register`, {
        username: username,
        email: email,
        password: password
    }, {
        withCredentials: true
    });
}

// 退出登录
function logout() {
    return axios.post(`${API_BASE_URL}/users/logout`, {}, {
        withCredentials: true
    }).then(() => {
        updateNavbar(null);
        window.location.href = 'index.html';
    });
}

// 更新导航栏状态
function updateNavbar(user) {
    if (user) {
        document.getElementById('loginLink').style.display = 'none';
        document.getElementById('registerLink').style.display = 'none';
        document.getElementById('userDropdown').style.display = 'block';
        document.getElementById('username').textContent = user.username;
        
        // 如果是管理员，显示管理链接
        if (user.role === 'ADMIN') {
            document.getElementById('adminProductsLink').style.display = 'block';
            document.getElementById('adminOrdersLink').style.display = 'block';
            document.getElementById('adminReportsLink').style.display = 'block';
        }
    } else {
        document.getElementById('loginLink').style.display = 'block';
        document.getElementById('registerLink').style.display = 'block';
        document.getElementById('userDropdown').style.display = 'none';
        // 隐藏管理员链接
        document.getElementById('adminProductsLink').style.display = 'none';
        document.getElementById('adminOrdersLink').style.display = 'none';
        document.getElementById('adminReportsLink').style.display = 'none';
    }
}

// 更新购物车数量
function updateCartCount() {
    axios.get(`${API_BASE_URL}/cart`, {
        withCredentials: true
    }).then(response => {
        const cartItems = response.data;
        const count = cartItems.length;
        document.getElementById('cartCount').textContent = count;
    }).catch(error => {
        document.getElementById('cartCount').textContent = '0';
    });
}

// 注释掉全局初始化代码，避免在注册和登录页面自动检查用户会话
// 页面可以根据需要手动调用checkUserSession()和updateNavbar()函数
// checkUserSession().then(user => {
//     updateNavbar(user);
//     
//     // 如果需要，也可以在这里更新购物车数量
//     if (user) {
//         updateCartCount();
//     }
// });