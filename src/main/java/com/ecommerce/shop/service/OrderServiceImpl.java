package com.ecommerce.shop.service;

import com.ecommerce.shop.entity.*;
import com.ecommerce.shop.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class OrderServiceImpl implements OrderService {

    private static final Logger logger = LoggerFactory.getLogger(OrderServiceImpl.class);

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private JavaMailSender mailSender;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Order createOrder(User user, String shippingAddress, String email, String remarks) {
        logger.info("开始创建订单，用户ID: {}", user.getId());
        
        try {
            // 1. 获取购物车商品
            List<CartItem> cartItems = getCartItems(user);
            
            // 2. 检查库存
            validateStock(cartItems);
            
            // 3. 创建订单和订单项
            Order order = createOrderObject(user, cartItems, shippingAddress, email, remarks);
            
            // 4. 保存订单
            order = saveOrder(order);
            
            // 5. 更新商品库存
            updateProductStock(cartItems);
            
            // 6. 清空购物车
            clearCart(user, cartItems);
            
            // 7. 发送订单确认邮件（可选）
            // sendOrderConfirmationEmail(user, order);
            
            logger.info("订单创建成功，订单号: {}", order.getOrderNumber());
            return order;
        } catch (IllegalArgumentException e) {
            logger.warn("订单创建参数错误，用户ID: {}, 错误信息: {}", user.getId(), e.getMessage());
            throw e;
        } catch (RuntimeException e) {
            logger.error("订单创建失败，用户ID: {}", user.getId(), e);
            throw e;
        }
    }
    
    /**
     * 获取用户购物车商品
     */
    private List<CartItem> getCartItems(User user) {
        List<CartItem> cartItems = cartItemRepository.findByUser(user);
        logger.info("获取购物车商品，用户ID: {}, 商品数量: {}", user.getId(), cartItems.size());
        
        if (cartItems.isEmpty()) {
            logger.warn("购物车为空，无法创建订单，用户ID: {}", user.getId());
            throw new IllegalArgumentException("购物车为空，无法创建订单");
        }
        
        return cartItems;
    }
    
    /**
     * 验证商品库存是否充足
     */
    private void validateStock(List<CartItem> cartItems) {
        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();
            logger.info("检查商品库存，商品ID: {}, 库存: {}, 购买数量: {}", 
                       product.getId(), product.getStock(), cartItem.getQuantity());
            
            if (product.getStock() < cartItem.getQuantity()) {
                logger.warn("商品库存不足，商品ID: {}, 商品名称: {}, 库存: {}, 购买数量: {}", 
                           product.getId(), product.getName(), product.getStock(), cartItem.getQuantity());
                throw new IllegalArgumentException(String.format("商品 '%s' 库存不足，当前库存: %d, 购买数量: %d", 
                                 product.getName(), product.getStock(), cartItem.getQuantity()));
            }
        }
    }
    
    /**
     * 创建订单对象和订单项
     */
    private Order createOrderObject(User user, List<CartItem> cartItems, String shippingAddress, String email, String remarks) {
        Order order = new Order();
        String orderNumber = generateOrderNumber();
        
        order.setOrderNumber(orderNumber);
        order.setUser(user);
        order.setStatus("PENDING");
        order.setShippingAddress(shippingAddress); // 使用前端传入的地址
        order.setPaymentMethod("在线支付"); // 暂时设置默认支付方式，后续可从前端传入
        order.setEmail(email); // 使用前端传入的邮箱
        order.setRemarks(remarks); // 使用前端传入的备注
        order.setCreatedAt(new Date());
        
        Set<OrderItem> orderItems = createOrderItems(order, cartItems);
        double totalAmount = calculateTotalAmount(cartItems);
        
        order.setOrderItems(orderItems);
        order.setTotalAmount(totalAmount);
        
        logger.info("创建订单对象成功，订单号: {}, 订单项数量: {}, 总金额: {}", 
                   orderNumber, orderItems.size(), totalAmount);
        
        return order;
    }
    
    /**
     * 生成唯一订单号
     */
    private String generateOrderNumber() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 20);
    }
    
    /**
     * 创建订单项
     */
    private Set<OrderItem> createOrderItems(Order order, List<CartItem> cartItems) {
        Set<OrderItem> orderItems = new HashSet<>();
        
        for (CartItem cartItem : cartItems) {
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(cartItem.getProduct());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPrice(cartItem.getPrice());
            orderItems.add(orderItem);
            
            logger.debug("创建订单项，商品ID: {}, 商品名称: {}, 数量: {}, 价格: {}", 
                       cartItem.getProduct().getId(), cartItem.getProduct().getName(), 
                       cartItem.getQuantity(), cartItem.getPrice());
        }
        
        return orderItems;
    }
    
    /**
     * 计算订单总金额
     */
    private double calculateTotalAmount(List<CartItem> cartItems) {
        return cartItems.stream()
                .mapToDouble(item -> item.getPrice() * item.getQuantity())
                .sum();
    }
    
    /**
     * 保存订单
     */
    private Order saveOrder(Order order) {
        logger.info("开始保存订单，订单号: {}", order.getOrderNumber());
        
        try {
            Order savedOrder = orderRepository.save(order);
            logger.info("订单保存成功，订单ID: {}, 订单号: {}", savedOrder.getId(), savedOrder.getOrderNumber());
            return savedOrder;
        } catch (Exception e) {
            logger.error("订单保存失败，订单号: {}", order.getOrderNumber(), e);
            throw new RuntimeException("订单保存失败", e);
        }
    }
    
    /**
     * 更新商品库存
     */
    private void updateProductStock(List<CartItem> cartItems) {
        logger.info("开始更新商品库存，商品数量: {}", cartItems.size());
        
        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();
            int originalStock = product.getStock();
            int purchaseQuantity = cartItem.getQuantity();
            int newStock = originalStock - purchaseQuantity;
            
            product.setStock(newStock);
            productRepository.save(product);
            
            logger.info("商品库存更新成功，商品ID: {}, 商品名称: {}, 原库存: {}, 购买数量: {}, 新库存: {}", 
                       product.getId(), product.getName(), originalStock, purchaseQuantity, newStock);
        }
    }
    
    /**
     * 清空购物车
     */
    private void clearCart(User user, List<CartItem> cartItems) {
        logger.info("开始清空购物车，用户ID: {}, 购物车商品数量: {}", user.getId(), cartItems.size());
        
        try {
            cartItemRepository.deleteAll(cartItems);
            logger.info("购物车清空成功，用户ID: {}", user.getId());
        } catch (Exception e) {
            logger.error("购物车清空失败，用户ID: {}", user.getId(), e);
            throw new RuntimeException("购物车清空失败", e);
        }
    }

    @Override
    public Order getOrderById(Long id) {
        return orderRepository.findById(id).orElse(null);
    }

    @Override
    public Order getOrderByOrderNumber(String orderNumber) {
        return orderRepository.findByOrderNumber(orderNumber);
    }

    @Override
    public List<Order> getOrdersByUser(User user) {
        return orderRepository.findByUser(user);
    }

    @Override
    public Order updateOrderStatus(Long id, String status) {
        Order order = orderRepository.findById(id).orElse(null);
        if (order != null) {
            order.setStatus(status);
            Order updatedOrder = orderRepository.save(order);

            if ("DELIVERED".equals(status)) {
                // 邮件发送功能暂时禁用，如需启用请取消注释以下行
                // sendDeliveryConfirmationEmail(updatedOrder.getUser(), updatedOrder);
            }

            return updatedOrder;
        }
        return null;
    }

    private void sendOrderConfirmationEmail(User user, Order order) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(user.getEmail());
        message.setSubject("Order Confirmation - " + order.getOrderNumber());
        message.setText("Thank you for your order!\n\n" +
                "Order Number: " + order.getOrderNumber() + "\n" +
                "Total Amount: $" + order.getTotalAmount() + "\n" +
                "Status: " + order.getStatus() + "\n\n" +
                "We will notify you when your order is shipped.\n\n" +
                "Best regards,\n" +
                "E-Commerce Shop");
        mailSender.send(message);
    }

    private void sendDeliveryConfirmationEmail(User user, Order order) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(user.getEmail());
        message.setSubject("Delivery Confirmation - " + order.getOrderNumber());
        message.setText("Your order has been delivered!\n\n" +
                "Order Number: " + order.getOrderNumber() + "\n" +
                "Total Amount: $" + order.getTotalAmount() + "\n" +
                "Status: " + order.getStatus() + "\n\n" +
                "Thank you for shopping with us!\n\n" +
                "Best regards,\n" +
                "E-Commerce Shop");
        mailSender.send(message);
    }
}