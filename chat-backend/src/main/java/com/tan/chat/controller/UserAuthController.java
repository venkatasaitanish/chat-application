package com.tan.chat.controller;

import com.tan.chat.dto.AuthRequest;
import com.tan.chat.model.User;
import com.tan.chat.repository.UserRepository;
import com.tan.chat.service.JwtService;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;


@RestController
@AllArgsConstructor
@RequestMapping("/api/user")
public class UserAuthController {

    private UserRepository userRepository;
    private AuthenticationManager authenticationManager;
    private JwtService jwtService;
    private UserDetailsService userDetailsService;

    @PostMapping("/register")
    @Transactional
    public ResponseEntity<?> registerUser(@RequestBody AuthRequest authRequest) {

        if (userRepository.findByUsername(authRequest.getUsername()) != null) {
            return ResponseEntity.badRequest().body("Error: Username is already taken!");
        }

        User user = new User();
        user.setUsername(authRequest.getUsername());
        user.setPassword(new BCryptPasswordEncoder().encode(authRequest.getPassword()));
        userRepository.save(user);

        return ResponseEntity.ok().body(authRequest.getUsername() + " - User registered successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody AuthRequest authRequest) {

        if (userRepository.findByUsername(authRequest.getUsername()) == null) {
            return ResponseEntity.badRequest().body("User not found!");
        }
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(authRequest.getUsername(), authRequest.getPassword()));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Wrong Password");
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(authRequest.getUsername());

        String token = jwtService.generateToken(userDetails);
        return ResponseEntity.ok().body(token);
    }

}
