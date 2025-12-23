// 管理员订单管理

// 加载订单列表
function loadOrders(status = '') {
    checkUserSession().then(user => {
        if (!user || user.role !== 'ADMIN') {
            // 如果用户不是管理员，跳转到首页
            window.location.href = 'index.html';
            return;
        }
        
        // 获取订单列表
        const url = status ? `${API_BASE_URL}/reports/orders/status?status=${status}` : `${API_BASE_URL}/reports/orders`;
        
        axios.get(url, {
            withCredentials: true
        })
        .then(response => {
            const orders = response.data;
            const ordersList = document.getElementById('ordersList');
            
            ordersList.innerHTML = '';
            
            if (orders.length === 0) {
                ordersList.innerHTML = '<div class="alert alert-info">没有找到订单</div>';
                return;
            }
            
            // 创建表格
            const table = document.createElement('table');
            table.className = 'table table-striped table-bordered';
            table.innerHTML = `
                <thead class="thead-dark">
                    <tr>
                        <th>订单号</th>
                        <th>用户ID</th>
                        <th>订单金额</th>
                        <th>收货地址</th>
                        <th>邮箱</th>
                        <th>状态</th>
                        <th>创建时间</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody id="ordersTableBody"></tbody>
            `;
            
            ordersList.appendChild(table);
            
            // 填充表格数据
            const tableBody = document.getElementById('ordersTableBody');
            orders.forEach(order => {
                const row = createOrderRow(order);
                tableBody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('加载订单失败:', error);
            ordersList.innerHTML = '<div class="alert alert-danger">加载订单失败，请稍后重试</div>';
        });
    });
}

// 创建订单表格行
function createOrderRow(order) {
    const tr = document.createElement('tr');
    
    const statusText = getOrderStatusText(order.status);
    const statusClass = getOrderStatusClass(order.status);
    
    tr.innerHTML = `
        <td>${order.id}</td>
        <td>${order.user.id}</td>
        <td>¥${order.totalAmount.toFixed(2)}</td>
        <td>${order.shippingAddress || '-'}</td>
        <td>${order.email || '-'}</td>
        <td><span class="badge ${statusClass}">${statusText}</span></td>
        <td>${formatDate(order.createdAt)}</td>
        <td>
            <button class="btn btn-sm btn-primary" onclick="viewOrder(${order.id})">查看</button>
            <button class="btn btn-sm btn-warning" onclick="updateOrderStatus(${order.id}, '${order.status}')">更新状态</button>
        </td>
    `;
    return tr;
}

// 查看订单详情
function viewOrder(orderId) {
    // 获取订单详情
    axios.get(`${API_BASE_URL}/orders/${orderId}`, {
        withCredentials: true
    })
    .then(response => {
        const order = response.data;
        
        // 创建详情弹窗
        const modal = createOrderDetailModal(order);
        document.body.appendChild(modal);
        
        // 显示弹窗
        $(modal).modal('show');
        
        // 关闭时移除弹窗
        $(modal).on('hidden.bs.modal', function() {
            document.body.removeChild(modal);
        });
    })
    .catch(error => {
        console.error('获取订单详情失败:', error);
        alert('获取订单详情失败，请稍后重试');
    });
}

// 创建订单详情模态框
function createOrderDetailModal(order) {
    const div = document.createElement('div');
    div.className = 'modal fade';
    div.tabIndex = -1;
    div.role = 'dialog';
    div.innerHTML = `
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">订单详情</h5>
                    <button type="button" class="close" data-dismiss="modal">
                        <span>&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <strong>订单号:</strong> ${order.id}
                    </div>
                    <div class="mb-3">
                        <strong>用户ID:</strong> ${order.user.id}
                    </div>
                    <div class="mb-3">
                        <strong>收货地址:</strong> ${order.shippingAddress || '未填写'}
                    </div>
                    <div class="mb-3">
                        <strong>邮箱:</strong> ${order.email || '未填写'}
                    </div>
                    <div class="mb-3">
                        <strong>备注:</strong> ${order.remarks || '无'}
                    </div>
                    <div class="mb-3">
                        <strong>状态:</strong> <span class="badge ${getOrderStatusClass(order.status)}">${getOrderStatusText(order.status)}</span>
                    </div>
                    <div class="mb-3">
                        <strong>创建时间:</strong> ${formatDate(order.createdAt)}
                    </div>
                    <hr>
                    <h6>订单商品:</h6>
                    <div id="orderItemsDetail"></div>
                    <hr>
                    <div class="text-right">
                        <strong>订单总价:</strong> ¥${order.totalAmount.toFixed(2)}
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">关闭</button>
                </div>
            </div>
        </div>
    `;
    
    // 填充订单商品
    const orderItemsDiv = div.querySelector('#orderItemsDetail');
    order.orderItems.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'mb-3 d-flex align-items-center';
        itemDiv.innerHTML = `
            <div style="width: 50px; height: 50px; margin-right: 15px; background-color: #f8f9fa; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                ${item.product.imageUrl ? `<img src="${item.product.imageUrl}" alt="${item.product.name}" style="max-width: 100%; max-height: 100%; object-fit: contain;">` : '<span class="text-muted">商品图片</span>'}
            </div>
            <div>
                <div>${item.product.name} × ${item.quantity}</div>
                <div class="text-muted">¥${item.price.toFixed(2)}</div>
            </div>
        `;
        orderItemsDiv.appendChild(itemDiv);
    });
    
    return div;
}

// 更新订单状态
function updateOrderStatus(orderId, currentStatus) {
    // 填充表单
    document.getElementById('updateOrderId').value = orderId;
    document.getElementById('orderStatus').value = currentStatus;
    
    // 显示模态框
    $('#updateOrderStatusModal').modal('show');
}

// 提交更新订单状态
function submitUpdateOrderStatus() {
    const orderId = document.getElementById('updateOrderId').value;
    const status = document.getElementById('orderStatus').value;
    
    axios.put(`${API_BASE_URL}/orders/${orderId}/status`, {}, {
        params: { status },
        withCredentials: true
    })
    .then(response => {
        alert('订单状态更新成功');
        $('#updateOrderStatusModal').modal('hide');
        
        // 重新加载订单列表
        const currentStatus = document.getElementById('orderStatusFilter').value;
        loadOrders(currentStatus);
    })
    .catch(error => {
        console.error('更新订单状态失败:', error);
        alert('更新订单状态失败，请稍后重试');
    });
}

// 筛选订单
function filterOrders() {
    const status = document.getElementById('orderStatusFilter').value;
    loadOrders(status);
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