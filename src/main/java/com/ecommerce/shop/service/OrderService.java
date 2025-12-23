package com.ecommerce.shop.service;

import com.ecommerce.shop.entity.Order;
import com.ecommerce.shop.entity.User;

import java.util.List;

public interface OrderService {
    Order createOrder(User user, String shippingAddress, String email, String remarks);
    Order getOrderById(Long id);
    Order getOrderByOrderNumber(String orderNumber);
    List<Order> getOrdersByUser(User user);
    Order updateOrderStatus(Long id, String status);
}