// 管理员销售报表

// 加载销售报表
function loadSalesReports() {
    checkUserSession().then(user => {
        if (!user || user.role !== 'ADMIN') {
            // 如果用户不是管理员，跳转到首页
            window.location.href = 'index.html';
            return;
        }
        
        // 获取销售统计数据
        axios.get(`${API_BASE_URL}/reports/sales`, {
            withCredentials: true
        })
        .then(response => {
            const data = response.data;
            
            // 更新统计数据
            document.getElementById('totalSales').textContent = `¥${data.totalSales.toFixed(2)}`;
            document.getElementById('totalOrders').textContent = data.totalOrders;
            
            // 计算平均订单金额
            const averageOrder = data.totalOrders > 0 ? (data.totalSales / data.totalOrders) : 0;
            document.getElementById('averageOrder').textContent = `¥${averageOrder.toFixed(2)}`;
        })
        .catch(error => {
            console.error('加载销售统计失败:', error);
            alert('加载销售统计失败，请稍后重试');
        });
        
        // 加载最近订单
        loadRecentOrders();
    });
}

// 加载最近订单
function loadRecentOrders() {
    axios.get(`${API_BASE_URL}/reports/orders`, {
        withCredentials: true
    })
    .then(response => {
        const orders = response.data;
        const recentOrders = document.getElementById('recentOrders');
        
        recentOrders.innerHTML = '';
        
        if (orders.length === 0) {
            recentOrders.innerHTML = '<p class="text-center text-muted">暂无订单数据</p>';
            return;
        }
        
        // 只显示最近10个订单
        const recent10 = orders.slice(0, 10);
        
        // 创建表格
        const table = document.createElement('table');
        table.className = 'table table-sm table-striped';
        table.innerHTML = `
            <thead>
                <tr>
                    <th>订单号</th>
                    <th>金额</th>
                    <th>状态</th>
                    <th>时间</th>
                </tr>
            </thead>
            <tbody id="recentOrdersTableBody"></tbody>
        `;
        
        recentOrders.appendChild(table);
        
        // 填充表格数据
        const tableBody = document.getElementById('recentOrdersTableBody');
        recent10.forEach(order => {
            const row = createRecentOrderRow(order);
            tableBody.appendChild(row);
        });
    })
    .catch(error => {
        console.error('加载最近订单失败:', error);
        recentOrders.innerHTML = '<div class="alert alert-danger">加载最近订单失败，请稍后重试</div>';
    });
}

// 创建最近订单表格行
function createRecentOrderRow(order) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>${order.id}</td>
        <td>¥${order.totalAmount.toFixed(2)}</td>
        <td><span class="badge ${getOrderStatusClass(order.status)}">${getOrderStatusText(order.status)}</span></td>
        <td>${formatDate(order.createdAt)}</td>
    `;
    return tr;
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
    loadSalesReports();
});