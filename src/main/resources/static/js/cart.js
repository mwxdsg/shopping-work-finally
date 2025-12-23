// 购物车功能

// 加载购物车商品
function loadCartItems() {
    checkUserSession().then(user => {
        if (!user) {
            // 如果用户未登录，跳转到登录页面
            window.location.href = 'login.html';
            return;
        }
        
        // 获取购物车商品
        axios.get(`${API_BASE_URL}/cart`, {
            withCredentials: true
        })
        .then(response => {
            const cartItems = response.data;
            const cartEmpty = document.getElementById('cartEmpty');
            const cartItemsDiv = document.getElementById('cartItems');
            const cartItemsList = document.getElementById('cartItemsList');
            
            if (cartItems.length === 0) {
                cartEmpty.style.display = 'block';
                cartItemsDiv.style.display = 'none';
            } else {
                cartEmpty.style.display = 'none';
                cartItemsDiv.style.display = 'block';
                
                cartItemsList.innerHTML = '';
                cartItems.forEach(item => {
                    const cartItemElement = createCartItemElement(item);
                    cartItemsList.appendChild(cartItemElement);
                });
                
                // 更新总价
                updateTotalPrice(cartItems);
            }
        })
        .catch(error => {
            console.error('加载购物车失败:', error);
            cartItemsList.innerHTML = '<div class="alert alert-danger">加载购物车失败，请稍后重试</div>';
        });
    });
}

// 创建购物车商品元素
function createCartItemElement(item) {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
        <div class="row">
            <div class="col-12 col-md-6">
                <div class="product-info">
                    <div style="width: 80px; height: 80px; background-color: #f8f9fa; display: flex; align-items: center; justify-content: center; margin-right: 1rem; overflow: hidden;">
                        ${item.product.imageUrl ? `<img src="${item.product.imageUrl}" alt="${item.product.name}" style="max-width: 100%; max-height: 100%; object-fit: contain;">` : '<span class="text-muted">商品图片</span>'}
                    </div>
                    <div class="product-details">
                        <h6>${item.product.name}</h6>
                        <p class="text-muted">¥${item.product.price.toFixed(2)}</p>
                    </div>
                </div>
            </div>
            <div class="col-12 col-md-6">
                <div class="d-flex justify-content-between align-items-center">
                    <div class="quantity-control">
                        <button class="btn btn-sm btn-outline-secondary" onclick="updateCartItemQuantity(${item.id}, ${item.quantity - 1})">-</button>
                        <input type="number" class="form-control form-control-sm" value="${item.quantity}" min="1" max="${item.product.stock}" onchange="updateCartItemQuantity(${item.id}, this.value)">
                        <button class="btn btn-sm btn-outline-secondary" onclick="updateCartItemQuantity(${item.id}, ${item.quantity + 1})">+</button>
                    </div>
                    <button class="btn btn-sm btn-danger" onclick="removeCartItem(${item.id})">&times;</button>
                </div>
            </div>
        </div>
    `;
    
    return div;
}

// 更新购物车商品数量
function updateCartItemQuantity(cartItemId, quantity) {
    quantity = parseInt(quantity);
    if (quantity < 1) return;
    
    axios.put(`${API_BASE_URL}/cart/${cartItemId}`, {}, {
        params: { quantity },
        withCredentials: true
    })
    .then(() => {
        // 重新加载购物车
        loadCartItems();
        // 更新导航栏购物车数量
        updateCartCount();
    })
    .catch(error => {
        console.error('更新购物车商品数量失败:', error);
        alert('更新失败，请稍后重试');
    });
}

// 移除购物车商品
function removeCartItem(cartItemId) {
    if (confirm('确定要移除这个商品吗？')) {
        axios.delete(`${API_BASE_URL}/cart/${cartItemId}`, {
            withCredentials: true
        })
        .then(() => {
            // 重新加载购物车
            loadCartItems();
            // 更新导航栏购物车数量
            updateCartCount();
        })
        .catch(error => {
            console.error('移除购物车商品失败:', error);
            alert('移除失败，请稍后重试');
        });
    }
}

// 更新总价
function updateTotalPrice(cartItems) {
    const totalPrice = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    document.getElementById('totalPrice').textContent = `¥${totalPrice.toFixed(2)}`;
    document.getElementById('finalPrice').textContent = `¥${totalPrice.toFixed(2)}`;
}

// 去结算
function checkout() {
    const checkoutBtn = document.getElementById('checkoutBtn');
    const originalText = checkoutBtn.textContent;
    
    // 收集订单信息
    const shippingAddress = document.getElementById('shippingAddress').value;
    const email = document.getElementById('email').value;
    const remarks = document.getElementById('remarks').value;
    
    // 简单验证
    if (!shippingAddress.trim()) {
        alert('请输入收货地址');
        return;
    }
    
    if (!email.trim()) {
        alert('请输入联系邮箱');
        return;
    }
    
    // 显示加载状态
    checkoutBtn.disabled = true;
    checkoutBtn.textContent = '创建订单中...';
    
    // 构建订单数据
    const orderData = {
        shippingAddress: shippingAddress,
        email: email,
        remarks: remarks
    };
    
    axios.post(`${API_BASE_URL}/orders`, orderData, {
        withCredentials: true
    })
    .then(response => {
        // 订单创建成功
        alert('订单创建成功！');
        window.location.href = 'orders.html';
    })
    .catch(error => {
        console.error('创建订单失败:', error);
        
        // 更详细的错误处理和用户反馈
        let errorMessage = '创建订单失败，请稍后重试';
        
        if (error.response) {
            // 服务器返回了错误状态码
            if (error.response.status === 401) {
                errorMessage = '请先登录后再创建订单';
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } else if (error.response.status === 400) {
                errorMessage = '购物车为空或商品信息有误';
            } else if (error.response.status === 500) {
                errorMessage = '服务器内部错误，请稍后重试';
            } else {
                errorMessage = `创建订单失败: ${error.response.status} ${error.response.statusText}`;
            }
        } else if (error.request) {
            // 请求已发出，但没有收到响应
            errorMessage = '网络错误，请检查网络连接';
        } else {
            // 请求配置出错
            errorMessage = '请求配置错误，请刷新页面重试';
        }
        
        alert(errorMessage);
    })
    .finally(() => {
        // 恢复按钮状态
        checkoutBtn.disabled = false;
        checkoutBtn.textContent = originalText;
    });
}

// 页面加载完成后执行
window.addEventListener('load', () => {
    loadCartItems();
    
    // 绑定结算按钮事件
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', checkout);
    }
});