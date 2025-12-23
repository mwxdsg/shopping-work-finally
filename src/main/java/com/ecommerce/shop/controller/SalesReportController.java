package com.ecommerce.shop.controller;

import com.ecommerce.shop.entity.Order;
import com.ecommerce.shop.entity.User;
import com.ecommerce.shop.service.SalesReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpSession;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class SalesReportController {

    @Autowired
    private SalesReportService salesReportService;

    @GetMapping("/sales")
    public ResponseEntity<Map<String, Object>> getSalesReport(HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null || !"ADMIN".equals(user.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        double totalSales = salesReportService.getTotalSales();
        long totalOrders = salesReportService.getTotalOrders();
        return ResponseEntity.ok(Map.of(
                "totalSales", totalSales,
                "totalOrders", totalOrders
        ));
    }

    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getAllOrders(HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null || !"ADMIN".equals(user.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        List<Order> orders = salesReportService.getAllOrders();
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/orders/status")
    public ResponseEntity<List<Order>> getOrdersByStatus(@RequestParam String status, HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null || !"ADMIN".equals(user.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        List<Order> orders = salesReportService.getOrdersByStatus(status);
        return ResponseEntity.ok(orders);
    }
}