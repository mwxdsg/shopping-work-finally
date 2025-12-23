package com.ecommerce.shop.service;

import com.ecommerce.shop.entity.Order;

import java.util.List;

public interface SalesReportService {
    List<Order> getAllOrders();
    double getTotalSales();
    long getTotalOrders();
    List<Order> getOrdersByStatus(String status);
}