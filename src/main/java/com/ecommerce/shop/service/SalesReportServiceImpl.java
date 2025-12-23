package com.ecommerce.shop.service;

import com.ecommerce.shop.entity.Order;
import com.ecommerce.shop.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SalesReportServiceImpl implements SalesReportService {

    @Autowired
    private OrderRepository orderRepository;

    @Override
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @Override
    public double getTotalSales() {
        return orderRepository.findAll().stream()
                .filter(order -> "COMPLETED".equals(order.getStatus()) || "DELIVERED".equals(order.getStatus()))
                .mapToDouble(Order::getTotalAmount)
                .sum();
    }

    @Override
    public long getTotalOrders() {
        return orderRepository.count();
    }

    @Override
    public List<Order> getOrdersByStatus(String status) {
        return orderRepository.findAll().stream()
                .filter(order -> status.equals(order.getStatus()))
                .collect(Collectors.toList());
    }
}