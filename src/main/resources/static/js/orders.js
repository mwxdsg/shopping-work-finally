// 订单功能

// 加载订单列表
function loadOrders() {
    checkUserSession().then(user => {
        if (!user) {
            // 如果用户未登录，跳转到登录页面
            window.location.href = 'login.html';
            return;
        }
        
        // 获取订单列表
        axios.get(`${API_BASE_URL}/orders`, {
            withCredentials: true
        })
        .then(response => {
            const orders = response.data;
            const ordersEmpty = document.getElementById('ordersEmpty');
            const ordersList = document.getElementById('ordersList');
            
            if (orders.length === 0) {
                ordersEmpty.style.display = 'block';
                ordersList.style.display = 'none';
            } else {
                ordersEmpty.style.display = 'none';
                ordersList.style.display = 'block';
                
                ordersList.innerHTML = '';
                orders.forEach(order => {
                    const orderCard = createOrderCard(order);
                    ordersList.appendChild(orderCard);
                });
            }
        })
        .catch(error => {
            console.error('加载订单失败:', error);
            ordersList.innerHTML = '<div class="alert alert-danger">加载订单失败，请稍后重试</div>';
        });
    });
}

// 创建订单卡片
function createOrderCard(order) {
    const div = document.createElement('div');
    div.className = 'order-card';
    
    const statusText = getOrderStatusText(order.status);
    const statusClass = getOrderStatusClass(order.status);
    
    div.innerHTML = `
        <div class="card-header">
            <div class="d-flex justify-content-between align-items-center">
                <span>订单号: ${order.id}</span>
                <span class="badge ${statusClass}">${statusText}</span>
            </div>
            <div class="mt-1">
                <small class="text-muted">创建时间: ${formatDate(order.createdAt)}</small>
            </div>
        </div>
        <div class="card-body">
            <div class="mb-3">
                <strong>收货地址:</strong> ${order.shippingAddress || '未填写'}
            </div>
            <div class="mb-3">
                <strong>邮箱:</strong> ${order.email || '未填写'}
            </div>
            <div class="mb-3">
                <strong>备注:</strong> ${order.remarks || '无'}
            </div>
            <hr>
            <h6>订单商品:</h6>
            <div id="orderItems-${order.id}"></div>
            <hr>
            <div class="d-flex justify-content-between">
                <span class="font-weight-bold">订单总价:</span>
                <span class="font-weight-bold">¥${order.totalAmount.toFixed(2)}</span>
            </div>
        </div>
    `;
    
    // 加载订单商品
    const orderItemsDiv = div.querySelector(`#orderItems-${order.id}`);
    order.orderItems.forEach(item => {
        const orderItemElement = createOrderItemElement(item);
        orderItemsDiv.appendChild(orderItemElement);
    });
    
    return div;
}

// 创建订单商品元素
function createOrderItemElement(item) {
    const div = document.createElement('div');
    div.className = 'order-item';
    
    div.innerHTML = `
        <div class="d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center">
                <div style="width: 60px; height: 60px; margin-right: 15px; background-color: #f8f9fa; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                    ${item.product.imageUrl ? `<img src="${item.product.imageUrl}" alt="${item.product.name}" style="max-width: 100%; max-height: 100%; object-fit: contain;">` : '<span class="text-muted">商品图片</span>'}
                </div>
                <div>
                    <span>${item.product.name}</span>
                    <small class="text-muted"> × ${item.quantity}</small>
                </div>
            </div>
            <span>¥${item.price.toFixed(2)}</span>
        </div>
    `;
    
    return div;
}

// 获取订单状态文本
function getOrderStatusText(status) {
    const statusMap = {
        'PENDING': '待处理',
        'SHIPPED': '已发货',
        'DELIVERED': '已送达',
        'CANCELLED': '已取消'
    };
    return statusMap[status] || status;
}

// 获取订单状态样式类
function getOrderStatusClass(status) {
    const statusMap = {
        'PENDING': 'badge-warning',
        'SHIPPED': 'badge-info',
        'DELIVERED': 'badge-success',
        'CANCELLED': 'badge-danger'
    };
    return statusMap[status] || 'badge-secondary';
}

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN');
}

// 页面加载完成后执行
window.addEventListener('load', () => {
    loadOrders();
});