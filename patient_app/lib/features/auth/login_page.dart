import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:lottie/lottie.dart';
import 'package:patient_app/utils/constants.dart';


class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  bool visible = false;
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // Background
          Container(
            decoration:  BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  Color(0xFF050510),
                  Color(0xFF1E2A78),
                  Color(0xFF2563EB).withOpacity(0.7)
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
            ),
          ),

          // // Decorative circles
          // Positioned(
          //   top: -80,
          //   right: -50,
          //   child: Container(
          //     height: 220,
          //     width: 220,
          //     decoration: BoxDecoration(
          //       color: Colors.white.withOpacity(0.15),
          //       shape: BoxShape.circle,
          //     ),
          //   ),
          // ),

          // Positioned(
          //   bottom: -70,
          //   left: -50,
          //   child: Container(
          //     height: 200,
          //     width: 200,
          //     decoration: BoxDecoration(
          //       color: Colors.white.withOpacity(0.12),
          //       shape: BoxShape.circle,
          //     ),
          //   ),
          // ),

          Center(
            child: ClipRRect(
              borderRadius: BorderRadius.circular(10),
              child: BackdropFilter(
                filter: ImageFilter.blur(
                  sigmaX: 15,
                  sigmaY: 15,
                ),
                child: Container(
                  width: 350,
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    // boxShadow: [
                    //   BoxShadow(
                    //     color: Colors.black.withOpacity(0.25),
                    //     blurRadius: 20,
                    //     spreadRadius: 2,
                    //     //offset: const Offset(0, 10),
                    //   ),
                    // ],
                    borderRadius: BorderRadius.circular(10),
                    color: Colors.white.withOpacity(0.12),
                    border: Border.all(
                      color: Colors.white.withOpacity(0.25),
                      width: 1.2,
                    ),
                  ),
                  
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      SvgPicture.asset(
                          "assets/animations/h.svg",
                          height: 55,
                          width: 55,
                        ),
                      const SizedBox(height: 15),

                      const Text(
                        "Welcome Back",
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 28,
                          //fontWeight: FontWeight.bold,
                        ),
                      ),

                      const SizedBox(height: 30),

                      TextField(
                        style: const TextStyle(color: Colors.white),
                        decoration: InputDecoration(
                          labelText: "Email",
                          labelStyle: const TextStyle(
                            color: Colors.white70,
                          ),
                          
                          prefixIcon: const Icon(
                            Icons.email,
                            color: Colors.white70,
                          ),
                          filled: true,
                          fillColor: Colors.white.withOpacity(0.08),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide: BorderSide.none,
                            
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide: BorderSide(color: Colors.white.withOpacity(0.25), width: 0.7),
                          ),
                        ),
                      ),

                      const SizedBox(height: 20),

                      TextField(
                        obscureText: visible ? false : true,
                        style: const TextStyle(color: Colors.white),
                        decoration: InputDecoration(
                          //hintText: "Password",
                          labelText: "Password",
                          labelStyle: const TextStyle(
                            color: Colors.white70,
                          ),
                          suffixIcon: GestureDetector(
                            onTap: () {
                              setState(() {
                                visible = !visible;
                              });
                            },
                            child: Icon(
                              visible ? Icons.visibility : Icons.visibility_off,
                              color: Colors.white70,
                            ),
                          ),
                          prefixIcon: const Icon(
                            Icons.lock,
                            color: Colors.white70,
                          ),
                          filled: true,
                          fillColor: Colors.white.withOpacity(0.08),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide: BorderSide.none,
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide: BorderSide(color: Colors.white.withOpacity(0.25), width: 0.7),
                          ),
                        ),
                      ),

                      const SizedBox(height: 25),

                      SizedBox(
                        width: double.infinity,
                        height: 50,
                        child: ElevatedButton(
                          onPressed: () {},
                          style: ElevatedButton.styleFrom(
                            foregroundColor: Colors.white,
                            backgroundColor: AppColors.primaryBlue,
                            shape: RoundedRectangleBorder(
                              borderRadius:
                                  BorderRadius.circular(10),
                            ),
                          ),
                          child: const Text(
                            "Login",
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),

                      const SizedBox(height: 15),

                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                            Text(
                              "Don't have an account?",
                              style: TextStyle(
                                color: Colors.white70,
                              ),
                            ),
                            TextButton(
                            onPressed: () {},
                            child: const Text(
                              "Create Account",
                              style: TextStyle(
                                color: AppColors.darkNavy,
                              ),
                            ),
                          ),
                        ]
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}