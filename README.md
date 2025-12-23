莫文轩 202330451361 23级计算机科学与技术二班


这是一个基于Spring Boot的电子商务网站，采用前后端一体化设计（前端静态资源直接放在Spring Boot的static目录中）。项目遵循标准的分层架构模式，代码组织清晰，便于维护和扩展。

后端代码结构（Java）
位于 src/main/java/com/ecommerce/shop/ 目录下，采用分层架构：

1. 实体层（Entity）- 数据模型
定义数据库表结构对应的Java对象：

User.java：用户信息（ID、用户名、密码、邮箱、角色等）
Product.java：商品信息（ID、名称、描述、价格、图片URL、库存等）
Order.java：订单信息（ID、订单号、用户ID、总金额、地址、邮箱、备注等）
OrderItem.java：订单项（关联订单和商品，包含数量和价格）
CartItem.java：购物车项（关联用户和商品，包含数量和价格）

2. 数据访问层（Repository）- 数据库操作
使用Spring Data JPA简化数据库访问：

UserRepository.java：用户数据访问接口
ProductRepository.java：商品数据访问接口
OrderRepository.java：订单数据访问接口
CartItemRepository.java：购物车数据访问接口

3. 服务层（Service）- 业务逻辑
封装核心业务逻辑，实现业务规则：

UserService.java/UserServiceImpl.java：用户管理（注册、登录、权限控制）
ProductService.java/ProductServiceImpl.java：商品管理（增删改查、库存管理）
OrderService.java/OrderServiceImpl.java：订单管理（创建、查询、状态更新）
CartService.java/CartServiceImpl.java：购物车管理（添加、删除、更新数量）
SalesReportService.java/SalesReportServiceImpl.java：销售报表统计

4. 控制器层（Controller）- API接口
处理HTTP请求，提供RESTful API：

UserController.java：用户相关接口（注册、登录）
ProductController.java：商品相关接口（查询、添加、更新、删除、图片上传）
OrderController.java：订单相关接口（创建、查询、管理）
CartController.java：购物车相关接口（添加、删除、查询）
SalesReportController.java：销售报表接口（销售数据统计）

5. 配置层（Config）- 系统配置
管理项目全局配置：

CorsConfig.java：跨域资源共享配置
SecurityConfig.java：Spring Security安全配置
StaticResourceConfig.java：静态资源映射（处理商品图片访问）
DataInitializer.java：初始数据加载（可选）

6. 启动类
ShopApplication.java：Spring Boot应用入口，启动整个项目
前端代码结构（静态资源）
位于 src/main/resources/static/ 目录下：

1. 页面文件（HTML）
index.html：网站首页，展示商品列表
login.html：登录页面
register.html：注册页面
cart.html：购物车页面
orders.html：用户订单页面
admin-products.html：管理员商品管理页面
admin-orders.html：管理员订单管理页面
admin-reports.html：管理员销售报表页面
2. JavaScript文件（JS）
config.js：全局配置（API基础URL）
auth.js：用户认证相关（登录、注册）
products.js：商品列表展示和交互
cart.js：购物车功能实现
orders.js：用户订单功能实现
admin-products.js：管理员商品管理功能
admin-orders.js：管理员订单管理功能
admin-reports.js：管理员销售报表功能
3. CSS样式
css/style.css：全局样式文件，定义网站外观
配置文件
application.properties：Spring Boot应用配置文件，包含数据库连接、邮件配置、文件上传路径等
项目启动和运行
启动类：ShopApplication.java
访问路径：默认 http://localhost:8080
API接口：http://localhost:8080/api/*（如用户注册：/api/users/register）
核心功能模块
用户认证：注册、登录、权限控制
商品管理：浏览、搜索、分类、图片上传
购物车：添加商品、修改数量、删除商品
订单管理：创建订单、填写地址/邮箱/备注、订单状态跟踪
后台管理：商品管理、订单管理、销售报表统计
