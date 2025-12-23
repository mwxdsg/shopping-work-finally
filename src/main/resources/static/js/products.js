// 商品列表功能

// 加载商品列表
function loadProducts() {
    axios.get(`${API_BASE_URL}/products`)
        .then(response => {
            const products = response.data;
            const productList = document.getElementById('productList');
            
            productList.innerHTML = '';
            
            products.forEach(product => {
                const productCard = createProductCard(product);
                productList.appendChild(productCard);
            });
        })
        .catch(error => {
            console.error('加载商品失败:', error);
            productList.innerHTML = '<div class="col-12"><div class="alert alert-danger">加载商品失败，请稍后重试</div></div>';
        });
}

// 创建商品卡片
function createProductCard(product) {
    const col = document.createElement('div');
    col.className = 'col-12 col-sm-6 col-md-4 col-lg-3';
    
    col.innerHTML = `
        <div class="card product-card">
            <div class="card-img-top" style="height: 200px; background-color: #f8f9fa; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                ${product.imageUrl ? `<img src="${product.imageUrl}" alt="${product.name}" style="max-width: 100%; max-height: 100%; object-fit: contain;">` : '<span class="text-muted">商品图片</span>'}
            </div>
            <div class="card-body">
                <h5 class="card-title">${product.name}</h5>
                <p class="card-text">${product.description || '暂无描述'}</p>
                <p class="price">¥${product.price.toFixed(2)}</p>
                <p class="text-muted">库存: ${product.stock}</p>
                <button class="btn btn-primary btn-block" onclick="addToCart(${product.id})" ${product.stock <= 0 ? 'disabled' : ''}>
                    ${product.stock <= 0 ? '库存不足' : '加入购物车'}
                </button>
            </div>
        </div>
    `;
    
    return col;
}

// 添加商品到购物车
function addToCart(productId) {
    checkUserSession().then(user => {
        if (!user) {
            // 如果用户未登录，跳转到登录页面
            window.location.href = 'login.html';
            return;
        }
        
        // 添加到购物车
        axios.post(`${API_BASE_URL}/cart`, {}, {
            params: { productId, quantity: 1 },
            withCredentials: true
        })
        .then(response => {
            // 显示成功提示
            alert('商品已成功加入购物车！');
            // 更新购物车数量
            updateCartCount();
        })
        .catch(error => {
            console.error('添加到购物车失败:', error);
            alert('添加到购物车失败，请稍后重试');
        });
    });
}

// 页面加载完成后执行
window.addEventListener('load', () => {
    loadProducts();
});