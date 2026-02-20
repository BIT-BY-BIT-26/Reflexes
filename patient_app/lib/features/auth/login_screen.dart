import 'package:flutter/material.dart';
import 'package:keyboard_avoider/keyboard_avoider.dart';
import 'package:patient_app/features/auth/provider/auth_provider.dart';
import 'package:patient_app/features/auth/register_screen.dart';
import 'package:patient_app/widgets/circular_icon.dart';
import 'package:patient_app/widgets/custom_bottom_nav.dart';
import 'package:patient_app/widgets/custom_textfield.dart';
import 'package:provider/provider.dart';


class Login extends StatefulWidget {
  const Login({super.key});

  @override
  State<Login> createState() => _LoginState();
}

class _LoginState extends State<Login> {
  TextEditingController emailController = TextEditingController();

  TextEditingController passwordController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    //final auth = Provider.of<AuthProvider>(context);

    Size size = MediaQuery.of(context).size;
    return SafeArea(
      child: Scaffold(
        resizeToAvoidBottomInset: true, 
        body: SizedBox(
          width: size.width,
          height: size.height,
          child: Stack(
            children: [
              SizedBox(
                height: size.height / 2.4,
                width: double.infinity,
                //color: Colors.amber,
                child: Image.asset("assets/animations/doctor.png", fit: BoxFit.cover),
              ),
              Positioned(
                top: size.height / 3,
                left: 0,
                right: 0,
                bottom: 0,
                child: KeyboardAvoider(
                  autoScroll: true,
                  child: Container(
                    height: size.height,
                    width: double.infinity,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.only(
                        topLeft: Radius.circular(40),
                        topRight: Radius.circular(40),
                      ),
                      color: const Color.fromARGB(255, 238, 238, 237),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(20.0),
                      child: Column(
                        children: [
                          Text(
                            "Login",
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 25,
                            ),
                          ),
                          SizedBox(height: 15),
                          CircularIconButton(imagePath: "assets/animations/image.png"),
                          SizedBox(height: 15),
                          Text(
                            "OR",
                            style: TextStyle(fontWeight: FontWeight.bold),
                          ),
                          SizedBox(height: 15),
                          TextFieldWidget(
                            controller: emailController,
                            text: "Enter your email",
                            filled:false
                          ),
                          SizedBox(height: 15),
                          TextFieldWidget(
                            controller: passwordController,
                            text: "Enter password",
                            filled:false
                          ),
                          // SizedBox(height: 5),
                          // Align(
                          //   alignment: Alignment.centerRight,
                          //   child: InkWell(
                          //     onTap: () {
                          //       Navigator.of(context).push(
                          //         MaterialPageRoute(
                          //           builder: (context) => ForgotPassword(),
                          //         ),
                          //       );
                          //     },
                          //     child: Text("Forgot password?"),
                          //   ),
                          // ),
                          SizedBox(height: 15),
                          Button(
                            emailController: emailController,
                            passwordController: passwordController,
                          ),
                          SizedBox(height: 5),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                "Don't have an account ?",
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 16,
                                ),
                              ),
                              TextButton(
                                onPressed: () {
                                  Navigator.of(context).push(
                                    MaterialPageRoute(
                                      builder: (context) => Signup(),
                                    ),
                                  );
                                },
                                child: Text(
                                  "Sign up",
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 16,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
              // Positioned(
              //   left: 0,
              //   right: 0,
              //   top: 3,
              //   child: Center(
              //     child: Text(
              //       "MediReach",
              //       style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
              //     ),
              //   ),
              // ),
            ],
          ),
        ),
      ),
    );
  }
}

class Button extends StatelessWidget {
  final TextEditingController emailController;
  final TextEditingController passwordController;

  const Button({
    super.key,
    required this.emailController,
    required this.passwordController,
  });

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    return ElevatedButton(
      onPressed: auth.loading
      ? null
      : () async {
          try {
            await auth.login(
              email: emailController.text.trim(),
              password: passwordController.text.trim(),
            );

            Navigator.pushReplacement(
              context,
              MaterialPageRoute(builder: (_) => const CustomBottomNav()),
            );
          } catch (e) {
            ScaffoldMessenger.of(context)
                .showSnackBar(SnackBar(content: Text(e.toString())));
          }
        },

      style: ElevatedButton.styleFrom(
        minimumSize: Size(double.infinity, 50),
        backgroundColor: const Color.fromARGB(255, 3, 30, 78),
        foregroundColor: Colors.white,
      ),
      child: auth.loading
          ? const CircularProgressIndicator(color: Colors.white)
          : const Text(
              "Login",
              style: TextStyle(
                color: Color.fromARGB(255, 133, 188, 232),
                fontSize: 23,
                fontWeight: FontWeight.bold,
              ),
            ),
      );
  }
}

