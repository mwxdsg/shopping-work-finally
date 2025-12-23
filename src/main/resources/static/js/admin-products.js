// 管理员商品管理

// 加载商品列表
function loadProducts() {
    checkUserSession().then(user => {
        if (!user || user.role !== 'ADMIN') {
            // 如果用户不是管理员，跳转到首页
            window.location.href = 'index.html';
            return;
        }
        
        // 获取商品列表
        axios.get(`${API_BASE_URL}/products`)
            .then(response => {
                const products = response.data;
                const productsList = document.getElementById('productsList');
                
                productsList.innerHTML = '';
                
                // 创建表格
                const table = document.createElement('table');
                table.className = 'table table-striped table-bordered';
                table.innerHTML = `
                    <thead class="thead-dark">
                        <tr>
                            <th>ID</th>
                            <th>商品名称</th>
                            <th>描述</th>
                            <th>价格</th>
                            <th>库存</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody id="productsTableBody"></tbody>
                `;
                
                productsList.appendChild(table);
                
                // 填充表格数据
                const tableBody = document.getElementById('productsTableBody');
                products.forEach(product => {
                    const row = createProductRow(product);
                    tableBody.appendChild(row);
                });
            })
            .catch(error => {
                console.error('加载商品失败:', error);
                productsList.innerHTML = '<div class="alert alert-danger">加载商品失败，请稍后重试</div>';
            });
    });
}

// 创建商品表格行
function createProductRow(product) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>${product.id}</td>
        <td>${product.name}</td>
        <td>${product.description || '-'}</td>
        <td>¥${product.price.toFixed(2)}</td>
        <td>${product.stock}</td>
        <td>
            <button class="btn btn-sm btn-primary" onclick="editProduct(${product.id})">编辑</button>
            <button class="btn btn-sm btn-danger" onclick="deleteProduct(${product.id})">删除</button>
        </td>
    `;
    return tr;
}

// 编辑商品
function editProduct(productId) {
    // 获取商品详情
    axios.get(`${API_BASE_URL}/products/${productId}`)
        .then(response => {
            const product = response.data;
            
            // 填充表单
            document.getElementById('editProductId').value = product.id;
            document.getElementById('editProductName').value = product.name;
            document.getElementById('editProductDescription').value = product.description;
            document.getElementById('editProductPrice').value = product.price;
            document.getElementById('editProductStock').value = product.stock;
            
            // 显示当前照片
            const currentImageContainer = document.getElementById('currentProductImage');
            if (product.imageUrl) {
                currentImageContainer.innerHTML = `<img src="${product.imageUrl}" alt="商品照片" style="max-height: 100px; max-width: 100%;">`;
            } else {
                currentImageContainer.innerHTML = '<p>当前无商品照片</p>';
            }
            
            // 清空文件输入
            document.getElementById('editProductImage').value = '';
            
            // 显示模态框
            $('#editProductModal').modal('show');
        })
        .catch(error => {
            console.error('获取商品详情失败:', error);
            alert('获取商品详情失败，请稍后重试');
        });
}

// 删除商品
function deleteProduct(productId) {
    if (confirm('确定要删除这个商品吗？')) {
        axios.delete(`${API_BASE_URL}/products/${productId}`, {
            withCredentials: true
        })
        .then(() => {
            alert('商品删除成功');
            loadProducts();
        })
        .catch(error => {
            console.error('删除商品失败:', error);
            alert('删除商品失败，请稍后重试');
        });
    }
}

// 提交添加商品
function submitAddProduct() {
    const form = document.getElementById('addProductForm');
    const productImage = document.getElementById('productImage');
    const formData = new FormData(form);
    const product = {
        name: formData.get('name'),
        description: formData.get('description'),
        price: parseFloat(formData.get('price')),
        stock: parseInt(formData.get('stock'))
    };
    
    // 先添加商品
    axios.post(`${API_BASE_URL}/products`, product, {
        withCredentials: true
    })
    .then(response => {
        const newProduct = response.data;
        
        // 如果选择了照片，上传照片
        if (productImage.files.length > 0) {
            uploadProductImage(newProduct.id, productImage.files[0])
                .then(() => {
                    alert('商品添加成功');
                    $('#addProductModal').modal('hide');
                    form.reset();
                    productImage.value = '';
                    loadProducts();
                })
                .catch(() => {
                    alert('商品添加成功，但照片上传失败');
                    $('#addProductModal').modal('hide');
                    form.reset();
                    productImage.value = '';
                    loadProducts();
                });
        } else {
            alert('商品添加成功');
            $('#addProductModal').modal('hide');
            form.reset();
            loadProducts();
        }
    })
    .catch(error => {
        console.error('添加商品失败:', error);
        alert('添加商品失败，请稍后重试');
    });
}

// 提交编辑商品
function submitEditProduct() {
    const productId = document.getElementById('editProductId').value;
    const form = document.getElementById('editProductForm');
    const editProductImage = document.getElementById('editProductImage');
    const formData = new FormData(form);
    const product = {
        name: formData.get('name'),
        description: formData.get('description'),
        price: parseFloat(formData.get('price')),
        stock: parseInt(formData.get('stock'))
    };
    
    // 更新商品信息
    axios.put(`${API_BASE_URL}/products/${productId}`, product, {
        withCredentials: true
    })
    .then(response => {
        // 如果选择了新照片，上传照片
        if (editProductImage.files.length > 0) {
            uploadProductImage(productId, editProductImage.files[0])
                .then(() => {
                    alert('商品更新成功');
                    $('#editProductModal').modal('hide');
                    loadProducts();
                })
                .catch(() => {
                    alert('商品信息更新成功，但照片上传失败');
                    $('#editProductModal').modal('hide');
                    loadProducts();
                });
        } else {
            alert('商品更新成功');
            $('#editProductModal').modal('hide');
            loadProducts();
        }
    })
    .catch(error => {
        console.error('更新商品失败:', error);
        alert('更新商品失败，请稍后重试');
    });
}

// 上传商品照片
function uploadProductImage(productId, file) {
    const formData = new FormData();
    formData.append('file', file);
    
    return axios.post(`${API_BASE_URL}/products/${productId}/image`, formData, {
        withCredentials: true,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
}

// 页面加载完成后执行
window.addEventListener('load', () => {
    loadProducts();
});