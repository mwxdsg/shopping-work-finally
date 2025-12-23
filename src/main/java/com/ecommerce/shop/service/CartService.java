package com.ecommerce.shop.service;

import com.ecommerce.shop.entity.CartItem;
import com.ecommerce.shop.entity.User;

import java.util.List;

public interface CartService {
    CartItem addToCart(User user, Long productId, int quantity);
    List<CartItem> getCartItems(User user);
    CartItem updateCartItem(Long cartItemId, int quantity);
    void removeCartItem(Long cartItemId);
}