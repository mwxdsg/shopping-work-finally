package com.ecommerce.shop.config;

import com.ecommerce.shop.entity.Product;
import com.ecommerce.shop.entity.User;
import com.ecommerce.shop.repository.ProductRepository;
import com.ecommerce.shop.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        createAdminUser();
        createSampleProducts();
    }

    private void createAdminUser() {
        if (userRepository.findByUsername("admin") == null) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword("admin123");
            admin.setEmail("admin@example.com");
            admin.setRole("ADMIN");
            userRepository.save(admin);
            System.out.println("Admin user created");
        }
    }

    private void createSampleProducts() {
        if (productRepository.count() == 0) {
            Product product1 = new Product();
            product1.setName("Laptop");
            product1.setDescription("High performance laptop");
            product1.setPrice(1500.00);
            product1.setStock(10);
            productRepository.save(product1);

            Product product2 = new Product();
            product2.setName("Smartphone");
            product2.setDescription("Latest smartphone model");
            product2.setPrice(800.00);
            product2.setStock(20);
            productRepository.save(product2);

            Product product3 = new Product();
            product3.setName("Tablet");
            product3.setDescription("Lightweight tablet");
            product3.setPrice(400.00);
            product3.setStock(15);
            productRepository.save(product3);

            System.out.println("Sample products created");
        }
    }
}