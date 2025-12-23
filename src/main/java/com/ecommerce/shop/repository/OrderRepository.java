package com.ecommerce.shop.repository;

import com.ecommerce.shop.entity.Order;
import com.ecommerce.shop.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUser(User user);
    Order findByOrderNumber(String orderNumber);
}