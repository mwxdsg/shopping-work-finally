package com.ecommerce.shop.controller;

import com.ecommerce.shop.entity.Order;
import com.ecommerce.shop.entity.User;
import com.ecommerce.shop.service.OrderService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private static final Logger logger = LoggerFactory.getLogger(OrderController.class);

    @Autowired
    private OrderService orderService;

    @PostMapping
    public ResponseEntity<Order> createOrder(@RequestBody Map<String, String> orderData, HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            logger.warn("用户未登录尝试创建订单");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        String shippingAddress = orderData.get("shippingAddress");
        String email = orderData.get("email");
        String remarks = orderData.get("remarks");
        
        logger.info("用户尝试创建订单，用户ID: {}, 地址: {}, 邮箱: {}", user.getId(), shippingAddress, email);
        Order order = orderService.createOrder(user, shippingAddress, email, remarks);
        logger.info("订单创建成功，订单号: {}, 用户ID: {}", order.getOrderNumber(), user.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }
    
    /**
     * 处理参数错误异常
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgumentException(IllegalArgumentException e) {
        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("error", e.getMessage());
        errorResponse.put("status", "BAD_REQUEST");
        return ResponseEntity.badRequest().body(errorResponse);
    }
    
    /**
     * 处理运行时异常
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException e) {
        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("error", "服务器内部错误，请稍后重试");
        errorResponse.put("status", "INTERNAL_SERVER_ERROR");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }

    @GetMapping
    public ResponseEntity<List<Order>> getOrders(HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            logger.warn("用户未登录尝试获取订单列表");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }
        logger.info("用户请求订单列表，用户ID: {}", user.getId());
        List<Order> orders = orderService.getOrdersByUser(user);
        logger.info("获取订单列表成功，用户ID: {}, 订单数量: {}", user.getId(), orders.size());
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderById(@PathVariable Long id, HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            logger.warn("用户未登录尝试获取订单详情，订单ID: {}", id);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "请先登录");
            errorResponse.put("status", "UNAUTHORIZED");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        }
        logger.info("用户请求订单详情，用户ID: {}, 订单ID: {}", user.getId(), id);
        Order order = orderService.getOrderById(id);
        if (order == null) {
            logger.warn("订单不存在，用户ID: {}, 订单ID: {}", user.getId(), id);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "订单不存在");
            errorResponse.put("status", "NOT_FOUND");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
        if (!order.getUser().getId().equals(user.getId())) {
            logger.warn("用户无权访问该订单，用户ID: {}, 订单ID: {}", user.getId(), id);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "无权访问该订单");
            errorResponse.put("status", "FORBIDDEN");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
        }
        logger.info("获取订单详情成功，用户ID: {}, 订单ID: {}", user.getId(), id);
        return ResponseEntity.ok(order);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @RequestParam String status, HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            logger.warn("用户未登录尝试更新订单状态，订单ID: {}, 新状态: {}", id, status);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "请先登录");
            errorResponse.put("status", "UNAUTHORIZED");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        }
        if (!"ADMIN".equals(user.getRole())) {
            logger.warn("非管理员用户尝试更新订单状态，用户ID: {}, 订单ID: {}, 新状态: {}", user.getId(), id, status);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "权限不足，需要管理员权限");
            errorResponse.put("status", "FORBIDDEN");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
        }
        logger.info("管理员更新订单状态，用户ID: {}, 订单ID: {}, 新状态: {}", user.getId(), id, status);
        Order order = orderService.updateOrderStatus(id, status);
        if (order == null) {
            logger.warn("订单不存在，无法更新状态，管理员ID: {}, 订单ID: {}, 新状态: {}", user.getId(), id, status);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "订单不存在");
            errorResponse.put("status", "NOT_FOUND");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
        logger.info("订单状态更新成功，管理员ID: {}, 订单ID: {}, 旧状态: {}, 新状态: {}", user.getId(), id, order.getStatus(), status);
        return ResponseEntity.ok(order);
    }
}