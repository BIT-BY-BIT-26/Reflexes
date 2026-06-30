import 'package:flutter/material.dart';
import 'package:keyboard_avoider/keyboard_avoider.dart';
import 'package:patient_app/features/auth/login_screen.dart';
import 'package:patient_app/features/auth/provider/auth_provider.dart';
import 'package:patient_app/widgets/circular_icon.dart';
import 'package:patient_app/widgets/custom_bottom_nav.dart';
import 'package:patient_app/widgets/custom_textfield.dart';

import 'package:provider/provider.dart';


class Signup extends StatefulWidget {
  const Signup({super.key});

  @override
  State<Signup> createState() => _SignupState();
}

class _SignupState extends State<Signup> {
  TextEditingController emailController = TextEditingController();
  TextEditingController passwordController = TextEditingController();
  TextEditingController nameController = TextEditingController();
  TextEditingController phoneController= TextEditingController();
  String? selectedGender;
  String? selectedBloodGroup;
  DateTime? selectedDob;


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
                    child: SingleChildScrollView(
                      child: Column(
                        children: [
                          Text(
                            "SignUp",
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
                            controller: nameController,
                            text: "Enter your name",
                            filled: false,
                          ),
                          SizedBox(height: 15),
                          TextFieldWidget(
                            controller: emailController,
                            text: "Enter your email",
                            filled: false,
                          ),
                          SizedBox(height: 15),
                          TextFieldWidget(
                            controller: passwordController,
                            text: "Enter password",
                            filled: false,
                          ),
                          SizedBox(height: 15),
                          TextFieldWidget(
                            controller: phoneController,
                            text: "Enter Phone",
                            filled: false,
                          ),
                          SizedBox(height: 15),
                          ListTile(
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                              side: const BorderSide(
                                color: Colors.grey,
                              ),
                            ),
                            leading: const Icon(Icons.cake),
                            title: Text(
                              selectedDob == null
                                  ? "Select Date of Birth"
                                  : "${selectedDob!.day}/${selectedDob!.month}/${selectedDob!.year}",
                            ),
                            onTap: () async {
                              final picked = await showDatePicker(
                                context: context,
                                initialDate: DateTime(2000),
                                firstDate: DateTime(1900),
                                lastDate: DateTime.now(),
                              );
                      
                              if (picked != null) {
                                setState(() {
                                  selectedDob = picked;
                                });
                              }
                            },
                          ),
                          SizedBox(height: 15),
                          Row(
                            children: [
                              Expanded(
                                child: DropdownButtonFormField<String>(
                                  value: selectedGender,
                                  decoration: const InputDecoration(
                                    border: OutlineInputBorder(),
                                    labelText: "Gender",
                                  ),
                                  items: const [
                                    DropdownMenuItem(
                                      value: "MALE",
                                      child: Text("Male"),
                                    ),
                                    DropdownMenuItem(
                                      value: "FEMALE",
                                      child: Text("Female"),
                                    ),
                                    DropdownMenuItem(
                                      value: "OTHER",
                                      child: Text("Other"),
                                    ),
                                  ],
                                  onChanged: (value) {
                                    setState(() {
                                      selectedGender = value;
                                    });
                                  },
                                ),
                              ),
                              SizedBox(width: 10,),
                              Expanded(
                                child: DropdownButtonFormField<String>(
                                  value: selectedBloodGroup,
                                  decoration: const InputDecoration(
                                    border: OutlineInputBorder(),
                                    labelText: "Blood Group",
                                  ),
                                  items: const [
                                    "A+",
                                    "A-",
                                    "B+",
                                    "B-",
                                    "AB+",
                                    "AB-",
                                    "O+",
                                    "O-",
                                  ]
                                      .map(
                                        (e) => DropdownMenuItem(
                                          value: e,
                                          child: Text(e),
                                        ),
                                      )
                                      .toList(),
                                  onChanged: (value) {
                                    setState(() {
                                      selectedBloodGroup = value;
                                    });
                                  },
                                ),
                              )
                            ],
                          ),
                          //SizedBox(height: 5),                 
                          SizedBox(height: 15),
                          Button(
                            nameController: nameController,
                            emailController: emailController,
                            passwordController: passwordController,
                            phoneController:phoneController,
                            selectedGender: selectedGender, 
                            selectedDob: selectedDob, 
                            selectedBloodGroup: selectedBloodGroup,
                          ),
                          SizedBox(height: 5),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                "Already have an account ?",
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 16,
                                ),
                              ),
                              TextButton(
                                onPressed: () {
                                  Navigator.of(context).push(
                                    MaterialPageRoute(
                                      builder: (context) => Login(),
                                    ),
                                  );
                                },
                                child: Text(
                                  "Login",
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

class Button extends StatefulWidget {
  final TextEditingController emailController;
  final TextEditingController passwordController;
  final TextEditingController nameController;
  final TextEditingController phoneController;
  final String? selectedGender;
  final DateTime? selectedDob;
  final String? selectedBloodGroup;
  const Button({
    super.key,
    required this.emailController,
    required this.passwordController,
    required this.nameController,
    required this.phoneController,
    required this.selectedGender,
    required this.selectedDob,
    required this.selectedBloodGroup,
  });

  @override
  State<Button> createState() => _ButtonState();
}

class _ButtonState extends State<Button> {
  bool circular = false;
  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    return ElevatedButton(
      onPressed: auth.loading
        ? null
        : () async {
            try {
              await auth.register(
                name: widget.nameController.text.trim(),
                email: widget.emailController.text.trim(),
                password: widget.passwordController.text.trim(),
                gender: widget.selectedGender!,
                dob: widget.selectedDob!,
                bloodGroup: widget.selectedBloodGroup!,
                phone: widget.phoneController.text.trim(),             
              );

              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text("Registered successfully")),
              );

              Navigator.pushReplacement(
                context,
                MaterialPageRoute(builder: (_) => const CustomBottomNav()),
              );
            } catch (e, stackTrace) {
              print(e);
              print(stackTrace);

              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text(e.toString())),
              );
            }
          },

      style: ElevatedButton.styleFrom(
        // Add your style properties here, for example:
        minimumSize: Size(double.infinity, 50),
        backgroundColor: const Color.fromARGB(255, 3, 30, 78),
        foregroundColor: Colors.white,
      ),
      child:auth.loading? CircularProgressIndicator(color: Colors.white,):
      Text(
        "SignUp",
        style: TextStyle(
          color: const Color.fromARGB(255, 133, 188, 232),
          fontSize: 23,
          fontWeight: FontWeight.bold
        ),
      ),
    );
  }
}